"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Droplets,
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  DollarSign,
  LogOut,
  ClipboardList,
  KeyRound,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

const adminNavItems = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/worker", label: "My Jobs", icon: ClipboardList },
  { href: "/dashboard/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/admin/workers", label: "Workers", icon: Users },
  { href: "/dashboard/admin/pricing", label: "Pricing", icon: DollarSign },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/account", label: "Account", icon: KeyRound },
]

const workerNavItems = [
  { href: "/dashboard/worker", label: "My Jobs", icon: ClipboardList },
  { href: "/dashboard/account", label: "Account", icon: KeyRound },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { userProfile, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isAdmin = userProfile?.role === "admin"
  const navItems = isAdmin ? adminNavItems : workerNavItems

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:relative lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Droplets className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">CB Premium</span>
            <span className="text-xs text-sidebar-foreground/70">
              {isAdmin ? "Admin" : "Worker"} Dashboard
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard/admin" && 
               item.href !== "/dashboard/worker" && 
               pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User & Sign Out */}
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-4 rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-sm font-medium">{userProfile?.name || "User"}</p>
            <p className="text-xs text-sidebar-foreground/70">{userProfile?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  )
}
