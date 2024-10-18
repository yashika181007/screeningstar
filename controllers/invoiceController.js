const Invoice = require('../models/Invoice');

exports.createInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.create(req.body);
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error creating invoice', error: error.message });
    }
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll();
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices', error: error.message });
    }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoice', error: error.message });
    }
};

// Update invoice by ID
exports.updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        await invoice.update(req.body);
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error updating invoice', error: error.message });
    }
};

// Delete invoice by ID
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        await invoice.destroy();
        res.status(200).json({ message: 'Invoice deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting invoice', error: error.message });
    }
};
