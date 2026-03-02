import { getServerSession } from "next-auth";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  return <AuthSessionProvider session={session}>{children}</AuthSessionProvider>;
}
