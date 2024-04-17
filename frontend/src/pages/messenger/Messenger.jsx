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
        arrivalMessage &&
          currentChat?.members.includes(arrivalMessage.sender) &&
          setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
      const getConversations = async () => {
        console.log("user: ", user);
        try {
          const res = await axios.get(`http://localhost:8800/api/conversations/${user.ID}`);
          setConversations(res.data);
          console.log("res.data: ", res.data);
          // Automatically set the first conversation as the current chat if not already set
          if (res.data.length > 0 && !currentChat) {
            setCurrentChat(res.data[0]);
          }
        } catch (err) {
          console.log("Error loading conversations", err);
        }
      };
  
      if (user.ID) {
        getConversations();
      }
  
    }, [user.ID]);
  
    useEffect(() => {
      const getMessages = async () => {
        console.log("Current chat: ", currentChat);
        if (currentChat && currentChat.ID) {
          
          try {
            const res = await axios.get(`http://localhost:8800/api/messages/${currentChat.ID}`);
            setMessages(res.data);
            console.log("Res.data(messages): ", res.data);
          } catch (err) {
            console.log("Error loading messages", err);
          }
        }
      };
  
      if (currentChat) {
        getMessages();
      }
  
    }, [currentChat]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      const message = {
        sender: user.ID,
        text: newMessage,
        conversationId: currentChat.ID,
      };
  
      try {
        const res = await axios.post("http://localhost:8800/api/messages", message);
        setMessages([...messages, res.data]);
        setNewMessage("");
      } catch (err) {
        console.log(err);
      }

      window.location.reload();
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
                      <Message message={m} own={m.sender === user.ID} currentUser={user} />
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