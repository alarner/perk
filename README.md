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
		console.log(`Server started on port 3001`);
	})
	.catch((error: Error) => {
		console.error("The server couldn't start up...");
		console.error(error.message);
	});

process.once("SIGUSR2", async function () {
	process.kill(process.pid, "SIGUSR2");
});
```
