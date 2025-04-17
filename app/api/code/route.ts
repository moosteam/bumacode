import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/write-get`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/write-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post data' }, { status: 500 })
  }
} 