require('dotenv').config();
const express = require('express');
const sendEmailRoute = require('./sendEmail');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(sendEmailRoute)

// app.get('/', (req, res) => res.send('Hello World!'));


app.listen(PORT, "0.0.0.0", () => console.log(`Example app listening on port ${PORT}!`));