const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');
const Users = require('../models/User');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',   
            key: 'id'         
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    serviceName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    serviceDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    }
}, {
    tableName: 'Service',
    timestamps: false
});

Service.belongsTo(Users, {
    foreignKey: 'user_id',
    as: 'User',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Service.sync();

module.exports = Service;
