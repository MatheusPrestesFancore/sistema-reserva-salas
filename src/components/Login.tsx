// src/components/Login.tsx
'use client';

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuth } from '@/src/context/AuthContext';
import { app } from '@/lib/firebase';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function Login() {
  const { user, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '38px' }}></div>; // Espaço reservado para evitar pulo na tela
  }

  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{color: 'white'}}>Bem-vindo, {user.displayName || user.email}!</span>
          <button onClick={handleLogout}>
            Sair
          </button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login com Google</button>
      )}
    </div>
  );
}