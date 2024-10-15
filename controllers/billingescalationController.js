const BillingEscalation = require('../models/BillingEscalation'); 
const Users = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

exports.createBillingEscalation = async (req, res) => {
  try {
    // const client_id = req.session.clientId;
    const token = req.headers['authorization'];
    // console.log('token', req.headers['authorization']);
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
    //   console.log('req.body', req.body);
      const newBillingEscalation = await BillingEscalation.create({
          user_id,
        //   client_id ,
          spocName,
          designation,
          contactNumber,
          emailId,
         
      });

      res.status(201).json({ message: 'Billing Escalation created successfully', BillingEscalation: newBillingEscalation });
    //   console.log('newBillingEscalation', newBillingEscalation);
  } catch (error) {
      console.error('Error creating BillingEscalation:', error);
      res.status(500).json({ message: 'Error creating Billing Escalation', error: error.message });
  }
};

exports.getAllBillingEscalation = async (req, res) => {
    try {
        const BillingEscalations = await BillingEscalation.findAll();
        if (!BillingEscalations) {
            return res.status(404).json({ error: 'Billing Escalation not found' });
        }
        res.status(200).json(BillingEscalations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getallBillingEscalationById = async (req, res) => {
    try {
        const { id } = req.params;

        const BillingEscalationRecord = await BillingEscalation.findByPk(id);

        if (!BillingEscalationRecord) {
            return res.status(404).json({ error: 'Billing Escalation not found' });
        }
        
        res.status(200).json(BillingEscalationRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateBillingEscalation = async (req, res) => {
    try {
        const { id } = req.params;
        const { spocName, designation, contactNumber, emailId } = req.body;
        
        const BillingEscalationRecord = await BillingEscalation.findByPk(id);
        
        if (!BillingEscalationRecord) {
            return res.status(404).json({ error: 'Billing Escalation not found' });
        }
        
        BillingEscalationRecord.spocName = spocName;
        BillingEscalationRecord.designation = designation;
        BillingEscalationRecord.contactNumber = contactNumber;
        BillingEscalationRecord.emailId = emailId;
  
        await BillingEscalationRecord.save();
        
        res.status(200).json(BillingEscalationRecord);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.deleteBillingEscalation = async (req, res) => {
    try {
        const { id } = req.params;
        const BillingEscalationRecord = await BillingEscalation.findByPk(id);
        
        if (!BillingEscalationRecord) {
            return res.status(404).json({ error: 'Billing Escalation not found' });
        } 
        await BillingEscalationRecord.destroy();
        res.status(200).json({ message: 'Billing Escalation deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
