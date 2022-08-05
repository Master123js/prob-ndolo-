const { Command, CommandContext } = require("@src/structures");
const { purgeMessages } = require("@utils/modUtils");

module.exports = class PurgeAttachments extends Command {
  constructor(client) {
    super(client, {
      name: "purgeattach",
      description: "Elimina la cantidad especificada de mensajes con archivos adjuntos",
      usage: "[cantidad]",
      aliases: ["purgeattachment", "purgeattachments"],
      category: "MODERATION",
      botPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
      userPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    let amount = args[0] || 100;

    if (amount) {
      if (isNaN(amount)) return ctx.reply("Solo se permiten números");
      if (parseInt(amount) > 100) return ctx.reply("La cantidad máxima de mensajes que puedo eliminar es 100");
    }

    purgeMessages(message, "ATTACHMENT", amount);
  }
};
