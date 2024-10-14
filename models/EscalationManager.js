const Users = require('../models/User');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');
const Client = require('../models/Client')

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const EscalationManager = sequelize.define('escalationmanager', {
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
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    client_id : {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        references: {
            model: Client,  
        },
    },
    escalationName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isNumeric: true,
            len: [10, 10],
        }
    },
    emailId: {
        type: DataTypes.STRING,
        allowNull: false,
       
    },
}, {
    timestamps: true,
});
sequelize.sync()
    .then(() => console.log('Database & tables created!'))
    .catch(error => console.error('Error creating database:', error));
    
    module.exports = EscalationManager;