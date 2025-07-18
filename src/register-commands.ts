import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import { data as resp } from './commands/resp.js';
import { data as respDel } from './commands/respDel.js';
import { data as respNext } from './commands/respNext.js';
import { data as imbuiment } from './commands/imbuiment.js';
import { data as clear } from './commands/clear.js';


const commands = [resp, respDel, respNext, imbuiment, clear];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN as string);

const CLIENT_ID = '1344102742490091632';
const GUILD_ID = '1292863335900909619';

async function main() {
  try {
    console.log('Registrando comandos...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands.map(cmd => cmd.toJSON()),
    });
    console.log('Comandos registrados!');
  } catch (error) {
    console.error('Erro ao registrar comandos:', error);
  }
}

main();