// nmrkspvlidatapermaenent
// ammanannapermanenet
import React, { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react"; // Monaco Editor
import axios from "axios";
import fetchProblemDetails from "../utils/fetchProblem"; // Import the fetchProblemDetails function
import { Oval } from "react-loader-spinner";

const languages = [
  { id: 50, name: "c", template: `#include <stdio.h>

int main() {
    // Your code here
    return 0;
}` },
  { id: 54, name: "cpp", template: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}` },
  { id: 62, name: "java", template: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // Your code here
    }
}` },
  { id: 71, name: "python", template: `# Your code here
` },
];

function CompilerPage() {
  const [code, setCode] = useState(languages[0].template); // Default to C template
  const [language, setLanguage] = useState(languages[0].id);
  const [problemDetails, setProblemDetails] = useState(null); // Store fetched problem details
  const [loadingProblem, setLoadingProblem] = useState(true);

  // Fetch problem details from Codeforces
  useEffect(() => {
    const fetchProblem = async () => {
      const contestId = "1833"; // Example contest ID
      const index = "A"; // Example problem index
      try {
        const details = await fetchProblemDetails(contestId, index);
        if (!details) {
          throw new Error("Failed to fetch problem details.");
        }
        console.log("Fetched Problem Details:", details); // Debug fetched details
        setProblemDetails(details);
      } catch (error) {
        console.error("Failed to fetch problem details:", error);
        setProblemDetails({ error: "Unable to fetch problem details. Please try again later." });
      } finally {
        setLoadingProblem(false);
      }
    };

    fetchProblem();
  }, []);

  const handleLanguageChange = (e) => {
    const selectedLanguage = languages.find((lang) => lang.id === Number(e.target.value));
    setLanguage(selectedLanguage.id);
    setCode(selectedLanguage.template); // Update code template based on selected language
  };

  return (
    <div style={{ display: "flex", gap: "16px", padding: "32px", maxWidth: "1200px", margin: "40px auto" }}>
      {/* Left Half: Problem Details */}
      <div style={{ flex: "1", background: "#f8fafc", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflowY: "auto", maxHeight: "600px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "24px", fontWeight: "700", color: "#2d3748" }}>
          Problem Details
        </h2>
        {loadingProblem ? (
          <p>Loading problem details...</p>
        ) : problemDetails?.error ? (
          <p style={{ color: "red" }}>{problemDetails.error}</p>
        ) : problemDetails ? (
          <div>
            <h3 style={{ fontWeight: "600", color: "#2d3748" }}>{problemDetails.name}</h3>
            <div dangerouslySetInnerHTML={{ __html: problemDetails.description }} style={{ marginBottom: "16px", color: "#4a5568" }}></div>
            <h4 style={{ fontWeight: "600", color: "#2d3748" }}>Input Format:</h4>
            <div dangerouslySetInnerHTML={{ __html: problemDetails.inputFormat }} style={{ marginBottom: "16px", color: "#4a5568" }}></div>
            <h4 style={{ fontWeight: "600", color: "#2d3748" }}>Output Format:</h4>
            <div dangerouslySetInnerHTML={{ __html: problemDetails.outputFormat }} style={{ marginBottom: "16px", color: "#4a5568" }}></div>
            <h4 style={{ fontWeight: "600", color: "#2d3748" }}>Constraints:</h4>
            <div dangerouslySetInnerHTML={{ __html: problemDetails.constraints }} style={{ marginBottom: "16px", color: "#4a5568" }}></div>
            <h4 style={{ fontWeight: "600", color: "#2d3748" }}>Examples:</h4>
            <div dangerouslySetInnerHTML={{ __html: problemDetails.examples }} style={{ marginBottom: "16px", color: "#4a5568" }}></div>
          </div>
        ) : (
          <p>Problem details not available.</p>
        )}
      </div>

      {/* Right Half: Code Compiler */}
      <div style={{ flex: "1", background: "#f8fafc", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "24px", fontWeight: "700", color: "#2d3748" }}>
          Code Compiler
        </h2>
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="language" style={{ fontWeight: "600", marginRight: "8px" }}>Language:</label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "1rem",
              fontFamily: "inherit",
            }}
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
        </div>
        <Editor
          height="400px"
          language={languages.find((lang) => lang.id === language)?.name.toLowerCase()} // Dynamically set the language
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value)}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}

export default CompilerPage;