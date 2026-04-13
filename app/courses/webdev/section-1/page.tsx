"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const QUIZ_QUESTIONS = [
  {
    question: "Physically, what is the internet?",
    options: [
      "A cloud with no hardware",
      "A long network of wires connecting computers",
      "Only satellites in space",
      "Only Wi-Fi routers",
    ],
    answer: 1,
  },
  {
    question: "What does a DNS server do?",
    options: [
      "Stores passwords",
      "Translates domain names to IP addresses",
      "Writes HTML pages",
      "Compiles JavaScript",
    ],
    answer: 1,
  },
  {
    question: "How fast can undersea fibre optic cables transmit data (as taught here)?",
    options: ["Up to 4 GB/s", "Up to 40 GB/s", "Up to 400 GB/s", "Up to 1 TB/s"],
    answer: 2,
  },
  {
    question: "Which file type defines website content?",
    options: ["CSS", "JavaScript", "HTML", "JSON"],
    answer: 2,
  },
  {
    question: "Which file type controls styling?",
    options: ["HTML", "CSS", "JavaScript", "SQL"],
    answer: 1,
  },
  {
    question: "What is JavaScript primarily used for on a website?",
    options: ["Only colors", "Interactivity and functionality", "Only server backups", "Only domain registration"],
    answer: 1,
  },
  {
    question: "Recommended learning method from the module is:",
    options: ["Type along immediately", "Skip difficult modules", "Watch 10 min, understand, then code without looking", "Only memorize slides"],
    answer: 2,
  },
  {
    question: "What are the four Cornell note sections?",
    options: ["Topic, Notes, Keywords/Questions, Summary", "Title, Body, Footer, Index", "Code, Output, Errors, Fix", "Intro, Main, End, Links"],
    answer: 0,
  },
  {
    question: "When stuck, what should you evaluate first?",
    options: ["Buy a new laptop", "Expectation vs reality", "Rewrite everything", "Switch language"],
    answer: 1,
  },
  {
    question: "If you edit HTML in Chrome DevTools and refresh, what happens?",
    options: ["Changes become permanent", "Site crashes", "Changes disappear because you edited local rendered copy", "DNS is updated"],
    answer: 2,
  },
];

const CONTENT_SECTIONS = [
  {
    title: "How the Internet Actually Works",
    content: (
      <div className="space-y-4 text-gray-300">
        <p>The internet is a physical network of wires connecting computers globally.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Servers</strong> are always-on machines that store and serve websites.</li>
          <li><strong>Clients</strong> are devices like laptops and phones that request data.</li>
          <li>Undersea fibre optic cables move data at very high speed (up to 400 GB/s here).</li>
          <li>DNS translates a domain like <code>google.com</code> into an IP address.</li>
          <li>Your browser then requests files directly from the destination server.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How Websites Work",
    content: (
      <div className="space-y-4 text-gray-300">
        <p>Websites are made of three core files:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>HTML</strong> = content (text, images, buttons, links)</li>
          <li><strong>CSS</strong> = styling (colors, fonts, layout)</li>
          <li><strong>JavaScript</strong> = interactivity (forms, animations, behavior)</li>
        </ul>
        <p>
          Browsers read these files and render pages. Chrome DevTools lets you inspect and edit the local rendered copy,
          but refresh restores server files.
        </p>
      </div>
    ),
  },
  {
    title: "How to Learn Effectively and Get Help",
    content: (
      <div className="space-y-4 text-gray-300">
        <ul className="list-disc pl-5 space-y-2">
          <li>Learn in 10-minute chunks: understand first, then code from memory.</li>
          <li>Use Cornell notes: Topic, Notes, Keywords/Questions, Summary.</li>
          <li>Do not skip modules; progression is cumulative.</li>
          <li>Bookmark hard lessons and revisit after practice.</li>
          <li>Struggle is normal; debugging is core to professional development.</li>
        </ul>
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <h4 className="font-bold text-white mb-2">When stuck (5-step flow)</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Compare expectation vs reality.</li>
            <li>Read and search the error (Google/Stack Overflow).</li>
            <li>Re-watch just before breakage and check typos/case/semicolons.</li>
            <li>Compare with completed solution.</li>
            <li>Ask in Q&amp;A with expected vs actual + screenshots.</li>
          </ol>
        </div>
      </div>
    ),
  },
];

export default function WebDevSection1Page() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [alreadyPassed, setAlreadyPassed] = useState(false);

  const totalSteps = CONTENT_SECTIONS.length + 1;

  useEffect(() => {
    let isCancelled = false;

    const loadProgress = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user || isCancelled) return;

      const { data } = await supabase
        .from("course_progress")
        .select("passed, score")
        .eq("user_id", userData.user.id)
        .eq("course_id", "webdev_section_1");

      if (isCancelled) return;

      const rows = (data || []) as Array<{ passed: boolean | null; score: number | null }>;
      const passedRow = rows.find((row) => row.passed === true);
      const latestScore = rows.find((row) => typeof row.score === "number")?.score;

      if (passedRow) {
        setAlreadyPassed(true);
        if (typeof latestScore === "number") setScore(latestScore);
      }
    };

    void loadProgress();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (!isSubmitted) {
      setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
    }
  };

  const submitQuiz = async () => {
    const calculatedScore = QUIZ_QUESTIONS.reduce(
      (acc, question, index) => (answers[index] === question.answer ? acc + 1 : acc),
      0,
    );
    const passed = calculatedScore >= 8;

    setScore(calculatedScore);
    setIsSubmitted(true);
    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const payload = {
        user_id: userData.user.id,
        course_id: "webdev_section_1",
        score: calculatedScore,
        passed,
      };

      const { error } = await supabase.from("course_progress").upsert(payload, {
        onConflict: "user_id,course_id",
      });

      if (error) {
        await supabase.from("course_progress").insert(payload);
      }
    }

    if (passed) {
      setAlreadyPassed(true);
      router.push("/courses/webdev/section-2");
    }
    setSaving(false);
  };

  const retakeQuiz = () => {
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-12">
      <nav className="w-full border-b border-white/10 bg-black/50 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-400">Web Development: Section 1</h1>
          <Link href="/courses/webdev" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            Course Syllabus
          </Link>
        </div>
      </nav>

      <div className="w-full bg-white/5 h-2">
        <div className="bg-blue-500 h-2 transition-all duration-500" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}></div>
      </div>

      <main className="max-w-4xl mx-auto p-4 md:p-6 mt-6">
        {currentStep < CONTENT_SECTIONS.length ? (
          <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
              <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Part {currentStep + 1} of {CONTENT_SECTIONS.length}</span>
              {alreadyPassed && (
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">COMPLETED</span>
              )}
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-8">{CONTENT_SECTIONS[currentStep].title}</h2>
            <div className="leading-relaxed">{CONTENT_SECTIONS[currentStep].content}</div>

            <div className="mt-12 flex justify-between items-center pt-6 border-t border-white/10">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 0 ? "opacity-0 cursor-default" : "bg-white/10 hover:bg-white/20"}`}
                disabled={currentStep === 0}
              >
                {"<-"} Previous
              </button>
              <button
                onClick={() => {
                  setCurrentStep(currentStep + 1);
                  window.scrollTo(0, 0);
                }}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-bold transition-all"
              >
                {currentStep === CONTENT_SECTIONS.length - 1 ? "Take Section Quiz ->" : "Next Topic ->"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#111] border border-blue-500/30 p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            {alreadyPassed && !isSubmitted && (
              <div className="absolute top-0 left-0 w-full bg-green-600 text-center py-1 text-sm font-bold text-white uppercase tracking-widest">
                PASSED: You have already completed this section
              </div>
            )}

            <div className="mb-8 pt-4">
              <h2 className="text-3xl font-black text-white mb-2">Section 1 Mastery Quiz</h2>
              <p className="text-gray-400">10 questions • Need at least 8/10 (80%) to unlock Section 2</p>
            </div>

            <div className="space-y-6">
              {QUIZ_QUESTIONS.map((question, questionIndex) => (
                <div key={questionIndex} className="bg-black/40 p-6 rounded-xl border border-white/5">
                  <p className="text-lg font-bold mb-4">
                    <span className="text-blue-400 mr-2">{questionIndex + 1}.</span>
                    {question.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = answers[questionIndex] === optionIndex;
                      const isCorrect = isSubmitted && question.answer === optionIndex;
                      const isWrongSelection = isSubmitted && isSelected && question.answer !== optionIndex;

                      let buttonClass = "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10";
                      if (isSelected && !isSubmitted) buttonClass = "border-blue-500 bg-blue-500/20 text-white";
                      if (isCorrect) buttonClass = "border-green-500 bg-green-500/20 text-green-400 font-bold";
                      if (isWrongSelection) buttonClass = "border-red-500 bg-red-500/20 text-red-400 line-through";

                      return (
                        <button
                          key={optionIndex}
                          onClick={() => handleSelect(questionIndex, optionIndex)}
                          disabled={isSubmitted}
                          className={`p-4 text-left border rounded-lg transition-all ${buttonClass}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 text-center">
              {!isSubmitted ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button onClick={() => setCurrentStep(currentStep - 1)} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold w-full sm:w-auto">{"<-"} Review Material</button>
                  <button onClick={submitQuiz} disabled={Object.keys(answers).length < QUIZ_QUESTIONS.length} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold w-full sm:w-auto">
                    {Object.keys(answers).length < QUIZ_QUESTIONS.length ? "Answer all questions" : "Submit Answers"}
                  </button>
                </div>
              ) : (
                <div>
                  <div className={`inline-block px-8 py-6 rounded-2xl border-2 mb-6 w-full max-w-md ${score >= 8 ? "bg-green-900/30 border-green-500" : "bg-red-900/30 border-red-500"}`}>
                    <h3 className="text-3xl font-black mb-2">{score >= 8 ? "Section Passed!" : "Try Again"}</h3>
                    <p className="text-lg text-gray-300">You scored <strong className="text-white">{score} out of 10</strong> ({score * 10}%)</p>
                    {saving && <p className="text-sm text-green-400 mt-4 animate-pulse font-bold">Saving progress...</p>}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={retakeQuiz} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all">Retake Quiz</button>
                    {score >= 8 && <Link href="/courses/webdev/section-2" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all">Go to Section 2 -{">"}</Link>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
