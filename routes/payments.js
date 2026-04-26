const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Payment = require("../models/payment");
const Employee = require("../models/employee");
const { nanoid } = require("nanoid");
const auth = require("../middleware/auth");

router.get(
  "/",
  auth,
  wrapAsync(async (req, res, next) => {
    const employees = await Employee.find();
    const payments = await Payment.find().populate("employee");

    res.render("payments.ejs", { employees, payments });
  }),
);

router.post(
  "/",
  auth,
  wrapAsync(async (req, res, next) => {
    let { employeeId, amount, type, mode, remarks, date } = req.body;

    let payment = new Payment({
      employee: employeeId,
      amount: Number(amount),
      type,
      mode,
      remarks,
      date,
      txnId: "TXN" + Date.now() + nanoid(5),
    });

    await payment.save();
    res.redirect("/payments");
  }),
);

router.get(
  "/success/:id",
  auth,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    let payment = await Payment.findById(id).populate("employee");
    payment.paymentStatus = "Paid";

    await payment.save();

    res.redirect("/payments");
  }),
);

router.get(
  "/reject/:id",
  auth,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Payment.findByIdAndDelete(id);

    res.redirect("/payments");
  }),
);

module.exports = router;
