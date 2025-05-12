import React, { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import database from "../firebase";
import "./Game.css";

const EMOJIS = [
  "🔥", "😂", "💀", "🌟", "🎯", "🍕", "🐶", "👻", "🎮", "🚀",
  "🦄", "🧠", "🎃", "🐱", "🥳", "🤖", "🛸", "🌈", "🌍", "🪐"
];

function Game({ nickname, roomCode }) {
   // keeps track of all game states
  const [playerRole, setPlayerRole] = useState("");
  const [player1Name, setPlayer1Name] = useState("Player 1");
  const [player2Name, setPlayer2Name] = useState("Player 2");
  const [targetEmoji, setTargetEmoji] = useState("");
  const [rotatingEmoji, setRotatingEmoji] = useState("");
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [round, setRound] = useState(1);
  const [winner, setWinner] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [tapped, setTapped] = useState(false);

  // Sync player role and game state from Firebase
  useEffect(() => {
    if (!roomCode) return;

    const roomRef = ref(database, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setScores(data.score || { player1: 0, player2: 0 });
      setRound(data.round || 1);
      setTargetEmoji(data.targetEmoji || "");
      setWinner(data.winner || "");

      if (data.player1) setPlayer1Name(data.player1);
      if (data.player2) setPlayer2Name(data.player2);

      if (!playerRole) {
        if (data.player1 === nickname) setPlayerRole("player1");
        else if (data.player2 === nickname) setPlayerRole("player2");
      }
    });
  }, [roomCode, nickname, playerRole]);

  // emoji rotation and locking target
  useEffect(() => {
    if (round > 5 || winner) return;

    let intervalId;

    if (!targetEmoji) {
      intervalId = setInterval(() => {
        const random = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        setRotatingEmoji(random);
      }, 75);

      setTimeout(() => {
        clearInterval(intervalId);
        const finalEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        const roomRef = ref(database, `rooms/${roomCode}`);
        update(roomRef, {
          targetEmoji: finalEmoji,
          tappedBy: ""
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [targetEmoji, round, winner]);

  // Declares winner once after round 5
  useEffect(() => {
    if (round > 5 && !winner && playerRole === "player1") {
      let result = "Tie";
      if (scores.player1 > scores.player2) result = `${player1Name} Wins!`;
      else if (scores.player2 > scores.player1) result = `${player2Name} Wins!`;

      const roomRef = ref(database, `rooms/${roomCode}`);
      update(roomRef, { winner: result });
    }
  }, [round, winner, scores, player1Name, player2Name, playerRole, roomCode]);

  const handleEmojiClick = () => {
    if (round > 5 || isLocked || tapped || !targetEmoji || winner) return;

    setIsLocked(true);

    const roomRef = ref(database, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data || data.tappedBy) return;

      const newScore = { ...data.score };
      newScore[playerRole] += 1;

      update(roomRef, {
        score: newScore,
        tappedBy: playerRole,
      });

      setTimeout(() => {
        update(roomRef, {
          round: data.round + 1,
          targetEmoji: "",
          tappedBy: ""
        });
        setIsLocked(false);
      }, 1000);

      setTapped(true);
      setTimeout(() => setTapped(false), 1000);
    }, { onlyOnce: true });
  };

  const handlePlayAgain = () => window.location.reload();

  // Game Over Screen
  if (winner) {
    return (
      <div className="game-container">
        <h1 className="game-title">Game Over 🎉</h1>
        <h2 className="winner-text">{winner}</h2>
        <div className="final-scores">
          <p><strong>{player1Name}:</strong> {scores.player1}</p>
          <p><strong>{player2Name}:</strong> {scores.player2}</p>
        </div>
        <div className="gameover-button">
          <button className="btn" onClick={handlePlayAgain}>🔁 Play Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      
      <h1 className="game-title">EMOJI DUEL</h1>
      <div className="scoreboard">
        <div className="player-score blue">
          <p>{player1Name}</p>
          <h2>{scores.player1}</h2>
        </div>
        <div className="player-score red">
          <p>{player2Name}</p>
          <h2>{scores.player2}</h2>
        </div>
      </div>
      <div className="emoji-area">
        {targetEmoji ? (
          <button className="emoji-button" onClick={handleEmojiClick}>
            {targetEmoji}
          </button>
        ) : (
          <div className="emoji-flash">{rotatingEmoji}</div>
        )}
      </div>

      <p className="best-of">BEST OF {Math.min(round, 5)} OUT OF 5</p>
    </div>
  );
}

export default Game;
