const { Command, CommandContext } = require("@src/structures");
const { canInteract } = require("@utils/modUtils");

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ban",
      description: "Prohíbe los miembros especificados",
      usage: "<@miembro(s)> [razón]",
      minArgsCount: 1,
      category: "MODERATION",
      botPermissions: ["BAN_MEMBERS"],
      userPermissions: ["BAN_MEMBERS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;
    const { channel, member, content } = message;
    const mentions = message.mentions.members;

    if (mentions.size == 0) return ctx.reply("Ningún miembro mencionado");

    const regex = /<@!?(\d+)>/g;
    let match = regex.exec(content);
    let lastMatch;
    while (match != null) {
      lastMatch = match[0];
      match = regex.exec(content);
    }

    const reason = content.split(lastMatch)[1].trim() || "No se proporcionó ninguna razón";

    mentions
      .filter((target) => canInteract(member, target, "ban", channel))
      .forEach(async (target) => {
        try {
          await target.ban({
            days: 0,
            reason,
          });
          ctx.reply(`${target.user.tag} está baneado de este servidor`);
        } catch (ex) {
          console.log(ex);
          return ctx.reply(`No se pudo prohibir a ${target.user.tag}`);
        }
      });
  }
};
