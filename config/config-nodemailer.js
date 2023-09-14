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

const mailOptions = (email, link) => {
  return {
    from: "verification@nodeapp.com",
    to: email,
    subject: "User verification",
    html: `<h1>Welcome to NodeApp by Kamila!</h1> <p>To verify your account, click the link below: <a href="${link}">${link}</a></p> <i>*Ignore this message if you are not the one who registered an account in our app.</i>`,
  };
};

module.exports = { transporter, mailOptions };
