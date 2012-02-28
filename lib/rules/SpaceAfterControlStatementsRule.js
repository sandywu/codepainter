const assert = require('assert');

SpaceAfterControlStatementsRule = {};

SpaceAfterControlStatementsRule.name = 'SpaceAfterControlStatements';

SpaceAfterControlStatementsRule.infer = function (sample, callback) {
    var previousToken = null,
        spacePresent = 0,
        spaceOmitted = 0,
        totalCount = 0; // FIXME: spacePresent + spaceOmitted + stuff this doesn't handle.

    sample.on('data', function (token) {
        if (previousToken && previousToken.type === 'Keyword') {
            switch (previousToken.value) {
                case 'if':
                case 'for':
                case 'while':
                    if (token.type === 'Whitespaces') {
                        if (token.value === ' ')
                            spacePresent++;
                    } else {
                        assert(token.type === 'Punctuator' && token.value === '(');
                        spaceOmitted++;
                    }
                    totalCount++;
                    break;
            }
        }
    });
    sample.on('end', function () {
        var unknown = totalCount - spacePresent - spaceOmitted,
            max = Math.max(unknown, spacePresent, spaceOmitted),
            value = null;
        
        if (spacePresent === max)
            value = 'present';
        else if (spaceOmitted === max)
            value = 'omitted';
        callback(null, value);
    });
};

SpaceAfterControlStatementsRule.transform = function (input, value, output, callback) {
    assert(value === 'present' || value === 'omitted');
    
    var previousToken = null,
        space = { type: 'Whitespaces', value: ' ' };

    input.on('data', function (token) {
        if (previousToken && previousToken.type === 'Keyword') {
            switch (previousToken.value) {
                case 'if':
                case 'for':
                case 'while':
                    if (token.type === 'Whitespaces') {
                        if (value === 'omitted')
                            token = null;
                    } else {
                        assert(token.type === 'Punctuator' && token.value === '(');
                        if (value === 'present')
                            output.write(space);
                    }
                    break;
            }
        }
        if (token)
            output.write(token);
        previousToken = token;
    });
    input.on('end', function () {
        output.end();
        callback(null);
    });
};

module.exports = SpaceAfterControlStatementsRule;