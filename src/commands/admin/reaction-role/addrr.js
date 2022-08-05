const { Command, CommandContext } = require("@src/structures");
const { findMatchingRoles } = require("@utils/guildUtils");
const { addReactionRole } = require("@schemas/reactionrole-schema");
const { Util } = require("discord.js");

const channelPerms = ["EMBED_LINKS", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS", "MANAGE_MESSAGES"];

module.exports = class AddReactionRole extends Command {
  constructor(client) {
    super(client, {
      name: "addrr",
      description: "Configura el rol de reacción para el mensaje especificado",
      usage: "<#canal> <IDmensaje> <Emoji> <Rol>",
      minArgsCount: 4,
      category: "ADMIN",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, guild, args } = ctx;

    const targetChannel = message.mentions.channels.first();
    if (!targetChannel) return message.reply("¡Uso incorrecto! Debes mencionar un canal de destino.");
    if (!targetChannel.permissionsFor(guild.me).has()) {
      return message.reply(
        "Necesita los siguientes permisos en " + targetChannel.toString() + "\n" + this.parsePermissions(channelPerms)
      );
    }

    let targetMessage;
    try {
      targetMessage = await targetChannel.messages.fetch(args[1]);
    } catch (ex) {
      return message.reply("No se pudo obtener el mensaje. ¿Proporcionaste un ID de mensaje válido?");
    }

    const role = findMatchingRoles(guild, args[3])[0];
    if (!role) return message.reply(`No se encontraron roles que coincidan ${args[3]}`);
    if (guild.me.roles.highest.position < role.position)
      return message.reply("¡Ups! No puedo agregar / quitar miembros a ese rol. ¿Ese rol es más alto que el mío?");

    let custom = Util.parseEmoji(args[2]);
    if (custom.id && !guild.emojis.cache.has(custom.id)) {
      return await message.reply("Este emoji no pertenece a este servidor.");
    }

    const emoji = custom.id ? custom.id : custom.name;
    try {
      await targetMessage.react(emoji);
    } catch (ex) {
      return message.reply("¡Ups! No pude reaccionar. ¿Es este un emoji válido? " + args[2] + " ?");
    }

    addReactionRole(guild.id, targetChannel.id, targetMessage.id, emoji, role.id)
      .then((_) => ctx.reply("¡Hecho! Configuración guardada"))
      .catch((err) => message.reply("¡Ups! Ocurrió un error inesperado. Vuelva a intentarlo más tarde"));
  }
};
