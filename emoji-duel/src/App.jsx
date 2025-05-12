import React, { useState } from "react";
import Home from "./Pages/Home";
import JoinRoom from "./Pages/JoinRoom";
import CreateRoom from "./Pages/CreateRoom";
import Lobby from "./Pages/Lobby";
import Game from "./Pages/Game";
import "./App.css";

function App() {
  const [screen, setScreen] = useState("home");
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleJoin = () => setScreen("join");

  const handleCreate = (name) => {
    setNickname(name);
    setScreen("create");
  };

  const handleJoinSuccess = (name, code) => {
    setNickname(name);
    setRoomCode(code);
    setScreen("lobby");
  };

  const handleGameStart = () => {
    setScreen("game");
  };

  if (screen === "home") {
    return <Home onJoin={handleJoin} onCreate={handleCreate} />;
  }

  if (screen === "join") {
    return <JoinRoom onJoinSuccess={handleJoinSuccess} />;
  }

  if (screen === "create") {
    return (
      <CreateRoom
        nickname={nickname}
        onLobbyEnter={(name, code) => {
          setNickname(name);
          setRoomCode(code);
          setScreen("lobby");
        }}
      />
    );
  }

  if (screen === "lobby") {
    return (
      <Lobby
        nickname={nickname}
        roomId={roomCode}
        onGameStart={handleGameStart}
      />
    );
  }

  if (screen === "game") {
    return <Game nickname={nickname} roomCode={roomCode} />;
  }

  return null;
}

export default App;
