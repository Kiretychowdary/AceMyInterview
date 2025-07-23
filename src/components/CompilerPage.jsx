// nmrkspvlidatapermaenent
// ammanannapermanenet
import React, { useState } from "react";
import axios from "axios";

const testCases = [
  { input: "2\n3", expected: "5", description: "Sum of 2 and 3" },
  { input: "10\n20", expected: "30", description: "Sum of 10 and 20" },
];

const languages = [
  { id: 50, name: "C" },
  { id: 54, name: "C++" },
  { id: 62, name: "Java" },
  { id: 71, name: "Python" },
];

function CompilerPage() {
  const [code, setCode] = useState(`#include <stdio.h>

int main() {
    int a, b;
    scanf("%d%d", &a, &b);
    printf("%d", a + b);
    return 0;
}`);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(languages[0].id);

  const handleSubmit = async () => {
    setLoading(true);
    let results = [];
    for (const test of testCases) {
      try {
        const res = await axios.post("http://localhost:5000/submit", {
          code,
          language_id: language,
          stdin: test.input,
        });
        results.push({
          description: test.description,
          input: test.input,
          score: res.data.score,
          total: res.data.total,
          output: res.data.output,
        });
      } catch (err) {
        results.push({
          description: test.description,
          input: test.input,
          score: 0,
          total: 1,
          output: err?.response?.data?.error || err.message || "Error running code.",
        });
      }
    }
    setResult(results);
    setLoading(false);
  };

  return (
    <div style={{
      padding: 32,
      maxWidth: 700,
      margin: "40px auto",
      background: "#f8fafc",
      borderRadius: 16,
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
    }}>
      <h2 style={{
        textAlign: "center",
        marginBottom: 24,
        fontWeight: 700,
        color: "#2d3748"
      }}>
        Online Compiler <span style={{color:"#3182ce"}}>(Judge0)</span>
      </h2>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="language" style={{ fontWeight: 600, marginRight: 8 }}>Language:</label>
        <select
          id="language"
          value={language}
          onChange={e => setLanguage(Number(e.target.value))}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            fontSize: "1rem",
            fontFamily: "inherit"
          }}
        >
          {languages.map(lang => (
            <option key={lang.id} value={lang.id}>{lang.name}</option>
          ))}
        </select>
      </div>
      <textarea
        rows="12"
        cols="70"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{
          width: "100%",
          fontSize: "1rem",
          fontFamily: "Fira Mono, monospace",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          padding: 12,
          background: "#fff",
          marginBottom: 16,
          resize: "vertical"
        }}
        placeholder="Write your code here..."
      ></textarea>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: loading ? "#a0aec0" : "#3182ce",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 32px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px rgba(49,130,206,0.08)"
          }}
        >
          {loading ? (
            <span>
              <span role="status" aria-label="Loading">⏳</span> Running...
            </span>
          ) : "Run & Check"}
        </button>
      </div>
      {loading && (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span role="status" aria-label="Loading" style={{fontSize:"1.2rem"}}>⏳ Loading...</span>
        </div>
      )}
      <div style={{
        background: "#e2e8f0",
        borderRadius: 8,
        padding: "12px 16px",
        minHeight: 40,
        color: "#2d3748",
        fontWeight: 500,
        marginTop: 8,
        textAlign: "center"
      }}>
        {result.length > 0 ? (
          <div>
            {result.map((r, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <strong>{r.description}:</strong> <br />
                <span>Input: {r.input}</span> <br />
                <span>Score: {r.score}/{r.total}</span> <br />
                <span>Output: {r.output}</span>
              </div>
            ))}
          </div>
        ) : (
          <span>Output will appear here.</span>
        )}
      </div>
    </div>
  );
}

export default CompilerPage;
