module.exports = class HTTPRedirect {
	constructor(location, status=302) {
		this.location = location;
		this.status = status;
	}
}
