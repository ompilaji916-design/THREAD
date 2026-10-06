import { BusRoute } from "../models/BusRoute.js";

export async function listRoutes(req, res) {
  const items = await BusRoute.find();
  res.json({ success: true, data: items });
}
export async function updateBusLocation(req, res) {
  const { currentLat, currentLng, seatOccupancy, delayMinutes } = req.body;
  const route = await BusRoute.findByIdAndUpdate(
    req.params.id,
    { currentLat, currentLng, seatOccupancy, delayMinutes, lastUpdated: new Date() },
    { new: true }
  );
  if (!route) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  res.json({ success: true, data: route });
}
export async function createRoute(req, res) {
  const { routeName, stops } = req.body;
  if (!routeName) return res.status(400).json({ success: false, error: "routeName required", code: "MISSING_FIELDS" });
  const route = await BusRoute.create({ routeName, stops: stops || [] });
  res.status(201).json({ success: true, data: route });
}
