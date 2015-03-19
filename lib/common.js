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

Common.crc = function (data) {
    var _m = 0;
    var _p = 0;
    var _r = data[0];
    for (var i = 1; i <= data.length - 1; i++) {
        var _d = data[i];
        _r = (_r << 8) | _d;
        _p = 0x0107 << 7;
        _m = 0x8000;
        while (_m != 0x0080) {
            if ((_r & _m) != 0) {
                _r ^= _p
            }
            _p = (_p & 0x0000ffff) >> 1;
            _m = (_m & 0x0000ffff) >> 1;
        }
    }
    return _r;
};

module.exports = Object.freeze(Common);