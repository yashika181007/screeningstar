const Users = require('../models/User');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const Invoice = sequelize.define('invoice', {
    month: {
        type: DataTypes.STRING,
        allowNull: false
    },
    organizationName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gstNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    stateCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    invoiceDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    taxableValue: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    cgst: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    sgst: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    igst: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    totalGst: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    invoiceSubtotal: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false
    },
    receivedDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    tdsPercentage: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    tdsDeducted: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    amountReceived: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    balancePayment: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    paymentRemarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true // Enables `createdAt` and `updatedAt` columns
});

module.exports = Invoice;
