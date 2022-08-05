const { Command, CommandContext } = require("@src/structures");
const { MessageEmbed } = require("discord.js");
const { BOT_INVITE, SUPPORT_SERVER, EMBED_COLORS } = require("@root/config.js");

module.exports = class BotInviteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "botinvite",
      description: "Obtiene las invitaciones del bot",
      category: "INFORMATION",
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message } = ctx;
    let desc = "";
    desc += `Servidor De Soporte: [Únete Aqui](${SUPPORT_SERVER})` + "\n";
    desc += `Enlace De Invitación: [Agrégame Aqui](${BOT_INVITE})`;

    const embed = new MessageEmbed()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor("¡Guau! Hice que lanzara las ~olas~")
      .setDescription(desc);

    try {
      await message.author.send({ embeds: [embed] });
      message.reply("Revisa tu DM para mi invitación :envelope_with_arrow:");
    } catch (ex) {
      console.log(ex);
      message.reply("¡No puedo enviarte una invitación! ¿Está abierto tu DM?");
    }
  }
};
