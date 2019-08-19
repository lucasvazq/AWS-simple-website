// SECTIONS
// - optimization
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
// - plugins
const HtmlWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// - module
const postcssPresetEnv = require('postcss-preset-env')
// Others
const path = require('path')

const glob = require('glob')
const PurgecssPlugin = require('purgecss-webpack-plugin')
const PATHS = {
    src: path.join(__dirname, 'src')
  }


module.exports = (env, options) => {

    const devMode = options.mode !== 'production'

    return {

        
        // ===============================================
        // Main Configuration
        // ===============================================


        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist/' + (devMode ? 'dev/' : 'prod/')),
            filename: devMode ? '[name].js' : '[name].[contenthash:4].js',
            publicPath: devMode ? '/' : '/cloudfront/', // CDN
        },
        devServer: {
            historyApiFallback: true
        },
        resolve: {
            alias: devMode ? {
                jquery: "jquery/src/jquery"
            } : {}
        },


        // ===============================================
        // Optimization
        // ===============================================


        optimization: {

            minimizer: devMode ? [] : [

                // Javascript minifier
                new TerserJSPlugin({}),

                // CSS minifier
                new OptimizeCSSAssetsPlugin({
                    cssProcessorPluginOptions: {
                        preset: [
                            'default', {
                                discardComments: {
                                    removeAll: true
                                },
                            }
                        ],
                    },
                })
            ]
        },


        // ===============================================
        // Plugins
        // ===============================================


        plugins: [
            new HtmlWebPackPlugin({
                template: './src/index.html',
                filename: 'index.html',
                minify: devMode ? {} : {
                    collapseWhitespace: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    useShortDoctype: true
                }
            }),
            new MiniCssExtractPlugin({
                filename: devMode ? '[name].css' : '[name].[contenthash:4].css'
            }),
            new PurgecssPlugin({
                paths: glob.sync(`${PATHS.src}/*`, { nodir: true })
            })
        ],
        

        // ===============================================
        // Modules
        // ===============================================

        
        module: {
            rules: [
                // CSS
                {
                    test: /\.(c|sc|sa)ss$/,
                    use: [
                        'style-loader',
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 2, // Exec after postcss-loader and sass-loader
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: () => [
                                    // postcss-preset-env: future css today
                                    // Already include autoprefix (add vendor prefixes)
                                    // stage: 4 -> Stable version
                                    postcssPresetEnv({
                                        stage: 4
                                    })
                                ]
                            } 
                        },
                        'sass-loader'
                    ]
                },

                // FONTS
                {
                    test: /\.woff(2)?(\?[a-z0-9#=&.]+)?$/,
                    loader: "url-loader"
                }, {
                    test: /\.(ttf|eot|svg)?(\?[a-z0-9#=&.]+)?$/,
                    loader: "file-loader"
                },

                // JAVASCRIPT
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader'
                    }
                },

                // HTML
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: 'html-loader',
                            options: {
                                attrs: false,
                                interpolate: true
                            }
                        }
                    ]
                }
            ]
        }
    }
}