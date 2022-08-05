const { PermissionResolvable, Client, MessageEmbed } = require("discord.js");
const { permissions, sendMessage } = require("@utils/botUtils");
const CommandContext = require("./command-context");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");

class Command {
  /**
   * @typedef {Object} ThrottlingOptions
   * @property {number} usages - Número máximo de usos del comando permitidos en el marco de tiempo.
   * @property {number} duration - Cantidad de tiempo para contar los usos del comando dentro (en segundos).
   */

  /**
   * @typedef {Object} SubCommand
   * @property {string} trigger - subcomando invocar
   * @property {string} description - descripción del subcomando
   */

  /**
   * @typedef {"ADMIN" | "AUTOMOD" | "ECONOMÍA" | "DIVERSIÓN" | "IMAGEN" | "INFORMACIÓN" | "INVITACIÓN" | "MODERACIÓN" | "DUEÑO" | "SOCIAL" | "TICKET" | "UTILIDADES" } CommandCategory
   */

  /**
   * @typedef {Object} CommandInfo
   * @property {string} name - El nombre del comando (debe estar en minúsculas)
   * @property {string} description - Una breve descripción del comando.
   * @property {string[]} [aliases] - Nombres alternativos para el comando (todos deben estar en minúsculas)
   * @property {string} [usage=""] - La cadena de formato de uso del comando
   * @property {SubCommand[]} [subcommands=[]] - Lista de subcomandos
   * @property {number} [minArgsCount=0] - Número mínimo de argumentos que toma el comando (el valor predeterminado es 0)
   * @property {CommandCategory} category - La categoría a la que pertenece este comando
   * @property {ThrottlingOptions} [throttling] - Opciones para limitar los usos del comando.
   * @property {string[]} [examples] - Ejemplos de uso del comando
   * @property {PermissionResolvable[]} [botPermissions] - Permisos requeridos por el cliente para usar el comando.
   * @property {PermissionResolvable[]} [userPermissions] - Permisos requeridos por el usuario para usar el comando.
   * @property {boolean} [ownerOnly=false] - Si el comando solo puede ser utilizado por un propietario
   * @property {boolean} [nsfw=false] - Si el comando solo se puede usar en canales NSFW.
   * @property {boolean} [hidden=false] - Si el comando debe ocultarse del comando de ayuda
   */

  /**
   * @param {Client} client - El cliente discord
   * @param {CommandInfo} info - La información del comando
   */
  constructor(client, info) {
    this.constructor.validateInfo(client, info);
    this.client = client;
    this.name = info.name;
    this.description = info.description;
    this.aliases = info.aliases || [];
    this.usage = info.usage || "";
    this.subcommands = info.subcommands || [];
    this.minArgsCount = info.minArgsCount || 0;
    this.category = info.category;
    this.throttling = info.throttling || null;
    this.examples = info.examples || null;
    this.userPermissions = info.userPermissions || [];
    this.botPermissions = info.botPermissions || [];
    this.ownerOnly = info.ownerOnly;
    this.nsfw = info.nsfw;
    this.hidden = info.hidden;
  }

  /**
   * @param {CommandContext} ctx
   */
  async execute(ctx) {
    const { message, channel, guild } = ctx;

    if (!message.guild.members.cache.has(message.author.id) && !message.webhookId) {
      message.member = await message.guild.members.fetch(message.author);
    }

    // Comprobar argumentos
    if (this.minArgsCount > 0 && ctx.args.length < this.minArgsCount) {
      return this.sendUsage(channel, ctx.prefix, ctx.invoke, "Argumentos faltantes");
    }

    // Verifique los permisos específicos del servidor
    if (guild) {
      const { member } = message;
      // Comando solo propietario
      if (this.ownerOnly) {
        if (guild.ownerID != member.id)
          return ctx.reply(`El comando \`${this.name}\` solo puede ser utilizado por el dueño del servidor.`);
      }

      // Comando NSFW
      if (this.nsfw && !channel.nsfw) {
        return;
      }

      if (!channel.permissionsFor(guild.me).has("SEND_MESSAGES")) return;

      // Comprobar permisos de usuario
      if (this.userPermissions.length > 0 && !channel.permissionsFor(member).has(this.userPermissions)) {
        let permissionWord = "permission" + (this.userPermissions.length > 1 ? "s" : "");
        return ctx.reply(
          "Necesitas " + this.parsePermissions(this.userPermissions) + " " + permissionWord + " para este comando"
        );
      }

      // Comprobar los permisos de los bots
      if (this.botPermissions.length > 0 && !channel.permissionsFor(guild.me).has(this.botPermissions)) {
        let permissionWord = "permission" + (this.botPermissions.length > 1 ? "s" : "");
        return ctx.reply(
          "Necesito " + this.parsePermissions(this.botPermissions) + " " + permissionWord + " para este comando"
        );
      }
    }

    await this.run(ctx);
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    throw new Error(`${this.constructor.name} no tiene un método run().`);
  }

  /**
   * @param {PermissionResolvable[]} perms
   */
  parsePermissions(perms) {
    return perms.map((perm) => "`" + permissions[perm] + "`").join(", ");
  }

  getUsageEmbed(prefix, invoke, title) {
    let desc = "";
    if (this.subcommands.length > 0) {
      this.subcommands.forEach((sub) => (desc += `${EMOJIS.ARROW} \`${invoke} ${sub.trigger}\`: ${sub.description}\n`));
    } else {
      desc += "**Uso:**\n```css\n" + prefix + invoke + " " + this.usage + "```";
    }

    if (this.description !== "") desc += "\n**Ayuda:** " + this.description;

    if (this.throttling) {
      desc += "\n**Enfriamiento:** " + this.throttling.usages + " " + this.throttling.duration;
    }

    const embed = new MessageEmbed().setColor(EMBED_COLORS.BOT_EMBED).setDescription(desc);
    if (title) embed.setAuthor(title);
    return embed;
  }

  sendUsage(channel, prefix, invoke, title) {
    const embed = this.getUsageEmbed(prefix, invoke, title);
    sendMessage(channel, { embeds: [embed] });
  }

  /**
   * Valida los parámetros del constructor.
   * @param {Client} client - Cliente a validar
   * @param {CommandInfo} info - Información para validar
   * @private
   */
  static validateInfo(client, info) {
    if (!client) throw new Error("Se debe especificar un cliente.");
    if (typeof info !== "object") throw new TypeError("La información del comando debe ser un objeto.");
    if (typeof info.name !== "string") throw new TypeError("El nombre del comando debe ser una cadena.");
    if (info.name !== info.name.toLowerCase()) throw new Error("El nombre del comando debe estar en minúsculas.");
    if (typeof info.description !== "string") throw new TypeError("La descripción del comando debe ser una cadena.");
    if (info.aliases && (!Array.isArray(info.aliases) || info.aliases.some((ali) => typeof ali !== "string"))) {
      throw new TypeError("Los alias de comando deben ser una matriz de cadenas.");
    }
    if (info.aliases && info.aliases.some((ali) => ali !== ali.toLowerCase())) {
      throw new RangeError("Los alias de comando deben estar en minúsculas.");
    }
    if (info.usage && typeof info.usage !== "string") throw new TypeError("El uso del comando debe ser una cadena.");
    if (info.minArgsCount && typeof info.minArgsCount !== "number")
      throw new TypeError("El uso del comando debe ser un número.");
    if (info.throttling) {
      if (typeof info.throttling !== "object") throw new TypeError("La limitación de comandos debe ser un objeto.");
      if (typeof info.throttling.usages !== "number" || isNaN(info.throttling.usages)) {
        throw new TypeError("Los usos de limitación de comandos deben ser un número.");
      }
      if (info.throttling.usages < 1) throw new RangeError("Los usos de limitación de comandos deben ser al menos 1.");
      if (typeof info.throttling.duration !== "number" || isNaN(info.throttling.duration)) {
        throw new TypeError("La duración de la limitación del comando debe ser un número.");
      }
      if (info.throttling.duration < 1) throw new RangeError("La duración de la limitación del comando debe ser al menos 1.");
    }
    if (info.examples && (!Array.isArray(info.examples) || info.examples.some((ex) => typeof ex !== "string"))) {
      throw new TypeError("Los ejemplos de comandos deben ser una matriz de cadenas.");
    }
    if (info.botPermissions) {
      if (!Array.isArray(info.botPermissions)) {
        throw new TypeError("El comando botPermissions debe ser una matriz de cadenas de clave de permiso.");
      }
      for (const perm of info.botPermissions) {
        if (!permissions[perm]) throw new RangeError(`Permiso de cliente de comando no válido: ${perm}`);
      }
    }
    if (info.userPermissions) {
      if (!Array.isArray(info.userPermissions)) {
        throw new TypeError("El comando userPermissions debe ser una matriz de cadenas de clave de permiso.");
      }
      for (const perm of info.userPermissions) {
        if (!permissions[perm]) throw new RangeError(`Permiso de usuario de comando no válido: ${perm}`);
      }
    }
    if (info.ownerOnly && typeof info.ownerOnly !== "boolean")
      throw new TypeError("El comando OwnerOnly debe ser un valor booleano.");
    if (info.nsfw && typeof info.nsfw !== "boolean") throw new TypeError("El comando nsfw debe ser un booleano.");
    if (info.hidden && typeof info.hidden !== "boolean") throw new TypeError("El comando oculto debe ser un valor booleano.");
  }
}

module.exports = Command;
