const { Command, CommandContext } = require("@src/structures");
const { inviteTracking } = require("@schemas/guild-schema");
const { cacheGuildInvites } = require("@features/invite-tracker");

module.exports = class InviteTracker extends Command {
  constructor(client) {
    super(client, {
      name: "invitetracker",
      description: "Habilita o deshabilita el seguimiento de invitaciones en el servidor",
      usage: "<ON | OFF>",
      minArgsCount: 1,
      aliases: ["invitetracking"],
      category: "INVITE",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args, guild } = ctx;
    const input = args[0].toLowerCase();
    let status;

    if (input === "none" || input === "off" || input === "disable") status = false;
    else if (input === "on" || input === "enable") status = true;
    else return ctx.reply("Uso incorrecto de comandos");

    if (status) {
      if (!guild.me.permissions.has(["MANAGE_GUILD", "MANAGE_CHANNELS"])) {
        return await ctx.reply(
          "¡Ups! ¡Me falta el permiso `Administrar servidor`, `Administrar canales`!\nNo puedo rastrear invitaciones"
        );
      }

      const channelMissing = guild.channels.cache
        .filter((ch) => ch.type === "GUILD_TEXT" && !ch.permissionsFor(guild.me).has("MANAGE_CHANNELS"))
        .map((ch) => ch.name);

      if (channelMissing.length > 1) {
        return ctx.reply(
          "Es posible que no pueda rastrear las invitaciones correctamente\nMe falta el permiso `Gestionar canal` en los siguientes canales```" +
            channelMissing.join(", ") +
            "```"
        );
      }
    }

    try {
      await cacheGuildInvites(guild);
    } catch (ex) {
      return ctx.reply("¡Ocurrió un error inesperado al almacenar en caché las invitaciones!");
    }

    inviteTracking(guild.id, status)
      .then(() => {
        ctx.reply(`¡Configuración guardada! El seguimiento de invitaciones esta ahora ${status ? "activdo" : "desactivado"}`);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Error de back-end inesperado");
      });
  }
};
