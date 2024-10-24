import { parentPort, workerData } from 'worker_threads';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

// Function to specify the correct Chrome path
const getChromePath = () => {
    try {
        if (process.platform === 'win32') {
            // hardcoded bouuuuuh
            return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; // 64-bit Chrome path
        }
    } catch (e) {
        return null;
    }
};

const runLighthouse = async (url) => {
    const chromePath = getChromePath();
    if (!chromePath) {
        throw new Error('Chrome installation not found.');
    }

    const chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless'],
        chromePath: chromePath, 
    });

    const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance'],
        port: chrome.port, // Use the Chrome instance's debugging port
    };

    // Run Lighthouse
    const runnerResult = await lighthouse(url, options);

    // Kill the Chrome instance after analysis
    await chrome.kill();

    return {
        url,
        report: runnerResult.lhr,
        performanceScore: runnerResult.lhr.categories.performance.score * 100,
    };
};

// Worker logic: Run Lighthouse for the given URL and send results back to the parent thread
runLighthouse(workerData.url)
    .then((result) => parentPort.postMessage(result))
    .catch((error) => parentPort.postMessage({ url: workerData.url, error: error.message }));
