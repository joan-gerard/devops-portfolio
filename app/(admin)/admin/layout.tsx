import { getServerSession } from "next-auth";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return <AuthSessionProvider session={session}>{children}</AuthSessionProvider>;
}
