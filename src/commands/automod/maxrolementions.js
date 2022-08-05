const { Command, CommandContext } = require("@src/structures");
const { maxRoleMentions } = require("@schemas/guild-schema");

module.exports = class MaxRoleMentions extends Command {
  constructor(client) {
    super(client, {
      name: "maxrolementions",
      description: "Establece el máximo de menciones de rol permitidas por mensaje",
      usage: "<Número>",
      minArgsCount: 1,
      category: "AUTOMOD",
      userPermissions: ["ADMINISTRATOR"],
    });
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    const { args, guild } = ctx;
    let input = args[0];

    if (isNaN(input)) {
      if (input === "none" || input === "off") input = 0;
      else return ctx.reply("No es una entrada válida");
    }

    if (parseInt(input) < 2) return ctx.reply("El máximo de menciones debe ser al menos 2");

    await maxRoleMentions(guild.id, input)
      .then(() => {
        ctx.reply(
          `${
            input == 0
              ? "El límite máximo de menciones de roles está deshabilitado"
              : "Mensajes que tienen más de `" + input + "` menciones de roles ahora se eliminarán automáticamente"
          }`
        );
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Error de back-end inesperado");
      });
  }
};
