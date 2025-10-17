// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

// Imports do Chakra UI
import { Box, SimpleGrid, Heading, Text, VStack, Spinner, Flex } from '@chakra-ui/react';

// Nossas interfaces de dados
interface Sala {
  id: string;
  nome: string;
}
interface Reserva {
  id: string;
  titulo: string;
  usuarioNome: string;
  inicio: Timestamp;
  fim: Timestamp;
}
// Interface para agrupar as reservas por sala
interface ReservasPorSala {
  [salaId: string]: Reserva[];
}

export default function DashboardPage() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [reservas, setReservas] = useState<ReservasPorSala>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca inicial pelas salas
    const fetchSalas = async () => {
      const salasCollection = collection(db, 'salas');
      const salasSnapshot = await onSnapshot(salasCollection, (snapshot) => {
        const salasData = snapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome })) as Sala[];
        setSalas(salasData);
      });
      return salasSnapshot; // Retorna a função de unsubscribe
    };

    // Busca em tempo real pelas reservas futuras
    const listenToReservas = () => {
      const agora = Timestamp.now();
      const q = query(
        collection(db, 'reservas'),
        where('fim', '>=', agora), // Apenas reservas que ainda não acabaram
        orderBy('fim'),
        orderBy('inicio')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        // Agrupamos as reservas por salaId para facilitar a exibição
        const reservasAgrupadas = snapshot.docs.reduce((acc, doc) => {
          const reserva = { id: doc.id, ...doc.data() } as Reserva;
          const salaId = doc.data().salaId;
          if (!acc[salaId]) {
            acc[salaId] = [];
          }
          acc[salaId].push(reserva);
          return acc;
        }, {} as ReservasPorSala);

        setReservas(reservasAgrupadas);
        setLoading(false);
      });
      return unsubscribe; // Retorna a função de unsubscribe
    };

    fetchSalas();
    const unsubscribeReservas = listenToReservas();

    // Limpa os listeners quando o componente é desmontado
    return () => {
      unsubscribeReservas();
    };
  }, []);

  if (loading) {
    return <Flex h="100vh" align="center" justify="center"><Spinner size="xl" color="brand.orange" /></Flex>;
  }

  return (
    <Box p={8} bg="brand.dark" minH="100vh" color="white">
      <Heading textAlign="center" mb={10} size="2xl">Agenda das Salas</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
        {salas.map((sala) => (
          <VStack key={sala.id} p={5} bg="gray.800" borderRadius="lg" align="stretch" spacing={4}>
            <Heading size="lg" textAlign="center" pb={3} borderBottom="1px solid" borderColor="gray.700">
              {sala.nome}
            </Heading>
            
            {(reservas[sala.id] && reservas[sala.id].length > 0) ? (
              reservas[sala.id].map(reserva => (
                <Box key={reserva.id} bg="gray.700" p={4} borderRadius="md">
                  <Text fontWeight="bold" fontSize="lg">{reserva.titulo}</Text>
                  <Text color="gray.300">por: {reserva.usuarioNome}</Text>
                  <Text mt={2} fontSize="md" color="brand.orange" fontWeight="bold">
                    {reserva.inicio.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {reserva.fim.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Box>
              ))
            ) : (
              <Flex align="center" justify="center" h="100%">
                <Text color="gray.500">Nenhuma reserva futura</Text>
              </Flex>
            )}
          </VStack>
        ))}
      </SimpleGrid>
    </Box>
  );
}