const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

// Establish a connection to the database
const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

// Define the login_credentials model
const User = sequelize.define('login_credentials', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'login_credentials',
    timestamps: false,
});

sequelize.sync();

module.exports = User;
