import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import { handleInteraction } from './handlers/interactionHandler.js';
import { RespManager } from './utils/respManager.js';

const respManager = new RespManager();


export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', () => {
  console.log(`Bot online como ${client.user?.tag}`);
});

client.on('interactionCreate', handleInteraction);

client.login(process.env.DISCORD_TOKEN);

setInterval(() => {
  respManager.checkExpiration();
}, 60000);