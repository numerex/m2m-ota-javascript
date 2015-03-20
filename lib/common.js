var Common = {};

Common.MAJOR_VERSION           = 1;
Common.MINOR_VERSION           = 0;

Common.MOBILE_ORIGINATED_EVENT = 0xAA;
Common.MOBILE_ORIGINATED_ACK   = 0xBB;
Common.MOBILE_TERMINATED_EVENT = 0xCC;
Common.MOBILE_TERMINATED_ACK   = 0xDD;

Common.OBJTYPE_BYTE            = 0;
Common.OBJTYPE_INT             = 1;
Common.OBJTYPE_STRING          = 2;
Common.OBJTYPE_FLOAT           = 3;
Common.OBJTYPE_TIMESTAMP       = 4;
Common.OBJTYPE_ARRAY_BYTE      = 5;
Common.OBJTYPE_ARRAY_INT       = 6;
Common.OBJTYPE_ARRAY_FLOAT     = 7;

Common.MAX_PACKET_SIZE         = 1024;

Common.crc = function(data){
    var bitMask = 0;
    var poly = 0;
    var _register = data[0] & 0xFF;

    // NOTE - assume that the buffer includes space for the CRC and do NOT consider it in your calculation
    for (var i = 1; i < data.length - 1; i++)  {
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