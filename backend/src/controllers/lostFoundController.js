import { LostFoundItem } from "../models/LostFoundItem.js";
import { notify } from "../services/notificationService.js";

function findMatches(item, allItems) {
  const oppositeType = item.type === "lost" ? "found" : "lost";
  return allItems.filter((other) =>
    other.type === oppositeType &&
    other.status === "open" &&
    (other.category === item.category ||
      other.itemName.toLowerCase().includes(item.itemName.toLowerCase()) ||
      item.itemName.toLowerCase().includes(other.itemName.toLowerCase()))
  );
}

export async function listItems(req, res) {
  const { type } = req.query;
  const filter = {};
  if (type) filter.type = type;
  const items = await LostFoundItem.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}

export async function createItem(req, res) {
  const { type, itemName, description, category, location, date, image } = req.body;
  if (!type || !itemName) return res.status(400).json({ success: false, error: "type and itemName required", code: "MISSING_FIELDS" });
  const item = await LostFoundItem.create({ userId: req.user.userId, type, itemName, description, category, location, date, image });

  const allOpen = await LostFoundItem.find({ status: "open" });
  const matches = findMatches(item, allOpen);
  if (matches.length > 0) {
    item.status = "matched";
    item.matchedWith = matches[0]._id;
    await item.save();
    await notify(item.userId, { type: "lostfound_match", title: "Possible Match Found!", message: `Your ${type} item "${itemName}" may match another report.`, priority: "high" });
    await notify(matches[0].userId, { type: "lostfound_match", title: "Possible Match Found!", message: `A new report may match your "${matches[0].itemName}" report.`, priority: "high" });
  }
  res.status(201).json({ success: true, data: item, message: matches.length ? "Possible match found!" : "Posted" });
}

export async function resolveItem(req, res) {
  const item = await LostFoundItem.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { status: "resolved" }, { new: true });
  if (!item) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  res.json({ success: true, data: item });
}
