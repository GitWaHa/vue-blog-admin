const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const isProduction = process.env.NODE_ENV === "production";
// externals
const externals = {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    axios: 'axios',
    'ant-design-vue': 'antd',
    'mavon-editor': 'MavonEditor',
    // katex: 'katex'
}

// CDN外链，会插入到index.html中
const cdn = {
    dev: {
        css: [
            'https://waha-share.oss-cn-beijing.aliyuncs.com/cdn/css/katex.css',
            'https://waha-share.oss-cn-beijing.aliyuncs.com/cdn/css/markdown.css'
        ],
        js: []
    },
    build: {
        css: [
            'https://waha-share.oss-cn-beijing.aliyuncs.com/cdn/css/katex.css',
            'https://waha-share.oss-cn-beijing.aliyuncs.com/cdn/css/markdown.css'
        ],
        js: [
            'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js',
            'https://cdn.jsdelivr.net/npm/vue-router@3.5.2/dist/vue-router.min.js',
            'https://cdn.jsdelivr.net/npm/axios@0.21.1/dist/axios.min.js',
            'https://cdn.jsdelivr.net/npm/ant-design-vue@1.7.8/dist/antd.min.js',
            'https://cdn.jsdelivr.net/npm/mavon-editor@2.9.1/dist/mavon-editor.min.js',
        ]
    }
}

module.exports = {
    lintOnSave: false,
    indexPath: "index.html",
    publicPath: "/admin",
    outputDir: "./dist/admin",
    assetsDir: "static",
    productionSourceMap: false,
    configureWebpack: {
        plugins: [
            // new BundleAnalyzerPlugin(),
        ],
    },
    chainWebpack: config => {
        config.when(isProduction, config => {
            config.set('externals', externals)
        })

        config.plugin('html').tap(args => {
            if (isProduction) {
                args[0].cdn = cdn.build
            } else {
                args[0].cdn = cdn.dev
            }
            return args
        })
    }
}