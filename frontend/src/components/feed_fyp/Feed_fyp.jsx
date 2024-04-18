import { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed_fyp.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import React from "react";

export default function FeedFYP({ username }) {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);
  
  const hobbiesDict = {
    "Hobby_0": "Deportes",
    "Hobby_1": "Musica",
    "Hobby_2": "Entretenimiento",
    "Hobby_3": "Farandula",
    "Hobby_4": "Cocina",
    "Hobby_5": "Arte",
    "Hobby_6": "Videojuegos",
    "Hobby_7": "Peliculas",
    "Hobby_8": "Tecnología",
    "Hobby_9": "Ciencia"
  };
  
  useEffect(() => {
    const fetchPosts = async () => {
      console.log("Username: ", user.Username)

      const res = username
        ? await axios.get("http://localhost:8800/api/posts/profile/" + user.Username)
        : await axios.get("http://localhost:8800/api/posts/timeline2/" + user.ID);
      setPosts(
        res.data.sort((p1, p2) => {
          return new Date(p2.createdAt) - new Date(p1.createdAt);
        })
      );

      
    };
    
    fetchPosts();
    
  }, [user.username, user.id]);



  const updatePosts = (postId, operationType, updatedPost = null) => {
    let updatedPosts;
  
    if (operationType === 'delete') {
      updatedPosts = posts.filter((post) => post.id !== postId);
    } else if (operationType === 'update' && updatedPost) {
      updatedPosts = posts.map((post) =>
        post.id === postId ? updatedPost : post
      );
      window.location.reload();
    } else {
      console.error('Operación no válida');
      return;
    }
  
    setPosts(updatedPosts);
    
    console.log("posts: ", posts)
    
  };
  



  return (
    <div className="feed">
      <div className="feedWrapper">
        <div className="titulo">
          <h1>Te recomendamos estos posts por tu gusto por {hobbiesDict[user.Hobby]}</h1>
          
          
        </div>
        {posts.map((p) => (
          <Post key={p.id} post={p} onUpdate={updatePosts} />
        ))}
      </div>
    </div>
  );
}
