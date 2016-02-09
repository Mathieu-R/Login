var mongoose = require("mongoose");
var user = mongoose.model("user");
var gravatar = require("gravatar");

module.exports.profileRead = function(req, res) {
  // Pas l'utilisateur du JWT ?
  if (!req.user._id) {
    res.status(401).json({"message" : "UnauthorizedError: private profile"});
  }
  if (req.user._id) {
    // On a bien l'utilisateur du JWT
    user.findById(req.user._id, function(err, user) {
      res.status(200).json(user);
    });
  }
};
