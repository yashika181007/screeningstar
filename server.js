const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const config = require('./config');
require('dotenv').config();

const PORT = process.env.PORT;

const app = express();

app.use(bodyParser.json());

app.use('/Screeningstar', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
