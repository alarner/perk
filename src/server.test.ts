import { server } from "./server";

describe("server", () => {
	test("it should return a new Koa server", async () => {
		const s = await server({
			routes: { directory: "./__fixtures__/routes" },
		});
		expect("instance" in s).toEqual(true);
		expect("app" in s).toEqual(true);
		const result = s.instance.close();
	});
});
