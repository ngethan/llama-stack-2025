import { ChatInterface } from "@/components/healthcare/chat-interface";

export default function HealthAssistantPage() {
  return (
    <div className="container mx-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Health Assistant</h1>
        <p className="text-muted-foreground">
          Chat with your AI health assistant
        </p>
      </div>
      <div className="rounded-lg border bg-card">
        <ChatInterface />
      </div>
    </div>
  );
}
