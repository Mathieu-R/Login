var crypto = require("crypto"); // Cryptage de mots de passe
var jwt = require('jsonwebtoken'); // Token JSON
var mongoose = require("mongoose"); // Connect to MongoDB (NoSQL)
var gravatar = require("gravatar"); // Génère url gravatar (md5)
var path = require("path"); // Join path
var fs = require("fs");
//var schema = mongoose.Schema;

var secret = JSON.parse(fs.readFileSync(path.join(process.cwd(), "secret.json"), "utf8"));

var userSchema = new mongoose.Schema({ // Schema DB
  pseudo: {type: String, required: true, unique: true},
  lastname: {type: String, required: true},
  mail: {type: String, required: true, unique: true},
  hash: String,
  salt: String,
  gravatar: String,
  hobbys: String,
  Competences: String,
  Humeur: String
  //created: Date
});

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString("hex");
};

userSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateGravatar = function(mail) {
  //var mail = this.mail;
  this.gravatar = gravatar.url(mail, {s:145, d:'wavatar'});
};

userSchema.methods.generateJwt = function() {
  var exp = new Date();
  exp.setDate(exp.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    pseudo: this.pseudo,
    mail: this.mail,
    lastname: this.lastname,
    exp: parseInt(exp.getTime() / 1000)
  }, secret.secret); // To put in environment variable
};

var user = mongoose.model("user", userSchema);

mongoose.connect("mongodb://localhost/user");
