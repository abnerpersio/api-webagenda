const express = require('express');
const routes = express.Router();

routes.get("/consultar", (req, res) => {
    res.json({code: "consultando"})
})

module.exports = routes;