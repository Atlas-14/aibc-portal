import { LoadingCard } from "@/components/admin/AdminPrimitives";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <div className="mb-8 space-y-3">
        <div className="h-10 w-40 animate-pulse rounded-full bg-white/5" />
        <div className="h-4 w-48 animate-pulse rounded-full bg-white/5" />
        <div className="h-12 w-72 animate-pulse rounded-2xl bg-white/5" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <LoadingCard className="h-[30rem]" />
        <div className="space-y-4">
          <LoadingCard className="h-36" />
          <LoadingCard className="h-36" />
          <LoadingCard className="h-36" />
        </div>
      </div>
    </div>
  );
}
