import { db } from "../lib/db";

export default async function Home() {
  const user = await db.user.findMany();
  return (
    <div className="w-full min-h-screen flex flex-col items-center mt-20">
      <h2 className="text-4xl font-bold">Welcome to the InternHub</h2>
      <p className="text-lg mt-2 text-gray-600">Manage your internships here</p>
    </div>
  );
}
