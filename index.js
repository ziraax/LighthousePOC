import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

async function launchChromeAndRunLighthouse(url, options = {}) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  options.port = chrome.port;

  const results = await lighthouse(url, options);
  await chrome.kill();

  return results.lhr; // Lighthouse Result
}

async function analyzeWebsites(websites) {
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility'],
  };

  for (const url of websites) {
    console.log(`Analyzing ${url}...`);
    const result = await launchChromeAndRunLighthouse(url, options);
    console.log(`Results for ${url}:`);
    console.log(`Performance: ${result.categories.performance.score}`);
    console.log(`Accessibility: ${result.categories.accessibility.score}`);
    console.log('-----------------------------------');
  }
}

const websites = [
  'https://youtube.com',
  'https://google.com',
];

// Start the analysis
analyzeWebsites(websites).catch(console.error);
