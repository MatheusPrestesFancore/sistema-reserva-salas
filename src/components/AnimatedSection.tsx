// src/components/AnimatedSection.tsx
'use client'

// NOVO: Importamos o tipo 'Variants' para ajudar o TypeScript
import { motion, Variants } from 'framer-motion' 
import { Box } from '@chakra-ui/react'

interface AnimatedSectionProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  delay?: number;
}

export default function AnimatedSection({ children, direction = 'left', delay = 0 }: AnimatedSectionProps) {
  // AQUI ESTÁ A CORREÇÃO: Adicionamos ': Variants' para tipar o objeto
  const variants: Variants = {
    hidden: { 
      opacity: 0, 
      x: direction === 'left' ? -100 : 100 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: 'easeOut'
      }
    },
  };

  return (
    <Box as={motion.div}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={variants}
    >
      {children}
    </Box>
  );
}