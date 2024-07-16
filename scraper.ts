const playwright = require('playwright');
const axios = require('axios');

const BASE_URL = 'https://data.cms.gov/tools/medicare-physician-other-practitioner-look-up-tool?size=100&offset=';
const SERVER_URL = 'http://localhost:5000/api/providers';

const states = [
    'AL', 'AK', 'AZ', 'AR', 'AS', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'GU', 'HI', 'ID', 
    'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 
    'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 
    'SD', 'TN', 'TX', 'TT', 'UT', 'VT', 'VA', 'VI', 'WA', 'WV', 'WI', 'WY'
];


async function scrapeDataForState(page, state) {
    let offset = 0;
    let allData = [];

    while (true) {
        const searchUrl = `${BASE_URL}${offset}&state=${state}`;
        await page.goto(searchUrl);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForSelector('.ToolsResultsRows .ToolResults_row', { timeout: 2000000 });
        
        const data = await page.$$eval(".ToolsResultsRows .ToolResults_row", (rows) => {
            return rows.map((row) => {
                const providerName = row.querySelector('.ToolResults_row_name h4')?.innerText.trim();
                const address1 = row.querySelectorAll('.ToolResults_row_details div.caps')[0]?.innerText.trim();
                const address2 = row.querySelectorAll('.ToolResults_row_details div.caps')[1]?.innerText.trim();
                const cityStateZip = row.querySelectorAll('.ToolResults_row_details div.caps')[2]?.innerText.trim();
                const [city, stateZip] = cityStateZip.split(',');
                const [state, zip] = stateZip.trim().split(' ');
                const details = row.querySelectorAll('.ToolResults_row_details div');
                const specialty = details[3]?.innerText.replace('Specialty:', '').trim();
                const entityType = details[4]?.innerText.replace('Entity Type:', '').trim();
                let npi = details[5]?.innerText.replace('NPI:', '').trim();
                const cmsUrl = `https://data.cms.gov/tools/medicare-physician-other-practitioner-look-up-tool/provider/${npi}`;
                const CMSDetails = `${cmsUrl}?size=100&offset=0&state=${state}`;

                return {
                    providerName,
                    CMSDetails,
                    address: `${address1} ${address2}`,
                    city: city?.trim(),
                    state: state?.trim(),
                    zip: zip?.trim(),
                    specialty,
                    entity_type: entityType,
                    npi
                };
            });
        });

        allData = allData.concat(data);
        console.log(`State: ${state} - Batch: ${offset / 100 + 1} - Collected: ${data.length} entries`);

        const nextPageButton = await page.$('.InputPagination__next');
        const isNextPageDisabled = await nextPageButton.evaluate(button => button.hasAttribute('disabled'));
        if (isNextPageDisabled) {
            break;
        } else {
            offset += 100; 
        }
    }

    console.log(`Total collected for state ${state}: ${allData.length} entries`);
    return allData;
}

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    for (const state of states) {
        console.log(`Scraping state: ${state}`);
        try {
            const stateData = await scrapeDataForState(page, state);
            
            const chunkSize = 100;
            for (let i = 0; i < stateData.length; i += chunkSize) {
                const chunk = stateData.slice(i, i + chunkSize);
                const response = await axios.post(SERVER_URL, chunk);
                console.log(`Saved batch ${i / chunkSize + 1} for state ${state}:`, response.data);
            }

            console.log(`Data for state ${state} saved to the database`);
        } catch (error) {
            console.error(`Error scraping data for state ${state}:`, error.response ? error.response.data : error.message);
        }
    }

    await browser.close();
})().catch((error) => {
    console.error(error);
    process.exit(1);
});