"use client"

import { useState, type React } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface WebhookVerificationProps {
  onVerified: (url: string) => void
}

export default function WebhookVerification({ onVerified }: WebhookVerificationProps) {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [verifying, setVerifying] = useState(false)

  const verifyWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifying(true)

    try {
      const response = await fetch(webhookUrl)
      if (response.ok) {
        onVerified(webhookUrl)
      }
    } catch (error) {
      console.error("Failed to verify webhook:", error)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold mb-8"> Discoweb 🎵</h1>
      <p className="text-white/60 mb-8">No data is EVER stored or sent to some random server.
      This was made by showtheyouth on discord </p>
      <form onSubmit={verifyWebhook} className="space-y-4">
        <Input
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="Webhook URL"
          className="bg-black/50 border-white/10 text-white placeholder:text-white/30"
          required
        />
        <Button type="submit" disabled={verifying} className="w-full bg-white text-black hover:bg-white/90">
          {verifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </div>
  )
}
