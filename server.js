const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); 

app.use('/Screeningstar', authRoutes);
app.use('/Screeningstar', clientRoutes);
app.use(cookieParser());

app.use(session({
    secret: 'screeningstar@2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 } 
}));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
