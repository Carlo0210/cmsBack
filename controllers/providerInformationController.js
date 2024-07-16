const providerInformation = require('../models/providerInformation');

exports.saveProviders = async (req, res) => {
    try {
        const provider = new providerInformation(req.body);
        await provider.save();
        res.status(201).json(provider);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getProviderNpi = async (req, res) => {
    try {
        const provider = await providerInformation.findOne({ npi: req.params.npi });
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        res.json(provider);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllSpecialties = async (req, res) => {
    try {
        const specialties = await providerInformation.distinct('specialty');
        res.json(specialties);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllStatesAndCities1 = async (req, res) => {
    try {
        const states = await providerInformation.distinct('addresses.state');
        const cities = await providerInformation.find({ 'addresses.state': req.params.state }).distinct('addresses.city');
        res.json({ states, cities });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.checkNPIExists = async (req, res) => {
    try {
        const exists = await providerInformation.exists({ npi: req.params.npi });
        res.json({ exists });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateProviderNpi = async (req, res) => {
    try {
        const provider = await providerInformation.findOneAndUpdate({ npi: req.params.npi }, req.body, { new: true });
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        res.json(provider);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteProvider = async (req, res) => {
    try {
        const provider = await providerInformation.findOneAndDelete({ npi: req.params.npi });
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        res.json({ message: 'Provider deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllStates = async (req, res) => {
    try {
      const states = await providerInformation.distinct('addresses.state');
      res.json(states);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
// Endpoint to get cities for a specific state with trimmed names
exports.getAllCities = async (req, res) => {
    try {
      const state = req.params.state.toUpperCase();
      const cities = await providerInformation.find({ 'addresses.state': state }).distinct('addresses.city');
      const trimmedCities = cities.map(city => city.trim()); // Trim city names
      res.json(trimmedCities);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
// providerInformationController.js

exports.searchProviders = async (req, res) => {
    try {
        const { providerName, specialty, state, city } = req.query;
        
        // Build the query dynamically based on provided parameters
        const query = {};
        if (providerName) {
            query.providerName = providerName;
        }
        if (specialty) {
            query.specialty = specialty;
        }
        if (state) {
            query['addresses.state'] = state;
        }
        if (city) {
            query['addresses.city'] = city;
        }
        
        const providers = await providerInformation.find(query);
        
        res.json(providers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.addProviderNote = async (req, res) => {
    try {
        const { noteText, noteAttempts } = req.body;

        // Find the provider by NPI
        const provider = await providerInformation.findOne({ npi: req.params.npi });
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Create a new note
        const noteID = provider.notes.length ? provider.notes[provider.notes.length - 1].noteID + 1 : 1; // Increment noteID
        const newNote = {
            noteID,
            noteAttempts,
            noteText,
            metadata: {
                createdBy: req.body.metadata.createdBy,
                createDate: new Date(),
                isNew: true,
                isDirty: false,
                active: true
            }
        };

        // Add the note to the provider
        provider.notes.push(newNote);
        await provider.save();

        res.status(201).json(newNote);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getProviderNotes = async (req, res) => {
    try {
        const provider = await providerInformation.findOne({ npi: req.params.npi }, 'notes');
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        res.json(provider.notes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
