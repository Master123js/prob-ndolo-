const { Command, CommandContext } = require("@src/structures");
const { timeformat } = require("@utils/miscUtils");

module.exports = class UptimeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "uptime",
      description: "Muestra el tiempo de actividad del bot",
      category: "INFORMATION",
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    ctx.reply("Mi Tiempo De Actividad: `" + timeformat(process.uptime()) + "`");
  }
};
