// src/components/BookingModal.tsx
'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, query, where, getDocs, or, and } from 'firebase/firestore'; 
import { useAuth } from '@/src/context/AuthContext';

interface BookingModalProps {
  salaId: string;
  onClose: () => void;
}

export default function BookingModal({ salaId, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) { /* ... validações ... */ return; }
    if (!titulo || !inicio || !fim) { /* ... validações ... */ return; }

    setLoading(true);

    const inicioTimestamp = Timestamp.fromDate(new Date(inicio));
    const fimTimestamp = Timestamp.fromDate(new Date(fim));

    if (fimTimestamp <= inicioTimestamp) { /* ... validações ... */ setLoading(false); return; }

    try {
      const reservasRef = collection(db, 'reservas');
      
      // --- SINTAXE DA CONSULTA FINAL E CORRETA ---
      const q = query(
        reservasRef,
        // Usamos um 'and' principal para combinar a busca pela sala com a verificação de conflito de horário
        and(
          where('salaId', '==', salaId),
          or(
            and(
              where('inicio', '>=', inicioTimestamp),
              where('inicio', '<', fimTimestamp)
            ),
            and(
              where('fim', '>', inicioTimestamp),
              where('fim', '<=', fimTimestamp)
            ),
            and(
              where('inicio', '<', inicioTimestamp),
              where('fim', '>', fimTimestamp)
            )
          )
        )
      );
      
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
      console.error("Erro ao verificar ou criar reserva: ", err);
      setError('Ocorreu um erro inesperado. Verifique o console do navegador.');
    } finally {
      setLoading(false);
    }
  };

  // O return com o JSX continua igual
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 100
    }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '400px', color: 'black' }}>
        <h2>Nova Reserva</h2>
        {/* ... o resto do JSX ... */}
        <form onSubmit={handleSubmit}>
          {/* ... inputs ... */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Título da Reunião</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Início</label>
            <input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Fim</label>
            <input type="datetime-local" value={fim} onChange={(e) => setFim(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" style={{ fontWeight: 'bold' }} disabled={!user || loading}>
              {loading ? 'Verificando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}