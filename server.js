const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const config = require('./config');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use('/Screeningstar', authRoutes);
app.use('/Screeningstar', clientRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
