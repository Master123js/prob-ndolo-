const { Command, CommandContext } = require("@src/structures");
const { maxLines } = require("@schemas/guild-schema");

module.exports = class MaxLines extends Command {
  constructor(client) {
    super(client, {
      name: "maxlines",
      description: "Establece el máximo de líneas permitidas por mensaje",
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

    if (parseInt(input) < 0) return ctx.reply("¡El número máximo de líneas debe ser un número entero positivo!");

    await maxLines(guild.id, input)
      .then(() => {
        ctx.reply(
          `${
            input == 0
              ? "El límite máximo de líneas está deshabilitado"
              : "Mensajes más largos que `" + input + "`  líneas ahora se eliminarán automáticamente"
          }`
        );
      })
      .catch((err) => {
        console.log(err);
        ctx.reply("Error de back-end inesperado");
      });
  }
};
