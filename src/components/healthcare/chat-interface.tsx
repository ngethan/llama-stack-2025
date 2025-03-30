"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Plus, Menu, X } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      getMessages.refetch();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to send message",
      });
    },
  });
  const deleteConversation = api.chat.deleteConversation.useMutation({
    onSuccess: () => {
      getConversations.refetch();
      if (getConversations.data && getConversations.data.length > 0) {
        setConversationId(getConversations.data[0]?.id ?? null);
      } else {
        createNewConversation();
      }
    },
  });

  useEffect(() => {
    if (!conversationId && !getConversations.isLoading) {
      if (getConversations.data && getConversations.data.length > 0) {
        setConversationId(getConversations.data[0]?.id ?? null);
      } else {
        createNewConversation();
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

  const createNewConversation = () => {
    createConversation.mutate(undefined, {
      onSuccess: (data) => {
        setConversationId(data?.id ?? null);
        setMessages([]);
      },
    });
  };

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

  const handleDeleteConversation = (id: string) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteConversation.mutate({ conversationId: id });
    }
  };

  const getSummaryFromMessages = (conversation: any) => {
    // Try to find the first user message for this conversation
    const firstMessage = getMessages.data?.find((m) => m.isUser)?.message;

    if (firstMessage) {
      return firstMessage.length > 30
        ? firstMessage.substring(0, 30) + "..."
        : firstMessage;
    }

    return "New conversation";
  };

  return (
    <div className="flex h-[600px] rounded-lg border">
      {/* Sidebar */}
      <div
        className={cn(
          "border-r bg-muted/30 transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-72" : "w-0 overflow-hidden",
        )}
      >
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-medium">Conversations</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(600px-49px)]">
          <div className="flex flex-col gap-1 p-2">
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={createNewConversation}
            >
              <Plus className="h-4 w-4" />
              New Conversation
            </Button>

            {getConversations.isLoading ? (
              <div className="p-3 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : getConversations.data && getConversations.data.length > 0 ? (
              getConversations.data.map((conversation) => (
                <div key={conversation.id} className="group relative">
                  <Button
                    variant={
                      conversation.id === conversationId ? "secondary" : "ghost"
                    }
                    className="w-full justify-start truncate text-left"
                    onClick={() => {
                      setConversationId(conversation.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <div className="mr-2 flex-1 truncate">
                      {getSummaryFromMessages(conversation)}
                    </div>
                    <span className="flex-shrink-0 text-xs text-muted-foreground">
                      {format(new Date(conversation.lastUpdated), "MM/dd")}
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conversation.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-muted-foreground">
                No conversations yet
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b p-2">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <h3 className="font-medium">Healthcare Assistant</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={createNewConversation}
            disabled={createConversation.isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
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
                    <ReactMarkdown>{message.message}</ReactMarkdown>
                  </Card>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

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
              disabled={!conversationId || sendChatMessage.isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={
                (!conversationId || !input.trim()) ?? sendChatMessage.isPending
              }
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
