// scraperService.js
const { Worker } = require('worker_threads');
const fs = require('fs');

const BATCH_SIZE = 25;
const NUM_WORKERS = 2; // Adjust the number of worker threads

// Store the original console.log function
const originalConsoleLog = console.log;

// Override console.log with an empty function
console.log = function () {};

// Load NPIs from the JSON file
let NPI_ARRAY = [];
try {
    const rawData = fs.readFileSync('npis.json');
    const jsonData = JSON.parse(rawData);
    NPI_ARRAY = jsonData.npis;
} catch (error) {
    console.error('Error reading NPIs from JSON file:', error);
}

async function createWorkers(NPIs, skip, limit) {
    return new Promise((resolve, reject) => {
        const workers = [];
        let completedWorkers = 0;

        for (let i = 0; i < NUM_WORKERS; i++) {
            const batchNPIs = NPIs.slice(skip + i * limit, skip + (i + 1) * limit);
            if (batchNPIs.length === 0) {
                completedWorkers++;
                if (completedWorkers === NUM_WORKERS) {
                    resolve();
                }
                continue;
            }

            const worker = new Worker('./worker.js', {
                workerData: { NPIs: batchNPIs }
            });

            worker.on('message', (message) => {
                if (message === 'Batch processed successfully') {
                    completedWorkers++;
                    if (completedWorkers === NUM_WORKERS) {
                        resolve();
                    }
                }
            });

            worker.on('error', (error) => {
                console.error(`Worker ${i} error:`, error);
                reject(error);
            });

            workers.push(worker);
        }
    });
}

async function scrapeAllProviderServices() {
    try {
        const totalNPIs = NPI_ARRAY.length;

        for (let skip = 0; skip < totalNPIs; skip += NUM_WORKERS * BATCH_SIZE) {
            await createWorkers(NPI_ARRAY, skip, BATCH_SIZE);
        }

        console.log('All provider services data scraped and saved successfully');
    } catch (error) {
        console.error('Error scraping and saving provider services data:', error);
    }
}

// Immediately scrape and save provider services upon server start
(async () => {
    try {
        await scrapeAllProviderServices();
    } catch (error) {
        console.error('Error scraping and saving provider services data:', error);
    }
})();

// Restore the original console.log function
console.log = originalConsoleLog;
