import { initializeApp } from "firebase/app";
import {getFirestore , collection} from "firebase/firestore"


const firebaseConfig = {
  apiKey: "AIzaSyA1Fsh4ho8IH0jyIYoIC3Yz9Vfgsy9s8A4",
  authDomain: "filmyverse-4c90d.firebaseapp.com",
  projectId: "filmyverse-4c90d",
  storageBucket: "filmyverse-4c90d.appspot.com",
  messagingSenderId: "545789711028",
  appId: "1:545789711028:web:bb0e9b0bba5099ef46bde1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const carsRef = collection(db, "cars");
export const reviewsRef = collection(db, "reviews");
export const usersRef = collection(db, "users");


export default app;