const { Command, CommandContext } = require("@src/structures");
const { isHex } = require("@utils/miscUtils");
const db = require("@schemas/greeting-schema");
const { buildEmbed } = require("@features/greeting-handler");
const { getConfig } = require("@schemas/greeting-schema");

module.exports = class Welcome extends Command {
  constructor(client) {
    super(client, {
      name: "welcome",
      description: "Configura el mensaje de bienvenida",
      minArgsCount: 1,
      subcommands: [
        {
          trigger: "<#canal | OFF>",
          description: "Habilita o deshabilita el mensaje de bienvenida",
        },
        {
          trigger: "preview",
          description: "Previsualiza el mensaje de bienvenida configurado",
        },
        {
          trigger: "desc <text>",
          description: "Establece la descripción del embed",
        },
        {
          trigger: "thumbnail <ON | OFF>",
          description: "Habilita / deshabilita la miniatura del embed",
        },
        {
          trigger: "color <hexcolor>",
          description: "Establece el color del embed",
        },
        {
          trigger: "footer <text>",
          description: "Establece el contenido del pie de página del embed",
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
    const { message, args, guild } = ctx;
    const type = args[0].toLowerCase();

    switch (type) {
      case "off":
        db.setChannel(guild.id, null, "welcome")
          .then(ctx.reply("¡Configuración guardada! Mensaje de bienvenida deshabilitado"))
          .catch((_) => ctx.reply("No se pudo guardar la configuración"));
        break;

      case "preview":
        return await sendPreview(ctx);

      case "desc":
        return await setDescription(ctx);

      case "thumbnail":
        return await setThumbnail(ctx);

      case "color":
        return await setColor(ctx);

      case "footer":
        return await setFooter(ctx);

      default:
        if (message.mentions.channels.size > 0) {
          const target = message.mentions.channels.first();
          db.setChannel(guild.id, target.id, "welcome")
            .then(ctx.reply("¡Configuración guardada! Se enviarán mensajes de bienvenida a " + target.toString()))
            .catch((_) => ctx.reply("No se pudo guardar la configuración"));
        } else {
          message.reply("Uso incorrecto de comandos");
        }
    }
  }
};

async function sendPreview(ctx) {
  const config = (await getConfig(ctx.guild.id))?.welcome;
  let embed = await buildEmbed(ctx.message.member, config?.embed);
  if (embed) {
    ctx.reply({ embeds: [embed] });
  } else {
    ctx.message.reply("Mensaje de bienvenida no configurado en este servidor");
  }
}

async function setDescription(ctx) {
  const { message, args } = ctx;
  if (args.length < 2) return message.reply("¡Argumentos insuficientes! Proporcione contenido válido");
  const content = args.slice(1).join(" ");

  db.setDescription(message.guild.id, content, "welcome")
    .then(ctx.reply("¡Configuración guardada! Mensaje de bienvenida actualizado"))
    .catch((_) => ctx.reply("No se pudo guardar la configuración"));
}

async function setThumbnail(ctx) {
  const { message, args } = ctx;
  if (args.length < 2) return message.reply("¡Argumentos insuficientes! Proporcione un argumento válido (`on/off`)");

  let thumbnail;
  if (args[1].toLowerCase() === "on") thumbnail = true;
  else if (args[1].toLowerCase() === "off") thumbnail = false;
  else return message.reply("Entrada inválida. El valor debe ser `on/off`");

  db.setThumbnail(message.guild.id, thumbnail, "welcome")
    .then(ctx.reply("¡Configuración guardada! Mensaje de bienvenida actualizado"))
    .catch((_) => ctx.reply("No se pudo guardar la configuración"));
}

async function setColor(ctx) {
  const { message, args } = ctx;
  if (args.length < 2) return message.reply("¡Argumentos insuficientes! Proporcione un color hexadecimal válido");
  const color = args[1];

  if (!isHex(color)) return message.reply("¡Ups! Eso no parece un código de color HEX válido");

  db.setColor(message.guild.id, color, "welcome")
    .then(ctx.reply("¡Configuración guardada! Mensaje de bienvenida actualizado"))
    .catch((_) => ctx.reply("No se pudo guardar la configuración"));
}

async function setFooter(ctx) {
  const { message, args } = ctx;
  if (args.length < 2) return message.reply("¡Argumentos insuficientes! Proporcione contenido válido");
  const content = args.slice(1).join(" ");

  db.setFooter(message.guild.id, content, "welcome")
    .then(ctx.reply("¡Configuración guardada! Mensaje de bienvenida actualizado"))
    .catch((_) => ctx.reply("No se pudo guardar la configuración"));
}
