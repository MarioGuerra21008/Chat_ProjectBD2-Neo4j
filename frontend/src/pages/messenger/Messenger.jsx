import "./Messenger.css"
import React,{useContext, useEffect, useState} from "react"
import axios from "axios"
import ChatOnline from "../../components/chatOnline/ChatOnline"
import Conversation from "../../components/conversations/Conversation"
import { AuthContext } from "../../context/AuthContext"

export default function Messenger(){
    
    const [conversations, setConversations] = useState([]);
    const { user } = useContext(AuthContext);
    const [currentChat, setCurrentChat] = useState(null);

    useEffect(() => {
        const getConversations = async () => {
          try {
            const res = await axios.get("/conversations/" + user._id);
            setConversations(res.data);
            console.log("Conversations: ", conversations);
          } catch (err) {
            console.log("xd",err);
          }
        };
        getConversations();
      }, [user._id]);

    return(
        <div className="messenger">
           <div className="chatMenu">
                <div className="chatMenuWrapper">
                    <input placeholder="Search for friends" className="chatMenuInput" />
                    {conversations.map((c) => (
                        <div onClick={() => setCurrentChat(c)}>
                            <Conversation conversation={c} currentUser={user} />
                        </div>
                    ))}
                </div>
           </div>
           <div className="chatBox">
                <div className="chatBoxWrapper">
                    body
                </div>
           </div>
           <div className="chatOnline">
                <div className="chatOnlineWrapper">
                    online
                </div>
           </div>
           
        </div>
    )

}