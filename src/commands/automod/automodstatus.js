const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { getSettings } = require("@schemas/guild-schema");
const ascii = require("ascii-table");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");

module.exports = class AutoModStatus extends Command {
  constructor(client) {
    super(client, {
      name: "automodstatus",
      description: "Verifica la configuración del automod para este servidor",
      category: "AUTOMOD",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { guild } = ctx;
    const settings = (await getSettings(guild)).automod;

    let table = new ascii("").setHeading("Rasgo", "Estado");
    const logChannel = settings?.log_channel
      ? guild.channels.cache.get(settings.log_channel).toString()
      : "No Configurado";

    table
      .addRow("Lineas Maximas", settings?.max_lines || "NA")
      .addRow("Menciones Máximas", settings?.max_mentions || "NA")
      .addRow("Menciones Máximas De Roles", settings?.max_role_mentions || "NA")
      .addRow("AntiLinks", settings?.anti_links ? EMOJIS.TICK : EMOJIS.X_MARK)
      .addRow("AntiInvitaciones", settings?.anti_invites ? EMOJIS.TICK : EMOJIS.X_MARK)
      .addRow("AntiGhostPing", settings?.anti_ghostping ? EMOJIS.TICK : EMOJIS.X_MARK);

    const embed = new MessageEmbed()
      .setAuthor("Estado Del Automod")
      .setColor(EMBED_COLORS.TRANSPARENT_EMBED)
      .setDescription("**Canal De Registro:** " + logChannel + "\n\n```" + table.toString() + "```");

    ctx.reply({ embeds: [embed] });
  }
};
