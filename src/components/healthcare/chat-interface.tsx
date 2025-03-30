"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Plus } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface Message {
  id: string;
  message: string;
  isUser: boolean;
  createdAt: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // tRPC hooks
  const createConversation = api.chat.createConversation.useMutation();
  const getConversations = api.chat.getConversations.useQuery();
  const getMessages = api.chat.getConversationMessages.useQuery(
    { conversationId: conversationId ?? "" },
    { enabled: !!conversationId },
  );
  const sendChatMessage = api.chat.chat.useMutation({
    onSuccess: (data) => {
      // Refetch messages after sending a message
      getMessages.refetch();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to send message",
      });
    },
  });

  // Create a new conversation if none exists
  useEffect(() => {
    if (!conversationId && !getConversations.isLoading) {
      if (getConversations.data && getConversations.data.length > 0) {
        // Use the most recent conversation
        setConversationId(getConversations.data[0]?.id ?? null);
      } else {
        // Create a new conversation
        createConversation.mutate(undefined, {
          onSuccess: (data) => {
            setConversationId(data?.id ?? null);
          },
        });
      }
    }
  }, [conversationId, getConversations.data, getConversations.isLoading]);

  // Update messages when conversation changes or new messages arrive
  useEffect(() => {
    if (getMessages.data) {
      setMessages(getMessages.data);
    }
  }, [getMessages.data]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim() || !conversationId) return;

    // Optimistically add user message to UI
    const tempMessage = {
      id: `temp-${Date.now()}`,
      message: input,
      isUser: true,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    // Send message to API
    sendChatMessage.mutate({
      message: input,
      conversationId: conversationId,
    });

    setInput("");
  };

  const startNewConversation = () => {
    createConversation.mutate(undefined, {
      onSuccess: (data) => {
        setConversationId(data.id);
        setMessages([]);
      },
    });
  };

  return (
    <div className="flex h-[600px] flex-col">
      <div className="flex items-center justify-between border-b p-2">
        <h3 className="font-medium">Healthcare Assistant</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={startNewConversation}
          disabled={createConversation.isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Start a conversation with your healthcare assistant
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${
                message.isUser ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`rounded-full p-2 ${
                  message.isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.isUser ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <Card
                className={`max-w-[80%] p-3 ${
                  message.isUser ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                {message.message}
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={!conversationId || sendChatMessage.isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={
              !conversationId || !input.trim() || sendChatMessage.isLoading
            }
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
