import { Semester } from "../models/Semester.js";

const GRADE_POINTS = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, F: 0 };

function computeSGPA(subjects) {
  let totalCredits = 0, totalPoints = 0;
  for (const s of subjects) {
    const gp = GRADE_POINTS[s.grade] ?? 0;
    totalPoints += gp * s.credits;
    totalCredits += s.credits;
  }
  return totalCredits === 0 ? 0 : totalPoints / totalCredits;
}

export async function listSemesters(req, res) {
  const semesters = await Semester.find({ userId: req.user.userId }).sort({ semesterNumber: 1 });
  const totalCredits = semesters.reduce((sum, sem) => sum + sem.subjects.reduce((s, x) => s + x.credits, 0), 0);
  const totalPoints = semesters.reduce((sum, sem) => sum + sem.sgpa * sem.subjects.reduce((s, x) => s + x.credits, 0), 0);
  const cgpa = totalCredits === 0 ? 0 : totalPoints / totalCredits;
  res.json({ success: true, data: { semesters, cgpa } });
}

export async function saveSemester(req, res) {
  const { semesterNumber, subjects } = req.body;
  if (!semesterNumber || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ success: false, error: "semesterNumber and at least one subject are required", code: "MISSING_FIELDS" });
  }
  const sgpa = computeSGPA(subjects);
  const semester = await Semester.findOneAndUpdate(
    { userId: req.user.userId, semesterNumber },
    { subjects, sgpa },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: semester, message: `Semester ${semesterNumber} saved. SGPA: ${sgpa.toFixed(2)}` });
}

export async function deleteSemester(req, res) {
  await Semester.deleteOne({ _id: req.params.id, userId: req.user.userId });
  res.json({ success: true, message: "Semester removed" });
}
