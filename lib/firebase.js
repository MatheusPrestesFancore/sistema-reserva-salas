// lib/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Sua configuração do app Firebase, lendo das variáveis de ambiente
// Certifique-se que seu arquivo .env.local está preenchido corretamente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// ---- ESTA É A PARTE IMPORTANTE QUE ESTAVA FALTANDO ----

// 1. Inicializa o serviço do Firestore
const db = getFirestore(app);

// 2. Exporta a variável 'db' para que outros arquivos possam importá-la
export { db, app };
