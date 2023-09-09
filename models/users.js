const User = require("./schemas/user");

const updateUserSub = async (id, body) => {
  return User.findByIdAndUpdate({ _id: id }, { $set: body }, { new: true });
};

module.exports = { updateUserSub };
