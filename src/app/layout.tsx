import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "LlamaDoc",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
