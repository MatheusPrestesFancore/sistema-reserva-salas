// src/theme.ts
import { extendTheme } from '@chakra-ui/react'

const colors = {
  brand: {
    dark: '#1A202C',      // Um cinza escuro para o fundo
    orange: '#FF7A00',   // Laranja Fancore
    orangeHover: '#E66F00', // Laranja um pouco mais escuro para o hover
  },
}

export const theme = extendTheme({
  colors,
  styles: {
    global: {
      body: {
        bg: 'brand.dark', // Define o fundo global da aplicação
        color: 'white',   // Define a cor do texto global
      },
    },
  },
})