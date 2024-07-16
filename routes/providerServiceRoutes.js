// routes/providerServiceRoutes.js

const express = require('express');
const router = express.Router();
const providerServiceController = require('../controllers/providerServiceController');

router.post('/scrape-and-save', async (req, res) => {
    try {
        await providerServiceController.scrapeAndSaveProviderServices(req.body);
        res.status(200).send('Provider services data saved successfully');
    } catch (error) {
        console.error('Error scraping and saving provider services data:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
