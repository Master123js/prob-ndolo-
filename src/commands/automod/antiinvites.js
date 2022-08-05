const { Command, CommandContext } = require("@src/structures");
const { antiInvites } = require("@schemas/guild-schema");

module.exports = class AntiInvites extends Command {
  constructor(client) {
    super(client, {
      name: "antiinvites",
      description: "Permitir o no permitir el envío de invitaciones de discord en el mensaje",
      usage: "<ON | OFF>",
      minArgsCount: 1,
      category: "AUTOMOD",
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

    await antiInvites(guild.id, status)
      .then(() => {
        ctx.reply(
          `Los mensajes ${
            status
              ? "Con invitaciones de discord ahora se eliminarán automáticamente"
              : "No serán filtrados para invitaciones de discord ahora"
          }`
        );
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Error de back-end inesperado");
      });
  }
};
