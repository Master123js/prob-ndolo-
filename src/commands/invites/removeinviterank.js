const { Command, CommandContext } = require("@src/structures");
const { findMatchingRoles } = require("@utils/guildUtils");
const { getSettings, removeInviteRank } = require("@schemas/guild-schema");

module.exports = class AddInvitesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "reminviterank",
      description: "Elimina el rango de invitación configurado con ese rol",
      usage: "<nombre-del-rol>",
      minArgsCount: 1,
      aliases: ["removeinviterank"],
      category: "INVITE",
      botPermissions: ["MANAGE_GUILD"],
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args, guild } = ctx;
    const query = args[0];

    const role = message.mentions.roles.first() || findMatchingRoles(guild, query)[0];
    if (!role) return ctx.reply("No se encontraron roles que coincidan `" + query + "`");

    const settings = await getSettings(guild);
    const exists = settings.invite.ranks.find((obj) => obj._id === role.id);

    if (!exists) return ctx.reply("No se ha encontrado ningún rango de invitación anterior para este rol");
    await removeInviteRank(guild.id, role.id).then(ctx.reply("¡Éxito! Configuración guardada."));
  }
};
