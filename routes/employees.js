const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Employee = require("../models/employee");
const Payment = require("../models/payment");
const auth = require("../middleware/auth");

// Employees
router.get(
  "/",
  auth,
  wrapAsync(async (req, res) => {
    const employees = await Employee.find();
    res.render("employee.ejs", { employees });
  }),
);

// See employees
router.get(
  "/details/:id",
  auth,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const employee = await Employee.findOne({ empID: id });
    res.render("employeeDetails.ejs", { employee });
  }),
);

// Add Employee
router.get("/new", auth, (req, res) => {
  res.render("newEmployee.ejs");
});

router.post(
  "/new",
  auth,
  wrapAsync(async (req, res) => {
    const emp = req.body;
    emp.name = emp.name[0].toUpperCase() + emp.name.slice(1);
    emp.netSalary =
      Number(req.body.baseSalary) +
      Number(req.body.HRA) +
      Number(req.body.allowances) -
      (Number(req.body.pfDeduction) + Number(req.body.taxDeduction));
    let newEmployee = new Employee(emp);
    await newEmployee.save();

    res.redirect("/employees");
  }),
);

// edit employees
// Render Edit Form
router.get(
  "/edit/:id",
  auth,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const employee = await Employee.findById(id);
    res.render("employeeEdit.ejs", { employee });
  }),
);

// Main Edit Put Route
router.put(
  "/edit/:id",
  auth,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    let updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.redirect("/employees");
  }),
);

// Destroy Route
router.delete(
  "/delete/:id",
  auth,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    await Payment.deleteMany({ employee: id });

    await Employee.findByIdAndDelete(id);
    res.redirect("/employees");
  }),
);

module.exports = router;
