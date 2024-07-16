//scrapeProviderDetails.js
const { Worker } = require('worker_threads');
const fs = require('fs');
const path = require('path');

const numThreads = 4; // Number of concurrent threads for parallel scraping

const scrapeNPI = async (npiArray) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./workerProviderDetails.js', {
      workerData: { npiArray }
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};

const loadNPIsFromFile = async (filePath) => {
  let npiArray = [];

  try {
    const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });

    let data = '';
    for await (const chunk of readStream) {
      data += chunk;
    }

    const jsonData = JSON.parse(data);
    if (jsonData && jsonData.npis && Array.isArray(jsonData.npis)) {
      npiArray = jsonData.npis;
    } else {
      throw new Error('Invalid JSON format or missing "npis" array');
    }
  } catch (error) {
    console.error('Error loading NPIs from file:', error);
    throw error; // Propagate the error to handle it in the run function
  }

  return npiArray;
};

const run = async () => {
  const filePath = path.join(__dirname, 'npis.json');
  let npiArray = [];

  try {
    npiArray = await loadNPIsFromFile(filePath);
  } catch (error) {
    console.error('Failed to load NPIs from file:', error);
    return; // Exit early if loading NPIs fails
  }

  const chunkSize = Math.ceil(npiArray.length / numThreads);
  const promises = [];

  for (let i = 0; i < numThreads; i++) {
    const chunk = npiArray.slice(i * chunkSize, (i + 1) * chunkSize);
    if (chunk.length > 0) {
      promises.push(scrapeNPI(chunk));
    }
  }

  try {
    await Promise.all(promises);
    console.log('Scraping completed');
  } catch (error) {
    console.error('An error occurred during scraping:', error);
  }
};

run().catch(err => console.error('Uncaught error in run:', err));