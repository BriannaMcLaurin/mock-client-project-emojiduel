import React, { useEffect, useState } from "react";
import { ref, set, onValue } from "firebase/database";
import database from "../firebase";
import "./CreateRoom.css";

function CreateRoom({ nickname, onLobbyEnter }) {
  const [roomCode, setRoomCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState("random");

  const generateRoomCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  useEffect(() => {
    const code = generateRoomCode();
    setRoomCode(code);

    const roomRef = ref(database, "rooms/" + code);
    set(roomRef, {
      player1: nickname,
      status: "waiting",
      createdAt: Date.now(),
      round: 1,
      score: {
        player1: 0,
        player2: 0,
      },
      emojiCategory: emojiCategory,
    });

    // Listen for player2
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.player2) {
        onLobbyEnter(nickname, code);
      }
    });
  }, [nickname, onLobbyEnter, emojiCategory]);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="create-container">
      <h1 className="title1">Emoji Duel</h1>
      <p className="subtitle">Room Code:</p>
      <h2 className="room-code">{roomCode}</h2>

      <button className="btn copy-btn" onClick={handleCopy}>
        {copied ? "Copied!" : "Copy Room Code"}
      </button>

      <div className="category-select">
        <label>Select Emoji Category:</label>
        <select
          value={emojiCategory}
          onChange={(e) => setEmojiCategory(e.target.value)}
        >
          <option value="random">🎮 Random</option>
          <option value="food">🍕 Food</option>
          <option value="animals">🐶 Animals</option>
          <option value="faces">😂 Faces</option>
        </select>
      </div>

      <p className="waiting-msg">Waiting for Player 2 to join...</p>
    </div>
  );
}

export default CreateRoom;
