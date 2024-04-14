import "./Messenger.css"
import React,{useContext, useEffect, useState, useRef} from "react"
import axios from "axios"
import ChatOnline from "../../components/chatOnline/ChatOnline"
import Conversation from "../../components/conversations/Conversation"
import { AuthContext } from "../../context/AuthContext"
import Message from "../../components/message/message"
import Topbar from "../../components/topbar/Topbar"

export default function Messenger(){
    
    const [conversations, setConversations] = useState([]);
    const { user } = useContext(AuthContext);
    const [currentChat, setCurrentChat] = useState(null);
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef();

    useEffect(() => {
        const getConversations = async () => {
          try {
            const res = await axios.get("http://localhost:8800/api/conversations/" + user.id);
            setConversations(res.data);
          } catch (err) {
            console.log("xd",err);
          }
        };
        getConversations();
      }, [user.id]);

    useEffect(() => {
        arrivalMessage &&
          currentChat?.members.includes(arrivalMessage.sender) &&
          setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
        const getMessages = async () => {
          try {
            const res = await axios.get("http://localhost:8800/api/messages/" + currentChat?._id);
            setMessages(res.data);
          } catch (err) {
            console.log(err);
          }
        };
        getMessages();
    }, [currentChat]);

    

    const handleSubmit = async (e) => {
      e.preventDefault();
      const message = {
        sender: user._id,
        text: newMessage,
        conversationId: currentChat._id,
      };
  
      const receiverId = currentChat.members.find(
        (member) => member !== user._id
      );
  
     
  
      try {
        const res = await axios.post("/messages", message);
        setMessages([...messages, res.data]);
        setNewMessage("");
      } catch (err) {
        console.log(err);
      }
    };

    return(
      <><Topbar /><div className="messenger">
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
            {currentChat ? (
              <>
                <div className="chatBoxTop">
                  {messages.map((m) => (
                    <div ref={scrollRef}>
                      <Message message={m} own={m.sender === user.id} currentUser={user} />
                    </div>
                  ))}
                </div>
                <div className="chatBoxBottom">
                  <textarea
                    className="chatMessageInput"
                    placeholder="write something..."
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></textarea>
                  <button className="chatSubmitButton" onClick={handleSubmit}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                Open a conversation to start a chat.
              </span>
            )}
          </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
            hola
          </div>
        </div>
      </div></>
    )

}