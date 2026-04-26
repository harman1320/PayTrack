const express = require("express");
const router = express.Router();
const Employee = require("../models/employee");
const Payment = require("../models/payment");
const wrapAsync = require("../utils/wrapAsync");
const auth = require("../middleware/auth");

router.get(
  "/",
  auth,
  wrapAsync(async (req, res) => {
    let payments = await Payment.find().populate("employee");

    let totalPendingPayments = 0;
    let paidPayments = 0;
    let totalPaidPayments = 0;

    let employee = await Employee.find();
    let totalEmployees = employee.length;

    let totalMonthlyPayment = 0;

    let now = new Date(Date.now());
    let currMonth = now.getMonth();

    for (let p of payments) {
      let payMonth = p.date.getMonth();

      if (p.paymentStatus == "Pending") {
        totalPendingPayments++;
      } else if (p.paymentStatus == "Paid") {
        totalPaidPayments++;
        paidPayments += p.amount;
      }

      if (payMonth == currMonth) {
        totalMonthlyPayment += p.amount;
      }
    }

    totalMonthlyPayment = totalMonthlyPayment.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

    paidPayments = paidPayments.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

    const info = {
      totalPendingPayments,
      totalEmployees,
      totalMonthlyPayment,
      paidPayments,
      totalPaidPayments,
    };

    res.render("dashboard.ejs", { info, payments });
  }),
);

module.exports = router;
