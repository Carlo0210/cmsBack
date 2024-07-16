const express = require('express');
const router = express.Router();
const providerInformationController = require('../controllers/providerInformationController'); // Ensure this path is correct

router.post('/providers', providerInformationController.saveProviders);
router.get('/providers/:npi', providerInformationController.getProviderNpi);
router.get('/specialties', providerInformationController.getAllSpecialties);
router.get('/states', providerInformationController.getAllStates);
router.get('/cities/:state', providerInformationController.getAllCities);
router.get('/providers/exists/:npi', providerInformationController.checkNPIExists);
router.put('/providers/:npi', providerInformationController.updateProviderNpi);
router.delete('/providers/:npi', providerInformationController.deleteProvider);
// New route for searching providers
router.get('/providers', providerInformationController.searchProviders);
router.post('/providers/:npi/notes', providerInformationController.addProviderNote);
router.get('/providers/:npi/notes', providerInformationController.getProviderNotes);

module.exports = router;
