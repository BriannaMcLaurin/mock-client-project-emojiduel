import React, { useEffect } from "react";
import { ref, onValue } from "firebase/database";
import database from "../firebase";

function Lobby({ roomId, nickname, onGameStart }) {
  useEffect(() => {
    const roomRef = ref(database, "rooms/" + roomId);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.player1 && data?.player2) {
        onGameStart();
      }
    });

    return () => unsubscribe();
  }, [roomId, onGameStart]);

  return (
    <div className="lobby-container">
      <h2>Waiting for another player to join...</h2>
      <p>Room Code: <strong>{roomId}</strong></p>
      <p>Your name: <strong>{nickname}</strong></p>
    </div>
  );
}

export default Lobby;
