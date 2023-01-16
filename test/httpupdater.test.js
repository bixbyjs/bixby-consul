var Updater = require('../lib/httpupdater');
var expect = require('chai').expect;
var sinon = require('sinon');
var consul = require('consul');
var fs = require('fs');


describe('HTTPUpdater', function() {
  var _client = sinon.createStubInstance(consul);
  
  describe('#deregister', function() {
    var client = new Updater(_client);
  
    it('should deregister record', function(done) {
      _client.agent = {};
      _client.agent.service = {};
      _client.agent.service.deregister = sinon.stub().yieldsAsync(null);
      
      var rr = {
        id: '1'
      };
      client.deregister('hashicorp.node.dc1.consul', 'SRV', rr, function(err) {
        expect(_client.agent.service.deregister.getCall(0).args[0]).to.deep.equal('1');
        
        expect(err).to.be.null;
        done();
      });
    }); // should resolve CNAME record of external node in datacenter
  
  });
});


