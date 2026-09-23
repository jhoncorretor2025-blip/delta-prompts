// Roda dentro do GitHub Actions a cada ~10 minutos (ver .github/workflows/lembretes-canivete.yml).
// Le a configuracao que o proprio usuario preenche no Canivete (Configuracoes > Notificacoes
// Automaticas), confere a hora atual do Brasil contra academia/vencimentos configurados, e
// dispara um push gratuito via ntfy.sh e, se configurado, tambem via Telegram.
//
// Como e um site estatico sem servidor, o "estado" de quais avisos ja foram mandados hoje
// fica salvo de volta no proprio repositorio (arquivo canivete-notificacoes-estado.json),
// commitado automaticamente pelo workflow depois de cada execucao.

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(process.cwd(), 'canivete-notificacoes-config.json');
const ESTADO_PATH = path.join(process.cwd(), 'canivete-notificacoes-estado.json');

function horaBrasilAgora() {
  const agoraUTC = new Date();
  const agoraBrasil = new Date(agoraUTC.getTime() - 3 * 60 * 60 * 1000);
  return {
    hora: agoraBrasil.getUTCHours(),
    minuto: agoraBrasil.getUTCMinutes(),
    dia: agoraBrasil.getUTCDate(),
    dataISO: agoraBrasil.toISOString().slice(0, 10),
  };
}

function dentroDaJanela(horaConfig, agora, janelaMinutos) {
  const [h, m] = horaConfig.split(':').map(Number);
  const minutosConfig = h * 60 + m;
  const minutosAgora = agora.hora * 60 + agora.minuto;
  const diff = minutosAgora - minutosConfig;
  return diff >= 0 && diff < janelaMinutos;
}

function verificarLembretes(config, agora, jaEnviadosHoje) {
  const paraEnviar = [];
  if (config.academiaHorario && dentroDaJanela(config.academiaHorario, agora, 10)) {
    const chave = 'academia-' + agora.dataISO;
    if (!jaEnviadosHoje.includes(chave)) {
      paraEnviar.push({ chave, titulo: '🏋️ Hora do treino!', corpo: 'Bora pra academia — não esquece de marcar depois.' });
    }
  }
  (config.vencimentos || []).forEach(v => {
    const diasAntes = v.avisarDiasAntes || 0;
    for (let d = 0; d <= diasAntes; d++) {
      const diaAlvo = v.dia - d;
      if (diaAlvo === agora.dia && config.horarioVencimentos && dentroDaJanela(config.horarioVencimentos, agora, 10)) {
        const chave = 'venc-' + v.nome + '-' + agora.dataISO;
        if (!jaEnviadosHoje.includes(chave)) {
          const texto = d === 0 ? `"${v.nome}" vence hoje!` : `"${v.nome}" vence em ${d} dia(s).`;
          paraEnviar.push({ chave, titulo: '💸 Conta chegando', corpo: texto });
        }
      }
    }
  });
  return paraEnviar;
}

async function enviarNtfy(topico, titulo, corpo) {
  if (!topico) return { pulado: true };
  const resposta = await fetch(`https://ntfy.sh/${encodeURIComponent(topico)}`, {
    method: 'POST',
    headers: { Title: titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '') }, // ntfy exige header sem acento
    body: corpo,
  });
  return { ok: resposta.ok, status: resposta.status };
}

async function enviarTelegram(botToken, chatId, titulo, corpo) {
  if (!botToken || !chatId) return { pulado: true };
  const resposta = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: `${titulo}\n${corpo}` }),
  });
  return { ok: resposta.ok, status: resposta.status };
}

async function main() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.log('Nenhum canivete-notificacoes-config.json encontrado — nada a fazer ainda.');
    return;
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  let estado = { dataISO: '', enviados: [] };
  if (fs.existsSync(ESTADO_PATH)) estado = JSON.parse(fs.readFileSync(ESTADO_PATH, 'utf8'));

  const agora = horaBrasilAgora();
  if (estado.dataISO !== agora.dataISO) estado = { dataISO: agora.dataISO, enviados: [] }; // vira o dia, zera

  const paraEnviar = verificarLembretes(config, agora, estado.enviados);
  console.log(`Hora Brasil: ${agora.hora}:${String(agora.minuto).padStart(2, '0')} do dia ${agora.dia}. Lembretes a enviar: ${paraEnviar.length}`);

  for (const lembrete of paraEnviar) {
    const resultadoNtfy = await enviarNtfy(config.ntfyTopic, lembrete.titulo, lembrete.corpo);
    const resultadoTelegram = await enviarTelegram(process.env.TELEGRAM_BOT_TOKEN, config.telegramChatId, lembrete.titulo, lembrete.corpo);
    console.log(`Enviado "${lembrete.chave}" — ntfy:`, resultadoNtfy, '| telegram:', resultadoTelegram);
    estado.enviados.push(lembrete.chave);
  }

  fs.writeFileSync(ESTADO_PATH, JSON.stringify(estado, null, 2));
}

main().catch(e => { console.error('Erro:', e); process.exit(1); });
