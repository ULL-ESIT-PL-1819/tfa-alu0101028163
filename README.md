# Parser Predictivo Descendente Recursivo para la gramática PL/0

La gramática a implementar es la que sostiene el lenguaje de programación **PL/0** creado por **Niklaus Wirth** y que tiene la siguiente forma:

```
program = block "."

 block =
     ["var" ident {"," ident} ";"]
     {"procedure" ident ";" block ";"} statement

 assignation =  ident ":=" (expression)
 call = "call" ident
 begin_end = "begin" statement {";" statement } "end"
 if = "if" condition "then" statement "else" statement
 while = "while" condition "do" statement
 print = "print" "(" expression ")"

 statement =
       assignation
     | call
     | begin_end
     | if
     | while
     | print

 condition = expression ("="|<"|"<="|">"|">=") expression


 expression = ["+"|"-"] term {("+"|"-") term}

 term = factor {("*"|"/") factor}

 factor =
     ident
     | number
     | "(" expression ")"
     | array

  array = "[" [expression {"," expression}] "]"

```

## Lexer

He escrito un lexer para poder transformar la cadena de entrada en un conjunto de tokens. El funcionamiento es muy sencillo, se dispone de un map que agrupa expresiones regulares con la función que corresponde realizar en caso de que dicha expresión regular case con la sección del programa que se está inspeccionando.

Por ejemplo, el caso de un identificador:

```javascript
"IDENTIFIER" : [
                IDENTIFIER,
                function(){
                  let token = create_token("IDENTIFIER");
                  token_array.push(token);
                  index += match[0].length;
                }
              ]
```

Para evitar destruir la cadena a medida que se tokeniza lo que se hace es mantener un índice que indica que sección de la cadena se está inspeccionando, cuando hay un match la variable _lookahead_ apunta a dicha coincidencia y como ya hemos mencionado, se ejecuta la función correspondiente para ese token. Tras cada coincidencia exitosa se actualizan todas las XRegExp para que apunten al siguiente token ( *refresh_offset* )

```javascript
var create_token = function(type){
  return {
    type: type,
    value: match[0],
    lineno: lineno,
    offset: index
  }
}

var refresh_offset = function(){
  Object.keys(REGEX_MAP).forEach(function(key){
    REGEX_MAP[key][0].lastIndex = index;
  })
}
```

Hay dos maneras de tokenizar, leer un programa y tokenizar token a token según se requiere ( _lex_ ) o tokenizar todo el programa de golpe ( *lex_all* ).


## Parser

Para realizar el parser he intentado que cada regla de producción sea una función que llama recursivamente a las reglas de producción que la suceden y que el código sea lo más autoexplicativo posible. De este modo para parsear cualquier programa solo tendría que llamarse a la función que constituye el punto de arranque, en este caso _PROGRAM_ y esta llamaría a su vez recursivamente a todas las funciones que la siguen hasta retornar un AST.

Por ejemplo está función correspondería a la
siguiente regla de producción:

```
program = block "." .
```

```javascript
const PROGRAM = function(){
    var block;
    if(block = BLOCK()){
      if(TERMINAL(".")){
        return block;
      }else throw "Missing .";
    }else return null;
}
```

### Funciones auxiliares y terminales

#### get_next_token

El cometido de esta función es simple: le requiere al lexer de un token, lo introduce en un array de tokens ( que contiene los tokens leídos hasta el momento ) y actualiza el lookahead para que apunte al token leído más recientemente.

```javascript
var get_next_token = function(){
  var next_token = lexer.lex();
  program.push(next_token);
  lookahead = next_token;
}
```

#### TERMINAL

Esta función recibe como parámetro una cadena y la compara con el token actual, si coinciden entonces se retorna el token.

```javascript
const TERMINAL = function(expected){
  if(lookahead && lookahead.value == expected){
    var terminal = lookahead;
    get_next_token();
    return terminal;
  }
}
```

#### ZERO_OR_MORE_

Esta función recibe como argumento otra función a ser ejecutada e itera constantemente almacenando el resultado de ejecutar dicha función hasta que esta no devuelve nada. De este modo conseguimos emular un cierre de kleene en la gramática.

```javascript
const ZERO_OR_MORE_ = function(fun){
  var result_arr = []
  for(;;) { // Infinite loop
    var result;
    if(result = fun()){
      result_arr.push(result)
    }else return result_arr;
    }
  }
```

#### ZERO_OR_MORE

Esta función está pensada para aplicar el cierre de Kleene a operaciones aritméticas, de manera que se vaya expandiendo el árbol recursivamente manteniendo siempre un orden de prioridad.

```javascript
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
```

#### IDENT

Los identificadores son equivalentes a Words en Egg.

```javascript
const IDENT = function(){
      if(lookahead && lookahead.type == "IDENTIFIER"){
        return new ast.Word(lookahead);
      }
}
```

Los números son equivalentes a Values.

#### NUMBER
```javascript
const NUMBER = function(){
      if(lookahead && lookahead.type == "NUMBER"){
        return new ast.Value(lookahead);
      }
}
```

### Reglas de producción

#### FACTOR

Esta función corresponde a la regla de producción de la gramática:
```
factor =
    ident
    | number
    | "(" expression ")"
    | array
```
Como se puede apreciar el _OR_ se ha implementado simplemente retornando de la función desde que se obtiene una coincidencia mientras que el _AND_ se implementa devolviendo el resultado si y solo si todas las funciones han retornado lo esperado.

```javascript
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
```

#### TERM

Esta función corresponde a la regla de producción:

```
term = factor {("*"|"/") factor}
```

```javascript
const TERM = function(){

  var factor;
  if(!(factor = FACTOR())){ return null }

  factor = ZERO_OR_MORE(MULT_OR_DIV_AND_FACTOR, factor)

  return factor;

}
```

Para poder realizar la segunda mitad de la regla he creado la función *MULT_OR_DIV_AND_FACTOR*.

#### MULT_OR_DIV_AND_FACTOR

A esta función se le pasa un primer factor, que es necesario que exista según la definición de la regla _term_ en nuestra gramática. En caso de que haya una multiplicación o división lo que se hace es crear un apply a partir de esa operación y poner como hijo de dicho apply al factor que se pasa por parámetro y al nuevo factor que multiplica al anterior. Al devolverse este apply la función *ZERO\_OR\_MORE* vuelve a llamar a _MULT_OR_DIV_AND_FACTOR_ y le pasa como primer factor este apply, de modo que, si vuelve a haber otra operación toda la operación previa pasará a ser un nodo hijo de la nueva operación, manteniendo así la prioridad aritmética.

```javascript
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
```
#### EXPRESSION

Una expresión está constituida por un término que puede o no estar precedido por un operador de suma o resta y al que suceden cero o más términos que se le suman o restan.

```
 expression = ["+"|"-"] term {("+"|"-") term}
```

```javascript
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
```

#### SUM_OR_SUB_AND_TERM

Esta función es análoga a *MULT_OR_DIV_AND_FACTOR* pero con suma o resta en lugar de multiplicación o división.

```javascript
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
```

#### STATEMENT

Es una regla bastante autoexplicativa donde se encuentran todas las llamadas a las statements que tiene nuestra implementación de PL/0.

```javascript
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
```

#### ASSIGNATION

Permite asignar un valor a una variable.

```javascript
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
```

#### CALL

Call almacena un identificador al que llamará posteriormente.

```javascript
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
```

#### BEGIN-END

El bloque begin - end es muy importante porque nos permite agrupar múltiples statements y ejecutarlas una tras otra, de otro modo la gramática no lo permitiría. Nótese que a la función *ZERO\_OR\_MORE* se le pasa una función que declaramos en el cuerpo de *BEGIN\_END* para asegurarnos de que tras cada statement hay un ;

```javascript
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
```

#### IF

La sentencia if requiere obligatoriamente de un else para poder ser procesado por la virtual machine de Egg.

```javascript
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
```

#### WHILE

El while do solo admite una condición y un statement, en caso de querer ejecutar más de una sentencia es necesario utilizar como ya se ha mencionado previamente un begin-end.

```javascript
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
```

#### PRINT

Print es un método que no estaba definido en la fuente de la que obtuve la gramática PL/0 pero que he añadido para facilitar la visualización de los resultados.

```javascript
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
```

#### CONDITION

En esta regla declaramos un array de operadores de comparación que pueden tener nuestras condiciones e iniciamos una búsqueda. Desde el primer momento que encontramos alguno de dichos operadores creamos un nodo cuyos hijos serán dos expresiones, que serán las que posteriormente se evalúen en la virtual machine.

```javascript
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
```
#### PROCEDURE

Un procedure consiste simplemente en asignar un bloque de código de una variable.

```javascript
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
```

#### BLOCK

Un bloque de código puede ser una declaración o cero o más procedimientos, en cualquiera de estos dos casos siempre debe seguir un statement.

```javascript
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
```

#### VAR

Var es el nombre que recibe la función que implementa la declaración de una variable.

```javascript
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
```


#### PROGRAM

El programa engloba el bloque principal y debe terminar en un punto.

```javascript
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
```


### RETO

#### ARRAY

El reto consiste en añadir arrays a nuestra gramática. Para ello he añadido una nueva regla de producción llamada _array_ a la que se llega por medio de la regla _factor_. Consiste simplemente en dos llaves que engloban zero o más expressions delimitadas por una coma.

```
array = "[" [expression {"," expression}] "]"
```

```javascript
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
```
