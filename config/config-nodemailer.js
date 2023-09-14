const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kamila.fullstackdeveloper@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
  secure: true,
});

const mailOptions = {
  from: "verification@nodeapp.com",
  to: "121kama121@gmail.com",
  subject: "User verification",
  html: `Welcome to NodeApp! To verify your account, click the link below: <a href="#">Hello</a> *Ignore this message if you are not the one who registered an account in our app.`,
};

module.exports = { transporter, mailOptions };
