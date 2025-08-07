import { NextResponse } from "next/server"

const ADMIN_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1336539851423748200/WaV1m3Er2qUEVmuFKUrCe4sVkE9TrJy-GFRyEv-om-KzJHHQLCdaFIZabRaGDTYulxCJ"

export async function POST(request: Request) {
  const { webhookUrl } = await request.json()

  try {
    // Delete the webhook
    const deleteResponse = await fetch(webhookUrl, {
      method: "DELETE",
    })

    if (!deleteResponse.ok) {
      throw new Error("Failed to delete webhook")
    }

    // Notify admin
    await fetch(ADMIN_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `A webhook was deleted: ${webhookUrl}`,
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting webhook:", error)
    return NextResponse.json({ success: false, error: "Failed to delete webhook" }, { status: 500 })
  }
}
