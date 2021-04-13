var firebase = require("firebase/app");
var firebaseAdmin = require("firebase-admin");

require("firebase/auth");
require("firebase/firestore");

var config = {
  apiKey: "AIzaSyDSeYEI0wT5lm2mLh9MhZJFRDDe7PHLWgc",
  authDomain: "cypress-api.firebaseapp.com",
  projectId: "cypress-api",
  storageBucket: "cypress-api.appspot.com",
  messagingSenderId: "420462902797",
  appId: "1:420462902797:web:12a1dc1f928e11126bdf44",
};

firebase.initializeApp(config);
var admin = firebaseAdmin.initializeApp(config);

var db = firebase.firestore();
var auth = firebase.auth();

module.exports = { db, auth, admin };
