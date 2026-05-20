import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	basePath: '/nodeeditor',
	webpack: (config) => {
		config.module.rules.push({
			test: /\.txt$|\.js\.raw$/,
			use: "raw-loader",
		});
		return config;
	},
	turbopack: {},
};

export default nextConfig;
