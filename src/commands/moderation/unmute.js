const { Command, CommandContext } = require("@src/structures");
const { unmute } = require("@schemas/mute-schema");
const { canInteract } = require("@utils/modUtils");
const { getRoleByName } = require("@utils/guildUtils");

module.exports = class UnmuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "unmute",
      description: "Quita el silencio a los usuarios especificados",
      usage: "<@miembro(s)> [razón]",
      minArgsCount: 1,
      category: "MODERATION",
      botPermissions: ["MANAGE_ROLES"],
      userPermissions: ["KICK_MEMBERS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, guild, channel } = ctx;
    const { member } = message;
    const mentions = message.mentions.members;

    if (mentions.size == 0) return ctx.reply("Ningún miembro mencionado");

    const mutedRole = getRoleByName(guild, "silenciado");
    if (!mutedRole.editable) {
      return ctx.reply("No tengo permiso para mover miembros al rol `silenciado`. ¿Está ese rol por debajo de mi rol más alto?");
    }

    mentions
      .filter((target) => canInteract(member, target, "unmute", channel))
      .forEach(async (target) => {
        const result = await unmute(guild.id, target.id);

        if (result.nModified === 1) {
          await target.roles.remove(mutedRole);
          ctx.reply(`${target.user.tag} no está silenciado`);
        } else {
          ctx.reply(`${target.user.tag} No está silenciado`);
        }
      });
  }
};
