import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function RelaxationLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relaxation Sounds</h1>
        <p className="text-muted-foreground">
          Calming sounds to help you relax, focus, or sleep
        </p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-48 w-48 rounded-lg" />

            <div className="text-center space-y-2">
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>

            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>

            <div className="flex items-center justify-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>

            <div className="flex w-full items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
