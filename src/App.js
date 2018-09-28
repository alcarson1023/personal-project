import "./App.css";
import "./reset.css";
import Player from "./components/Player";
import React, { Component } from "react";
import routes from "./routes";
import { HashRouter, Link } from "react-router-dom";

//localStorage testing
// window.localStorage.setItem("testing", "Test Succeeded!!!");
// window.localStorage.setItem('Spotify key', )
// let localStorageTest = window.localStorage.getItem('testing')
// alert(localStorageTest)
//localStorage testing

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playlistsNum: 12, //filler text during creation. Remove later.
      totalHours: 238, //filler text during creation. Remove later.
      token: null, //The input field for Spotify's verficiation string. I need to connect Sessions so that they can stay logged in.
      origionalToken: "empty",
      deviceId: "",
      loggedIn: false, //Switches the view they can access, handled through handleLogin().
      error: "", //Ugh.
      trackName: "Track Name",
      artistName: "Artist Name",
      albumName: "Album Name",
      playing: false, //This will interact with the play/pause button. Not yet sure if it will controll it or be controlled by it.
      position: 0,
      duration: 0,
      playerCheckInterval: 0,
      albumCover: ""
    };
    this.playerCheckInterval = null; //constantly runs my checkForPlayer method until it hits something.
    this.handleLogin = this.handleLogin.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  componentDidMount() {
    this.setState(
      { token: window.localStorage.getItem("Spotify key") },
      this.handleLogin
    );
    if (this.state.origionalToken === "empty") {
      this.setState({
        origionalToken: window.localStorage.getItem("Spotify key")
      });
    }
  }

  handleLogin() {
    //Move all of these to a "Login" component whenever possible. It doesn't need to be this cluttered.
    if (this.state.token !== null) {
      this.setState({ loggedIn: true });
      this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 2500); //Set the playerCheck timer once the button is clicked.
      window.localStorage.setItem("Spotify key", this.state.token);
    }
  }

  checkForPlayer() {
    //Move all of these to a "Login" component whenever possible. It doesn't need to be this cluttered.
    const { token } = this.state; //tokens only last an hour. I'm not sure if that will log them out or not, we'll see soon.

    if (window.Spotify !== null) {
      clearInterval(this.playerCheckInterval); //Gets rid of the "null" that I used as a placeholder in like line ~30. Totally works!
      this.player = new window.Spotify.Player({
        name: "The JukeBox",
        getOAuthToken: cb => {
          cb(token);
        } //Put a console.log before the last "}" here if the increment needs to be tested. It'll run whenever
      }); //this method checks for a Player.
      //The documentation says to use a constant OAuth token, but I'm going to try and use the
      //state so I can access it in my other methods without having to go through the extra hassle.
      this.createEventHandlers();
      this.player.connect();
    }
  }

  createEventHandlers() {
    this.player.on("initialization_error", e => {
      console.error(e);
    });
    this.player.on("authentication_error", e => {
      console.error(e);
      this.setState({ loggedIn: false }); //if there's an error logging them, return them to the login screen!
    });
    this.player.on("account_error", e => {
      console.error(e);
    });
    this.player.on("playback_error", e => {
      console.error(e);
    });

    // Playback status updates
    this.player.on("player_state_changed", state => this.onStateChanged(state)); //When our app is selected, run the next function with our new state!

    // Ready
    this.player.on("ready", data => {
      let { device_id } = data;
      console.log("Ready to play some music!");
      this.setState({ deviceId: device_id });
    });
  }

  onStateChanged(state) {
    //if there's no music, we'll get a null state.
    if (state !== null) {
      const {
        current_track: currentTrack,
        position,
        duration
      } = state.track_window;
      // const albumCover = currentTrack.images
      console.log(currentTrack); //testing
      const albumCover = currentTrack.album.images[0].url; //testing
      const trackName = currentTrack.name;
      const albumName = currentTrack.album.name;
      const artistName = currentTrack.artists
        .map(artist => artist.name)
        .join(", "); //takes an object instead of a string, in case there's more than one artist.
      const playing = !state.paused;
      this.setState({
        position,
        duration,
        trackName,
        albumName,
        artistName,
        playing,
        albumCover
      });
    }
  }

  logOut() {
    window.localStorage.removeItem("Spotify key");
    this.setState({ loggedIn: false });
  }

  // //button clicks---------
  // onPrevClick(){this.player.previousTrack()}
  // onPlayClick(){this.player.togglePlay()}
  // onNextClick(){this.player.nextTrack()}
  // //button clicks---------

  render() {
    const { token, loggedIn, error } = this.state;

    return (
      <HashRouter>
        <div className="App">
          <div className="header">
            <p>The JukeBox</p>
          </div>

          {error && <p>Error: {error}</p>}

          {loggedIn ? (
            <div>
              <div className="navBar">
                <a href={process.env.REACT_APP_LOGOUT}>
                  <button className="navButton" onClick={() => this.logOut()}>
                    Log out
                  </button>
                </a>
                <Link to="/search">
                  <button className="navButton">Search</button>
                </Link>
                <Link to="/playlist">
                  <button className="navButton">Playlist</button>
                </Link>
                <Link to="/">
                  <button className="navButton">Home</button>
                </Link>
              </div>
              <Player />
              <div className="routes">{routes}</div>
            </div>
          ) : (
            <div id="loginScreen">
              <p className="App-intro">
                Enter your Spotify access token. Get it from{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  id="loginLink"
                  href="https://accounts.spotify.com/en/authorize?response_type=token&client_id=adaaf209fb064dfab873a71817029e0d&redirect_uri=https:%2F%2Fdeveloper.spotify.com%2Fdocumentation%2Fweb-playback-sdk%2Fquick-start%2F&scope=streaming%20user-read-birthdate%20user-read-email%20user-modify-playback-state%20user-read-private&show_dialog=true"
                >
                  here
                </a>
              </p>
              <p>
                <input
                  className="loginInput"
                  type="text"
                  value={token}
                  onChange={e => this.setState({ token: e.target.value })}
                />
              </p>
              <p>
                <a href={process.env.REACT_APP_LOGIN}>
                  <button
                    className="navButton"
                    onClick={() => this.handleLogin()}
                  >
                    Login
                  </button>
                </a>
              </p>
            </div>
          )}
        </div>
      </HashRouter>
    );
  }
}
