import { EmbedBuilder, TextChannel } from 'discord.js';
import { client } from '../index.js';
import claimedList from '../data/claimedList.js';
import { requireEnv } from '../config.js';

let claimedListMessageId: string | null = null;

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

      const nextList = Array.isArray(resp.queue) && resp.queue.length > 0
        ? resp.queue.map(item => `<@${item.userId}>`).join(', ')
        : 'Nenhum';

      embed.addFields({
        name: `Resp ${resp.respawnNumber}: ${resp.respawnName}`,
        value: `**Usuário:** <@${resp.userId}>  ---  **Expira em:** ${expirationBrazilTime}\n Next: ${nextList}\n --------------------------------`,
      });
    });
  }

  const channelId = requireEnv('CLAIMED_LIST_CHANNEL_ID');
  const channel = await client.channels.fetch(channelId);
  if (!channel?.isTextBased()) return;

  let claimedListMessage = null;
  if (claimedListMessageId) {
    try {
      claimedListMessage = await (channel as TextChannel).messages.fetch(claimedListMessageId);
    } catch {
      claimedListMessage = null;
      claimedListMessageId = null;
    }
  }

  if (!claimedListMessage) {
    const messages = await (channel as TextChannel).messages.fetch({ limit: 50 });
    claimedListMessage = messages.find(msg => msg.author.id === client.user?.id) ?? null;
  }

  if (claimedListMessage) {
    await claimedListMessage.edit({ embeds: [embed] });
    claimedListMessageId = claimedListMessage.id;
  } else {
    const sent = await (channel as TextChannel).send({ embeds: [embed] });
    claimedListMessageId = sent.id;
  }
}


