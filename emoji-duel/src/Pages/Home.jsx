import { useState } from "react";
import './Home.css';
import { ref, set } from "firebase/database";
import database from "../firebase";

// Call this on Create Room
const handleCreate = (nickname) => {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase(); // generate room

  set(ref(database, 'rooms/' + roomId), { // vreate room in firebase
    player1: nickname,
    status: "waiting",
    createdAt: Date.now()
  });

  console.log("Room created:", roomId);
};


function Home({ onJoin, onCreate }) {
  const [nickname, setNickname] = useState("");

  return (
    <div>
      <h1 className="Title">EMOJI DUEL⚔️</h1>

      <input
        type="text"
        placeholder="Enter your nickname"
        value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="nickname-input"
      />

      <div className="button-group">
        <button
          onClick={() => onJoin(nickname)}
          className="join-btn"
        >
         🔗 Join Room
        </button>

        <button
          onClick={() => onCreate(nickname)}
          className="create-btn"
           disabled={!nickname.trim()}
        >
         🎮 Create Room
        </button>
      </div>
    </div>
  );
}

export default Home;
