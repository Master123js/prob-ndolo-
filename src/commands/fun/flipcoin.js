const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

module.exports = class FlipCoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: "flipcoin",
      description: "Lanza una moneda cara o cruz",
      category: "FUN",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;
    const items = ["CARA", "CRUZ"];
    const toss = items[Math.floor(Math.random() * items.length)];

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
      .setDescription(message.author.username + ", comenzó un lanzamiento de moneda");

    message.channel
      .send({
        embeds: [embed],
      })
      .then((coin) => {
        setTimeout(() => {
          const newEmbed = new MessageEmbed().setDescription("la moneda esta en el aire");
          coin.edit({ embeds: [newEmbed] }).catch((err) => {});
        }, 2000);
        setTimeout(() => {
          const newEmbed = new MessageEmbed()
            .setDescription(">> **" + toss + " Ganó** <<")
            .setImage(toss === "CARA" ? "https://i.imgur.com/HavOS7J.png" : "https://i.imgur.com/u1pmQMV.png");
          coin.edit({ embeds: [newEmbed] }).catch((err) => {});
        }, 2000);
      });
  }
};
