// models/ProviderService.js
const mongoose = require('mongoose');

const ProviderServiceSchema = new mongoose.Schema({
    NPI: String,
    HCPCS: String,
    Description: String,
    Drug: String,
    PlaceOfService: String,
    NumberOfServices: Number,
    NumberOfBeneficiaries: Number,
    AverageSubmittedCharge: Number,
    AverageMedicareAllowedAmount: Number,
    AverageMedicarePayment: Number
});

module.exports = mongoose.model('ProviderService', ProviderServiceSchema);
