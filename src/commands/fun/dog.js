const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getResponse } = require("@utils/httpUtils");

module.exports = class DogCommand extends Command {
  constructor(client) {
    super(client, {
      name: "dog",
      description: "Muestra una imagen de perro al azar",
      category: "FUN",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;

    const response = await getResponse("https://dog.ceo/api/breeds/image/random");
    if (!response.success) return ctx.reply(MESSAGES.API_ERROR);

    const image = response.data?.message;

    let embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setImage(image)
      .setFooter(`Solicitado por: ${message.author.tag}`);

    ctx.reply({ embeds: [embed] });
  }
};
