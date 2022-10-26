# Perk

```ts
import { server } from "perk";

server({
	rootDirectory: __dirname,
	routes: {
		directory: "./routes",
		excludeRegex: ".*\\.test\\.ts$",
	},
	server: {
		url: "https://api.mywebsite.com",
		port: 3001,
		cors: {},
	},
})
	.then(() => {
		// eslint-disable-next-line no-console
		console.log(`Server started on port ${config?.server?.port}`);
	})
	.catch((error: Error) => {
		// eslint-disable-next-line no-console
		console.error("The server couldn't start up...");
		// eslint-disable-next-line no-console
		console.error(error.message);
		db.disconnect();
	});

process.once("SIGUSR2", async function () {
	await db.disconnect();
	process.kill(process.pid, "SIGUSR2");
});
```
