Code Painter
============

Code Painter is a JavaScript beautifier that instead of asking you to manually specify the desired  formatting style, can infer it from a code sample provided by you. This could, for instance, be a code snippet from the same project that your new code is supposed to be integrated with.

It uses the excellent [Esprima parser](http://esprima.org/) by [Ariya Hidayat](http://ariya.ofilabs.com/) (thanks!).

The name is inspired by Word's Format Painter, which does a similar job for rich text.

Usage
-----

For now, it can only be used as a command-line tool but a Web version is in the works.

> ./bin/codepaint -i input.js -s sample.js -o output.js

transforms the input.js file using formatting style from sample.js and writes the output to output.js

*-i* and *-o* can both be ommitted, in that case standard I/O streams will be used.

> ./bin/codepaint -s sample.js < input.js > output.js

The style can still be specified manually with a JSON string as the *--style* argument:

> ./bin/codepaint --style '{ "QuoteType": "double" }' < input.js > output.js

Supported style properties
--------------------------

1.  **QuoteType**: *single*, *double*

    Specifies what kind of quoting you would like to use for string literals:
    `console.log("Hello world!")` -> `console.log('Hello world!')`
    Adds proper escaping when necessary, obviously.
    `console.log('Foo "Bar" Baz')` -> `console.log("Foo \"Bar\" Baz")`
    
2.  **SpaceAfterControlStatements**: *present*, *omitted*

    Specifies whether or not there should be a space between if/for/while and the following (.
    `if(x === 4)` -> `if (x === 4)` or `while (foo()) {` -> `while(foo()) {`

3.  **SpaceAfterAnonymousFunctions**: *present*, *omitted*

    Specifies whether or not there should be a space between function and () in anonymous functions.
    `function(x) { }` -> `function (x) { }`