import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder,
    ComponentType,
    ButtonInteraction,
} from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imbuimentsPath = path.join(__dirname, '../data/imbuiments.json');
const imbuiments = JSON.parse(fs.readFileSync(imbuimentsPath, 'utf8')) as any[];

export const data = new SlashCommandBuilder()
    .setName('imbuiment')
    .setDescription('Veja detalhes dos imbuiments disponíveis.');

export async function execute(interaction: ChatInputCommandInteraction) {
    const buttons = imbuiments.map((imb: any, i: number) =>
        new ButtonBuilder()
            .setCustomId(`imb_${i}`)
            .setLabel(imb.name)
            .setStyle(ButtonStyle.Primary)
    );

    console.log('🧪 Criando embed...', buttons);

    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    for (let i = 0; i < buttons.length; i += 5) {
        rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(i, i + 5)));
    }

    const embedInicial = new EmbedBuilder()
        .setTitle('🧪 Imbuiments Disponíveis')
        .setDescription('Clique em um botão para ver detalhes.')
        .setColor('#6A1B9A');

    const reply = await interaction.reply({
        embeds: [embedInicial],
        components: rows,
        ephemeral: true,
    });

    console.log('🧪 Embed criado');

    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 2 * 60 * 1000,
    });

    collector.on('collect', async (btn: ButtonInteraction) => {
        const index = parseInt(btn.customId.replace('imb_', ''));

        if (!isNaN(index)) {
            const imb = imbuiments[index];

            const fields = createTabelaImbuiment(imb);

            const embed = new EmbedBuilder()
                .setTitle(`🔎 ${imb.name}`)
                .setDescription(`${imb.descricao}`)
                .addFields(fields)
                .setColor('#00897B')
                .setFooter({ text: 'Use o botão abaixo para voltar.' });


            const voltar = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('voltar').setLabel('⬅️ Voltar').setStyle(ButtonStyle.Secondary)
            );

            await btn.update({
                embeds: [embed],
                components: [voltar],
            });
        } else if (btn.customId === 'voltar') {
            await btn.update({
                embeds: [embedInicial],
                components: rows,
            });
        }
    });

    collector.on('end', async () => {
        try {
            await interaction.editReply({ components: [] });
        } catch (e) {
            console.warn('⚠️ Não foi possível limpar os botões:', e);
        }
    });
}

function createTabelaImbuiment(imb: any): { name: string, value: string, inline: boolean }[] {
    const colunas = [
        {
            titulo: imb.itens[0],
            mobs: imb.mob_item_1 || [],
        },
        {
            titulo: imb.itens[1],
            mobs: imb.mob_item_2 || [],
        },
        {
            titulo: imb.itens[2],
            mobs: imb.mob_item_3 || [],
        },
    ];

    return colunas.map(col => ({
        name: `\`${col.titulo}\``,
        value: '```\n' + col.mobs.join('\n') + '\n```',
        inline: true,
    }));
}

function formatColuna(titulo: string, mobs: string[]): string[] {
    return [titulo, ...mobs];
}

function padColuna(col1: string[], col2: string[], col3: string[]): string {
    const maxRows = Math.max(col1.length, col2.length, col3.length);
    const c1w = 25, c2w = 25, c3w = 25;

    let result = '';
    for (let i = 0; i < maxRows; i++) {
        const p1 = col1[i] || '';
        const p2 = col2[i] || '';
        const p3 = col3[i] || '';

        result +=
            p1.padEnd(c1w) +
            p2.padEnd(c2w) +
            p3.padEnd(c3w) +
            '\n';
    }
    return result;
}
