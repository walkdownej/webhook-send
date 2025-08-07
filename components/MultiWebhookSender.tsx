"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, X, Play, Square, Zap } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface MultiWebhookSenderProps {
  initialWebhook: string
}

export default function MultiWebhookSender({ initialWebhook }: MultiWebhookSenderProps) {
  const [webhooks, setWebhooks] = useState<string[]>([initialWebhook])
  const [newWebhook, setNewWebhook] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  
  // Spam functionality state
  const [isSpamming, setIsSpamming] = useState(false)
  const [spamDelay, setSpamDelay] = useState("100")
  const [spamCount, setSpamCount] = useState("0") // 0 = unlimited
  const [currentSpamCount, setCurrentSpamCount] = useState(0)
  const [spamStats, setSpamStats] = useState({ sent: 0, failed: 0 })
  const spamIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

  const startSpamming = () => {
    if (!message || webhooks.length === 0) return
    
    setIsSpamming(true)
    setCurrentSpamCount(0)
    setSpamStats({ sent: 0, failed: 0 })
    
    const delay = Math.max(50, parseInt(spamDelay)) // Minimum 50ms delay
    const maxCount = parseInt(spamCount)
    
    const spamFunction = async () => {
      if (maxCount > 0 && currentSpamCount >= maxCount) {
        stopSpamming()
        return
      }
      
      // Send to all webhooks simultaneously
      const promises = webhooks.map(async (webhook) => {
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
          
          if (response.ok) {
            setSpamStats(prev => ({ ...prev, sent: prev.sent + 1 }))
          } else {
            setSpamStats(prev => ({ ...prev, failed: prev.failed + 1 }))
          }
        } catch (error) {
          setSpamStats(prev => ({ ...prev, failed: prev.failed + 1 }))
          console.error(`Error sending to webhook ${webhook}:`, error)
        }
      })
      
      await Promise.allSettled(promises)
      setCurrentSpamCount(prev => prev + 1)
    }
    
    // Initial send
    spamFunction()
    
    // Set up interval for continuous spamming
    spamIntervalRef.current = setInterval(spamFunction, delay)
  }

  const stopSpamming = () => {
    setIsSpamming(false)
    if (spamIntervalRef.current) {
      clearInterval(spamIntervalRef.current)
      spamIntervalRef.current = null
    }
    
    toast({
      title: "Spam Stopped",
      description: `Completed ${currentSpamCount} spam cycles. Sent: ${spamStats.sent}, Failed: ${spamStats.failed}`,
    })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spamIntervalRef.current) {
        clearInterval(spamIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-6 p-4">
      {/* Webhook Management */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white/90">Webhook Management</h3>
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

      {/* Active Webhooks */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">
          Active Webhooks ({webhooks.length})
        </label>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
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

      <Separator className="bg-white/10" />

      {/* Message Input */}
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

      {/* Spam Controls */}
      <div className="space-y-4 p-4 border border-red-500/20 rounded-lg bg-red-500/5">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">SPAM MODE</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">
              Delay (ms) - Min: 50ms
            </label>
            <Input
              type="number"
              min="50"
              value={spamDelay}
              onChange={(e) => setSpamDelay(e.target.value)}
              className="bg-black/50 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">
              Max Count (0 = Unlimited)
            </label>
            <Input
              type="number"
              min="0"
              value={spamCount}
              onChange={(e) => setSpamCount(e.target.value)}
              className="bg-black/50 border-white/10 text-white"
            />
          </div>
        </div>

        {/* Spam Status */}
        {isSpamming && (
          <div className="p-3 bg-red-600/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 font-semibold">🚨 SPAMMING ACTIVE</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-white/60">LIVE</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">Cycles:</span>
                <span className="ml-2 text-white font-mono">{currentSpamCount}</span>
                {parseInt(spamCount) > 0 && (
                  <span className="text-white/60">/{spamCount}</span>
                )}
              </div>
              <div>
                <span className="text-white/60">Rate:</span>
                <span className="ml-2 text-white font-mono">{Math.round(1000 / parseInt(spamDelay))}/s</span>
              </div>
              <div>
                <span className="text-green-400">Sent:</span>
                <span className="ml-2 text-green-400 font-mono">{spamStats.sent}</span>
              </div>
              <div>
                <span className="text-red-400">Failed:</span>
                <span className="ml-2 text-red-400 font-mono">{spamStats.failed}</span>
              </div>
            </div>
          </div>
        )}

        {/* Spam Controls */}
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={startSpamming}
            disabled={isSpamming || !message || webhooks.length === 0}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            {isSpamming ? "Spamming..." : "Start Spam"}
          </Button>
          <Button
            type="button"
            onClick={stopSpamming}
            disabled={!isSpamming}
            variant="outline"
            className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Spam
          </Button>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Single Send */}
      <form onSubmit={handleSubmit}>
        <Button
          type="submit"
          disabled={sending || webhooks.length === 0 || isSpamming}
          className="w-full bg-white text-black hover:bg-white/90"
        >
          {sending ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending ({progress.current}/{progress.total})...
            </div>
          ) : (
            <>
              Send Once to {webhooks.length} Webhook{webhooks.length === 1 ? "" : "s"}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
