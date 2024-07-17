const Provider = require('../models/Provider');
const ProviderDetails = require('../models/ProviderDetails');
const ProviderInformation = require('../models/providerInformation');
const fs = require('fs');
const path = require('path');

exports.saveProviders = async (req, res) => {
    try {
        const providers = req.body;
        const chunkSize = 5000;

        for (let i = 0; i < providers.length; i += chunkSize) {
            const chunk = providers.slice(i, i + chunkSize);
            await Provider.insertMany(chunk);
        }

        res.status(201).send('Providers saved successfully');
    } catch (error) {
        console.error('Error saving providers:', error);
        res.status(400).send('Error saving providers');
    }
};

exports.getAllSpecialties = async (req, res) => {
    try {
        const specialties = await Provider.distinct('specialty');
        res.json(specialties);
    } catch (error) {
        res.status(500).send('Error fetching specialties');
    }
};

exports.getAllStatesAndCities = async (req, res) => {
    try {
        const statesAndCities = await ProviderDetails.aggregate([
            { $unwind: "$AddressType" },
            { $group: { _id: { state: "$AddressType.state", city: "$AddressType.city" } } },
            { $sort: { "_id.state": 1, "_id.city": 1 } }
        ]);

        const formattedData = {};
        statesAndCities.forEach(({ _id: { state, city } }) => {
            if (!formattedData[state]) {
                formattedData[state] = [];
            }
            if (!formattedData[state].includes(city)) {
                formattedData[state].push(city);
            }
        });

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching states and cities:', error);
        res.status(500).send('Error fetching states and cities');
    }
};

exports.checkNPIExists = async (req, res) => {
    try {
        const { npi } = req.params;
        const provider = await Provider.findOne({ npi });
        res.json({ exists: !!provider });
    } catch (error) {
        res.status(500).send('Error checking NPI');
    }
};

exports.getAllNpis = async (req, res) => {
    try {
        const npis = await Provider.find({}, 'npi');
        const npiValues = npis.map(provider => provider.npi);

        const npiData = { npis: npiValues };

        const outputPath = path.join(__dirname, 'npis.json');
        fs.writeFileSync(outputPath, JSON.stringify(npiData, null, 2), 'utf-8');

        const chunkSize = Math.ceil(npiValues.length / 12);

        for (let i = 0; i < 17; i++) {
            const chunk = npiValues.slice(i * chunkSize, (i + 1) * chunkSize);
            const chunkData = { npis: chunk };
            const chunkPath = path.join(__dirname, `npis_part_${i + 1}.json`);
            fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), 'utf-8');
        }

        res.json(npiValues);
        console.log("successfully created npi file");
    } catch (error) {
        console.error('Error fetching NPIs:', error);
        res.status(500).send('Error fetching NPIs');
    }
};

exports.getProviderDetailsByNPI = async (req, res) => {
    try {
        const { npi } = req.params;
        if (isNaN(npi)) {
            return res.status(400).json({ error: 'Invalid NPI' });
        }

        const provider = await Provider.findOne({ npi });
        if (!provider) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        const providerDetails = await ProviderDetails.findOne({ NPI: npi });
        if (!providerDetails) {
            return res.status(404).json({ error: 'Provider details not found' });
        }

        const combinedInfo = {
            NPI: providerDetails.NPI,
            providerName: provider.providerName,
            Gender: providerDetails.Gender,
            NPIType: providerDetails.NPIType,
            SoleProprietor: providerDetails.SoleProprietor,
            Status: providerDetails.Status,
            Specialty: provider.specialty,
            Addresses: providerDetails.AddressType.map(address => ({
                addressNo: address.addressNo,
                city: address.city,
                state: address.state,
                zipcode: address.zipcode,
                metadata: address.metadata
            })),
            Phones: providerDetails.Phones.map(phone => ({
                phoneID: phone.phoneID,
                phoneNumber: phone.phoneNumber,
                phoneType: phone.phoneType,
                metadata: phone.metadata
            })),
            Faxes: providerDetails.Faxes.map(fax => ({
                faxID: fax.faxID,
                faxNumber: fax.faxNumber,
                faxType: fax.faxType,
                metadata: fax.metadata
            }))
        };

        res.json(combinedInfo);
    } catch (error) {
        console.error('Error fetching provider details:', error);
        res.status(500).send('Error fetching provider details');
    }
};

const BATCH_SIZE = 1000; // Adjust based on performance testing

exports.combineData = async (req, res) => {
    try {
        let skip = 0;
        let hasMoreData = true;

        while (hasMoreData) {
            // Fetch a batch of providers
            const providers = await Provider.find().skip(skip).limit(BATCH_SIZE).lean().exec();

            if (providers.length === 0) {
                hasMoreData = false;
                break;
            }

            // Gather all NPIs to fetch ProviderDetails in bulk
            const npis = providers.map(provider => provider.npi);
            const providerDetails = await ProviderDetails.find({ NPI: { $in: npis } }).lean().exec();

            const combinedData = [];

            for (let i = 0; i < providers.length; i++) {
                const provider = providers[i];
                const details = providerDetails.find(detail => detail.NPI === provider.npi);

                if (!details) {
                    continue;
                }

                const combinedInfo = {
                    npi: provider.npi,
                    providerName: provider.providerName,
                    specialty: provider.specialty,
                    gender: details.Gender,
                    npiType: details.NPIType,
                    soleProprietor: details.SoleProprietor,
                    status: details.Status,
                    addresses: details.AddressType
                        .filter(address => (
                            (address.addressID === 1 || address.addressID === 2) &&
                            address.addressNo &&
                            address.city &&
                            address.state &&
                            address.zipcode
                        ))
                        .map(address => ({
                            addressID: address.addressID,
                            addressNo: address.addressNo,
                            city: address.city,
                            state: address.state,
                            zip: address.zipcode,
                            metadata: address.metadata
                        })),
                    phones: details.Phones.map(phone => ({
                        phoneID: phone.phoneID,
                        phoneNumber: phone.phoneNumber,
                        phoneType: phone.phoneType,
                        metadata: phone.metadata
                    })),
                    faxes: details.Faxes.map(fax => ({
                        faxID: fax.faxID,
                        faxNumber: fax.faxNumber,
                        faxType: fax.faxType,
                        metadata: fax.metadata
                    }))
                };

                combinedData.push(combinedInfo);
            }

            if (combinedData.length > 0) {
                await ProviderInformation.insertMany(combinedData);
            }

            skip += BATCH_SIZE;
            console.log(`Processed batch starting from ${skip}`);
        }

        res.status(201).send('Combined data saved successfully');
    } catch (error) {
        console.error('Error combining data:', error);
        res.status(500).send('Error combining data');
    }
};

