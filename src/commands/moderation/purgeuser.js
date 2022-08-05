const { Command, CommandContext } = require("@src/structures");
const { purgeMessages } = require("@utils/modUtils");

module.exports = class PurgeUser extends Command {
  constructor(client) {
    super(client, {
      name: "purgeuser",
      description: "Elimina la cantidad especificada de mensajes",
      usage: "<@usuario>",
      aliases: ["purgeusers"],
      category: "MODERATION",
      clientPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
      userPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const { mentions } = message;
    let amount = args[0] || 100;

    if (mentions.users.size == 0) return ctx.reply("¡Uso incorrecto! Ningún usuario mencionado");

    if (amount) {
      if (isNaN(amount)) return ctx.reply("Solo se permiten números");
      if (parseInt(amount) > 100) return ctx.reply("La cantidad máxima de mensajes que puedo eliminar es 100");
    }

    const targetIds = mentions.users.map((u) => u.id);
    purgeMessages(message, "USER", amount, targetIds);
  }
};
