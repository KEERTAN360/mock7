import { NextResponse } from "next/server"
export const runtime = "nodejs"
import { connectToDatabase } from "@/app/api/_db/connect"
import { User } from "@/app/api/_models/User"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password } = body || {}
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    await connectToDatabase()

    const existing = await User.findOne({ username })
    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await User.create({ username, passwordHash })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 })
  }
}


