const { Command, CommandContext } = require("@src/structures");
const { getResponse } = require("@utils/httpUtils");

const PROXY_TYPES = ["all", "http", "socks4", "socks5"];

module.exports = class ProxiesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "proxies",
      description: "Obtiene proxies. Tipos disponibles: HTTP, SOCKS4, SOCKS5",
      usage: "[type]",
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args } = ctx;
    let type = "all";

    if (args[0]) {
      if (PROXY_TYPES.includes(args[0].toLowerCase())) type = args[0].toLowerCase();
      else return ctx.reply("Tipo de proxy incorrecto. Tipos disponibles: `http`, `socks4`, `socks5`");
    }

    ctx.reply("Obteniendo proxies... Por favor, espere").then(async (msg) => {
      const response = await getResponse(
        `https://api.proxyscrape.com/?request=displayproxies&proxytype=${type}&timeout=10000&country=all&anonymity=all&ssl=all`
      );

      if (!response.status) ctx.reply("Error al obtener proxies");
      if (response.data.length === 0) ctx.reply("No se pudieron obtener los datos. Vuelva a intentarlo más tarde");

      msg.delete().then(async () => {
        message.reply({
          content: `${type.toUpperCase()} Proxies obtenidos`,
          files: [
            {
              name: `${type.toLowerCase()}_proxies.txt`,
              attachment: Buffer.from(response.data),
            },
          ],
        });
      });
    });
  }
};
