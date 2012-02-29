const stream = require('stream'),
      util = require('util');

Pipe = function () {
};

util.inherits(Pipe, stream.Stream);

Pipe.prototype.write = function (token) {
    this.emit('data', token);
};

Pipe.prototype.end = function () {
    this.emit('end');
};

module.exports = Pipe;
