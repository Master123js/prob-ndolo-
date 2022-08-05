const express = require("express"),
  router = express.Router();

// Obtiene la página de inicio de sesión
router.get("/", async function (req, res) {
  await req.session.destroy();
  res.redirect(req.client.config.DASHBOARD.failureURL);
});

module.exports = router;
