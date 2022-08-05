const { Command, CommandContext } = require("@src/structures");
const { addMuteToDb, getMuteInfo } = require("@schemas/mute-schema");
const { setupMutedRole, canInteract } = require("@utils/modUtils");
const { getRoleByName } = require("@utils/guildUtils");

module.exports = class MuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "mute",
      description: "Silencia los miembros especificados",
      usage: "<@miembro(s)> [razón]",
      minArgsCount: 1,
      category: "MODERATION",
      botPermissions: ["MANAGE_ROLES"],
      userPermissions: ["KICK_MEMBERS"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { message, guild, channel } = ctx;
    const { author, member, content } = message;
    const mentions = message.mentions.members;

    if (mentions.size == 0) return ctx.reply("Ningún miembro mencionado");

    let mutedRole = getRoleByName(guild, "silenciado");

    if (!mutedRole) {
      if (!guild.me.permissions.has("MANAGE_GUILD")) {
        return ctx.reply("¡No existe ningún rol 'silenciado'! Cree un rol silenciado antes de usar este comando");
      }

      ctx.reply("¡No existe ningún rol 'silenciado'! Intentando crear un rol silenciado...");
      mutedRole = await setupMutedRole(guild);

      if (!mutedRole) {
        return ctx.reply(
          `Algo salió mal durante la configuración. Asegúrese de tener permiso para editar/crear funciones y modificar todos los canales.
          Alternativamente, dame el permiso de \`Administrador\` para configurar`
        );
      }
    }

    if (!mutedRole.editable) {
      return ctx.reply("No tengo permiso para mover miembros al rol `Silenciado`. ¿Está ese rol por debajo de mi rol más alto?");
    }

    const regex = /<@!?(\d+)>/g;
    let match = regex.exec(content);
    let lastMatch;
    while (match != null) {
      lastMatch = match[0];
      match = regex.exec(content);
    }
    const reason = content.split(lastMatch)[1].trim() || "No se proporcionó ninguna razón";

    mentions
      .filter((target) => canInteract(member, target, "mute", channel))
      .forEach(async (target) => {
        const previousMute = await getMuteInfo(guild, target.id);

        if (previousMute) {
          if (previousMute.isPermanent && previousMute.current) {
            return ctx.reply(`${target.user.tag} Ya está silenciado`);
          }
        }

        try {
          await target.roles.add(mutedRole);
        } catch (ex) {
          console.log(ex);
          return ctx.reply(`No se pudo agregar el rol silenciado a ${target.user.tag}`);
        }

        try {
          await addMuteToDb(guild, author, target, reason);
          ctx.reply(`${target.user.tag} Ahora está silenciado en este servidor`);
        } catch (ex) {
          ctx.reply("Error de back-end inesperado");
          return console.log(ex);
        }
      });
  }
};
