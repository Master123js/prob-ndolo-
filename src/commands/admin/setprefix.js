const { Command, CommandContext } = require("@src/structures");
const { setPrefix } = require("@schemas/guild-schema");

module.exports = class SetPrefix extends Command {
  constructor(client) {
    super(client, {
      name: "setprefix",
      description: "Establece un nuevo prefijo para este servidor",
      usage: "<nuevo-prefijo>",
      minArgsCount: 1,
      category: "ADMIN",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args, guild, message } = ctx;
    const newPrefix = args[0];

    if (newPrefix.length > 2) return message.reply("La longitud del prefijo no puede exceder los `2` caracteres");

    await setPrefix(guild.id, newPrefix)
      .then(() => {
        ctx.reply(`El nuevo prefijo se ha establecido en \`${newPrefix}\``);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Error de back-end inesperado");
      });
  }
};
