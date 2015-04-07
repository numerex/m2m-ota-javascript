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

    it('should create a valid message with a single signed byte',function(){
        var message = new Message({timestamp: 0});
        message.pushByte(0x80,0xAA);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x80,0,0xAA,0]));
    });

    it('should create a valid message with a single unsigned byte',function(){
        var message = new Message({timestamp: 0});
        message.pushUByte(0x70,0xAA);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x70,9,0xAA,0]));
    });

    it('should create a valid message with a single signed integer',function(){
        var message = new Message({timestamp: 0});
        message.pushInt(0x81,0xAABB);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x81,1,2,0xAA,0xBB,0]));
    });

    it('should create a valid message with a single unsigned integer',function(){
        var message = new Message({timestamp: 0});
        message.pushUInt(0x71,0xAABB);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x71,10,2,0xAA,0xBB,0]));
    });

    it('should create a valid message with a single empty string',function(){
        var message = new Message({timestamp: 0});
        message.pushString(0x82,'');
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x82,2,0,0,0]));
    });

    it('should create a valid message with a single simple string',function(){
        var message = new Message({timestamp: 0});
        message.pushString(0x83,'abc');
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x83,2,0,3,0x61,0x62,0x63,0]));
    });

    it('should create a valid message with a single float',function(){
        var message = new Message({timestamp: 0});
        message.pushFloat(0x90,10.5);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x90,3,65,40,0,0,0]));
    });

    it('should create a valid message with a single double',function(){
        var message = new Message({timestamp: 0});
        message.pushDouble(0xA0,10.5);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0xA0,13,64,37,0,0,0,0,0,0,0]));
    });

    it('should create a valid message with a single timestamp',function(){
        var message = new Message({timestamp: 0});
        message.pushTimestamp(0x84,0x1234567890);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x84,4,0,0,0,0x12,0x34,0x56,0x78,0x90,0]));
    });

    it('should create a valid message with a single empty signed byte array',function(){
        var message = new Message({timestamp: 0});
        message.pushByteArray(0x85,new Buffer([]));
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x85,5,0,0,0]));
    });

    it('should create a valid message with a single empty unsigned byte array',function(){
        var message = new Message({timestamp: 0});
        message.pushUByteArray(0x75,new Buffer([]));
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x75,11,0,0,0]));
    });

    it('should create a valid message with a single simple signed byte array',function(){
        var message = new Message({timestamp: 0});
        message.pushByteArray(0x86,new Buffer([1,2,3]));
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x86,5,0,3,1,2,3,0]));
    });

    it('should create a valid message with a single simple unsigned byte array',function(){
        var message = new Message({timestamp: 0});
        message.pushUByteArray(0x76,new Buffer([1,2,3]));
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x76,11,0,3,1,2,3,0]));
    });

    it('should create a valid message with a single empty signed int array',function(){
        var message = new Message({timestamp: 0});
        message.pushIntArray(0x87,[]);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x87,6,0,0,2,0]));
    });

    it('should create a valid message with a single empty unsigned int array',function(){
        var message = new Message({timestamp: 0});
        message.pushUIntArray(0x77,[]);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x77,12,0,0,2,0]));
    });

    it('should create a valid message with a single simple signed int array',function(){
        var message = new Message({timestamp: 0});
        message.pushIntArray(0x88,[1,2,3]);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x88,6,0,6,2,0,1,0,2,0,3,0]));
    });

    it('should create a valid message with a single simple unsigned int array',function(){
        var message = new Message({timestamp: 0});
        message.pushUIntArray(0x78,[1,-2,3]);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x78,12,0,6,2,0,1,0xFF,0xFE,0,3,0]));
    });

    it('should create a valid message with a single empty float array',function(){
        var message = new Message({timestamp: 0});
        message.pushFloatArray(0x91,[]);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x91,7,0,0,4,0]));
    });

    it('should create a valid message with a single empty double array',function(){
        var message = new Message({timestamp: 0});
        message.pushDoubleArray(0xA1,[]);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0xA1,14,0,0,8,0]));
    });

    it('should create a valid message with a single simple float array',function(){
        var message = new Message({timestamp: 0});
        message.pushFloatArray(0x92,[1.0,2.0,3.0]);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0x92,7,0,12,4,
            0x3F,0x80,0,0,
            0x40,0,0,0,
            0x40,0x40,0,0,
            0]));
    });

    it('should create a valid message with a single simple double array',function(){
        var message = new Message({timestamp: 0});
        message.pushDoubleArray(0xA2,[1.0,2.0,3.0]);
        message.toWire(true).should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0xA2,14,0,24,8,
            63,240,0,0,0,0,0,0,
            64,0,0,0,0,0,0,0,
            64,8,0,0,0,0,0,0,
            0]));
    });

    it('should create a valid message with one of each type of object',function(){
        var message = new Message({timestamp: 0});
        message.pushByte(0x80,0xAA);
        message.pushUByte(0x70,0xAA);
        message.pushInt(0x81,0xAABB);
        message.pushUInt(0x71,0xAABB);
        message.pushString(0x83,'abc');
        message.pushFloat(0x90,10.5);
        message.pushDouble(0xA0,10.5);
        message.pushTimestamp(0x84,0x1234567890);
        message.pushByteArray(0x86,new Buffer([1,2,3]));
        message.pushUByteArray(0x76,new Buffer([1,2,3]));
        message.pushIntArray(0x88,[1,-2,3]);
        message.pushUIntArray(0x78,[1,-2,3]);
        message.pushFloatArray(0x92,[1.0,2.0,3.0]);
        message.pushDoubleArray(0xA2,[1.0,2.0,3.0]);
        message.toWire().should.eql(new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,14,
            0x80,0,0xAA,
            0x70,9,0xAA,
            0x81,1,2,0xAA,0xBB,
            0x71,10,2,0xAA,0xBB,
            0x83,2,0,3,0x61,0x62,0x63,
            0x90,3,65,40,0,0,
            0xA0,13,64,37,0,0,0,0,0,0,
            0x84,4,0,0,0,0x12,0x34,0x56,0x78,0x90,
            0x86,5,0,3,1,2,3,
            0x76,11,0,3,1,2,3,
            0x88,6,0,6,2,0,1,0xFF,0xFE,0,3,
            0x78,12,0,6,2,0,1,0xFF,0xFE,0,3,
            0x92,7,0,12,4,0x3F,0x80,0,0,0x40,0,0,0,0x40,0x40,0,0,
            0xA2,14,0,24,8,63,240,0,0,0,0,0,0,64,0,0,0,0,0,0,0,64,8,0,0,0,0,0,0,
            209]));
    });

    it('should thrown an error with an empty tuple',function(){
        var message = new Message({timestamp: 0});
        message.pushTuple(null);
        expect(function(){ message.toWire(); }).to.throw('unknown object type - null');
    });

    it('should throw an error if the message size is too large',function(){
        var message = new Message();
        for (var index = 0; index < 128; index++)
            message.pushDouble(index,index);
        expect(function(){ message.toWire(); }).to.throw('message size too large: 1295');
    });

    it('should throw an error for an empty buffer',function(){
        var buffer = new Buffer('');
        expect(function(){ new Message({buffer: buffer}) }).to.throw('CRC found: undefined - CRC expected: 0');
    });

    it('should throw an error for an incomplete header',function(){
        var buffer = new Buffer([0]);
        expect(function(){ new Message({buffer: buffer}) }).to.throw('incomplete header found');
    });

    it('should throw an error for an invalid CRC',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,1]);
        expect(function(){ new Message({buffer: buffer}) }).to.throw('CRC found: 1 - CRC expected: 0');
    });

    it('should throw an error for an unknown object type',function(){
        var buffer = new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,1,0,0xFF,144]);
        expect(function(){ new Message({buffer: buffer}) }).to.throw('unknown object type - 255');
    });

    it('should throw an error for extra bytes after the fields and before the CRC',function(){
        var buffer = new Buffer([0,0x10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,122]);
        expect(function(){ new Message({buffer: buffer}) }).to.throw('unexpected bytes in the message');
    });

    it('should extract a message with no tuples from a buffer',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        var message = new Message({buffer: buffer});
        message.messageType.should.equal(0);
        message.eventCode.should.equal(0);
        message.majorVersion.should.equal(0);
        message.minorVersion.should.equal(0);
        message.sequenceNumber.should.equal(0);
        message.timestamp.should.equal(0);
        message.tuples.should.eql([]);
    });

    it('should throw an error if string length and content do not match',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,2,0,3,63]);
        expect(function(){ new Message({buffer: buffer}) }).to.throw('string length expected: 3 but found: 1');
    });

    it('should throw an error if byte array length and content do not match',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,5,0,3,84]);
        expect(function(){ new Message({buffer: buffer}) }).to.throw('byte array length expected: 3 but found: 1');
    });

    it('should throw an error if int size is not 2',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,4,0,0,0,0,229]);
        expect(function(){ new Message({buffer: buffer}) }).to.throw('only 2-byte ints currently supported');
    });

    it('should throw an error if int array size is not 2',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,6,0,4,4,0,0,0,0,98]);
        expect(function(){ new Message({buffer: buffer}) }).to.throw('only 2-byte ints currently supported');
    });

    it('should throw an error if int array length and content do not match',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,6,0,6,2,0,0,195]);
        expect(function(){ new Message({buffer: buffer}) }).to.throw('int array length expected: 3 but found: 1');
    });

    it('should throw an error if float array size is not 4',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,7,0,4,2,0,0,119]);
        expect(function(){ new Message({buffer: buffer}) }).to.throw('only 4-byte floats currently supported');
    });

    it('should throw an error if double array size is not 8',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,14,0,4,2,0,0,12]);
        expect(function(){ new Message({buffer: buffer}) }).to.throw('only 8-byte doubles currently supported');
    });

    it('should throw an error if float array length and content do not match',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,7,0,12,4,0,0,0,0,164]);
        expect(function(){ new Message({buffer: buffer}) }).to.throw('float array length expected: 3 but found: 1');
    });

    it('should throw an error if double array length and content do not match',function(){
        var buffer = new Buffer([0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,14,0,24,8,0,0,0,0,0,0,0,0,242]);
        expect(function(){ new Message({buffer: buffer}) }).to.throw('double array length expected: 3 but found: 1');
    });

    it('should extract a message with one of each type of object from a buffer',function(){
        var buffer = new Buffer([1,0x10,2,3,4,0,0,0,0x12,0x34,0x56,0x78,0x90,14,
            0x80,0,0xAA,
            0x70,9,0xAA,
            0x81,1,2,0xAA,0xBB,
            0x71,10,2,0xAA,0xBB,
            0x83,2,0,3,0x61,0x62,0x63,
            0x90,3,65,40,0,0,
            0xA0,13,64,37,0,0,0,0,0,0,
            0x84,4,0,0,0,0x12,0x34,0x56,0x78,0x90,
            0x86,5,0,3,1,-2,3,
            0x76,11,0,3,1,2,3,
            0x88,6,0,6,2,0,1,0xFF,0xFE,0,3,
            0x78,12,0,6,2,0,1,0xFF,0xFE,0,3,
            0x92,7,0,12,4,0x3F,0x80,0,0,0x40,0,0,0,0x40,0x40,0,0,
            0xA2,14,0,24,8,63,240,0,0,0,0,0,0,64,0,0,0,0,0,0,0,64,8,0,0,0,0,0,0,
            243]);
        var message = new Message({buffer: buffer});
        message.messageType.should.equal(1);
        message.majorVersion.should.equal(1);
        message.minorVersion.should.equal(0);
        message.eventCode.should.equal(2);
        message.sequenceNumber.should.equal(256*3 + 4);
        message.timestamp.should.equal(0x1234567890);
        message.tuples.should.eql([
            {id: 0x80,type: 0,value: -86},
            {id: 0x70,type: 9,value: 0xAA},
            {id: 0x81,type: 1,value: -21829},
            {id: 0x71,type: 10,value: 0xAABB},
            {id: 0x83,type: 2,value: 'abc'},
            {id: 0x90,type: 3,value: 10.5},
            {id: 0xA0,type: 13,value: 10.5},
            {id: 0x84,type: 4,value: 0x1234567890},
            {id: 0x86,type: 5,value: new Buffer([1,-2,3])},
            {id: 0x76,type: 11,value: new Buffer([1,2,3])},
            {id: 0x88,type: 6,value: [1,-2,3]},
            {id: 0x78,type: 12,value: [1,0xFFFE,3]},
            {id: 0x92,type: 7,value: [1.0,2.0,3.0]},
            {id: 0xA2,type: 14,value: [1.0,2.0,3.0]}
        ]);
    });
    
    it('should accept all attributes as input to the constructor',function(){
        var message = new Message({
            messageType: 1,
            majorVersion: 2,
            minorVersion: 3,
            eventCode: 4,
            sequenceNumber: 5,
            timestamp: 6,
            tuples: [{id: 7,type: 0,value: 8}]
        });
        message.messageType.should.equal(1);
        message.majorVersion.should.equal(2);
        message.minorVersion.should.equal(3);
        message.eventCode.should.equal(4);
        message.sequenceNumber.should.equal(5);
        message.timestamp.should.equal(6);
        message.tuples.should.eql([{id: 7,type: 0,value: 8}]);
    });

    it('should accept JSON as input',function(){
        var message = new Message({json: '{"messageType":1,"majorVersion":2,"minorVersion":3,"eventCode":4,"sequenceNumber":5,"timestamp":6,"tuples":[{"id":7,"type":0,"value":8}]}'});
        message.messageType.should.equal(1);
        message.majorVersion.should.equal(2);
        message.minorVersion.should.equal(3);
        message.eventCode.should.equal(4);
        message.sequenceNumber.should.equal(5);
        message.timestamp.should.equal(6);
        message.tuples.should.eql([{id: 7,type: 0,value: 8}]);
    });
});