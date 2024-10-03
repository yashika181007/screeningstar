const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');
const Users = require('../models/User');
const Package = require('../models/Package');
const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const package = sequelize.define('package', {
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
    packageName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    packageDescription: {
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
    tableName: 'package',
    timestamps: false
});

package.belongsTo(Users, {
    foreignKey: 'user_id',
    as: 'User',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

package.sync();

module.exports = package;
