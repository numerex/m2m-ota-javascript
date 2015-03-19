var expect = require('./test').expect;
var Message = require('../lib/message');

describe('Message',function() {

    it('should create a valid default header',function(){
        var message = new Message();
        var header = message.header().buffer();
        header.length.should.equal(13);
        header[0].should.equal(0);
        header[1].should.equal(0x10);
        header[2].should.equal(0);
        header[3].should.equal(0);
        header[4].should.equal(0);
        // don't test 5-12 because it is the current timestamp
    });

    it('should create a valid header given attributes',function(){
        var message = new Message({messageType: 8,eventCode: 10,sequenceNumber: 1,timestamp: 0x1234567890});
        var header = message.header().buffer();
        header.should.eql(new Buffer([8,0x10,10,0,1,0,0,0,0x12,0x34,0x56,0x78,0x90]));
    });

    it('should create a valid message with a single byte',function(){
        var message = new Message({timestamp: 0});
        message.pushByte(0x80,0xAA);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,0x80,0,0xAA,0]));
    });

    it('should create a valid message with a single integer',function(){
        var message = new Message({timestamp: 0});
        message.pushInt(0x81,0xAABB);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,0x81,1,0xAA,0xBB,0]));
    });

    it('should create a valid message with a single empty string',function(){
        var message = new Message({timestamp: 0});
        message.pushString(0x82,'');
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,0x82,2,0,0,0]));
    });

    it('should create a valid message with a single simple string',function(){
        var message = new Message({timestamp: 0});
        message.pushString(0x83,'abc');
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,0x83,2,0,3,0x61,0x62,0x63,0]));
    });

    it('should create a valid message with a single timestamp',function(){
        var message = new Message({timestamp: 0});
        message.pushTimestamp(0x84,0x1234567890);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,0x84,4,0,0,0,0x12,0x34,0x56,0x78,0x90,0]));
    });

    it('should create a valid message with one of each type of object',function(){
        var message = new Message({timestamp: 0});
        message.pushByte(0x80,0xAA);
        message.pushInt(0x81,0xAABB);
        message.pushString(0x83,'abc');
        message.pushTimestamp(0x84,0x1234567890);
        message.toWire().should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,
            0x80,0,0xAA,
            0x81,1,0xAA,0xBB,
            0x83,2,0,3,0x61,0x62,0x63,
            0x84,4,0,0,0,0x12,0x34,0x56,0x78,0x90,
            82]));
    });

    it('should thrown an error with an empty tuple',function(){
        var message = new Message({timestamp: 0});
        message.pushTuple(null);
        expect(function(){ message.toWire(); }).to.throw('unknown object type - null');
    });

    it('should throw an error for an empty buffer',function(){
        var buffer = new Buffer('');
        expect(function(){ new Message({data: buffer}) }).to.throw('abnormal termination - id expected');
    });

    it('should throw an error for an incomplete header',function(){
        var buffer = new Buffer([0]);
        expect(function(){ new Message({data: buffer}) }).to.throw('abnormal termination - id expected');
    });

    it('should throw an error for an invalid CRC',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
        expect(function(){ new Message({data: buffer}) }).to.throw('CRC found: 1 - CRC expected: 0');
    });

    it('should throw an error for an unknown object type',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0xFF,243]);
        expect(function(){ new Message({data: buffer}) }).to.throw('unknown object type - 255');
    });

    it('should extract a message with no objects from a buffer',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        var message = new Message({data: buffer});
        message.messageType.should.equal(0);
        message.eventCode.should.equal(0);
        message.majorVersion.should.equal(0);
        message.minorVersion.should.equal(0);
        message.sequenceNumber.should.equal(0);
        message.timestamp.should.equal(0);
        message.objects.should.eql([]);
    });

    it('should extract a message with one of each type of object from a buffer',function(){
        var buffer = new Buffer([1,0x10,2,3,4,0,0,0,0x12,0x34,0x56,0x78,0x90,
            0x80,0,0xAA,
            0x81,1,0xAA,0xBB,
            0x83,2,0,3,0x61,0x62,0x63,
            0x84,4,0,0,0,0x12,0x34,0x56,0x78,0x90,
            44]);
        var message = new Message({data: buffer});
        message.messageType.should.equal(1);
        message.majorVersion.should.equal(1);
        message.minorVersion.should.equal(0);
        message.eventCode.should.equal(2);
        message.sequenceNumber.should.equal(256*3 + 4);
        message.timestamp.should.equal(0x1234567890);
        message.objects.should.eql([
            {id: 0x80,type: 0,value: 0xAA},
            {id: 0x81,type: 1,value: 0xAABB},
            {id: 0x83,type: 2,value: 'abc'},
            {id: 0x84,type: 4,value: 0x1234567890}
        ]);
    });
});