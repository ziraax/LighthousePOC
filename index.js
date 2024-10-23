import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

let chrome; // Declare chrome instance outside function

async function launchChrome() {
  chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  return chrome.port;
}

async function runLighthouse(url, options) {
  options.port = chrome.port; // Set port for the existing chrome instance
  const results = await lighthouse(url, options);
  return results.lhr; // Lighthouse Result
}

async function analyzeWebsites(websites) {
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility'], 
  };

  await launchChrome(); // Launch Chrome once

  for (const url of websites) {
    console.log(`Analyzing ${url}...`);
    const result = await runLighthouse(url, options);

    // Extract performance metrics
    const performanceMetrics = result.audits;
    const fcp = performanceMetrics['first-contentful-paint'].displayValue; // First Contentful Paint
    const lcp = performanceMetrics['largest-contentful-paint'].displayValue; // Largest Contentful Paint
    const speedIndex = performanceMetrics['speed-index'].displayValue; // Speed Index

    console.log(`Results for ${url}:`);
    console.log(`Performance: ${result.categories.performance.score}`);
    console.log(`FCP: ${fcp}`);
    console.log(`LCP: ${lcp}`);
    console.log(`Speed Index: ${speedIndex}`);
    console.log(`Accessibility: ${result.categories.accessibility.score}`);
    console.log('-----------------------------------');
  }

  await chrome.kill(); // Close Chrome after all URLs are analyzed
}


const websites = [
  'https://youtube.com',
  'https://google.com',
];

// Start the analysis
analyzeWebsites(websites).catch(console.error);
