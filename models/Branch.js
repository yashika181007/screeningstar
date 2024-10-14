const Users = require('../models/User'); 
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const Branch = sequelize.define('branch', {
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
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Clients', // Reference the Clients model (ensure it's singular)
            key: 'id',
        },
    },
    branchEmail: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    branchName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isHeadBranch: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
    },
}, {
    timestamps: true,
});

Branch.associate = (models) => {
    Branch.belongsTo(models.Client, {
        foreignKey: 'clientId',
        as: 'client',
    });
};

sequelize.sync()
    .then(() => console.log('Branch table created successfully.'))
    .catch(error => console.error('Error creating Branch table:', error));

module.exports = Branch;
