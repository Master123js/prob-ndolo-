const { Command, CommandContext } = require("@src/structures");
const { antiLinks } = require("@schemas/guild-schema");

module.exports = class AntiLinks extends Command {
  constructor(client) {
    super(client, {
      name: "antilinks",
      description: "Permitir o no permitir el envío de enlaces en el mensaje",
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

    await antiLinks(guild.id, status)
      .then(() => {
        ctx.reply(
          `Los mensajes ${status ? "con enlaces ahora se eliminarán automáticamente" : "no filtrarán los enlaces ahora"}`
        );
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Error de back-end inesperado");
      });
  }
};
