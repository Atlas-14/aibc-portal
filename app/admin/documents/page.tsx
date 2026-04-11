import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDocumentsClient from "./AdminDocumentsClient";

type PageProps = {
  searchParams?: {
    admin?: string;
  };
};

export default async function AdminDocumentsPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const hasAdminCookie = cookieStore.get("aibc_admin");
  const hasAccess = hasAdminCookie || searchParams?.admin === "true";

  if (!hasAccess) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#040E1C] to-[#06152A] px-6 py-10 text-white">
      <AdminDocumentsClient />
    </div>
  );
}
