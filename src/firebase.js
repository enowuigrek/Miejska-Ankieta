import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwG5bHjTnEGct9GvwweMoAeZ257yfWCZ8",
  authDomain: "miejska-ankieta.firebaseapp.com",
  projectId: "miejska-ankieta",
  storageBucket: "miejska-ankieta.appspot.com",
  messagingSenderId: "891252926440",
  appId: "1:891252926440:web:3383e7248c7a69fe46a65d",
  measurementId: "G-T8W987M3FZ"
};

initializeApp(firebaseConfig);
const db = getFirestore();

export { db };
