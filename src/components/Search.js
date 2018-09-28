import React, { Component } from "react";
import axios from "axios";

export default class Playlist extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: "",
      searchResults: [],
      playlists: [],
      searchType: "track",
      searchOffset: 0,
      saving: false,
      savingAlbum: "",
      savingArtist: "",
      savingSong: "",
      savingAlbumCover: "",
      hipsterSetting: false
    };
    this.runSearch = this.runSearch.bind(this);
  }

  componentDidMount() {
    //get a list of playlists ready to go
    axios.get("/api/all_playlists").then(response => {
      this.setState({ playlists: response.data });
      console.log("All playlists: ", response.data);
    });
  }

  testFeature() {}

  offset(offset) {
    if (offset === "next") {
      this.setState(
        { searchOffset: this.state.searchOffset + 15 },
        this.runSearch
      );
    } else if (offset === "prev" && this.state.searchOffset >= 15) {
      this.setState(
        { searchOffset: this.state.searchOffset - 15 },
        this.runSearch
      );
    }
  }

  async runSearch() {
    const token = window.localStorage.getItem("Spotify key");
    const headers = { Authorization: `Bearer ${token}` };
    await axios
      .get(
        `https://api.spotify.com/v1/search?q=${this.state.searchTerm}&type=${
          this.state.searchType
        }&limit=15&offset=${this.state.searchOffset}`,
        {
          headers: headers
        }
      )
      .then(
        response => {
          console.log("Success!", response.data); //console.log the response
          this.setState({ searchResults: response.data.tracks.items }); //make the response usable elsewhere
        },
        error => console.log("Houston, we have a problem...", error)
      );
  }

  saveSong(albumCover, album, artist, song, playlist) {
    let data = {
      trackName: song,
      albumName: album,
      artistName: artist,
      albumCover: albumCover,
      playlist: playlist
    };
    axios
      .post("/api/test", data)
      .then(response => console.log("Song Saved! Song data: ", data));
    this.setState({ saving: false });
  }

  render() {
    console.log(this.state);
    const saveOptions = this.state.playlists.map(playlist => {
      return (
        //loads the options when saving a song.
        <button
          className="button"
          onClick={() =>
            this.saveSong(
              this.state.savingAlbumCover,
              this.state.savingAlbum,
              this.state.savingArtist,
              this.state.savingSong,
              playlist.playlistname
            )
          }
        >
          {playlist.playlistname}
        </button>
        // console.log(playlist.playlistname)
      );
    });

    const { searchResults } = this.state;
    const allResults = searchResults.map(song => {
      return (
        <div className="playlistSingleBox">
          <img
            className="albumCover"
            // src={this.state.searchResults[0].album.images[0].url}
            src={song.album.images[0].url}
          />
          <p className="needsSpace">Artist: {song.album.artists[0].name}</p>
          <p className="needsSpace">Album: {song.album.name}</p>
          <p className="needsSpace">Name: {song.name}</p>
          <div>
            {this.state.saving === song ? (
              saveOptions
            ) : (
              <button
                className="button"
                onClick={() => {
                  this.setState({ saving: song });
                  this.setState({ savingSong: song.name });
                  this.setState({ savingAlbumCover: song.album.images[0].url });
                  this.setState({ savingArtist: song.album.artists[0].name });
                  this.setState({ savingAbum: song.album.name });
                }}
              >
                Save
              </button>
            )}
          </div>
        </div>
      );
    });
    return (
      <div>
        <div className="playlist">
          {/* <img alt="https://s3.amazonaws.com/finecooking.s3.tauntonclud.com/app/uploads/2017/04/24170813/ING-chicken-stock-main.jpg" /> */}
          {/* <p>The 19X0's</p> */}
          <p>This is a page for searching for songs!</p>
          {/* <button className="button" onClick={() => this.testFeature()}>
            THE BUTTON OF MANY TESTS
          </button> */}
          <br />
          <input
            className="loginInput"
            type="text"
            onChange={e => this.setState({ searchTerm: e.target.value })}
          />
          <br />
          <button className="button" onClick={() => this.runSearch()}>
            Search!
          </button>
          <button className="button" onClick={() => this.offset("prev")}>
            {" "}
            Prev{" "}
          </button>
          <button className="button" onClick={() => this.offset("next")}>
            {" "}
            Next{" "}
          </button>
        </div>
        {this.state.searchResults.length !== 0 ? (
          <div>
            {/* <img src={this.state.searchResults[0].album.images[0].url} /> */}
            <div className="playlistBigBox">{allResults}</div>
          </div>
        ) : (
          <div />
        )}
      </div>
    );
  }
}
