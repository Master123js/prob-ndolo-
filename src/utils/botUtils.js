const { TextBasedChannels, MessagePayload, MessageOptions } = require("discord.js");
const { getResponse } = require("@utils/httpUtils");
const config = require("@root/config.js");

async function startupCheck() {
  await checkForUpdates();
  validateConfig();
}

async function checkForUpdates() {
  const response = await getResponse("https://api.github.com/repos/VirtualOx-sys/thronebot/releases/latest");
  if (!response.success) return console.log("\x1b[31m[Comprobación De La Versión] - Error al buscar actualizaciones de bot\x1b[0m");
  if (response.data) {
    if (require("@root/package.json").version.replace(/[^0-9]/g, "") >= response.data.tag_name.replace(/[^0-9]/g, "")) {
      console.log("\x1b[32m[Comprobación De La Versión] - Tu bot de Discord está actualizado\x1b[0m");
    } else {
      console.log("\x1b[33m[Comprobación De la Versión] - " + response.data.tag_name + " actualización disponible\x1b[0m");
      console.log("\x1b[32m[Descargar]:\x1b[0m https://github.com/VirtualOx-sys/thronebot/releases/latest");
    }
  }
}

function validateConfig() {
  if (config.BOT_TOKEN === "") {
    console.log("\x1b[31m[config.js]\x1b[0m - BOT_TOKEN No puede estar vacío");
    process.exit();
  }
  if (config.MONGO_CONNECTION === "") {
    console.log("\x1b[31m[config.js]\x1b[0m - MONGO_CONNECTION No puede estar vacío");
    process.exit();
  }
  if (config.OWNER_IDS.length === 0) console.log("\x1b[33m[config.js]\x1b[0m - OWNER_IDS Están vacíos");
  if (!config.API.IMAGE_API) {
    console.log("\x1b[33m[config.js]\x1b[0m - IMAGE_API no se proporciona. Los comandos de imagen no funcionarán");
  }
  if (!config.BOT_INVITE) console.log("\x1b[33m[config.js]\x1b[0m - BOT_INVITE no se proporciona");
  if (!config.SUPPORT_SERVER) console.log("\x1b[33m[config.js]\x1b[0m - SUPPORT_SERVER no se proporciona");
  if (isNaN(config.CACHE_SIZE.GUILDS) || isNaN(config.CACHE_SIZE.USERS) || isNaN(config.CACHE_SIZE.MEMBERS)) {
    console.log("\x1b[31m[config.js]\x1b[0m - CACHE_SIZE debe ser un entero positivo");
    process.exit();
  }
  if (!config.PREFIX) {
    console.log("\x1b[31m[config.js]\x1b[0m - PREFIX no puede estar vacío");
    process.exit();
  }
}

/**
 * @param {TextBasedChannels} channel
 * @param {string | MessagePayload | MessageOptions} message
 */
async function sendMessage(channel, message) {
  if (!channel || !message) return;
  if (channel.type === "GUILD_STAGE_VOICE" && channel.type === "GUILD_VOICE") return;
  try {
    return await channel.send(message);
  } catch (ex) {
    console.log(`[ERROR] - [sendMessage] - ${ex.message}`);
  }
}

const permissions = {
  ADMINISTRATOR: "Administrador",
  VIEW_AUDIT_LOG: "Ver registro de auditoría",
  MANAGE_GUILD: "Administrar servidor",
  MANAGE_ROLES: "Administrar roles",
  MANAGE_CHANNELS: "Administrar canales",
  KICK_MEMBERS: "Expulsar miembros",
  BAN_MEMBERS: "Prohibir miembros",
  CREATE_INSTANT_INVITE: "Crear invitación instantánea",
  CHANGE_NICKNAME: "Cambiar apodo",
  MANAGE_NICKNAMES: "Administrar apodos",
  MANAGE_EMOJIS: "Administrar emojis",
  MANAGE_WEBHOOKS: "Administrar webhooks",
  VIEW_CHANNEL: "Ver canales",
  SEND_MESSAGES: "Enviar mensajes",
  SEND_TTS_MESSAGES: "Enviar mensajes TTS",
  MANAGE_MESSAGES: "Administrar mensajes",
  EMBED_LINKS: "Insertar enlaces",
  ATTACH_FILES: "Adjuntar archivos",
  READ_MESSAGE_HISTORY: "Leer historial de mensajes",
  MENTION_EVERYONE: "Mencionar everyone",
  USE_EXTERNAL_EMOJIS: "Usa emojis externos",
  ADD_REACTIONS: "Agregar reacciones",
  CONNECT: "Conectar",
  SPEAK: "Hablar",
  MUTE_MEMBERS: "Mutear miembros",
  DEAFEN_MEMBERS: "Ensordecer miembros",
  MOVE_MEMBERS: "Mover miembros",
  USE_VAD: "Usar actividad de voz",
  PRIORITY_SPEAKER: "Prioridad para hablar",
  VIEW_GUILD_INSIGHTS: "Ver información del servidor",
  STREAM: "Video",
};

module.exports = {
  permissions,
  sendMessage,
  startupCheck,
};
