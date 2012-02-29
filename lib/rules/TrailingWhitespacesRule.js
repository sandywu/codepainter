const assert = require('assert');
const string = require('../util/string');

TrailingWhitespacesRule = {};

TrailingWhitespacesRule.name = 'TrailingWhitespaces';

TrailingWhitespacesRule.infer = function (sample, callback) {
    callback(null, 'strip');
};

TrailingWhitespacesRule.transform = function (input, value, output, callback) {
    assert(value === 'strip');
    
    input.on('data', function (token) {
        if (token.type === 'Whitespaces') {
            var lineCount = 0;
            Array.prototype.forEach.call(token.value, function (character) {
                if (character === '\n')
                    lineCount++;
            });
        
            var pos = token.value.lastIndexOf('\n');
            if (pos !== -1)
                token.value = '\n'.repeat(lineCount) + token.value.substr(pos + 1);
        }
        output.write(token);
    });
    input.on('end', function () {
        output.end();
        callback(null);
    });
};

module.exports = TrailingWhitespacesRule;
