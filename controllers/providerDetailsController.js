const ProviderDetails = require('../models/ProviderDetails');

class ProviderDetailsController {
    async getAllProviderDetails(req, res) {
        try {
            const providerDetails = await ProviderDetails.find();
            res.json(providerDetails);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getProviderDetailsById(req, res) {
        try {
            const providerDetails = await ProviderDetails.findById(req.params.id);
            if (providerDetails == null) {
                return res.status(404).json({ message: 'ProviderDetails not found' });
            }
            res.json(providerDetails);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createProviderDetails(req, res) {
        const providerDetails = new ProviderDetails(req.body);
        try {
            const newProviderDetails = await providerDetails.save();
            res.status(201).json(newProviderDetails);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateProviderDetails(req, res) {
        try {
            const updatedProviderDetails = await ProviderDetails.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            if (updatedProviderDetails == null) {
                return res.status(404).json({ message: 'ProviderDetails not found' });
            }
            res.json(updatedProviderDetails);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteProviderDetails(req, res) {
        try {
            const deletedProviderDetails = await ProviderDetails.findByIdAndDelete(req.params.id);
            if (deletedProviderDetails == null) {
                return res.status(404).json({ message: 'ProviderDetails not found' });
            }
            res.json({ message: 'ProviderDetails deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteDuplicateNPIs(req, res) {
        try {
            const duplicates = await ProviderDetails.aggregate([
                {
                    $group: {
                        _id: '$NPI',
                        count: { $sum: 1 },
                        docs: { $push: '$$ROOT' }
                    }
                },
                {
                    $match: {
                        count: { $gt: 1 }
                    }
                }
            ]);

            for (const duplicate of duplicates) {
                const { docs } = duplicate;
                docs.sort((a, b) => new Date(a.metadata.createDate) - new Date(b.metadata.createDate));

                for (let i = 1; i < docs.length; i++) {
                    await ProviderDetails.findByIdAndDelete(docs[i]._id);
                }
            }

            res.json({ message: 'Duplicate NPIs deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new ProviderDetailsController();
