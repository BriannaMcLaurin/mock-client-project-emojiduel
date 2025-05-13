import React, { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import database from "../firebase";

function Lobby({ nickname, roomId, onGameStart }) {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [emojiCategory, setEmojiCategory] = useState("random");

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomId}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setPlayer1(data.player1 || "");
      setPlayer2(data.player2 || "");
      setEmojiCategory(data.emojiCategory || "random");

      // go to game if status is "started"
      if (data.status === "started") {
        onGameStart(); // triggers screen change in App.jsx
      }

      // player 1 starts the game when both players are present
      if (
        data.player1 &&
        data.player2 &&
        data.status !== "started" &&
        nickname === data.player1
      ) {
        update(roomRef, { status: "started" });
      }
    });

    return () => unsubscribe();
  }, [roomId, nickname, onGameStart]);

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Emoji Duel Lobby</h1>
      <h2>Room Code: {roomId}</h2>

      <div className="players-list">
        <p><strong>Player 1:</strong> {player1 || "Waiting..."}</p>
        <p><strong>Player 2:</strong> {player2 || "Waiting..."}</p>
      </div>

      <div className="category-info">
        <p><strong>Emoji Category:</strong> {emojiCategory}</p>
      </div>

      <p className="waiting-msg">Waiting for both players to join...</p>
    </div>
  );
}

export default Lobby;
