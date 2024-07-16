// routes/providerDetailsRoutes.js

const express = require('express');
const router = express.Router();
const providerDetailsController = require('../controllers/providerDetailsController');

router.get('/providerDetails', providerDetailsController.getAllProviderDetails);
router.get('/providerDetails/:id', providerDetailsController.getProviderDetailsById);
router.post('/providerDetails', providerDetailsController.createProviderDetails);
router.put('/providerDetails/:id', providerDetailsController.updateProviderDetails);
router.delete('/providerDetails/:id', providerDetailsController.deleteProviderDetails);

module.exports = router;
