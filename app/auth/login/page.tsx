"use client"

import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

function page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      console.log(res.error);
    } else {
      router.push("/");
    }
  };
  return (
    <div className="relative w-full min-h-[calc(100vh-96px)] flex items-center justify-center bg-linear-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]">
      <div className="relative z-10 w-full max-w-md p-8 md:p-10 bg-white/80 border border-neutral-100/50 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-neutral-500 font-light">
            Please enter your details to sign in
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-100 text-sm font-light placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all duration-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                Password
              </label>
              
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-100 text-sm font-light placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 py-3 px-4 bg-black text-white font-semibold text-sm rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] hover:bg-neutral-800 hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)] transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            Sign in
          </button>
        </form>

      </div>
    </div>
  );
}

export default page;
