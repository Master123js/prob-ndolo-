const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");
const moment = require("moment");

module.exports = class GuildInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: "guildinfo",
      description: "Muestra información sobre el servidor de Discord",
      aliases: ["serverinfo"],
      category: "INFORMATION",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { guild } = ctx;
    const { name, id, preferredLocale, channels, roles, ownerId } = guild;

    let owner = await guild.members.fetch(ownerId);
    let createdAt = moment(guild.createdAt);

    let totalChannels = channels.cache.size;
    let categories = channels.cache.filter((c) => c.type === "GUILD_CATEGORY").size;
    let textChannels = channels.cache.filter((c) => c.type === "GUILD_TEXT").size;
    let voiceChannels = channels.cache.filter((c) => c.type === "GUILD_VOICE" || c.type === "GUILD_STAGE_VOICE").size;
    let threadChannels = channels.cache.filter(
      (c) => c.type === "GUILD_PRIVATE_THREAD" || c.type === "GUILD_PUBLIC_THREAD"
    ).size;

    let memberCache = guild.members.cache;
    let all = memberCache.size;
    let bots = memberCache.filter((m) => m.user.bot).size;
    let users = all - bots;
    let onlineUsers = memberCache.filter((m) => !m.user.bot && m.presence?.status === "En Línea").size;
    let onlineBots = memberCache.filter((m) => m.user.bot && m.presence?.status === "En Línea").size;
    let onlineAll = onlineUsers + onlineBots;

    let rolesCount = roles.cache.size;
    let rolesString = roles.cache
      .filter((r) => !r.name.includes("everyone"))
      .map((r) => `${r.name}[${getMembersInRole(memberCache, r)}]`)
      .join(", ");

    let verificationLevel = guild.verificationLevel;
    switch (guild.verificationLevel) {
      case "VERY_HIGH":
        verificationLevel = "┻�?┻ミヽ(ಠ益ಠ)ノ彡┻�?┻";
        break;

      case "HIGH":
        verificationLevel = "(╯°□°）╯︵ ┻�?┻";
        break;

      default:
        break;
    }

    let desc = "";
    desc = desc + EMOJIS.ARROW + " **Id:** " + id + "\n";
    desc = desc + EMOJIS.ARROW + " **Nombre:** " + name + "\n";
    desc = desc + EMOJIS.ARROW + " **Dueño:** " + owner.user.tag + "\n";
    desc = desc + EMOJIS.ARROW + " **Región:** " + preferredLocale + "\n";
    desc = desc + "\n";

    let embed = new MessageEmbed()
      .setTitle("INFORMACIÓN DEL SERVIDOR")
      .setThumbnail(guild.iconURL())
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(desc)
      .addField(`Miembros Del Servidor [${all}]`, "```Miembros: " + users + "\nBots: " + bots + "```", true)
      .addField(`Estadísticas En Línea [${onlineAll}]`, "```Miembros: " + onlineUsers + "\nBots: " + onlineBots + "```", true)
      .addField(
        `Categorías Y Canales [${totalChannels}]`,
        "```Categorías: " +
          categories +
          " | Texto: " +
          textChannels +
          " | Voz: " +
          voiceChannels +
          " | Hilo: " +
          threadChannels +
          "```",
        false
      )
      .addField(`Roles [${rolesCount}]`, "```" + rolesString + "```", false)
      .addField("Verificación", "```" + verificationLevel + "```", true)
      .addField("Conteo De Boost", "```" + guild.premiumSubscriptionCount + "```", true)
      .addField(
        `Servidor Creado [${createdAt.fromNow()}]`,
        "```" + createdAt.format("dddd, Do MMMM YYYY") + "```",
        false
      );

    if (guild.splashURL) embed.setImage(guild.splashURL);

    ctx.reply({ embeds: [embed] });
  }
};

function getMembersInRole(members, role) {
  return members.filter((m) => m.roles.cache.has(role.id)).size;
}
