const { Command, CommandContext } = require("@src/structures");
const { xpSystem } = require("@schemas/guild-schema");

module.exports = class XPSystem extends Command {
  constructor(client) {
    super(client, {
      name: "xpsystem",
      description: "Habilita o deshabilita el sistema de clasificación XP en el servidor",
      usage: "<ON | OFF>",
      minArgsCount: 1,
      category: "ADMIN",
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

    xpSystem(guild.id, status)
      .then(() => {
        ctx.reply(`¡Configuración guardada! El sistema XP esta ahora ${status ? "activado" : "desactivado"}`);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Error de back-end inesperado");
      });
  }
};
