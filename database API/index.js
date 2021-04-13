var express = require("express");
var cors = require("cors");
var app = express();

var { db, auth, admin } = require("./firebase");

app.use(cors());
app.use(express.json());

app.listen(process.env.PORT || 5000, () => {
  console.log("running on 5000...");
});

function respond(res, data) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Content-Type", "application/json");
  res.send(data);
}

app.get("/", (req, res) => {
  respond(res, "Cypress API");
});

app.post("/api/user/signup", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  var info = req.body.info;

  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      var uid = userCredential.user.uid;
      console.log(uid);

      db.collection("users")
        .doc(uid)
        .set({ uid: uid, info: info })
        .then(() => {
          respond(res, { response: { uid: uid } });
        });
    })
    .catch((error) => {
      var errorMessage = error.message;
      respond(res, { error: errorMessage });
    });
});

app.post("/api/user/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      respond(res, { response: { uid: userCredential.user.uid } });
    })
    .catch((error) => {
      var errorMessage = error.message;
      respond(res, { error: errorMessage });
    });
});

app.post("/api/user/info", (req, res) => {
  var uid = req.body.uid;

  db.collection("users")
    .doc(uid)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        respond(res, { error: "No such document" });
      } else {
        respond(res, { response: doc.data() });
      }
    })
    .catch((error) => {
      var errorMessage = error.message;
      respond(res, { error: errorMessage });
    });
});

app.put("/api/user/edit", (req, res) => {
  var uid = req.body.uid;
  var info = req.body.info;

  db.collection("users")
    .doc(uid)
    .update({ info: info })
    .then(() => {
      respond(res, { response: "document updated" });
    })
    .catch((error) => {
      var errorMessage = error.message;
      respond(res, { error: errorMessage });
    });
});

// app.delete("/api/user/delete", (req, res) => {
//   var uid = req.body.uid;
//   db.collection("users")
//     .doc(uid)
//     .delete()
//     .then(() => {
//       admin
//         .auth()
//         .deleteUser(uid)
//         .then((res) => {
//           respond(res, { response: "user successfully deleted" });
//         });
//     })
//     .catch((error) => {
//       var errorMessage = error.message;
//       respond(res, { error: errorMessage });
//     });
// });

//===============================================================================

app.post("/api/report/create", (req, res) => {
  var uid = req.body.uid;
  var report = req.body.report;

  db.collection("reports")
    .add({
      uid: uid,
      report: report,
    })
    .then(() => {
      respond(res, { response: "document successfully added" });
    })
    .catch((error) => {
      var errorMessage = error.message;
      respond(res, { error: errorMessage });
    });
});

app.put("/api/report/edit", (req, res) => {
  var uid = req.body.uid;
  var rid = req.body.rid;
  var report = req.body.report;

  db.collection("reports")
    .doc(rid)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        respond(res, { error: "No such document" });
      } else {
        if (doc.data().uid != uid) {
          respond(res, { error: "Does not have permission" });
        } else {
          db.collection("reports")
            .doc(rid)
            .update({
              report: report,
            })
            .then(() => {
              respond(res, { response: "document successfully updated" });
            });
        }
      }
    })
    .catch((error) => {
      var errorMessage = error.message;
      respond(res, { error: errorMessage });
    });
});

app.delete("/api/report/delete", (req, res) => {
  var uid = req.body.uid;
  var rid = req.body.rid;

  db.collection("reports")
    .doc(rid)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        respond(res, { error: "No such document" });
      } else {
        if (doc.data().uid != uid) {
          respond(res, { error: "Does not have permission" });
        } else {
          db.collection("reports")
            .doc(rid)
            .delete()
            .then(() => {
              respond(res, { response: "document successfully deleted" });
            });
        }
      }
    })
    .catch((error) => {
      var errorMessage = error.message;
      respond(res, { error: errorMessage });
    });
});

app.post("/api/report/owner", (req, res) => {
  var uid = req.body.uid;
  var rid = req.body.rid;

  db.collection("reports")
    .doc(rid)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        respond(res, { error: "No such document" });
      } else {
        if (doc.data().uid != uid) {
          respond(res, { response: { isOwner: false } });
        } else {
          respond(res, { response: { isOwner: true } });
        }
      }
    })
    .catch((error) => {
      var errorMessage = error.message;
      respond(res, { error: errorMessage });
    });
});

app.post("/api/report/info", (req, res) => {
  var rid = req.body.rid;

  db.collection("reports")
    .doc(rid)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        respond(res, { error: "No such document" });
      } else {
        respond(res, { rid: doc.id, report: doc.data().report });
      }
    })
    .catch((error) => {
      var errorMessage = error.message;
      respond(res, { error: errorMessage });
    });
});

app.get("/api/report/all", (req, res) => {
  db.collection("reports")
    .get()
    .then((docs) => {
      var reports = [];
      docs.forEach((x) => {
        reports.push({ rid: x.id, report: x.data().report });
      });
      respond(res, { response: reports });
    })
    .catch((error) => {
      var errorMessage = error.message;
      respond(res, { error: errorMessage });
    });
});

//=================================================
