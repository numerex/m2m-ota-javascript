var Common = require('../lib/common');

describe('Common',function(){

    it('should have frozen constants',function(){
        Common.MAJOR_VERSION.should.equal(1);
        Common.MINOR_VERSION.should.equal(0);
        Common.MAJOR_VERSION = 2;
        Common.MINOR_VERSION = 3;
        Common.MAJOR_VERSION.should.equal(1);
        Common.MINOR_VERSION.should.equal(0);
    });

    it('should provide a CRC function',function(){
        var array = [0xaa,0x01,0x05,0x10,0x4c,0x00,0x00,0x01,0x4c,0x33,0xcb,0xf5,0xb8,0x01,0x00,0x02,0x00,0x0f,0x33,0x35,0x35,0x33,0x30,0x36,0x30,0x34,0x30,0x30,0x34,0x31,0x36,0x32,0x38,0];
        Common.crc(array).should.equal(0xae);
        Common.crc(array,array.length - 1).should.equal(0xae);
    });

});