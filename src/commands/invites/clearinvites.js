const { Command, CommandContext } = require("@src/structures");
const { clearInvites } = require("@schemas/invite-schema");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class ClearInvites extends Command {
  constructor(client) {
    super(client, {
      name: "clearinvites",
      description: "Borra las invitaciones añadidas de un usuario",
      usage: "<@miembro>",
      minArgsCount: 1,
      category: "INVITE",
      botPermissions: ["EMBED_LINKS"],
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const target = await resolveMember(message, args[0], true);
    if (!target) return ctx.reply(`Sintaxis incorrecta. Debes mencionar un objetivo`);

    await clearInvites(message.guild.id, target.id).then(ctx.reply(`¡Hecho! Invitaciones despejadas para \`${target.user.tag}\``));
  }
};
