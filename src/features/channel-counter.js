const { Client, Guild } = require("discord.js");
const db = require("@schemas/counter-schema");
const { setVoiceChannelName, getMemberStats } = require("@utils/guildUtils");

// caché que contiene guildId que debe actualizarse
const TO_UPDATE_GUILDS = [];

/**
 * @param {Client} client
 */
async function run(client) {
  // actualizar todos los contadores de gremios configurados previamente
  const counterGuilds = await updateCountersOnStartup(client);
  console.log("SERVIDORES con canales de contador: " + counterGuilds);

  // ejecute el programador cada 10 minutos para evitar rate-limits
  runScheduler(client, 10);

  client.on("guildMemberAdd", async (member) => {
    if (!member || !member.guild) return;
    const { guild, user } = member;

    const config = await db.getSettings(guild.id);
    if (!config) return;

    // actualizar el recuento de bots en la base de datos
    if (user.bot) await db.updateBotCount(guild.id, 1, true);
    handleMemberCounter(guild);
  });

  client.on("guildMemberRemove", async (member) => {
    if (member.partial) member = await member.fetch().catch((err) => {});
    const { guild, user } = member;

    if (!guild || !user) return;

    const config = await db.getSettings(guild.id);
    if (!config) return;

    // actualizar el recuento de bots en la base de datos
    if (user.bot) await db.updateBotCount(guild.id, -1, true);

    handleMemberCounter(guild);
  });
}

/**
 * Al inicio, actualice el recuento de bots en la base de datos para los servidores habilitados para el contador y prográmelos para la actualización
 * @param {Client} client
 */
async function updateCountersOnStartup(client) {
  const data = await db.getCounterGuilds();
  let count = 0;

  for (var i = 0; i < data.length; i++) {
    const guildId = data[i]._id;
    if (!client.guilds.cache.has(guildId)) continue;

    const guild = client.guilds.cache.get(guildId);
    const stats = await getMemberStats(guild);

    await db.updateBotCount(guild.id, stats[1], false);
    handleMemberCounter(guild);
    count++;
  }
  return count;
}

/**
 * @param {Guild} guild
 */
function handleMemberCounter(guild) {
  // return si el gremio ya está programado para una actualización de canal de contador
  if (TO_UPDATE_GUILDS.includes(guild.id)) return;

  // agregar guildId al caché
  TO_UPDATE_GUILDS.push(guild.id);
}

/**
 * @param {Client} client
 */
function runScheduler(client, minutes) {
  setInterval(async () => {
    for (const guildId of TO_UPDATE_GUILDS) {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) continue;

      try {
        const config = await db.getSettings(guild.id);
        if (!config) continue;

        const all = guild.memberCount;
        const bots = config.bot_count;
        const members = all - bots;

        if (config.tc_channel) {
          let vc = guild.channels.cache.get(config.tc_channel);
          if (vc) {
            let tc = config.tc_name + " : " + all;
            setVoiceChannelName(vc, tc);
          }
        }
        if (config.mc_channel) {
          let vc = guild.channels.cache.get(config.mc_channel);
          if (vc) {
            let mc = config.mc_name + " : " + members;
            setVoiceChannelName(vc, mc);
          }
        }
        if (config.bc_channel) {
          let vc = guild.channels.cache.get(config.bc_channel);
          if (vc) {
            let bc = config.bc_name + " : " + bots;
            setVoiceChannelName(vc, bc);
          }
        }
      } catch (ex) {
        console.log("Error al actualizar los canales de contador para guildId: " + guildId);
        console.log(ex);
      } finally {
        // remove guildId from cache
        const i = TO_UPDATE_GUILDS.indexOf(guild.id);
        if (i > -1) TO_UPDATE_GUILDS.splice(i, 1);
      }
    }
  }, minutes * 60 * 1000);
}

module.exports = {
  run,
};
