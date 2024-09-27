const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');


const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});
const Client = sequelize.define('Client', {
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
        unique: true,
        allowNull: false,
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
        type: DataTypes.TEXT,
    },
    pricingPackages: {
        type: DataTypes.TEXT,
    },
    loginRequired: {
        type: DataTypes.ENUM('yes', 'no'),
    }
    
});

Client.sync();

module.exports = Client;