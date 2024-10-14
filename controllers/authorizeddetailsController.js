const AuthorizedDetails = require('../models/AuthorizedDetails'); 
const Users = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.createAuthorizedDetails = async (req, res) => {
  try {
    const client_id = req.session.clientId;
    console.log('client_id',req.session.clientId);
    const token = req.headers['authorization'];
    console.log('token', req.headers['authorization']);
    if (!token) {
        return res.status(401).json({ message: 'No token provided. Please log in.' });
    }
    
    const tokenParts = token.split(' ');
    const jwtToken = tokenParts[1];

    let decodedToken;
    try {
        decodedToken = jwt.verify(jwtToken, process.env.jwtSecret);
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    }

    const user_id = decodedToken.id;
    if (!user_id) {
        return res.status(401).json({ message: 'User not authenticated. Please log in.' });
    }
      const { spocName, designation, contactNumber, emailId} = req.body;
      console.log('req.body', req.body);
      const newAuthorizedDetails = await AuthorizedDetails.create({
          user_id,
          client_id ,
          spocName,
          designation,
          contactNumber,
          emailId,
         
      });

      res.status(201).json({ message: 'Authorized Details created successfully', AuthorizedDetails: newAuthorizedDetails });
      console.log('newAuthorizedDetails', newAuthorizedDetails);
  } catch (error) {
      console.error('Error creating AuthorizedDetails:', error);
      res.status(500).json({ message: 'Error creating Authorized Details', error: error.message });
  }
};

exports.getAllAuthorizedDetails = async (req, res) => {
    try {
        const AuthorizedDetailss = await AuthorizedDetails.findAll();
        if (!AuthorizedDetailss) {
            return res.status(404).json({ error: 'Authorized Details not found' });
        }
        res.status(200).json(AuthorizedDetailss);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getallAuthorizedDetailsById = async (req, res) => {
    try {
        const { id } = req.params;

        const AuthorizedDetailsRecord = await AuthorizedDetails.findByPk(id);

        if (!AuthorizedDetailsRecord) {
            return res.status(404).json({ error: 'Authorized Details not found' });
        }
        
        res.status(200).json(AuthorizedDetailsRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateAuthorizedDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { spocName, designation, contactNumber, emailId } = req.body;
        
        const AuthorizedDetailsRecord = await AuthorizedDetails.findByPk(id);
        
        if (!AuthorizedDetailsRecord) {
            return res.status(404).json({ error: 'Authorized Details not found' });
        }
        
        AuthorizedDetailsRecord.spocName = spocName;
        AuthorizedDetailsRecord.designation = designation;
        AuthorizedDetailsRecord.contactNumber = contactNumber;
        AuthorizedDetailsRecord.emailId = emailId;
  
        await AuthorizedDetailsRecord.save();
        
        res.status(200).json(AuthorizedDetailsRecord);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.deleteAuthorizedDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const AuthorizedDetailsRecord = await AuthorizedDetails.findByPk(id);
        
        if (!AuthorizedDetailsRecord) {
            return res.status(404).json({ error: 'Authorized Details not found' });
        } 
        await AuthorizedDetailsRecord.destroy();
        res.status(200).json({ message: 'Authorized Details deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
