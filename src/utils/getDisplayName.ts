import { ChatInputCommandInteraction, GuildMember } from 'discord.js';

export function getDisplayName(interaction: ChatInputCommandInteraction): string {
  const member = interaction.member;
  return member instanceof GuildMember
    ? member.nickname || interaction.user.username
    : interaction.user.username;
}
