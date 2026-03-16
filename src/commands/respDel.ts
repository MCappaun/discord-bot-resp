import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { updateClaimedListMessage } from '../utils/updateClaimedList.js';
import claimedList from '../data/claimedList.js';
import { RespManager } from '../utils/respManager.js';
import { requireEnv } from '../config.js';
import { RESPAWNS } from '../data/respawns.js';

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
  if (!interaction.deferred && !interaction.replied) {
    try {
      await interaction.deferReply({ flags: 64 });
    } catch (error: any) {
      if (error?.code === 10062) {
        console.warn('Interacao expirada ao deferReply (/respdel).');
        return;
      }
      throw error;
    }
  }
  const numero = interaction.options.getInteger('numero', true);
  const userId = interaction.user.id;

  if (!RESPAWNS[numero]) {
    return interaction.editReply({
      content: 'Numero de respawn invalido.',
    });
  }

  const adminUserId = requireEnv('ADMIN_USER_ID');
  const respawn = claimedList.find(resp => resp.respawnNumber === numero && (resp.userId === userId || resp.userId === adminUserId));

  if (!respawn) {
    return interaction.editReply({
      content: `❌ Você não possui o respawn número ${numero} ativo.`,
    });
  }

  const index = claimedList.indexOf(respawn);
  if (index !== -1) {
    respManager.nextClaimed(numero);
    claimedList.splice(index, 1);
  }

  await updateClaimedListMessage();

  return interaction.editReply({
    content: `✅ O respawn número ${numero} foi removido.`,
  });
}
