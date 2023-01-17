var Updater = require('../lib/httpupdater');
var expect = require('chai').expect;
var sinon = require('sinon');
var consul = require('consul');
var fs = require('fs');


describe('HTTPUpdater', function() {
  var _client = sinon.createStubInstance(consul);
  
  describe('#register', function() {
    var client = new Updater(_client);
    
    it.skip('should register record', function(done) {
      _client.agent = {};
      _client.agent.service = {};
      _client.agent.service.register = sinon.stub().yieldsAsync(null);
      
      var rr = {
        name: 'example.local'
      };
      client.register('hashicorp.node.dc1.consul', 'SRV', rr, function(err) {
        expect(_client.agent.service.register.getCall(0).args[0]).to.deep.equal({
          name: 'boop',
          address: 'example.local',
          port: 800
        });
        
        expect(err).to.be.null;
        done();
      });
    }); // should resolve CNAME record of external node in datacenter
  });
  
  describe('#deregister', function() {
    var client = new Updater(_client);
  
    it('should deregister record', function(done) {
      _client.agent = {};
      _client.agent.service = {};
      _client.agent.service.deregister = sinon.stub().yieldsAsync(null);
      
      var rr = {
        id: '53d58496-de1a-407a-9279-19ff653fdc9e'
      };
      client.deregister('hashicorp.node.dc1.consul', 'SRV', rr, function(err) {
        expect(_client.agent.service.deregister.getCall(0).args[0]).to.deep.equal('53d58496-de1a-407a-9279-19ff653fdc9e');
        
        expect(err).to.be.null;
        done();
      });
    }); // should resolve CNAME record of external node in datacenter
  
  });
});


