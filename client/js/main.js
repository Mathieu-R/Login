// Module principale
var app = angular.module("app", ["login"]);

// Module Login
var login = angular.module("login", ["ui.router"]);

login.service("authentication", ["$http", "$window", function($http, $window) {

  var saveToken = function(token) { // Sauvegarde
    $window.localStorage["mean-token"] = token // Sauve le token en local (note: sessionStorage => Sauve le token le temps de la session)
  };

  var getToken = function() { // Récupération
    return $window.localStorage["mean-token"];
  };

  var logout = function() { // Déconneion
    $window.localStorage.removeItem("mean-token");
  };

  var isLoggedIn = function(token) {
    var token = getToken();
    var payload;

    if (token) {
      payload = token.split(".")[1]; // Split le token lors d'un "." et on retourne l'élément d'index [1]
      payload = $window.atob(payload);  // Décode
      payload = JSON.parse(payload); // Parse en JSON

      return payload.exp > Date.now() / 1000; // True si date n'est pas dépassée
    }
    else {
      return false;
    }
  };

  var currentUser = function() {

    var token = getToken();
    var payload;

    if (isLoggedIn()) {
      payload = token.split(".")[1]; // Split le token lors d'un "." et on retourne l'élément d'index [1]
      payload = $window.atob(payload);  // Décode
      payload = JSON.parse(payload); // Parse en JSON
      return {
        mail: payload.mail,
        lastname: payload.lastname
      };
    }
  };

  return { // On renvoi tout dans un objet
    saveToken: saveToken,
    getToken: getToken,
    logout: logout,
    isLoggedIn: isLoggedIn,
    currentUser: currentUser
  };
}]);

login.factory("profileData", ["$http", "authentication", "$rootScope","$q", function($http, authentication, $rootScope, $q) {

  var profile = {
    profile : false, // Par défaut à false
    getProfile: function() {
      var deferred = $q.defer(); // On initialise une tâche qui se terminera dans le futur
      $http.get('/profile', {headers: {Authorization: 'Bearer '+ authentication.getToken()}})
        .success(function(data) { // En cas de succès
          profile.profile = data; // On ajoute les données à profile
          deferred.resolve(profile.profile); // C'est bon
        })
        .error(function(data, error) { // En cas d'erreur
          deferred.reject("GET erreur"); // On rejette la requète
          console.log(error); // On affiche l'erreur
        });
      return deferred.promise; // Une fois la tâche terminée, on retourne la promesse
    }
  };

  return profile;

}]);

// Routes
login.config(['$stateProvider', '$urlRouterProvider', "$locationProvider", function($stateProvider, $urlRouterProvider, $locationProvider) {
  $stateProvider.state('home', {
                          url: '/home', // Une url
                          templateUrl: 'views/home.html', // Un template
                          controller: 'home' // Son contrôleur
                        });
  $stateProvider.state('register', {
                                url: '/register', // une url (+un id)
                                templateUrl: 'views/register.html', // Un template
                                controller: 'register' // Son contrôleur
                                });
  $stateProvider.state('login', {
                              url: '/login',
                              templateUrl: 'views/login.html',
                              controller: 'login'
                              });
  $stateProvider.state('profile', {
                              url: '/profile',
                              templateUrl: 'views/profile.html',
                              controller: 'profile'
                              });
  $stateProvider.state('contact', {
                                url: '/contact',
                                templateUrl: 'views/contact.html',
                                controller: 'contact'
                                });
$stateProvider.state('chat', {
                              url: '/chat',
                              templateUrl: 'views/chat.html',
                              controller: 'chat'
                              });
  $urlRouterProvider.otherwise('/home'); // Autrement => Redirection vers /
  //$locationProvider.html5Mode(true);

  /*$rootScope.$on("$stateChangeStart", function(event, toState, $rootScope) {
    if (toState.name === "profile" && !$rootScope.isLoggedIn) {
      event.preventDefault();
      //$state.transitionTo("onboard", null, {notify:false});
      $state.go("home");
    }
  });*/

}]);

// Contrôleur navbar
login.controller("MainCtrl", function($rootScope, authentication, $scope, $location, profileData) {

  $scope.me = { // Infos du profil
    //lastname: ""
    // User Profile
  };

  $rootScope.isLoggedIn = authentication.isLoggedIn(); // Authentifié ? True : False
  $rootScope.currentUser = authentication.currentUser(); // Utilisateur courant

  $scope.logout = function() { // Lors de la déco
    authentication.logout(); // On supprime le token
    $location.path("/home");
    $rootScope.isLoggedIn = authentication.isLoggedIn(); // Authentifié ? True : False
  }
});

// Contrôleur home
login.controller("home", function($rootScope, authentication, $scope, profileData) {

  $rootScope.sent = false; // Message caché

  $scope.getTitleType = function getTitleType() { // Renvoi une classe
    return {
      homeTitle: !authentication.isLoggedIn(), // Utilisateur déco
      profileTitle: authentication.isLoggedIn() // Utilisateur connecté
    };
  };

  if (authentication.isLoggedIn()) {
    $scope.me = profileData.getProfile()
      .then(function(profile) { // On get le profile, une fois que c'est fait, on l'ajoute dans la var et on modifie le titre du "home"
      $scope.me = profile;
      $scope.title = "Bienvenue" + " " + $scope.me.lastname; // Affiche Bienvenue + le nom si l'utilisateur est connecté
    }, function(msg) {
      alert("msg");
    }).then(function() { // Effet de texte écrit
          $(".profileTitle").typed({ // Typing effect
          strings: [$scope.title], // The sentence
          typeSpeed: 0 // Vitesse
          });
    })
  }
  else {$scope.title = "Bienvenue"}

  $(function() {
    $('.arrow__button').click(function() {
      $("html, body").animate({ scrollTop: $(document).height() }, "slow");
    });
  });

});

// Contrôleur enregistrement
login.controller("register", function($scope, $http, $log, authentication, $location, $rootScope) {

  $scope.newUser = {
// pseudo : { // Utilisateur
//    lastname: // Son prénom
//    password: // Mot de passe
//    mail: // Mail
//    }
  };

  $scope.register = function() {
    //$scope.users[$scope.name] = {};
    $scope.newUser = {
      pseudo: $scope.me.newPseudo,
      lastname: $scope.me.newLastname,
      password: $scope.me.newPassword,
      mail: $scope.me.newMail
    };

    $http.post('/register', $scope.newUser)
      .success(function(data) {
        $log.log("Vous êtes bien inscris, " + $scope.newUser["lastname"]);
        authentication.saveToken(data.token);
        $rootScope.isLoggedIn = authentication.isLoggedIn(); //  // Authentifié ? True : False
        $rootScope.currentUser = authentication.currentUser(); // Utilisateur courant (provient du token)
      })
      .error(function(data) {
        $log.warn("Erreur, Inscription failed")
      })
      .then(function() {
        $location.path("profile");
      });
  };
});

// Contrôleur login
login.controller("login", function($scope, $http, $log, authentication, $location, $rootScope) {
  $scope.user = {
    // pseudo : { // Utilisateur
    //    password: // Mot de passe
    //    }
  };
  $scope.login = function() {
    $scope.user = {
      pseudo: $scope.me.pseudo,
      password: $scope.me.password
    };

    $http.post('/login', $scope.user)
      .success(function(data) {
        $log.log("Vous êtes bien connectés, " + $scope.user["pseudo"]);
        authentication.saveToken(data.token);
        $rootScope.isLoggedIn = authentication.isLoggedIn(); //  // Authentifié ? True : False
        $rootScope.currentUser = authentication.currentUser(); // Utilisateur courant (provient du token)
      })
      .error(function(data, err) {
        $log.warn("Erreur, Log In failed")
        alert("Pseudo ou mot de passe incorrect !")
        console.log(err);
      })
      .then(function() {
        $location.path("profile");
      });
  };
});

// Contrôlleur profile
login.controller("profile", function($scope, $http, profileData, authentication, $rootScope, $location) {

  /*$scope.information = {

  };*/

  profileData.getProfile()
    .then(function(profile) { // On get le profile, une fois que c'est fait, on l'ajoute dans la var
    $scope.information = profile;
    console.log($scope.information)
    });

    $scope.edit = false; // On cache le champs d'edition par défaut

    $scope.modify = function(champ) {
      champ.edit = true // Lorsqu'on double-click sur un champ, il devient éditable
    }

    $scope.modifyAll = function() {
      $scope.edit = true // Lorsqu'on click sur modifier, tout les champs deviennent editables
    }

  $scope.update = function() {
    $http.put("/update", $scope.information, {headers: {Authorization: 'Bearer '+ authentication.getToken()}})
      .success(function(data) {
        console.log("Mises à jour envoyées");
        console.log(data);
        //$scope.inforamtion = data;
      })
      .error(function(data, err) {
        console.log("Un problème est survenu lors de la mise à jour du profile");
        console.log(err);
      })
      .then(function() {
        $scope.edit = false;
      });
  };

});

// Contrôleur contact
login.controller("contact", function($scope, $rootScope, $http, $log, $location, authentication) {
  $scope.contactInfos = {
    // pseudo : { // Utilisateur
    //    pseudo: // Utilisateur
    //    lastname: // Prénom
    //    mail: // Mail
    //    subject: // Sujet
    //    comments: // Commentaires
    //    };
  };

  $scope.contact = function() {
    console.log($scope.me);
    if(authentication.isLoggedIn()) {
      $scope.contactInfo = {
        pseudo: $scope.information.pseudo,
        lastname: $scope.information.lastname,
        mail: $scope.information.mail,
        subject: $scope.info.sendSubject,
        comments: $scope.info.sendComments
      };
    } else  {
      $scope.contactInfos = {
        pseudo: $scope.info.sendPseudo,
        lastname: $scope.info.sendLastname,
        mail: $scope.info.sendMail,
        subject: $scope.info.sendSubject,
        comments: $scope.info.sendComments
      };
    }

    $http.post('/sent', $scope.contactInfos)
      .success(function(data) {
        $log.log("Message envoyé par "+ $scope.contactInfos["lastname"]);
      })
      .error(function(data) {
        $log.warn("Erreur !! Message non-envoyé")
      })
      .then(function() {
        $location.path("home");
      });
    };
  });
  login.controller("chat", function($scope, $http) {

    var socket = io.connect('http://localhost:8080/#/chat'); // Socket io

    $scope.connect = function(user) {
      socket.emit("connect", {user: user});
    }

    $scope.sendMessage = function() {

    }
  });
