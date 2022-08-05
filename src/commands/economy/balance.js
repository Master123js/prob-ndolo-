const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { getUser } = require("@schemas/user-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class Balance extends Command {
  constructor(client) {
    super(client, {
      name: "balance",
      usage: "[@miembro | id]",
      description: "Muestra su saldo actual de monedas",
      aliases: ["bal"],
      category: "ECONOMY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const target = (await resolveMember(message, args[0])) || message.member;

    const economy = await getUser(target.id);

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor(target.displayName, target.user.displayAvatarURL())
      .setDescription(`**Saldo De Monedas:** ${economy?.coins || 0}${EMOJIS.CURRENCY}`);

    ctx.reply({ embeds: [embed] });
  }
};
