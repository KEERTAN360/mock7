import { NextResponse } from "next/server"
import { connectToDatabase } from "@/app/api/_db/connect"
import { UserPreferences } from "@/app/api/_models/UserPreferences"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get("username")
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 })
  await connectToDatabase()
  const prefs = await UserPreferences.findOne({ username })
  return NextResponse.json({ preferences: prefs || null })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { username, ...rest } = body || {}
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 })
  await connectToDatabase()
  const prefs = await UserPreferences.findOneAndUpdate(
    { username },
    { username, ...rest, updatedAt: new Date() },
    { upsert: true, new: true }
  )
  return NextResponse.json({ preferences: prefs })
}


