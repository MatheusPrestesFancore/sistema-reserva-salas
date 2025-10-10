// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/src/context/AuthContext'
import Login from '@/src/components/Login'
import { Providers } from './providers' // <-- IMPORTE O NOVO ARQUIVO

const inter = Inter({ subsets: ['latin'] })

// Podemos adicionar o metadata de volta agora!
export const metadata: Metadata = {
  title: 'Sistema de Reservas Fancore',
  description: 'Sistema de agendamento de salas de reunião',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <AuthProvider>
          <Providers> {/* <-- USE O COMPONENTE PROVIDERS AQUI */}
            <header>
              <Login />
            </header>
            <main>
              {children}
            </main>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}