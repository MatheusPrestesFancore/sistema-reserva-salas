// src/components/Login.tsx
'use client';

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuth } from '@/src/context/AuthContext';
import { app } from '@/lib/firebase';
import { usePathname } from 'next/navigation'; // NOVO: Hook para saber a URL atual

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function Login() {
  const { user, loading } = useAuth();
  const pathname = usePathname(); // NOVO: Pega o caminho da URL (ex: "/dashboard")

  // NOVO: Se estivermos na página do dashboard, o componente não renderiza nada
  if (pathname === '/dashboard') {
    return null;
  }

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
    return <div style={{ minHeight: '38px' }}></div>;
  }

  return (
    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{color: 'white'}}>Bem-vindo, {user.displayName || user.email}!</span>
          <button onClick={handleLogout} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #FF7A00', color: '#FF7A00', background: 'transparent', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      ) : (
        <button onClick={handleLogin} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', color: 'black', background: '#FF7A00', cursor: 'pointer', fontWeight: 'bold' }}>
          Login com Google
        </button>
      )}
    </div>
  );
}