// Judge0 language ID map
const LANGUAGE_IDS = {
  // language name (lowercase) → Judge0 language ID
  javascript:  63,   // Node.js 12.14.0
  typescript:  74,   // TypeScript 3.7.4
  python:      71,   // Python 3.8.1
  cpp:         54,   // C++ (GCC 9.2.0)
  c:           50,   // C (GCC 9.2.0)
  java:        62,   // Java (OpenJDK 13.0.1)
  rust:        73,   // Rust 1.40.0
  go:          60,   // Go 1.13.5
  ruby:        72,   // Ruby 2.7.0
  kotlin:      78,   // Kotlin 1.3.70
  swift:       83,   // Swift 5.2.3
  plaintext:   43,   // Plain Text
};

const EXT_TO_LANG = {
  js: "javascript", jsx: "javascript",
  ts: "typescript", tsx: "typescript",
  py: "python",
  cpp: "cpp", cc: "cpp", cxx: "cpp",
  c: "c", h: "c",
  java: "java",
  rs: "rust",
  go: "go",
  rb: "ruby",
  kt: "kotlin",
  swift: "swift",
};

function getLanguageId(languageName) {
  const normalized = (languageName || "").toLowerCase().replace(/\+\+/, "pp");
  return LANGUAGE_IDS[normalized] || LANGUAGE_IDS.plaintext;
}

function detectLanguage(filename) {
  const ext = filename?.split(".").pop()?.toLowerCase();
  return EXT_TO_LANG[ext] || "plaintext";
}

const JUDGE0_URL = process.env.JUDGE0_URL || "https://ce.judge0.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || null;

function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (JUDGE0_API_KEY) {
    headers["X-Auth-Token"] = JUDGE0_API_KEY;
  }
  return headers;
}

export const executeCode = async (req, res) => {
  try {
    const { code, language, stdin = "", filename } = req.body;

    if (!code || code.trim() === "") {
      return res.status(400).json({ message: "No code provided" });
    }

    const lang = language || detectLanguage(filename) || "plaintext";
    const langId = getLanguageId(lang);

    const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`, {
      method:  "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        source_code: code,
        language_id: langId,
        stdin: stdin || "",
        cpu_time_limit: 10,
        memory_limit: 262144,  
        wall_time_limit: 20,
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      console.error("Judge0 submit error:", errText);
      return res.status(502).json({ message: "Code execution service unavailable. Please try again." });
    }

    const { token } = await submitRes.json();
    if (!token) {
      return res.status(502).json({ message: "Failed to get execution token" });
    }

    let result = null;
    const maxAttempts = 20;
    const pollInterval = 800; // ms

    for (let i = 0; i < maxAttempts; i++) {
      await sleep(pollInterval);

      const pollRes = await fetch(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,compile_output,status,time,memory,exit_code`,
        { headers: getHeaders() }
      );

      if (!pollRes.ok) continue;

      result = await pollRes.json();

      if (result.status?.id > 2) {
        break;
      }
    }

    if (!result) {
      return res.status(504).json({ message: "Execution timed out waiting for result" });
    }

    return res.status(200).json({
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      compile_output: result.compile_output || "",
      status: {
        id: result.status?.id,
        description: result.status?.description || "Unknown",
      },
      time: result.time  || null,
      memory: result.memory || null,
      exit_code: result.exit_code,
      language: lang,
      language_id: langId,
    });

  } catch (error) {
    console.error("executeCode error:", error.message);
    return res.status(500).json({ message: "Internal server error during code execution" });
  }
};

export const getLanguages = (req, res) => {
  const langs = Object.entries(LANGUAGE_IDS).map(([name, id]) => ({ name, id }));
  return res.status(200).json({ languages: langs });
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}