// src/components/CustomTimeSelect.tsx
'use client'

import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface CustomTimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  timeSlots: string[];
}

export default function CustomTimeSelect({ value, onChange, placeholder, timeSlots }: CustomTimeSelectProps) {
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        w="full"
        textAlign="left"
        fontWeight="normal"
        // --- ESTAS SÃO AS LINHAS QUE MUDAMOS ---
        bg="gray.900" // Um fundo um pouco mais sólido que o anterior
        borderColor="gray.600" // Borda um pouco mais visível
        borderWidth="1px"
        color={value ? 'white' : 'gray.400'} // Texto branco se tiver valor, cinza claro se for placeholder
        _hover={{ borderColor: 'gray.500' }}
        // Destaque laranja ao focar, igual aos outros inputs!
        _focus={{ borderColor: 'brand.orange', boxShadow: '0 0 0 1px #FF7A00' }}
        _expanded={{ borderColor: 'brand.orange' }}
      >
        {value || placeholder}
      </MenuButton>
      <MenuList
        bg="gray.700"
        borderColor="gray.600"
        maxH="250px"
        overflowY="auto"
      >
        {timeSlots.map(time => (
          <MenuItem
            key={time}
            onClick={() => onChange(time)}
            bg="gray.700"
            _hover={{ bg: 'brand.orange', color: 'white' }}
          >
            {time}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}