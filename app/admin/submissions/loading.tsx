import { LoadingCard } from "@/components/admin/AdminPrimitives";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingCard key={index} className="h-24" />
        ))}
      </div>
    </div>
  );
}
