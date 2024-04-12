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
      console.log("Username: ", user.username)
      const res = username
        ? await axios.get("http://localhost:8800/api/posts/profile/" + user.username)
        : await axios.get("http://localhost:8800/api/posts/timeline/" + user.id);
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
  
    console.log("posts: ", posts)
    setPosts(updatedPosts);
  };
  

  return (
    <div className="feed">
      <div className="feedWrapper">
        {(!username || username === user.username) && <Share />}
        {posts.map((p) => (
          <Post key={p.id} post={p} onUpdate={updatePosts} />
        ))}
      </div>
    </div>
  );
}
