// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default {
	...defineCloudflareConfig({
		// For best results consider enabling R2 caching
		// See https://opennext.js.org/cloudflare/caching for more details
		// incrementalCache: r2IncrementalCache
	}),
	// `npm run build` is `opennextjs-cloudflare build`, which shells back out to the
	// package manager's build script. Point it at the raw Next build to avoid recursing.
	buildCommand: "npm run build:next",
};
