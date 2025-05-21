/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    // These are all the locales you want to support
    locales: ["en", "ar"],
    // This is the default locale you want to be used when visiting
    // a non-locale prefixed path e.g. `/hello`
    defaultLocale: "en",
    // This is a list of locale domains and the default locale they
    // should handle (these are only required when setting up domain routing)
    // domains: [
    //   {
    //     domain: 'example.com',
    //     defaultLocale: 'en',
    //   },
    //   {
    //     domain: 'example.ar',
    //     defaultLocale: 'ar',
    //   },
    // ],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
