import { LoadingCard } from "@/components/admin/AdminPrimitives";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <div className="mb-8 space-y-3">
        <div className="h-4 w-36 animate-pulse rounded-full bg-white/5" />
        <div className="h-10 w-60 animate-pulse rounded-2xl bg-white/5" />
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingCard key={index} className="h-16" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingCard key={index} className="h-24" />
        ))}
      </div>
    </div>
  );
}
