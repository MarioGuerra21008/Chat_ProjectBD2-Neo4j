import { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import React from "react";

export default function Feed({ username }) {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = username
        ? await axios.get("/posts/profile/" + username)
        : await axios.get("/posts/timeline/" + user._id);
      setPosts(
        res.data.sort((p1, p2) => {
          return new Date(p2.createdAt) - new Date(p1.createdAt);
        })
      );
    };
    fetchPosts();
  }, [username, user._id]);

  const updatePosts = (postId, operationType, updatedPost = null) => {
    let updatedPosts;
  
    if (operationType === 'delete') {
      updatedPosts = posts.filter((post) => post._id !== postId);
    } else if (operationType === 'update' && updatedPost) {
      updatedPosts = posts.map((post) =>
        post._id === postId ? updatedPost : post
      );
      window.location.reload();
    } else {
      console.error('Operación no válida');
      return;
    }
  
    setPosts(updatedPosts);
  };
  

  return (
    <div className="feed">
      <div className="feedWrapper">
        {(!username || username === user.username) && <Share />}
        {posts.map((p) => (
          <Post key={p._id} post={p} onUpdate={updatePosts} />
        ))}
      </div>
    </div>
  );
}
