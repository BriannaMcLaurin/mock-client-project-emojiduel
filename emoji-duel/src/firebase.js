// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwBykWaKtDctXrHY6sSgLf1k59c183VH8",
  authDomain: "emoji-duel.firebaseapp.com",
  databaseURL: "https://emoji-duel-default-rtdb.firebaseio.com",
  projectId: "emoji-duel",
  storageBucket: "emoji-duel.firebasestorage.app",
  messagingSenderId: "189593353570",
  appId: "1:189593353570:web:57b16c7fd16810aa0d003b",
  measurementId: "G-EVX69G8WTZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default database;