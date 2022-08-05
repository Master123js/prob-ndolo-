const { Util, MessageEmbed } = require("discord.js");
const { Command, CommandContext } = require("@src/structures");
const { EMBED_COLORS } = require("@root/config.js");
const { parse } = require("twemoji-parser");

module.exports = class EnlargeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "enlarge",
      description: "Amplia un emoji",
      usage: "<emoji>",
      minArgsCount: 1,
      aliases: ["bigemoji"],
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const { author } = message;
    if (!args) return ctx.reply("¡No se proporcionaron emojis!");

    let custom = Util.parseEmoji(args);
    const embed = new MessageEmbed().setTitle("❯ Emoji Grande ❮").setColor(EMBED_COLORS.BOT_EMBED).setFooter(author.tag);

    if (custom.id) {
      embed.setImage(`https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif" : "png"}`);
      return ctx.reply({ embeds: [embed] });
    } else {
      let parsed = parse(args, { assetType: "png" });
      if (!parsed[0]) return ctx.reply("No es un emoji válido");

      embed.setImage(parsed[0].url);
      return ctx.reply({ embeds: [embed] });
    }
  }
};
