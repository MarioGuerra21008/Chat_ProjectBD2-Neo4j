import Home from "./pages/home/Home";
import HomeFYP from "./pages/home_fyp/Home_fyp";
import Login from "./pages/login/Login";
import Profile from "./pages/profile/Profile";
import Register from "./pages/register/Register";
import Messenger from "./pages/messenger/Messenger";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import React from "react";

function App() {
  const { user } = useContext(AuthContext);
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          {user ? <Home /> : <Register />}
        </Route>
        <Route path="/login">{user ? <Redirect to="/" /> : <Login />}</Route>
        <Route path="/register">
          {user ? <Redirect to="/" /> : <Register />}
        </Route>
        
        <Route path="/messenger">
          {!user ? <Redirect to="/" /> : <Messenger/>}
        </Route>

        <Route path="/fyp/">
          <HomeFYP />
        </Route>

        <Route path="/profile/:Username">
          <Profile  />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
