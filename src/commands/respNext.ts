import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import claimedList from '../data/claimedList.js';
import { updateClaimedListMessage } from '../utils/updateClaimedList.js';
import { RESPAWNS } from '../data/respawns.js';

export const data = new SlashCommandBuilder()
  .setName('respnext')
  .setDescription('Mostra quem e o proximo na fila de um respawn')
  .addIntegerOption(option =>
    option.setName('numero')
      .setDescription('Numero do respawn')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.deferred && !interaction.replied) {
    try {
      await interaction.deferReply();
    } catch (error: any) {
      if (error?.code === 10062) {
        console.warn('Interacao expirada ao deferReply (/respnext).');
        return;
      }
      throw error;
    }
  }
  console.log('✅ Comando /respnext iniciado');
  const numero = interaction.options.getInteger('numero', true);
  const userId = interaction.user.id;

  console.log(`➡️ Respawn número: ${numero} | UserID: ${userId}`);
  console.log('🧪 claimedList:', claimedList);

  if (!RESPAWNS[numero]) {
    console.log('❌ Numero de respawn invalido');
    const embed = new EmbedBuilder()
      .setColor('#D32F2F')
      .setTitle('Respawn invalido')
      .setDescription('Numero de respawn invalido.');
    return interaction.editReply({ embeds: [embed], components: [] });
  }

  const rawRespawn = claimedList.find(resp => resp.respawnNumber === numero);
  if (!rawRespawn) {
    console.log('ℹ️ Respawn livre, orientando usar /resp');
    const embed = new EmbedBuilder()
      .setColor('#1976D2')
      .setTitle(`Resp ${numero} livre`)
      .setDescription(`Respawn esta livre, use o comando \`/resp ${numero}\`.`);
    return interaction.editReply({ embeds: [embed], components: [] });
  }

  const respawn = rawRespawn as {
    respawnNumber: number;
    userId?: string;
    timestamp?: number;
    channelId?: string;
    queue: { userId: string; channelId: string }[];
  };

  if (!Array.isArray(respawn.queue)) {
    respawn.queue = [];
  }

  if (respawn.queue.length === 0) {
    console.log('✅ Fila vazia, adicionando usuario ao next');
    respawn.queue.push({ userId, channelId: interaction.channelId });
    await updateClaimedListMessage();
    const embed = new EmbedBuilder()
      .setColor('#388E3C')
      .setTitle(`Resp ${numero} - Next`)
      .setDescription(`Voce foi adicionado na fila para o respawn numero ${numero}.`);
    return interaction.editReply({ embeds: [embed], components: [] });
  }

  const proximoId = respawn.queue[0].userId;
  console.log(`🔎 Proximo da fila: ${proximoId}`);

  if (proximoId === userId) {
    console.log('✅ Usuario e o proximo da fila, solicitando confirmacao');
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('aceitar').setLabel('✅ Sim').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('recusar').setLabel('❌ Nao').setStyle(ButtonStyle.Danger)
    );

    const embed = new EmbedBuilder()
      .setColor('#1976D2')
      .setTitle(`Resp ${numero} - Sua vez`)
      .setDescription(`Esta na hora do seu claimed do respawn numero ${numero}. Deseja continuar?`);

    await interaction.editReply({ embeds: [embed], components: [row] });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000,
    });

    collector?.on('collect', async btn => {
      if (btn.user.id !== userId) {
        return btn.reply({ content: '❌ Voce nao tem permissao para interagir com este botao.', flags: MessageFlags.Ephemeral });
      }

      if (btn.customId === 'aceitar') {
        console.log('✅ Usuario confirmou o claimed');
        respawn.userId = userId;
        (respawn as any).timestamp = Date.now();
        respawn.channelId = interaction.channelId;
        respawn.queue.shift();
        await updateClaimedListMessage();

        await btn.update({
          content: `✅ Voce confirmou e agora esta com o claimed ativo para o respawn numero ${numero}.`,
          components: [],
        });

        collector.stop();
      }

      if (btn.customId === 'recusar') {
        console.log('❌ Usuario recusou o claimed');
        respawn.queue.shift();
        await updateClaimedListMessage();

        await btn.update({
          content: '❌ Claimed recusado. O proximo da fila sera notificado.',
          components: [],
        });

        collector.stop();

        const nextUserId = respawn.queue[0]?.userId;
        if (nextUserId) {
          const fakeInteraction = {
            user: { id: nextUserId },
            options: { getInteger: () => numero },
            reply: async () => {},
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
          content: '⏱️ Tempo esgotado. O claimed foi cancelado.',
          components: [],
        });

        const nextUserId = respawn.queue[0]?.userId;
        if (nextUserId) {
          const fakeInteraction = {
            user: { id: nextUserId },
            options: { getInteger: () => numero },
            reply: async () => {},
            channel: interaction.channel,
            guild: interaction.guild,
          } as unknown as ChatInputCommandInteraction;

          await execute(fakeInteraction);
        }
      }
    });
  } else {
    console.log('ℹ️ Usuario nao e o proximo, mostrando fila');
    const embed = new EmbedBuilder()
      .setColor('#1976D2')
      .setTitle(`Resp ${numero} - Fila`)
      .setDescription(`A fila para o respawn numero ${numero} e: ${respawn.queue.map(item => `<@${item.userId}>`).join(', ')}`);
    return interaction.editReply({ embeds: [embed], components: [] });
  }
}
