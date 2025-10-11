// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import RoomSection from '@/src/components/RoomSection'; // Importando nosso novo componente de seção

// Imports do Chakra UI
import { Box, Container, Heading, Text, Spinner, VStack, Icon, Flex } from '@chakra-ui/react';
import { ArrowDownIcon } from '@chakra-ui/icons';

interface Sala {
  id: string;
  nome: string;
  capacidade?: number;
  recursos?: string[];
  fotoUrl?: string;
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
          ...(doc.data() as Omit<Sala, 'id'>)
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
    <Box>
      {/* Seção 1: O Hero de Boas-Vindas */}
      <Flex
        as="section"
        w="full"
        h="90vh" // Ocupa quase a tela inteira
        align="center"
        justify="center"
        textAlign="center"
        direction="column"
      >
        <Heading as="h1" size="4xl" color="white" mb={4}>
          Reserve sua Sala de Reunião
        </Heading>
        <Text fontSize="xl" color="gray.300" maxW="600px">
          Um sistema simples e elegante para agilizar o agendamento de salas na Fancore.
        </Text>
        <Icon as={ArrowDownIcon} w={8} h={8} mt={16} color="gray.500" />
      </Flex>

      {/* Seção 2: A Lista de Salas com Animação */}
      <Container maxW="container.xl" py={12}>
        <VStack spacing={10} divider={<Box h="1px" bg="gray.700" />}>
          {salas.length > 0 ? (
            salas.map((sala, index) => (
              <RoomSection
                key={sala.id}
                sala={sala}
                // AQUI A MÁGICA ACONTECE:
                // Se o índice for par (0, 2, ...), a imagem fica na esquerda.
                // Se for ímpar (1, 3, ...), a imagem fica na direita.
                imageSide={index % 2 === 0 ? 'left' : 'right'}
              />
            ))
          ) : (
            <Text color="gray.500">Nenhuma sala encontrada.</Text>
          )}
        </VStack>
      </Container>
    </Box>
  );
}