'use strict';
const fs=require('node:fs');
const html=fs.readFileSync('bayes-diagnostics/index.html','utf8');
const js=fs.readFileSync('bayes-diagnostics/app.js','utf8');
const i18n=fs.readFileSync('bayes-diagnostics/i18n.js','utf8');
for(const id of ['prior','sens','spec','positiveBtn','negativeBtn','tree','formula','quizFeedback','resetBtn']){
  if(!html.includes(`id="${id}"`)) throw new Error(`missing interactive id: ${id}`);
}
for(const token of ['TP / (TP + FP)','TN / (TN + FN)','P(+|H)','P(−|¬H)','quizCorrect','quizWrong']){
  if(!(html+js+i18n).includes(token)) throw new Error(`missing teaching token: ${token}`);
}
const keys=[...html.matchAll(/data-i18n="([^"]+)"/g)].map(m=>m[1]);
for(const key of keys){if(!new RegExp(`\\b${key}:`).test(i18n)) throw new Error(`missing bilingual key: ${key}`)}
console.log(`bayes-diagnostics static contract: ${keys.length} keys, ${9} controls: ok`);
