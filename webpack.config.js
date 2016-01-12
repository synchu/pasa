const path = require('path')
const PATHS = {
    app: path.join(__dirname, '/src/assets/javascripts')
}
module.exports = {
    context: __dirname + "/src/assets/javascripts",
    entry: ["./app-compiled"],
    output: {
        path: __dirname + "/src/assets/javascripts",
        filename: "bundle.js"
    },
    loaders: [
        { test: /\.coffee$/, loader: 'coffee-loader' },
        { test: /\.css$/, loader: 'style-loader!css-loader'}
    ]
}
