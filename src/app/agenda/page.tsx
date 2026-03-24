// src/app/agenda/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Import do Link para o botão de voltar
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

// Imports do Chakra UI
import { Box, SimpleGrid, Heading, Text, VStack, Spinner, Flex, Image, FormControl, FormLabel, Input, Button } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons'; // Import do ícone da setinha

interface Sala {
  id: string;
  nome: string;
  fotoUrl?: string;
}

interface Reserva {
  id: string;
  titulo: string;
  usuarioNome: string;
  inicio: Timestamp;
  fim: Timestamp;
}

interface ReservasPorSala {
  [salaId: string]: Reserva[];
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export default function AgendaPage() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [reservas, setReservas] = useState<ReservasPorSala>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  useEffect(() => {
    const fetchSalas = async () => {
      const salasCollection = collection(db, 'salas');
      const unsubscribeSalas = onSnapshot(salasCollection, (snapshot) => {
        const salasData = snapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome,
          fotoUrl: doc.data().fotoUrl
        })) as Sala[];
        setSalas(salasData);
      });
      return unsubscribeSalas;
    };

    fetchSalas();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    setLoading(true);

    const [year, month, day] = selectedDate.split('-');
    const inicioDoDia = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0);
    const fimDoDia = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);

    const q = query(
      collection(db, 'reservas'),
      where('inicio', '>=', Timestamp.fromDate(inicioDoDia)),
      where('inicio', '<=', Timestamp.fromDate(fimDoDia)),
      orderBy('inicio')
    );

    const unsubscribeReservas = onSnapshot(q, (snapshot) => {
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

    return () => unsubscribeReservas();
  }, [selectedDate]);

  return (
    // ALTERAÇÃO 1: pt={{ base: 24, md: 28 }} adicionado para empurrar o conteúdo para baixo da Navbar
    <Box px={8} pb={8} pt={{ base: 24, md: 28 }} bg="brand.dark" minH="100vh" color="white">
      
      {/* ALTERAÇÃO 2: Botão de Voltar para o Início */}
      <Box mb={6}>
        <Button
          as={Link}
          href="/"
          leftIcon={<ArrowBackIcon />}
          variant="outline"
          borderColor="brand.orange"
          color="brand.orange"
          _hover={{ bg: 'brand.orange', color: 'white' }}
        >
          Voltar para o início
        </Button>
      </Box>

      {/* Cabeçalho da página com Título e Filtro de Data */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" mb={10} gap={6}>
        <Heading size="2xl">Agenda Geral</Heading>
        
        <FormControl w="250px" bg="gray.800" p={3} borderRadius="md" borderWidth="1px" borderColor="gray.700">
          <FormLabel fontSize="sm" m={0} color="gray.400">Selecionar data:</FormLabel>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            focusBorderColor="brand.orange"
            color="white"
            variant="unstyled"
            mt={1}
            sx={{
              "&::-webkit-calendar-picker-indicator": {
                cursor: "pointer",
                filter: "invert(1)",
              },
            }}
          />
        </FormControl>
      </Flex>

      {loading ? (
        <Flex h="50vh" align="center" justify="center"><Spinner size="xl" color="brand.orange" /></Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {salas.map((sala) => (
            <VStack key={sala.id} p={5} bg="gray.800" borderRadius="lg" align="stretch" spacing={4}>
              {sala.fotoUrl && (
                <Image 
                  src={sala.fotoUrl} 
                  alt={`Foto da ${sala.nome}`}
                  borderRadius="md"
                  objectFit="cover"
                  h="180px"
                  w="100%"
                />
              )}
              <Heading size="md" textAlign="center" pb={3} borderBottom="1px solid" borderColor="gray.700">
                {sala.nome}
              </Heading>
              
              {(reservas[sala.id] && reservas[sala.id].length > 0) ? (
                reservas[sala.id].map(reserva => (
                  <Box key={reserva.id} bg="gray.700" p={4} borderRadius="md" borderLeft="4px solid" borderColor="brand.orange">
                    <Text fontWeight="bold" fontSize="md">{reserva.titulo}</Text>
                    <Text color="gray.400" fontSize="sm">por: {reserva.usuarioNome}</Text>
                    <Text mt={2} fontSize="sm" color="white" fontWeight="bold">
                      {reserva.inicio.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {reserva.fim.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </Box>
                ))
              ) : (
                <Flex align="center" justify="center" h="100%" minH="80px">
                  <Text color="gray.500" fontSize="sm">Livre o dia todo</Text>
                </Flex>
              )}
            </VStack>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}