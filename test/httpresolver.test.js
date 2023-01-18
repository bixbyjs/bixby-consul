var Resolver = require('../lib/httpresolver');
var expect = require('chai').expect;
var sinon = require('sinon');
var consul = require('consul');
var fs = require('fs');


describe('HTTPResolver', function() {
  var _client = sinon.createStubInstance(consul);
  
  describe('#resolve', function() {
    var client = new Resolver(_client);
    
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
    
    it('should resolve CNAME record of external node in datacenter', function(done) {
      _client.catalog = {};
      _client.catalog.node = {};
      _client.catalog.node.services = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/node/hashicorp.json', 'utf8')));
      
      client.resolve('hashicorp.node.dc1.consul', 'CNAME', function(err, addresses) {
        expect(_client.catalog.node.services.getCall(0).args[0]).to.deep.equal({ node: 'hashicorp', dc: 'dc1' });
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal(['learn.hashicorp.com/consul/']);
        done();
      });
    }); // should resolve CNAME record of external node in datacenter
    
    it('should resolve SRV record of internal service', function(done) {
      _client.catalog = {};
      _client.catalog.service = {};
      _client.catalog.service.nodes = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/service/beep.json', 'utf8')));
      
      client.resolve('_beep._tcp.consul', 'SRV', function(err, addresses) {
        expect(_client.catalog.service.nodes).to.be.calledOnceWith('beep');
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal([
          { name: 'node1.node.dc1.consul', port: 833 }
        ]);
        done();
      });
    }); // should resolve SRV record of internal service
    
    it('should resolve SRV record of internal service with address', function(done) {
      _client.catalog = {};
      _client.catalog.service = {};
      _client.catalog.service.nodes = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/service/boop.json', 'utf8')));
      
      client.resolve('_boop._tcp.consul', 'SRV', function(err, addresses) {
        expect(_client.catalog.service.nodes).to.be.calledOnceWith('boop');
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal([
          { name: 'node1.test', port: 800 }
        ]);
        done();
      });
    }); // should resolve SRV record of internal service with address
    
    it('should resolve SRV record of internal service running on multiple ports with address', function(done) {
      _client.catalog = {};
      _client.catalog.service = {};
      _client.catalog.service.nodes = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/service/blip.json', 'utf8')));
      
      client.resolve('_boop._tcp.consul', 'SRV', function(err, addresses) {
        expect(_client.catalog.service.nodes).to.be.calledOnceWith('boop');
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal([
          { name: 'node1.test', port: 871 },
          { name: 'node1.test', port: 872 }
        ]);
        done();
      });
    }); // should resolve SRV record of internal service with address
    
    it('should resolve SRV record of external service', function(done) {
      _client.catalog = {};
      _client.catalog.service = {};
      _client.catalog.service.nodes = sinon.stub().yieldsAsync(null, JSON.parse(fs.readFileSync('test/data/http/v1/catalog/service/learn.json', 'utf8')));
      
      client.resolve('_learn._tcp.consul', 'SRV', function(err, addresses) {
        expect(_client.catalog.service.nodes.getCall(0).args[0]).to.equal('learn');
        
        expect(err).to.be.null;
        expect(addresses).to.deep.equal([
          { name: 'hashicorp.node.dc1.consul', port: 80 }
        ]);
        done();
      });
    }); // should resolve SRV record of external service
    
  });
  
});
