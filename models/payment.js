const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  mode: { type: String, required: true },
  remarks: String,
  date: {
    type: Date,
    required: true,
  },
  txnId: {
    type: String,
    require: true,
  },
  paymentStatus: {
    type: String,
    default: "Pending",
  },
  paymentDate: {
    type: Date,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
