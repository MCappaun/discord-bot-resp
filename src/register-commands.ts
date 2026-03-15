import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import { data as resp } from './commands/resp.js';
import { data as respDel } from './commands/respDel.js';
import { data as respNext } from './commands/respNext.js';
import { data as imbuiment } from './commands/imbuiment.js';
import { data as clear } from './commands/clear.js';
import { requireEnv } from './config.js';


const commands = [resp, respDel, respNext, imbuiment, clear];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN as string);

async function main() {
  try {
    console.log('Registrando comandos...');
    const clientId = requireEnv('DISCORD_CLIENT_ID');
    const guildId = requireEnv('DISCORD_GUILD_ID');

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands.map(cmd => cmd.toJSON()),
    });
    console.log('Comandos registrados!');
  } catch (error) {
    console.error('Erro ao registrar comandos:', error);
  }
}

main();
