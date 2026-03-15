import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
  PermissionsBitField,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ButtonInteraction,
  MessageFlags,
} from 'discord.js';
import { requireEnv } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Confirma e apaga mensagens de um canal.')
  .addIntegerOption(option =>
    option
      .setName('quantidade')
      .setDescription('Quantidade de mensagens para apagar (máx: 100)')
      .setMinValue(1)
      .setMaxValue(100)
  )
  .addChannelOption(option =>
    option
      .setName('canal')
      .setDescription('Canal onde as mensagens serão apagadas')
      .addChannelTypes(ChannelType.GuildText)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const member = await interaction.guild?.members.fetch(interaction.user.id);
  const roleId = requireEnv('CLEAR_ALLOWED_ROLE_ID');
  if (!member?.roles.cache.has(roleId)) {
    return interaction.reply({
      content: '❌ Você não tem permissão para usar este comando.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const quantidade = interaction.options.getInteger('quantidade') ?? 50;
  const canalSelecionado = interaction.options.getChannel('canal') as TextChannel;
  const canal = canalSelecionado ?? interaction.channel;

    console.log('🧪 Clear iniciado');

  if (!interaction.guild || !canal || canal.type !== ChannelType.GuildText) {
    return interaction.reply({ content: '❌ Canal inválido ou não é de texto.', flags: MessageFlags.Ephemeral });
  }

  const membroBot = interaction.guild.members.me;
  if (!membroBot?.permissionsIn(canal).has(PermissionsBitField.Flags.ManageMessages)) {
    return interaction.reply({ content: '❌ Não tenho permissão para apagar mensagens nesse canal.', flags: MessageFlags.Ephemeral });
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('confirmar').setLabel('✅ Sim').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('cancelar').setLabel('❌ Cancelar').setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({
    content: `Tem certeza que deseja apagar **${quantidade} mensagens** do canal ${canal.toString()}?`,
    components: [row],
    flags: MessageFlags.Ephemeral,
  });

  const collector = interaction.channel?.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 15_000,
  });

  collector?.on('collect', async (btn: ButtonInteraction) => {
    if (btn.user.id !== interaction.user.id) {
      return btn.reply({ content: '❌ Apenas quem executou o comando pode confirmar.', flags: MessageFlags.Ephemeral });
    }

    if (btn.customId === 'confirmar') {
      try {
        const mensagens = await canal.messages.fetch({ limit: quantidade });
        const recentes = mensagens.filter(
          msg => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000
        );

        await canal.bulkDelete(recentes, true);
        await btn.update({
          content: `✅ Foram apagadas ${recentes.size} mensagens de ${canal.toString()}.`,
          components: [],
        });
      } catch (err) {
        console.error('Erro ao apagar mensagens:', err);
        await btn.update({ content: '❌ Erro ao tentar apagar as mensagens.', components: [] });
      }
    }

    if (btn.customId === 'cancelar') {
      await btn.update({ content: '❌ Ação cancelada.', components: [] });
    }

    collector.stop();
  });

  collector?.on('end', async collected => {
    if (collected.size === 0) {
      await interaction.editReply({
        content: '⏱️ Tempo esgotado. Ação cancelada.',
        components: [],
      });
    }
  });
}
