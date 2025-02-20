const express = require("express");
const Expense = require("../models/expenseModel");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Create a New Expense
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, amount, category, paymentMethod, isRecurring, recurrenceType, budgetLimit, notes, attachment, type } = req.body;

    const expense = new Expense({
      user: req.user.id, // Get user ID from JWT
      title,
      amount,
      category,
      paymentMethod,
      isRecurring,
      recurrenceType: isRecurring ? recurrenceType : null,
      budgetLimit,
      notes,
      attachment,
      type,
    });

    await expense.save();
    res.status(201).json({ message: "Expense added successfully", expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Get All Expenses for a User
router.get("/", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Get Single Expense by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }
    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Update an Expense
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }
    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Expense updated successfully", updatedExpense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Delete an Expense
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Get Expenses by Category
router.get("/category/:category", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id, category: req.params.category }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Get Recurring Expenses
router.get("/recurring", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id, isRecurring: true }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ✅ Get Budget Status
router.get("/budget-status", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });

    const budgetUsage = expenses.reduce((acc, expense) => {
      if (expense.budgetLimit) {
        if (!acc[expense.category]) {
          acc[expense.category] = { spent: 0, limit: expense.budgetLimit };
        }
        acc[expense.category].spent += expense.amount;
      }
      return acc;
    }, {});

    res.json({ message: "Budget status retrieved", budgetUsage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
