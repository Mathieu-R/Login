var mongoose = require("mongoose");
var user = mongoose.model("user");

module.exports.profileUpdate = function(req, res) {
  var lastname = req.body.lastname;
  var pseudo = req.body.pseudo;
  var mail = req.body.mail;
  var hobbys = req.body.hobbys;
  var competences = req.body.competences;
  var humeur = req.body.humeur;

  var conditions = {_id: req.user._id};

  // Pas l'utilisateur du JWT ?
  if (!req.user._id) {
    res.status(401).json({"message" : "UnauthorizedError: private profile"});
  }
  if (req.user._id) {
    console.log("Updating...");
    // On a bien l'utilisateur du JWT
    user.update({_id: req.user._id},
      { $set:
        {
          lastname: lastname,
          pseudo: pseudo,
          mail: mail,
          hobbys: hobbys,
          competences: competences,
          humeur: humeur
        }
      }, function(err, user) {
      if(err) {console.log(err);}
      //res.status(200).json(user);
    });
  }
};
