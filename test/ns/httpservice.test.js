var $require = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var factory = require('../../app/ns/httpservice');
var Client = require('../../lib/cataloghttpclient');
var consul = require('consul');
var fs = require('fs');


describe('ns/httpservice', function() {
  
  it('should export factory function', function() {
    expect(factory).to.be.a('function');
  });
  
  it('should be annotated', function() {
    expect(factory['@singleton']).to.equal(true);
    expect(factory['@implements']).to.deep.equal([ 'http://i.bixbyjs.org/IService', 'http://i.bixbyjs.org/ns/INameService' ]);
    expect(factory['@name']).to.equal('consul-catalog-http');
    expect(factory['@port']).to.equal(8500);
    expect(factory['@protocol']).to.equal('tcp');
  });
  
  describe('CatalogHTTPResolver', function() {
    var _client = sinon.createStubInstance(consul);
    
    
    describe('#resolve', function() {
      var client = new Client(_client);
      
      it('should resolve A record of node', function(done) {
        _client.catalog = {};
        _client.catalog.node = {};
        _client.catalog.node.services = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/node/node1.json', 'utf8')));
        
        client.resolve('node1.node.consul', 'A', function(err, addresses) {
          expect(_client.catalog.node.services.getCall(0).args[0]).to.deep.equal({ node: 'node1' });
          
          expect(err).to.be.null;
          expect(addresses).to.deep.equal([
            '127.0.0.1'
          ]);
          done();
        });
      }); // should resolve A record of node
      
      it('should resolve A record of node in datacenter', function(done) {
        _client.catalog = {};
        _client.catalog.node = {};
        _client.catalog.node.services = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/node/node1.json', 'utf8')));
        
        client.resolve('node1.node.dc1.consul', 'A', function(err, addresses) {
          expect(_client.catalog.node.services.getCall(0).args[0]).to.deep.equal({ node: 'node1', dc: 'dc1' });
          
          expect(err).to.be.null;
          expect(addresses).to.deep.equal([
            '127.0.0.1'
          ]);
          done();
        });
      }); // should resolve A record of node in datacenter
      
      it('should resolve A record of external node', function(done) {
        _client.catalog = {};
        _client.catalog.node = {};
        _client.catalog.node.services = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/node/hashicorp.json', 'utf8')));
        
        client.resolve('hashicorp.node.consul', 'A', function(err, addresses) {
          expect(_client.catalog.node.services.getCall(0).args[0]).to.deep.equal({ node: 'hashicorp' });
          
          expect(err).to.be.null;
          expect(addresses).to.deep.equal([]);
          done();
        });
      }); // should resolve A record of external node
      
      it('should resolve CNAME record of external node', function(done) {
        _client.catalog = {};
        _client.catalog.node = {};
        _client.catalog.node.services = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/node/hashicorp.json', 'utf8')));
        
        client.resolve('hashicorp.node.consul', 'CNAME', function(err, addresses) {
          expect(_client.catalog.node.services.getCall(0).args[0]).to.deep.equal({ node: 'hashicorp' });
          
          expect(err).to.be.null;
          expect(addresses).to.deep.equal(['learn.hashicorp.com/consul/']);
          done();
        });
      }); // should resolve CNAME record of external node
      
      it('should resolve SRV record of service', function(done) {
        _client.catalog = {};
        _client.catalog.service = {};
        _client.catalog.service.nodes = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/service/beep.json', 'utf8')));
        
        client.resolve('beep.consul', 'SRV', function(err, addresses) {
          expect(_client.catalog.service.nodes.getCall(0).args[0]).to.equal('beep');
          
          expect(err).to.be.null;
          expect(addresses).to.deep.equal([
            { name: 'node1.node.dc1.consul', port: 833 }
          ]);
          done();
        });
      }); // should resolve SRV record of service
      
      it('should resolve SRV record of external service', function(done) {
        _client.catalog = {};
        _client.catalog.service = {};
        _client.catalog.service.nodes = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/service/learn.json', 'utf8')));
        
        client.resolve('learn.consul', 'SRV', function(err, addresses) {
          expect(_client.catalog.service.nodes.getCall(0).args[0]).to.equal('learn');
          
          expect(err).to.be.null;
          expect(addresses).to.deep.equal([
            { name: 'hashicorp.node.dc1.consul', port: 80 }
          ]);
          done();
        });
      }); // should resolve SRV record of external service
      
    }); // #resolve
    
  });
  
});
