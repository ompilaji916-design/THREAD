import { RoomAllocation } from "../models/RoomAllocation.js";

export async function getMyAllocation(req, res) {
  let allocation = await RoomAllocation.findOne({ userId: req.user.userId });
  if (!allocation) allocation = await RoomAllocation.create({ userId: req.user.userId });
  res.json({ success: true, data: allocation });
}
export async function setPreferences(req, res) {
  const { floor, acType, sleepSchedule, cleanliness } = req.body;
  const allocation = await RoomAllocation.findOneAndUpdate(
    { userId: req.user.userId },
    { preferences: { floor, acType, sleepSchedule, cleanliness } },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: allocation, message: "Preferences saved" });
}
// Simple compatibility-based auto-allocation: groups waitlisted users with matching AC/floor/sleep prefs
export async function runAllocation(req, res) {
  const waitlisted = await RoomAllocation.find({ status: "Waitlisted" });
  const groups = {};
  waitlisted.forEach((w) => {
    const key = `${w.preferences.floor}-${w.preferences.acType}-${w.preferences.sleepSchedule}`;
    groups[key] = groups[key] || [];
    groups[key].push(w);
  });
  let roomCounter = 100;
  for (const group of Object.values(groups)) {
    for (let i = 0; i < group.length; i += 2) {
      const pair = group.slice(i, i + 2);
      const roomNumber = `R-${roomCounter++}`;
      for (const p of pair) {
        p.allocatedRoom = roomNumber;
        p.roommates = pair.filter((x) => x !== p).map((x) => x.userId);
        p.status = "Allocated";
        await p.save();
      }
    }
  }
  res.json({ success: true, message: "Allocation run complete" });
}
