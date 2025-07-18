import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { updateClaimedListMessage } from '../utils/updateClaimedList.js';
import claimedList from '../data/claimedList.js';
import { RespManager } from '../utils/respManager.js';

export const data = new SlashCommandBuilder()
  .setName('respdel')
  .setDescription('Remove um respawn do usuário.')
  .addIntegerOption(option =>
    option.setName('numero')
      .setDescription('Número do respawn')
      .setRequired(true),
  );

  const respManager = new RespManager();

export async function execute(interaction: ChatInputCommandInteraction) {
  const numero = interaction.options.getInteger('numero', true);
  const userId = interaction.user.id;

  const respawn = claimedList.find(resp => resp.respawnNumber === numero && (resp.userId === userId || resp.userId === "297159646345560065"));

  if (!respawn) {
    return interaction.reply({
      content: `❌ Você não possui o respawn número ${numero} ativo.`,
      flags: 64,
    });
  }

  const index = claimedList.indexOf(respawn);
  if (index !== -1) {
    respManager.nextClaimed(numero);
    claimedList.splice(index, 1);
  }

  await updateClaimedListMessage();

  return interaction.reply({
    content: `✅ O respawn número ${numero} foi removido.`,
    flags: 64,
  });
}
