const { Command, CommandContext } = require("@src/structures");
const db = require("@schemas/guild-schema");

module.exports = class FlagTranslation extends Command {
  constructor(client) {
    super(client, {
      name: "flagtr",
      description: "Configura la traducción por bandera",
      minArgsCount: 1,
      subcommands: [
        {
          trigger: "<ON | OFF>",
          description: "Habilita o deshabilita la traducción por banderas",
        },
        {
          trigger: "status",
          description: "Estado de traducción por bandera",
        },
        {
          trigger: "add <#canal(es)>",
          description: "Agregue canales donde debe ocurrir la traducción por banderas",
        },
        {
          trigger: "remove <#channel(s)>",
          description: "Elimina canales con traducciones por bandera habilitadas",
        },
      ],
      category: "ADMIN",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args, message } = ctx;
    const input = args[0].toLowerCase();
    const mentions = message.mentions.channels.map((ch) => ch.id);
    const settings = await db.getSettings(message.guild);

    switch (input) {
      case "add":
        if (mentions.size === 0) return message.reply("¡Uso incorrecto! Necesitas mencionar canales");
        let toAdd = [...new Set([...mentions, ...settings.flag_translation.channels])];
        await db.setFlagTrChannels(message.guildId, toAdd);
        ctx.reply("¡Éxito! Configuración guardada");
        break;

      case "remove":
        if (mentions.size === 0) return message.reply("¡Uso incorrecto! Necesitas mencionar canales");
        let newIds = settings.flag_translation.channels.filter((item) => !mentions.includes(item));
        await db.setFlagTrChannels(message.guildId, newIds);
        ctx.reply("¡Éxito! Configuración guardada");
        break;

      case "status":
        if (!settings.flag_translation.enabled) return await ctx.reply("La traducción por banderas está deshabilitada en este servidor");
        let channels = settings.flag_translation.channels
          .filter((id) => message.guild.channels.cache.has(id))
          .map((id) => message.guild.channels.cache.get(id).toString())
          .join(", ");

        if (!channels) return ctx.reply("La traducción por banderas está habilitada en todos los canales");
        ctx.reply("La traducción por banderas está habilitada en los siguientes canales: \n" + channels);
        break;

      default:
        let status;
        if (input === "none" || input === "off" || input === "disable") status = false;
        else if (input === "on" || input === "enable") status = true;
        else return message.reply("Uso incorrecto de comandos");

        await db.flagTranslation(message.guildId, status);
        ctx.reply(`¡Configuración guardada! La traducción de banderas esta ahora ${status ? "activado" : "desactivado"}`);
    }
  }
};
