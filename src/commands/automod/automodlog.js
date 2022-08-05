const { Command, CommandContext } = require("@src/structures");
const { automodLogChannel } = require("@schemas/guild-schema");
const { canSendEmbeds } = require("@utils/guildUtils");

module.exports = class AutoModLog extends Command {
  constructor(client) {
    super(client, {
      name: "automodlog",
      description: "habilita / deshabilita el registro de eventos de automod",
      usage: "<#canal | OFF>",
      minArgsCount: 1,
      category: "AUTOMOD",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, args, guild } = ctx;
    const input = args[0].toLowerCase();
    let targetChannel;

    if (input === "none" || input === "off" || input === "disable") targetChannel = null;
    else {
      if (message.mentions.channels.size == 0) return ctx.reply("Uso incorrecto de comandos");
      targetChannel = message.mentions.channels.first();

      if (!canSendEmbeds(targetChannel))
        return ctx.reply(
          "¡Puaj! ¿No puedo enviar registros a ese canal? Necesito los permisos `Escribir mensajes` e `Incrustar enlaces` en ese canal"
        );
    }

    await automodLogChannel(guild.id, targetChannel?.id)
      .then(() => {
        ctx.reply(`¡Configuración guardada! Canal AutomodLog ${targetChannel ? "actualizado" : "removido"}`);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Error de back-end inesperado");
      });
  }
};
