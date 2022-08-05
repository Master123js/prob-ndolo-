const { Command, CommandContext } = require("@src/structures");
const { getEffectiveInvites, checkInviteRewards } = require("@features/invite-tracker");
const { incrementInvites } = require("@schemas/invite-schema");
const { EMBED_COLORS } = require("@root/config.js");
const { MessageEmbed } = require("discord.js");
const { resolveMember } = require("@root/src/utils/guildUtils");

module.exports = class AddInvitesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "addinvites",
      description: "Agrega invitaciones a un miembro",
      usage: "<@miembro | id> <invitaciónes>",
      minArgsCount: 2,
      category: "INVITE",
      botPermissions: ["EMBED_LINKS"],
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, guild, args } = ctx;
    const target = await resolveMember(message, args[0], true);
    const amount = ctx.args[1];

    if (!target) return ctx.reply(`Sintaxis incorrecta. Debes mencionar un objetivo`);
    if (isNaN(amount)) return ctx.reply(`El monto de la invitación debe ser un número`);

    const inviteData = await incrementInvites(guild.id, target.id, "ADDED", amount);

    const embed = new MessageEmbed()
      .setAuthor(`Invitaciones añadidas a ${target.user.username}`)
      .setThumbnail(target.user.displayAvatarURL())
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription(`${target.user.tag} ahora tiene ${getEffectiveInvites(inviteData)} invitaciones`);

    ctx.reply({ embeds: [embed] });
    checkInviteRewards(guild, inviteData, true);
  }
};
