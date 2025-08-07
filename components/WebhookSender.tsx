"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Send, ChevronDown, Info, Trash2, Edit2, ListPlus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WebhookInfo from "./WebhookInfo"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import MultiWebhookSender from "./MultiWebhookSender"

interface WebhookSenderProps {
  webhookUrl: string
  onWebhookDeleted: () => void
}

export default function WebhookSender({ webhookUrl, onWebhookDeleted }: WebhookSenderProps) {
  const [message, setMessage] = useState("")
  const [repeatCount, setRepeatCount] = useState("1")
  const [sending, setSending] = useState(false)
  const [isEmbedOpen, setIsEmbedOpen] = useState(false)
  const [embedTitle, setEmbedTitle] = useState("")
  const [embedDescription, setEmbedDescription] = useState("")
  const [embedUrl, setEmbedUrl] = useState("")
  const [embedColor, setEmbedColor] = useState("#000000")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [newWebhookName, setNewWebhookName] = useState("")
  const [newAvatarUrl, setNewAvatarUrl] = useState("")
  const [updating, setUpdating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      const messages = Array(Number.parseInt(repeatCount)).fill({
        content: message,
        embeds: isEmbedOpen
          ? [
              {
                title: embedTitle,
                description: embedDescription,
                url: embedUrl,
                color: Number.parseInt(embedColor.replace("#", ""), 16),
              },
            ]
          : undefined,
      })

      const response = await fetch("/api/send-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ webhookUrl, messages }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Messages sent successfully!",
        })
        setMessage("")
      } else {
        throw new Error("Failed to send messages")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send messages. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleDeleteWebhook = async () => {
    try {
      const response = await fetch("/api/delete-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ webhookUrl }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Webhook deleted successfully!",
        })
        onWebhookDeleted()
      } else {
        throw new Error("Failed to delete webhook")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete webhook. Please try again.",
        variant: "destructive",
      })
    }
    setShowDeleteDialog(false)
  }

  const handleUpdateWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const response = await fetch("/api/update-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookUrl,
          name: newWebhookName,
          avatar: newAvatarUrl,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Webhook updated successfully!",
        })
        setNewWebhookName("")
        setNewAvatarUrl("")
      } else {
        throw new Error("Failed to update webhook")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update webhook. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <Tabs defaultValue="sender" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-black/20">
          <TabsTrigger value="sender" className="data-[state=active]:bg-white/10">
            <Send className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="multi" className="data-[state=active]:bg-white/10">
            <ListPlus className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="info" className="data-[state=active]:bg-white/10">
            <Info className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="delete" className="data-[state=active]:bg-white/10">
            <Trash2 className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="edit" className="data-[state=active]:bg-white/10">
            <Edit2 className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sender">
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

            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Repeat Count (1-50)</label>
              <Input
                type="number"
                min="1"
                max="50"
                value={repeatCount}
                onChange={(e) => setRepeatCount(e.target.value)}
                required
                className="bg-black/50 border-white/10 text-white"
              />
            </div>

            <Collapsible open={isEmbedOpen} onOpenChange={setIsEmbedOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-between text-white/80 hover:text-white hover:bg-white/5"
                >
                  Embed Options
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isEmbedOpen ? "transform rotate-180" : ""}`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <Input
                  placeholder="Embed Title"
                  value={embedTitle}
                  onChange={(e) => setEmbedTitle(e.target.value)}
                  className="bg-black/50 border-white/10 text-white placeholder:text-white/30"
                />
                <Textarea
                  placeholder="Embed Description"
                  value={embedDescription}
                  onChange={(e) => setEmbedDescription(e.target.value)}
                  className="bg-black/50 border-white/10 text-white placeholder:text-white/30"
                />
                <Input
                  type="url"
                  placeholder="Embed URL"
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  className="bg-black/50 border-white/10 text-white placeholder:text-white/30"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">Embed Color</label>
                  <Input
                    type="color"
                    value={embedColor}
                    onChange={(e) => setEmbedColor(e.target.value)}
                    className="bg-black/50 border-white/10 text-white h-10 w-full"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Button
              type="submit"
              disabled={sending}
              className="w-full bg-white text-black hover:bg-white/90 transition-all duration-200"
            >
              {sending ? (
                "Sending Messages..."
              ) : (
                <>
                  Send Messages
                  <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="info">
          <WebhookInfo webhookUrl={webhookUrl} />
        </TabsContent>

        <TabsContent value="delete">
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold mb-4">Delete Webhook</h3>
            <p className="text-white/60 mb-4">Are you sure you want to delete this webhook?</p>
            <Button variant="destructive" className="w-full" onClick={() => setShowDeleteDialog(true)}>
              Delete Webhook
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <form onSubmit={handleUpdateWebhook} className="space-y-4 p-4">
            <h3 className="text-lg font-semibold mb-4">Edit Webhook</h3>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">New Webhook Name</label>
              <Input
                placeholder="Enter new name"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                className="bg-black/50 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">New Avatar URL</label>
              <Input
                type="url"
                placeholder="Enter avatar URL"
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                className="bg-black/50 border-white/10 text-white"
              />
            </div>
            <Button type="submit" disabled={updating} className="w-full bg-white text-black hover:bg-white/90">
              {updating ? "Updating..." : "Update Webhook"}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="multi">
          <MultiWebhookSender initialWebhook={webhookUrl} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-black/90 border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your webhook.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWebhook} className="bg-red-600 hover:bg-red-700">
              Delete Webhook
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
