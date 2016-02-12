var express = require("express"); // Routes
var app = express();
var http = require("http");
var server = http.Server(app);
var path = require("path"); // Join path
var logger = require("morgan"); // Logger
var cookieParser = require("cookie-parser"); // Cookie
var parser = require("body-parser"); // Parse in JSON
var passport = require("passport"); // Passport
var nodemailer = require("nodemailer"); // Send Mail
var router = express.Router(); // Router (express 4.0)
var mongoose = require("mongoose"); // Connect to MongoDB (NoSQL)
var exjwt = require("express-jwt"); // Express JWT
var fs = require("fs");
var io = require("socket.io")(server); // Socket io

var secret = JSON.parse(fs.readFileSync(path.join(process.cwd(), "secret.json"), "utf8"));

var auth = exjwt({
  secret : secret.secret
});

var user = require("./users");

var ctrlProfile = require("./profile"); // Import profile.js
var ctrlAuth = require("./authentication"); // Import authentication.js
var ctrlUpdate = require("./update");

require("./db");
require("./passport");
require("./chat");


app.use(express.static("../client")); // Définition de la racine
app.use(parser.json()); // Parse JSON
app.use(parser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger("dev")); // log

app.use(passport.initialize()); // initialise passport

app.use(function(err, req, res, next) {
  if (err.name === "UnauthorizedError") { // Si l'erreur
    res.status(401); // Renvoi le statut 401
    res.json({"message" : err.name + ": " + err.message}); // Json contenant le message d'erreur
  }
});

//app.use("/profile", auth);

router.get("/", function(req, res) { // Une route
  res.status(200).send("Home page");
});

router.get("/", function (req,res) { // / + Everything => Renvoi index.html
  res.status(200);
  res.set({"content-type": "text/html; charset=utf-8"});
  res.sendFile("index.html", {root: path.join(__dirname, "../client")});
});

// Profile
router.get("/profile", auth, ctrlProfile.profileRead);

// Authentication
router.post("/register", ctrlAuth.register);
router.post("/login", ctrlAuth.login);

router.post("/sent", function(req, res) { // Envoi un e-mail par "/sent"
  var transporter = nodemailer.createTransport({
    service: "gmail", // Service of mail
    auth: { // Authentification
      user: secret.mailuser, // My e-mail
      pass: secret.mailpass // My pass
      }
    });

  var htmlContent = "<p><i>Pseudo: " + req.body.pseudo + "</i></p>" + // Contenu du mail (html)
                    "<p>" + req.body.comments + "</p>";

  var mailOptions = {
    to: secret.mailuser, // A
    subject: req.body.subject, // Sujet
    from: req.body.lastname + ' <' + req.body.mail +'>', // De
    html: htmlContent // Contenu
  };

  transporter.sendMail(mailOptions, function(err, info) { // Envoi du mail
    if(err) console.log(err); // Si erreur, on l'affiche
    else {
      console.log('Message sent: ' + info.response); // Sinon on affiche message de succès + réponse
      //return res.status(201).json(info);
      }
  });
  transporter.close(); // On ferme la ligne

  res.redirect("/"); // On redirige l'utilisateur vers l'acceuil
});

router.put("/update", auth, ctrlUpdate.profileUpdate); // Mise à jour du profile

app.use("/", router); // Chemin de base

app.on("error", function(error) { // Erreur
  console.log("Error :" + error.message);
  console.log(error.stack);
});

server.on("error", function(error) { // Erreur
    console.log("Error :" + error.message);
    console.log(error.stack);
});

server.listen(8080, function() { // Ecoute sur le port 8080
  console.log("Server running on port 8080");
});

mongoose.model("user");
