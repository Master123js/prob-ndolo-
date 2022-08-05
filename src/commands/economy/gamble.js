const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { getUser, addCoins } = require("@schemas/user-schema");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");
const { getRandomInt } = require("@utils/miscUtils");

module.exports = class Gamble extends Command {
  constructor(client) {
    super(client, {
      name: "gamble",
      description: "Prueba tu suerte apostando",
      usage: "<Monto>",
      minArgsCount: 1,
      aliases: ["slot"],
      category: "ECONOMY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args, guild } = ctx;
    const { member } = message;
    const betAmount = args[0];

    if (isNaN(betAmount)) return message.reply("El monto de la apuesta debe ser una entrada de número válida");
    if (betAmount < 0) return message.reply("El monto de la apuesta no puede ser negativo");
    if (betAmount < 10) return message.reply("El monto de la apuesta no puede ser inferior a 10");

    const economy = await getUser(member.id);
    if (!economy || economy?.coins < betAmount)
      return message.reply(
        `¡No tienes suficientes monedas para apostar!\n**Saldo de monedas:** ${economy?.coins || 0}${EMOJIS.CURRENCY}`
      );

    let slot1 = getEmoji();
    let slot2 = getEmoji();
    let slot3 = getEmoji();

    let str = `
    **Monto De La Apuesta:** ${betAmount}${EMOJIS.CURRENCY}
    **Multiplicador:** 1.5x
    ╔══════════╗
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()} ‎‎‎‎║
    ╠══════════╣
    ║ ${slot1} ║ ${slot2} ║ ${slot3} ⟸
    ╠══════════╣
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()} ║
    ╚══════════╝
    `;

    const reward = calculateReward(betAmount, slot1, slot2, slot3);
    const result = (reward > 0 ? "Ganaste: " + reward : "Perdiste: " + betAmount) + EMOJIS.CURRENCY;
    const balance = reward - betAmount;

    try {
      const remaining = await addCoins(member.id, balance);
      const embed = new MessageEmbed()
        .setAuthor(member.displayName, member.user.displayAvatarURL())
        .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
        .setThumbnail("https://i.pinimg.com/originals/9a/f1/4e/9af14e0ae92487516894faa9ea2c35dd.gif")
        .setDescription(str)
        .setFooter(`${result}\nSaldo Actualizado: ${remaining?.coins}${EMOJIS.CURRENCY}`);

      ctx.reply({ embeds: [embed] });
    } catch (ex) {
      console.log(ex);
      ctx.reply("Error al actualizar el saldo de monedas");
    }
  }
};

function getEmoji() {
  const ran = getRandomInt(9);
  switch (ran) {
    case 1:
      return "\uD83C\uDF52";
    case 2:
      return "\uD83C\uDF4C";
    case 3:
      return "\uD83C\uDF51";
    case 4:
      return "\uD83C\uDF45";
    case 5:
      return "\uD83C\uDF49";
    case 6:
      return "\uD83C\uDF47";
    case 7:
      return "\uD83C\uDF53";
    case 8:
      return "\uD83C\uDF50";
    case 9:
      return "\uD83C\uDF4D";
    default:
      return "\uD83C\uDF52";
  }
}

function calculateReward(amount, var1, var2, var3) {
  if (var1 === var2 && var2.equals === var3) return 2.25 * amount;
  if (var1 === var2 || var2 === var3 || var1 === var3) return 1.5 * amount;
  else return 0;
}
