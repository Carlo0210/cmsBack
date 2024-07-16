const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const ProviderDetails = require('../models/ProviderDetails');

router.get('/providers', async (req, res) => {
  try {
    const providers = await Provider.aggregate([
      {
        $lookup: {
          from: 'providerdetails',
          localField: 'npi',
          foreignField: 'NPI',
          as: 'details'
        }
      },
      {
        $project: {
          npi: 0, // Exclude NPI from the result
          'details.NPI': 0 // Exclude NPI from the details
        }
      }
    ]);
    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
