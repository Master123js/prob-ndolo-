const { MessageEmbed } = require("discord.js");
const { Command, CommandContext } = require("@src/structures");
const db = require("@schemas/counter-schema");
const { EMOJIS, EMBED_COLORS } = require("@root/config.js");
const { getMemberStats } = require("@utils/guildUtils");

module.exports = class CounterSetup extends Command {
  constructor(client) {
    super(client, {
      name: "counter",
      description: "Configura el canal de contador en el servidor. Tipos de contadores: `todos/miembros/bots`",
      usage: "<tipo> <nombre-del-canal>",
      minArgsCount: 1,
      category: "ADMIN",
      botPermissions: ["MANAGE_CHANNELS"],
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args, guild } = ctx;
    const type = args[0].toLowerCase();

    if (type === "status") return await sendStatus(ctx);

    if (!type || !["todos", "miembros", "bots"].includes(type))
      return ctx.reply("¡Se pasan argumentos incorrectos! Tipos de contadores: `todos/miembros/bots`");

    if (args.length < 2) return ctx.reply("¡Uso incorrecto!");

    args.shift();
    let channelName = args.join(" ");

    const stats = await getMemberStats(guild);
    if (type === "todos") channelName += " : " + stats[0];
    else if (type === "miembros") channelName += " : " + stats[2];
    else if (type === "bots") channelName += " : " + stats[1];

    try {
      const vc = await guild.channels.create(channelName, {
        type: "GUILD_VOICE",
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: ["CONNECT"],
          },
          {
            id: guild.me.roles.highest.id,
            allow: ["VIEW_CHANNEL", "MANAGE_CHANNELS", "MANAGE_ROLES"],
          },
        ],
      });

      if (type === "todos") await db.setTotalCountChannel(guild.id, vc.id, args.join(" "));
      if (type === "miembros") await db.setMemberCountChannel(guild.id, vc.id, args.join(" "));
      if (type === "bots") await db.setBotCountChannel(guild.id, vc.id, args.join(" "));

      await db.updateBotCount(guild.id, stats[1], false);

      ctx.reply("¡Configuración guardada! Canal contador creado");
    } catch (ex) {
      console.log(ex);
      ctx.reply("¡Configuración cancelada! No se pudo crear el canal de voz. Vuelva a intentarlo más tarde");
    }
  }
};

/**
 * @param {CommandContext} ctx
 */
async function sendStatus(ctx) {
  const { guild } = ctx;
  const config = await db.getSettings(guild.id);

  if (!config) return ctx.reply("No se ha configurado ningún canal de contador en este gremio");

  let v1, v2, v3;
  if (config.tc_channel) v1 = guild.channels.cache.get(config.tc_channel);
  if (config.mc_channel) v2 = guild.channels.cache.get(config.mc_channel);
  if (config.bc_channel) v3 = guild.channels.cache.get(config.bc_channel);

  const desc = `
  TotalCount Channel: ${v1 ? EMOJIS.TICK : EMOJIS.X_MARK}
  MemberCount Channel: ${v2 ? EMOJIS.TICK : EMOJIS.X_MARK}
  BotCount Channel: ${v3 ? EMOJIS.TICK : EMOJIS.X_MARK}
  `;

  const embed = new MessageEmbed()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor("Configuración del contador")
    .setDescription(desc);

  ctx.reply({ embeds: [embed] });
}
