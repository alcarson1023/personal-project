// const bodyParser = require('body-parser')
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const Auth0Strategy = require("passport-auth0");
// const controller = require("./controller");
const massive = require("massive");
require("dotenv").config();
const { json } = require("body-parser");
const path = require("path");
// let request = require("request");
// let querystring = require("querystring");
let port = process.env.PORT || 3001;

let app = express();

app.use(json());

massive(process.env.CONNECTION_STRING)
  .then(db => {
    app.set("db", db);
  })
  .catch(err => console.log(err));

//~~~~~~~~~~~~OAuth testing~~~~~~~~~~~~

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 999999999
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

const { DOMAIN, CLIENT_ID, CLIENT_SECRET } = process.env;
passport.use(
  new Auth0Strategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      domain: DOMAIN,
      scope: "openid profile",
      callbackURL: "/login"
    },
    (accessToken, refreshToken, extraParams, profile, done) => {
      return done(null, profile);
    }
  )
);

app.get(
  "/login",
  passport.authenticate("auth0", {
    successRedirect: `${process.env.SERVER_LOCATION}/#/`,
    failureRedirect: process.env.REACT_APP_LOGIN
  })
);

app.get("/logout", (req, res, next) => {
  req.session.destroy(() => {
    res.redirect(`${process.env.SERVER_LOCATION}/#/`);
  });
});

passport.serializeUser((user, done) => {
  const db = app.get("db");
  db.get_user(user.id)
    .then(response => {
      if (!response[0]) {
        db.add_user([user.nickname, user.id])
          .then(res => done(null, res[0]))
          .catch(err => console.log(err));
      } else return done(null, response[0]);
    })
    .catch(err => console.log(err));
});

passport.deserializeUser((user, done) => done(null, user));

//~~~~~~~~~~~~OAuth testing~~~~~~~~~~~~

app.get("/api/all_playlists", (req, res, next) => {
  const db = req.app.get("db");
  db.get_playlists()
    .then(response => {
      console.log("Got all playlists: ", response);
      res.status(200).send(response);
    })
    .catch(err => {
      console.log("Something went wrong: "), err;
      res.status(500).send("Error");
    });
});

app.get("/api/one_playlist/:name", (req, res, next) => {
  const db = req.app.get("db");
  db.get_one_playlist([req.params.name])
    .then(response => {
      console.log("Got playlist by name:", req.params.name, response);
      res.status(200).send(response);
    })
    .catch(err => {
      console.log("Something went wrong: ", err);
      res.status(500).send("Error");
    });
});

app.post("/api/test", (req, res, next) => {
  const db = req.app.get("db");
  const { trackName, albumName, artistName, albumCover, playlist } = req.body;
  db.save_song([trackName, albumName, artistName, albumCover, playlist]) //save a song to the playlist
    .then(response => {
      res.status(200).send(response);
    })
    .catch(err => {
      console.log("Something went wrong: ", err);
      res.status(500).send("Error");
    });
});

app.post("/api/replace", (req, res, next) => {
  const db = req.app.get("db");
  const { playlistname, playlistimage, oldname } = req.body;
  db.edit_playlist([playlistname, playlistimage, oldname]) //replace the image on a playlist
    .then(response => {
      console.log(response);
      res.status(200).send(response);
    })
    .catch(err => {
      console.log("Something went wrong: ", err);
      res.status(500).send("Error");
    });
});

app.delete("/api/test/:id", (req, res, next) => {
  const db = req.app.get("db");
  db.delete_song([req.params.id])
    .then(response => {
      res.status(200).send(response);
    })
    .catch(err => {
      console.log("Something's wrong. ", err);
      res.status(500).send("Error");
    });
});

app.get("https://api.spotify.com/v1/search", (req, res, next) => {
  const db = req.app.get("db");
  db.search_song()
    .then(response => {
      res.status(200).send(response);
    })
    .catch(err => {
      console.log("Something went wrong: ", err);
      res.status(500).send("Error");
    });
});
if (process.env.NODE_ENV === "production") {
  app.use(express.static(__dirname + "/../build/"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/../build/index.html"));
  });
}

console.log(`Listening on port ${port}.`);
app.listen(port);
