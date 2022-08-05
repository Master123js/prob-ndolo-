const { Command, CommandContext } = require("@src/structures");
const { getEffectiveInvites } = require("@features/invite-tracker");
const { getDetails } = require("@schemas/invite-schema");
const { EMBED_COLORS } = require("@root/config.js");
const { MessageEmbed } = require("discord.js");
const outdent = require("outdent");
const { resolveMember } = require("@utils/guildUtils");

module.exports = class InviterCommand extends Command {
  constructor(client) {
    super(client, {
      name: "inviter",
      description: "Muestra la información del invitador",
      usage: "[@miembro | id]",
      category: "INVITE",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    const target = (await resolveMember(message, args[0])) || message.member;

    const inviteData = await getDetails(message.guild.id, target.id);
    if (!inviteData || !inviteData.inviter_id) return ctx.reply(`No se puede rastrear cómo \`${target.user.tag}\` se unió`);

    let inviter = await message.client.users.fetch(inviteData.inviter_id, false, true);
    let inviterData = await getDetails(message.guild.id, inviteData.inviter_id);

    const embed = new MessageEmbed().setColor(EMBED_COLORS.BOT_EMBED).setAuthor(`Datos de invitación para ${target.displayName}`)
      .setDescription(outdent`
      Invitador: \`${inviter?.tag || "Usuario Eliminado"}\`
      ID Del Invitador: \`${inviteData.inviter_id}\`
      Código Del Invitador: \`${inviteData.invite_code}\`
      Invitaciones: \`${getEffectiveInvites(inviterData)}\`
      `);

    ctx.reply({ embeds: [embed] });
  }
};
