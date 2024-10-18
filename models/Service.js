const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');
const Users = require('../models/User');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const Service = sequelize.define('service', {
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
    group: {
          type: DataTypes.STRING,
        allowNull: false
    },
    servicecode: {
          type: DataTypes.STRING,
        allowNull: false
    },
    serviceName: {
          type: DataTypes.STRING,
        allowNull: false
    },
    sub_serviceName: {
          type: DataTypes.STRING,
        allowNull: false
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
    tableName: 'service',
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
