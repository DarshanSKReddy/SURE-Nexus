"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

const QUIZ_QUESTIONS = [
  { question: "What are the 4 primitive data types in Python?", options: ["str, int, float, bool", "str, list, tuple, dict", "int, float, set, dict", "char, int, float, bool"], answer: 0 },
  { question: "What does type() do?", options: ["Converts value", "Checks variable type", "Rounds numbers", "Prints values"], answer: 1 },
  { question: "How do you access the first character of Hello?", options: ["'Hello'[1]", "'Hello'[0]", "first('Hello')", "'Hello'[-1]"], answer: 1 },
  { question: "Which conversion fixes string + number TypeError in concatenation?", options: ["int()", "float()", "str()", "bool()"], answer: 2 },
  { question: "What does ** do in Python math?", options: ["Multiply", "Exponent", "Floor division", "Concatenate"], answer: 1 },
  { question: "What is 8 // 3?", options: ["2", "2.66", "3", "2.0"], answer: 0 },
  { question: "Division / in Python always returns:", options: ["int", "str", "float", "bool"], answer: 2 },
  { question: "Which function rounds numbers?", options: ["floor()", "int()", "round()", "abs()"], answer: 2 },
  { question: "What does score += 1 mean?", options: ["set score to 1", "add 1 to score", "subtract 1", "compare score"], answer: 1 },
  { question: "What is the clean way to inject variables into text?", options: ["+ concatenation only", "f-strings", "type()", "len()"], answer: 1 },
];

const COURSE_CONTENT = [
  {
    title: "Overview and Primitive Data Types",
    content: (
      <div className="space-y-4 text-gray-300">
        <p><strong>Goal:</strong> Learn data types, conversion, operations, and f-strings.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>str:</strong> text values</li>
          <li><strong>int:</strong> whole numbers</li>
          <li><strong>float:</strong> decimal numbers</li>
          <li><strong>bool:</strong> True or False</li>
        </ul>
        <pre className="bg-black/50 border border-white/10 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          <code>{`print(123_456)`}</code>
          <br />
          <code>{`print(3.14159)`}</code>
          <br />
          <code>{`print(True)`}</code>
        </pre>
      </div>
    ),
  },
  {
    title: "Subscripting and Type Conversion",
    content: (
      <div className="space-y-4 text-gray-300">
        <p>Subscripting starts at index 0 and negative indexes count from the end.</p>
        <pre className="bg-black/50 border border-white/10 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          <code>{`print("Hello"[0])  # H`}</code>
          <br />
          <code>{`print("Hello"[4])  # o`}</code>
          <br />
          <code>{`print("Hello"[-1]) # o`}</code>
        </pre>

        <p>Use explicit conversion to avoid TypeError.</p>
        <pre className="bg-black/50 border border-white/10 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          <code>{`num_char = len(input("What is your name?"))`}</code>
          <br />
          <code>{`print("Your name has " + str(num_char) + " characters.")`}</code>
          <br />
          <code>{`print(70 + float("100.5"))`}</code>
        </pre>
      </div>
    ),
  },
  {
    title: "Math, f-Strings, and Tip Calculator",
    content: (
      <div className="space-y-4 text-gray-300">
        <ul className="list-disc pl-5 space-y-2">
          <li>Operators: +, -, *, /, **, //</li>
          <li>Order: parentheses, exponents, multiply or divide, add or subtract</li>
          <li>Use <code>round()</code>, assignment operators, and f-strings for cleaner output</li>
        </ul>

        <pre className="bg-black/50 border border-white/10 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          <code>{`print(3 * 3 + 3 / 3 - 3)  # 7.0`}</code>
          <br />
          <code>{`print(round(8 / 3, 2))    # 2.67`}</code>
          <br />
          <code>{`score = 0`}</code>
          <br />
          <code>{`score += 1`}</code>
          <br />
          <code>{`print(f"Your score is {score}")`}</code>
        </pre>

        <div className="bg-black/40 border border-white/10 p-6 rounded-xl">
          <h4 className="text-gray-300 font-bold mb-3">Final Project: Tip Calculator</h4>
          <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
            <code>{`print("Welcome to the tip calculator!")`}</code>
            <br />
            <code>{`bill = float(input("What was the total bill? $"))`}</code>
            <br />
            <code>{`tip = int(input("How much tip would you like to give? 10, 12, or 15? "))`}</code>
            <br />
            <code>{`people = int(input("How many people to split the bill? "))`}</code>
            <br />
            <code>{`tip_as_percent = tip / 100`}</code>
            <br />
            <code>{`total_bill = bill + (bill * tip_as_percent)`}</code>
            <br />
            <code>{`bill_per_person = total_bill / people`}</code>
            <br />
            <code>{`final_amount = "{:.2f}".format(bill_per_person)`}</code>
            <br />
            <code>{`print(f"Each person should pay: \${final_amount}")`}</code>
          </pre>
        </div>
      </div>
    ),
  },
];

export default function PythonDay2() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [alreadyPassed, setAlreadyPassed] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const totalSteps = COURSE_CONTENT.length + 1;

  useEffect(() => {
    let isCancelled = false;

    const loadAccessAndProgress = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        window.location.href = "/login";
        return;
      }

      const userId = userData.user.id;

      const [{ data: day1Progress }, { data: day2Progress }] = await Promise.all([
        supabase.from("course_progress").select("passed").eq("user_id", userId).eq("course_id", "python_day_1").maybeSingle(),
        supabase.from("course_progress").select("passed, score").eq("user_id", userId).eq("course_id", "python_day_2").maybeSingle(),
      ]);

      if (isCancelled) return;

      const day1Passed = Boolean(day1Progress?.passed);
      setIsLocked(!day1Passed);

      if (day2Progress?.passed) {
        setAlreadyPassed(true);
        if (typeof day2Progress.score === "number") setScore(day2Progress.score);
      }

      setCheckingAccess(false);
    };

    void loadAccessAndProgress();

    return () => {
      isCancelled = true;
    };
  }, []);

  function handleSelect(qIndex: number, optIndex: number) {
    if (!isSubmitted) setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
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
        course_id: "python_day_2",
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

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-[#111] border border-red-500/30 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-black text-red-400 mb-3">Day 2 is Locked</h1>
          <p className="text-gray-300 mb-6">Pass Day 1 quiz with at least 8 out of 10 to unlock Day 2.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/courses/python/day-1" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Go to Day 1</Link>
            <Link href="/courses/python" className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-bold">Back to Syllabus</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-12">
      <nav className="w-full border-b border-white/10 bg-black/50 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-purple-400">Python 100 Days: Day 2</h1>
          <Link href="/courses/python" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Course Syllabus</Link>
        </div>
      </nav>

      <div className="w-full bg-white/5 h-2">
        <div className="bg-purple-500 h-2 transition-all duration-500" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}></div>
      </div>

      <main className="max-w-4xl mx-auto p-4 md:p-6 mt-6">
        {currentStep < COURSE_CONTENT.length ? (
          <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
              <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">Part {currentStep + 1} of {COURSE_CONTENT.length}</span>
              {alreadyPassed && <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">COMPLETED</span>}
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-8">{COURSE_CONTENT[currentStep].title}</h2>
            <div className="leading-relaxed">{COURSE_CONTENT[currentStep].content}</div>

            <div className="mt-12 flex justify-between items-center pt-6 border-t border-white/10">
              <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} className={`px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 0 ? "opacity-0 cursor-default" : "bg-white/10 hover:bg-white/20"}`} disabled={currentStep === 0}>{"<-"} Previous</button>
              <button onClick={() => { setCurrentStep(currentStep + 1); window.scrollTo(0, 0); }} className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-xl font-bold transition-all">
                {currentStep === COURSE_CONTENT.length - 1 ? "Take Module Quiz ->" : "Next Topic ->"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#111] border border-purple-500/30 p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            {alreadyPassed && !isSubmitted && <div className="absolute top-0 left-0 w-full bg-green-600 text-center py-1 text-sm font-bold text-white uppercase tracking-widest">PASSED: You completed this module</div>}

            <div className="mb-8 pt-4">
              <h2 className="text-3xl font-black text-white mb-2">Day 2 Mastery Quiz</h2>
              <p className="text-gray-400">10 questions • Need 8/10 (80%) to pass</p>
            </div>

            <div className="space-y-6">
              {QUIZ_QUESTIONS.map((question, qIndex) => (
                <div key={qIndex} className="bg-black/40 p-6 rounded-xl border border-white/5">
                  <p className="text-lg font-bold mb-4"><span className="text-purple-400 mr-2">{qIndex + 1}.</span> {question.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {question.options.map((option, optIndex) => {
                      const isSelected = answers[qIndex] === optIndex;
                      const isCorrect = isSubmitted && question.answer === optIndex;
                      const isWrongSelection = isSubmitted && isSelected && question.answer !== optIndex;

                      let buttonClass = "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10";
                      if (isSelected && !isSubmitted) buttonClass = "border-purple-500 bg-purple-500/20 text-white";
                      if (isCorrect) buttonClass = "border-green-500 bg-green-500/20 text-green-400 font-bold";
                      if (isWrongSelection) buttonClass = "border-red-500 bg-red-500/20 text-red-400 line-through";

                      return (
                        <button key={optIndex} onClick={() => handleSelect(qIndex, optIndex)} disabled={isSubmitted} className={`p-4 text-left border rounded-lg transition-all ${buttonClass}`}>
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
                    <h3 className="text-3xl font-black mb-2">{score >= 8 ? "Module Passed!" : "Not Quite There"}</h3>
                    <p className="text-lg text-gray-300">You scored <strong className="text-white">{score} out of 10</strong> ({score * 10}%)</p>
                    {saving && <p className="text-sm text-green-400 mt-4 animate-pulse font-bold">Saving progress...</p>}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={retakeQuiz} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all">Retake Quiz</button>
                    <Link href="/courses/python" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all">Return to Syllabus -{">"}</Link>
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
