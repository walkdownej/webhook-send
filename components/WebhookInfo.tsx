"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface WebhookInfo {
  name: string
  avatar: string
  id: string
  token: string
  channel_id: string
  guild_id: string
  isActive?: boolean
}

export default function WebhookInfo({ webhookUrl }: { webhookUrl: string }) {
  const [info, setInfo] = useState<WebhookInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWebhookInfo = async () => {
      try {
        const response = await fetch(webhookUrl)
        if (response.ok) {
          const data = await response.json()
          setInfo({ ...data, isActive: true })
        }
      } catch (error) {
        console.error("Failed to fetch webhook info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWebhookInfo()
  }, [webhookUrl])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!info) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400">Failed to load webhook information</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-white/60">Name:</div>
        <div>{info.name}</div>

        <div className="text-white/60">Status:</div>
        <div className={info.isActive ? "text-green-400" : "text-red-400"}>{info.isActive ? "Active" : "Inactive"}</div>

        <div className="text-white/60">ID:</div>
        <div className="font-mono text-xs">{info.id}</div>

        <div className="text-white/60">Channel ID:</div>
        <div className="font-mono text-xs">{info.channel_id}</div>

        <div className="text-white/60">Guild ID:</div>
        <div className="font-mono text-xs">{info.guild_id}</div>
      </div>
    </div>
  )
}
