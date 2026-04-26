require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ejsMate = require("ejs-mate");
const { nanoid } = require("nanoid");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const cookieParser = require("cookie-parser");

const dashboardRouter = require("./routes/dashboard");
const employeesRouter = require("./routes/employees");
const paymentsRouter = require("./routes/payments");
const loginRouter = require("./routes/login");
const logoutRouter = require("./routes/logout");
const signupRouter = require("./routes/signup");

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
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.use(cookieParser());

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
  res.render("signup.ejs");
});

app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/dashboard", dashboardRouter);
app.use("/employees", employeesRouter);
app.use("/payments", paymentsRouter);

app.use((req, res, next) => {
  console.log("ALL ROUTE");
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(app.get("port"), () => {
  console.log("Listening on port 8080");
});
