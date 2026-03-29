"use client";

import Link from "next/link";

export default function CoursesCatalog() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden pb-12">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>

      <nav className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md p-4 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center px-2">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tighter">
              SURE Nexus
            </h1>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border border-white/5">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-4 md:p-6 pt-12 z-10 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
            SkillXplore Catalog
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Choose your learning path. Complete interactive modules, pass the quizzes with 80% or higher to unlock the next level, and earn your credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Python Course Card - Now points to the Python Syllabus Page */}
          <Link href="/courses/python" className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500 rounded-3xl p-8 shadow-2xl transition-all hover:-translate-y-1 block flex flex-col justify-between h-full">
            <div>
              <div className="h-12 w-12 bg-purple-600/20 text-purple-400 rounded-xl flex items-center justify-center font-bold text-xl mb-6 border border-purple-500/30">
                Py
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">Python 100 Days</h3>
              <p className="text-gray-400 mb-8 line-clamp-3">
                Learn the fundamentals of Python scripting, variables, loops, logic, and data manipulation. Build real-world projects and solidify your programming foundation.
              </p>
            </div>
            <div className="flex items-center text-sm font-bold text-purple-400 bg-purple-500/10 w-max px-4 py-2 rounded-lg">
              View Course Syllabus -{">"}
            </div>
          </Link>

          {/* Web Dev Course Card - Now points to the Web Dev Syllabus Page */}
          <Link href="/courses/webdev" className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500 rounded-3xl p-8 shadow-2xl transition-all hover:-translate-y-1 block flex flex-col justify-between h-full">
            <div>
              <div className="h-12 w-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center font-bold text-xl mb-6 border border-blue-500/30">
                Wd
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">Full-Stack Web Development</h3>
              <p className="text-gray-400 mb-8 line-clamp-3">
                Understand how the internet actually works. Master HTML, CSS, and JavaScript to build modern, responsive, and dynamic websites from scratch.
              </p>
            </div>
            <div className="flex items-center text-sm font-bold text-blue-400 bg-blue-500/10 w-max px-4 py-2 rounded-lg">
              View Course Syllabus -{">"}
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}