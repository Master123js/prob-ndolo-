const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { EMOJIS, MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getResponse } = require("@utils/httpUtils");
const outdent = require("outdent");

module.exports = class Pokedex extends Command {
  constructor(client) {
    super(client, {
      name: "pokedex",
      description: "Muestra informacion de pokemon",
      usage: "<pokemon>",
      minArgsCount: 1,
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;

    const response = await getResponse(`https://pokeapi.glitch.me/v1/pokemon/${args}`);
    if (response.status === 404) return ctx.reply("```El pokemon dado no se encuentra```");
    if (!response.success) return ctx.reply(MESSAGES.API_ERROR);

    const json = response.data[0];
    if (!json) return;

    let embed = new MessageEmbed()
      .setTitle("Pokédex - " + json.name)
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(json.sprite)
      .setDescription(
        outdent`
            ${EMOJIS.WHITE_DIAMOND_SUIT} **ID**: ${json.number}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Nombre**: ${json.name}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Especies**: ${json.species}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Tipo(s)**: ${json.types}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Habilidades (normales)**: ${json.abilities.normal}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Habilidades (ocultas)**: ${json.abilities.hidden}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Grupo(s) De Huevos**: ${json.eggGroups}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Género**: ${json.gender}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Altura**: ${json.height} pie de altura
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Peso**: ${json.weight}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Etapa De Evolución Actual**: ${json.family.evolutionStage}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **Línea De Evolución**: ${json.family.evolutionLine}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **¿Es Del Comienzo?**: ${json.starter}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **¿Es Legendario?**: ${json.legendary}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **¿Es Mítico?**: ${json.mythical}
            ${EMOJIS.WHITE_DIAMOND_SUIT} **¿Es Generación?**: ${json.gen}
            `
      )
      .setFooter(json.description);

    ctx.reply({ embeds: [embed] });
  }
};
