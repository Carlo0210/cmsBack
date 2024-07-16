const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');

router.post('/providers', providerController.saveProviders);
router.get('/providers/:npi', providerController.getProviderNpi);
router.get('/specialties', providerController.getAllSpecialties);
router.get('/states-cities', providerController.getAllStatesAndCities);
router.get('/providers/check-npi/:npi', providerController.checkNPIExists);
router.get('/providers/npis', providerController.getAllNpis);
router.get('/provider-details/:npi', providerController.getProviderDetailsByNPI);
router.post('/combine-data', providerController.combineData);

module.exports = router;
