import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { webhookUrl } = await request.json()

  try {
    // Validate the webhook URL format
    if (!webhookUrl || !webhookUrl.includes('discord.com/api/webhooks/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid Discord webhook URL' 
      }, { status: 400 })
    }

    // Try to fetch the webhook to verify it exists and is accessible
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'DiscordBot (https://discord.com, 1.0)',
      },
    })

    if (response.ok) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Webhook not found or inaccessible' 
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Error verifying webhook:", error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to verify webhook' 
    }, { status: 500 })
  }
}
