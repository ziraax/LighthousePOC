import { Worker } from 'worker_threads';
import os from 'os';

const urls = [
    'https://google.com',
    'https://github.com',
];

// Function to create workers and distribute URLs among them
function runLighthouseOnMultipleUrls(urlList) {
    return new Promise((resolve) => {
        const results = [];
        let completedWorkers = 0;

        // Function to handle results from each worker
        function handleWorkerResult(result) {
            results.push(result);
            completedWorkers++;

            if (completedWorkers === urlList.length) {
                resolve(results);
            }
        }

        // Create a worker for each URL
        urlList.forEach((url) => {
            const worker = new Worker(new URL('./worker.js', import.meta.url), { workerData: { url } });

            // Listen for the message from the worker with the Lighthouse report
            worker.on('message', handleWorkerResult);

            // Handle worker errors
            worker.on('error', (error) => {
                console.error(`Error in worker for URL ${url}:`, error);
                handleWorkerResult({ url, error: error.message });
            });

            // Listen for the worker to exit
            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker for URL ${url} stopped with exit code ${code}`);
                }
            });
        });
    });
}

// Distribute URLs and run Lighthouse
(async () => {
    const numCPUs = os.cpus().length;
    const batchSize = Math.ceil(urls.length / numCPUs);
    const urlBatches = [];

    for (let i = 0; i < urls.length; i += batchSize) {
        urlBatches.push(urls.slice(i, i + batchSize));
    }

    const lighthouseResults = await Promise.all(
        urlBatches.map((batch) => runLighthouseOnMultipleUrls(batch))
    );

    const flatResults = lighthouseResults.flat();
    console.log('Lighthouse analysis results:', JSON.stringify(flatResults, null, 2));
})();
