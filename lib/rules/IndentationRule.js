const assert = require('assert');
const esprima = require('esprima');

IndentationRule = {};

IndentationRule.name = 'Indentation';

IndentationRule.infer = function (sample, callback) {
    var characters = {},
        indent = 0,
        previousToken = null,
        totalCount = 0;

    sample.on('data', function (token) {
        function indentation(whitespaces) {
            var first = whitespaces[0];
            if (!Array.prototype.every.call(whitespaces, function (character) {
                return character === first;
            }))
                return null;
            return { character: first, count: Math.floor(whitespaces.length / indent) };
        }
    
        function processWhitespaces(value) {
            var newLinePos = value.lastIndexOf('\n');
            if (newLinePos === -1)
                return;
            value = value.substr(newLinePos + 1);
        
            var indentationType = indentation(value);
            if (indentationType) {
                var character = indentationType.character,
                    count = indentationType.count;
                if (typeof characters[character] === 'undefined')
                    characters[character] = [];
                if (typeof characters[character][count] === 'undefined')
                    characters[character][count] = 0;
                characters[character][count]++;
            }
            totalCount++;
        }
    
        // FIXME: Handle if/for/while one-liners.
        // FIXME: Fix function argument/variable declaration alignment.
        if (token.type === 'Punctuator' && token.value === '}')
            --indent;
        if (previousToken && previousToken.type === 'Whitespaces' && indent > 0)
            processWhitespaces(previousToken.value);
        if (token.type === 'Punctuator' && token.value === '{')
            ++indent;

        previousToken = token;
    });
    sample.on('end', function () {
        var max = 0,
            mostCommon = {},
            sum = 0,
            value = null;
        for (var character in characters) {
            characters[character].forEach(function (count, index) {
                if (count > max) {
                    max = count;
                    mostCommon = { character: this, width: index };
                }
                sum += count;
            }, character);
        }
        
        if (max > totalCount - sum)
            value = mostCommon;
        callback(null, value);
    });
};

IndentationRule.transform = function (input, value, output, callback) {
    assert([ ' ', '\t' ].indexOf(value.character) !== -1
           && typeof value.width === 'number' && value.width >= 0);

    var indent = 0;
    // FIXME: Implement.
    input.on('data', function (token) {
        output.write(token);
    });
    input.on('end', function () {
        output.end();
        callback(null);
    });
};

module.exports = IndentationRule;
