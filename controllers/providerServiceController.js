const playwright = require('playwright');
const { Sema } = require('async-sema');
const fs = require('fs');

// Load existing data from scrapedData.json
let existingData = [];
try {
    if (fs.existsSync('scrapedData.json')) {
        const rawData = fs.readFileSync('scrapedData.json');
        existingData = JSON.parse(rawData);
    }
} catch (error) {
    console.error('Error reading scrapedData.json:', error);
}

const scrapedData = existingData; // Initialize scrapedData with existing data

// Function to extract NPI from the cmsUrl
function extractNPI(cmsUrl) {
    const match = cmsUrl.match(/provider\/(\d+)/);
    return match ? match[1] : null;
}

async function scrapeAndSaveProviderServices(providerData) {
    const sema = new Sema(10); // Limiting to 10 concurrent requests
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();

    try {
        await Promise.all(providerData.map(async (cmsUrl) => {
            const NPI = extractNPI(cmsUrl);
            if (!NPI) {
                console.log('NPI not found in URL:', cmsUrl);
                return;
            }

            // Check if the provider service data has already been scraped
            const existingProviderService = scrapedData.some(service => service.NPI === NPI);
            if (existingProviderService) {
                console.log('Provider service data already scraped for NPI:', NPI);
                return; // Skip scraping if data already exists
            }

            await sema.acquire();
            let page;
            try {
                page = await context.newPage();
                await page.goto(cmsUrl, { timeout: 60000 });
                await page.waitForSelector('label + p', { timeout: 60000 });

                const providerServicesData = await page.evaluate(() => {
                    const npiElement = document.querySelector('label + p');
                    const extractedNPI = npiElement ? npiElement.innerText : null;

                    if (!extractedNPI) return null;

                    const rows = Array.from(document.querySelectorAll('.DynamicTable__table tbody tr'));
                    return rows.map(row => {
                        const columns = row.querySelectorAll('td');
                        return {
                            NPI: extractedNPI,
                            HCPCS: columns[0]?.innerText.trim(),
                            Description: columns[1]?.innerText.trim(),
                            Drug: columns[2]?.innerText.trim(),
                            PlaceOfService: columns[3]?.innerText.trim(),
                            NumberOfServices: parseInt(columns[4]?.innerText.trim()),
                            NumberOfBeneficiaries: parseInt(columns[5]?.innerText.trim()),
                            AverageSubmittedCharge: parseFloat(columns[6]?.innerText.trim().replace('$', '').replace(',', '')),
                            AverageMedicareAllowedAmount: parseFloat(columns[7]?.innerText.trim().replace('$', '').replace(',', '')),
                            AverageMedicarePayment: parseFloat(columns[8]?.innerText.trim().replace('$', '').replace(',', ''))
                        };
                    });
                });

                if (providerServicesData) {
                    providerServicesData.forEach(serviceData => {
                        scrapedData.push(serviceData); // Push scraped data to the array
                    });
                    fs.writeFile('scrapedData.json', JSON.stringify(scrapedData, null, 2), (err) => {
                        if (err) {
                            console.error('Error writing to JSON file:', err);
                        } else {
                            console.log('Scraped data saved to scrapedData.json');
                        }
                    });
                }
            } catch (error) {
                console.error('Error scraping and saving provider services data for URL:', cmsUrl, error);
            } finally {
                if (page) {
                    await page.close();
                }
                sema.release();
            }
        }));

        console.log('Provider services data saved successfully');
    } catch (error) {
        console.error('Error scraping and saving provider services data:', error);
    } finally {
        await browser.close();
    }
}

module.exports = {
    scrapeAndSaveProviderServices
};
