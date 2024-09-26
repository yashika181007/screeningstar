const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const config = require('./config');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT;
app.use(cors()); 
const app = express();

app.use(bodyParser.json());

app.use('/Screeningstar', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
