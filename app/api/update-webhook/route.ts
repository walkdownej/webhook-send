import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { webhookUrl, name, avatar } = await request.json()

  try {
    const response = await fetch(webhookUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        avatar: avatar,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to update webhook")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating webhook:", error)
    return NextResponse.json({ success: false, error: "Failed to update webhook" }, { status: 500 })
  }
}
