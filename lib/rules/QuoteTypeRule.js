const assert = require('assert');

QuoteTypeRule = {};

QuoteTypeRule.name = 'QuoteType';

QuoteTypeRule.infer = function (sample, callback) {
    var doubleQuotes = 0,
        totalCount = 0;

    sample.on('data', function (token) {
        if (token.type === 'String') {
            totalCount++;
            if (token.value[0] === '"')
                doubleQuotes++;
        }
    });
    sample.on('end', function () {
        var singleQuotes = totalCount - doubleQuotes,
            value = null;

        // FIXME: There should be a minimal dominance threshold for style properties.
        if (doubleQuotes > singleQuotes)
            value = 'double';
        else
            value = 'single';
        callback(null, value);
    });
};

var quoteMap = {
    'double': '"',
    'single': '\''
};
var typeMap = {
    '"': 'double',
    '\'': 'single'  
};
var regexpMap = {
    'double': {
        'escaped': /\\\"/,
        'unescaped': /(^|[^\\])(\\\\)*(\")/
    },
    'single': {
        'escaped': /\\\'/,
        'unescaped': /(^|[^\\])(\\\\)*(\')/
    }
};

QuoteTypeRule.transform = function (input, value, output, callback) {
    assert(value === 'single' || value === 'double');

    function changeQuotes(string, type) {
        var currentLiteral = string[0],
            currentType = typeMap[currentLiteral],
            literal = quoteMap[type];
        if (type === currentType)
            return string;

        var value = string.substring(1, string.length - 1);
        // Remove redundant escaping.
        value = value.replace(regexpMap[currentType].escaped, currentLiteral);
        // Add new escaping.
        value = value.replace(regexpMap[type].unescaped, '$2\\' + literal);
        return literal + value + literal;
    }

    input.on('data', function (token) {
        if (token.type === 'String')
            token.value = changeQuotes(token.value, value);
        output.write(token); 
    });
    input.on('end', function () {
        output.end();
        callback(null);
    });
};

module.exports = QuoteTypeRule;