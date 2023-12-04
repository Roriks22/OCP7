const express = require('express');

const app = express();

app.use((req, res) => {
    res.json({ message: "Requête bien reçue !"});
});



module.exports = app;