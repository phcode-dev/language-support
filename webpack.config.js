// webpack.config.js (Example configuration for Webpack)
const path = require('path');

module.exports = {
    entry: './src/worker',
    resolve: {
        fallback: {
            "path": require.resolve('path-browserify')
        }
    },
    output: {
        filename: 'language-worker.js',
        path: path.resolve(__dirname, 'dist'),
        globalObject: 'this' // This ensures compatibility with both browser and worker environments
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
