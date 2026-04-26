const mongoose = require("mongoose");

const employeeSchema = mongoose.Schema({
  empID: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  employmentType: {
    type: String,
    required: true,
  },
  joiningDate: {
    type: Date,
  },
  baseSalary: {
    type: Number,
  },
  HRA: {
    type: Number,
  },
  allowances: {
    type: Number,
  },
  pfDeduction: {
    type: Number,
  },
  taxDeduction: {
    type: Number,
  },
  netSalary: {
    type: Number,
  },
  bankName: {
    type: String,
  },
  accountNumber: {
    type: String,
  },
  IFSC: {
    type: String,
  },
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
