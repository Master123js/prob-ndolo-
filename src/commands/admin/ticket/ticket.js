const { MessageEmbed } = require("discord.js");
const { Command, CommandContext } = require("@src/structures");
const { sendMessage } = require("@utils/botUtils");
const { canSendEmbeds, findMatchingRoles } = require("@utils/guildUtils");
const { isTicketChannel, closeTicket, closeAllTickets, PERMS } = require("@utils/ticketUtils");
const { setTicketLogChannel, setTicketLimit } = require("@schemas/guild-schema");
const { createNewTicket } = require("@schemas/ticket-schema");
const outdent = require("outdent");
const { EMBED_COLORS, EMOJIS } = require("@root/config.js");

const SETUP_TIMEOUT = 30 * 1000;

module.exports = class Ticket extends Command {
  constructor(client) {
    super(client, {
      name: "ticket",
      description: "Varios comandos de emisión para tickets",
      minArgsCount: 1,
      subcommands: [
        {
          trigger: "setup",
          description: "Iniciar una configuración de ticket interactivo",
        },
        {
          trigger: "log <#canal>",
          description: "Configurar el canal de registro para las entradas",
        },
        {
          trigger: "limit <número>",
          description: "Establece el número máximo de tickets abiertos simultáneos",
        },
        {
          trigger: "close",
          description: "Cierra el ticket",
        },
        {
          trigger: "closeall",
          description: "cerrar todos los tickets abiertos",
        },
        {
          trigger: "add <Idusuario | IDrol>",
          description: "Agrega usuario / rol al ticket",
        },
        {
          trigger: "remove <Idusuario | IDrol>",
          description: "Quita un usuario / rol del ticket",
        },
      ],
      category: "TICKET",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const input = ctx.args[0].toLowerCase();

    switch (input) {
      case "setup":
        return await setupTicket(ctx);

      case "log":
        return await setupLogChannel(ctx);

      case "limit":
        return await setupLimit(ctx);

      case "close":
        return await close(ctx);

      case "closeall":
        return await closeAll(ctx);

      case "add":
        return await addToTicket(ctx);

      case "remove":
        return await removeFromTicket(ctx);

      default:
        this.sendUsage(ctx.channel, ctx.prefix, ctx.invoke, "Entrada incorrecta");
    }
  }
};

/**
 * @param {CommandContext} ctx
 */
async function setupTicket(ctx) {
  const { message, channel, guild } = ctx;
  const filter = (m) => m.author.id === message.author.id;
  let embed = new MessageEmbed()
    .setAuthor("Configuración De Ticket")
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setFooter("Escriba **cancel** para cancelar la configuración");

  let targetChannel, title, role;
  try {
    // wait for channel
    await ctx.reply({
      embeds: [embed.setDescription("Por favor `mencione el canal` en el que se debe enviar el mensaje de reacción")],
    });
    let reply = await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT });
    if (reply.first().content === "cancel") return ctx.reply("Se ha cancelado la configuración del ticket");
    targetChannel = reply.first().mentions.channels.first();
    if (!targetChannel) return ctx.reply("La configuración del ticket ha sido cancelada. No mencionaste un canal.");
    if (!targetChannel.isText() && !targetChannel.permissionsFor(guild.me).has(PERMS))
      return ctx.reply(
        `La configuración del boleto ha sido cancelada. No tengo permiso para enviar embeds a ${targetChannel.toString()}`
      );

    // wait for title
    await ctx.reply({ embeds: [embed.setDescription("Por favor ingrese el `título` del ticket")] });
    reply = await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT });
    if (reply.first().content === "cancel") return ctx.reply("Se ha cancelado la configuración del ticket");
    title = reply.first().content;

    // wait for roles
    let desc = outdent`¿Qué roles deberían tener acceso para ver los tickets recién creados?
    Escriba el nombre de un rol existente en este servidor.\n
    Alternativamente, puede escribir \`none\``;
    await ctx.reply({ embeds: [embed.setDescription(desc)] });
    reply = await channel.awaitMessages({ filter, max: 1, time: SETUP_TIMEOUT });
    let search = reply.first().content;
    if (search === "cancel") return ctx.reply("Se ha cancelado la configuración del ticket");
    if (search.toLowerCase() !== "none") {
      role = findMatchingRoles(guild, search)[0];
      if (!role) return ctx.reply(`Uh oh, ¡No pude encontrar ningún rol llamado ${search}! Se ha cancelado la configuración del ticket`);
      await ctx.reply(`¡Bien! \`${role.name}\` ahora puede ver los tickets recién creados`);
    }
  } catch (ex) {
    return ctx.reply("Sin respuesta durante 30 segundos, la configuración se ha cancelado");
  }

  try {
    // send an embed
    embed
      .setAuthor(title)
      .setDescription(`Para crear un ticket reaccionar con ${EMOJIS.TICKET_OPEN}`)
      .setFooter("¡Solo puede tener 1 boleto abierto a la vez!");

    const tktEmbed = await sendMessage(targetChannel, { embeds: [embed] });
    await tktEmbed.react(EMOJIS.TICKET_OPEN);

    // save to Database
    await createNewTicket(guild.id, targetChannel.id, tktEmbed.id, title, role?.id);

    // send success
    ctx.reply("¡Configuración guardada! El mensaje de ticket ya está configurado 🎉");
  } catch (ex) {
    ctx.reply("¡Ocurrió un error inesperado! La instalación ha cancelado");
  }
}

/**
 * @param {CommandContext} ctx
 */
async function setupLogChannel(ctx) {
  if (ctx.message.mentions.channels.size === 0)
    return await ctx.message.reply(
      "¡Uso incorrecto! Debe mencionar un nombre de canal donde se deben enviar los registros de tickets"
    );

  const target = ctx.message.mentions.channels.first();
  if (!canSendEmbeds(target))
    return await ctx.reply("¡Ups! Tengo permiso para enviar embeds a " + target.toString());

  setTicketLogChannel(ctx.guild.id, target.id).then(
    ctx.reply("¡Configuración guardada! Los registros de tickets recién creados se enviarán a " + target.toString())
  );
}

/**
 * @param {CommandContext} ctx
 */
async function setupLimit(ctx) {
  const limit = ctx.args[1];
  if (!limit || isNaN(limit)) return ctx.message.reply(`¡Uso incorrecto! No proporcionaste una entrada de entero válida`);
  if (Number.parseInt(limit) < 5) return ctx.message.reply("El límite de entradas no puede ser inferior a 5");
  setTicketLimit(ctx.guild.id, limit).then(
    ctx.reply(`Configuración guardada. Ahora puede tener un máximo de \`${limit}\` tickets abiertos`)
  );
}

/**
 * @param {CommandContext} ctx
 */
async function close(ctx) {
  if (isTicketChannel(ctx.channel)) {
    const status = await closeTicket(ctx.channel, ctx.author, "Cerrado por un moderador");
    if (!status.success) ctx.message.reply(status.message);
  } else {
    ctx.message.reply("Este comando solo se puede usar en canales de tickets");
  }
}

/**
 * @param {CommandContext} ctx
 */
async function closeAll(ctx) {
  const reply = await ctx.reply("Cerrando...");
  const stats = await closeAllTickets(ctx.guild);
  if (reply?.editable) reply.edit(`¡Terminado! Éxito: \`${stats[0]}\` Fallido: \`${stats[1]}\``);
}

/**
 * @param {CommandContext} ctx
 */
async function addToTicket(ctx) {
  if (!isTicketChannel(ctx.channel)) return await ctx.message.reply("Este comando solo se puede usar en el canal de tickets");

  const inputId = ctx.args[1];
  if (!inputId || isNaN(inputId)) return ctx.reply("¡Ups! Debe ingresar un ID de usuario / ID de rol válido");

  try {
    await ctx.channel.permissionOverwrites.create(inputId, {
      VIEW_CHANNEL: true,
      SEND_MESSAGES: true,
    });

    ctx.message.reply("Done");
  } catch (ex) {
    ctx.reply("No se pudo agregar el usuario / rol. ¿Proporcionó una identificación válida?");
  }
}

/**
 * @param {CommandContext} ctx
 */
async function removeFromTicket(ctx) {
  if (!isTicketChannel(ctx.channel)) return await ctx.message.reply("Este comando solo se puede usar en el canal de tickets");

  const inputId = ctx.args[1];
  if (!inputId || isNaN(inputId)) return ctx.reply("¡Ups! Debe ingresar un ID de usuario / ID de rol válido");

  try {
    ctx.channel.permissionOverwrites.create(inputId, {
      VIEW_CHANNEL: false,
      SEND_MESSAGES: false,
    });

    ctx.message.reply("Done");
  } catch (ex) {
    ctx.reply("No se pudo quitar el usuario / rol. ¿Proporcionó una identificación válida?");
  }
}
