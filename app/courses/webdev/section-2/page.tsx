"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const QUIZ_QUESTIONS = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hypertext Markup Language",
      "High Transfer Machine Language",
      "Hyperlink and Text Management Language",
      "Home Tool Markup Language",
    ],
    answer: 0,
  },
  {
    question: "What is the difference between a tag and an element?",
    options: [
      "No difference",
      "Tag is opening part, element includes tags + content",
      "Element is only closing tag",
      "Tag includes CSS and JS",
    ],
    answer: 1,
  },
  {
    question: "Good practice: how many <h1> should one page typically have?",
    options: ["0", "1", "2", "As many as possible"],
    answer: 1,
  },
  {
    question: "Without <p> tags, text in HTML usually:",
    options: ["Automatically forms paragraphs", "Runs together with no paragraph separation", "Turns into heading", "Becomes hidden"],
    answer: 1,
  },
  {
    question: "Which are void elements from this section?",
    options: ["<div> and <span>", "<h1> and <p>", "<hr /> and <br />", "<ul> and <li>"],
    answer: 2,
  },
  {
    question: "Why avoid using <br /> to create paragraphs?",
    options: ["It breaks JavaScript", "It harms accessibility and structure", "It is slower than CSS", "Browsers block it"],
    answer: 1,
  },
  {
    question: "What is Lorem Ipsum used for?",
    options: ["Final legal text", "Placeholder text", "Compression", "SEO metadata"],
    answer: 1,
  },
  {
    question: "Which site is the professional HTML documentation source?",
    options: ["Stack Overflow", "W3Schools", "MDN Web Docs", "GitHub"],
    answer: 2,
  },
  {
    question: "In the Movie Ranking project, which set is required?",
    options: ["Only <h1>", "<h1>, <h2>, <hr />, three <h3>, three <p>", "Only <p> and <br />", "Only <div>"],
    answer: 1,
  },
  {
    question: "Recommended line break syntax in the lesson is:",
    options: ["<line>", "<br>", "<break />", "<br />"],
    answer: 3,
  },
];

const CONTENT_SECTIONS = [
  {
    title: "What is HTML?",
    content: (
      <div className="space-y-4 text-gray-300">
        <p><strong>HTML</strong> stands for <strong>Hypertext Markup Language</strong>.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Hypertext:</strong> text that can link to other documents.</li>
          <li><strong>Markup:</strong> annotated text using tags such as <code>&lt;h1&gt;</code> and <code>&lt;/h1&gt;</code>.</li>
          <li>A full HTML element = opening tag + content + closing tag.</li>
          <li>You can build a basic website with only HTML.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Headings, Paragraphs, and Void Elements",
    content: (
      <div className="space-y-4 text-gray-300">
        <h4 className="text-white font-bold">Heading hierarchy</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Use <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code> in order.</li>
          <li>Good practice: use one <code>&lt;h1&gt;</code> per page.</li>
          <li>Do not skip heading levels.</li>
        </ul>

        <h4 className="text-white font-bold">Paragraph element</h4>
        <p>
          <code>&lt;p&gt;</code> defines paragraphs and improves readability and accessibility for screen readers.
        </p>

        <h4 className="text-white font-bold">Void elements</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li><code>&lt;hr /&gt;</code>: thematic break (horizontal line)</li>
          <li><code>&lt;br /&gt;</code>: line break inside a paragraph</li>
          <li>Avoid using <code>&lt;br /&gt;</code> as paragraph spacing replacement.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Placeholder Text, Project Example, and Motivation",
    content: (
      <div className="space-y-4 text-gray-300">
        <p>
          <strong>Lorem Ipsum</strong> is placeholder text for design before final content is ready.
        </p>
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <h4 className="font-bold text-white mb-2">Movie Ranking mini project (minimum structure)</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>One <code>&lt;h1&gt;</code> main title</li>
            <li>One <code>&lt;h2&gt;</code> subtitle</li>
            <li>One <code>&lt;hr /&gt;</code> separator</li>
            <li>Three <code>&lt;h3&gt;</code> movie titles</li>
            <li>Three <code>&lt;p&gt;</code> descriptions</li>
          </ul>
        </div>
        <p>
          Keep your reason for learning visible. Motivation drops are normal; consistency matters more than perfection.
        </p>
      </div>
    ),
  },
];

export default function WebDevSection2Page() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [alreadyPassed, setAlreadyPassed] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const totalSteps = CONTENT_SECTIONS.length + 1;

  useEffect(() => {
    let isCancelled = false;

    const loadAccessAndProgress = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        window.location.href = "/login";
        return;
      }

      const userId = userData.user.id;

      const [{ data: section1Progress }, { data: section2Progress }] = await Promise.all([
        supabase
          .from("course_progress")
          .select("passed")
          .eq("user_id", userId)
          .eq("course_id", "webdev_section_1")
          .maybeSingle(),
        supabase
          .from("course_progress")
          .select("passed, score")
          .eq("user_id", userId)
          .eq("course_id", "webdev_section_2")
          .maybeSingle(),
      ]);

      if (isCancelled) return;

      const section1Passed = Boolean(section1Progress?.passed);
      setIsLocked(!section1Passed);

      if (section2Progress?.passed) {
        setAlreadyPassed(true);
        if (typeof section2Progress.score === "number") setScore(section2Progress.score);
      }

      setCheckingAccess(false);
    };

    void loadAccessAndProgress();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (!isSubmitted) setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
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
      await supabase.from("course_progress").upsert({
        user_id: userData.user.id,
        course_id: "webdev_section_2",
        score: calculatedScore,
        passed,
      });
    }

    if (passed) setAlreadyPassed(true);
    setSaving(false);
  };

  const retakeQuiz = () => {
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
    window.scrollTo(0, 0);
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-[#111] border border-red-500/30 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-black text-red-400 mb-3">Section 2 is Locked</h1>
          <p className="text-gray-300 mb-6">You must pass Web Development Section 1 quiz with at least 8/10 to access Section 2.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/courses/webdev/section-1" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold">Go to Section 1</Link>
            <Link href="/courses/webdev" className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-bold">Back to Syllabus</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-12">
      <nav className="w-full border-b border-white/10 bg-black/50 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-400">Web Development: Section 2</h1>
          <Link href="/courses/webdev" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Course Syllabus</Link>
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
              {alreadyPassed && <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">COMPLETED</span>}
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-8">{CONTENT_SECTIONS[currentStep].title}</h2>
            <div className="leading-relaxed">{CONTENT_SECTIONS[currentStep].content}</div>

            <div className="mt-12 flex justify-between items-center pt-6 border-t border-white/10">
              <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} className={`px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 0 ? "opacity-0 cursor-default" : "bg-white/10 hover:bg-white/20"}`} disabled={currentStep === 0}>
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
                PASSED: You have completed this section
              </div>
            )}

            <div className="mb-8 pt-4">
              <h2 className="text-3xl font-black text-white mb-2">Section 2 Mastery Quiz</h2>
              <p className="text-gray-400">Score 80% or higher to pass this section.</p>
            </div>

            <div className="space-y-6">
              {QUIZ_QUESTIONS.map((question, questionIndex) => (
                <div key={questionIndex} className="bg-black/40 p-6 rounded-xl border border-white/5">
                  <p className="text-lg font-bold mb-4">
                    <span className="text-blue-400 mr-2">{questionIndex + 1}.</span> {question.question}
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
                        <button key={optionIndex} onClick={() => handleSelect(questionIndex, optionIndex)} disabled={isSubmitted} className={`p-4 text-left border rounded-lg transition-all ${buttonClass}`}>
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
                    <h3 className="text-3xl font-black mb-2">{score >= 8 ? "Section Passed!" : "Not Quite There"}</h3>
                    <p className="text-lg text-gray-300">You scored <strong className="text-white">{score} out of 10</strong> ({score * 10}%)</p>
                    {saving && <p className="text-sm text-green-400 mt-4 animate-pulse font-bold">Saving progress...</p>}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={retakeQuiz} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all">Retake Quiz</button>
                    <Link href="/courses/webdev" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all">Return to Syllabus -{">"}</Link>
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
