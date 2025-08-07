"use client"

import { useState } from "react"
import WebhookSender from "../components/WebhookSender"
import WebhookVerification from "../components/WebhookVerification"
import ParticleBackground from "../components/ParticleBackground"

export default function Home() {
  const [verifiedWebhook, setVerifiedWebhook] = useState<string | null>(null)

  const handleWebhookDeleted = () => {
    setVerifiedWebhook(null)
  }

  return (
    <main className="min-h-screen bg-black text-white relative flex items-center justify-center">
      <ParticleBackground />
      <div className="relative z-10 w-full max-w-md p-4">
        {verifiedWebhook ? (
          <WebhookSender webhookUrl={verifiedWebhook} onWebhookDeleted={handleWebhookDeleted} />
        ) : (
          <WebhookVerification onVerified={setVerifiedWebhook} />
        )}
      </div>
    </main>
  )
}
