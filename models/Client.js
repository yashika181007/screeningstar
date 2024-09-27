// models/Client.js
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

// Establish a connection to the database
const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

// Define the clients model
const Client = sequelize.define('clients', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    organizationName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    clientId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    registeredAddress: {
        type: DataTypes.STRING,
    },
    state: {
        type: DataTypes.STRING,
    },
    stateCode: {
        type: DataTypes.STRING,
    },
    gstNumber: {
        type: DataTypes.STRING,
    },
    tat: {
        type: DataTypes.STRING,
    },
    serviceAgreementDate: {
        type: DataTypes.DATE,
    },
    clientProcedure: {
        type: DataTypes.TEXT,
    },
    agreementPeriod: {
        type: DataTypes.STRING,
    },
    customTemplate: {
        type: DataTypes.TEXT,
    },
    clientLogo: {
        type: DataTypes.STRING,
    },
    accountManagement: {
        type: DataTypes.STRING,
    },
    packageOptions: {
        type: DataTypes.TEXT,
    },
    scopeOfServices: {
        type: DataTypes.STRING,
    },
    pricingPackages: {
        type: DataTypes.STRING,
    },
    loginRequired: {
        type: DataTypes.ENUM('yes', 'no'),
    }
}, {
    tableName: 'clients',
    timestamps: false,
});

sequelize.sync();
module.exports = Client;
