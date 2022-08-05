module.exports = {
  BOT_TOKEN: "", // Token Del Bot
  MONGO_CONNECTION: "", // URI Para MongoDB
  JOIN_LEAVE_WEBHOOK: "", //Webhook al que se enviarán los detalles de unión/salida del servidor
  OWNER_IDS: [""], // ID's De Los Desarrolladores
  PREFIX: "!", // Prefijo predefinido del bot
  BOT_INVITE: "", // Invitación Del Bot
  SUPPORT_SERVER: "", // Invitación Del Servidor De Soporte
  DASHBOARD: {
    enabled: false, // Habilitar O Deshabilitar El Panel
    baseURL: "http://localhost:8080", // URL Base
    failureURL: "http://localhost:8080", // URL de redirección fallida
    secret: "", // Secreto Del Bot
    port: "8080", // Puerto Para Ejecutar El Bot
    expressSessionPassword: "", // Cadena De Contraseña Aleatoria
  },
  XP_SYSTEM: {
    COOLDOWN: 5, // Enfriamiento En Segundos Entre Mensajes
    DEFAULT_LVL_UP_MSG: "¡{m}, Acabas de avanzar a **Nivel {l}**!",
  },
  API: {
    IMAGE_API: "https://discord-js-image-manipulation.herokuapp.com", // Los Comandos De Imagen No Funcionarán Sin Esto
    WEATHERSTACK_KEY: "", // https://weatherstack.com/
  },
  /* Colores Embed Del Bot */
  EMBED_COLORS: {
    BOT_EMBED: "0x068ADD",
    TRANSPARENT_EMBED: "0x36393F",
    SUCCESS_EMBED: "0x00A56A",
    ERROR_EMBED: "0xD61A3C",
    WARNING_EMBED: "0xF7E919",
  },
  /* Emojis Unicode Usados */
  EMOJIS: {
    ARROW: "❯",
    ARROW_BULLET: "»",
    CIRCLE_BULLET: "•",
    CUBE_BULLET: "❒",
    WHITE_DIAMOND_SUIT: "♢",
    TICK: "✓",
    X_MARK: "✕",
    CURRENCY: "₪",
    TICKET_OPEN: "🎫",
    TICKET_CLOSE: "🔒",
  },
  /* Número Máximo De Claves Que Se Pueden Almacenar */
  CACHE_SIZE: {
    GUILDS: 10,
    USERS: 1000,
    MEMBERS: 10,
  },
  MESSAGES: {
    API_ERROR: "¡Error de servidor inesperado! Vuelva a intentarlo más tarde o póngase en contacto con el servidor de soporte",
  },
};
