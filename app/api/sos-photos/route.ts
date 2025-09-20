import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "../_db/connect"
import { SOSRecord } from "../_models/SOSRecord"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// In-memory photo storage (fallback)
const memoryPhotoStore = new Map<string, {
  recordId: string
  photos: Array<{
    id: string
    blobUrl: string
    mimeType: string
    fileSize: number
    timestamp: number
    cameraType: "front" | "back"
  }>
  createdAt: Date
}>()

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const username = formData.get("username") as string
    const recordId = formData.get("recordId") as string
    const photoFile = formData.get("photo") as File
    const cameraType = formData.get("cameraType") as string
    const timestamp = formData.get("timestamp") as string
    
    if (!username || !recordId || !photoFile) {
      return NextResponse.json({ 
        error: "username, recordId, and photo file are required" 
      }, { status: 400 })
    }

    // Convert photo file to base64 for storage
    const arrayBuffer = await photoFile.arrayBuffer()
    const base64Photo = Buffer.from(arrayBuffer).toString('base64')
    
    const photoData = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blobUrl: `data:${photoFile.type};base64,${base64Photo}`,
      mimeType: photoFile.type,
      fileSize: photoFile.size,
      timestamp: timestamp ? parseInt(timestamp) : Date.now(),
      cameraType: cameraType as "front" | "back" || "back"
    }

    try {
      await connectToDatabase()
      
      // Update the SOS record with photo data
      const record = await SOSRecord.findById(recordId)
      
      if (!record) {
        return NextResponse.json({ error: "SOS record not found" }, { status: 404 })
      }
      
      // Initialize photos array if it doesn't exist
      if (!record.metadata) {
        record.metadata = {}
      }
      if (!record.metadata.photos) {
        record.metadata.photos = []
      }
      
      // Add new photo to the array
      record.metadata.photos.push(photoData)
      
      await record.save()
      
      return NextResponse.json({ 
        message: "Photo saved successfully",
        recordId: record._id,
        photoId: photoData.id,
        photoSize: photoFile.size
      })
    } catch (dbError) {
      // Fallback to memory store
      const existingPhotos = memoryPhotoStore.get(recordId)
      if (existingPhotos) {
        existingPhotos.photos.push(photoData)
        memoryPhotoStore.set(recordId, existingPhotos)
      } else {
        memoryPhotoStore.set(recordId, {
          recordId,
          photos: [photoData],
          createdAt: new Date()
        })
      }
      
      return NextResponse.json({ 
        message: "Photo saved to temporary storage",
        recordId,
        photoId: photoData.id,
        photoSize: photoFile.size,
        fallback: true
      })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to save photo" }, { status: 500 })
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
      
      const photos = record.metadata?.photos || []
      
      return NextResponse.json({
        recordId: record._id,
        photos: photos,
        createdAt: record.createdAt,
        emergencyType: record.emergencyType,
        status: record.status
      })
    } catch (dbError) {
      // Fallback to memory store
      const photoData = memoryPhotoStore.get(recordId)
      
      if (!photoData) {
        return NextResponse.json({ error: "Photos not found in temporary storage" }, { status: 404 })
      }
      
      return NextResponse.json({
        recordId: photoData.recordId,
        photos: photoData.photos,
        createdAt: photoData.createdAt,
        fallback: true
      })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to retrieve photos" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const recordId = searchParams.get("recordId")
    const photoId = searchParams.get("photoId")
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
      
      if (photoId) {
        // Delete specific photo
        if (record.metadata?.photos) {
          record.metadata.photos = record.metadata.photos.filter((photo: any) => photo.id !== photoId)
          await record.save()
        }
      } else {
        // Delete all photos
        if (record.metadata) {
          record.metadata.photos = []
          await record.save()
        }
      }
      
      return NextResponse.json({ message: "Photo(s) deleted successfully" })
    } catch (dbError) {
      // Fallback to memory store
      const photoData = memoryPhotoStore.get(recordId)
      
      if (!photoData) {
        return NextResponse.json({ error: "Photos not found in temporary storage" }, { status: 404 })
      }
      
      if (photoId) {
        photoData.photos = photoData.photos.filter((photo: any) => photo.id !== photoId)
        memoryPhotoStore.set(recordId, photoData)
      } else {
        memoryPhotoStore.delete(recordId)
      }
      
      return NextResponse.json({ 
        message: "Photo(s) deleted from temporary storage",
        fallback: true
      })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to delete photo(s)" }, { status: 500 })
  }
}
