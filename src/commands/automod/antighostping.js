const { Command, CommandContext } = require("@src/structures");
const { antiGhostPing } = require("@schemas/guild-schema");

module.exports = class AntiGhostPing extends Command {
  constructor(client) {
    super(client, {
      name: "antighostping",
      description: "Registra mensajes eliminados con menciones (Requiere configuración de `!automodlog`)",
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

    await antiGhostPing(guild.id, status)
      .then(() => {
        ctx.reply(`El registro anti-ghostping ahora esta ${status ? "activado" : "desactivado"}`);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Error de back-end inesperado");
      });
  }
};
