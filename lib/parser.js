/* ----------------------------------------------------------------------------
                                  Packages
   ----------------------------------------------------------------------------*/
var XRegExp     = require('xregexp')
// var ast         = require("./ast.js")
var lexer       = require("./lexer.js")
const inspect   = require("util").inspect;
var ins         = (x) => inspect(x, {depth:null});

/* ----------------------------------------------------------------------------
                          Global variables & structures.
   ----------------------------------------------------------------------------*/

var lookahead = null;
let program = null;
var { tokenize_program, TOKENS, lex } = require("./lexer.js");

function initialize(input){
  lexer.initialize();
  program = input;
  lookahead = lex(program);
}

function assert_type(token_type){
  if(!lookahead){
    throw SyntaxError(`Expected token of type ${token_type} but got EOF`);
  }else if(lookahead.type != token_type){
    throw SyntaxError(`Expected token with type: ${token_type} but got ${lookahead.type} instead`);
  }
}

function assert_value(token_value){
  if(!lookahead){
    throw SyntaxError(`Expected token ${token_value} but got EOF`);
  }else if(lookahead.value != token_value){
    throw SyntaxError(`Expected token : ${token_value} but got ${lookahead.value} instead`);
  }
}

function is_word(){
  return lookahead.type === 'keyword'
      || lookahead.type === 'identifier'
      || lookahead.type === 'comparison_op'
      || lookahead.type === 'assign_op'
      || lookahead.type === 'add_sub_op'
      || lookahead.type === 'mult_div_op'
}

function is_value(){
  return lookahead.type === 'string'
      || lookahead.type === 'number'
}

function shift(){
  old_lookahead = lookahead;
  lookahead = lex(program);
  return old_lookahead;
}

function get_token(token_value, token_type){
  assert_type(token_type);
  assert_value(token_value);
  if(is_word()){
    lookahead.type = 'word';
  }else if(is_value()){
    lookahead.type = 'value';
  }
  return shift();
}

function get_token_of_type(token_type){
  assert_type(token_type);
  if(is_word()){
    lookahead.type = 'word';
  }else if(is_value()){
    lookahead.type = 'value';
  }
  return shift();
}



module.exports = {
  initialize,
  shift,
  assert_type,
  assert_value,
  is_word,
  is_value,
  get_token,
  get_token_of_type
}
