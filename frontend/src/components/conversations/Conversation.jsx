import axios from "axios";
import { useEffect, useState } from "react";
import "./conversation.css";
import React from "react";

export default function Conversation({ conversation, currentUser }) {
  const [user, setUser] = useState(null);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  //console.log("Perfil del usuario: ", currentUser);
  //console.log("Perfil del usuario: ", conversation);
  
  useEffect(() => {
    const getFriendId = async () => {
      try {
        const res = await axios.get(`http://localhost:8800/api/conversations/${currentUser.ID}/${conversation.ID}`);
        const friendId = res.data.friendId;
        // Ahora obtener los detalles del amigo
        const userDetails = await axios.get(`http://localhost:8800/api/users?userId=${friendId}`);
        setUser(userDetails.data);
      } catch (err) {
        console.log(err);
      }
    };
  
    getFriendId();
  }, [currentUser, conversation]);
  

  return (
    <div className="conversation">
      <img
        className="conversationImg"
        src={
          user?.profilePicture
            ? user.profilePicture
            : PF + "person/noAvatar.png"
        }
        alt=""
      />
      <span className="conversationName">{user?.username}</span>
    </div>
  );
}