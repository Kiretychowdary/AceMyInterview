// NMKRSPVLIDATAPERMANENT
// AMMARADHAKRISHNANANNA
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const InterviewModeSelect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Catch the subject selection from navigation state
  const subject = location.state?.subject || "Selected Subject";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-300 text-gray-900 px-4">
      <div className="max-w-md w-full bg-white/95 border border-blue-400 rounded-3xl shadow-2xl p-10 backdrop-blur-md">
        <h2 className="text-3xl font-extrabold text-center mb-4 text-blue-700 tracking-tight drop-shadow">
          Choose Interview Mode
        </h2>
        <p className="text-center text-gray-600 mb-8 text-lg">
          Subject:{" "}
          <span className="font-semibold text-blue-800">{subject}</span>
        </p>
        <div className="flex flex-col gap-6">
          <button
            className="w-full px-6 py-3 rounded-full bg-blue-700 text-white font-bold shadow-lg hover:bg-blue-800 transition-all duration-200 text-lg"
            onClick={() => navigate("/mcq-interview", { state: { subject } })}
          >
            MCQ Interview
          </button>
          <button
            className="w-full px-6 py-3 rounded-full bg-blue-700 text-white font-bold shadow-lg hover:bg-blue-800 transition-all duration-200 text-lg"
            onClick={() => navigate("/coding-interview", { state: { subject } })}
          >
            Coding Interview
          </button>
          <button
            className="w-full px-6 py-3 rounded-full bg-blue-700 text-white font-bold shadow-lg hover:bg-blue-800 transition-all duration-200 text-lg"
            onClick={() => navigate("/compiler", { state: { subject, prompt: "Face to Face Interview" } })}
          >
            Face to Face Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewModeSelect;