# PRÁCTICA AÚN NO FINALIZADA
# Parser Predictivo Descendente Recursivo para la gramática PL/0

La gramática a implementar es la que sostiene el lenguaje de programación **PL/0** creado por **Niklaus Wirth** y que tiene la siguiente forma:

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
 procedure = {"procedure" ident ";" "begin" block "end"}
 object_declaration = "object" identifier ["extends" identifier] ";" "begin" { procedure | assignation } "end"
 object_access = ident { "." ident | "[" expression "]"}

 object_declaration = "object" ["extends" identifier] "begin" { procedure | assignation } "end"


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
