const assert = require('assert'),
      stream = require('stream'),
      util = require('util');
const esprima = require('esprima');

Tokenizer = function () {
    this.contents = '';
    this.writable = true;
    this.readable = true;
};

util.inherits(Tokenizer, stream.Stream);

Tokenizer.prototype.write = function (string) {
    this.contents += string;
};

Tokenizer.prototype.end = function () {
    var parsed = esprima.parse(this.contents, {
        comment: true,
        range: true,
        tokens: true
    });

    var c = 0,
        comments = parsed.comments,
        t = 0,
        tokens = parsed.tokens,
        end = this.contents.length,
        pos = 0;
    function tokensLeft() {
        return pos < end;
    }
    function nextToken() {
        var comment = c < comments.length ? comments[c] : null,
            commentPos = comment ? comment.range[0] : end,
            token = t < tokens.length ? tokens[t] : null,
            tokenPos = token ? token.range[0] : end,
            nextPos = Math.min(commentPos, tokenPos);

        assert(pos <= nextPos);
        // There are whitespaces between the previous and the next token.
        // FIXME: It would be cool to detach whitespaces from the stream but still make it super
        // easy for the pipeline to ask for the whitespaces that follow or precede a specific token.
        if (pos < nextPos) {
            var whitespaces = this.contents.substring(pos, nextPos);
            pos = nextPos;
            return { type: 'Whitespaces', value: whitespaces };
        }
        if (commentPos < tokenPos) {
            c++;
            pos = comment.range[1] + 1;
            var commentType = comment.type === 'Line' ? 'LineComment' : 'BlockComment';
            return { type: commentType, value: comment.value };
        }
        t++;
        pos = token.range[1] + 1;
        return { type: token.type, value: token.value };
    }

    while (tokensLeft()) {
        var token = nextToken.call(this);
        this.emit('data', token);
    }
    this.emit('end');
};

module.exports = Tokenizer;
