/* ----------------------------------------------------------------------------
                                  Packages
   ----------------------------------------------------------------------------*/
var XRegExp     = require('xregexp')
var ast         = require("./ast.js")
var lexer       = require("./lexer.js")
var fs          = require("fs");
const inspect   = require("util").inspect;
const json2AST  = require("./json2ast.js");
var ins         = (x) => inspect(x, {depth:null});

/* ----------------------------------------------------------------------------
                          Global variables & structures.
   ----------------------------------------------------------------------------*/

var lookahead = null;
let program = null;
var { tokenize_program, TOKENS, lex } = require("./lexer.js");

function parse(file_path){
  try {
    program = fs.readFileSync(file_path, 'utf8');
  }
  catch (err) {
    console.log(err);
    throw err;
  }
  initialize();
  var output = parse_program();
  output = json2AST.json2AST(output);
  return output;
}

function parse_test(prog){
  program = prog;
  initialize();
}

function initialize(){
  lexer.initialize();
  lookahead = lex(program);
}

function assert_type(token_type){
  if(!lookahead){
    throw SyntaxError(`Expected token of type ${token_type} but got EOF`);
  }else if(lookahead.type != token_type){
    throw SyntaxError(`Expected token with type: ${token_type} but got ${lookahead.type} : ${lookahead.value} instead`);
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

function parse_program(){
  const block = parse_block();
  if(lookahead){
    throw SyntaxError(`Expected EOF but got ${lookahead.value} instead`);
  }
  return block;
}

function parse_block(){
  
  const constants = parse_constants();
  const variables = parse_variables();

  const procedures = [];
  let procedure;

  while(lookahead && (procedure = parse_procedure())){
    procedures.push(procedure);
  }

  const statements = [];
  let statement;

  while(lookahead && (statement = parse_statement())){
    statements.push(statement);
    // get_token_of_type('semicolon') // TODO: Y si quito este ; y depende de cada statement..
  }

  block_statements = []
  if(constants)  block_statements.push(...constants);
  if(variables)  block_statements.push(...variables);
  if(procedures) block_statements.push(...procedures);
  if(statements) block_statements.push(...statements);

  return egg_apply("do", ...block_statements);

}

function parse_object_declaration(){
  if(lookahead && lookahead.value === 'object' && lookahead.type === 'keyword'){
    get_token("object","keyword");
    // const id = get_token_of_type('identifier');
    
    
    let object_apply = null;
    if (lookahead.value === 'extends'){
      get_token("extends","keyword");
      const parent_object = get_token_of_type('identifier');
      object_apply = egg_apply("extends", parent_object);
    }
    
    // get_token_of_type("semicolon");
    get_token("begin", "keyword");
    const attributes = [];
    while(lookahead && lookahead.value != 'end'){
      let attribute = parse_procedure();
      if(attribute){
        attributes.push(attribute);
      }else{
        attribute = parse_assign_stmt();
        attributes.push(attribute);
      }
    }
    get_token("end", "keyword");
    
    if(object_apply){
      object_apply.args.push(egg_apply("object", id, ...attributes));
      return object_apply;
    }else return egg_apply("object", ...attributes);
  }else return null;
}

function parse_procedure(){
  if(lookahead && lookahead.value === 'procedure' && lookahead.type === 'keyword'){
    get_token("procedure","keyword");
    const id = get_token_of_type('identifier');
    get_token_of_type("lpar");
    const arguments = [];
    let expression;
    if(expression = parse_expression()){
        arguments.push(expression);
        while(lookahead && lookahead.type != 'rpar'){
          get_token_of_type('comma');
          expression = parse_expression();
          arguments.push(expression);
        }
    }
    get_token_of_type("rpar");
    
    get_token_of_type('semicolon');
    get_token('begin','keyword');
    const block = parse_block();
    get_token('end','keyword');
    return egg_apply("def", id,
            egg_apply("fun", ...arguments, 
            egg_apply("do", ...block.args)));
  }else return null;
}

function parse_constants(){
  if(lookahead && lookahead.value === 'const' && lookahead.type === 'keyword'){
    get_token("const","keyword");
    const constants = [];

    let id = get_token_of_type('identifier');
    get_token_of_type('assign_op');
    let expr = parse_expression();
    constants.push(egg_apply("def", id, expr));

    while(lookahead && lookahead.type != 'semicolon'){
      get_token_of_type('comma');
      id = get_token_of_type('identifier');
      get_token_of_type('assign_op');
      expr = parse_expression();
      constants.push(egg_apply("def", id, expr));
    }
    get_token_of_type('semicolon');

    return constants;

  }else return [];
}

function parse_variables(){
  if(lookahead && lookahead.value === 'var' && lookahead.type === 'keyword'){
    get_token("var","keyword");
    const value = {type: "value", value: 0};
    const identifiers = [];
    let id = get_token_of_type('identifier');
    identifiers.push(egg_apply("def", id, value));
    while(lookahead && lookahead.type != 'semicolon'){
      get_token_of_type('comma');
      id = get_token_of_type('identifier');
      identifiers.push(egg_apply("def", id, value));
    }
    get_token_of_type('semicolon');
    return identifiers;
  }else return [];
}

function parse_statement(){
  return !lookahead
      || parse_assign_stmt()
      || parse_call_stmt()
      || parse_begin_stmt()
      || parse_if_stmt()
      || parse_while_stmt()
      || parse_print_stmt()
      || null
}

function parse_print_stmt(){
  if(lookahead&& lookahead.value === 'print' && lookahead.type === 'keyword'){
    get_token("print","keyword");
    get_token_of_type("lpar");
    const expression = parse_expression();
    get_token_of_type("rpar");
    get_token_of_type("semicolon");
    return egg_apply("print", expression);
  }
}

function parse_while_stmt(){
  if(lookahead && lookahead.value === 'while' && lookahead.type === 'keyword'){
    get_token('while','keyword');
    const condition = parse_condition();
    get_token("do", 'keyword');
    const statement = parse_statement();
    return egg_apply("while", condition, statement);
  }
}

function parse_if_stmt(){
  if(lookahead && lookahead.value === 'if' && lookahead.type === 'keyword'){
    get_token('if', 'keyword');
    const condition = parse_condition();
    get_token('then', 'keyword');
    const statement = parse_statement();
    return egg_apply("if", condition, statement);
  }else return null;
}

function parse_begin_stmt(){
  if(lookahead && lookahead.value === 'begin' && lookahead.type === 'keyword'){
    get_token('begin','keyword');
    const statements = [];
    let statement;
    while(lookahead && lookahead.value != 'end'){
      statement = parse_statement();
      statements.push(statement);
    }
    get_token('end','keyword');
    return egg_apply('do', ...statements);
  }else return null;
}

function parse_call_stmt(){
  if(lookahead && lookahead.value === 'call' && lookahead.type === 'keyword'){
    get_token('call','keyword');
    
    let object = parse_object_access(); //[]
    if(object.length > 1){
      object = egg_apply("element", ...object);
    }else object = object[0];
    
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

    }
    get_token_of_type('rpar');
    get_token_of_type("semicolon");
    return egg_apply("call", object, ...args);
  }else return null;
}

function parse_assign_stmt(){
  if(lookahead.type === 'identifier'){
    const left_part = parse_object_access();
    const operator = get_token_of_type('assign_op');
    
    let right_part = parse_object_declaration();
    if(!right_part){
      right_part = parse_expression();
    }
    
    get_token_of_type('semicolon');

    if(left_part.length > 1){ // Set.
      return egg_apply("set", ...left_part, right_part);
    }else return egg_apply(":=", ...left_part, right_part);

  }else return null;
}


function parse_object_access(){
  if(lookahead && lookahead.type === 'identifier' || lookahead.value === 'this'){
    
    const elements = [];
    
    if(lookahead.value === 'this'){
      const this_token = get_token("this","keyword");
      get_token_of_type("dot");
      elements.push(this_token);
    }
    
    const id = get_token_of_type('identifier');
    
    if(elements.length > 0){ // Hay un this.
      id.type = 'value';
    }
    
    elements.push(id);
    while(lookahead && lookahead.type === 'lbrack' || lookahead.type === 'dot'){
      
      if(lookahead.type === 'dot'){
        get_token_of_type('dot');
        const element = get_token_of_type('identifier');
        element.type = 'value';
        elements.push(element);
      }else {
        get_token_of_type('lbrack');
        const element = parse_expression();
        elements.push(element);
        get_token_of_type('rbrack');  
      }
    }
  
    return elements;
  }else return null;
}


function parse_array(){
  if(lookahead && lookahead.type === 'lbrack'){
    get_token_of_type('lbrack');
    const array_values = [];
    let array_value;
    while(lookahead && lookahead.type != 'rbrack'){
      array_value = parse_expression();
      array_values.push(array_value);
      if(lookahead.type != 'comma')
        break;
      else get_token_of_type('comma');
    }
    get_token_of_type('rbrack');
    return egg_apply("array", ...array_values);
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
  // console.log(ins(lookahead ))
  if(lookahead && lookahead.type === 'number'){
    return get_token_of_type('number');
  }

  if(lookahead && lookahead.type === 'identifier' || lookahead.value === 'this'){
    const elements = parse_object_access();
    if(elements.length > 1){
      return egg_apply("element", ...elements);
    }else return elements[0];
  }

  if(lookahead && lookahead.type === 'lpar'){
    get_token_of_type('lpar');
    const expression = parse_expression();
    get_token_of_type('rpar');
    return expression;
  }
  
  if(lookahead && lookahead.type === 'lbrack'){
    const array = parse_array();
    return array;
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
  parse_while_stmt,
  parse_print_stmt,
  parse_variables,
  parse_constants,
  parse_procedure,
  parse_block,
  parse_program,
  parse_array,
  parse_object_declaration,
  parse,
  parse_test
}
