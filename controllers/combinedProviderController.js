const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const ProviderDetails = require('../models/ProviderDetails');
const authMiddleware = require('../middleware/auth');

// Middleware to check authentication and authorization
router.use(authMiddleware);

// Endpoint to get provider details including NPI information
router.get('/providers/:npi', async (req, res) => {
  try {
    // Find provider details by NPI
    const provider = await Provider.findOne({ npi: req.params.npi });

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Find provider details including NPI information
    const providerDetails = await ProviderDetails.findOne({ NPI: req.params.npi });

    if (!providerDetails) {
      return res.status(404).json({ message: 'Provider details not found' });
    }

    // Return combined information
    res.json({ provider, providerDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
