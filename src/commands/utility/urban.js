const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getResponse } = require("@utils/httpUtils");
const moment = require("moment");

module.exports = class UrbanCommand extends Command {
  constructor(client) {
    super(client, {
      name: "urban",
      description: "Busca en el diccionario urbano",
      usage: "<palabra>",
      minArgsCount: 1,
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args } = ctx;

    const response = await getResponse(`http://api.urbandictionary.com/v0/define?term=${args}`);
    if (!response.success) return ctx.reply(MESSAGES.API_ERROR);

    let json = response.data;
    if (!json.list[0]) return ctx.reply(`No se encontró nada que coincida \`${args}\``);

    let data = json.list[0];
    let embed = new MessageEmbed()
      .setTitle(data.word)
      .setURL(data.permalink)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription("**Definición**```css\n" + data.definition + "```")
      .addField("Autor", data.author, true)
      .addField("ID", data.defid.toString(), true)
      .addField("\u200b", "\u200b", true)
      .addField("Ejemplo", data.example, true)
      .addField("Likes / Dislikes", "👍 " + data.thumbs_up + " | 👎 " + data.thumbs_down, true)
      .addField("\u200b", "\u200b", true)
      .setFooter("Creado " + moment(data.written_on).fromNow());

    ctx.reply({ embeds: [embed] });
  }
};
