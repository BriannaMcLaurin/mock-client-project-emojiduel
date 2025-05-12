import React, { useEffect, useState } from "react";
import { ref, update, onValue } from "firebase/database";
import database from "../firebase";
import "./Game.css";

const EMOJIS = ["🔥", "🎯", "💥", "🍀", "⚡", "👀", "🎉", "😎", "🍕", "🚀"];

function Game({ nickname, roomCode }) {
  const [targetEmoji, setTargetEmoji] = useState("");
  const [emojiOptions, setEmojiOptions] = useState([]);
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [tapped, setTapped] = useState(false);
  const [status, setStatus] = useState("waiting");
  const [winner, setWinner] = useState("");
  const [playerRole, setPlayerRole] = useState("");

  // Generate emoji buttons
  const generateEmojis = (correct) => {
    const shuffled = EMOJIS.filter(e => e !== correct).sort(() => 0.5 - Math.random());
    const choices = [...shuffled.slice(0, 3), correct].sort(() => 0.5 - Math.random());
    return choices;
  };

  // Start round by updating Firebase with new emoji and clearing previous tap
  const startRound = () => {
    const chosen = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const choices = generateEmojis(chosen);
    setTargetEmoji(chosen);
    setEmojiOptions(choices);
    setTapped(false);

    update(ref(database, "rooms/" + roomCode), {
      emoji: chosen,
      roundStatus: "active",
      lastTap: null,
      choices: choices,
    });
  };

  const handleTap = (emoji) => {
    if (tapped || status !== "active" || emoji !== targetEmoji) return;

    setTapped(true);

    update(ref(database, "rooms/" + roomCode), {
      lastTap: {
        by: nickname,
        at: Date.now(),
      },
      roundStatus: "tapped",
    });
  };

  useEffect(() => {
    const roomRef = ref(database, "rooms/" + roomCode);
    onValue(roomRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val();

      const player1 = data.player1;
      const player2 = data.player2;
      setPlayerRole(nickname === player1 ? "player1" : "player2");

      setTargetEmoji(data.emoji || "");
      setEmojiOptions(data.choices || []);
      setRound(data.round || 1);
      setScores(data.score || { player1: 0, player2: 0 });
      setStatus(data.roundStatus || "waiting");

      if (data.lastTap && data.roundStatus === "tapped") {
        const whoTapped = data.lastTap.by === player1 ? "player1" : "player2";
        const newScore = { ...data.score };

        if (!newScore[whoTapped]) newScore[whoTapped] = 0;
        newScore[whoTapped]++;

        if (newScore[whoTapped] === 3) {
          setWinner(data.lastTap.by);
          update(ref(database, "rooms/" + roomCode), {
            score: newScore,
            gameWinner: data.lastTap.by,
            roundStatus: "ended"
          });
        } else {
          update(ref(database, "rooms/" + roomCode), {
            score: newScore,
            round: (data.round || 1) + 1,
            roundStatus: "waiting"
          });
          setTimeout(() => startRound(), 2000);
        }
      }

      if (data.roundStatus === "waiting" && !data.lastTap) {
        setTimeout(() => startRound(), 1500);
      }
    });
  }, [nickname, roomCode]);

  return (
    <div className="game-container">
      <div className="score-board">
        <span>Round {round}/5</span>
        <span>{scores.player1} : {scores.player2}</span>
      </div>

      {winner ? (
        <h1 className="winner-text">{winner} wins the game! 🎉</h1>
      ) : (
        <>
          <div className="emoji-target">{targetEmoji}</div>
          <div className="emoji-options">
            {emojiOptions.map((emoji, idx) => (
              <button key={idx} className="emoji-btn" onClick={() => handleTap(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Game;
