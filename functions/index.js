// functions/index.js

const functions = require("firebase-functions/v1");
const { google } = require("googleapis");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");

// Inicializa o app do Firebase Admin (para a função poder acessar o Firestore)
initializeApp();

// --- CONFIGURAÇÃO IMPORTANTE ---
// Cole aqui o ID da sua agenda (veja abaixo como pegar)
const CALENDAR_ID = "be31954cb0bbfec58cb8c51fe33cbd73bdabddf54566463210d86ce768681b41@group.calendar.google.com";
// ------------------------------

// Configura a autenticação do "robô".
// Como estamos rodando DENTRO do Google, não precisamos de senha.
// Ele automaticamente usa a conta de serviço padrão.
const auth = new google.auth.GoogleAuth({
  scopes: "https://www.googleapis.com/auth/calendar",
});

const calendar = google.calendar({ version: "v3", auth });

/**
 * Função 1: Chamada quando uma NOVA reserva é criada no Firestore.
 * Ela cria o evento correspondente no Google Calendar.
 */
exports.criarEventoNoGoogleAgenda = functions
  .region("southamerica-east1") // Opcional, mas bom para rodar no Brasil
  .firestore.document("reservas/{reservaId}")
  .onCreate(async (snap, context) => {
    const dadosReserva = snap.data();
    const reservaId = context.params.reservaId;

    console.log(`Nova reserva detectada: ${reservaId}. Criando evento...`);

    // Busca o nome da sala no Firestore
    let nomeDaSala = "Sala"; // Valor padrão
    try {
      const salaDoc = await getFirestore()
        .collection("salas")
        .doc(dadosReserva.salaId)
        .get();
      if (salaDoc.exists) {
        nomeDaSala = salaDoc.data().nome;
      }
    } catch (e) {
      console.error("Erro ao buscar nome da sala:", e);
    }

    const evento = {
      summary: `Reserva: ${nomeDaSala} (${dadosReserva.titulo})`,
      description: `Reservado por: ${dadosReserva.usuarioNome}\nE-mail: ${dadosReserva.usuarioEmail}`,
      start: {
        dateTime: dadosReserva.inicio.toDate().toISOString(),
        timeZone: "America/Sao_Paulo", // Ajuste se seu fuso for outro
      },
      end: {
        dateTime: dadosReserva.fim.toDate().toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      // Adiciona quem reservou como convidado
      //attendees: [{ email: dadosReserva.usuarioEmail }],
    };

    try {
      const response = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        resource: evento,
      });

      const eventId = response.data.id;
      console.log(`Evento criado com sucesso: ${eventId}`);

      // Salva o ID do evento do Google de volta no Firestore
      await snap.ref.update({ googleCalendarEventId: eventId });
      console.log(`ID do evento salvo no Firestore: ${reservaId}`);
    } catch (error) {
      console.error("Erro ao criar evento no Google Calendar:", error);
    }
  });

/**
 * Função 2: Chamada quando uma reserva é DELETADA no Firestore.
 * Ela deleta o evento correspondente no Google Calendar.
 */
exports.deletarEventoNoGoogleAgenda = functions
  .region("southamerica-east1")
  .firestore.document("reservas/{reservaId}")
  .onDelete(async (snap, context) => {
    const dadosCancelados = snap.data();

    // Se a reserva tinha um ID do Google Calendar salvo...
    if (dadosCancelados.googleCalendarEventId) {
      const eventId = dadosCancelados.googleCalendarEventId;
      console.log(`Reserva deletada. Deletando evento ${eventId} do Google Calendar...`);

      try {
        await calendar.events.delete({
          calendarId: CALENDAR_ID,
          eventId: eventId,
        });
        console.log(`Evento ${eventId} deletado com sucesso.`);
      } catch (error) {
        console.error(`Erro ao deletar evento ${eventId}:`, error);
      }
    } else {
      console.log("Reserva cancelada não possuía ID de evento no Google Calendar.");
    }
  });