'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

let distDir = path.resolve(__dirname, 'dist/');


module.exports = {
    // Entry point : first executed file
    entry: {
        app: './src/main.js',
    },

    output: {
        path: distDir,
        filename: 'js/[name].bundle.js'
    },

    module: {
		rules: [
			{
				test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
			},
			{
			    test: /\.(ico|jpe?g|png|gif)$/,
                loader: "file-loader"
			}
		]
	},

    plugins: [  // Array of plugins to apply to build chunk
        new HtmlWebpackPlugin({
            template: "./static/index.html",
            inject: 'body'
        }),
    ],

    devtool: 'source-map',

    devServer: {
        // Display only errors to reduce the amount of output.
        stats: "errors-only",
        contentBase: distDir,

        host: process.env.HOST, // Defaults to `localhost`
        port: process.env.PORT, // Defaults to 8080
        open: true, // Open the page in browser
        publicPath: '/',
    },
};

