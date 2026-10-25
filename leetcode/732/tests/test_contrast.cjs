// Calibrate the actual browser checker's function, not a second implementation.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

function calibrate(source = fs.readFileSync(path.join(__dirname, 'browser.cjs'), 'utf8')) {
  const body = source.slice(source.indexOf('function lum(c)'), source.indexOf('function ratio(a,b)'));
  assert(body.startsWith('function lum(c)'));
  const lum = vm.runInNewContext('(' + body.trim() + ')');
  const samples = [
    [[0, 0, 0], 0], [[255, 255, 255], 1],
    [[255, 0, 0], .2126], [[0, 255, 0], .7152], [[0, 0, 255], .0722],
    [[128, 128, 128], .21586050011389926],
  ];
  const values = samples.map(([rgb, expected]) => ({rgb, expected, actual: lum(rgb)}));
  const contrast = rgb => (lum(rgb) + .05) / .05;
  const negative = contrast([116, 116, 116]);
  const positive = contrast([117, 117, 117]);
  const report = {
    finding: '732-MAC-R1',
    reference: 'https://www.w3.org/TR/WCAG22/#dfn-relative-luminance',
    values,
    blackWhite: contrast([255, 255, 255]),
    threshold: {minimum: 4.5, negative: {hex: '#747474', on: '#000000', ratio: negative}, positive: {hex: '#757575', on: '#000000', ratio: positive}},
  };
  report.status = values.every(v => Math.abs(v.actual - v.expected) < 1e-12)
    && Math.abs(report.blackWhite - 21) < 1e-12
    && Math.abs(negative - 4.492948073111701) < 1e-12
    && negative < 4.5 && positive >= 4.5 ? 'pass' : 'fail';
  return report;
}

module.exports = calibrate;
if (require.main === module) {
  const report = calibrate();
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.status === 'pass' ? 0 : 1;
}
