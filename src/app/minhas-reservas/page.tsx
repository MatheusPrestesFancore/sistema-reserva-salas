// src/app/minhas-reservas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import { useAuth } from '@/src/context/AuthContext';

import { Box, Button, Container, Heading, Text, VStack, Spinner, Flex, useToast } from '@chakra-ui/react';
import { ArrowBackIcon, DeleteIcon } from '@chakra-ui/icons';

interface Reserva {
  id: string;
  titulo: string;
  salaId: string;
  inicio: Timestamp;
  fim: Timestamp;
}

export default function MinhasReservasPage() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'reservas'),
      where('usuarioEmail', '==', user.email),
      orderBy('inicio', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userReservas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reserva[];
      setReservas(userReservas);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCancelReservation = async (reservaId: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }

    try {
      const reservaRef = doc(db, 'reservas', reservaId);
      await deleteDoc(reservaRef);
      toast({
        title: 'Reserva cancelada.',
        description: 'A sala agora está livre neste horário.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      toast({
        title: 'Erro ao cancelar.',
        description: 'Não foi possível cancelar a reserva. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return <Flex h="80vh" align="center" justify="center"><Spinner size="xl" color="brand.orange" /></Flex>;
  }

  return (
    <Container maxW="container.lg" py={12}>
      <Link href="/" passHref>
        <Button
          as="a"
          leftIcon={<ArrowBackIcon />}
          mb={8}
          variant="outline"
          borderColor="brand.orange"
          color="brand.orange"
          _hover={{ bg: 'brand.orange', color: 'white' }}
        >
          Voltar para o início
        </Button>
      </Link>

      <Heading as="h1" mb={8} color="white">
        Minhas Reservas
      </Heading>

      {!user ? (
        <Text color="gray.400">Você precisa fazer login para ver suas reservas.</Text>
      ) : reservas.length === 0 ? (
        <Text color="gray.400">Você ainda não fez nenhuma reserva.</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {reservas.map(reserva => (
            <Flex
              key={reserva.id}
              p={5}
              bg="gray.800"
              borderRadius="lg"
              justify="space-between"
              align="center"
              wrap="wrap"
            >
              <Box>
                <Text fontWeight="bold" fontSize="xl">{reserva.titulo}</Text>
                <Text color="gray.300">
                  {reserva.inicio.toDate().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                   {' - '} 
                  {reserva.fim.toDate().toLocaleString('pt-BR', { timeStyle: 'short' })}
                </Text>
              </Box>
              <Button
                colorScheme="red"
                leftIcon={<DeleteIcon />}
                onClick={() => handleCancelReservation(reserva.id)}
                size="sm"
              >
                Cancelar
              </Button>
            </Flex>
          ))}
        </VStack>
      )}
    </Container>
  );
}