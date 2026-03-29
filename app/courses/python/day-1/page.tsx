"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const QUIZ_QUESTIONS = [
  { question: "What function is used to output text to the screen in Python?", options: ["output()", "print()", "show()", "log()"], answer: 1 },
  { question: "What type of error occurs when you forget a closing quote?", options: ["IndentationError", "NameError", "SyntaxError", "TypeError"], answer: 2 },
  { question: "Which escape character creates a new line in a string?", options: ["\\t", "\\n", "\\r", "\\b"], answer: 1 },
  { question: "What operator is used for string concatenation?", options: ["&", "+", "*", "::"], answer: 1 },
  { question: "Which function pauses execution and takes user input?", options: ["read()", "ask()", "input()", "scan()"], answer: 2 },
  { question: "Which symbol starts a comment in Python?", options: ["//", "#", "/*", "--"], answer: 1 },
  { question: "What does len(name) return?", options: ["First letter", "Last letter", "Length of string", "Type of variable"], answer: 2 },
  { question: "Which of these is a valid snake_case variable name?", options: ["myVariableName", "my variable", "1name", "my_variable_name"], answer: 3 },
  { question: "What error can happen from unexpected spaces at line start?", options: ["NameError", "IndentationError", "SyntaxError", "KeyError"], answer: 1 },
  { question: "In the Band Name Generator, which two inputs are combined?", options: ["Name and age", "City and pet name", "Country and school", "Food and color"], answer: 1 },
];

const CONTENT_SECTIONS = [
  {
    title: "Overview",
    content: (
      <div className="space-y-4 text-gray-300">
        <p><strong>Goal:</strong> Learn printing, input, debugging, comments, and variables in Python.</p>
        <p><strong>Final Project:</strong> Band Name Generator</p>
      </div>
    ),
  },
  {
    title: "Printing, Strings, and Errors",
    content: (
      <div className="space-y-5 text-gray-300">
        <p>The <code>print()</code> function outputs text to the console. Strings must be inside quotes.</p>
        <pre className="bg-black/50 border border-white/10 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          <code>{`print("Hello World!")`}</code>
          <br />
          <code className="text-green-400">{`# print("Hello World)`}</code>
          <br />
          <code className="text-green-400">{`# SyntaxError: missing quote`}</code>
        </pre>

        <p>Use <code>\n</code> for new lines and <code>+</code> for concatenation.</p>
        <pre className="bg-black/50 border border-white/10 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          <code>{`print("Hello world!\\nHello world!\\nHello world!")`}</code>
          <br />
          <code>{`print("Hello" + " " + "Angela")`}</code>
        </pre>

        <ul className="list-disc pl-5 space-y-2">
          <li><strong>SyntaxError:</strong> invalid syntax like missing quote or bracket.</li>
          <li><strong>IndentationError:</strong> unexpected spaces or tabs.</li>
          <li><strong>NameError:</strong> variable used before definition.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Input, Comments, Variables, and Naming Rules",
    content: (
      <div className="space-y-5 text-gray-300">
        <p><code>input()</code> waits for user text and can be nested inside <code>print()</code>.</p>
        <pre className="bg-black/50 border border-white/10 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          <code>{`input("What is your name? ")`}</code>
          <br />
          <code>{`print("Hello " + input("What is your name? "))`}</code>
        </pre>

        <p>Use comments with <code>#</code> to explain code.</p>
        <pre className="bg-black/50 border border-white/10 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          <code>{`# This is a comment`}</code>
          <br />
          <code>{`print("This is code")`}</code>
        </pre>

        <p>Variables store data for later use.</p>
        <pre className="bg-black/50 border border-white/10 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          <code>{`name = input("What is your name? ")`}</code>
          <br />
          <code>{`print(name)`}</code>
          <br />
          <code>{`length = len(name)`}</code>
          <br />
          <code>{`print(length)`}</code>
        </pre>

        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <h4 className="font-bold text-white mb-2">Variable naming rules</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>No spaces: <code>user_name</code> valid, <code>user name</code> invalid</li>
            <li>No number at start: <code>name1</code> valid, <code>1name</code> invalid</li>
            <li>Avoid reserved names: <code>user_print</code> valid, <code>print</code> invalid</li>
            <li>Prefer snake_case for readability.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "Final Project: Band Name Generator",
    content: (
      <div className="space-y-5 text-gray-300">
        <p>Combine city and pet name to generate a band name.</p>
        <pre className="bg-black/50 border border-white/10 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          <code>{`print("Welcome to the Band Name Generator.")`}</code>
          <br />
          <code>{`city = input("What is the name of the city you grew up in?\\n")`}</code>
          <br />
          <code>{`pet = input("What is your pet name?\\n")`}</code>
          <br />
          <code>{`print("Your band name could be " + city + " " + pet)`}</code>
        </pre>
      </div>
    ),
  },
];

export default function PythonDay1Page() {
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
        .eq("course_id", "python_day_1")
        .maybeSingle();

      if (isCancelled) return;

      if (data?.passed) {
        setAlreadyPassed(true);
        if (typeof data.score === "number") setScore(data.score);
      }
    };

    void loadProgress();

    return () => {
      isCancelled = true;
    };
  }, []);

  function handleSelect(questionIndex: number, optionIndex: number) {
    if (!isSubmitted) setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  async function submitQuiz() {
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
        course_id: "python_day_1",
        score: calculatedScore,
        passed,
      });
    }

    if (passed) setAlreadyPassed(true);
    setSaving(false);
  }

  function retakeQuiz() {
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
    window.scrollTo(0, 0);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-12">
      <nav className="w-full border-b border-white/10 bg-black/50 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-purple-400">Python 100 Days: Day 1</h1>
          <Link href="/courses/python" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Course Syllabus</Link>
        </div>
      </nav>

      <div className="w-full bg-white/5 h-2">
        <div className="bg-purple-500 h-2 transition-all duration-500" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}></div>
      </div>

      <main className="max-w-4xl mx-auto p-4 md:p-6 mt-6">
        {currentStep < CONTENT_SECTIONS.length ? (
          <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
              <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">Part {currentStep + 1} of {CONTENT_SECTIONS.length}</span>
              {alreadyPassed && <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">COMPLETED</span>}
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-8">{CONTENT_SECTIONS[currentStep].title}</h2>
            <div className="leading-relaxed">{CONTENT_SECTIONS[currentStep].content}</div>

            <div className="mt-12 flex justify-between items-center pt-6 border-t border-white/10">
              <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} className={`px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 0 ? "opacity-0 cursor-default" : "bg-white/10 hover:bg-white/20"}`} disabled={currentStep === 0}>{"<-"} Previous</button>
              <button onClick={() => { setCurrentStep(currentStep + 1); window.scrollTo(0, 0); }} className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-xl font-bold transition-all">
                {currentStep === CONTENT_SECTIONS.length - 1 ? "Take Day Quiz ->" : "Next Topic ->"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#111] border border-purple-500/30 p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            {alreadyPassed && !isSubmitted && <div className="absolute top-0 left-0 w-full bg-green-600 text-center py-1 text-sm font-bold text-white uppercase tracking-widest">PASSED: You already completed this module</div>}

            <div className="mb-8 pt-4">
              <h2 className="text-3xl font-black text-white mb-2">Day 1 Mastery Quiz</h2>
              <p className="text-gray-400">10 questions • Need at least 8/10 (80%) to unlock Day 2</p>
            </div>

            <div className="space-y-6">
              {QUIZ_QUESTIONS.map((question, questionIndex) => (
                <div key={questionIndex} className="bg-black/40 p-6 rounded-xl border border-white/5">
                  <p className="text-lg font-bold mb-4"><span className="text-purple-400 mr-2">{questionIndex + 1}.</span>{question.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = answers[questionIndex] === optionIndex;
                      const isCorrect = isSubmitted && question.answer === optionIndex;
                      const isWrongSelection = isSubmitted && isSelected && question.answer !== optionIndex;

                      let buttonClass = "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10";
                      if (isSelected && !isSubmitted) buttonClass = "border-purple-500 bg-purple-500/20 text-white";
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
                  <button onClick={submitQuiz} disabled={Object.keys(answers).length < QUIZ_QUESTIONS.length} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold w-full sm:w-auto">
                    {Object.keys(answers).length < QUIZ_QUESTIONS.length ? "Answer all questions" : "Submit Answers"}
                  </button>
                </div>
              ) : (
                <div>
                  <div className={`inline-block px-8 py-6 rounded-2xl border-2 mb-6 w-full max-w-md ${score >= 8 ? "bg-green-900/30 border-green-500" : "bg-red-900/30 border-red-500"}`}>
                    <h3 className="text-3xl font-black mb-2">{score >= 8 ? "Day Passed!" : "Try Again"}</h3>
                    <p className="text-lg text-gray-300">You scored <strong className="text-white">{score} out of 10</strong> ({score * 10}%)</p>
                    {saving && <p className="text-sm text-green-400 mt-4 animate-pulse font-bold">Saving progress...</p>}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={retakeQuiz} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all">Retake Quiz</button>
                    {score >= 8 && <Link href="/courses/python/day-2" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all">Go to Day 2 -{">"}</Link>}
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
