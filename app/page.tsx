import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BarChart2, Brain, Clock, FileText } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Brain className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">ProductivityApp</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard" className="transition-colors hover:text-foreground/80">
                Dashboard
              </Link>
              <Link href="/dashboard/energy" className="transition-colors hover:text-foreground/80">
                Energy
              </Link>
              <Link href="/dashboard/skills" className="transition-colors hover:text-foreground/80">
                Skills
              </Link>
              <Link href="/dashboard/pomodoro" className="transition-colors hover:text-foreground/80">
                Pomodoro
              </Link>
              <Link href="/dashboard/notes" className="transition-colors hover:text-foreground/80">
                Notes
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
              Track your productivity, energy, and skills in one place
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              A comprehensive productivity system to help you track your energy levels, develop skills, focus with
              Pomodoro, and organize your learning resources.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section id="features" className="container space-y-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Features</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Our productivity app combines multiple tools to help you stay focused, track progress, and achieve your
              goals.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <BarChart2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-bold">Energy Tracking</h3>
              <p className="mt-2 text-muted-foreground">
                Monitor your daily energy levels to identify patterns and optimize your productivity.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-bold">Skills Development</h3>
              <p className="mt-2 text-muted-foreground">
                Track your progress in learning new skills and set goals for improvement.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-bold">Pomodoro Timer</h3>
              <p className="mt-2 text-muted-foreground">
                Stay focused with the Pomodoro technique, alternating between work sessions and breaks.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-bold">Notes Management</h3>
              <p className="mt-2 text-muted-foreground">
                Organize your notes and learning resources in one centralized location.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Next.js, Tailwind CSS, and shadcn/ui.
          </p>
        </div>
      </footer>
    </div>
  )
}

