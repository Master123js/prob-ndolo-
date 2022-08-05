const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { MESSAGES } = require("@root/config.js");
const { getResponse } = require("@utils/httpUtils");
const outdent = require("outdent");

module.exports = class GithubCommand extends Command {
  constructor(client) {
    super(client, {
      name: "github",
      description: "Muestra las estadísticas de GitHub de un usuario.",
      usage: "<username>",
      minArgsCount: 1,
      aliases: ["git"],
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

    const response = await getResponse(`https://api.github.com/users/${args}`);
    if (response.status === 400) return ctx.reply("```Ningún usuario encontrado con ese nombre```");
    if (!response.success) return ctx.reply(MESSAGES.API_ERROR);

    const json = response.data;
    let {
      login: username,
      name,
      id: githubId,
      avatar_url,
      html_url: userPageLink,
      followers,
      following,
      bio,
      location,
      blog,
    } = json;

    let website = websiteProvided(blog) ? `[Clic Aquí](${blog})` : "No Proporcionado";
    if (name == null) name = "No Proporcionado";
    if (bio == null) bio = "No Proporcionado";
    if (website == null) website = "No Proporcionado";

    let embed = new MessageEmbed()
      .setAuthor("Usuario De GitHub: " + username, avatar_url, userPageLink)
      .addField(
        "Información De Usuario",
        outdent`**Nombre Real**: *${name}*
        **Ubicación**: *${location}*
        **ID De GitHub**: *${githubId}*
        **Sitio Web**: *${website}*\n`,
        true
      )
      .addField("Estadísticas Sociales", `**Seguidores**: *${followers}*\n**Siguiendo**: *${following}*`, true)
      .setDescription(`**Bio**:\n${bio}`)
      .setImage(avatar_url)
      .setColor(0x6e5494)
      .setFooter(`Solicitado por: ${author.tag}`);

    ctx.reply({ embeds: [embed] });
  }
};

function websiteProvided(text) {
  if (text.startsWith("http://")) return true;
  else return text.startsWith("https://");
}
