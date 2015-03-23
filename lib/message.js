var Common = require('./common');
var BufferPut = require('bufferput');
var Binary = require('binary');

function Message(attributes) {
    if (!attributes) attributes = {};

    if (attributes.buffer)
        this.fromWire(attributes.buffer);
    else {
        this.messageType     = attributes.messageType || 0;
        this.majorVersion     = Common.MAJOR_VERSION;
        this.minorVersion     = Common.MINOR_VERSION;
        this.eventCode        = attributes.eventCode || 0;
        this.sequenceNumber   = attributes.sequenceNumber || 0;
        this.timestamp        = attributes.timestamp === undefined ? (new Date()).valueOf() : attributes.timestamp;
        this.tuples          = [];
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
    this.tuples.push({type: type,id: id,value: value});
    return this;
};

Message.prototype.pushByte = function(id,value){
    this.pushTuple(Common.OBJTYPE_BYTE,id,value);
    return this;
};

Message.prototype.pushUByte = function(id,value){
    this.pushTuple(Common.OBJTYPE_UBYTE,id,value);
    return this;
};

Message.prototype.pushInt = function(id,value){
    this.pushTuple(Common.OBJTYPE_INT,id,value);
    return this;
};

Message.prototype.pushUInt = function(id,value){
    this.pushTuple(Common.OBJTYPE_UINT,id,value);
    return this;
};

Message.prototype.pushString = function(id,value){
    value = value.toString();
    this.pushTuple(Common.OBJTYPE_STRING,id,value);
    return this;
};

Message.prototype.pushFloat = function(id,value){
    this.pushTuple(Common.OBJTYPE_FLOAT,id,value);
    return this;
};

Message.prototype.pushDouble = function(id,value){
    this.pushTuple(Common.OBJTYPE_DOUBLE,id,value);
    return this;
};

Message.prototype.pushTimestamp = function(id,value){
    this.pushTuple(Common.OBJTYPE_TIMESTAMP,id,value);
    return this;
};

Message.prototype.pushByteArray = function(id,value){
    this.pushTuple(Common.OBJTYPE_ARRAY_BYTE,id,value);
    return this;
};

Message.prototype.pushUByteArray = function(id,value){
    this.pushTuple(Common.OBJTYPE_ARRAY_UBYTE,id,value);
    return this;
};

Message.prototype.pushIntArray = function(id,value){
    this.pushTuple(Common.OBJTYPE_ARRAY_INT,id,value);
    return this;
};

Message.prototype.pushUIntArray = function(id,value){
    this.pushTuple(Common.OBJTYPE_ARRAY_UINT,id,value);
    return this;
};

Message.prototype.pushFloatArray = function(id,value){
    this.pushTuple(Common.OBJTYPE_ARRAY_FLOAT,id,value);
    return this;
};

Message.prototype.pushDoubleArray = function(id,value){
    this.pushTuple(Common.OBJTYPE_ARRAY_DOUBLE,id,value);
    return this;
};

Message.prototype.fromWire = function(buffer) {
    var crcFound = buffer[buffer.length - 1];
    buffer[buffer.length - 1] = 0;
    var crcExpected = Common.crc(buffer);
    if (crcFound !== crcExpected) throw(new Error('CRC found: ' + crcFound + ' - CRC expected: ' + crcExpected));
    if (buffer.length < Common.SIZE_OF_HEADER) throw(new Error('incomplete header found'));

    var binary = Binary.parse(buffer)
        .word8('messageType')
        .word8('version')
        .word8('eventCode')
        .word16be('sequenceNumber')
        .word64be('timestamp')
        .word8('tupleCount');

    var vars = binary.vars;
    var tupleCount = vars.tupleCount;
    delete vars.tupleCount;
    
    this.majorVersion = vars.version >> 4;
    this.minorVersion = vars.version & 0xF;
    delete vars.version;
    
    for (var field in vars)
        this[field] = vars[field];

    this.tuples = [];
    var tuples = this.tuples;
    while (tupleCount-- > 0) {
        binary.word8('id');
        binary.word8('type');
        var signed = false;
        switch(vars.type){
            case Common.OBJTYPE_BYTE:
                signed = true;
            case Common.OBJTYPE_UBYTE:
                binary.word8('value');
                if (signed && vars.value >= 0x80) vars.value += -(0xFF + 1);
                break;
            case Common.OBJTYPE_INT:
                signed = true;
            case Common.OBJTYPE_UINT:
                binary.word8('size');
                if (vars.size !== Common.SIZE_OF_INT) throw(new Error('only 2-byte ints currently supported'));
                binary.word16be('value');
                if (signed && vars.value >= 0x8000) vars.value += -(0xFFFF + 1);
                break;
            case Common.OBJTYPE_STRING:
                binary.word16be('length');
                binary.buffer('value',vars.length);
                vars.value = vars.value.toString();
                if (vars.length !== vars.value.length) throw(new Error('string length expected: ' + vars.length + ' but found: ' + vars.value.length));
                break;
            case Common.OBJTYPE_FLOAT:
                binary.buffer('value',Common.SIZE_OF_FLOAT);
                vars.value = vars.value.readFloatBE(0);
                break;
            case Common.OBJTYPE_DOUBLE:
                binary.buffer('value',Common.SIZE_OF_DOUBLE);
                vars.value = vars.value.readDoubleBE(0);
                break;
            case Common.OBJTYPE_TIMESTAMP:
                binary.word64be('value');
                break;
            case Common.OBJTYPE_ARRAY_BYTE:
            case Common.OBJTYPE_ARRAY_UBYTE:
                binary.word16be('length');
                binary.buffer('value',vars.length);
                if (vars.length !== vars.value.length) throw(new Error('byte array length expected: ' + vars.length + ' but found: ' + vars.value.length));
                break;
            case Common.OBJTYPE_ARRAY_INT:
                signed = true;
            case Common.OBJTYPE_ARRAY_UINT:
                binary.word16be('length');
                binary.word8('size');
                if (vars.size !== Common.SIZE_OF_INT) throw(new Error('only 2-byte ints currently supported'));
                vars.length /= Common.SIZE_OF_INT;
                vars.value = [];
                for (var intIdx = 0; intIdx < vars.length; intIdx++) {
                    binary.word16be('element');
                    if (vars.element !== null) {
                        if (signed && vars.element >= 0x8000) vars.element += -(0xFFFF + 1);
                        vars.value.push(vars.element);
                    }
                }
                if (vars.length !== vars.value.length) throw(new Error('int array length expected: ' + vars.length + ' but found: ' + vars.value.length));
                break;
            case Common.OBJTYPE_ARRAY_FLOAT:
                binary.word16be('length');
                binary.word8('size');
                if (vars.size !== Common.SIZE_OF_FLOAT) throw(new Error('only 4-byte floats currently supported'));
                vars.length /= Common.SIZE_OF_FLOAT;
                vars.value = [];
                for (var floatIdx = 0; floatIdx < vars.length; floatIdx++) {
                    binary.buffer('element',Common.SIZE_OF_FLOAT);
                    if (vars.element !== null && vars.element.length === Common.SIZE_OF_FLOAT)
                        vars.value.push(vars.element.readFloatBE(0));
                }
                if (vars.length !== vars.value.length) throw(new Error('float array length expected: ' + vars.length + ' but found: ' + vars.value.length));
                break;
            case Common.OBJTYPE_ARRAY_DOUBLE:
                binary.word16be('length');
                binary.word8('size');
                if (vars.size !== Common.SIZE_OF_DOUBLE) throw(new Error('only 8-byte doubles currently supported'));
                vars.length /= Common.SIZE_OF_DOUBLE;
                vars.value = [];
                for (var doubleIdx = 0; doubleIdx < vars.length; doubleIdx++) {
                    binary.buffer('element',Common.SIZE_OF_DOUBLE);
                    if (vars.element !== null && vars.element.length === Common.SIZE_OF_DOUBLE)
                        vars.value.push(vars.element.readDoubleBE(0));
                }
                if (vars.length !== vars.value.length) throw(new Error('double array length expected: ' + vars.length + ' but found: ' + vars.value.length));
                break;
            default:
                throw new Error('unknown object type - ' + vars.type);
        }
        tuples.push({type: vars.type,id: vars.id,value: vars.value});
    }

    binary.word8('crc');
    if (vars.crc != crcFound && !binary.eof()) throw(new Error('unexpected bytes in the message'));

    return this;
};

Message.prototype.toWire = function(noCRC){
    var putbuf = this.header();
    putbuf.word8(this.tuples.length);
    for (var index in this.tuples) {
        var object = this.tuples[index];
        putbuf
            .word8(object.id)
            .word8(object.type);
        switch(object.type) {
            case Common.OBJTYPE_BYTE:
            case Common.OBJTYPE_UBYTE:
                putbuf.word8(object.value);
                break;
            case Common.OBJTYPE_INT:
            case Common.OBJTYPE_UINT:
                putbuf
                    .word8(Common.SIZE_OF_INT)
                    .word16be(object.value);
                break;
            case Common.OBJTYPE_STRING:
                putbuf
                    .word16be(object.value.length)
                    .put(new Buffer(object.value));
                break;
            case Common.OBJTYPE_FLOAT:
                putbuf.put(this._floatToBuffer(object.value));
                break;
            case Common.OBJTYPE_DOUBLE:
                putbuf.put(this._doubleToBuffer(object.value));
                break;
            case Common.OBJTYPE_TIMESTAMP:
                putbuf.word64be(object.value);
                break;
            case Common.OBJTYPE_ARRAY_BYTE:
            case Common.OBJTYPE_ARRAY_UBYTE:
                putbuf
                    .word16be(object.value.length)
                    .put(object.value);
                break;
            case Common.OBJTYPE_ARRAY_INT:
            case Common.OBJTYPE_ARRAY_UINT:
                putbuf
                    .word16be(object.value.length * Common.SIZE_OF_INT)
                    .word8(Common.SIZE_OF_INT);
                for (var intOfs = 0; intOfs < object.value.length; intOfs++)
                    putbuf.word16be(object.value[intOfs]);
                break;
            case Common.OBJTYPE_ARRAY_FLOAT:
                putbuf
                    .word16be(object.value.length * Common.SIZE_OF_FLOAT)
                    .word8(Common.SIZE_OF_FLOAT);
                for (var floatOfs = 0; floatOfs < object.value.length; floatOfs++)
                    putbuf.put(this._floatToBuffer(object.value[floatOfs]));
                break;
            case Common.OBJTYPE_ARRAY_DOUBLE:
                putbuf
                    .word16be(object.value.length * Common.SIZE_OF_DOUBLE)
                    .word8(Common.SIZE_OF_DOUBLE);
                for (var doubleOfs = 0; doubleOfs < object.value.length; doubleOfs++)
                    putbuf.put(this._doubleToBuffer(object.value[doubleOfs]));
                break;
            default:
                throw new Error('unknown object type - ' + object.type);
        }
    }
    putbuf.word8(0);

    var buffer = putbuf.buffer();
    if (buffer.length > Common.MAX_PACKET_SIZE) throw(new Error('message size too large: ' + buffer.length));
    if (!noCRC) buffer[buffer.length - 1] = Common.crc(buffer);

    return buffer;
};

Message.prototype._floatToBuffer = function(value){
    var buffer = new Buffer(Common.SIZE_OF_FLOAT);
    buffer.writeFloatBE(value,0);
    return buffer;
};

Message.prototype._doubleToBuffer = function(value){
    var buffer = new Buffer(Common.SIZE_OF_DOUBLE);
    buffer.writeDoubleBE(value,0);
    return buffer;
};

module.exports = Message;