import { EmbedBuilder, TextChannel } from 'discord.js';
import claimedList from "../data/claimedList.js";
import { addRespawnToList } from "./claimedListUtils.js";
import { updateClaimedListMessage } from "./updateClaimedList.js";
import { client } from '../index.js';

async function sendEmbed(channelId: string | undefined, embed: EmbedBuilder) {
  if (!channelId) return;
  const channel = await client.channels.fetch(channelId);
  if (!channel?.isTextBased()) return;
  await (channel as TextChannel).send({ embeds: [embed] });
}

export class RespManager {
  async checkExpiration() {
    const now = new Date();
    const expiredRespawns = claimedList.filter(resp => resp.expiration < now);

    if (expiredRespawns.length > 0) {
      try {
        for (const resp of expiredRespawns) {
          const numero = resp.respawnNumber;

          const expiredEmbed = new EmbedBuilder()
            .setColor('#D32F2F')
            .setTitle(`Resp ${numero} finalizado`)
            .setDescription(`O claimed de <@${resp.userId}> terminou.`);

          await sendEmbed(resp.channelId, expiredEmbed);

          if (Array.isArray(resp.queue) && resp.queue.length > 0) {
            const next = resp.queue[0];
            addRespawnToList(next.userId, numero, next.userId, next.channelId);

            const nextEmbed = new EmbedBuilder()
              .setColor('#1976D2')
              .setTitle(`Resp ${numero} iniciado`)
              .setDescription(`O claimed de <@${next.userId}> começou.`);

            await sendEmbed(next.channelId, nextEmbed);
          }

          claimedList.splice(claimedList.indexOf(resp), 1);
        }
        await updateClaimedListMessage();
      } catch (error) {
        console.error(error);
      }
    }
  }
  async nextClaimed(numero: number) {
    const respawns = claimedList.filter(resp => resp.respawnNumber === numero);

    try {
      for (const resp of respawns) {
        if (Array.isArray(resp.queue) && resp.queue.length > 0) {
          const next = resp.queue[0];
          addRespawnToList(next.userId, numero, next.userId, next.channelId);

          const nextEmbed = new EmbedBuilder()
            .setColor('#1976D2')
            .setTitle(`Resp ${numero} iniciado`)
            .setDescription(`O claimed de <@${next.userId}> começou.`);

          await sendEmbed(next.channelId, nextEmbed);
        }
      }
      await updateClaimedListMessage();
    } catch (error) {
      console.error(error);
    }
  }
}
