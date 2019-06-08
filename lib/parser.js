/* ----------------------------------------------------------------------------
                                  Packages
   ----------------------------------------------------------------------------*/
var XRegExp     = require('xregexp')
var ast         = require("./ast.js")
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

function make_word(token){
  return {
          type: "word",
          value: token
        };
}

function egg_apply(operator, ...args){
  if(typeof(operator) != 'object'){
    operator = make_word(operator);
  }
  return {
    type: "apply",
    operator: operator,
    args: args,
  }
}

function parse_statement(){
  return parse_assign_stmt()
      || parse_call_stmt()
      || parse_begin_stmt()
      || parse_if_stmt()
      || parse_while_stmt()
}

function parse_while_stmt(){
  if(lookahead.value == 'while' && lookahead.type == 'keyword'){
    get_token('while','keyword');
    const condition = parse_condition();
    get_token("do", 'keyword');
    const statements = [];
    let statement;
    while(lookahead && (statement = parse_statement())){
      get_token_of_type('semicolon');
      statements.push(statement);
    }
    return egg_apply("while", condition, ...statements);
  }
}

function parse_if_stmt(){
  if(lookahead.value === 'if' && lookahead.type === 'keyword'){
    get_token('if', 'keyword');
    const condition = parse_condition();
    get_token('then', 'keyword');
    const statements = [];
    let statement;
    while(lookahead && (statement = parse_statement())){
      get_token_of_type('semicolon');
      statements.push(statement);
    }
    return egg_apply("if", condition, ...statements);
  }else return null;
}

function parse_begin_stmt(){
  if(lookahead.value === 'begin' && lookahead.type === 'keyword'){
    get_token('begin','keyword');
    const statements = [];
    let statement;
    while(lookahead && lookahead.value != 'end'){
      statement = parse_statement();
      get_token_of_type('semicolon');
      statements.push(statement);
    }
    get_token('end','keyword');
    return egg_apply('do', ...statements);
  }else return null;
}

function parse_call_stmt(){
  if(lookahead.value === 'call' && lookahead.type === 'keyword'){
    get_token('call','keyword');
    const id = get_token_of_type('identifier');
    get_token_of_type('lpar');
    const args = [];
    let expr = parse_expression();
    if(expr){
      args.push(expr);

      while(lookahead && lookahead.type != 'rpar'){
        get_token_of_type('comma');
        expr = parse_expression();
        args.push(expr);
      }

      get_token_of_type('rpar');
    }
    return egg_apply("call", id, ...args);
  }else return null;
}

function parse_assign_stmt(){
  if(lookahead.type === 'identifier'){
    const id = get_token_of_type('identifier');
    const indexes = [];
    while(lookahead && lookahead.type === 'lbrack'){
      get_token_of_type('lbrack');
      const index = parse_expression();
      indexes.push(index);
      get_token_of_type('rbrack');
    }
    const operator = get_token_of_type('assign_op');
    const value = parse_expression();
    return egg_apply("set", ...indexes, value);
  }else return null;
}

function parse_condition(){
   const expression1 = parse_expression();
   const operator = get_token_of_type('comparison_op');
   const expression2 = parse_expression();
   return egg_apply(operator, expression1, expression2);
}

function parse_expression(){
  let term1 = parse_term();
  while(lookahead && lookahead.type === 'add_sub_op'){
    const operator = get_token_of_type('add_sub_op');
    const term2 = parse_term();
    term1 = egg_apply(operator, term1, term2);
  }
  return term1;
}

function parse_term(){
  let factor1 = parse_factor();
  while(lookahead && lookahead.type === 'mult_div_op'){
    const operator = get_token_of_type('mult_div_op');
    const factor2 = parse_factor();
    factor1 = egg_apply(operator, factor1, factor2);
  }
  return factor1;
}

function parse_factor(){

  if(lookahead.type === 'number'){
    return get_token_of_type('number');
  }

  if(lookahead.type === 'identifier'){

    const id = get_token_of_type('identifier');
    const indexes = [];
    if(lookahead.type === 'lbrack'){
      do{
        get_token_of_type('lbrack');
        const index = parse_expression();
        indexes.push(index);
        get_token_of_type('rbrack');
      }while(lookahead.type === 'lbrack');
    }
    if(indexes.length > 0){
      return egg_apply("element", id, ...indexes);
    }else return id;

  }

  if(lookahead.type == 'lpar'){
    get_token_of_type('lpar');
    const expression = parse_expression();
    get_token_of_type('rpar');
    return expression;
  }

  return null;


}

module.exports = {
  initialize,
  shift,
  assert_type,
  assert_value,
  is_word,
  is_value,
  get_token,
  get_token_of_type,
  parse_expression,
  parse_term,
  parse_factor,
  parse_statement,
  parse_assign_stmt,
  parse_call_stmt,
  parse_begin_stmt,
  parse_if_stmt,
  parse_while_stmt
}
