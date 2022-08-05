const { MessageEmbed } = require("discord.js");
const { Command, CommandContext } = require("@src/structures");
const { EMBED_COLORS } = require("@root/config.js");
const { translate } = require("@utils/httpUtils");
const { GOOGLE_TRANSLATE } = require("@src/data.json");

module.exports = class TranslateCommand extends Command {
  constructor(client) {
    super(client, {
      name: "translate",
      description: "Traducir de un idioma a otro",
      usage: "<código-iso> <mensaje>",
      minArgsCount: 2,
      aliases: ["tr"],
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
    const embed = new MessageEmbed();
    const outputCode = args.shift();

    if (!GOOGLE_TRANSLATE[outputCode]) {
      embed
        .setColor(EMBED_COLORS.WARNING_EMBED)
        .setDescription(
          `Código de traducción no válido. Visita [aquí](https://cloud.google.com/translate/docs/languages) para ver la lista de códigos de traducción admitidos`
        );
      return ctx.reply({ embeds: [embed] });
    }

    const input = args.join(" ");
    if (!input) ctx.reply("Proporcione un texto de traducción válido");

    const data = await translate(input, outputCode);
    if (!data) return ctx.reply("Error al traducir tu texto");

    embed
      .setAuthor(author.username + " dice", author.avatarURL())
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(data.output)
      .setFooter(`${data.inputLang} (${data.inputCode}) ⟶ ${data.outputLang} (${data.outputCode})`);

    ctx.reply({ embeds: [embed] });
  }
};
