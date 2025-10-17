// src/components/Login.tsx
'use client';

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuth } from '@/src/context/AuthContext';
import { app } from '@/lib/firebase';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button, HStack, Text, Box } from '@chakra-ui/react';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function Login() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

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
    return <div style={{ minHeight: '40px' }}></div>;
  }

  return (
    <Box style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
      {user ? (
        <HStack spacing={4}>
          <Text color="white">Bem-vindo, {user.displayName || user.email}!</Text>
          <Link href="/minhas-reservas" passHref>
            <Button
              as="a"
              size="sm"
              variant="outline"
              borderColor="gray.600"
              _hover={{ bg: 'whiteAlpha.200', borderColor: 'gray.400' }}
            >
              Minhas Reservas
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleLogout}
            variant="outline"
            borderColor="brand.orange"
            color="brand.orange"
            _hover={{ bg: 'brand.orange', color: 'white' }}
          >
            Sair
          </Button>
        </HStack>
      ) : (
        <Button onClick={handleLogin} bg="brand.orange" color="white" _hover={{ bg: 'brand.orangeHover' }}>
          Login com Google
        </Button>
      )}
    </Box>
  );
}