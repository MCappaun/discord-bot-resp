import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import claimedList from '../data/claimedList.js';
import { updateClaimedListMessage } from '../utils/updateClaimedList.js';
import { RESPAWNS } from '../data/respawns.js';

export const data = new SlashCommandBuilder()
  .setName('respdelnext')
  .setDescription('Remove o usuario da fila (next) de um respawn')
  .addIntegerOption(option =>
    option.setName('numero')
      .setDescription('Numero do respawn')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const numero = interaction.options.getInteger('numero', true);
  const userId = interaction.user.id;

  if (!RESPAWNS[numero]) {
    return interaction.reply({ content: 'Numero de respawn invalido.', ephemeral: true });
  }

  const respawn = claimedList.find(resp => resp.respawnNumber === numero);
  if (!respawn) {
    return interaction.reply({
      content: `Respawn ${numero} nao esta ativo no momento.`,
      ephemeral: true,
    });
  }

  if (!Array.isArray(respawn.queue)) {
    respawn.queue = [];
  }

  if (!respawn.queue.includes(userId)) {
    return interaction.reply({
      content: `Voce nao esta na fila do respawn ${numero}.`,
      ephemeral: true,
    });
  }

  respawn.queue = respawn.queue.filter(id => id !== userId);
  await updateClaimedListMessage();

  return interaction.reply({
    content: `Voce foi removido da fila do respawn ${numero}.`,
    ephemeral: true,
  });
}
