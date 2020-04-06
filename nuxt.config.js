const bodyParser = require('body-parser')
const session = require('express-session')

require('dotenv').config()

module.exports = {
  server: {
    host: 'localhost',
    port: process.env.RECORD_SERVER_PORT
  },
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    'view-design/dist/styles/iview.css',
    'ant-design-vue/dist/antd.css',
    'assets/main.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  // codemirror 和 g2 要避免 ssr
  plugins: [
    '@/plugins/view-design',
    '@/plugins/antd-ui',
    { src: '@/plugins/codemirror', ssr: false },
    { src: '@/plugins/g2', ssr: false }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/dotenv'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    // Doc: https://auth.nuxtjs.org/
    '@nuxtjs/auth',
    ['nuxt-matomo', {
      matomoUrl: process.env.RECORD_MATOMO_URL,
      siteId: process.env.RECORD_MATOMO_SITEID,
      trackerUrl: process.env.RECORD_MATOMO_TRACKER,
      scriptUrl: process.env.RECORD_MATOMO_SCRIPT
    }]
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    host: process.env.RECORD_AXIOS_HOST,
    port: process.env.RECORD_AXIOS_PORT,
    https: process.env.RECORD_AXIOS_PORT === '443'
  },
  /*
  ** Auth module configuration
  ** See https://auth.nuxtjs.org/
  */
  auth: {
    cookie: {
      options: {
        expires: 3
      }
    },
    resetOnError: true,
    strategies: {
      local: {
        endpoints: {
          login: { propertyName: 'token.accessToken' }
        }
      }
    }
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },
  /*
  ** Add server middleware
  ** Nuxt.js uses `connect` module as server
  ** So most of express middleware works with nuxt.js server middleware
  */
  serverMiddleware: [
    // body-parser middleware
    bodyParser.urlencoded({
      limit: '5mb',
      extended: true
    }),
    bodyParser.json({
      limit: '5mb',
      extended: true
    }),

    // session middleware
    session({
      secret: process.env.RECORD_COOKIE_SECERT,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60000 }
    }),

    // Api middleware
    '~/api'
  ]
}
