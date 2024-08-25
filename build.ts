import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { minify as minifyHtml } from "html-minifier-terser";

const nativeExternals = ["@neptune", "@plugin", "electron"];
const minify = true;

// Based on Vencord's file-uri-plugin
// https://github.com/Vendicated/Vencord/blob/main/scripts/build/common.mjs
const fileUrl: esbuild.Plugin = {
	name: "fileUrl",
	setup: (build) => {
		const filter = /^file:\/\/.+/;
		build.onResolve({ filter }, (args) => ({
			path: args.path,
			pluginData: {
				uri: args.path,
				path: path.join(
					args.resolveDir,
					args.path.slice("file://".length).split("?")[0]
				),
			},
			namespace: "file-url",
		}));
		build.onLoad(
			{ filter, namespace: "file-url" },
			async ({ pluginData: { path, uri } }) => {
				const { searchParams } = new URL(uri);
				const base64 = searchParams.has("base64");
				const minify = searchParams.has("minify");
				const encoding = base64 ? "base64" : "utf-8";

				let content;
				if (!minify) {
					content = fs.readFileSync(path, encoding).trimEnd();
				} else {
					if (path.endsWith(".html")) {
						const file = fs.readFileSync(path, "utf-8");
						content = await minifyHtml(file, {
							collapseWhitespace: true,
							removeComments: true,
							minifyCSS: true,
							minifyJS: true,
							removeEmptyAttributes: true,
							removeRedundantAttributes: true,
							removeScriptTypeAttributes: true,
							removeStyleLinkTypeAttributes: true,
							useShortDoctype: true,
						});
					} else {
						throw new Error(`Don't know how to minify file type: ${path}`);
					}

					if (base64) content = Buffer.from(content).toString("base64");
				}

				return {
					contents: `export default ${JSON.stringify(content)}`,
				};
			}
		);
	},
};

const neptuneNativeImports: esbuild.Plugin = {
	name: "neptuneNativeImports",
	setup(build) {
		build.onLoad({ filter: /.*[\/\\].+\.native\.[a-z]+/g }, async (args) => {
			const result = await esbuild.build({
				entryPoints: [args.path],
				bundle: true,
				minify,
				platform: "node",
				format: "iife",
				globalName: "neptuneExports",
				write: false,
				external: nativeExternals,
				plugins: [fileUrl],
			});

			const outputCode = result.outputFiles[0].text;

			// HATE! WHY WHY WHY WHY WHY (globalName breaks metafile. crying emoji)
			const { metafile } = await esbuild.build({
				entryPoints: [args.path],
				platform: "node",
				write: false,
				metafile: true,
				bundle: true,
				minify,
				external: nativeExternals,
				plugins: [fileUrl],
			});

			const builtExports = Object.values(metafile.outputs)[0].exports;

			return {
				contents: `import {addUnloadable} from "@plugin";const contextId=NeptuneNative.createEvalScope(${JSON.stringify(
					outputCode
				)});${builtExports
					.map(
						(e) =>
							`export ${
								e == "default" ? "default " : `const ${e} =`
							} NeptuneNative.getNativeValue(contextId,${JSON.stringify(e)})`
					)
					.join(
						";"
					)};addUnloadable(() => NeptuneNative.deleteEvalScope(contextId))`,
			};
		});
	},
};

const plugins = fs.readdirSync("./plugins");
for (const plugin of plugins) {
	if (plugin.startsWith("_")) continue;
	const pluginPath = path.join("./plugins/", plugin);
	const pluginPackage = JSON.parse(
		fs.readFileSync(path.join(pluginPath, "package.json"), "utf8")
	);
	const outfile = path.join(pluginPath, "dist/index.js");

	esbuild
		.build({
			entryPoints: [
				"./" + path.join(pluginPath, pluginPackage.main ?? "index.js"),
			],
			plugins: [fileUrl, neptuneNativeImports],
			bundle: true,
			minify,
			format: "esm",
			external: ["@neptune", "@plugin"],
			platform: "browser",
			outfile,
			logOverride: {
				"import-is-undefined": "silent",
			},
		})
		.then(() => {
			fs.createReadStream(outfile)
				// It being md5 does not matter, this is for caching and not security
				.pipe(crypto.createHash("md5").setEncoding("hex"))
				.on("finish", function (this: crypto.Hash) {
					fs.writeFileSync(
						path.join(pluginPath, "dist/manifest.json"),
						JSON.stringify({
							name: pluginPackage.displayName,
							description: pluginPackage.description,
							author: pluginPackage.author,
							hash: this.read(),
						})
					);

					console.log("Built " + pluginPackage.displayName + "!");
				});
		});
}
