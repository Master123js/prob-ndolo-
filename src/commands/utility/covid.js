const { MessageEmbed } = require("discord.js");
const { Command, CommandContext } = require("@src/structures");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getResponse } = require("@utils/httpUtils");
const timestampToDate = require("timestamp-to-date");

module.exports = class CovidCommand extends Command {
  constructor(client) {
    super(client, {
      name: "covid",
      description: "Obtiene estadísticas de covid para un país",
      usage: "<país>",
      minArgsCount: 1,
      category: "UTILITY",
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args } = ctx;
    const cntry = args[0];

    const response = await getResponse(`https://disease.sh/v2/countries/${cntry}`);

    if (response.status === 404) return ctx.reply("```css\nNo se encuentra el país con el nombre proporcionado```");
    if (!response.success) return ctx.reply(MESSAGES.API_ERROR);

    const data = response.data;
    const mg = timestampToDate(data?.updated, "dd.MM.yyyy a las HH:mm");
    const embed = new MessageEmbed()
      .setTitle("Covid - " + data?.country)
      .setThumbnail(data?.countryInfo.flag)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .addField("Casos Totales", data?.cases.toString(), true)
      .addField("Casos Hoy", data?.todayCases.toString(), true)
      .addField("Muertes Totales", data?.deaths.toString(), true)
      .addField("Muertes Hoy", data?.todayDeaths.toString(), true)
      .addField("Recuperado", data?.recovered.toString(), true)
      .addField("Activo", data?.active.toString(), true)
      .addField("Etapa Crítica", data?.critical.toString(), true)
      .addField("Casos Por 1 Millón", data?.casesPerOneMillion.toString(), true)
      .addField("Muertes por 1 Millón", data?.deathsPerOneMillion.toString(), true)
      .setFooter("Ultima actualización el " + mg);

    ctx.reply({ embeds: [embed] });
  }
};
