const app = require("./app");
const mongoose = require("mongoose");

const connection = mongoose.connect(
  "mongodb+srv://little_kama:Go1TMongoDBtest@cluster0.sjjhtdq.mongodb.net/db-contacts?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

connection
  .then(() => {
    app.listen(3000, function () {
      console.log(`Database connection successful. Use our API on port: 3000.`);
    });
  })
  .catch((err) => {
    console.log(`Database connection failed. Error message: ${err.message}`);
    process.exit(1);
  });
