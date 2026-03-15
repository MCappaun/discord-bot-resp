import * as resp from '../commands/resp.js';
import * as respDel from '../commands/respDel.js';
import * as respNext from '../commands/respNext.js';
import * as respDelNext from '../commands/respDelNext.js';
import * as imbuiment from '../commands/imbuiment.js';
import * as clear from '../commands/clear.js';

const commands: Record<string, any> = {
    resp,
    respdel: respDel,
    respnext: respNext,
    respdelnext: respDelNext,
    imbuiment: imbuiment,
    clear: clear
  };
  

export async function handleInteraction(interaction: any) {
    if (!interaction.isChatInputCommand()) return;

    const command = commands[interaction.commandName];
    console.log(`Comando recebido: ${interaction.commandName}`);


    if (!command) return;
  
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if ((error as any)?.code === 10062) {
      console.warn('Interacao expirada (Unknown interaction). Ignorando resposta.');
      return;
    }
    const payload = {
      content: 'Ocorreu um erro ao executar esse comando.',
      flags: 64,
    };
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(payload);
        } else {
          await interaction.reply(payload);
        }
      } catch (replyError) {
        console.error('Falha ao enviar erro de interação:', replyError);
      }
    }
}
