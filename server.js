require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const routes = require("./src/routes");
const port = process.env.PORT || 3000;

var uri = "mongodb://localhost:27017/barber"
mongoose.connect(
    uri, {useNewUrlParser: true}
);

app.use(routes);
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});