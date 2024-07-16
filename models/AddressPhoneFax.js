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

    setCreatedBy(createdBy) {
        this.createdBy = createdBy;
    }

    getCreatedBy() {
        return this.createdBy;
    }

    setModifiedBy(modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    getModifiedBy() {
        return this.modifiedBy;
    }

    setCreateDate(createDate) {
        this.createDate = createDate;
    }

    getCreateDate() {
        return this.createDate;
    }

    setModifiedDate(modifiedDate) {
        this.modifiedDate = modifiedDate;
    }

    getModifiedDate() {
        return this.modifiedDate;
    }

    setIsNew(isNew) {
        this.isNew = isNew;
    }

    getIsNew() {
        return this.isNew;
    }

    setIsDirty(isDirty) {
        this.isDirty = isDirty;
    }

    getIsDirty() {
        return this.isDirty;
    }

    setActive(active) {
        this.active = active;
    }

    getActive() {
        return this.active;
    }

    setArchived(archived) {
        this.archived = archived;
    }

    getArchived() {
        return this.archived;
    }

    setDeleted(deleted) {
        this.deleted = deleted;
    }

    getDeleted() {
        return this.deleted;
    }

    setHidden(hidden) {
        this.hidden = hidden;
    }

    getHidden() {
        return this.hidden;
    }

    setIsModified(isModified) {
        this.isModified = isModified;
    }

    getIsModified() {
        return this.isModified;
    }
}

class AddressType {
    constructor(addressID, addressNo, city, state, zipcode, metadata) {
        this.addressID = addressID;
        this.addressNo = addressNo; 
        this.city = city;
        this.state = state;
        this.zipcode = zipcode;
        this.metadata = metadata;
    }
}

class PhoneType {
    constructor(phoneID, phoneNumber, phoneType, metadata) {
        this.phoneID = phoneID;
        this.phoneNumber = phoneNumber;
        this.phoneType = phoneType;
        this.metadata = metadata;
    }
}

class FaxType {
    constructor(faxID, faxNumber, faxType, metadata) {
        this.faxID = faxID;
        this.faxNumber = faxNumber;
        this.faxType = faxType;
        this.metadata = metadata;
    }
}

const AddressSchema = new mongoose.Schema({
    addressID: Number,
    addressNo: String,
    city: String,
    state: String,
    zipcode: String,
    metadata: {
        type: Metadata,
        default: new Metadata()
    }
});

const PhoneSchema = new mongoose.Schema({
    phoneID: Number,
    phoneNumber: String,
    phoneType: String,
    metadata: {
        type: Metadata,
        default: new Metadata()
    }
});

const FaxSchema = new mongoose.Schema({
    faxID: Number,
    faxNumber: String,
    faxType: String,
    metadata: {
        type: Metadata,
        default: new Metadata()
    }
});

const ProviderDetailsSchema = new mongoose.Schema({
    NPI: { type: Number, required: true, unique: true },
    Gender: String,
    NPIType: String,
    SoleProprietor: String,
    Status: String,
    Add: [AddressSchema],
    Phones: [PhoneSchema],
    Faxes: [FaxSchema],
    metadata: {
        type: Metadata,
        default: new Metadata()
    }
});

const ProviderDetails = mongoose.model('ProviderDetails', ProviderDetailsSchema);

module.exports = ProviderDetails;
