# Procesadores de lenguajes 2019: Trabajo de fin de asignatura

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
     {class}
     ["const" ident ":=" expression {"," ident ":=" expression} ";"]
     ["var" ident {"," ident} ";"]
     {procedure} {statement}

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


