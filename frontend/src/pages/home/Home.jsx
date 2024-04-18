import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import FeedFYP from "../../components/feed_fyp/Feed_fyp";
import Rightbar from "../../components/rightbar/Rightbar";
import "./home.css"
import React from "react";

export default function Home() {
  return (
    <>
      <Topbar />
      <div className="homeContainer">
        <Sidebar />
        <Feed/>
        <Rightbar/>
      </div>
    </>
  );
}
