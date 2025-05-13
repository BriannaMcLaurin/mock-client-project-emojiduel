import React, { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import database from "../firebase";
import "./Game.css";

const EMOJI_SETS = {
  food: ["🍕", "🍔", "🌮", "🍟", "🍩", "🍉", "🍇", "🍓"],
  animals: ["🐶", "🐱", "🐵", "🐸", "🐼", "🦄", "🐰"],
  faces: ["😂", "😍", "😭", "😡", "😱", "😴", "🤪"],
  random: [
    "🔥", "😂", "💀", "🌟", "🎯", "🍕", "🐶", "👻", "🎮", "🚀",
    "🦄", "🧠", "🎃", "🐱", "🥳", "🤖", "🛸", "🌈", "🌍", "🪐"
  ]
};

function Game({ nickname, roomCode }) {
  const [playerRole, setPlayerRole] = useState("");
  const [player1Name, setPlayer1Name] = useState("Player 1");
  const [player2Name, setPlayer2Name] = useState("Player 2");
  const [emojiCategory, setEmojiCategory] = useState("random");
  const [bothPlayersReady, setBothPlayersReady] = useState(false);

  const [targetEmoji, setTargetEmoji] = useState("");
  const [rotatingEmoji, setRotatingEmoji] = useState("");
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [round, setRound] = useState(1);
  const [winner, setWinner] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setScores(data.score || { player1: 0, player2: 0 });
      setRound(data.round || 1);
      setTargetEmoji(data.targetEmoji || "");
      setWinner(data.winner || "");
      setEmojiCategory(data.emojiCategory || "random");

      setPlayer1Name(data.player1 || "Player 1");
      setPlayer2Name(data.player2 || "Player 2");

      if (!playerRole) {
        if (data.player1 === nickname) setPlayerRole("player1");
        else if (data.player2 === nickname) setPlayerRole("player2");
      }

      if (data.player1 && data.player2) {
        setBothPlayersReady(true);
      }
    });

    return () => unsubscribe();
  }, [roomCode, nickname, playerRole]);

  useEffect(() => {
    if (round > 5 || winner || !bothPlayersReady) return;

    const emojis = EMOJI_SETS[emojiCategory] || EMOJI_SETS["random"];
    let intervalId;

    if (!targetEmoji) {
      intervalId = setInterval(() => {
        const random = emojis[Math.floor(Math.random() * emojis.length)];
        setRotatingEmoji(random);
      }, 75);

      setTimeout(() => {
        clearInterval(intervalId);
        const finalEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const roomRef = ref(database, `rooms/${roomCode}`);
        update(roomRef, {
          targetEmoji: finalEmoji,
          tappedBy: ""
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [targetEmoji, round, winner, emojiCategory, roomCode, bothPlayersReady]);

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
  const handleExit = () => window.location.href = "/";

  return (
    <div className="game-container">
      {!bothPlayersReady ? (
        <>
          <h1 className="game-title">Waiting for both players to join...</h1>
          <p className="waiting-msg">Room Code: {roomCode}</p>
        </>
      ) : winner ? (
        <>
          <h1 className="game-title">Game Over 🎉</h1>
          <h2 className="winner-text">{winner}</h2>
          <div className="final-scores">
            <p><strong>{player1Name}:</strong> {scores.player1}</p>
            <p><strong>{player2Name}:</strong> {scores.player2}</p>
          </div>
          <div className="gameover-buttons">
            <button className="btn" onClick={handlePlayAgain}>🔁 Play Again</button>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default Game;
