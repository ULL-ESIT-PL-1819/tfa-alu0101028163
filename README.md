# Procesadores de lenguajes 2019: Trabajo de fin de asignatura


## Notas

A pesar de estar basado el tfa en PL/0 al igual que la práctica 8, el código que se ha utilizado ha sido completamente reescrito desde cero desde otro enfoque y la gramática ha sido modificada.

Todos los ejemplos utilizados a lo largo del informe se hayan en el directorio examples del proyecto.

A lo largo del informe se definen las distintas fases del análisis y sus correspondientes implementaciones, por lo tanto las dudas que surgen en una etapa pueden estar respondidas en otra.

## Gramática 

La gramática a implementar está fundamentada en la del lenguaje de programación **PL/0** creada por **Niklaus Wirth** y ha sido modificada para adaptarse a un enfoque personal. La **gramática original** tiene la forma:

```
program = block "." .

block = [ "const" ident "=" number {"," ident "=" number} ";"]
        [ "var" ident {"," ident} ";"]
        { "procedure" ident ";" block ";" } statement .

statement = [ ident ":=" expression | "call" ident 
              | "?" ident | "!" expression 
              | "begin" statement {";" statement } "end" 
              | "if" condition "then" statement 
              | "while" condition "do" statement ].

condition = "odd" expression |
            expression ("="|"#"|"<"|"<="|">"|">=") expression .

expression = [ "+"|"-"] term { ("+"|"-") term}.

term = factor {("*"|"/") factor}.

factor = ident | number | "(" expression ")".
```

> Nótese que {} simboliza "cero o más repeticiones" y [] simboliza opcionalmente.  

A continuación se expone la gramática modificada y se explica brevemente en qué han consistido dichas modificaciones:

```
program = block

```

En primer lugar el programa no tiene que finalizar con un punto, se espera que una vez finalice el lookahead apunte a null.

```
 block =
     ["const" ident ":=" expression {"," ident ":=" expression} ";"]
     ["var" ident {"," ident} ";"]
     { procedure } { statement }

```

En líneas generales toda la gramática sustituye como operador de asignación el "=" por el ":=" como se puede apreciar en la regla _block_. Es bastante similar en su estructura a excepción de dos factores:

1.  La regla **procedure** cambia totalmente ( será descrita posteriormente ) y ahora no es obligatorio que se declare un **statement** y además _se pueden declarar más de uno_.

```
 procedure = {"procedure" ident "(" [expression { "," expression }] ")" ";" "begin" block "end"}
 ```
 
 Los procedures a diferencia de la gramática original pueden ahora recibir argumentos y además su cuerpo se ve encapsulado por las keywords "begin" y "end". La decisión de utilizar estas palabras clave para encapsular el bloque surge simplemente de la necesidad de poner delimitar el código de una manera más limpia y facilitar la comprensión.
 
 Un ejemplo de procedure podría ser *procedure_declaration.pl* :
 
 ```javascript
 var c;
 procedure b();
 begin
   var a;
   a := 2;
   c := 4;
 end
 call b();
 ```
 
Como se puede apreciar la forma de llamar a un procedure es utilizando la keyword **call** que será detallada en la gramática posteriormente.

 ```
 statement =
       assignation
     | call ["(" [expression {"," expression}] ")"]
     | begin_end
     | if
     | while
     | print

```

Llegamos a los statements del lenguaje, aquí cabe destacar que para hacer más limpio el código he añadido un delimitador final ";" pero solo hay tres statements que lo llevan, siendo estos _call_, _assignation_ y _print_ esto es porque los restantes serían *begin_end* que utiliza para encapsular el código las palabras claves _begin_ y _end_ y las reglas _if_ y _while_ que terminan llamando a otro statement. De este modo pasamos de tener un código como podría ser:

```javascript
begin
  if 2 < 3 then
    arg := 2;;
end;
```

a obtener algo más limpio:

```javascript
begin
  if 2 < 3 then
    arg := 2;
end
```

```
object_declaration = "object" ["extends" identifier] "begin" { procedure | assignation } "end"
```

Inicialmente los identificadores hacían referencia solamente a números u operaciones aritméticas, no obstante **se introduce en la gramática el uso de objetos**.
Los objetos son declarados del modo expresado arriba y tienen la posibilidad de heredar de otros objetos por medio del uso de la palabra clave **extends**.

Por ejemplo *object_declaration.pl* :


```javascript
obj := object
        begin
          a := 1;
          procedure b();
          begin
            c := 2;
            d := 3;
          end
          e := 3;
          f := [1,3,[4,5]];
        end
        ;
```


```
object_access = ["this" "."] ident { "." ident | "[" expression "]"}
```

Esta regla es un tanto confusa por que es utilizada en varias ocasiones distintas. En primer lugar se utiliza para acceder simplemente a un identificador, tal que:

```javascript
a := 1;
```

donde "a" se obtendría a partir de derivar la regla *object_access*.  
En segundo lugar es utilizada para acceder a propiedades de los objetos, como por ejemplo:

```javascript
obj := object
        begin
          a := 1;
        end
        ;
print(obj.a);
```

Y en tercer lugar se utiliza cuando se quiere acceder a propiedades internas del objeto por medio de la palabra clave **this**.

```javascript
obj := object
        begin
          a := 1;
          procedure b();
          begin
            print(this.a);
          end
        end
        ;

  
call obj.b();
```
Comentadas la reglas de producción anteriores es entonces fácil deducir el funcionamiento de los statements de la gramática que se mantiene igual:

```
 assignation =  object_access ":=" (object_declaration | expression) ";"
 call = "call" object_access "(" [expression (',' expression)*] ")" ";"
 begin_end = "begin" { statement } "end"
 if = "if" condition "then" statement
 while = "while" condition "do" statement
 print = "print" "(" expression ")" ";"
 
```
 
 ```
 array = "[" [expression {"," expression}] "]"

```
  
Se introducen también a diferencia de PL/0 original los arrays.

```
 condition = expression ("="|<"|"<="|">"|">=") expression

 expression = ["+"|"-"] term {("+"|"-") term}

 term = factor {("*"|"/") factor}
```

```
 factor = 
       object_access
     | number
     | "(" expression ")"
     | array

```

La regla **factor** cambia y se añaden tanto los arrays como el acceso a objetos.  
**En resumen toda la gramática se convierte en** :

```
program = block "."

 block =
     ["const" ident ":=" expression {"," ident ":=" expression} ";"]
     ["var" ident {"," ident} ";"]
     { procedure } { statement }

 assignation =  object_access ":=" (object_declaration | expression) ";"
 call = "call" object_access "(" [expression (',' expression)*] ")" ";"
 begin_end = "begin" { statement } "end"
 if = "if" condition "then" statement
 while = "while" condition "do" statement
 print = "print" "(" expression ")" ";"
 
 array = "[" [expression {"," expression}] "]"
 procedure = {"procedure" ident "(" [expression { "," expression }] ")" ";" "begin" block "end"}
 object_declaration = "object" ["extends" identifier] "begin" { procedure | assignation } "end"
 object_access = ["this" "."] ident { "." ident | "[" expression "]"}



 statement =
       assignation
     | call ["(" [expression {"," expression}] ")"]
     | begin_end
     | if
     | while
     | print

 condition = expression ("="|<"|"<="|">"|">=") expression


 expression = ["+"|"-"] term {("+"|"-") term}

 term = factor {("*"|"/") factor}

 factor = 
       object_access
     | number
     | "(" expression ")"
     | array
```

## Analizador léxico 

El analizador léxico ha sido reescrito con la idea en mente de ser lo más modular posible y no violar el *Open-closed principle*.

Disponemos de una serie de variables importantes a mencionar:

```javascript
var i = 0;        # La posición actual del programa que se está analizando.
var offset = 0;   # El offset de la línea actual.
var lineno = 1;   # La línea actual del programa que se está analizando.
```

```javascript
const KEYWORDS = ["CONST","VAR","PROCEDURE","CALL","BEGIN","END","IF","THEN","WHILE","DO","PRINT", "OBJECT", "EXTENDS", "THIS"];
```

Aquí se encuentran todas las palabras clave de nuestro lenguaje, para añadir o quitar una palabra clave basta con modificar esta lista.

```javascript
const WHITES = {

  line_break: {
    id: 'line_break',
    regex: XRegExp(`[\\n\\r]+`,`y`),
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  }
 # [ ... ]
}
```

Este objeto alberga todos los tokens que son considerados como blancos, es decir, que no deben de ser devueltos sino ignorados, estos serían los *saltos de línea*, *comentarios* y *espacios en blanco*.

La estructura de cada propiedad del objeto es similar para cada token, y dispone de:

* Un identificador, **id** que representa el nombre del token.
* Una expresión regular, **regex** , que casa con el token en cuestión.
* Una función **parse** que devuelve la información necesaria para el tokenizador, la mayoría de estas funciones son similares pero algunas poseen ligeros cambios, como el caso de _string_ o _number_.

```javascript
const TOKENS = {

  number: {
    id: 'number',
    regex: XRegExp(`\\d+\\.?(\\d+[eE][+-]?\\d+)?`,'y'),
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, Number(m[0]), m[0].length, this.skip);
      }else return null;
    }
  }
  # [ ... ]
}
```

El objeto **TOKENS** es análogo en su estructura a **WHITES** la diferencia es que estos tokens sí se devuelven a la hora de realizar el análisis.

La función utilizada en __parse__ es :

```javascript
var create_token_info = function(type, value, length) {
  return {
    type: type,
    value: value,
    length: length,
  }
}
```

Que devuelve un objeto con una serie de campos como el tipo del token, el valor del token y la longitud de este ( necesarios para la creación del token durante de la tokenización )


Mi interés estaba en que el analizador léxico devolviera cada token según era requerido para evitar analizar léxicamente un programa entero, ya que este podría contener errores y consideraba que para programas grandes quizás fuera una pérdida de recursos innecesaria. La función que devuelve cada token según se le pide es:

```javascript
function lex(input){

  if(i < input.length){
    parse_whites(input);
    return parse_tokens(input);
  }else return null;

}
```

Que está compuesta por:

```javascript
function parse_whites(input){
  whites_found = true;
  while(whites_found){
    whites_found = false;
    for(const white_type in WHITES){

      WHITES[white_type].regex.lastIndex = i;
      const match = WHITES[white_type].parse(input);

      if(match){
        whites_found = true;
        if(match.type == 'line_break'){
          lineno += 1;
          offset = 0;
        }else offset += match.length;

        i += match.length;

      }
    }
  }
}
```

La cual mientras encuentra blancos sigue iterando y actualizando los valores de *i*, *lineno* y *offset* previamente explicados.

La otra función que compone _lex_ es:

```javascript
function parse_tokens(input){
  matched = false;
  for(const token_type in TOKENS){
    TOKENS[token_type].regex.lastIndex = i;
    const match = TOKENS[token_type].parse(input);
    if(match){
      matched = true;

      token = create_token(match.type, match.value, lineno, offset);

      offset += match.length;
      i += match.length;

      return token;
    }
  }

  if(!matched){
    output_error_msg(i, input);
  }
}
```

Si se encuentra alguna coincidencia en los tokens posibles para nuestro programa entonces se crea un token por medio de la función **create_token** y se actualizan los valores del offset y de la i. En caso de que no se haya encontrado coincidencia habremos obtenido un token que no pertenece a nuestra gramática y por lo tanto enviamos un mensaje de error.


La función create_token:

```javascript
var create_token = function(type, value, lineno, offset){
  return {
    type: type,
    value: value,
    lineno: lineno,
    offset: offset
  }
}
```

## Analizador sintáctico


El parser posee como variables globales que se utilizan a lo largo del programa:

```javascript
var lookahead = null;   # Token actual que se está analizando
let program = null;     # Cadena que contiene todo el programa
var { tokenize_program, TOKENS, lex } = require("./lexer.js"); # Funciones del lexer.
```

Para empezar comentaremos las principales funciones que se ejecutan constantemente en el programa y que llamaremos **funciones auxiliares** porque se utilizan independientemente de la regla de producción para las tareas más triviales.

### Funciones auxiliares
##### assert_type & assert_value

```javascript
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
```

Estas funciones como su nombre indica se encargan de comprobar que el valor o tipo del lookahead coincide con el esperado, no devuelven nada excepto un error en caso de haberlo.

##### is_word & is_value

```javascript
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
```

Nuestro objetivo es construir un **abstract syntax tree** que pueda ser reconocido por la **egg virtual machine**, necesitamos para ello realizar una pequeña conversión y clasificar nuestros tokens como tipo **value** o tipo **word**. Estas funciones nos permiten saber si nuestros tokens son de tipo word o de tipo value.

##### shift

```javascript
function shift(){
  old_lookahead = lookahead;
  lookahead = lex(program);
  return old_lookahead;
}
```

Esta función devuelve el lookahead actual y automáticamente actualiza el lookahead requiriéndole al lexer del siguiente token.

##### get_token & get_token_of_type

```javascript
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
```

Ambas funciones son similares, la diferencia está en que a la primera no solo se le pasa el tipo de token que se desea obtener sino también el valor exacto que este debe tener, es utilizada para obtener keywords concretas.


##### make_word

```javascript
function make_word(token){
  return {
          type: "word",
          value: token
        };
}
```

Devuelven un objeto que corresponde a un token de tipo _word_.

##### egg_apply

```javascript
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
```

Crea un objeto apply y como este siempre necesita que su operador sea una word se encarga de convertir cualquier token que no lo sea primero.


##### initialize

```javascript
function initialize(){
  lexer.initialize();
  lookahead = lex(program);
}
```
La función initialize inicializa el lexer, es decir, asigna sus variables globales a los valores iniciales para el análisis léxico y carga el primer token en la variable lookahead.


##### parse

```javascript
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
```

Esta función constituye el punto de arranque del programa, lee la ruta del programa .pl que se desea parsear, si no hay problema se inicializa el parser y se parsea el programa. Por último se retorna el ast que se obtiene tras ser transformado de formato JSON a objetos javascript.

### Reglas de producción

Todas las reglas de producción devuelven un objeto de tipo **apply** que es un objeto que puede ser evaluado por la **egg virtual machine**, estos objetos se van englobando unos dentro de otros hasta que finalmente tenemos un único objecto apply a evaluar.

##### parse_program

```javascript
function parse_program(){
  const block = parse_block();
  if(lookahead){
    throw SyntaxError(`Expected EOF but got ${lookahead.value} instead`);
  }
  return block;
}
```
El final del programa lo marca un lookahead que debe de ser null.

##### parse_block

```javascript
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
  }

  block_statements = []
  if(constants)  block_statements.push(...constants);
  if(variables)  block_statements.push(...variables);
  if(procedures) block_statements.push(...procedures);
  if(statements) block_statements.push(...statements);

  return egg_apply("do", ...block_statements);

}
```

##### parse_constants

```javascript
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
```

Ejemplo *simple_expression.pl* :

```javascript
const a := (3 + 3 + 2);
```

Como cada regla será visitada, retrocediéndose en caso de que no se obtenga el token esperado, lo primero que se hace es comprobar que el lookahead coincide con lo que se espera, en caso negativo se retorna un array vacío y en caso positivo se retorna en este caso un array que contiene apply's de definición.

Esto significa que la eggvm interpretará dicho objeto como una definición de una variable con un valor determinado.

##### parse_variables 

```javascript
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
```

Ejemplo *simple_declaration_2.pl* :

```javascript
var a;
a := 1+(3*2);
```

Funciona de manera análoga a **parse_constants** con la diferencia de que las variables se asginan por defecto a cero.


##### parse_procedure

```javascript
function parse_procedure(){
  if(lookahead && lookahead.value === 'procedure' && lookahead.type === 'keyword'){
    get_token("procedure","keyword");
    const id = get_token_of_type('identifier'); # Identificador del procedure.
    get_token_of_type("lpar");
    const arguments = [];
    let expression;
    if(expression = parse_expression()){        # Obtención de los atributos.
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
    const block = parse_block();                # Obtención del cuerpo de la función
    get_token('end','keyword');
    return egg_apply("def", id,
            egg_apply("fun", ...arguments, 
            egg_apply("do", ...block.args)));
  }else return null;
}
```

Ejemplo *procedure_declaration* :

```javascript
  var c;
  procedure b();
  begin
    var a;
    a := 2;
    c := 4;
  end
  call b();
```

Los procedures son funciones y por lo tanto tienen un cuerpo que se ejecuta y disponen de la opción de recibir parámetros para su ejecución, pero además, durante su definición se les asigna un nombre que será el identificador por el cual será posible llamarlos.


##### parse_statement

```javascript
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
```

La regla **parse_statement** sirve como switch de todos los posibles tipos de statement que tiene la gramática, nótese que entre las posibilidade están:

* !lookahead : que simboliza el haber llegado al final del programa.
* null       : al que se llega cuando ninguna de las otras reglas devuelve un apply.


##### parse_print_stmt

```javascript
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
```

Ejemplo *print_number.pl* :

```javascript
var a; 
begin 
  a := 20;
  print(1+2+3);
end
```

##### parse_while_stmt

```javascript
function parse_while_stmt(){
  if(lookahead && lookahead.value === 'while' && lookahead.type === 'keyword'){
    get_token('while','keyword');
    const condition = parse_condition();
    get_token("do", 'keyword');
    const statement = parse_statement();
    return egg_apply("while", condition, statement);
  }
}
```

Ejemplo *while_statement.pl* :

```javascript
procedure primes();
begin
  var arg;
  begin
    arg := 1; 
    while arg < 3 do
      begin
      arg := arg + 1;
      end
  end
end
call primes();
```

##### parse_if_stmt

```javascript
function parse_if_stmt(){
  if(lookahead && lookahead.value === 'if' && lookahead.type === 'keyword'){
    get_token('if', 'keyword');
    const condition = parse_condition();
    get_token('then', 'keyword');
    const statement = parse_statement();
    return egg_apply("if", condition, statement);
  }else return null;
}
```

Ejemplo *if_statement_1.pl* :

```javascript
procedure primes();
begin
	var arg;
	begin
		if 2 < 3 then
			arg := 2;
	end
end
call primes();
```

##### parse_begin_stmt

```javascript
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
```

Ejemplo *begin_end_example.pl* :

```javascript
procedure primes();
begin
var arg;
	arg := 2;
	begin
		arg := arg + 1;
	end
end
call primes();
```

##### parse_call

```javascript
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
```

En el **Call** statement quieres en primer lugar obtener el objeto que vas a llamar, que puede ser desde un procedure descrito en el bloque a uno definido como una propiedad de un objeto, de parsear el identificador y sus propiedades se encargará la regla **parse_object_access** que devolverá un identificador o múltiples. En caso de que se devuelvan múltiples identificadores el objeto al que se llama será obtenido por medio de un apply de tipo **element**.

Esto último sería por ejemplo el caso de *object_inside_access.pl* :

```javascript
obj := object
        begin
          a := 1;
          procedure b();
          begin
            print(this.a);
          end
        end
        ;  
call obj.b();
```

El resto de la regla obtiene los parámetros que se le pasan al objeto que llama. Nótese que, aunque el objeto que llama no disponga de parámetros el uso de paréntesis es obligatorio.


##### parse_assign_stmt

```javascript
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
```

En esta regla queremos diferenciar dos casos posibles, dependiendo de la parte izquierda de la asignación. Respecto a la parte izquierda, sabiendo que **parse_object_access** devuelve un array de longitud uno ( si es un único identificador ) o más si es un acceso a un objeto / array , el resultado final a devolver será una asignación **:=** en el primer caso o un apply de tipo **set** en el segundo ( que funciona de manera similar a una asignación solo que debe ir recorriendo cada una de las dimensiones o propiedades hasta llegar a la deseada ).

Ejemplo **array_access.pl** :

```javascript
var a;
a := [1+5*7,[1,2], 1];
a[0] := 1;
print(a);
```

en el caso de a[0] estaríamos hablando de una asignación por medio de set, ya que accedemos al elemento con índice cero del array.

La parte derecha de la asignación puede ser una expresión lo cual implica una operación aritmética, un array o un acceso a un objeto o puede ser la declaración de un objeto por medio de la regla **parse_object_declaration**.


##### parse_object_declaration

```javascript

function parse_object_declaration(){
  if(lookahead && lookahead.value === 'object' && lookahead.type === 'keyword'){
    get_token("object","keyword");    
    
    let object_apply = null;
    if (lookahead.value === 'extends'){
      get_token("extends","keyword");
      const parent_object = get_token_of_type('identifier');
      object_apply = egg_apply("extends", parent_object);
    }
    
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
      object_apply.args.push(...attributes);
      return object_apply;
    }else return egg_apply("object", ...attributes);
  }else return null;
}

```


La declaración de un objeto comienza siempre con la palabra clave **object** y puede ir seguida de **extends** en caso de que este objeto derive de otro, si este es el caso el apply es distinto aunque recibe los mismos argumentos más el identificador del objeto padre.

Las propiedades del objeto estarán englobadas dentro de las palabras clave _begin_ y _end_.

##### parse_object_access

```javascript
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
```

El acceso a propiedades de objetos se ve caracterizado por el uso del token **dot** que no es más que azúcar sintáctico para su equivalente, los **brackets**, de modo que ambos se utilizan intercambiablemente aunque se parsean de modos distintos.

Asumimos que el primer objeto que precede a todos los demás seguidos de punto es el objeto que llama a las propiedades, sabiendo esto, está la peculiaridad del uso del **this** que puede ser el objeto que llama.

Todos los objetos que suceden al primero pasan a ser automáticamente values, esto es muy importante para el correcto funcionamiento de los métodos element y set.

Nótese que esta regla no devuelve un apply sino un array que contiene el objeto al que se accede y sus propiedades ( si las tiene ) es en reglas superiores donde se evalúa que realizar con los valores que retorna.

Ejemplo *object_inside_access_2.pl* :

```javascript
obj := object
        begin
          a := 1;
          c := 2;
          procedure b();
          begin
            print(this.a + this.c);
          end
        end
        ;

  
call obj.b();
```

##### parse_array

```javascript
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
```

El lenguaje soporta ahora el uso de arrays que no es más que un apply cuyos argumentos son una lista de expresiones, lo cual significa que se permite el uso de arrays multidimensionales.

Ejemplo *array_access.pl* :

```javascript
var a;
a := [1+5*7,[1,2], 1];
a[0] := 1;
print(a);
```

##### parse_condition

```javascript
function parse_condition(){
   const expression1 = parse_expression();
   const operator = get_token_of_type('comparison_op');
   const expression2 = parse_expression();
   return egg_apply(operator, expression1, expression2);
}
```

Por ejemplo:

```javascript
		2 < 3 
```

```javascript
		a < 3 
```

```javascript
		a <= b 
```

##### parse_expression

```javascript
function parse_expression(){
  let term1 = parse_term();
  while(lookahead && lookahead.type === 'add_sub_op'){
    const operator = get_token_of_type('add_sub_op');
    const term2 = parse_term();
    term1 = egg_apply(operator, term1, term2);
  }
  return term1;
}
```

Por ejemplo:

```javascript
  2 + 3 + 4
```
```javascript
  a - b + 4
```

##### parse_term

```javascript
function parse_term(){
  let factor1 = parse_factor();

  while(lookahead && lookahead.type === 'mult_div_op'){
    const operator = get_token_of_type('mult_div_op');
    const factor2 = parse_factor();
    factor1 = egg_apply(operator, factor1, factor2);
  }
  return factor1;
}
```

Por ejemplo:

```javascript
  3 * 4
```

```javascript
  a * 4
```


##### parse_factor

```javascript
function parse_factor(){
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
```

## Egg Virtual Machine

La máquina virtual de Egg también ha sufrido una serie de modificaciones para ampliar su funcionalidad, algunas de ellas requeridas en prácticas posteriores que o bien no son idénticas o nunca fueron implementadas pero se necesitaron para este proyecto.


### element

```javascript
topEnv["[]"] = topEnv["element"] = topEnv["<-"] = function(calling_object, ...args) {
  
    if(args.length < 1){
	   throw SyntaxError("Expected at least 2 arguments");
  }
  
  let result = calling_object;
  for(let i = 0; i < args.length; i++){
  	result = result[args[i]];
  }

  return result;
  
};
```

La función element tiene como objetivo obtener una propiedad de un objeto, ya sea por ejemplo el atributo de un Object o el elemento en una posición concreta de un array.

El primer argumento representa el objeto en sí del cual se obtiene la propiedad y lo que se hace es ir iterando hasta llegar a la propiedad deseada y finalmente retornarla.


### set

```javascript
specialForms["set"] = specialForms["="] = function(args, env) {
  if (args.length < 3 || !args[0].type === 'Word') {
    throw new SyntaxError('Bad use of set');
  }
  
  
  obj = args[0].value;
  indexes = args.slice(1, args.length - 1);
  value = args[args.length - 1].evaluate(env);

  
  for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
    if (Object.prototype.hasOwnProperty.call(scope, args[0].value)) {

      obj = scope[args[0].value];
      for(var i = 0; i < indexes.length - 1; i++){
        obj = obj[indexes[i].value];
      }
      obj[indexes[indexes.length-1].value] = value;      
      return value;
    }
  }

};
```

Set sirve para asignar a las propiedades de un objeto un valor concreto, por lo que se diferencian tres partes:

1.  El objeto en sí : **obj**
2.  Sus propiedades : **indexes**
3.  El valor        : **value**

El primer bucle se encarga de encontrar el scope del objeto que queremos modificar y el funcionamiento del bucle interno es parecido al de element a diferencia de que no iteramos hasta el último elemento sino hasta el penúltimo para igualar este último elemento ( que es el objetivo ) al valor deseado.



### fun ( y this )

```javascript
specialForms['->'] =specialForms['fun'] = function(args, env) {
  if (!args.length) {
    throw new SyntaxError('Functions need a body.')
  }

  function name(expr){
    if (!expr.type === 'Word'){
      throw new SyntaxError('Arg names must be words');
    }

    return expr.value;
  }

  let argNames = args.slice(0, args.length - 1).map(name);
  let body = args[args.length - 1];
  
  return function() {
    if ((arguments.length - 1) != argNames.length) {
      throw new TypeError('Wrong number of arguments');
    }

    let localEnv = Object.create(env);
    for (let i = 0; i < arguments.length - 1; i++) {
      localEnv[argNames[i]] = arguments[i + 1];
    }
    
    localEnv["this"] = arguments[0];
    
    return body.evaluate(localEnv);
  };
};
```

Se encarga de definir una función, se utiliza en el caso de los procedures. He añadido una modificación para el uso del this, y es que a cada función definida debe de pasársele como primer argumento el "this", es decir, el objeto sobre el que se ejecuta, de modo que en su local environment se define el "this" como ese objeto.



### call ( y this )

```javascript
specialForms['call'] = function(args, env){
  
  let this_value = null;
  if(args[0].hasOwnProperty('operator') && args[0].operator.value === 'element'){
     this_value = env[args[0].args[0].value];
  }
  
  var calling_object = args[0].evaluate(env);
  var function_args = args.slice(1,args.length).map(elem => elem.evaluate(env));
  return calling_object(this_value, ...function_args);
}
```

En la función call lo primero que se hace es comprobar si la función que se llama es una propiedad de un Object de PL/0, si este es el caso estaremos llamando a un atributo por ejemplo:

```javascript
  call obj.funcion()
```

en este caso lo que hacemos es definir el **this** que vamos a pasarle como primer argumento a la función como dicho objeto que la llama. En caso de que no sea una propiedad de un Object la función que se está llamando el this será igual a null.


Esto implica que el uso del this está limitado a las funciones y referencia al objeto que las contiene.

### object

```javascript
specialForms['object'] = function(args, env){

 let object = new function(){};
 for(let i = 0; i < args.length; i++){
   const arg = args[i];
   const arg_id = arg.args[0].value;
   let arg_value = arg.args[1].evaluate(env); 
   object[arg_id] = arg_value;
 }
 

 return object;
}
```

El objeto se crea de una manera muy simple, en primer lugar se define el objeto y a continuación de manera iterativa se le van asignando las propiedades obteniendo el nombre y el valor.  
Hay que tener en cuenta que las propiedades de los objetos solo pueden ser procedimientos o asignaciones por lo que siempre se va a tener en la variable **arg** durante cada iteración un apply de asignación ya sea de tipo "def" o de tipo ":=" cuyo primer argumento es la parte izquierda (identificador) de la asignación y cuyo segundo argumento es la parte derecha de la asignación. Es por eso que se distinguen asignandose a las variables **arg_id** y **arg_value**.

### extends

```javascript
specialForms['extends'] = function(args, env){
    
  let parent_object = args[0].evaluate(env);
  let child_object  = {...parent_object }

  let object_properties = args.slice(1, args.length);
  for(let i = 0; i < object_properties.length; i++){
      obj_property = object_properties[i];
      property_name = obj_property.args[0].value;
      property_value = obj_property.args[1].evaluate(env);
      child_object[property_name] = property_value;
  }
  
  return child_object;
  
}
```

La manera de implementar herencia es simplemente obtener en primer lugar el objeto del que se desea heredar sus propiedades y copiarlas a un nuevo objeto que definimos como **child_object**. Una vez realizado esto el proceso es idéntico al realizado en la función **object**.

Ejemplo *inheritance_declaration.pl* :

```javascript
obj := object
        begin
          a := 2;
        end
        ;
obj2 := object extends obj
        begin
          x := 1;
        end
        ;
  
obj2.a := 1;

print(obj);
print(obj2);
```


## Estructura de ficheros

```
├── tfa-alu0101028163
  ├── examples                    # Aquí se encuentran todos los ejemplos que han sido testeados y funcionan correctamente
  ├── lib                         # Aquí se encuentra el código fuente, parte del código fuente, la eggvm concretamente ha sido copiada
                                  # de prácticas anteriores por lo que hay ficheros que se han copiado también para evitar problemas de 
                                  # compatibilidad pero que no se usan, aqui se especifican los utilizados.
     ├── main.js                  # Fichero utilizado para comprobar ejemplo a ejemplo sus funcionamientos, los asts que se obtienen... etc.
     ├── ast.js                   # Abstract Syntax Tree que reconoce eggvm.
     ├── json2ast.js              # Fichero que convierte un ast en formato JSON a un ast reconocido por la eggvm.
     ├── lexer.js                 # El analizador léxico
     ├── parser.js                # El analizador sintáctico
     ├── registry.js              # Las funciones de la eggvm
    
  ├── test                        # En este directorio se encuentran los tests realizados.
```

## Funcionamiento del programa

Para comprobar el funcionamiento del programa se escribe un ejemplo en el directorio **examples** siguiendo la gramatica definida en este README y a continuación se sitúa la terminal en el directorio lib y se ejecuta el fichero **main.js** utilizando las opciones -t o -r, tal que, por ejemplo:

```bash
$ node main.js -t array_access.pl

Apply {
  operator: Word { value: 'do' },
  args: [
    Apply {
      operator: Word { value: 'def' },
      args: [ Word { value: 'a' }, Value { value: 0 } ]
    },
    Apply {
      operator: Word { value: ':=' },
      args: [
        Word { value: 'a' },
        Apply {
          operator: Word { value: 'array' },
          args: [
            Apply {
              operator: Word { value: '+' },
              args: [
                Value { value: 1 },
                Apply {
                  operator: Word { value: '*' },
                  args: [ Value { value: 5 }, Value { value: 7 } ]
                }
              ]
            },
            Apply {
              operator: Word { value: 'array' },
              args: [ Value { value: 1 }, Value { value: 2 } ]
            },
            Value { value: 1 }
          ]
        }
      ]
    },
    Apply {
      operator: Word { value: 'set' },
      args: [ Word { value: 'a' }, Value { value: 0 }, Value { value: 1 } ]
    },
    Apply {
      operator: Word { value: 'print' },
      args: [ Word { value: 'a' } ]
    }
  ]
}
```

```bash
$ node main.js -r array_access.pl

[ 1, [ 1, 2 ], 1 ]
[ 1, [ 1, 2 ], 1 ]
```

## Ejecución de los tests

Para ejecutar los tests basta con situarse en el directorio raíz del proyecto y ejecutar en la terminal:

```bash
$ npm test

> tfa-alu0101028163@1.0.0 test /home/aalvarez/Documents/UNIVERSITY/PL/tfa/tfa-alu0101028163
> mocha test/**/*.js


  ․․․․․․․․․․․․․․․․․․․․

  20 passing (296ms)

```