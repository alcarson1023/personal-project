import React, { Component } from "react";
// import App from '../App.js'

import "../App.css";
import "../reset.css";
// import routes from '../routes'
import axios from "axios";

// import { HashRouter, Link } from 'react-router-dom'

export default class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playlistsNum: 12, //filler text during creation. Remove later.
      totalHours: 238, //filler text during creation. Remove later.
      token: "", //The input field for Spotify's verficiation string. I need to connect Sessions so that they can stay logged in.
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
      albumCover: "",
      saving: false,
      playlists: []
    };
    this.playerCheckInterval = null; //constantly runs my checkForPlayer method until it hits something.
    this.handleLogin = this.handleLogin.bind(this);
  }

  componentDidMount() {
    console.log("ComponentDidMount");
    //sign users in if possible
    this.setState({ token: window.localStorage.getItem("Spotify key") });
    setTimeout(() => this.handleLogin(), 500);

    //get a list of playlists ready to go
    axios.get("/api/all_playlists").then(response => {
      this.setState({ playlists: response.data });
      console.log("All playlists: ", response.data);
    });
  }

  handleLogin() {
    if (this.state.token !== "") {
      this.setState({ loggedIn: true });
      this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 2500); //Set the playerCheck timer once the button is clicked.
      window.localStorage.setItem("Spotify key", this.state.token);
    }
  }

  checkForPlayer() {
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

      //Learning about how Spotify gives data
      console.log("Current track: ", currentTrack); //testing
      console.log("Artist name: ", currentTrack.artists[0]);
      console.log("Artist name: ", currentTrack.artists[0].name);
      //Learning about how Spotify gives data

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

  saveSong(playlist) {
    let data = {
      trackName: this.state.trackName,
      albumName: this.state.albumName,
      artistName: this.state.artistName,
      albumCover: this.state.albumCover,
      playlist: playlist
    };
    axios
      .post("/api/test", data)
      .then(response => console.log("Song Saved! Song data: ", data));
    this.setState({ saving: false });
  }

  //button clicks---------
  onPrevClick() {
    this.player.previousTrack();
  }
  onPlayClick() {
    this.player.togglePlay();
  }
  onNextClick() {
    this.player.nextTrack();
  }
  //button clicks---------
  render() {
    const {
      //makes the player work
      // token,
      // loggedIn,
      artistName,
      trackName,
      albumName,
      // error,
      // position,
      // duration,
      playing,
      albumCover
    } = this.state;

    const saveOptions = this.state.playlists.map(playlist => {
      return (
        //loads the options when saving a song.
        <button
          className="button"
          onClick={() => this.saveSong(playlist.playlistname)}
        >
          {playlist.playlistname}
        </button>
        // console.log(playlist.playlistname)
      );
    });

    return (
      <div className="nowPlaying">
        {trackName !== "Track Name" ? (
          <div>
            <img
              src={albumCover}
              alt="https://s3.amazonaws.com/finecooking.s3.tauntonclud.com/app/uploads/2017/04/24170813/ING-chicken-stock-main.jpg"
            />
            <p>Artist: {artistName}</p>
            <p>Track: {trackName}</p>
            <p>Album: {albumName}</p>
            <button className="button" onClick={() => this.onPrevClick()}>
              Previous
            </button>
            <button className="button" onClick={() => this.onPlayClick()}>
              {playing ? "Pause" : "Play"}
            </button>{" "}
            {/*If playing is true, button says pause. Otherwise, it says play*/}
            <button className="button" onClick={() => this.onNextClick()}>
              Next
            </button>
            <div>
              {this.state.saving === true ? (
                saveOptions
              ) : (
                <button
                  className="button"
                  onClick={() => this.setState({ saving: true })}
                >
                  Save song
                </button>
              )}
            </div>
          </div>
        ) : (
          <p>Play a song!</p>
        )}
      </div>
    );
  }
}
