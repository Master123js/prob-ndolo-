const { Command, CommandContext } = require("@src/structures");

module.exports = class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "Muestra el ping actual del bot a los servidores de Discord",
      category: "INFORMATION",
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;
    ctx.reply("🏓 Pong : `" + Math.floor(message.client.ws.ping) + "ms`");
  }
};
