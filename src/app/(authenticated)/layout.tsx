import { SidebarProvider } from "@/components/ui/sidebar";
import { readUserSession } from "@/server/auth";
import { redirect } from "next/navigation";

import {
  Home,
  Settings,
  HelpCircle,
  LogOut,
  User,
  UserCircle2,
  FileText,
  Pill,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await readUserSession();
  if (!session.data.user) redirect("/auth/login");

  return (
    <div>
      <SidebarProvider>
        <div className="flex min-h-screen w-[100vw] flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2 text-xl font-bold">
              LlamaDoc
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"></div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full duration-150 hover:bg-accent hover:text-accent-foreground">
                    <UserCircle2 size={24} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex flex-1">
            <Sidebar>
              <SidebarContent>
                <SidebarMenu className="mx-2 mt-[4.5rem] w-[100%-1rem]">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard">
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/health">
                        <FileText className="h-4 w-4" />
                        <span>Health Documents</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/medication">
                        <Pill className="h-4 w-4" />
                        <span>Medication</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/health-assistant">
                        <MessageSquare className="h-4 w-4" />
                        <span>Health Assistant</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
            {children}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
