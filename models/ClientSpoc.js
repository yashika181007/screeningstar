const Users = require('../models/User');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');
const Client = require('../models/Client')

const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

// Define the ClientSpoc model
const ClientSpoc = sequelize.define('clientspoc', {
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
    spocName: {
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
    emailId1: {
        type: DataTypes.STRING,
       
    },
    emailId2: {
        type: DataTypes.STRING,
       
    },
    emailId3: {
        type: DataTypes.STRING,
       
    },
    emailId4: {
        type: DataTypes.STRING,
       
    },
}, {
    timestamps: true,
});
sequelize.sync()
    .then(() => console.log('Database & tables created!'))
    .catch(error => console.error('Error creating database:', error));
    
    module.exports = ClientSpoc;