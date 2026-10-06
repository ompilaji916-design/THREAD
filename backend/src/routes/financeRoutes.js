import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listExpenses, createExpense, deleteExpense, getBudget, updateBudget,
  listBillSplits, createBillSplit, updateBillSplit,
} from "../controllers/financeController.js";

const router = Router();
router.use(requireAuth);
router.get("/expenses", listExpenses);
router.post("/expenses", createExpense);
router.delete("/expenses/:id", deleteExpense);
router.get("/budget", getBudget);
router.put("/budget", updateBudget);
router.get("/bill-splits", listBillSplits);
router.post("/bill-splits", createBillSplit);
router.patch("/bill-splits/:id", updateBillSplit);

export default router;
