"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { BarChart2, Book, Brain, Calendar, Clock, FileText, Goal, LayoutDashboard, LogOut, Menu, Moon, Music, Settings, Sun, Target, User, Wallet, BookOpen, Repeat, BarChart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  category?: string
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    category: "main",
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart,
    category: "main",
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
    category: "main",
  },
  {
    title: "To-Do Lists",
    href: "/dashboard/todos",
    icon: Target,
    category: "main",
  },
  {
    title: "Notes",
    href: "/dashboard/notes",
    icon: FileText,
    category: "main",
  },
  {
    title: "Energy Tracking",
    href: "/dashboard/energy",
    icon: BarChart2,
    category: "productivity",
  },
  {
    title: "Pomodoro Timer",
    href: "/dashboard/pomodoro",
    icon: Clock,
    category: "productivity",
  },
  {
    title: "Skills Development",
    href: "/dashboard/skills",
    icon: Brain,
    category: "development",
  },
  {
    title: "Goals",
    href: "/dashboard/goals",
    icon: Goal,
    category: "development",
  },
  {
    title: "Habits",
    href: "/dashboard/habits",
    icon: Repeat,
    category: "development",
  },
  {
    title: "Journal",
    href: "/dashboard/journal",
    icon: BookOpen,
    category: "wellness",
  },
  {
    title: "Meditation",
    href: "/dashboard/meditation",
    icon: Brain,
    category: "wellness",
  },
  {
    title: "Relaxation",
    href: "/dashboard/relaxation",
    icon: Music,
    category: "wellness",
  },
  {
    title: "Bookshelf",
    href: "/dashboard/bookshelf",
    icon: Book,
    category: "resources",
  },
  {
    title: "Finances",
    href: "/dashboard/finances",
    icon: Wallet,
    category: "resources",
  },
]

const categories = [
  { id: "main", label: "Main" },
  { id: "productivity", label: "Productivity" },
  { id: "development", label: "Development" },
  { id: "wellness", label: "Wellness" },
  { id: "resources", label: "Resources" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState("main")
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])
  
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const mainNavItems = navItems.filter((item) => item.category === "main")
  const categoryNavItems = navItems.filter((item) => item.category === activeCategory && item.category !== "main")
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Brain className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">ProductivityApp</span>
            </Link>
            <nav className="flex items-center space-x-4 text-sm font-medium">
              {mainNavItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    pathname === item.href ? "bg-primary/10 text-primary" : "hover:text-foreground/80"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2">
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {categories
                    .filter((cat) => cat.id !== "main")
                    .map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        className="px-3 py-2 font-medium"
                        onSelect={() => setActiveCategory(category.id)}
                      >
                        {category.label}
                      </DropdownMenuItem>
                    ))}
                  <DropdownMenuSeparator />
                  {categoryNavItems.map((item, index) => (
                    <DropdownMenuItem key={index} asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
                <Brain className="h-6 w-6" />
                <span className="font-bold">ProductivityApp</span>
              </Link>
              <div className="my-4">
                {categories.map((category) => (
                  <div key={category.id} className="mb-4">
                    <h4 className="mb-1 px-2 text-sm font-semibold text-muted-foreground">{category.label}</h4>
                    <div className="flex flex-col space-y-1">
                      {navItems
                        .filter((item) => item.category === category.id)
                        .map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                              pathname === item.href
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                      <AvatarFallback>
                        {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {session?.user?.name || "User"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <div className="container flex-1 py-6">{children}</div>
    </div>
  )
}

