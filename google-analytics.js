/* Production-only, page-level GA4. See specs/google-analytics.md. */
(function () {
  'use strict';
  if (window.location.hostname !== 'visual.integ.life' || window.top !== window.self || window.__visualGA) return;
  var source = document.currentScript;
  var path = source && source.getAttribute('data-page');
  // The publisher supplies a public file path; never send search text or URL fragments.
  if (!path || !/^\/[a-zA-Z0-9/_\.\-]*$/.test(path)) return;
  window.__visualGA = true;
  var id = 'G-LPRZ9XLGWX';
  var page = {page_location: 'https://visual.integ.life' + path, page_title: 'Integ Visual', page_referrer: ''};
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'granted'
  });
  var settings = Object.assign({}, page, {
    send_page_view: false, allow_google_signals: false,
    allow_ad_personalization_signals: false, allow_enhanced_conversions: false
  });
  // Remote Google tag configuration can initialize its destination on gtm.js.
  // Seed global defaults first so that initialization cannot use the raw document.
  gtag('set', settings);
  gtag('js', new Date());
  gtag('config', id, settings);
  gtag('event', 'page_view', Object.assign({}, page, {send_to: id}));
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.head.appendChild(script);
}());
