import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "../_db/connect"
import { SOSRecord } from "../_models/SOSRecord"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// In-memory video storage (fallback)
const memoryVideoStore = new Map<string, {
  recordId: string
  videoBlob: string
  mimeType: string
  duration: number
  fileSize: number
  createdAt: Date
}>()

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const username = formData.get("username") as string
    const recordId = formData.get("recordId") as string
    const videoFile = formData.get("video") as File
    const duration = formData.get("duration") as string
    
    if (!username || !recordId || !videoFile) {
      return NextResponse.json({ 
        error: "username, recordId, and video file are required" 
      }, { status: 400 })
    }

    // Convert video file to base64 for storage
    const arrayBuffer = await videoFile.arrayBuffer()
    const base64Video = Buffer.from(arrayBuffer).toString('base64')
    
    const videoData = {
      blobUrl: `data:${videoFile.type};base64,${base64Video}`,
      duration: duration ? parseFloat(duration) : 0,
      fileSize: videoFile.size,
      mimeType: videoFile.type
    }

    try {
      await connectToDatabase()
      
      // Update the SOS record with video data
      const record = await SOSRecord.findByIdAndUpdate(
        recordId,
        { videoData },
        { new: true }
      )
      
      if (!record) {
        return NextResponse.json({ error: "SOS record not found" }, { status: 404 })
      }
      
      return NextResponse.json({ 
        message: "Video saved successfully",
        recordId: record._id,
        videoSize: videoFile.size
      })
    } catch (dbError) {
      // Fallback to memory store
      memoryVideoStore.set(recordId, {
        recordId,
        videoBlob: base64Video,
        mimeType: videoFile.type,
        duration: duration ? parseFloat(duration) : 0,
        fileSize: videoFile.size,
        createdAt: new Date()
      })
      
      return NextResponse.json({ 
        message: "Video saved to temporary storage",
        recordId,
        videoSize: videoFile.size,
        fallback: true
      })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to save video" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const recordId = searchParams.get("recordId")
    const username = searchParams.get("username")
    
    if (!recordId || !username) {
      return NextResponse.json({ 
        error: "recordId and username are required" 
      }, { status: 400 })
    }

    try {
      await connectToDatabase()
      
      const record = await SOSRecord.findOne({
        _id: recordId,
        username
      })
      
      if (!record) {
        return NextResponse.json({ error: "SOS record not found" }, { status: 404 })
      }
      
      if (!record.videoData || !record.videoData.blobUrl) {
        return NextResponse.json({ error: "No video data found for this record" }, { status: 404 })
      }
      
      return NextResponse.json({
        recordId: record._id,
        videoData: record.videoData,
        createdAt: record.createdAt,
        emergencyType: record.emergencyType,
        status: record.status
      })
    } catch (dbError) {
      // Fallback to memory store
      const videoData = memoryVideoStore.get(recordId)
      
      if (!videoData) {
        return NextResponse.json({ error: "Video not found in temporary storage" }, { status: 404 })
      }
      
      return NextResponse.json({
        recordId: videoData.recordId,
        videoData: {
          blobUrl: `data:${videoData.mimeType};base64,${videoData.videoBlob}`,
          duration: videoData.duration,
          fileSize: videoData.fileSize,
          mimeType: videoData.mimeType
        },
        createdAt: videoData.createdAt,
        fallback: true
      })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to retrieve video" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const recordId = searchParams.get("recordId")
    const username = searchParams.get("username")
    
    if (!recordId || !username) {
      return NextResponse.json({ 
        error: "recordId and username are required" 
      }, { status: 400 })
    }

    try {
      await connectToDatabase()
      
      const record = await SOSRecord.findOneAndUpdate(
        { _id: recordId, username },
        { $unset: { videoData: 1 } },
        { new: true }
      )
      
      if (!record) {
        return NextResponse.json({ error: "SOS record not found" }, { status: 404 })
      }
      
      return NextResponse.json({ message: "Video deleted successfully" })
    } catch (dbError) {
      // Fallback to memory store
      const deleted = memoryVideoStore.delete(recordId)
      
      if (!deleted) {
        return NextResponse.json({ error: "Video not found in temporary storage" }, { status: 404 })
      }
      
      return NextResponse.json({ 
        message: "Video deleted from temporary storage",
        fallback: true
      })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to delete video" }, { status: 500 })
  }
}
