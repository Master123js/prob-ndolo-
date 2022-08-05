const { getSettings } = require("@schemas/guild-schema");
const { getConfig } = require("@schemas/ticket-schema");
const { sendMessage } = require("@utils/botUtils");
const {
  getTicketChannels,
  getExistingTicketChannel,
  isTicketChannel,
  closeTicket,
  openTicket,
} = require("@utils/ticketUtils");
const { Client, MessageReaction, User } = require("discord.js");
const { EMOJIS } = require("@root/config.js");

/**
 * @param {Client} client
 */
async function run(client) {
  client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.partial) reaction = await reaction.fetch();
    if (user.partial) user = await user.fetch();
    if (user.bot) return;

    if (reaction.emoji.name === EMOJIS.TICKET_OPEN) return await handleNewTicket(reaction, user);
    if (reaction.emoji.name === EMOJIS.TICKET_CLOSE) return await handleCloseTicket(reaction, user);
  });
}

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
async function handleNewTicket(reaction, user) {
  const { message } = reaction;
  const { guild, channel } = message;

  try {
    const settings = await getSettings(guild);
    const config = await getConfig(guild.id, channel.id, message.id);
    if (!config) return;

    // Compruebe si el usuario ya tiene un ticket abierto
    const alreadyExists = getExistingTicketChannel(guild, user.id);
    if (alreadyExists) return await reaction.users.remove(user.id);

    // verifica si se alcanzó el límite de tickets
    const existing = getTicketChannels(guild).size;
    if (existing > settings.ticket.limit) {
      let sent = await sendMessage(channel, "¡Límite de tickets alcanzado! Vuelva a intentarlo más tarde");
      setTimeout(() => {
        if (sent.deletable) sent.delete().catch((err) => {});
      }, 3000);
      return;
    }

    await openTicket(guild, user, config.title, config.support_role);
  } finally {
    await reaction.users.remove(user.id);
  }
}

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
async function handleCloseTicket(reaction, user) {
  const { message } = reaction;
  if (isTicketChannel(message.channel)) {
    await closeTicket(message.channel, user, "Reaccionó con emoji");
  }
}

module.exports = {
  run,
};
