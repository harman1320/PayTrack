require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ejsMate = require("ejs-mate");
const { nanoid } = require("nanoid");
const methodOverride = require("method-override");

const Employee = require("./models/employee");
const User = require("./models/user");
const Payment = require("./models/payment");

const auth = require("./middleware/auth");

const app = express();
app.set("port", process.env.PORT || 8080);
const dbUrl = process.env.MONGO_URL;

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate); // to configure a custom template engine
app.use(methodOverride("_method"));

main()
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.get("/", (req, res) => {
  res.render("home.ejs");
});

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already Exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(200).send("User Added in the DB");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid Password");
    }

    // Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // res.json({
    //   message: "Login successful",
    //   token,
    // });
    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard.ejs");
});

// Employees
app.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    // console.log(employees);
    res.render("employee.ejs", { employees });
  } catch (err) {
    res.status(500).send("Interval Server Error");
  }
});

// See employees
app.get("/employees/details/:id", async (req, res) => {
  try {
    let { id } = req.params;
    const employee = await Employee.findOne({ empID: id });
    res.render("employeeDetails.ejs", { employee });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add Employee
app.get("/employees/new", (req, res) => {
  res.render("newEmployee.ejs");
});

app.post("/employees/new", async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// edit employees
// Render Edit Form
app.get("/employees/edit/:id", async (req, res) => {
  try {
    let { id } = req.params;
    const employee = await Employee.findById(id);
    res.render("employeeEdit.ejs", { employee });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
// Main Edit Put Route
app.put("/employees/edit/:id", async (req, res) => {
  try {
    let { id } = req.params;

    let updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.redirect("/employees");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Destroy Route
app.delete("/employees/delete/:id", async(req, res) => {
  try {
    let { id } = req.params;

    await Employee.findOneAndDelete(id);
    res.redirect("/employees");
  }catch (err) {
    res.status(500).send(err.message);
  }
})

// Payments
app.get("/payments", async (req, res) => {
  const employees = await Employee.find();
  const payments = await Payment.find().populate("employee");
  res.render("payments.ejs", { employees, payments });
});

app.post("/payments", async (req, res) => {
  try {
    let { employeeId, amount, type, mode, remarks } = req.body;

    let payment = new Payment({
      employee: employeeId,
      amount: Number(amount),
      type,
      mode,
      remarks,
      date: new Date(),
      txnId: "TXN" + Date.now() + nanoid(5),
    });

    await payment.save();

    // let employee = await Employee.findById(employeeId);
    // employee.paymentStatus = "Paid";
    // employee.paymentDate = new Date();
    // await employee.save();

    res.redirect("/payments");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/payments/success/:id", async (req, res) => {
  try {
    let { id } = req.params;

    let payment = await Payment.findById(id).populate("employee");
    payment.employee.paymentStatus = "Paid";

    await payment.employee.save();

    res.status(200).send("DONE PAYMENT");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/payments/reject/:id", async (req, res) => {
  try {
    let { id } = req.params;
    await Payment.findByIdAndDelete(id);

    res.status(200).send("DONE REJECTED PAYMENT");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(app.get("port"), () => {
  console.log("Listening on port 8080");
});
