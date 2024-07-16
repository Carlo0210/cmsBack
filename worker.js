// worker.js
const { parentPort, workerData } = require('worker_threads');
const providerServiceController = require('./controllers/providerServiceController');

(async () => {
    const { NPIs } = workerData;
    try {
        const CMSDetailsUrls = NPIs.map(npi => `https://data.cms.gov/tools/medicare-physician-other-practitioner-look-up-tool/provider/${npi}?size=100`);
        await providerServiceController.scrapeAndSaveProviderServices(CMSDetailsUrls);

        parentPort.postMessage('Batch processed successfully');
    } catch (error) {
        parentPort.postMessage(`Error: ${error.message}`);
    }
})();
