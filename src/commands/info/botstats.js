const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { timeformat } = require("@utils/miscUtils");
const { EMOJIS, EMBED_COLORS, BOT_INVITE, SUPPORT_SERVER } = require("@root/config.js");
const os = require("os");
const outdent = require("outdent");

module.exports = class BotStatsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "botstats",
      description: "Muestra información del bot",
      aliases: ["botstat", "botinfo"],
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;
    const { client } = message;

    // STATS
    const guilds = client.guilds.cache.size;
    const channels = client.channels.cache.size;
    const users = client.guilds.cache.reduce((size, g) => size + g.memberCount, 0);

    // CPU
    const platform = process.platform.replace(/win32/g, "Windows");
    const architecture = os.arch();
    const cores = os.cpus().length;
    const cpuUsage = (process.cpuUsage().user / 1024 / 1024).toFixed(2) + " MB";

    // RAM
    const botUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB";
    const botAvailable = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB";
    const botUsage = ((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(1) + "%";

    const overallUsed = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2) + " GB";
    const overallAvailable = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB";
    const overallUsage = Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100) + "%";

    let desc = "";
    desc = desc + EMOJIS.CUBE_BULLET + " Total De Servidores: " + guilds + "\n";
    desc = desc + EMOJIS.CUBE_BULLET + " Total De Usuarios: " + users + "\n";
    desc = desc + EMOJIS.CUBE_BULLET + " Total De Canales: " + channels + "\n";
    desc = desc + EMOJIS.CUBE_BULLET + " Ping Del Websocket: " + client.ws.ping + " ms\n";
    desc = desc + "\n";

    const embed = new MessageEmbed()
      .setTitle("Información Del Bot")
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(desc)
      .addField(
        "CPU:",
        outdent`
        ${EMOJIS.ARROW} **OS:** ${platform} [${architecture}]
        ${EMOJIS.ARROW} **Cores:** ${cores}
        ${EMOJIS.ARROW} **Uso:** ${cpuUsage}
        `,
        true
      )
      .addField(
        "RAM Del Bot:",
        outdent`
        ${EMOJIS.ARROW} **Usó:** ${botUsed}
        ${EMOJIS.ARROW} **Disponible:** ${botAvailable}
        ${EMOJIS.ARROW} **Uso:** ${botUsage}
        `,
        true
      )
      .addField(
        "RAM General:",
        outdent`
      ${EMOJIS.ARROW} **Usó:** ${overallUsed}
      ${EMOJIS.ARROW} **Disponible:** ${overallAvailable}
      ${EMOJIS.ARROW} **Uso:** ${overallUsage}
      `,
        true
      )
      .addField("Versión NodeJs", process.versions.node, false)
      .addField("Tiempo De Actividad", "```" + timeformat(process.uptime()) + "```", false)
      .addField("INVTAME:", `[¡Agrégame Aqui!](${BOT_INVITE})`, true)
      .addField("SOPORTE:", `[¡Discord!](${SUPPORT_SERVER})`, true);

    ctx.reply({ embeds: [embed] });
  }
};
