const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = (env, argv) => {
	const isProduction = env === 'production';

	return {
		mode: isProduction ? 'production' : 'development',
		entry: ['./src/index.ts'],
		output: {
			filename: 'index.ts',
			path: path.resolve(__dirname, 'dist'),
			libraryTarget: 'umd',
			library: 'component-library',
		},
		node: {
			__dirname: true,
		},
		plugins: [
			new CleanWebpackPlugin({
				cleanOnceBeforeBuildPatterns: ['dist'],
			}),
			new MiniCssExtractPlugin({
				filename: 'index.css',
			}),
			new BundleAnalyzerPlugin({
				analyzerMode: argv.a || argv.analyze ? 'static' : 'disabled',
				reportFilename: 'stats.html',
				openAnalyzer: argv.a || argv.analyze ? true : false,
				generateStatsFile: argv.a || argv.analyze ? true : false,
				statsFilename: 'stats.json',
				statsOptions: {
					source: false,
					modules: true,
					cached: false,
					children: false,
					chunks: true,
				},
			}),
		],
		module: {
			rules: [
				{
					enforce: 'pre',
					test: /\.(js|jsx|mjs)$/,
					loader: 'eslint-loader',
					exclude: /node_modules/,
				},
				{
					test: /\.(js|jsx|mjs)$/,
					exclude: /node_modules/,
					use: ['babel-loader'],
				},
				{
					test: /\.tsx?$/,
					exclude: /node_modules/,
					use: 'ts-loader',
				},
				{
					test: /\.(css|scss)$/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
						},
						{
							loader: 'css-loader',
							options: {
								importLoaders: 1,
							},
						},
						{
							loader: 'postcss-loader',
							options: {
								// Necessary for external CSS imports to work
								// https://github.com/facebookincubator/create-react-app/issues/2677
								ident: 'postcss',
								plugins: () => [
									require('postcss-flexbugs-fixes'),
									autoprefixer({
										flexbox: 'no-2009',
									}),
								],
							},
						},
						{
							loader: 'sass-loader',
						},
					],
				},
				{
					test: /\.svg$/i,
					// Only transform SVGs into components when requested by component modules
					issuer: /\.[jt]sx?$/,
					use: ['@svgr/webpack'],
				},
				{
					test: /\.svg$/i,
					// Keep svgs loaded by css modules as URL
					issuer: /\.scss$/,
					use: ['file-loader'],
				},
				{
					test: /\.(png|jpg|gif|woff|woff2|eot|ttf|otf)$/,
					use: ['file-loader'],
				},
			],
		},
		externals: {
			react: 'umd react',
			'react-dom': 'umd react-dom',
			'react-router-dom': 'umd react-router-dom',
			'styled-components': 'styled-components',
		},
		optimization: {
			nodeEnv: isProduction ? 'production' : 'development',
			minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
			usedExports: true,
			sideEffects: true,
		},
		resolve: {
			extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss', '.css'],
			modules: ['src', 'node_modules'],
		},
	};
};
