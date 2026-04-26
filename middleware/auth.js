const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError");

// const auth = (req, res, next) => {
//   try {
//     const header = req.header("Authorization");

//     if (!header) {
//       return res.status(401).send("Access denied. No token provided");
//     }

//     // Extract token from "Bearer <token>"
//     const token = header.split(" ")[1];

//     const verified = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = verified;

//     next();
//   } catch (err) {
//     // res.status(400).send("Invalid or Expired Token");
//     next(new ExpressError(401, "Please Log into the portal"));
//   }
// };

const auth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).send("Login required");
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    req.user = verified;

    next();
  } catch (e) {
    next(new ExpressError(401, "Please Log into the portal"));
  }
};

module.exports = auth;
