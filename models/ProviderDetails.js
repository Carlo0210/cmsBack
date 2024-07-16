const mongoose = require('mongoose');

class Metadata {
    constructor() {
        this.createdBy = '';
        this.modifiedBy = '';
        this.createDate = new Date();
        this.modifiedDate = new Date();
        this.isNew = true;
        this.isDirty = true;
        this.active = false;
        this.archived = false;
        this.deleted = false;
        this.hidden = false;
        this.isModified = false;
    }
}

const AddressSchema = new mongoose.Schema({
    addressID: Number,
    addressNo: String,
    city: String,
    state: String,
    zipcode: String,
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: () => new Metadata()
    }
});

const PhoneSchema = new mongoose.Schema({
    phoneID: Number,
    phoneNumber: String,
    phoneType: String,
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: () => new Metadata()
    }
});

const FaxSchema = new mongoose.Schema({
    faxID: Number,
    faxNumber: String,
    faxType: String,
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: () => new Metadata()
    }
});

const ProviderDetailsSchema = new mongoose.Schema({
    NPI: { type: Number, required: true, unique: true },
    Gender: String,
    NPIType: String,
    SoleProprietor: String,
    Status: String,
    AddressType: [AddressSchema],
    Phones: [PhoneSchema],
    Faxes: [FaxSchema],
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: () => new Metadata()
    }
});

const ProviderDetails = mongoose.model('ProviderDetails', ProviderDetailsSchema);

module.exports = ProviderDetails;
