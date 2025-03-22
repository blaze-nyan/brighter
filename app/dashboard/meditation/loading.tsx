import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MeditationLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meditation</h1>
        <p className="text-muted-foreground">
          Practice mindfulness and track your meditation sessions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meditation Timer</CardTitle>
            <CardDescription>
              Set your timer and start your practice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-primary/30">
                <Skeleton className="h-12 w-24" />
              </div>

              <div className="space-y-2 w-full">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-full" />
              </div>

              <div className="space-y-2 w-full">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-full" />
              </div>

              <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Notes</CardTitle>
            <CardDescription>
              Record your thoughts and experiences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>
              Your meditation minutes over the past 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meditation Stats</CardTitle>
            <CardDescription>
              Your meditation journey at a glance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
