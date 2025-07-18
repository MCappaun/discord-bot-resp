import { EmbedBuilder, TextChannel } from 'discord.js';
import { client } from '../index.js';
import claimedList from '../data/claimedList.js';

export async function updateClaimedListMessage() {
  const embed = new EmbedBuilder()
    .setTitle('Lista de Respawns Ativos')
    .setColor('#00ff00');

  if (claimedList.length === 0) {
    embed.setDescription('Nenhum respawn ativo no momento.');
  } else {
    claimedList.forEach(resp => {
      const expirationBrazilTime = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(resp.expiration);

      console.log("Update ClaimedList: ", expirationBrazilTime);

      embed.addFields({
        name: `Resp ${resp.respawnNumber}: ${resp.respawnName}`,
        value: `**Usuário:** <@${resp.userId}>  ---  **Expira em:** ${expirationBrazilTime}\n Next: <@${resp.queue}>\n --------------------------------`,
      });
    });
  }

  const channel = await client.channels.fetch('1344099311440629851');
  if (!channel?.isTextBased()) return;

  const messages = await (channel as TextChannel).messages.fetch();
  const claimedListMessage = messages.find(msg => msg.author.id === client.user?.id);

  if (claimedListMessage) {
    await claimedListMessage.edit({ embeds: [embed] });
  } else {
    await (channel as TextChannel).send({ embeds: [embed] });
  }
}


