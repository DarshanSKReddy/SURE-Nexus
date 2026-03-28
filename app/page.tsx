"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">

      <div className="text-center">

        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
          🚀 SURE Nexus
        </h1>

        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          Build your portfolio, showcase skills, and track your learning journey.
        </p>

        <div className="flex justify-center gap-6">

          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/30"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/register")}
            className="px-6 py-3 rounded-xl border border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white transition-all"
          >
            Register
          </button>

        </div>

      </div>
    </div>
  );
}