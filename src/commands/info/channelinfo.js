const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");
const { getMatchingChannel } = require("@utils/guildUtils");
const outdent = require("outdent");

module.exports = class ChannelInfo extends Command {
  constructor(client) {
    super(client, {
      name: "chinfo",
      description: "Muestra la información del canal mencionado",
      usage: "[canal]",
      aliases: ["channelinfo"],
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args, channel, guild } = ctx;
    let targetChannel;

    if (message.mentions.channels.size > 0) {
      targetChannel = message.mentions.channels.first();
    } else {
      if (args.length > 0) {
        const search = args.join(" ");
        const tcByName = getMatchingChannel(guild, search);
        if (tcByName.length == 0) return ctx.reply(`No se encontraron canales que coincidan \`${search}\`!`);
        if (tcByName.length > 1) return ctx.reply(`Múltiples canales encontrados coincidentes \`${search}\`!`);
        targetChannel = tcByName[0];
      } else {
        targetChannel = channel;
      }
    }

    const { id, name, topic, parent, position, type } = targetChannel;

    let desc = outdent`
    ${EMOJIS.ARROW} ID: **${id}**
    ${EMOJIS.ARROW} Nombre: **${name}**
    ${EMOJIS.ARROW} Tipo: **${channelTypes[type] || type}**
    ${EMOJIS.ARROW} Categoría: **${parent ? parent : "NA"}**
    ${EMOJIS.ARROW} Tema: **${topic ? topic : "Sin Tema"}**\n
    `;

    if (type === "GUILD_TEXT") {
      const { rateLimitPerUser, nsfw } = targetChannel;
      desc += outdent`
      ${EMOJIS.ARROW} Posición: **${position}**
      ${EMOJIS.ARROW} Modo Lento: **${rateLimitPerUser}**
      ${EMOJIS.ARROW} EsNSFW: **${nsfw ? EMOJIS.TICK : EMOJIS.X_MARK}**
      `;
    }

    if (type === "GUILD_PUBLIC_THREAD" || type === "GUILD_PRIVATE_THREAD") {
      const { ownerId, archived, locked } = targetChannel;
      desc += outdent`
      ${EMOJIS.ARROW} ID Del Dueño: **${ownerId}**
      ${EMOJIS.ARROW} Está Archivado: **${archived ? EMOJIS.TICK : EMOJIS.X_MARK}**
      ${EMOJIS.ARROW} Está Bloqueado: **${locked ? EMOJIS.TICK : EMOJIS.X_MARK}**
      `;
    }

    if (type === "GUILD_NEWS" || type === "GUILD_NEWS_THREAD") {
      const { nsfw } = targetChannel;
      desc += outdent`
      ${EMOJIS.ARROW} EsNSFW: **${nsfw ? EMOJIS.TICK : EMOJIS.X_MARK}**
      `;
    }

    if (type === "GUILD_VOICE" || type === "GUILD_STAGE_VOICE ") {
      const { bitrate, userLimit, full } = targetChannel;
      desc += outdent`
      ${EMOJIS.ARROW} Posición: **${position}**
      ${EMOJIS.ARROW} Tasa De Bits: **${bitrate}**
      ${EMOJIS.ARROW} Límite De Usuarios: **${userLimit}**
      ${EMOJIS.ARROW} Está Lleno: **${full ? EMOJIS.TICK : EMOJIS.X_MARK}**
      `;
    }

    const embed = new MessageEmbed().setAuthor("Detalles Del Canal").setColor(EMBED_COLORS.BOT_EMBED).setDescription(desc);
    ctx.reply({ embeds: [embed] });
  }
};

const channelTypes = {
  GUILD_TEXT: "Texto",
  GUILD_PUBLIC_THREAD: "Hilo Público",
  GUILD_PRIVATE_THREAD: "Hilo Privado",
  GUILD_NEWS: "Noticias",
  GUILD_NEWS_THREAD: "Hilo De Noticias",
  GUILD_VOICE: "Voz",
  GUILD_STAGE_VOICE: "Escenario De Voz",
};
