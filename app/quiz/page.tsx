"use client";

import { useState } from "react";
import { Check, X, ArrowLeft } from "lucide-react";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";
import { ApiKeyProvider } from "@/lib/api-keys";
import Link from "next/link";

const QUESTIONS = [
  {
    question: "What does COMPRESS primarily solve?",
    options: ["Context overflow", "Context rot", "Hallucination", "Latency"],
    answer: 1,
    explain: "COMPRESS solves context rot by shrinking what's inside the window.",
  },
  {
    question: "What does ISOLATE primarily solve?",
    options: ["Context rot", "Context overflow", "Token limits", "Memory"],
    answer: 1,
    explain: "ISOLATE solves overflow by splitting work across multiple windows.",
  },
  {
    question: "Which compression technique replaces verbose tool outputs with one-line summaries?",
    options: ["LLM Summarization", "Priority Trimming", "Tool Result Clearing", "Hierarchical Compression"],
    answer: 2,
    explain: "Tool Result Clearing replaces raw JSON tool output with a pre-computed summary line.",
  },
  {
    question: "In the 40-40-20 rule, what is reserved for the model response?",
    options: ["40%", "30%", "20%", "10%"],
    answer: 2,
    explain: "20% is reserved for the model's output.",
  },
  {
    question: "Which sharing pattern is best for deeply interdependent analyses where quality matters most?",
    options: ["Full Isolation (Fan-Out)", "Sequential Pipeline", "Shared Base Context", "None"],
    answer: 1,
    explain: "Sequential Pipeline gives highest quality but is slowest.",
  },
];

export default function QuizPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = QUESTIONS.filter((q, i) => answers[i] === q.answer).length;

  return (
    <ApiKeyProvider>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="mb-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back to lab
            </Link>
          </div>
          <h1 className="text-2xl font-bold mb-2">Session 5 Quiz</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Test what you learned about compression and isolation.
          </p>

          {submitted && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5 mb-6 text-center">
              <div className="text-3xl font-bold text-green-400">
                {score}/{QUESTIONS.length}
              </div>
              <div className="text-sm text-muted-foreground">correct</div>
            </div>
          )}

          <div className="space-y-5">
            {QUESTIONS.map((q, qi) => (
              <div key={qi} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-2 mb-3">
                  <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-xs font-bold shrink-0">
                    Q{qi + 1}
                  </span>
                  <p className="text-sm font-semibold">{q.question}</p>
                </div>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[qi] === oi;
                    const isCorrect = submitted && oi === q.answer;
                    const isWrong = submitted && selected && oi !== q.answer;
                    return (
                      <button
                        key={oi}
                        onClick={() => {
                          if (!submitted) setAnswers((prev) => ({ ...prev, [qi]: oi }));
                        }}
                        disabled={submitted}
                        className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-left cursor-pointer transition-colors ${
                          isCorrect
                            ? "border-green-500 bg-green-500/10"
                            : isWrong
                            ? "border-red-500 bg-red-500/10"
                            : selected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted/30"
                        }`}
                      >
                        <span className="w-4 shrink-0">
                          {isCorrect ? <Check className="h-4 w-4 text-green-400" /> : isWrong ? <X className="h-4 w-4 text-red-400" /> : null}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="text-xs text-muted-foreground mt-2">{q.explain}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            {!submitted && (
              <Button
                disabled={Object.keys(answers).length < QUESTIONS.length}
                onClick={() => setSubmitted(true)}
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </div>
      </main>
    </ApiKeyProvider>
  );
}
