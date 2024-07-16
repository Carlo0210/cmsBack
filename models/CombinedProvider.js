const mongoose = require('mongoose');

const CombinedProviderSchema = new mongoose.Schema({
    npi: { type: Number, required: true, unique: true},
    providerName: { type: String },
    gender: { type: String },
    addressType: { type: String },
    phones: [{ phoneNumber: String, phoneType: String }],
    specialty: { type: String },
    entityType: { type: String },
    createDate: { type: Date },
    modifiedDate: { type: Date }
});

const CombinedProvider = mongoose.model('CombinedProvider', CombinedProviderSchema);

module.exports = CombinedProvider;
