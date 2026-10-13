// Motor remoto único: lembretes financeiros do Canivete + lembretes de saúde via GitHub Secret.
// O JSON de saúde é recebido por MINHA_SAUDE_LEMBRETES_JSON e nunca é gravado no repositório.
// Estado público contém apenas chaves de deduplicação com hash, sem nomes ou detalhes médicos.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const CONFIG_PATH = path.join(process.cwd(), 'canivete-notificacoes-config.json');
const ESTADO_PATH = path.join(process.cwd(), 'canivete-notificacoes-estado.json');
const WINDOW_DAILY_MINUTES = 15;
const WINDOW_ONCE_MINUTES = 20;

function horaBrasilAgora() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23'
  }).formatToParts(new Date()).reduce((o, p) => (o[p.type] = p.value, o), {});
  const weekdays = {Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6};
  return {
    hora: Number(parts.hour), minuto: Number(parts.minute), dia: Number(parts.day),
    dataISO: parts.year + '-' + parts.month + '-' + parts.day,
    diaSemana: weekdays[parts.weekday]
  };
}
function dentroDaJanela(horaConfig, agora, janelaMinutos) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(horaConfig || ''))) return false;
  const [h, m] = horaConfig.split(':').map(Number);
  const diff = (agora.hora * 60 + agora.minuto) - (h * 60 + m);
  return diff >= 0 && diff < janelaMinutos;
}
function hashId(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
}
function parseLocalDateTime(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(value || ''));
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]) + 3, Number(m[5]));
}
function verificarLembretes(config, agora, jaEnviadosHoje, healthConfig, agoraMs) {
  const paraEnviar = [];
  if (config.academiaHorario && dentroDaJanela(config.academiaHorario, agora, 10)) {
    const chave = 'academia-' + agora.dataISO;
    if (!jaEnviadosHoje.includes(chave)) {
      paraEnviar.push({ chave, titulo: '🏋️ Hora do treino!', corpo: 'Bora pra academia — não esquece de marcar depois.', canal: 'canivete' });
    }
  }
  (config.vencimentos || []).forEach(v => {
    const diasAntes = Math.max(0, Math.min(15, Number(v.avisarDiasAntes) || 0));
    for (let d = 0; d <= diasAntes; d++) {
      const diaAlvo = Number(v.dia) - d;
      if (diaAlvo === agora.dia && config.horarioVencimentos && dentroDaJanela(config.horarioVencimentos, agora, 10)) {
        const chave = 'venc-' + v.nome + '-' + agora.dataISO;
        if (!jaEnviadosHoje.includes(chave)) {
          const texto = d === 0 ? '"' + v.nome + '" vence hoje!' : '"' + v.nome + '" vence em ' + d + ' dia(s).';
          paraEnviar.push({ chave, titulo: '💸 Conta chegando', corpo: texto, canal: 'canivete' });
        }
      }
    }
  });
  const now = Number(agoraMs || Date.now());
  const reminders = Array.isArray(healthConfig && healthConfig.reminders) ? healthConfig.reminders : [];
  reminders.forEach(r => {
    if (!r || r.enabled === false || !r.id) return;
    const title = String(r.title || '🔔 Lembrete de saúde').slice(0, 180);
    const body = String(r.body || 'Você tem um lembrete de saúde.').slice(0, 1500);
    if (r.type === 'daily') {
      if (!dentroDaJanela(r.time, agora, WINDOW_DAILY_MINUTES)) return;
      const key = 'health-daily-' + hashId(r.id) + '-' + agora.dataISO;
      if (!jaEnviadosHoje.includes(key)) paraEnviar.push({ chave: key, titulo: title, corpo: body, canal: 'saude' });
    } else if (r.type === 'once') {
      const scheduled = parseLocalDateTime(r.datetime);
      if (!Number.isFinite(scheduled)) return;
      const minutesBefore = Math.max(0, Math.min(1440, Number(r.minutesBefore) || 0));
      const notifyAt = scheduled - minutesBefore * 60000;
      const diff = now - notifyAt;
      const key = 'health-once-' + hashId(r.id);
      if (diff >= 0 && diff < WINDOW_ONCE_MINUTES * 60000 && !jaEnviadosHoje.includes(key)) {
        paraEnviar.push({ chave: key, titulo: title, corpo: body, canal: 'saude' });
      }
    }
  });
  return paraEnviar;
}
async function enviarNtfy(topico, titulo, corpo) {
  if (!topico) return { pulado: true, ok: false };
  const resposta = await fetch('https://ntfy.sh/' + encodeURIComponent(topico), {
    method: 'POST',
    headers: { Title: titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '') },
    body: corpo,
  });
  return { ok: resposta.ok, status: resposta.status };
}
async function enviarTelegram(botToken, chatId, titulo, corpo) {
  if (!botToken || !chatId) return { pulado: true, ok: false };
  const resposta = await fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: titulo + '\n' + corpo }),
  });
  return { ok: resposta.ok, status: resposta.status };
}
function lerConfigSaude() {
  const raw = process.env.MINHA_SAUDE_LEMBRETES_JSON;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.reminders)) throw new Error('Formato inválido');
    return parsed;
  } catch (e) {
    console.error('MINHA_SAUDE_LEMBRETES_JSON não é um JSON válido com a lista reminders.');
    process.exitCode = 1;
    return null;
  }
}
async function main() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.log('Arquivo de configuração do Canivete não encontrado.');
    return;
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const healthConfig = lerConfigSaude();
  let estado = { dataISO: '', enviados: [] };
  if (fs.existsSync(ESTADO_PATH)) {
    try { estado = JSON.parse(fs.readFileSync(ESTADO_PATH, 'utf8')); } catch (_) {}
  }
  const agora = horaBrasilAgora();
  if (estado.dataISO !== agora.dataISO) estado = { dataISO: agora.dataISO, enviados: [] };
  const paraEnviar = verificarLembretes(config, agora, estado.enviados || [], healthConfig, Date.now());
  console.log('Hora de Brasília: ' + agora.hora + ':' + String(agora.minuto).padStart(2, '0') + '. Avisos pendentes: ' + paraEnviar.length);
  for (const lembrete of paraEnviar) {
    const saude = lembrete.canal === 'saude';
    const ntfyTopic = saude ? String(healthConfig && healthConfig.ntfyTopic || '') : String(config.ntfyTopic || '');
    const telegramChatId = saude ? String(healthConfig && healthConfig.telegramChatId || '') : String(config.telegramChatId || '');
    const resultadoNtfy = await enviarNtfy(ntfyTopic, lembrete.titulo, lembrete.corpo);
    const resultadoTelegram = await enviarTelegram(process.env.TELEGRAM_BOT_TOKEN, telegramChatId, lembrete.titulo, lembrete.corpo);
    const enviado = resultadoNtfy.ok || resultadoTelegram.ok;
    console.log('Canal ' + lembrete.canal + ' — ntfy: ' + (resultadoNtfy.ok ? 'ok' : 'indisponível/falhou') + ', Telegram: ' + (resultadoTelegram.ok ? 'ok' : 'indisponível/falhou'));
    if (enviado) estado.enviados.push(lembrete.chave);
    else console.warn('Nenhum canal de envio confirmou a entrega; o lembrete poderá ser tentado novamente.');
  }
  estado.enviados = Array.from(new Set(estado.enviados || []));
  fs.writeFileSync(ESTADO_PATH, JSON.stringify(estado, null, 2) + '\n');
}
main().catch(e => { console.error('Erro no motor de notificações:', e.message); process.exit(1); });
