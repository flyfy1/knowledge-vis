/* Linux executable selection only; original probe bytes and assertions are unchanged.
 * On Mac run preset-probe-original.cjs directly with the native Playwright browser.
 */
const {chromium}=require('playwright');
if(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH){
 const launch=chromium.launch.bind(chromium);
 chromium.launch=options=>launch({...options,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
}
require('./preset-probe-original.cjs');
