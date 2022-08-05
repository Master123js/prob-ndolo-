const { Command, CommandContext } = require("@src/structures");
const { purgeMessages } = require("@utils/modUtils");

module.exports = class PurgeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "purge",
      description: "Elimina la cantidad especificada de mensajes",
      usage: "<cantidad>",
      minArgsCount: 1,
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
    const amount = args[0];

    if (isNaN(amount)) return ctx.reply("Solo se permiten números");
    if (parseInt(amount) > 100) return ctx.reply("La cantidad máxima de mensajes que puedo eliminar es 100");

    purgeMessages(message, "ALL", amount);
  }
};
