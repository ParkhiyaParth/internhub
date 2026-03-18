import { prisma } from "../lib/db";

export default async function Home() {
  const user = await prisma.user.findMany();
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <p>User</p>
      {user.map((user: any) => (
        <p key={user.id}>{user.email}</p>
      ))}
    </div>
  );
}
