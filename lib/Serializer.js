const assert = require('assert'),
      stream = require('stream'),
      util = require('util');

Serializer = function () {
    this.readable = true;
    this.writable = true;
};

util.inherits(Serializer, stream.Stream);

Serializer.prototype.write = function (token) {
    var string = null;
    switch (token.type) {
        case 'Boolean':
        case 'Identifier':
        case 'Keyword':
        case 'Null':
        case 'Numeric':
        case 'Punctuator':
        case 'String':
        case 'Whitespaces':
            string = token.value;
            break;
        case 'BlockComment':
            string = '/*' + token.value + '*/';
            break;
        case 'LineComment':
            string = '//' + token.value + '\n';
            break;
    }

    assert(string !== null, token.type);
    this.emit('data', string);
};

Serializer.prototype.end = function () {
    this.emit('end');
};

module.exports = Serializer;
