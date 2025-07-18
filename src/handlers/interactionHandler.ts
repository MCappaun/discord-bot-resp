import * as resp from '../commands/resp.js';
import * as respDel from '../commands/respDel.js';
import * as respNext from '../commands/respNext.js';
import * as imbuiment from '../commands/imbuiment.js';
import * as clear from '../commands/clear.js';

const commands: Record<string, any> = {
    resp,
    respdel: respDel,
    respnext: respNext,
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
      await interaction.reply({
        content: 'Ocorreu um erro ao executar esse comando.',
        ephemeral: true,
      });
    }
}
