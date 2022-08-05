const { Client, Guild, MessageEmbed, WebhookClient } = require("discord.js");
const { EMBED_COLORS, JOIN_LEAVE_WEBHOOK } = require("@root/config.js");
const { registerGuild, updateGuildLeft } = require("@schemas/guild-schema");

const webhookClient = JOIN_LEAVE_WEBHOOK ? new WebhookClient({ url: JOIN_LEAVE_WEBHOOK }) : undefined;

/**
 * @param {Client} client
 */
async function run(client) {
  client.on("guildCreate", async (guild) => {
    if (!guild.members.cache.has(guild.ownerId)) await guild.fetchOwner({ cache: true });
    console.log(`Me Agregaron Al Servidor: ${guild.name} Miembros: ${guild.memberCount}`);
    registerGuild(guild).then(() => sendWebhook(guild, true));
  });

  client.on("guildDelete", async (guild) => {
    if (!guild.members.cache.has(guild.ownerId)) await guild.fetchOwner({ cache: true });
    console.log(`He Abandonado El Servidor: ${guild.name} Miembros: ${guild.memberCount}`);
    updateGuildLeft(guild).then(() => sendWebhook(guild, false));
  });
}

/**
 * @param {Guild} guild
 */
function sendWebhook(guild, isJoin) {
  if (!webhookClient) return;
  const { client } = guild;

  const embed = new MessageEmbed()
    .setTitle(isJoin ? "Me Uní Al Servidor" : "Abandone El Servidor")
    .setThumbnail(guild.iconURL())
    .setColor(isJoin ? EMBED_COLORS.SUCCESS_EMBED : EMBED_COLORS.ERROR_EMBED)
    .addField("Nombre", guild.name, false)
    .addField("ID", guild.id, false)
    .addField("Dueño", `${client.users.cache.get(guild.ownerId)} [\`${guild.ownerId}\`]`, false)
    .addField("Miembros", "```yaml\n" + guild.memberCount + "```", false)
    .setFooter("Servidor #" + client.guilds.cache.size);

  webhookClient.send({
    username: isJoin ? "Agregado" : "Abandonado",
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  });
}

module.exports = {
  run,
};
