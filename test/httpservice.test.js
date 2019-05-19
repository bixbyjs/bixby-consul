var $require = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var factory = require('../app/httpservice');
var consul = require('consul');


describe('httpservice', function() {
  
  it('should export factory function', function() {
    expect(factory).to.be.a('function');
  });
  
  it('should be annotated', function() {
    expect(factory['@singleton']).to.equal(true);
    expect(factory['@implements']).to.deep.equal([ 'http://i.bixbyjs.org/consul/http', 'http://i.bixbyjs.org/IService' ]);
    expect(factory['@name']).to.equal('consul-http');
    expect(factory['@port']).to.equal(8500);
    expect(factory['@protocol']).to.equal('tcp');
  });
  
});
