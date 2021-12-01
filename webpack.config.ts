import path from 'path';
import { Configuration, DefinePlugin } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const config: Configuration = {
    mode: 'development',
    entry: {
        main: './src/index.tsx',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
        }),
        new ForkTsCheckerWebpackPlugin({
            async: false,
            eslint: {
                files: [
                    './src/**/*',
                    './components/**/*',
                    './hooks/**/*',
                ],
            },
        }),
        new MiniCssExtractPlugin(),
        new DefinePlugin({

        })
    ],
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react',
                            '@babel/preset-typescript',
                        ],
                    },
                },
            },
            {
                test: /\.css$/,
                include: [
                    path.resolve(__dirname, 'node_modules/video.js/dist'),
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'components'),
                ],
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        clean: true,
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                react: {
                    test: /[\\\/]node_modules[\\\/]react(-dom)?[\\\/]/,
                    name: 'react',
                    enforce: true,
                },
                vendors: {
                    test: /[\\\/]node_modules[\\\/](?!react(-dom)?|video\.js)[^\\\/]*[\\\/]/,
                    name: 'vendors',
                    enforce: true,
                }
            },
        },
    },
};

export default config;