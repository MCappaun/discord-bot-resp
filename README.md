# 🤖 Resp Discord - Claimed

Bot de gerenciamento de respawns (claimed) para o jogo **HelmoRPG**, feito em **Node.js + TypeScript**.

---

## ⚙️ Tecnologias

- [Node.js](https://nodejs.org)
- [TypeScript](https://www.typescriptlang.org)
- [Discord.js](https://discord.js.org)

---

## 🎯 Funcionalidades

- `/resp` → marca respawns com tempo de 2h
- `/respdel` → remove um respawn
- `/respnext` → exibe os próximos a expirar
- Auto expiração dos claimed após 2 horas
- Interface visual e amigável no Discord

---

## 📦 Instalação

```bash
git clone https://github.com/MCappaun/discord-bot-resp.git
cd discord-bot-resp
npm install
```

---

## ⚙️ Configuração `.env`

Crie um arquivo `.env` na raiz com o seguinte conteúdo:

```env
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id
GUILD_ID=seu_guild_id
```

---

## 🧪 Execução do Projeto

### Em modo desenvolvimento:
```bash
npm run dev
```
> Usa `ts-node-dev` para rodar o projeto direto com TypeScript e recarregar ao salvar.

---

### Em modo produção:
```bash
npm run build       # compila os arquivos TypeScript para JS na pasta dist/
npm start           # executa com node dist/index.js
```

> Ideal para deploy em servidores ou hospedagens.

---

## 📜 Scripts disponíveis

| Comando         | Descrição                            |
|-----------------|----------------------------------------|
| `npm run dev`   | Executa com ts-node-dev (hot reload)   |
| `npm run build` | Compila TypeScript para JavaScript     |
| `npm start`     | Roda o bot a partir de `dist/index.js` |

---

## 🧾 Licença

Este projeto está sob a licença [MIT](LICENSE).

---

## 🙋‍♂️ Autor

**Mateus Cappaun**  
[GitHub](https://github.com/MCappaun)
