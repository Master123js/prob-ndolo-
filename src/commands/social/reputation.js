const { Command, CommandContext } = require("@src/structures");
const { resolveMember } = require("@utils/guildUtils");
const { getUser, increaseReputation } = require("@schemas/user-schema");
const { MessageEmbed } = require("discord.js");
const { diff_hours, getRemainingTime } = require("@utils/miscUtils");
const { EMBED_COLORS } = require("@root/config");

module.exports = class Reputation extends Command {
  constructor(client) {
    super(client, {
      name: "rep",
      description: "Da reputación a un usuario",
      usage: "<@miembro | id>",
      minArgsCount: 1,
      aliases: ["reputation"],
      category: "SOCIAL",
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const { author } = message;
    const target = await resolveMember(message, args[0]);

    if (!target) return message.reply(`Ningún usuario encontrado coincidente ${args[0]}`);
    if (target.user.bot) return ctx.reply(`No puedes dar reputación a los bots`);
    if (target.id === author.id) return ctx.reply(`No puedes darte reputación a ti mismo`);

    try {
      const user = await getUser(author.id);
      if (user && user.reputation.timestamp) {
        const lastRep = new Date(user.reputation.timestamp);
        const diff = diff_hours(new Date(), lastRep);
        if (diff < 24) {
          const nextUsage = lastRep.setHours(lastRep.getHours() + 24);
          return ctx.reply("Puede volver a ejecutar este comando en `" + getRemainingTime(nextUsage) + "`");
        }
      }
      await increaseReputation(author.id, target.id);
      const embed = new MessageEmbed()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(target.toString() + " +1 Rep!")
        .setFooter(`Por ${ctx.message.author.tag}`)
        .setTimestamp(Date.now());

      ctx.reply({ embeds: [embed] });
    } catch (ex) {
      console.log(ex);
      ctx.reply(`No se pudo dar reputación a \`${target.user.tag}\``);
    }
  }
};
