// nmkrspvlidatapermanent
// ammaradhakrishnanananna
// ksvidpermanent
// kirety
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Replace with your Gemini API key
const GEMINI_API_KEY = "AIzaSyDQZglOyI-olBRwvlPBDS-s2Crq5YV7Gzg";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent";

const MCQInterview = () => {
  const location = useLocation();
  const subject = location.state?.subject || "General";
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      setError("");
      try {
        const prompt = `Generate 5 multiple choice questions for ${subject} interviews. Each question should have 4 options and indicate the correct answer. Format as JSON: [{question, options:[], answer}]`;
        const res = await fetch(GEMINI_API_URL + "?key=" + GEMINI_API_KEY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = JSON.parse(text);
        setQuestions(parsed);
      } catch (err) {
        setError("Failed to fetch questions.");
      }
      setLoading(false);
    }
    fetchQuestions();
  }, [subject]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-200 px-4">
      <div className="max-w-2xl w-full bg-white/95 border border-blue-300 rounded-3xl shadow-2xl p-10">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">MCQ Interview: {subject}</h2>
        {loading && <p className="text-center text-blue-600">Loading questions...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && questions.length > 0 && (
          <div className="space-y-8">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-blue-50 rounded-xl p-6 shadow">
                <p className="font-semibold text-lg mb-4">{idx + 1}. {q.question}</p>
                <ul className="space-y-2">
                  {q.options.map((opt, i) => (
                    <li key={i} className="pl-2">{String.fromCharCode(65 + i)}. {opt}</li>
                  ))}
                </ul>
                <div className="mt-2 text-sm text-green-700">Correct Answer: <span className="font-bold">{q.answer}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MCQInterview;