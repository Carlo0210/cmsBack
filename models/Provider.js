const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
    npi: { type: Number, required: true, unique: true },
    providerName: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    specialty: { type: String },
    entityType: { type: String },
    CMSDetails: { type: String }
});

const Provider = mongoose.model('Provider', providerSchema);

module.exports = Provider;
