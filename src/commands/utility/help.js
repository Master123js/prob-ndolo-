const { Command, CommandContext } = require("@src/structures");
const { getCommand, COMMANDS } = require("@features/command-handler");
const { EMOJIS, EMBED_COLORS, BOT_INVITE, SUPPORT_SERVER } = require("@root/config.js");
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");

const CMD_CATEGORIES = {
  ADMIN: {
    name: "Admin",
    image: "https://icons.iconarchive.com/icons/dtafalonso/android-lollipop/512/Settings-icon.png",
    emoji: "\u2699",
  },
  AUTOMOD: {
    name: "Automod",
    image: "https://cdn3.iconfinder.com/data/icons/web-marketing-1-3/48/30-512.png",
    emoji: "\uD83D\uDEE1",
  },
  ECONOMY: {
    name: "Economy",
    image: "https://icons.iconarchive.com/icons/custom-icon-design/pretty-office-11/128/coins-icon.png",
    emoji: "\uD83E\uDE99",
  },
  FUN: {
    name: "Fun",
    image: "https://icons.iconarchive.com/icons/flameia/aqua-smiles/128/make-fun-icon.png",
    emoji: "\uD83D\uDE02",
  },
  IMAGE: {
    name: "Image",
    image: "https://icons.iconarchive.com/icons/dapino/summer-holiday/128/photo-icon.png",
    emoji: "\uD83D\uDDBC",
  },
  INVITE: {
    name: "Invite",
    image: "https://cdn4.iconfinder.com/data/icons/general-business/150/Invite-512.png",
    emoji: "\uD83D\uDCE8",
  },
  INFORMATION: {
    name: "Information",
    image: "https://icons.iconarchive.com/icons/graphicloads/100-flat/128/information-icon.png",
    emoji: "\uD83E\uDEA7",
  },
  MODERATION: {
    name: "Moderation",
    image: "https://icons.iconarchive.com/icons/lawyerwordpress/law/128/Gavel-Law-icon.png",
    emoji: "\uD83D\uDD28",
  },
  SOCIAL: {
    name: "Social",
    image: "https://icons.iconarchive.com/icons/dryicons/aesthetica-2/128/community-users-icon.png",
    emoji: "\uD83E\uDEC2",
  },
  TICKET: {
    name: "Ticket",
    image: "https://icons.iconarchive.com/icons/custom-icon-design/flatastic-2/512/ticket-icon.png",
    emoji: "🎫",
  },
  UTILITY: {
    name: "Utility",
    image: "https://icons.iconarchive.com/icons/blackvariant/button-ui-system-folders-alt/128/Utilities-icon.png",
    emoji: "\uD83D\uDEE0",
  },
};

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description: "Menú de ayuda de comandos",
      category: "UTILITY",
      botPermissions: ["EMBED_LINKS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    let invoke = ctx.args[0];
    if (!invoke) return sendSelectionHelpMenu(ctx);

    // check if category Help
    if (invoke.toUpperCase() === "INFO") invoke = "INFORMATION";
    if (CMD_CATEGORIES.hasOwnProperty(invoke.toUpperCase())) {
      const embed = getCategoryHelpEmbed(ctx, invoke.toUpperCase());
      return ctx.reply({ embeds: [embed] });
    }

    // check if command help
    const cmd = getCommand(invoke);
    if (cmd) return cmd.sendUsage(ctx.message.channel, ctx.prefix, ctx.args[0]);
    ctx.reply("No se encontró ningún comando o módulo coincidente");
  }
};

/**
 * @param {CommandContext} ctx
 * @param {String} category
 */
function getCategoryHelpEmbed(ctx, category) {
  let collector = "";
  if (category === "IMAGE") {
    COMMANDS.filter((cmd) => cmd.category === category).forEach((cmd) =>
      cmd.aliases.forEach((alias) => (collector += "`" + alias + "`, "))
    );

    collector +=
      "\n\n" +
      "Puede usar estos comandos de imagen en los siguientes formatos\n" +
      " **" +
      ctx.prefix +
      "cmd:** Selecciona el avatar de los autores del mensaje como imagen\n" +
      " **" +
      ctx.prefix +
      "cmd <@miembro>:** Elige el avatar de los miembros mencionados como imagen\n" +
      " **" +
      ctx.prefix +
      "cmd <url>:** Selecciona la imagen de la URL proporcionada\n" +
      " **" +
      ctx.prefix +
      "cmd [archivo-adjunto]:** Selecciona la imagen adjunta";
  } else {
    const commands = COMMANDS.filter((cmd) => cmd.category === category);
    if (commands.length == 0) return ctx.reply(`No hay comandos en esta categoría`);
    commands.forEach((cmd) => {
      if (cmd.category !== "ADMIN" && cmd.subcommands.length > 0) {
        cmd.subcommands.forEach(
          (sub) => (collector += `${EMOJIS.ARROW} \`${cmd.name} ${sub.trigger}\`: ${sub.description}\n`)
        );
      } else collector += `${EMOJIS.ARROW} \`${cmd.name}\` - ${cmd.description}\n`;
    });
  }

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(CMD_CATEGORIES[category].image)
    .setAuthor(category + " Comados")
    .setDescription(collector);

  return embed;
}

/**
 * @param {CommandContext} ctx
 */
async function sendSelectionHelpMenu(ctx) {
  const { message } = ctx;

  const options = [];
  for (let key in CMD_CATEGORIES) {
    if (CMD_CATEGORIES.hasOwnProperty(key)) {
      let value = CMD_CATEGORIES[key];
      let data = {
        label: value.name,
        value: value.name,
        description: `Ver comandos de la categoría ${value.name}`,
        emoji: value.emoji,
      };
      options.push(data);
    }
  }

  const row = new MessageActionRow().addComponents(
    new MessageSelectMenu().setCustomId("help-menu").setPlaceholder("Elija la categoría de comando").addOptions(options)
  );

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(
      `**Sobre Mí:**\n` +
        `¡Hola! Yo soy ${message.guild.me.displayName}\n` +
        `Un bot de Discord multipropósito genial que puede satisfacer todas sus necesidades\n\n` +
        `**Invitame:** [Aquí](${BOT_INVITE})\n` +
        `**Servidor De Soporte:** [Unirse](${SUPPORT_SERVER})`
    )
    .setThumbnail(message.client.user.displayAvatarURL());

  const sentMsg = await ctx.reply({
    embeds: [embed],
    components: [row],
  });

  const collector = message.channel.createMessageComponentCollector({
    filter: (interaction) => interaction.user.id === message.author.id,
    max: 10,
    componentType: "SELECT_MENU",
    message: sentMsg,
    idle: 20 * 1000,
    dispose: true,
  });

  collector.on("collect", async (interaction) => {
    await interaction.deferUpdate();
    const value = interaction.values[0];
    let newEmbed = getCategoryHelpEmbed(ctx, value.toUpperCase());
    sentMsg.edit({ embeds: [newEmbed] });
  });

  collector.on("end", () => {
    sentMsg.edit({ components: [] });
  });
}
