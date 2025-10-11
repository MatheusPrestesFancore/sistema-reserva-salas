// src/components/RoomSection.tsx
'use client'

import Link from 'next/link'
import {
  Box,
  Heading,
  Text,
  Badge,
  Flex,
  Image,
  VStack,
  LinkBox,
  LinkOverlay,
  Button,
} from '@chakra-ui/react'
import AnimatedSection from './AnimatedSection'
import { ArrowForwardIcon } from '@chakra-ui/icons'

// A interface agora precisa da fotoUrl
interface Sala {
  id: string;
  nome: string;
  capacidade?: number;
  recursos?: string[];
  fotoUrl?: string;
}

interface RoomSectionProps {
  sala: Sala;
  // Esta propriedade vai nos dizer de que lado a imagem deve ficar
  imageSide: 'left' | 'right';
}

export default function RoomSection({ sala, imageSide }: RoomSectionProps) {
  const imageAnimationDirection = imageSide === 'left' ? 'left' : 'right';
  const textAnimationDirection = imageSide === 'left' ? 'right' : 'left';

  return (
    <Flex
      direction={{ base: 'column', md: imageSide === 'left' ? 'row' : 'row-reverse' }}
      align="center"
      justify="center"
      gap={10}
      py={16} // Espaçamento vertical entre cada sala
      minH="60vh" // Garante que cada seção ocupe uma boa parte da tela
    >
      {/* Seção da Imagem */}
      <AnimatedSection direction={imageAnimationDirection}>
        <Box flex="1" w={{ base: '100%', md: '500px' }}>
          {sala.fotoUrl && (
            <Image
              src={sala.fotoUrl}
              alt={`Foto da ${sala.nome}`}
              borderRadius="lg"
              shadow="2xl"
              objectFit="cover"
              maxH="350px"
              w="100%"
            />
          )}
        </Box>
      </AnimatedSection>

      {/* Seção do Texto (Card Clicável) */}
      <AnimatedSection direction={textAnimationDirection}>
        <LinkBox as={VStack} flex="1" align="start" spacing={4}>
          <Heading size="xl">
            <Link href={`/sala/${sala.id}`} passHref>
              <LinkOverlay>{sala.nome}</LinkOverlay>
            </Link>
          </Heading>
          <Text color="gray.300" fontSize="lg">
            Capacidade para até {sala.capacidade} pessoas.
          </Text>
          <Flex wrap="wrap" gap={2}>
            {sala.recursos?.map((recurso, index) => (
              <Badge key={index} colorScheme="gray" variant="subtle">{recurso}</Badge>
            ))}
          </Flex>
          <Badge colorScheme="green" variant="solid" fontSize="md" mt={2}>
            Livre
          </Badge>
          <Link href={`/sala/${sala.id}`} passHref>
             <Button as="a" rightIcon={<ArrowForwardIcon />} mt={4} colorScheme="orange" variant="ghost" _hover={{ bg: 'brand.orange', color: 'white' }}>
                Ver detalhes e reservar
              </Button>
          </Link>
        </LinkBox>
      </AnimatedSection>
    </Flex>
  );
}