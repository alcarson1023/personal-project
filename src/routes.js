import React from "react";
import { Switch, Route } from "react-router-dom";

import HomePage from "./components/HomePage";
import Search from "./components/Search";
import Playlist from "./components/Playlist";
import Player from "./components/Player";

export default (
  <Switch>
    <Route component={HomePage} exact path="/" />
    <Route component={Search} path="/search" />
    <Route component={Playlist} path="/playlist" />
    <Route component={Player} path="/player" />
  </Switch>
);
