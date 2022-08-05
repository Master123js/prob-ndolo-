const { Client, Collection } = require("discord.js");
const { getSettings } = require("@schemas/guild-schema");
const { incrementXP, setLevel } = require("@schemas/profile-schema");
const { getRandomInt } = require("@utils/miscUtils");
const { XP_SYSTEM } = require("@root/config.js");
const { sendMessage } = require("@utils/botUtils");

const XP_COOLDOWN = new Collection();

/**
 * @param {Client} client
 */
function run(client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || message.webhookId || message.channel.type === "DM") return;

    const settings = await getSettings(message.guild);
    if (!settings.ranking?.enabled) return;
    const key = message.guild.id + "|" + message.member.id;

    // Comprobación de enfriamiento para evitar el spam de mensajes
    if (isOnCooldown(key)) return;
    else applyCooldown(key);

    // Actualizar XP del miembro en DB
    const xpToAdd = getRandomXP();
    const data = await incrementXP(message.guild.id, message.member.id, xpToAdd);

    // Verifica si el miembro ha subido de nivel.
    let { xp, level } = data;
    const needed = getXPNeeded(level);

    if (xp > needed) {
      ++level;
      xp -= needed;

      await setLevel(message.guild.id, message.member.id, level, xp);
      let lvlUpMessage = settings.level_up_message || XP_SYSTEM.DEFAULT_LVL_UP_MSG;
      lvlUpMessage = lvlUpMessage.replace("{l}", level).replace("{m}", message.member.user);
      const lvlUpChannel = message.guild.channels.cache.get(settings.level_up_channel) || message.channel;

      sendMessage(lvlUpChannel, lvlUpMessage);
    }
  });
}

/**
 * Obtenga un valor de XP aleatorio entre 1 y 20
 */
function getRandomXP() {
  return getRandomInt(19) + 1;
}
/**
 * Obtener XP necesario para alcanzar el nivel especificado
 * @param {Number} level
 */
function getXPNeeded(level) {
  return level * level * 100;
}

/**
 * Compruebe si el caché de enfriamiento contiene la clave
 * @param {String} key
 */
function isOnCooldown(key) {
  if (XP_COOLDOWN.has(key)) {
    const difference = Date.now() - XP_COOLDOWN.get(key);
    if (difference > XP_SYSTEM.COOLDOWN) {
      XP_COOLDOWN.delete(key);
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Agregar clave de enfriamiento al caché
 * @param {String} key
 */
function applyCooldown(key) {
  XP_COOLDOWN.set(key, Date.now());
}

module.exports = {
  run,
};
