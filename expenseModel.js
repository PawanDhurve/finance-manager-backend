const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Expense", "Income"], // Allows both expense & income tracking
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Food", "Transport", "Shopping", "Bills", "Health",
        "Entertainment", "Investment", "Salary", "Freelance", "Other"
      ],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Credit Card", "UPI", "Bank Transfer"],
      required: true,
    },
    isRecurring: {
      type: Boolean,
      default: false, // Set true for subscriptions, rent, etc.
    },
    recurrenceType: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly", "Yearly"],
      required: function () {
        return this.isRecurring;
      },
    },
    budgetLimit: {
      type: Number, // Users can set limits for expenses
      default: null,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    attachment: {
      type: String, // Stores file path for bills/invoices (if needed)
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", expenseSchema);
module.exports = Expense;
