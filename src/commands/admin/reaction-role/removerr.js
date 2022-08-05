const { removeReactionRole } = require("@root/src/schemas/reactionrole-schema");
const { Command, CommandContext } = require("@src/structures");

const channelPerms = ["EMBED_LINKS", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS", "MANAGE_MESSAGES"];

module.exports = class RemoveReactionRole extends Command {
  constructor(client) {
    super(client, {
      name: "removerr",
      description: "Elimina la reacción configurada para el mensaje especificado",
      usage: "<#Canal> <IDmensaje>",
      minArgsCount: 2,
      category: "ADMIN",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;

    const targetChannel = message.mentions.channels.first();
    if (!targetChannel) return message.reply("¡Uso incorrecto! Debes mencionar un canal de destino.");
    if (!targetChannel.permissionsFor(message.guild.me).has()) {
      return message.reply(
        "Necesita los siguientes permisos en " + targetChannel.toString() + "\n" + this.parsePermissions(channelPerms)
      );
    }

    let targetMessage;
    try {
      targetMessage = await targetChannel.messages.fetch(ctx.args[1]);
    } catch (ex) {
      return message.reply("No se pudo obtener el mensaje. ¿Proporcionaste un ID de mensaje válido?");
    }

    try {
      await removeReactionRole(message.guild.id, targetChannel.id, targetMessage.id);
      targetMessage.reactions?.removeAll();
    } catch (ex) {
      return message.reply("¡Ups! Ocurrió un error inesperado. Vuelva a intentarlo más tarde");
    }

    ctx.reply("¡Hecho! Configuración actualizada");
  }
};
