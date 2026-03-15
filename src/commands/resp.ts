import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { addRespawnToList } from '../utils/claimedListUtils.js';
import { updateClaimedListMessage } from '../utils/updateClaimedList.js';
import { getDisplayName } from '../utils/getDisplayName.js';
import claimedList from '../data/claimedList.js';
import { RESPAWNS } from '../data/respawns.js';

export const data = new SlashCommandBuilder()
    .setName('resp')
    .setDescription('Cria um resp')
    .addIntegerOption(option =>
        option.setName('numero')
            .setDescription('Número do resp')
            .setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply();
    }
    console.log('✅ Comando /resp iniciado');

    const numero = interaction.options.getInteger('numero', true);
    const userId = interaction.user.id;

    if (!RESPAWNS[numero]) {
        return interaction.editReply({ content: 'Numero de respawn invalido.' });
    }

    console.log(`➡️ Respawn número: ${numero} | UserID: ${userId}`);
    console.log('🧪 claimedList:', claimedList);

    const existing = claimedList.find(r => r.respawnNumber === numero);
    if (existing) {
        if (existing.userId === userId) {
            return interaction.editReply({ content: 'Você já tem esse respawn.' });
        } else {
            return interaction.editReply({ content: 'Respawn já ocupado.' });
        }
    }

    const nickname = getDisplayName(interaction);
    console.log('✅ Respawn livre, adicionando novo');

    addRespawnToList(userId, numero, nickname, interaction.channelId);
    await updateClaimedListMessage();

    const respawnName = RESPAWNS[numero];
    const embed = new EmbedBuilder()
        .setColor('#0E7A0D')
        .setTitle(`Resp ${numero} : ${respawnName}`)
        .setDescription(`**Usuário:** ${nickname}`)
        .setFooter({ text: `Respawn atribuído com sucesso!` });

    console.log('✅ Embed pronto, enviando...');
    await interaction.editReply({ embeds: [embed] });
}
