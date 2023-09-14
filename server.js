const app = require("./app");
const mongoose = require("mongoose");

const uriDb = process.env.URI_DB;

const createFolderIfNotExist = require("./service/createFolders");
const { uploadDir } = require("./config/config-multer");
const { storeAvatar } = require("./controller/users");

const connection = mongoose.connect(uriDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connection
  .then(() => {
    app.listen(3000, async () => {
      createFolderIfNotExist(uploadDir);
      createFolderIfNotExist(storeAvatar);
      console.log(`Database connection successful. Use our API on port: 3000.`);
    });
  })
  .catch((err) => {
    console.log(`Database connection failed. Error message: ${err.message}`);
    process.exit(1);
  });
