import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "../_db/connect"
import { PayHistory } from "../_models/PayHistory"

export const runtime = "nodejs"

// In-memory fallback storage
const memoryStore = new Map<string, any[]>()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username")
    if (!username) return NextResponse.json({ error: "username is required" }, { status: 400 })

    try {
      await connectToDatabase()
      const items = await PayHistory.find({ username }).sort({ createdAt: -1 }).limit(50)
      return NextResponse.json({ items })
    } catch (dbError) {
      // Fallback to memory store
      const items = memoryStore.get(username) || []
      return NextResponse.json({ items, fallback: true })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, type, amount, recipient, method, meta } = body || {}
    if (!username || !type || typeof amount !== 'number') {
      return NextResponse.json({ error: "username, type and amount are required" }, { status: 400 })
    }

    const newItem = {
      _id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      type,
      amount,
      recipient,
      method,
      meta,
      createdAt: new Date()
    }

    try {
      await connectToDatabase()
      const doc = await PayHistory.create({ username, type, amount, recipient, method, meta })
      return NextResponse.json({ item: doc })
    } catch (dbError) {
      // Fallback to memory store
      const userItems = memoryStore.get(username) || []
      userItems.unshift(newItem)
      memoryStore.set(username, userItems.slice(0, 50)) // Keep only last 50
      return NextResponse.json({ item: newItem, fallback: true })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create" }, { status: 500 })
  }
}


