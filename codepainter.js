const Pipe = require('./lib/Pipe'),
      rules = require('./lib/rules'),
      Serializer = require('./lib/Serializer'),
      Tokenizer = require('./lib/Tokenizer');

module.exports.infer = function (sample, callback) {
    var left = rules.length,
        style = {},
        tokenizer = new Tokenizer();
        
    sample.pipe(tokenizer);
        
    if (rules.length > 0) {
        var left = rules.length;
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            rule.infer(tokenizer, function (error, value) {
                style[rule.name] = value;
                left--;
                if (left === 0)
                    callback(null, style);
            });
        }
    } else {
        callback(null, style);
    }

    sample.resume();
};

module.exports.transform = function (input, style, output, callback) {
    var enabledRules = [],
        left = rules.length,
        tokenizer = new Tokenizer(),
        serializer = new Serializer(),
        streams = [];
       
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (typeof style[rule.name] !== 'undefined' && style[rule.name] !== null)
            enabledRules.push(rule);
    }
       
    input.pipe(tokenizer);
    serializer.pipe(output);
        
    if (enabledRules.length > 0) {
        var streams = [];
        streams.push(tokenizer);
        
        for (var i = 0; i < enabledRules.length - 1; i++)
            streams.push(new Pipe());
        streams.push(serializer);
    
        for (var i = 0; i < enabledRules.length; i++) {
            var rule = enabledRules[i];
            rule.transform(streams[i], style[rule.name], streams[i + 1], function (error) {
            });
        }
    } else {
        tokenizer.pipe(serializer);
    }
    
    serializer.on('end', function () {
        callback(null);
    });
    
    input.resume();
};
