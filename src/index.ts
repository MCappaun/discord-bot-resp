import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import dns from 'node:dns';
import { handleInteraction } from './handlers/interactionHandler.js';
import { RespManager } from './utils/respManager.js';

// Fix para Gateway Timeout (504) na Oracle Cloud
dns.setDefaultResultOrder('ipv4first');

const respManager = new RespManager();

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', () => {
  console.log(`Bot online como ${client.user?.tag}`);
});

client.on('interactionCreate', handleInteraction);

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('ERRO: DISCORD_TOKEN não encontrado no ambiente ou no arquivo .env');
  process.exit(1);
}

client.login(token).catch(err => {
  console.error('Erro ao fazer login:', err);
});

setInterval(() => {
  respManager.checkExpiration();
}, 60000);