var assert = require("assert")
var should = require("should")
var chai   = require("chai")
var lexer  = require("../../lib/lexer.js")



describe("Lexer Examples", function(){
  it("pl0_1.pl", function(){
  var token_arr = [ { type: 'keyword', value: 'var', lineno: 1, offset: 0 },
  { type: 'identifier', value: 'n', lineno: 1, offset: 4 },
  { type: 'comma', value: ',', lineno: 1, offset: 5 },
  { type: 'identifier', value: 'f', lineno: 1, offset: 7 },
  { type: 'semicolon', value: ';', lineno: 1, offset: 8 },
  { type: 'keyword', value: 'begin', lineno: 2, offset: 0 },
  { type: 'identifier', value: 'n', lineno: 3, offset: 3 },
  { type: 'assign_op', value: ':=', lineno: 3, offset: 5 },
  { type: 'number', value: 0, lineno: 3, offset: 8 },
  { type: 'semicolon', value: ';', lineno: 3, offset: 9 },
  { type: 'identifier', value: 'f', lineno: 4, offset: 3 },
  { type: 'assign_op', value: ':=', lineno: 4, offset: 5 },
  { type: 'number', value: 1, lineno: 4, offset: 8 },
  { type: 'semicolon', value: ';', lineno: 4, offset: 9 },
  { type: 'keyword', value: 'while', lineno: 5, offset: 3 },
  { type: 'identifier', value: 'n', lineno: 5, offset: 9 },
  { type: 'keyword', value: 'begin', lineno: 6, offset: 3 },
  { type: 'identifier', value: 'n', lineno: 7, offset: 6 },
  { type: 'assign_op', value: ':=', lineno: 7, offset: 8 },
  { type: 'identifier', value: 'n', lineno: 7, offset: 11 },
  { type: 'add_sub_op', value: '+', lineno: 7, offset: 13 },
  { type: 'number', value: 1, lineno: 7, offset: 15 },
  { type: 'semicolon', value: ';', lineno: 7, offset: 16 },
  { type: 'identifier', value: 'f', lineno: 8, offset: 6 },
  { type: 'assign_op', value: ':=', lineno: 8, offset: 8 },
  { type: 'identifier', value: 'f', lineno: 8, offset: 11 },
  { type: 'mult_div_op', value: '*', lineno: 8, offset: 13 },
  { type: 'identifier', value: 'n', lineno: 8, offset: 15 },
  { type: 'semicolon', value: ';', lineno: 8, offset: 16 },
  { type: 'keyword', value: 'end', lineno: 9, offset: 3 },
  { type: 'semicolon', value: ';', lineno: 9, offset: 6 },
  { type: 'keyword', value: 'end', lineno: 10, offset: 0 },
  { type: 'dot', value: '.', lineno: 10, offset: 3 } ]

  lexer.tokenize_program_from_file("examples/pl0_1.pl").should.eql(token_arr);

  })
});
