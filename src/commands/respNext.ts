import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import claimedList from '../data/claimedList.js';
import { updateClaimedListMessage } from '../utils/updateClaimedList.js';
import { RESPAWNS } from '../data/respawns.js';

export const data = new SlashCommandBuilder()
  .setName('respnext')
  .setDescription('Mostra quem é o próximo na fila de um respawn')
  .addIntegerOption(option =>
    option.setName('numero')
      .setDescription('Número do respawn')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const numero = interaction.options.getInteger('numero', true);
  const userId = interaction.user.id;

  if (!RESPAWNS[numero]) {
    return interaction.reply({
      content: 'Numero de respawn invalido.',
      ephemeral: true,
    });
  }

  const rawRespawn = claimedList.find(resp => resp.respawnNumber === numero);
  if (!rawRespawn) {
    return interaction.reply({
      content: `Respawn está livre, use o comando \`/resp ${numero}\`.`,
      ephemeral: true,
    });
  }

  const respawn = rawRespawn as { respawnNumber: number; userId?: string; timestamp?: number; queue: string[] };

  // Garante que a fila exista
  if (!Array.isArray(respawn.queue)) {
    respawn.queue = [];
  }

  // Se a fila estiver vazia, adiciona o usuário
  if (respawn.queue.length === 0) {
    respawn.queue.push(userId);
    await updateClaimedListMessage();
    return interaction.reply({
      content: `Você foi adicionado na fila para o respawn número ${numero}.`,
      ephemeral: true,
    });
  }

  const proximoId = respawn.queue[0];

  // Se chegou a vez do usuário
  if (proximoId === userId) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('aceitar').setLabel('✅ Sim').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('recusar').setLabel('❌ Não').setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: `🎯 Está na hora do seu claimed do respawn número ${numero}. Deseja continuar?`,
      components: [row],
      ephemeral: true,
    });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000,
    });

    collector?.on('collect', async btn => {
      if (btn.user.id !== userId) {
        return btn.reply({ content: '❌ Você não tem permissão para interagir com este botão.', ephemeral: true });
      }

      if (btn.customId === 'aceitar') {
        respawn.userId = userId;
        (respawn as any).timestamp = Date.now(); // marca como claimed
        respawn.queue.shift();
        await updateClaimedListMessage();

        await btn.update({
          content: `✅ Você confirmou e agora está com o claimed ativo para o respawn número ${numero}.`,
          components: [],
        });

        collector.stop();
      }

      if (btn.customId === 'recusar') {
        respawn.queue.shift();
        await updateClaimedListMessage();

        await btn.update({
          content: `❌ Claimed recusado. O próximo da fila será notificado.`,
          components: [],
        });

        collector.stop();

        // Notifica o próximo
        const nextUserId = respawn.queue[0];
        if (nextUserId) {
          const fakeInteraction = {
            user: { id: nextUserId },
            options: { getInteger: () => numero },
            reply: async () => { },
            channel: interaction.channel,
            guild: interaction.guild,
          } as unknown as ChatInputCommandInteraction;

          await execute(fakeInteraction);
        }
      }
    });

    collector?.on('end', async collected => {
      if (collected.size === 0) {
        respawn.queue.shift();
        await updateClaimedListMessage();

        await interaction.editReply({
          content: `⏱️ Tempo esgotado. O claimed foi cancelado.`,
          components: [],
        });

        const nextUserId = respawn.queue[0];
        if (nextUserId) {
          const fakeInteraction = {
            user: { id: nextUserId },
            options: { getInteger: () => numero },
            reply: async () => { },
            channel: interaction.channel,
            guild: interaction.guild,
          } as unknown as ChatInputCommandInteraction;

          await execute(fakeInteraction);
        }
      }
    });
  } else {
    return interaction.reply({
      content: `A fila para o respawn número ${numero} é: ${respawn.queue.map(id => `<@${id}>`).join(', ')}`,
      ephemeral: true,
    });
  }
}
