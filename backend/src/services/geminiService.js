// Central AI service. Tries Gemini if GEMINI_API_KEY is set; otherwise (or on any
// error/rate-limit) falls back to high-quality templates SILENTLY — the app
// never crashes or shows an error because of AI. Response always includes
// { aiGenerated: true|false } so the UI can show a small "Template Mode" chip.

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null; // network/quota error -> fallback silently
  }
}

const EMAIL_TEMPLATES = {
  Permission: (ctx) => ({
    subject: `Request for Permission — ${ctx.reason || "Leave"}`,
    body: `Respected Sir/Madam,\n\nI hope this email finds you well. I am ${ctx.name || "[Your Name]"}, a student of ${ctx.branch || "[Branch]"}. I am writing to request permission for ${ctx.reason || "the matter discussed"}.\n\nI would be grateful if you could grant this permission. I assure you of my full cooperation.\n\nThank you for your time and consideration.\n\nRegards,\n${ctx.name || "[Your Name]"}`,
  }),
  Apology: (ctx) => ({
    subject: `Apology Regarding ${ctx.reason || "Recent Incident"}`,
    body: `Respected Sir/Madam,\n\nI sincerely apologize for ${ctx.reason || "my recent conduct"}. I understand this was not appropriate, and I take full responsibility.\n\nI assure you this will not happen again.\n\nRegards,\n${ctx.name || "[Your Name]"}`,
  }),
  Default: (ctx) => ({
    subject: `Regarding ${ctx.reason || "College Matter"}`,
    body: `Respected Sir/Madam,\n\nI am ${ctx.name || "[Your Name]"} writing regarding ${ctx.reason || "the matter mentioned"}.\n\nThank you for your time.\n\nRegards,\n${ctx.name || "[Your Name]"}`,
  }),
};

export async function generateEmail({ templateType, tone, prompt, name, branch }) {
  const geminiPrompt = `Write a ${tone} professional email for an Indian college student. Template type: ${templateType}. Student's situation: "${prompt}". Student name: ${name}. Return ONLY in this exact format:\nSUBJECT: <subject line>\nBODY: <full email body with greeting and signature>`;
  const raw = await callGemini(geminiPrompt);
  if (raw) {
    const subjectMatch = raw.match(/SUBJECT:\s*(.*)/i);
    const bodyMatch = raw.match(/BODY:\s*([\s\S]*)/i);
    if (subjectMatch && bodyMatch) {
      return { subject: subjectMatch[1].trim(), body: bodyMatch[1].trim(), aiGenerated: true };
    }
  }
  const tpl = (EMAIL_TEMPLATES[templateType] || EMAIL_TEMPLATES.Default)({ name, branch, reason: prompt });
  return { ...tpl, aiGenerated: false };
}

export async function generateResumePackage({ projectName, projectDescription, techStack, role }) {
  const prompt = `Given this student project — Name: ${projectName}, Description: ${projectDescription}, Tech: ${techStack}, Role: ${role} — generate JSON with keys: resumeBullets (3 strings), linkedinPost (string), interviewAnswer (STAR format string), readme (markdown string), coverLetter (string), atsKeywords (15-20 strings), atsScore (number 60-100), skillsToAdd (5 strings). Return ONLY valid JSON.`;
  const raw = await callGemini(prompt);
  if (raw) {
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return { ...parsed, aiGenerated: true };
    } catch { /* fall through to template */ }
  }
  return {
    resumeBullets: [
      `Built ${projectName} using ${techStack}, implementing core ${role || "developer"} responsibilities end-to-end.`,
      `Designed and developed key features in ${projectName}, improving usability and reliability for end users.`,
      `Applied ${techStack} to solve a real problem, demonstrating hands-on full-stack / technical skills.`,
    ],
    linkedinPost: `Excited to share my project: ${projectName}! 🚀\n\n${projectDescription}\n\nBuilt with ${techStack}. Key highlights: real-world problem solving, clean architecture, and a working demo.\n\n#buildinpublic #${(techStack || "coding").split(",")[0].trim().replace(/\s+/g, "")} #studentdeveloper`,
    interviewAnswer: `Situation: I noticed a real problem that ${projectDescription}. Task: I set out to build ${projectName} to solve it. Action: I used ${techStack} to design and implement the ${role || "core"} functionality, testing and iterating along the way. Result: I delivered a working solution that demonstrates my ability to ship real software independently.`,
    readme: `# ${projectName}\n\n${projectDescription}\n\n## Tech Stack\n${techStack}\n\n## Role\n${role}\n\n## Getting Started\n1. Clone the repo\n2. Install dependencies\n3. Run the project\n\n## License\nMIT`,
    coverLetter: `Dear Hiring Manager,\n\nI recently built ${projectName}, ${projectDescription}. This project let me apply ${techStack} in a real, end-to-end context as a ${role || "developer"}. I'm excited to bring this same initiative and technical ability to your team.\n\nSincerely,\n[Your Name]`,
    atsKeywords: (techStack || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20),
    atsScore: 72,
    skillsToAdd: (techStack || "Problem Solving, Git, APIs, Debugging, Teamwork").split(",").map((s) => s.trim()).slice(0, 5),
    aiGenerated: false,
  };
}

export async function generateDoubtAnswer({ question, language }) {
  const prompt = `Explain this ${language} coding doubt to a first-year college student like a senior explaining to a junior. Question: "${question}". Return JSON with keys: simpleExplanation, realWorldAnalogy, codeExample, stepByStep, rememberThis, commonMistakes. Return ONLY valid JSON.`;
  const raw = await callGemini(prompt);
  if (raw) {
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      return { ...JSON.parse(cleaned), aiGenerated: true };
    } catch { /* fall through */ }
  }
  return {
    simpleExplanation: `Here's the core idea behind "${question}": break the problem into small pieces, and solve each piece step by step in ${language}.`,
    realWorldAnalogy: `Think of it like following a recipe — each instruction runs in order, and skipping steps or getting the order wrong changes the result.`,
    codeExample: language === "Python" ? `# Example\ndef solve():\n    pass` : `// Example\nint main() {\n    return 0;\n}`,
    stepByStep: `1. Understand what the question is really asking.\n2. Identify the inputs and expected output.\n3. Write pseudocode first.\n4. Translate to ${language}.\n5. Test with a simple example.`,
    rememberThis: `Always trace through your code with a small example by hand before running it.`,
    commonMistakes: `Off-by-one errors, forgetting to initialize variables, and mismatched data types are the most common mistakes here.`,
    aiGenerated: false,
  };
}

export async function generateStudyPlan({ examName, examDate, subjects, dailyHours, prepLevel }) {
  const today = new Date();
  const exam = new Date(examDate);
  const totalDays = Math.max(1, Math.ceil((exam - today) / 86400000));
  const days = [];
  const sorted = [...subjects].sort((a, b) => {
    const order = { Hard: 0, Medium: 1, Easy: 2 };
    return order[a.difficulty] - order[b.difficulty];
  });

  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const isLastDay = i === totalDays;
    const isRevisionDay = !isLastDay && i % 6 === 0;
    let tasks = [];
    if (isLastDay) {
      tasks = [{ text: "Light revision of key formulas/concepts only", done: false }, { text: "Rest well — no new topics today", done: false }];
    } else if (isRevisionDay) {
      tasks = sorted.map((s) => ({ text: `Revise ${s.name} — quick recap + practice questions`, done: false }));
    } else if (totalDays - i <= 3) {
      tasks = [{ text: "Attempt a full mock test", done: false }, { text: "Review mistakes from the mock test", done: false }];
    } else {
      const subj = sorted[(i - 1) % sorted.length];
      tasks = [{ text: `Study ${subj.name} (${subj.difficulty}) for ${dailyHours}h`, done: false }, { text: `Solve practice problems for ${subj.name}`, done: false }];
    }
    days.push({ date: d.toISOString().slice(0, 10), tasks, isRevision: isRevisionDay });
  }
  return { days, aiGenerated: false }; // deterministic scheduling algorithm — Gemini not needed for correctness
}
