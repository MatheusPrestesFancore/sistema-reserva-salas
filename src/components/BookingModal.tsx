// src/components/BookingModal.tsx
'use client';

import { useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, query, where, getDocs, or, and } from 'firebase/firestore'; 
import { useAuth } from '@/src/context/AuthContext';
import CustomTimeSelect from './CustomTimeSelect'; 

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  HStack,
  FormErrorMessage,
  Text,
} from '@chakra-ui/react';

interface BookingModalProps {
  salaId: string;
  onClose: () => void;
}

const generateTimeSlots = () => {
  const slots = [];
  for (let i = 8; i < 22; i++) {
    slots.push(`${String(i).padStart(2, '0')}:00`);
    slots.push(`${String(i).padStart(2, '0')}:30`);
  }
  return slots;
};

export default function BookingModal({ salaId, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState(''); 
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) { setError('Você precisa estar logado para fazer uma reserva.'); return; }
    
    if (!titulo || !data || !horaInicio || !horaFim) {
      setError('Por favor, preencha todos os campos.'); return;
    }

    setLoading(true);

    const inicioTimestamp = Timestamp.fromDate(new Date(`${data}T${horaInicio}`));
    const fimTimestamp = Timestamp.fromDate(new Date(`${data}T${horaFim}`));

    if (fimTimestamp <= inicioTimestamp) {
      setError('O horário de término deve ser posterior ao horário de início.');
      setLoading(false);
      return;
    }

    try {
      const reservasRef = collection(db, 'reservas');
      const q = query(reservasRef, and(
        where('salaId', '==', salaId), 
        or(
          and(where('inicio', '>=', inicioTimestamp), where('inicio', '<', fimTimestamp)), 
          and(where('fim', '>', inicioTimestamp), where('fim', '<=', fimTimestamp)), 
          and(where('inicio', '<', inicioTimestamp), where('fim', '>', fimTimestamp))
        )
      ));
      
      const conflitosSnapshot = await getDocs(q);

      if (!conflitosSnapshot.empty) {
        setError('Este horário já está reservado. Por favor, escolha outro período.');
        setLoading(false);
        return;
      }
      
      const novaReserva = {
        salaId: salaId,
        titulo: titulo,
        usuarioEmail: user.email,
        usuarioNome: user.displayName,
        inicio: inicioTimestamp,
        fim: fimTimestamp,
      };

      await addDoc(reservasRef, novaReserva);
      alert('Sala reservada com sucesso!');
      onClose();

    } catch (err) {
      console.error("Erro ao criar reserva: ", err);
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Nova Reserva</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!error}>
                <FormLabel>Título da Reunião</FormLabel>
                <Input
                  placeholder="Ex: Reunião de Alinhamento"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  focusBorderColor="brand.orange"
                />
              </FormControl>

              {/* ALTERAÇÃO: Fundo escuro nativo e ícone invertido para branco */}
              <FormControl isInvalid={!!error}>
                <FormLabel>Data da Reserva</FormLabel>
                <Input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  focusBorderColor="brand.orange"
                  color="white" // Garante que a data digitada fique branca
                  sx={{
                    "&::-webkit-calendar-picker-indicator": {
                      cursor: "pointer",
                      filter: "invert(1)", // <-- O TRUQUE MÁGICO: Inverte o ícone preto para branco!
                    },
                  }}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isInvalid={!!error}>
                  <FormLabel>Início</FormLabel>
                  <CustomTimeSelect
                    placeholder="Hora"
                    value={horaInicio}
                    onChange={setHoraInicio}
                    timeSlots={timeSlots}
                  />
                </FormControl>

                <FormControl isInvalid={!!error}>
                  <FormLabel>Término</FormLabel>
                  <CustomTimeSelect
                    placeholder="Hora"
                    value={horaFim}
                    onChange={setHoraFim}
                    timeSlots={timeSlots}
                  />
                </FormControl>
              </HStack>
              
              {error && <Text color="red.400" fontSize="sm">{error}</Text>}
            </VStack>
          </form>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} _hover={{ bg: 'whiteAlpha.200' }}>
            Cancelar
          </Button>
          <Button
            bg="brand.orange"
            color="white"
            _hover={{ bg: 'brand.orangeHover' }}
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Verificando..."
          >
            Confirmar Reserva
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}