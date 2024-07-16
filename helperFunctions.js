const extractAddress = (addressString, addressID) => {
    const addressParts = addressString.split(',');
    const city = addressParts[0]?.split('\n').pop().trim() || '';
    const zipcode = addressParts[1]?.trim().split(' ')[1]?.split('-')[0] || '';
    return {
      addressID,
      city,
      state: addressParts[1]?.trim().split(' ')[0] || '',
      zipcode: zipcode.replace('United', '').trim(),
      metadata: {
        createdBy: 'Automated Scraper',
        createDate: new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric' }),
        isNew: true,
        isDirty: true,
        active: true,
      },
    };
  };
  
  const extractPhone = (phoneString, phoneID, phoneType) => {
    const phoneMatch = phoneString.match(/Phone:\s*([\d-]+)/);
    return {
      phoneID,
      phoneNumber: phoneMatch ? phoneMatch[1] : '',
      phoneType,
      metadata: {
        createdBy: 'Automated Scraper',
        createDate: new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric' }),
        isNew: true,
        isDirty: true,
        active: true,
      },
    };
  };
  
  const extractFax = (faxString, faxID, faxType) => {
    const faxMatch = faxString.match(/Fax:\s*([\d-]+)/);
    return {
      faxID,
      faxNumber: faxMatch ? faxMatch[1] : '',
      faxType,
      metadata: {
        createdBy: 'Automated Scraper',
        createDate: new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric' }),
        isNew: true,
        isDirty: true,
        active: true,
      },
    };
  };

  module.exports = { extractAddress, extractFax, extractPhone};