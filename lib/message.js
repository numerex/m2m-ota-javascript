var Common = require('./common');
var BufferPut = require('bufferput');
var Binary = require('binary');

function Message(attributes) {
    if (!attributes) attributes = {};

    if (attributes.data)
        this.fromWire(attributes.data);
    else {
        this.messageType     = attributes.messageType || 0;
        this.majorVersion     = Common.MAJOR_VERSION;
        this.minorVersion     = Common.MINOR_VERSION;
        this.eventCode        = attributes.eventCode || 0;
        this.sequenceNumber   = attributes.sequenceNumber || 0;
        this.timestamp        = attributes.timestamp === undefined ? (new Date()).valueOf() : attributes.timestamp;
        this.objects          = [];
    }
}

Message.prototype.header = function() {
    return new BufferPut()
        .word8(this.messageType)
        .word8((this.majorVersion << 4) | this.minorVersion)
        .word8(this.eventCode)
        .word16be(this.sequenceNumber)
        .word64be(this.timestamp);
};

Message.prototype.pushTuple = function(type,id,value){
    this.objects.push({type: type,id: id,value: value});
    return this;
};

Message.prototype.pushByte = function(id,value){
    this.pushTuple(Common.OBJTYPE_BYTE,id,value);
    return this;
};

Message.prototype.pushInt = function(id,value){
    this.pushTuple(Common.OBJTYPE_INT,id,value);
    return this;
};

Message.prototype.pushString = function(id,value){
    value = value.toString();
    this.pushTuple(Common.OBJTYPE_STRING,id,value);
    return this;
};

Message.prototype.pushTimestamp = function(id,value){
    this.pushTuple(Common.OBJTYPE_TIMESTAMP,id,value);
    return this;
};

Message.prototype.fromWire = function(buffer) {
    var crcFound = buffer[buffer.length - 1];
    buffer[buffer.length - 1] = 0;
    var crcExpected = Common.crc(buffer);
    if (crcFound !== crcExpected) throw(new Error('CRC found: ' + crcFound + ' - CRC expected: ' + crcExpected));

    var binary = Binary.parse(buffer)
        .word8('messageType')
        .word8('version')
        .word8('eventCode')
        .word16be('sequenceNumber')
        .word64be('timestamp');

    var vars = binary.vars;
    this.majorVersion = vars.version >> 4;
    this.minorVersion = vars.version & 0xF;
    delete vars.version;
    for (var field in vars)
        this[field] = vars[field];

    this.objects = [];
    var objects = this.objects;
    binary.loop(function(end,vars){
        binary.word8('id');
        if (binary.eof()) {
            if (vars.id !== 0)
                throw(new Error('abnormal termination - id expected'));
            else
                end();
        } else {
            binary.word8('type');
            switch(vars.type){
                case Common.OBJTYPE_BYTE:
                    binary.word8('value');
                    break;
                case Common.OBJTYPE_INT:
                    binary.word16be('value');
                    break;
                case Common.OBJTYPE_STRING:
                    binary.word16be('length');
                    binary.buffer('value',vars.length);
                    vars.value = vars.value.toString();
                    break;
                case Common.OBJTYPE_TIMESTAMP:
                    binary.word64be('value');
                    break;
                default:
                    throw new Error('unknown object type - ' + vars.type);
            }
            objects.push({type: vars.type,id: vars.id,value: vars.value});
        }
    });
    return this;
};

Message.prototype.toWire = function(noCRC){
    var putbuf = this.header();
    for (var index in this.objects) {
        var object = this.objects[index];
        putbuf = putbuf
            .word8(object.id)
            .word8(object.type);
        switch(object.type) {
            case Common.OBJTYPE_BYTE:
                putbuf = putbuf.word8(object.value);
                break;
            case Common.OBJTYPE_INT:
                putbuf = putbuf.word16be(object.value);
                break;
            case Common.OBJTYPE_STRING:
                putbuf = putbuf
                    .word16be(object.value.length)
                    .put(new Buffer(object.value));
                break;
            case Common.OBJTYPE_TIMESTAMP:
                putbuf = putbuf.word64be(object.value);
                break;
            default:
                throw new Error('unknown object type - ' + object.type);
        }
    }
    putbuf = putbuf.word8(0);

    var buffer = putbuf.buffer();
    if (!noCRC)
        buffer[buffer.length - 1] = Common.crc(buffer);

    return buffer;
};

module.exports = Message;