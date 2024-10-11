const EscalationManager = require('../models/EscalationManager'); 
const Users = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.createescalationmanager = async (req, res) => {
  try {
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
      const { escalationName, designation, contactNumber, emailId} = req.body;
      console.log('req.body', req.body);
      const newEscalationManager = await EscalationManager.create({
          user_id,
          escalationName,
          designation,
          contactNumber,
          emailId,
         
      });

      res.status(201).json({ message: 'Escalation Manager created successfully', EscalationManager: newEscalationManager });
      console.log('newEscalationManager', newEscalationManager);
  } catch (error) {
      console.error('Error creating EscalationManager:', error);
      res.status(500).json({ message: 'Error creating Escalation Manager', error: error.message });
  }
};

exports.getAllescalationmanager = async (req, res) => {
    try {
        const EscalationManagers = await EscalationManager.findAll();
   
        res.status(200).json(EscalationManagers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getallescalationmanagerById = async (req, res) => {
    try {
        const { id } = req.params;
        const EscalationManager = await EscalationManager.findByPk(req.params.id);

        if (!EscalationManager) {
            return res.status(404).json({ error: 'Escalation Manager not found' });
        }
        
        res.status(200).json(EscalationManager);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateescalationmanager = async (req, res) => {
    try {
        const { id } = req.params;
        const { escalationName, designation, contactNumber, emailId} = req.body;
        
        const EscalationManager = await EscalationManager.findByPk(id);
        
        if (!EscalationManager) {
            return res.status(404).json({ error: 'Escalation Manager not found' });
        }
        
        EscalationManager.escalationName = escalationName;
        EscalationManager.designation = designation;
        EscalationManager.contactNumber = contactNumber;
        EscalationManager.emailId = emailId;
  
        await EscalationManager.save();
        
        res.status(200).json(EscalationManager);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteescalationmanager = async (req, res) => {
    try {
        const { id } = req.params;
        
        const EscalationManager = await EscalationManager.findByPk(id);
        
        if (!EscalationManager) {
            return res.status(404).json({ error: 'Escalation Manager not found' });
        }
        
        await EscalationManager.destroy();
        res.status(200).json({ message: 'Escalation Manager  deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
