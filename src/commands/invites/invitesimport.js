const { Command, CommandContext } = require("@src/structures");
const { incrementInvites } = require("@schemas/invite-schema");

module.exports = class InvitesImportCommand extends Command {
  constructor(client) {
    super(client, {
      name: "invitesimport",
      description: "Agregar invitaciones del servidor existentes a los usuarios",
      category: "INVITE",
      botPermissions: ["MANAGE_GUILD"],
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;
    const target = message.mentions.members.first();
    let invites = await message.guild.invites.fetch({ cache: false });

    invites.forEach(async (invite) => {
      let user = invite.inviter;
      if (!user || invite.uses == 0) return; //console.log("No inviter");
      if (target && user.id !== target.id) return; //console.log("Skipping non user");
      await incrementInvites(message.guild.id, user.id, "ADDED", invite.uses);
    });

    ctx.reply(`¡Hecho! Invitaciones anteriores añadidas a ${target ? target.user.tag : "todos los miembros"}`);
  }
};
