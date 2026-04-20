import { LoadingCard } from "@/components/admin/AdminPrimitives";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <div className="mb-8 space-y-3">
        <div className="h-4 w-40 animate-pulse rounded-full bg-white/5" />
        <div className="h-10 w-72 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-full bg-white/5" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingCard key={index} className="h-32" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <LoadingCard className="h-80" />
        <LoadingCard className="h-80" />
      </div>
    </div>
  );
}
