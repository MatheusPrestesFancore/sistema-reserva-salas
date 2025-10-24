// src/app/sala/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link'; // Importe o Link
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import BookingModal from '@/src/components/BookingModal';
import AnimatedSection from '@/src/components/AnimatedSection';

import { Box, Container, Heading, Text, Button, Spinner, VStack, List, ListItem, ListIcon, Divider, Flex, Image, FormControl, FormLabel, Input } from '@chakra-ui/react';
import { ArrowBackIcon, CheckCircleIcon } from '@chakra-ui/icons';

interface SalaDetails {
  nome: string;
  capacidade: number;
  recursos: string[];
  fotoUrl?: string;
}
interface Reserva {
  id: string;
  titulo: string;
  usuarioNome: string;
  inicio: Timestamp;
  fim: Timestamp;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export default function SalaPage() {
  const params = useParams();
  const id = params.id as string;

  const [sala, setSala] = useState<SalaDetails | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  useEffect(() => {
    if (!id) return;
    const date = new Date(selectedDate);
    const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59));
    const q = query(collection(db, "reservas"), where("salaId", "==", id), where("inicio", ">=", Timestamp.fromDate(startOfDay)), where("inicio", "<=", Timestamp.fromDate(endOfDay)), orderBy("inicio"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reservasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reserva[];
      setReservas(reservasData);
    }, (error) => {
      console.error("Erro ao buscar reservas: ", error);
    });
    const fetchSalaDetails = async () => {
      const salaDocRef = doc(db, "salas", id);
      const salaDocSnap = await getDoc(salaDocRef);
      if (salaDocSnap.exists()) {
        setSala(salaDocSnap.data() as SalaDetails);
      }
      setLoading(false);
    };
    fetchSalaDetails();
    return () => unsubscribe();
  }, [id, selectedDate]);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Spinner size="xl" color="brand.orange" /></Box>;
  }
  if (!sala) {
    return <Container mt={10}><Text>Sala não encontrada.</Text></Container>;
  }

  return (
    <Container maxW="container.lg" py={12} color="white">
      <AnimatedSection direction="left">
        {/* --- CORREÇÃO AQUI --- */}
        <Button
          as={Link}
          href="/"
          leftIcon={<ArrowBackIcon />}
          mb={6}
          variant="outline"
          borderColor="brand.orange"
          color="brand.orange"
          _hover={{ bg: 'brand.orange', color: 'white' }}
        >
          Voltar para todas as salas
        </Button>
        <Heading as="h1" size="2xl" mb={4}>{sala.nome}</Heading>
        <Text fontSize="xl" color="gray.300">Capacidade: {sala.capacidade} pessoas</Text>
      </AnimatedSection>
      <Divider my={12} borderColor="gray.700" />
      <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={10} mb={12}>
        <AnimatedSection direction="left" delay={0.2}>
          <Box flex="1">{sala.fotoUrl && <Image src={sala.fotoUrl} alt={`Foto da ${sala.nome}`} borderRadius="lg" shadow="2xl" />}</Box>
        </AnimatedSection>
        <AnimatedSection direction="right" delay={0.4}>
          <Box flex="1">
            <Heading as="h2" size="lg" mb={4}>Recursos Disponíveis</Heading>
            <List spacing={3}>{sala.recursos?.map((recurso, index) => (<ListItem key={index} fontSize="lg"><ListIcon as={CheckCircleIcon} color="brand.orange" />{recurso}</ListItem>))}</List>
          </Box>
        </AnimatedSection>
      </Flex>
      <AnimatedSection delay={0.2}>
        <Box textAlign="center" my={12}>
          <Button colorScheme="orange" onClick={() => setIsModalOpen(true)} size="lg" bg="brand.orange" _hover={{ bg: 'brand.orangeHover' }} px={10} py={6}>
            Reservar esta Sala
          </Button>
        </Box>
      </AnimatedSection>
      <Divider my={12} borderColor="gray.700" />
      <AnimatedSection>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h2" size="xl">Reservas Agendadas</Heading>
          <FormControl w="200px">
            <FormLabel fontSize="sm" m={0}>Mostrar dia:</FormLabel>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              focusBorderColor="brand.orange"
            />
          </FormControl>
        </Flex>
        <VStack spacing={4} align="stretch">
          {reservas.length > 0 ? (
            reservas.map(reserva => (
              <Box key={reserva.id} p={5} borderWidth="1px" borderColor="gray.700" borderRadius="md" bg="gray.800">
                <Text fontWeight="bold" fontSize="lg">{reserva.titulo}</Text>
                <Text fontSize="sm" color="gray.400">Reservado por: {reserva.usuarioNome || 'Usuário'}</Text>
                <Text fontSize="sm" color="gray.300" mt={2}>De: {reserva.inicio.toDate().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text fontSize="sm" color="gray.300">Até: {reserva.fim.toDate().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
              </Box>
            ))
          ) : (
            <Text color="gray.500" textAlign="center" py={10}>Nenhuma reserva encontrada para este dia.</Text>
          )}
        </VStack>
      </AnimatedSection>
      {isModalOpen && <BookingModal salaId={id} onClose={() => setIsModalOpen(false)} />}
    </Container>
  );
}