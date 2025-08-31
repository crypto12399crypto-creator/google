const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const i18nextMiddleware = require('i18next-http-middleware');
const path = require('path');

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    // Define the languages we support
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'], // English and Hindi
    preload: ['en', 'hi'],

    // Define where translations are stored
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: path.join(__dirname, '../../locales/{{lng}}/{{ns}}.json'),
    },

    // Configure how the language is detected in a request
    detection: {
      // Order of detection methods
      order: ['querystring', 'header'],

      // Do not cache the language in a cookie or session
      caches: false,

      // The query string parameter to look for, e.g., /api/v1/plans?lang=hi
      lookupQuerystring: 'lang',
    },
  });

module.exports = i18next;
