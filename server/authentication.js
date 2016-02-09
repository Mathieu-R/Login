var passport = require('passport');
var jwt = require('jsonwebtoken'); // Token JSON
var mongoose = require('mongoose');
var user = mongoose.model('user');

module.exports.register = function(req, res) { // Enregistrement
  // On crée un nouvel utilisateur dans la DB
  var User = new user();

  User.pseudo = req.body.pseudo; // Pseudo
  User.lastname = req.body.lastname; // Prénom
  User.mail = req.body.mail; // Mail

  User.setPassword(req.body.password); // Mot de passe (hash)
  User.generateGravatar(req.body.mail); // Url Gravatar (md5)

  User.save(function(err) { // On sauvegarde le tout ? :)
    var token;
    token = User.generateJwt(); // Génère le json web token
    if (err) throw err;
    res.status(200);
    res.json({"token" : token});
  });
};

module.exports.login = function(req, res) { // Login

  passport.authenticate('local', function(err, user, info){ // Authentification en local
    var token;

    if (err) {
      res.status(404).json(err);
      return;
    }
    if (user) { // Si on trouve l'utilisateur
      token = user.generateJwt(); // Génère le json web token
      res.status(200);
      res.json({"token" : token});
    } else { // Si on ne trouve pas l'utilisateur
      res.status(401).json(info);
    }
  })(req, res);
};
