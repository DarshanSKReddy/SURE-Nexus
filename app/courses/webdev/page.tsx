"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type ModuleProgress = {
  course_id: string;
  score: number | null;
  passed: boolean;
};

export default function WebDevSyllabus() {
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data } = await supabase
        .from("course_progress")
        .select("course_id, score, passed")
        .eq("user_id", userData.user.id)
        .in("course_id", ["webdev_section_1", "webdev_section_2"]);

      if (data) {
        const progressMap: Record<string, ModuleProgress> = {};
        data.forEach((item) => {
          progressMap[item.course_id] = item as ModuleProgress;
        });
        setModuleProgress(progressMap);
      }
      setLoading(false);
    }
    fetchProgress();
  }, []);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div></div>;

  const section1Progress = moduleProgress["webdev_section_1"];
  const section2Progress = moduleProgress["webdev_section_2"];
  const isSection2Unlocked = Boolean(section1Progress?.passed);
  const completedCount = [section1Progress?.passed, section2Progress?.passed].filter(Boolean).length;
  const overallCompletion = Math.round((completedCount / 2) * 100);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative pb-12">
      <nav className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-400">Full-Stack Web Development</h1>
          <Link href="/courses" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Back to Catalog</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 mt-6">
        <div className="mb-10">
          <h2 className="text-4xl font-black text-white mb-4">Course Syllabus</h2>
          <p className="text-gray-400">Complete the modules in order. You must score 80% or higher on the quiz to unlock the next section.</p>
          <div className="mt-5">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Quiz completion</span>
              <span>{overallCompletion}%</span>
            </div>
            <div className="w-full h-2 rounded bg-white/10 overflow-hidden">
              <div className="h-2 bg-blue-500" style={{ width: `${overallCompletion}%` }}></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          
          {/* Section 1 - Always Unlocked */}
          <Link href="/courses/webdev/section-1" className="block bg-white/5 border border-blue-500/30 hover:border-blue-500 p-6 rounded-2xl transition-all relative overflow-hidden group">
            {section1Progress?.passed && (
               <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">COMPLETED</div>
            )}
            <h3 className="text-2xl font-bold text-blue-400 mb-2">Section 1</h3>
            <p className="font-bold text-lg mb-2">Web Development Fundamentals & How the Internet Works</p>
            <p className="text-sm text-gray-400 mb-2">
              Quiz Score: {typeof section1Progress?.score === "number" ? `${section1Progress.score}/10 (${section1Progress.score * 10}%)` : "Not attempted"}
            </p>
            <p className="text-sm text-gray-400 group-hover:text-gray-300">Click to start module -{">"}</p>
          </Link>

          {/* Section 2 - Conditionally Locked */}
          {isSection2Unlocked ? (
            <Link href="/courses/webdev/section-2" className="block bg-white/5 border border-blue-500/30 hover:border-blue-500 p-6 rounded-2xl transition-all relative overflow-hidden group">
               {section2Progress?.passed && (
                 <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">COMPLETED</div>
               )}
              <h3 className="text-2xl font-bold text-blue-400 mb-2">Section 2</h3>
              <p className="font-bold text-lg mb-2">HTML Fundamentals and Structuring Content</p>
              <p className="text-sm text-gray-400 mb-2">
                Quiz Score: {typeof section2Progress?.score === "number" ? `${section2Progress.score}/10 (${section2Progress.score * 10}%)` : "Not attempted"}
              </p>
              <p className="text-sm text-gray-400 group-hover:text-gray-300">Click to start module -{">"}</p>
            </Link>
          ) : (
            <div className="block bg-black/40 border border-white/5 p-6 rounded-2xl opacity-60 cursor-not-allowed relative">
              <div className="absolute top-0 right-0 bg-red-900 text-red-300 text-xs font-bold px-3 py-1 rounded-bl-lg">LOCKED</div>
              <h3 className="text-2xl font-bold text-gray-500 mb-2">Section 2</h3>
              <p className="font-bold text-lg mb-2 text-gray-400">HTML Fundamentals and Structuring Content</p>
              <p className="text-sm text-red-400 mt-4">Pass the Section 1 quiz with 80% to unlock.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}