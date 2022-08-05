const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { getUser, addCoins } = require("@schemas/user-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class Transfer extends Command {
  constructor(client) {
    super(client, {
      name: "transfer",
      description: "Transfiere monedas a otro usuario",
      usage: "<@miembro | id> <Monedas>",
      minArgsCount: 2,
      category: "ECONOMY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const { member } = message;
    const coins = args[1];
    const target = await resolveMember(message, args[0], true);

    if (!target) return message.reply(`Ningún usuario encontrado coincidente ${args[0]}`);
    if (isNaN(coins) || coins <= 0) return message.reply("Ingrese una cantidad válida de monedas para transferir");
    if (target.user.bot) return message.reply("¡No puedes transferir monedas a bots!");
    if (target.id === member.id) return message.reply("¡No puedes transferir monedas a ti mismo!");

    const economy = await getUser(member.id);
    if (!economy || economy?.coins < coins)
      return message.reply(`¡Saldo de monedas insuficiente! Tu solo tienes ${economy?.coins || 0}${EMOJIS.CURRENCY}`);

    try {
      const src = await addCoins(member.id, -coins);
      const des = await addCoins(target.id, coins);

      const embed = new MessageEmbed()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setAuthor("Saldo actualizado")
        .setDescription(
          `**${member.displayName}:** ${src.coins}${EMOJIS.CURRENCY}\n` +
            `**${target.displayName}:** ${des.coins}${EMOJIS.CURRENCY}`
        )
        .setTimestamp(Date.now());

      ctx.reply({ embeds: [embed] });
    } catch (ex) {
      console.log(ex);
      message.reply("Error al transferir monedas");
    }
  }
};
