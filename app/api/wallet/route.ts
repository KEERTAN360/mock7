import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "../_db/connect"
import { UserWallet } from "../_models/UserWallet"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// In-memory fallback storage for wallet balances
const memoryWalletStore = new Map<string, { balance: number; currency: string }>()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username")
    if (!username) return NextResponse.json({ error: "username is required" }, { status: 400 })

    try {
      await connectToDatabase()
      let wallet = await UserWallet.findOne({ username })
      
      if (!wallet) {
        // Create a new wallet with default balance if it doesn't exist
        wallet = await UserWallet.create({ 
          username, 
          balance: 25480, // Default starting balance
          currency: "INR" 
        })
      }
      
      return NextResponse.json({ 
        balance: wallet.balance, 
        currency: wallet.currency,
        username: wallet.username 
      })
    } catch (dbError) {
      // Fallback to memory store
      const memoryWallet = memoryWalletStore.get(username) || { balance: 25480, currency: "INR" }
      return NextResponse.json({ 
        balance: memoryWallet.balance, 
        currency: memoryWallet.currency,
        username,
        fallback: true 
      })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to fetch wallet" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, balance, currency = "INR" } = body || {}
    
    if (!username || typeof balance !== 'number') {
      return NextResponse.json({ error: "username and balance are required" }, { status: 400 })
    }

    try {
      await connectToDatabase()
      const wallet = await UserWallet.findOneAndUpdate(
        { username },
        { username, balance, currency, updatedAt: new Date() },
        { upsert: true, new: true }
      )
      
      return NextResponse.json({ 
        balance: wallet.balance, 
        currency: wallet.currency,
        username: wallet.username 
      })
    } catch (dbError) {
      // Fallback to memory store
      memoryWalletStore.set(username, { balance, currency })
      return NextResponse.json({ 
        balance, 
        currency,
        username,
        fallback: true 
      })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to update wallet" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, amount, operation = "add" } = body || {}
    
    if (!username || typeof amount !== 'number') {
      return NextResponse.json({ error: "username and amount are required" }, { status: 400 })
    }

    try {
      await connectToDatabase()
      let wallet = await UserWallet.findOne({ username })
      
      if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = await UserWallet.create({ 
          username, 
          balance: operation === "add" ? amount : 0,
          currency: "INR" 
        })
      } else {
        // Update existing wallet
        const newBalance = operation === "add" 
          ? wallet.balance + amount 
          : wallet.balance - amount
        
        if (newBalance < 0) {
          return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
        }
        
        wallet.balance = newBalance
        wallet.updatedAt = new Date()
        await wallet.save()
      }
      
      return NextResponse.json({ 
        balance: wallet.balance, 
        currency: wallet.currency,
        username: wallet.username 
      })
    } catch (dbError) {
      // Fallback to memory store
      const memoryWallet = memoryWalletStore.get(username) || { balance: 25480, currency: "INR" }
      const newBalance = operation === "add" 
        ? memoryWallet.balance + amount 
        : memoryWallet.balance - amount
      
      if (newBalance < 0) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
      }
      
      memoryWalletStore.set(username, { balance: newBalance, currency: memoryWallet.currency })
      return NextResponse.json({ 
        balance: newBalance, 
        currency: memoryWallet.currency,
        username,
        fallback: true 
      })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to update wallet" }, { status: 500 })
  }
}
