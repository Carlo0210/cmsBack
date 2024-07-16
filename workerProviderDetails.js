//workerProviderDetails.js
const fs = require('fs');
const path = require('path');
const { Worker, parentPort, workerData } = require('worker_threads');
const { chromium } = require('playwright');

const extractAddress = (addressString, addressID) => {
  const parts = addressString.split('\n');
  const addressNo = parts[0]?.trim() || ''; // First part contains the address
  const cityLine = parts[1]?.trim() || ''; // Second part usually contains city, state, and zipcode

  // Extracting city, state, and zipcode
  const cityParts = cityLine.split(',');
  const city = cityParts[0]?.trim() || '';
  const stateZipcode = cityParts[1]?.trim() || '';
  const state = stateZipcode.split(' ')[0] || '';
  const zipcode = stateZipcode.split(' ')[1]?.split('-')[0] || '';

  return {
    addressID,
    addressNo,
    city,
    state,
    zipcode,
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

const scrapeNPI = async (npi) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setDefaultTimeout(30000);
  await page.setViewportSize({ width: 800, height: 600 });

  try {
    const url = `https://npiregistry.cms.hhs.gov/provider-view/${npi}`;
    await page.goto(url);

    await page.waitForSelector('.table-striped tbody tr:nth-child(1) td:nth-child(2)');
    await page.waitForTimeout(30000); 

    const data = await page.evaluate(() => {
      const extractText = (element) => element ? element.innerText.trim() : '';

      const NPIElement = document.querySelector('.table-striped tbody tr:nth-child(1) td:nth-child(2)');
      const NPI = extractText(NPIElement);

      if (!NPI) {
        throw new Error('NPI not found');
      }

      const genderElement = document.querySelector('.jumbotron blockquote p:nth-child(3)');
      const gender = genderElement ? extractText(genderElement).split(':')[1].trim() : 'N/A';

      const npiTypeElement = document.querySelector('.table-striped tbody tr:nth-child(3) td:nth-child(2)');
      const npiType = extractText(npiTypeElement);

      const enumerationDateElement = document.querySelector('.table-striped tbody tr:nth-child(2) td:nth-child(2)');
      const enumerationDate = extractText(enumerationDateElement);

      const mailingAddressElement = document.querySelector('.table-striped tbody tr:nth-child(6) td:nth-child(2)');
      const mailingAddress = extractText(mailingAddressElement);

      const primaryAddressElement = document.querySelector('.table-striped tbody tr:nth-child(7) td:nth-child(2)');
      const primaryAddress = extractText(primaryAddressElement);

      return {
        NPI,
        Gender: gender,
        NPIType: npiType,
        EnumerationDate: enumerationDate,
        MailingAddress: mailingAddress,
        PrimaryAddress: primaryAddress
      };
    });

    const providerData = {
      NPI: parseInt(data.NPI, 10),
      Gender: data.Gender,
      NPIType: data.NPIType,
      SoleProprietor: data.Gender !== 'N/A' ? 'Yes' : 'No',
      Status: data.Gender !== 'N/A' && data.SoleProprietor !== 'N/A' ? 'Active' : 'Active',
      AddressType: [
        extractAddress(data.MailingAddress, 1),
        extractAddress(data.PrimaryAddress, 2)
      ],
      Phones: [
        extractPhone(data.MailingAddress, 1, 'Mailing'),
        extractPhone(data.PrimaryAddress, 2, 'Primary')
      ],
      Faxes: [
        extractFax(data.MailingAddress, 1, 'Mailing'),
        extractFax(data.PrimaryAddress, 2, 'Primary')
      ]
    };

    const createDate = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric' });
    providerData.metadata = {
        createdBy: 'Automated Scraper',
        createDate,
        isNew: true,
        isDirty: true,
        active: true
    };

    // Write scraped data to a JSON file (append mode)
    fs.appendFile('scrapedDataProviderDetails.json', JSON.stringify(providerData, null, 2) + ',\n', (err) => {
      if (err) {
        console.error('Error writing to JSON file:', err);
        return;
      }
      console.log(`Data for NPI ${npi} saved to scrapedDataProviderDetails.json`);
    });
    console.log(`Data for NPI ${npi} scraped`);

  } catch (error) {
    console.error(`Error scraping data for NPI ${npi}:`, error);
  } finally {
    await browser.close();
  }
};

const run = async () => {
  const { npiArray } = workerData;

  for (const npi of npiArray) {
    await scrapeNPI(npi);
  }

  parentPort.postMessage('done');
};

run().catch(err => console.error(err));