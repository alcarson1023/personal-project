import React, { Component } from "react";
// import {Link} from 'react-router-dom'
// import {Switch, Route, HashRouter} from 'react-router-dom'
import axios from "axios";
{
  /* <link rel="stylesheet" href="https://rawgit.com/enyo/dropzone/master/dist/dropzone.css"> */
}
{
  /* <script src="https://rawgit.com/enyo/dropzone/master/dist/dropzone.js"></script> */
}

export default class Playlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: [], //songs in a playlist
      playlists: [], //playlists to choose from
      currentPlaylist: "", //playlist currently being viewed
      editing: false, //switches playlist to edit mode
      imageInput: "",
      playlistNewName: "",
      playlistOldName: ""
    };
  }

  componentDidMount() {
    //GETTING ALL PLAYLISTS
    axios.get("/api/all_playlists").then(response => {
      this.setState({ playlists: response.data });
      console.log("All playlists: ", response.data);
    });
  }

  selectPlaylist(playlistname) {
    axios.get(`/api/one_playlist/${playlistname}`).then(response => {
      this.setState({ response: response.data });
      this.setState({ currentPlaylist: playlistname });
    });
    console.log(this.state.response);
  }

  editPlaylist(playlistOldName) {
    let data = {
      playlistname: this.state.playlistNewName,
      playlistimage: this.state.imageInput,
      oldname: playlistOldName
    };
    axios
      .post("/api/replace", data)
      .then(response => {
        this.setState({ playlists: response.data });
      })
      .then(this.setState({ editing: false }));
  }

  testButton() {}
  goBack() {
    this.setState({ response: [] });
  }

  deleteSong(trackname, playlistname) {
    axios
      .delete(`/api/test/${trackname}`) //deletes the song
      .then(() => this.selectPlaylist(this.state.currentPlaylist)); //reloads the playlist
  }

  render() {
    const { response, playlists } = this.state;
    const songs = response.map(song => {
      return (
        <div className="playlistSingleBox">
          <img className="albumCover" src={song.albumcover} alt="Album Cover" />
          <p class="needsSpace">Song Title: {song.trackname}</p>
          <p class="needsSpace">Artist: {song.artistname}</p>
          <p class="needsSpace">Album Name: {song.albumname}</p>
          <button
            class="needsSpace button"
            onClick={() => this.deleteSong(song.id)}
          >
            Delete
          </button>
        </div>
      );
    });
    const renderPlaylists = playlists.map(renderPlaylist => {
      return (
        <div className="playlistSingleBox">
          {this.state.editing !== renderPlaylist ? (
            // {this.state.editing === false ? (
            <div>
              <img
                className="albumCover"
                src={renderPlaylist.playlistimage}
                alt="Album Cover"
              />
              <p className="needsSpace">{renderPlaylist.playlistname}</p>
              {console.log("Playlist name: ", renderPlaylist)}
              <button
                className="needsSpace button"
                onClick={() => this.selectPlaylist(renderPlaylist.playlistname)}
              >
                Select
              </button>
              <button
                className="button"
                onClick={() => {
                  this.setState({ editing: renderPlaylist }),
                    this.setState({ imageInput: renderPlaylist.playlistimage }),
                    this.setState({
                      playlistNewName: renderPlaylist.playlistname
                    });
                }}
              >
                Edit
              </button>
            </div>
          ) : this.state.editing === renderPlaylist ? (
            <div>
              <img
                className="needsSpace"
                className="albumCover"
                src={renderPlaylist.playlistimage}
                alt="Album Cover"
              />
              <form action="/action_page.php">
                <p>Playlist image: </p>
                <input
                  onChange={e => this.setState({ imageInput: e.target.value })}
                  className="needsSpace"
                  type="text"
                  name="Image URL"
                  value={this.state.imageInput}
                />
                <br />
                <p>Playlist name: </p>
                <input
                  onChange={e =>
                    this.setState({ playlistNewName: e.target.value })
                  }
                  className="needsSpace"
                  type="text"
                  name="Playlist name"
                  value={this.state.playlistNewName}
                />
                <br />
              </form>
              <button
                className="button"
                onClick={() => {
                  this.editPlaylist(renderPlaylist.playlistname);
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <p>not editing</p>
          )}
        </div>
        //<button class='needsSpace'class='button' onClick={()=> this.deleteSong(song.id)}>Delete</button> */}
      );
    });
    console.log("state", this.state.response);
    return (
      <div className="playlist">
        {/* <img alt="https://s3.amazonaws.com/finecooking.s3.tauntonclud.com/app/uploads/2017/04/24170813/ING-chicken-stock-main.jpg" /> */}
        {/* <p>The 19X0's</p>
        <button className="button" onClick={() => this.testButton()}>
          PULL THE SWITCH!!
        </button> */}
        {response.length !== 0 ? (
          <div>
            <button className="button" onClick={() => this.goBack()}>
              Back
            </button>
            <div className="playlistBigBox"> {songs} </div>
          </div>
        ) : playlists.length !== 0 ? (
          <div className="playlistBigBoxPlaylist">{renderPlaylists}</div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
  }
}
