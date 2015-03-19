var expect = require('./test').expect;
var root = require('../index');

describe('root',function(){

    it('should export Common class',function(){
        expect(root.Common).to.be.eql(require('../lib/common'));
    });

    it('should export Message class',function(){
        expect(root.Message).to.be.eql(require('../lib/message'));
    });

});