var fs = require('fs');

var package = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));
var version = package.version.split('.');

var Common = {};

Common.MAJOR_VERSION            = +version[0];
Common.MINOR_VERSION            = +version[1];

Common.MOBILE_ORIGINATED_EVENT  = 0xAA;
Common.MOBILE_ORIGINATED_ACK    = 0xBB;
Common.MOBILE_TERMINATED_EVENT  = 0xCC;
Common.MOBILE_TERMINATED_ACK    = 0xDD;

Common.OBJTYPE_BYTE             = 0;
Common.OBJTYPE_INT              = 1;
Common.OBJTYPE_STRING           = 2;
Common.OBJTYPE_FLOAT            = 3;
Common.OBJTYPE_TIMESTAMP        = 4;
Common.OBJTYPE_ARRAY_BYTE       = 5;
Common.OBJTYPE_ARRAY_INT        = 6;
Common.OBJTYPE_ARRAY_FLOAT      = 7;
Common.OBJTYPE_MIME             = 8;
Common.OBJTYPE_UBYTE            = 9;
Common.OBJTYPE_UINT             = 10;
Common.OBJTYPE_ARRAY_UBYTE      = 11;
Common.OBJTYPE_ARRAY_UINT       = 12;
Common.OBJTYPE_DOUBLE           = 13;
Common.OBJTYPE_ARRAY_DOUBLE     = 14;

Common.SIZE_OF_INT              = 2;
Common.SIZE_OF_FLOAT            = 4;
Common.SIZE_OF_DOUBLE           = 8;
Common.SIZE_OF_HEADER           = 13;

Common.MAX_PACKET_SIZE          = 1024;

Common.isAck = function(messageType){
    return messageType === Common.MOBILE_ORIGINATED_ACK || messageType === Common.MOBILE_TERMINATED_ACK;
};

Common.isEvent = function(messageType){
    return messageType === Common.MOBILE_ORIGINATED_EVENT || messageType === Common.MOBILE_TERMINATED_EVENT;
};

Common.crc = function(data,length){
    var bitMask = 0;
    var poly = 0;
    var _register = data[0] & 0xFF;

    // NOTE - assume that the buffer includes space for the CRC and do NOT consider it in your calculation
    if (length === undefined) length = data.length - 1;

    for (var i = 1; i < length; i++)  {
        _register = ((_register << 8) | (data[i] & 0xFF));
        poly = (0x0107 << 7) & 0xFFFF;
        bitMask = 0x8000;

        while (bitMask != 0x0080)  {
            if ((_register & bitMask) != 0)
                _register = (_register ^ poly) & 0xFFFF;
            poly = (poly & 0xffff) >>> 1;
            bitMask = (bitMask & 0xffff) >>> 1;
        }
    }
    return _register & 0xFF;
};

module.exports = Object.freeze(Common);