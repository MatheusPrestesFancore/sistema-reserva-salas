// src/app/sala/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, Timestamp, onSnapshot } from 'firebase/firestore';
import BookingModal from '@/src/components/BookingModal';

// Imports do Chakra UI
import { Box, Container, Heading, Text, Button, Spinner, VStack, List, ListItem, ListIcon, Divider } from '@chakra-ui/react';
import { ArrowBackIcon, CheckCircleIcon } from '@chakra-ui/icons';

interface SalaDetails {
  nome: string;
  capacidade: number;
  recursos: string[];
}
interface Reserva {
  id: string;
  titulo: string;
  usuarioEmail: string;
  inicio: Timestamp;
  fim: Timestamp;
}

export default function SalaPage() {
  const params = useParams();
  const id = params.id as string;

  const [sala, setSala] = useState<SalaDetails | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Escuta em tempo real para as reservas
    const q = query(collection(db, "reservas"), where("salaId", "==", id));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reservasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Reserva[];
      // Ordena as reservas pela data de início
      reservasData.sort((a, b) => a.inicio.toMillis() - b.inicio.toMillis());
      setReservas(reservasData);
    });

    const fetchSalaDetails = async () => {
      const salaDocRef = doc(db, "salas", id);
      const salaDocSnap = await getDoc(salaDocRef);
      if (salaDocSnap.exists()) {
        setSala(salaDocSnap.data() as SalaDetails);
      } else {
        console.log("Sala não encontrada!");
      }
      setLoading(false);
    };

    fetchSalaDetails();
    
    // Limpa a escuta quando o componente é desmontado
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Spinner size="xl" /></Box>;
  }
  if (!sala) {
    return <Container mt={10}><Text>Sala não encontrada.</Text></Container>;
  }

  return (
    <Container maxW="container.lg" py={12} color="white">
      {/* BOTÃO VOLTAR */}
      <Link href="/" passHref>
        <Button as="a" leftIcon={<ArrowBackIcon />} mb={6} variant="outline" colorScheme="gray">
          Voltar para todas as salas
        </Button>
      </Link>
      
      <Box p={6} borderWidth="1px" borderColor="gray.700" borderRadius="lg" bg="gray.800">
        <Heading as="h1" size="xl">{sala.nome}</Heading>
        <Text mt={2} color="gray.400">Capacidade: {sala.capacidade} pessoas</Text>
        
        <Text mt={4} fontWeight="bold">Recursos disponíveis:</Text>
        <List spacing={2} mt={2}>
          {sala.recursos?.map((recurso, index) => (
            <ListItem key={index}>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              {recurso}
            </ListItem>
          ))}
        </List>
      </Box>

      <Button
        mt={6}
        colorScheme="orange" // Usaremos o laranja como cor principal
        onClick={() => setIsModalOpen(true)}
        size="lg"
        width="full"
        bg="#FF7A00" // Cor exata da Fancore
        _hover={{ bg: '#E66F00' }}
      >
        Reservar esta Sala
      </Button>

      <Divider my={10} />

      <Heading as="h2" size="lg" mb={6}>Reservas Agendadas</Heading>
      <VStack spacing={4} align="stretch">
        {reservas.length > 0 ? (
          reservas.map(reserva => (
            <Box key={reserva.id} p={4} borderWidth="1px" borderColor="gray.700" borderRadius="md" bg="gray.800">
              <Text fontWeight="bold">{reserva.titulo}</Text>
              <Text fontSize="sm" color="gray.400">Reservado por: {reserva.usuarioEmail}</Text>
              <Text fontSize="sm" color="gray.300" mt={2}>
                De: {reserva.inicio.toDate().toLocaleString('pt-BR')}
              </Text>
              <Text fontSize="sm" color="gray.300">
                Até: {reserva.fim.toDate().toLocaleString('pt-BR')}
              </Text>
            </Box>
          ))
        ) : (
          <Text color="gray.500">Nenhuma reserva agendada para esta sala.</Text>
        )}
      </VStack>

      {isModalOpen && <BookingModal salaId={id} onClose={() => setIsModalOpen(false)} />}
    </Container>
  );
}