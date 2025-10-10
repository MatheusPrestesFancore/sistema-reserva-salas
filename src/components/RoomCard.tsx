// src/components/RoomCard.tsx
'use client'

import Link from 'next/link';
import {
  Box,
  Heading,
  Text,
  Badge,
  LinkBox,
  LinkOverlay,
} from '@chakra-ui/react';

interface Sala {
  id: string;
  nome: string;
  capacidade?: number;
}

interface RoomCardProps {
  sala: Sala;
}

export default function RoomCard({ sala }: RoomCardProps) {
  return (
    // LinkBox permite que todo o card seja clicável
    <LinkBox
      as="article"
      p={5}
      borderWidth="1px"
      borderColor="gray.700"
      borderRadius="lg"
      bg="gray.800"
      transition="all 0.2s ease-in-out"
      _hover={{
        borderColor: 'brand.orange', // Laranja do nosso tema!
        transform: 'translateY(-4px)',
        shadow: 'lg',
      }}
    >
      <Heading size="md" my={2}>
        {/* LinkOverlay faz o título ser o link principal */}
        <Link href={`/sala/${sala.id}`} passHref>
          <LinkOverlay>{sala.nome}</LinkOverlay>
        </Link>
      </Heading>
      <Text mb={3} color="gray.400">
        Capacidade: {sala.capacidade} pessoas
      </Text>
      <Badge colorScheme="green" variant="solid">
        Livre
      </Badge>
    </LinkBox>
  );
}