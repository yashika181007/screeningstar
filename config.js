const session = require('express-session');
const cookieParser = require('cookie-parser');

module.exports = {
    database: {
        host: 'srv871.hstgr.io',
        user: 'u510451310_Screeningstar', 
        password: 'U510451310_Screeningstar',
        database: 'u510451310_Screeningstar',
    },
    jwtSecret: 'screeningstar@2024',
};

app.use(cookieParser());

app.use(session({
    secret: 'screeningstar@2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 } 
}));