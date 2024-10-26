const Users = require('../models/User');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');
const Client = require('../models/Client');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const GenerateReport = sequelize.define('generatereport', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Users,
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },

    clientId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    branchId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    application_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    formjson: {
        type: DataTypes.JSON,
        allowNull: true,

    },
},
    {
        timestamps: true,
        paranoid: false,
    });

console.log('GenerateReport model:', GenerateReport);

sequelize.sync()
    .then(() => console.log('GenerateReport table created successfully.'))
    .catch(error => {
        console.error('Error creating GenerateReport table:', error);
    });

module.exports = GenerateReport;
