const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { MESSAGES, EMBED_COLORS, API } = require("@root/config.js");
const { getResponse } = require("@utils/httpUtils");

const ACCESS_KEY = API.WEATHERSTACK_KEY;

module.exports = class WeatherCommand extends Command {
  constructor(client) {
    super(client, {
      name: "weather",
      description: "Obtiene información meteorológica",
      usage: "<lugar>",
      minArgsCount: 1,
      category: "UTILITY",
      clientPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args } = ctx;
    const input = args.join(" ");

    const response = await getResponse(`http://api.weatherstack.com/current?access_key=${ACCESS_KEY}&query=${input}`);
    if (!response.success) return ctx.reply(MESSAGES.API_ERROR);

    let json = response.data;
    if (!json.request) return ctx.reply(`No se encontró ninguna ciudad que coincida \`${input}\``);

    let embed = new MessageEmbed()
      .setTitle("Clima")
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(json.current?.weather_icons[0])
      .addField("Ciudad", json.location?.name, true)
      .addField("Región", json.location?.region, true)
      .addField("País", json.location?.country, true)
      .addField("Condición Climática", json.current?.weather_descriptions[0], true)
      .addField("Fecha", json.location?.localtime.slice(0, 10), true)
      .addField("Tiempo", json.location?.localtime.slice(11, 16), true)
      .addField("Temperatura", json.current?.temperature + "°C", true)
      .addField("Cubierto De Nubes", json.current?.cloudcover + "%", true)
      .addField("Viento", json.current?.wind_speed + " km/h", true)
      .addField("Dirección Del Viento", json.current?.wind_dir, true)
      .addField("Presión", json.current?.pressure + " mb", true)
      .addField("Precipitación", json.current?.precip.toString() + " mm", true)
      .addField("Humedad", json.current?.humidity.toString(), true)
      .addField("Distancia Visual", json.current?.visibility + " km", true)
      .addField("UV", json.current?.uv_index.toString(), true)
      .setFooter("Comprobado por última vez el " + json.current?.observation_time + " GMT");

    ctx.reply({ embeds: [embed] });
  }
};
