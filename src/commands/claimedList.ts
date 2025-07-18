import { EmbedBuilder } from 'discord.js';
import claimedList from '../data/claimedList.js';

export async function execute(interaction: any) {

  // Pega a hora atual do servidor (UTC)
  const nowUTC = new Date();

  // Converte para o horário de Brasília (UTC-3 ou UTC-2 no horário de verão)
  const nowBrazil = new Date(nowUTC.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

  const activeRespawns = claimedList.filter(resp => resp.expiration > nowBrazil);

  if (activeRespawns.length === 0) {
    return interaction.reply('Nenhum respawn ativo no momento.');
  }

  const embed = new EmbedBuilder()
    .setTitle('Lista de Respawns Ativos')
    .setColor('#00ff00');

  activeRespawns.forEach(resp => {
    // Formata a hora de expiração para o horário de Brasília
    const expirationBrazilTime = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(resp.expiration);

    console.log("ClaimedList: ", expirationBrazilTime);

    embed.addFields({
      name: `Resp ${resp.respawnNumber}: ${resp.respawnName}`,
      value: `**Usuário:** <@${resp.userId}>  ---  **Expira em:** ${expirationBrazilTime}\n Next: <@${resp.queue}>\n --------------------------------`,
    });
  });

  return interaction.reply({ embeds: [embed] });
}
