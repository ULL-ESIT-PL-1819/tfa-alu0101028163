/* ----------------------------------------------------------------------------
                                  Packages
   ----------------------------------------------------------------------------*/
var XRegExp = require('xregexp')
var ast = require("./ast.js")
var lexer = require("./lexer.js")
const inspect   = require("util").inspect;
var ins         = (x) => inspect(x, {depth:null});

/* ----------------------------------------------------------------------------
                          Global variables & structures.
   ----------------------------------------------------------------------------*/

var lookahead = null;
var program = [];     // Array de tokens
var get_next_token = function(){
  var next_token = lexer.lex();
  program.push(next_token);
  lookahead = next_token;
}


const TERMINAL = function(expected){
  if(lookahead && lookahead.value == expected){
    var terminal = lookahead;
    get_next_token();
    return terminal;
  }
}


const ZERO_OR_MORE = function(fun, element){
  for(;;) { // Infinite loop
    var result;
    if(result = fun(element)){
      element = result;
    }else{
      return element;
    }
  }
}

const ZERO_OR_MORE_ = function(fun){
  var result_arr = []
  for(;;) { // Infinite loop
    var result;
    if(result = fun()){
      result_arr.push(result)
    }else return result_arr;
    }
  }

var MULT_OR_DIV_AND_FACTOR = function(factor1){
  var apply = null;
  if(lookahead && (lookahead.value === "*" || lookahead.value === "/")){
    apply = new ast.Apply(new ast.Word(lookahead));
    apply.push(factor1)
    get_next_token();
    var factor2;
    if(factor2 = FACTOR()){
      apply.push(factor2);
    }else apply = null
  }
  return apply;
}

const TERM = function(){

  var factor;
  if(!(factor = FACTOR())){ return null }

  factor = ZERO_OR_MORE(MULT_OR_DIV_AND_FACTOR, factor)

  return factor;

}

const IDENT = function(){
      if(lookahead && lookahead.type == "IDENTIFIER"){
        return new ast.Word(lookahead);
      }
}

const NUMBER = function(){
      if(lookahead && lookahead.type == "NUMBER"){
        return new ast.Value(lookahead);
      }
}


var SUM_OR_SUB_AND_TERM = function(term1){
  var apply = null;
  if(lookahead && (lookahead.value === "+" || lookahead.value === "-")){
    apply = new ast.Apply(new ast.Word(lookahead));
    apply.push(term1);
    get_next_token();
    var term2;
    if(term2 = TERM()){
      apply.push(term2);
    }else apply = null;
  }
  return apply;
}


const EXPRESSION = function(){

  var apply = null;

  if(lookahead && (lookahead.value === "+" || lookahead.value === "-")){
    apply = new ast.Apply(new ast.Word(lookahead));
    get_next_token();
  }

  var term = []
  if(term = TERM()){
    if(apply){
      apply.push(term);
    }
  }else return null;

  if(apply)
  apply = ZERO_OR_MORE(SUM_OR_SUB_AND_TERM, apply);
  else apply = ZERO_OR_MORE(SUM_OR_SUB_AND_TERM, term);

  return apply;

}


const FACTOR = function(){

  var ident;
  if(ident = IDENT()){
    get_next_token();
    return ident
  };

  var number;
  if(number = NUMBER()){
    get_next_token();
    return number
  };

  var arr;
  if(arr = ARRAY()){
    return arr;
  }

  var expr;
  if(TERMINAL("(") && (expr = EXPRESSION()) && TERMINAL(")")){return expr};

  return null;
}

const ARRAY = function(){
  var lb;
  if(lb = TERMINAL("[")){

    var arr = new ast.Apply(new ast.Word({value: "array", offset: lb.offset, lineno: lb.lineno}))
    var expr;
    if(expr = EXPRESSION()){
      arr.push(expr);
    }

    var more_expr = ZERO_OR_MORE_(function(){
      var terminal;
      if(terminal = TERMINAL(",")){
        var expr;
        if(expr = EXPRESSION()){
          return expr;
        }
      }
    });

    if(more_expr)
    arr.args = arr.args.concat(more_expr);

    if(lb = TERMINAL("]")){
      return arr;
    }

  }

  return null;
}

const PRINT = function(){
  var print;
  if(print = TERMINAL("print")){
    var apply = new ast.Apply(new ast.Word(print));
    if(TERMINAL("(")){
      var expr;
      if(expr = EXPRESSION()){
        apply.push(expr);
        if(TERMINAL(")")){
          return apply;
        }
      }
    }
  }
  return null;
}


const ASSIGNATION = function(){
  var ident;
  if(ident = IDENT()){
    get_next_token();
    var apply = null;
    var terminal;
    if(terminal = TERMINAL(":=")){
      apply = new ast.Apply(new ast.Word(terminal))
      apply.push(ident);


      var expr;
      if(expr = EXPRESSION()){
        apply.args = apply.args.concat(expr)
        return apply;
      }

    }
  }

  return null;
}

const STATEMENT = function(){
  var assignation;
  if(assignation = ASSIGNATION()){
    return assignation;
  }

  var call;
  if(call = CALL()){
    return call;
  }

  var begin_end;
  if(begin_end = BEGIN_END()){
    return begin_end;
  }

  var if_statement;
  if(if_statement = IF()){
    return if_statement;
  }

  var while_statement;
  if(while_statement = WHILE()){
    return while_statement;
  }

  var print;
  if(print = PRINT()){
    return print;
  }
}

const BEGIN_END = function(){
  var begin;
  if(begin = TERMINAL("begin")){
    var begin_end = new ast.Apply(new ast.Word({value: "do", offset: begin.offset, lineno: begin.lineno}))
    var statement;
    if(!(statement = STATEMENT())){return null;}
    var more_statements = ZERO_OR_MORE_(function(){
      var terminal;
      if(terminal = TERMINAL(";")){
        var statement;
        if(statement = STATEMENT()){
          return statement;
        }
      }
      return null;
    });
    begin_end.push(statement);
    if(more_statements)
    begin_end.args = begin_end.args.concat(more_statements);
    if(TERMINAL("end")){
      return begin_end;
    }else return null;
  }
}

const VAR = function(){
  var var_declaration;
  if(var_declaration = TERMINAL("var")){
    var apply = new ast.Apply(new ast.Word(var_declaration));
    var ident;
    if(ident = IDENT()){
      get_next_token();
      apply.push(ident);
      //TODO: Más declaraciones.
      if(TERMINAL(";")){
        return apply;
      }
    }
  }
  return null;
}



const CONDITION = function(){
  var expr1;
  if(expr1 = EXPRESSION()){
    var operators = ["=","<","<=",">",">="]
    var operator = null;
    for (var i = 0; i < operators.length; i++){
      if(operator = TERMINAL(operators[i]))
         break;
    }
    if(!operator){ return null }
    var apply = new ast.Apply(new ast.Word(operator));
    apply.push(expr1);
    var expr2;
    if(expr2 = EXPRESSION()){
      apply.push(expr2);
      return apply;
    }else return null;
  }else return null;
}

const PROCEDURE = function(){
  var ident;
  if(TERMINAL("procedure")){
    if(ident = IDENT()){
      get_next_token();
      var procedure = new ast.Apply(new ast.Word({value: "def", offset: -1, lineno: -1}));
      procedure.push(ident);
        if(TERMINAL(";")){
          var block;
          if(block = BLOCK()){
            if(TERMINAL(";")){
              procedure.push(block);
              return procedure;
          }
        }
      }
    }
  }
  return null;
}

const BLOCK = function(){
  var block;
  block = new ast.Apply(new ast.Word({value:"block", offset: -1, lineno: -1}));

  var var_declaration;
  if(var_declaration = VAR()){
      block.push(var_declaration);
  }

  var procedures;
  if(procedures = ZERO_OR_MORE_(PROCEDURE)){
    block.args = block.args.concat(procedures);
  }

  if(statement = STATEMENT()){
    block.args.push(statement);
    return block;
  }else return null;

}

const CALL = function(){
  var call;
  if(call = TERMINAL("call")){
    var apply = new ast.Apply(new ast.Word(call))
    var ident;
    if(ident = IDENT()){
      get_next_token();
      apply.push(ident);
    }else return null;
    return apply;
  }else return null;
}


const PROGRAM = function(){
    var block;
    if(block = BLOCK()){
      var program;
      program = new ast.Apply(new ast.Word({value: "program", offset: -1, lineno: -1}));
      program.push(block);
      if(TERMINAL(".")){
        return program;
      }else throw "Missing .";
    }else return null;
}

const IF = function(){
  var if_;
  if(if_ = TERMINAL("if")){
    var if_statement = new ast.Apply(new ast.Word(if_))
    var condition;
    if(condition = CONDITION()){
      if_statement.push(condition)
      if(TERMINAL("then")){
        var statement1;
        if(statement1 = STATEMENT()){
          if_statement.push(statement1)
        }
        if(TERMINAL("else")){
          var statement2;
          if(statement2 = STATEMENT()){
            if_statement.push(statement2)
            return if_statement;
          }
        }
      }
    }
  }

  return null;
}

const WHILE = function(){
  var while_;
  if(while_ = TERMINAL("while")){
    var while_statement = new ast.Apply(new ast.Word(while_))
    var condition;
    if(condition = CONDITION()){
      while_statement.push(condition)
      if(TERMINAL("do")){
        var statement;
        if(statement = STATEMENT()){
          while_statement.push(statement);
          return while_statement;
        }
      }
    }
  }
  return null;
}

module.exports = {
  TERMINAL,
  ZERO_OR_MORE,
  TERM,
  IDENT,
  NUMBER,
  EXPRESSION,
  FACTOR,
  STATEMENT,
  ASSIGNATION,
  CONDITION,
  PROCEDURE,
  BLOCK,
  BEGIN_END,
  PROGRAM,
  IF,
  ARRAY,
  WHILE,
  PRINT,
  get_next_token
}
