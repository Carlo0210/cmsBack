const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const providerInformationSchema = new Schema({
    npi: { type: Number, required: true },
    providerName: { type: String },
    specialty: { type: String },
    gender: { type: String },
    npiType: { type: String },
    soleProprietor: { type: String },
    status: { type: String },
    addresses: [{
        addressID: { type: Number },
        addressNo: { type: String },
        city: { type: String },
        state: { type: String },
        zip: { type: String },
        metadata: {
            createdBy: { type: String },
            createDate: { type: Date },
            isNew: { type: Boolean },
            isDirty: { type: Boolean },
            active: { type: Boolean }
        }
    }],
    phones: [{
        phoneID: { type: Number },
        phoneNumber: { type: String },
        phoneType: { type: String },
        metadata: {
            createdBy: { type: String },
            createDate: { type: Date },
            isNew: { type: Boolean },
            isDirty: { type: Boolean },
            active: { type: Boolean }
        }
    }],
    faxes: [{
        faxID: { type: Number },
        faxNumber: { type: String },
        faxType: { type: String },
        metadata: {
            createdBy: { type: String },
            createDate: { type: Date },
            isNew: { type: Boolean },
            isDirty: { type: Boolean },
            active: { type: Boolean }
        }
    }],
    notes: [
        {
            noteID: { type: Number },
            noteAttempts: { type: String },
            noteText: { type: String },
            metadata: {
                createdBy: { type: String },
                createDate: { type: Date },
                isNew: { type: Boolean },
                isDirty: { type: Boolean },
                active: { type: Boolean }
            }
        }
    ]
});

const providerInformation = mongoose.model('ProviderInformation', providerInformationSchema);

module.exports = providerInformation;
