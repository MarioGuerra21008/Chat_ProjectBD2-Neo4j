import "./message.css";
import { format } from "timeago.js";
import React, {useEffect, useState} from "react";
import axios from "axios";

export default function Message({ message, own, currentUser}) {

  const [user, setUser] = useState(null);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios("/users?userId=" + message.sender);
        console.log("usuario: ", res.data)
        setUser(res.data);
      } catch (error) {
        console.error("Error al obtener la información del usuario:", error);
      }
    };

    fetchUser();
  }, [currentUser, message]);

  

  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        <img
          className="messageImg"
          src={
            user?.profilePicture
            ? user.profilePicture
            : PF + "person/noAvatar.png"
          }
          alt=""
        />
        <p className="messageText">{message.text}</p>
      </div>
      <div className="messageBottom">{format(message.createdAt)}</div>
    </div>
  );
}