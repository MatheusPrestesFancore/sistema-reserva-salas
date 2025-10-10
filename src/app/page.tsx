// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import RoomCard from '@/src/components/RoomCard'; // Importando nosso novo componente

// Imports do Chakra UI
import { Box, Container, Heading, SimpleGrid, Text, Spinner } from '@chakra-ui/react';

interface Sala {
  id: string;
  nome: string;
  capacidade?: number;
}

export default function HomePage() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "salas"));
        const salasData = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          nome: doc.data().nome,
          capacidade: doc.data().capacidade,
        }));
        setSalas(salasData);
      } catch (error) {
        console.error("Erro ao buscar salas: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalas();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" color="brand.orange" />
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={12}>
      <Heading as="h1" mb={8} color="white">
        Salas de Reunião
      </Heading>
      {salas.length > 0 ? (
        // SimpleGrid cria uma grade responsiva automaticamente
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {salas.map((sala) => (
            <RoomCard key={sala.id} sala={sala} />
          ))}
        </SimpleGrid>
      ) : (
        <Text color="gray.500">Nenhuma sala encontrada.</Text>
      )}
    </Container>
  );
}