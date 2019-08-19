// Optimization
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// Plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssPresetEnv = require('postcss-preset-env');
const PurgecssPlugin = require('purgecss-webpack-plugin');

// PurgueCSS specific
const path = require('path');
const glob = require('glob');
const PATHS = {
    src: path.join(__dirname, './*')
};
const pages_folder = glob.sync(`${PATHS.src}pages/*`);
const components_folder = glob.sync(`${PATHS.src}components/*`);
const javascript_files = pages_folder.concat(components_folder);

module.exports = {
    webpack: (config, {dev}) => {

        // Add jquery in development environment
        if (dev) {
            config.resolve.alias.jquery = "jquery/src/jquery";
        };

        // Minimization default values:
        // - production: true
        // - development: false
        config.optimization.minimizer = [
            new TerserJSPlugin({}),
            new OptimizeCSSAssetsPlugin({
                cssProcessorPluginOptions: {
                    preset: [
                        'default',
                        {
                            discardComments: {
                                removeAll: true
                            }
                        }
                    ]
                }
            })
        ];

        // Plugins
        config.plugins.push(
            new MiniCssExtractPlugin({
                filename: '[name].[contenthash:4].css'
            }),
            new PurgecssPlugin({
                paths: javascript_files
            })
        )

        // Modules
        config.module.rules.push({
            test: /\.(c|sc|sa)ss$/,
            use: [
                'style-loader',
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 2 // 2 => postcss-loader, sass-loader
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        ident: 'postcss',
                        plugins: () => [
                            // postcss-preset-env: "future css today".
                            // Already include autoprefix (add vendor prefixes).
                            // stage: 4 -> Stable version
                            postcssPresetEnv({
                                stage: 4
                            })
                        ]
                    }
                },
                'sass-loader'
            ]
        });

        return config;
    }
};
