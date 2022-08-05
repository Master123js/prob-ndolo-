const { Client, Message, Collection, MessageEmbed } = require("discord.js");
const { getSettings, automodLogChannel } = require("@schemas/guild-schema");
const { containsLink, containsDiscordInvite } = require("@utils/miscUtils");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");
const { sendMessage } = require("@utils/botUtils");

const MESSAGE_CACHE = new Collection();

/**
 * @param {Client} client
 */
function run(client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || message.channel.type === "DM") return;
    const settings = (await getSettings(message.guild)).automod;

    if (settings.anti_ghostping) {
      // Cache Messages with mentions
      if (message.mentions.members.size > 0 || message.mentions.everyone || message.mentions.roles.size > 0) {
        const key = `${message.guild.id}|${message.channel.id}|${message.id}`;
        MESSAGE_CACHE.set(key, cacheMessage(message));
      }
    }
    try {
      performAutomod(message, settings);
    } catch (ex) {
      console.log(ex);
    }
  });

  client.on("messageDelete", async (message) => {
    if (message.partial) message = await message.fetch().catch((err) => {});
    if (message.partial || message.author.bot || message.channel.type === "DM") return;
    if (!message.guild) return;

    const settings = (await getSettings(message.guild)).automod;
    if (!settings.anti_ghostping || !settings.log_channel) return;
    const key = `${guild.id}|${channelId}|${id}`;

    // el mensaje eliminado tiene menciones y se almacenó previamente en caché
    if (MESSAGE_CACHE.has(key)) {
      const cachedMessage = MESSAGE_CACHE.get(key);
      const logChannel = message.guild.channels.cache.get(settings.log_channel);
      if (!logChannel) return;

      const embed = new MessageEmbed()
        .setAuthor("Ghost Ping Detectado")
        .setDescription(
          `**Mensaje**:
        ${cachedMessage.content}
        
        **Autor:** ${cachedMessage.author.tag} \`${cachedMessage.author.id}\`
        **Canal:** <#${cachedMessage.channelId}>
        `
        )
        .addField("Miembros", cachedMessage.mentions.members, true)
        .addField("Roles", cachedMessage.mentions.roles, true)
        .addField("¿Everyone?", cachedMessage.mentions.everyone, true)
        .setFooter("Enviado a: " + cachedMessage.createdAt);

      sendMessage(logChannel, { embeds: [embed] });
    }
  });
}

/**
 * Moderar el mensaje
 * @param {Message} message
 */
function performAutomod(message, settings) {
  if (!shouldModerate(message)) return;
  const { channel, content, author, mentions } = message;
  const logChannel = settings.log_channel ? channel.guild.channels.cache.get(settings.log_channel) : null;

  let str = "**Razón:**\n";
  let shouldDelete = false;

  if (mentions.members.size > settings.max_mentions) {
    str += "Menciones: " + mentions.members.size + "\n";
    shouldDelete = true;
  }

  if (mentions.roles.size > settings.max_role_mentions) {
    str += "Menciones De Roles: " + mentions.roles.size + "\n";
    shouldDelete = true;
  }

  if (settings.max_lines > 0) {
    const count = content.split("\n").length;
    if (count > settings.max_lines) {
      str += "Líneas Nuevas: " + count + "\n";
      shouldDelete = true;
    }
  }

  if (settings.anti_links) {
    if (containsLink(content)) {
      str += "Enlaces Encontrados: " + EMOJIS.TICK + "\n";
      shouldDelete = true;
    }
  }

  if (!settings.anti_links && settings.anti_invites) {
    if (containsDiscordInvite(content)) {
      str += "Invitaciones De Discord Encontradas: " + EMOJIS.TICK + "\n";
      shouldDelete = true;
    }
  }

  if (shouldDelete && message.deletable) {
    const embed = new MessageEmbed()
      .setAuthor("Auto Moderación")
      .setThumbnail(author.avatarURL())
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(str)
      .addField("Autor", author.tag, true)
      .addField("Canal", channel.toString(), true);

    message
      .delete()
      .then(async () => {
        let sentMsg = await sendMessage(channel, "Auto-Moderación. ¡Mensaje borrado!");
        if (sentMsg) {
          setTimeout(() => {
            if (sentMsg.deletable) sentMsg.delete().catch((ex) => {});
          }, 3000);
        }
        if (logChannel) sendMessage(logChannel, { embeds: [embed] });
        else automodLogChannel(channel.guild.id, null);
      })
      .catch((ex) => {});
  }
}

/**
 * Verifique si el mensaje necesita ser moderado y tiene los permisos requeridos
 * @param {Message} message
 */
function shouldModerate(message) {
  const { member, guild, channel } = message;

  // Ignorar si el bot no puede eliminar los mensajes del canal
  if (!channel.permissionsFor(guild.me).has("MANAGE_MESSAGES")) return false;

  // Ignorar posibles moderadores del gremio
  if (member.permissions.has(["KICK_MEMBERS", "BAN_MEMBERS", "MANAGE_GUILD"])) return false;

  // Ignorar posibles moderadores del canal
  if (channel.permissionsFor(message.member).has("MANAGE_MESSAGES")) return false;

  return true;
}

/**
 * Almacenar en caché los detalles de la mención del mensaje
 * @param {Message} message
 */
function cacheMessage(message) {
  return {
    content: message.content,
    author: {
      id: message.author.id,
      tag: message.author.tag,
    },
    mentions: {
      members: message.mentions.members.size,
      roles: message.mentions.roles.size,
      everyone: message.mentions.everyone,
    },
    channelId: message.channel.id,
    createdAt: message.createdAt.toUTCString(),
  };
}

module.exports = {
  run,
};
