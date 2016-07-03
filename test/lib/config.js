let expect = require('chai').expect;
let path = require('path');
let config = require('../../lib/config');

describe('config', function() {

	it('should have a root key', function() {
		expect(config.root).to.equal(path.resolve(__dirname, '../../'));
	});
	
});