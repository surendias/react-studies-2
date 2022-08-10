import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Picker from "emoji-picker-react";
const backend_url = "http://localhost:5000";
// const backend_url = "https://chat-app-backend-100822.herokuapp.com/";
const socket = io(backend_url);

function App() {
  const [socketId, setSocketId] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [room, setRoom] = useState("");
  const [chat, setChat] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  //Emoji

  const onEmojiClick = (event, emojiObject) => {
    setMessage(message + emojiObject.emoji);
  };
  // scroll
  const chatContainer = useRef(null);

  useEffect(() => {
    socket.on("me", (id) => {
      setSocketId(id);
    });

    socket.on("disconnect", () => {
      socket.disconnect();
    });

    socket.on("getAllUsers", (users) => {
      setUsers(users);
    });
    // Real time
    socket.on("updateUsers", (users) => {
      setUsers(users);
    });

    socket.on("getAllRooms", (rooms) => {
      setRooms(rooms);
    });
    // Real time
    socket.on("updateRooms", (rooms) => {
      setRooms(rooms);
    });

    // Rooms

    socket.on("chat", (payload) => {
      setChat(payload.chat);
    });

    if (joinedRoom === true) {
      chatContainer.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [chat, rooms]);

  const sendMessage = async () => {
    const payload = { message, room, socketId };
    socket.emit("message", payload);

    setMessage("");
    socket.on("chat", (payloadd) => {
      setChat(payloadd.chat);
      // console.log(payloadd.chat);
      console.log(payloadd);
    });
    chatContainer.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
    setShowEmoji(false);
  };

  const createRoom = () => {
    socket.emit("create_room");
    socket.on("get_room", (room) => {
      setRooms([...rooms, room]);
    });
  };

  const joinRoom = (room) => {
    socket.emit("join_room", room);
    setRoom(room.id);
    setJoinedRoom(true);
    //
    setChat(room.chat);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            Annonymous Chat App
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/">
                  Home
                </a>
              </li>
            </ul>
            <span className="navbar-text float-end">Me: {socketId}</span>
          </div>
        </div>
      </nav>
      <div className="container">
        <div className="row">
          <div className="col">
            <div className="alert alert-warning" role="alert">
              {joinedRoom === true
                ? `Room: ${room}`
                : "You are not joined in any room"}
            </div>
          </div>
        </div>
        {!joinedRoom && (
          <div className="row">
            <div className="col">
              <div className="card">
                <div className="card-header">Online Users:</div>
                <div className="card-body">
                  <ul className="users">
                    {users.map((user) => {
                      return (
                        <li className="user" key={user}>
                          {user && user === socketId ? `*ME*` : user}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card">
                <div className="card-header">Available Rooms:</div>
                <div className="card-body">
                  {rooms.length === 0 ? (
                    <h3 className="no_rooms">No Rooms! Create a room !</h3>
                  ) : (
                    <ul className="rooms">
                      {rooms.map((room) => {
                        return (
                          <li
                            className="link-primary"
                            key={room.id}
                            onClick={() => joinRoom(room)}
                          >
                            {room.id}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div className="card-footer">
                  <button
                    className="btn btn-success float-end"
                    onClick={() => createRoom()}
                  >
                    Create Room
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {joinedRoom && (
          <>
            <div className="row">
              <div className="col">
                <ul
                  className="chat-list"
                  style={{ "list-style": "none" }}
                  id="chat-list"
                  ref={chatContainer}
                >
                  {chat.map((chat, idx) => (
                    <li
                      key={idx}
                      className={
                        chat.writer === socketId
                          ? "chat-me text-end"
                          : "chat-user text-start"
                      }
                    >
                      {chat.writer === socketId ? (
                        <h3>
                          Me:{" "}
                          <span class="badge text-bg-light">
                            {chat.message}
                          </span>
                        </h3>
                      ) : (
                        <h4>
                          {chat.writer.slice(0, 5)}:{" "}
                          <span class="badge text-bg-dark">{chat.message}</span>
                        </h4>
                      )}
                      <hr />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <form
                  className="chat-form"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="row mb-2">
                    <div className="col">
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Your message ..."
                        autoFocus
                        onChange={(e) => {
                          setMessage(e.target.value);
                        }}
                        value={message}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <div className="float-end">
                        <button
                          className="btn btn-info"
                          type="button"
                          onClick={() => setShowEmoji(!showEmoji)}
                          style={{ "margin-right": "5px" }}
                        >
                          Emoji
                        </button>
                        <button
                          className="btn btn-primary"
                          type="submit"
                          onClick={() => sendMessage()}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                {showEmoji && (
                  <Picker
                    onEmojiClick={onEmojiClick}
                    pickerStyle={{
                      width: "20%",
                      display: "absolute",
                      left: "0",
                      bottom: "270px",
                      backgroundColor: "#fff",
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
