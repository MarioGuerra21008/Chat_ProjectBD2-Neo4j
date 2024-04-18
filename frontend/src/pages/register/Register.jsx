import axios from "axios";
import { useRef } from "react";
import "./register.css";
import { useHistory } from "react-router";
import React from "react";

export default function Register() {
  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();
  const history = useHistory();

  const handleClick = async () => {

    if (passwordAgain.current.value !== password.current.value) {
      passwordAgain.current.setCustomValidity("Passwords don't match!");
    } else {
      const user = {
        username: username.current.value,
        email: email.current.value,
        password: password.current.value,
      };
      try {
        console.log("User: ", user)
        await axios.post("http://localhost:8800/api/auth/register", user);
        history.push("/login");
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleAdminClick = async () => {

    if (passwordAgain.current.value !== password.current.value) {
      passwordAgain.current.setCustomValidity("Passwords don't match!");
    } else {
      const admin = {
        username: username.current.value,
        email: email.current.value,
        password: password.current.value,
        admin: true, // Asumiendo que el backend procesa este campo para registrar admins
      };
      try {
        console.log("Admin: ", admin)
        await axios.post("http://localhost:8800/api/auth/register/admin", admin); // Asumiendo una ruta específica para registro de admin
        history.push("/login"); // Asumiendo que existe una ruta de dashboard de admin
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleLoginClick = () => {
    history.push("/login");
  };

  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">tilinesbook</h3>
          <span className="loginDesc">
            Conecta con tus amigos alrededor del mundo
          </span>
        </div>
        <div className="loginRight">
          <form className="loginBox" onSubmit={(e) => e.preventDefault()}>
            <input
              placeholder="Username"
              required
              ref={username}
              className="loginInput"
            />
            <input
              placeholder="Email"
              required
              ref={email}
              className="loginInput"
              type="email"
            />
            <input
              placeholder="Password"
              required
              ref={password}
              className="loginInput"
              type="password"
              minLength="6"
            />
            <input
              placeholder="Password Again"
              required
              ref={passwordAgain}
              className="loginInput"
              type="password"
            />
            <button className="loginButton" onClick={handleClick}>
              Sign Up
            </button>
            <button className="loginButton" onClick={handleAdminClick}>
              Sign Up Admin
            </button>
            <button className="loginRegisterButton" onClick={handleLoginClick}>
              Log into Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
