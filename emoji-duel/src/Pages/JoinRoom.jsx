import React, { useState } from "react";
import { ref, get, update } from "firebase/database";
import database from "../firebase";
import "./JoinRoom.css";

function JoinRoom({ onJoinSuccess }) {
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  const handleJoinRoom = async () => {
    if (!nickname || !roomCode) {
      setError("Please enter both fields.");
      return;
    }

    const roomRef = ref(database, "rooms/" + roomCode.toUpperCase());

    try {
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        if (roomData.player2) {
          setError("Room is full.");
        } else {
          await update(roomRef, { player2: nickname });
          onJoinSuccess(nickname, roomCode.toUpperCase());
        }
      } else {
        setError("Room not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <div className="join-container">
      <h1 className="title">Emoji Duel⚔️</h1>

      <div className="inputs">
      <input
        type="text"
        placeholder="Enter your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="input"
      />
      <input
        type="text"
        placeholder="Enter room code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        className="input"
      />
      </div>

      {error && <p className="error">{error}</p>}

      <button onClick={handleJoinRoom} className="btn join-btn">
        Join Game!
      </button>
    </div>
  );
}

export default JoinRoom;