const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json()); 
app.use('/uploads', express.static('uploads'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'screeningstar@2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 } 
}));

app.use('/Screeningstar', authRoutes);
app.use('/Screeningstar', clientRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
Router
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../config/verifyToken');
router.post('/createuser',verifyToken, authController.createuser);
router.post('/login', authController.login);
router.get('/users',verifyToken, authController.getAllUsers);
router.get('/users/active',verifyToken, authController.getActiveUsers);
router.get('/users/inactive',verifyToken, authController.getInactiveUsers);
router.get('/users/:id',verifyToken, authController.getUserById);
router.put('/users/:id',verifyToken, authController.updateUser);
router.delete('/users/:id',verifyToken, authController.deleteUser);
module.exports = router;

error
/opt/render/project/src/node_modules/express/lib/router/route.js:216
        throw new Error(msg);
        ^
Error: Route.post() requires a callback function but got a [object Object]
    at Route.<computed> [as post] (/opt/render/project/src/node_modules/express/lib/router/route.js:216:15)
    at proto.<computed> [as post] (/opt/render/project/src/node_modules/express/lib/router/index.js:521:19)
    at Object.<anonymous> (/opt/render/project/src/routes/authRoutes.js:5:8)
    at Module._compile (node:internal/modules/cjs/loader:1358:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1416:10)
    at Module.load (node:internal/modules/cjs/loader:1208:32)
    at Module._load (node:internal/modules/cjs/loader:1024:12)
    at Module.require (node:internal/modules/cjs/loader:1233:19)
    at require (node:internal/modules/helpers:179:18)
    at Object.<anonymous> (/opt/render/project/src/server.js:7:20)
Node.js v20.15.1
==> Exited with status 1
==> Common ways to troubleshoot your deploy: https://docs.render.com/troubleshooting-deploys
Render Status
Docs