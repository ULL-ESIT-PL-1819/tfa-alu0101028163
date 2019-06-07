var assert = require("assert")
var should = require("should")
var chai   = require("chai")
var lexer  = require("../../lib/lexer.js")



describe("Lexer Examples", function(){
  it("pl0_1.pl", function(){
  var token_arr = [ { type: 'KEYWORD', value: 'var', lineno: 0, offset: 0 },
    { type: 'IDENTIFIER', value: 'n', lineno: 0, offset: 4 },
    { type: 'COMMA', value: ',', lineno: 0, offset: 5 },
    { type: 'IDENTIFIER', value: 'f', lineno: 0, offset: 7 },
    { type: 'SEMICOLON', value: ';', lineno: 0, offset: 8 },
    { type: 'KEYWORD', value: 'begin', lineno: 1, offset: 10 },
    { type: 'IDENTIFIER', value: 'n', lineno: 2, offset: 19 },
    { type: 'OPERATOR', value: ':=', lineno: 2, offset: 21 },
    { type: 'NUMBER', value: 0, lineno: 2, offset: 24 },
    { type: 'SEMICOLON', value: ';', lineno: 2, offset: 25 },
    { type: 'IDENTIFIER', value: 'f', lineno: 3, offset: 30 },
    { type: 'OPERATOR', value: ':=', lineno: 3, offset: 32 },
    { type: 'NUMBER', value: 1, lineno: 3, offset: 35 },
    { type: 'SEMICOLON', value: ';', lineno: 3, offset: 36 },
    { type: 'KEYWORD', value: 'while', lineno: 4, offset: 41 },
    { type: 'IDENTIFIER', value: 'n', lineno: 4, offset: 47 },
    { type: 'KEYWORD', value: 'begin', lineno: 5, offset: 60 },
    { type: 'IDENTIFIER', value: 'n', lineno: 6, offset: 72 },
    { type: 'OPERATOR', value: ':=', lineno: 6, offset: 74 },
    { type: 'IDENTIFIER', value: 'n', lineno: 6, offset: 77 },
    { type: 'OPERATOR', value: '+', lineno: 6, offset: 79 },
    { type: 'NUMBER', value: 1, lineno: 6, offset: 81 },
    { type: 'SEMICOLON', value: ';', lineno: 6, offset: 82 },
    { type: 'IDENTIFIER', value: 'f', lineno: 7, offset: 90 },
    { type: 'OPERATOR', value: ':=', lineno: 7, offset: 92 },
    { type: 'IDENTIFIER', value: 'f', lineno: 7, offset: 95 },
    { type: 'OPERATOR', value: '*', lineno: 7, offset: 97 },
    { type: 'IDENTIFIER', value: 'n', lineno: 7, offset: 99 },
    { type: 'SEMICOLON', value: ';', lineno: 7, offset: 100 },
    { type: 'KEYWORD', value: 'end', lineno: 8, offset: 105 },
    { type: 'SEMICOLON', value: ';', lineno: 8, offset: 108 },
    { type: 'KEYWORD', value: 'end', lineno: 9, offset: 110 },
    { type: 'DOT', value: '.', lineno: 9, offset: 113 } ]


  lexer.lex_from_file("examples/pl0_1.pl").should.eql(token_arr);

  })
});
