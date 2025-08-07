"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MultiWebhookSenderProps {
  initialWebhook: string
}

export default function MultiWebhookSender({ initialWebhook }: MultiWebhookSenderProps) {
  const [webhooks, setWebhooks] = useState<string[]>([initialWebhook])
  const [newWebhook, setNewWebhook] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const handleAddWebhook = () => {
    if (newWebhook && !webhooks.includes(newWebhook)) {
      setWebhooks([...webhooks, newWebhook])
      setNewWebhook("")
    }
  }

  const handleRemoveWebhook = (webhook: string) => {
    setWebhooks(webhooks.filter((w) => w !== webhook))
  }

  const handlePasteWebhooks = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const urls = text
        .split(/[\n,]/)
        .map((url) => url.trim())
        .filter((url) => {
          try {
            new URL(url)
            return url.includes("discord.com/api/webhooks/")
          } catch {
            return false
          }
        })

      if (urls.length > 0) {
        setWebhooks([...new Set([...webhooks, ...urls])])
        toast({
          title: "Success",
          description: `Added ${urls.length} webhook${urls.length === 1 ? "" : "s"}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to paste webhooks",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message || webhooks.length === 0) return

    setSending(true)
    setProgress({ current: 0, total: webhooks.length })

    try {
      for (let i = 0; i < webhooks.length; i++) {
        const webhook = webhooks[i]
        setProgress({ current: i + 1, total: webhooks.length })

        try {
          const response = await fetch("/api/send-webhook", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              webhookUrl: webhook,
              messages: [{ content: message }],
            }),
          })

          if (!response.ok) {
            throw new Error(`Failed to send to webhook ${i + 1}`)
          }
        } catch (error) {
          console.error(`Error sending to webhook ${webhook}:`, error)
          // Continue with other webhooks even if one fails
        }
      }

      toast({
        title: "Success",
        description: `Sent message to ${progress.current} webhook${progress.current === 1 ? "" : "s"}`,
      })
      setMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send messages",
        variant: "destructive",
      })
    } finally {
      setSending(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newWebhook}
            onChange={(e) => setNewWebhook(e.target.value)}
            placeholder="Add webhook URL"
            className="bg-black/50 border-white/10 text-white"
          />
          <Button type="button" onClick={handleAddWebhook} className="bg-white text-black hover:bg-white/90">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <Button
          type="button"
          onClick={handlePasteWebhooks}
          variant="outline"
          className="w-full border-white/10 text-white hover:bg-white/10"
        >
          Paste Multiple Webhooks
        </Button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">Active Webhooks</label>
        <div className="flex flex-wrap gap-2">
          {webhooks.map((webhook, index) => (
            <Badge key={index} variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
              {webhook.substring(0, 20)}...
              <button onClick={() => handleRemoveWebhook(webhook)} className="ml-2 hover:text-red-400">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Enter your message here"
            className="bg-black/50 border-white/10 text-white placeholder:text-white/30 min-h-[100px]"
          />
        </div>

        <Button
          type="submit"
          disabled={sending || webhooks.length === 0}
          className="w-full bg-white text-black hover:bg-white/90"
        >
          {sending ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending ({progress.current}/{progress.total})...
            </div>
          ) : (
            <>
              Send to {webhooks.length} Webhook{webhooks.length === 1 ? "" : "s"}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
