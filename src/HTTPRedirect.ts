export class HTTPRedirect {
	location: string;
	status: number;
	constructor(location: string, status = 302) {
		this.location = location;
		this.status = status;
	}
}
