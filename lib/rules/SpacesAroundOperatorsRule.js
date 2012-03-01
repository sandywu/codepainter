SpacesAroundOperatorsRule = {};

SpacesAroundOperatorsRule.name = 'SpacesAroundOperators';

var operators = [ '||', '&&', '^', '|', '&', '==', '!=', '===', '!==', '<', '>', '<=', '>=',
                  '<<', '>>', '>>>', '+', '-', '*', '%', '/',
                  '+=', '-=', '*=', '%=', '&=', '|=', '^=', '/=', '=' ];

SpacesAroundOperatorsRule.infer = function (sample, callback) {
    var previousToken = null,
        spaces = {};
    
    sample.on('data', function (token) {
        if (token.type === 'Punctuator' && operators.indexOf(token.value) !== -1) {
            if (typeof spaces[token.value] === 'undefined')
                spaces[token.value] = { present: 0, omitted: 0, count: 0 };
            if (previousToken && previousToken.type === 'Whitespaces') {
                if (previousToken.value === ' ')
                    spaces[token.value].present++;
            } else {
                spaces[token.value].omitted++;
            }
            spaces[token.value].count++;
        }
        previousToken = token;
    });
    sample.on('end', function () {
        var value = {};
        for (var character in spaces) {
            var characterValue = spaces[character],
                max = Math.max(characterValue.present, characterValue.omitted,
                               characterValue.count - characterValue.present - characterValue.omitted);

            if (max === characterValue.present)
                value[character] = 'present';
            else if (max === characterValue.omitted)
                value[character] = 'omitted';
            else
                value[character] = null;
        }
        callback(null, value);
    });
};

SpacesAroundOperatorsRule.transform = function (input, value, output, callback) {
    var previousToken = null,
        space = { type: 'Whitespaces', value: ' ' };

    input.on('data', function (token) {
        if (token.type === 'Whitespaces') {
            if (previousToken && previousToken.type === 'Punctuator'
                && operators.indexOf(previousToken.value) !== -1
                && (value === 'omitted' || value[previousToken.value] === 'omitted')
                && token.value === ' ')
                token.value = '';
        } else if (token.type === 'Punctuator' && operators.indexOf(token.value) !== -1) {
            if (previousToken && previousToken.type === 'Whitespaces') {
                if (previousToken.value !== ' '
                    || value === 'present'
                    || value[token.value] === 'present')
                    output.write(previousToken);
            }
            output.write(token);
        } else {
            if (previousToken && previousToken.type === 'Whitespaces')
                output.write(previousToken);
            output.write(token);
        }
        previousToken = token;
    });
    input.on('end', function () {
        if (previousToken.type === 'Whitespaces')
            output.write(previousToken);
        output.end();
        callback(null);
    });
};

module.exports = SpacesAroundOperatorsRule;
