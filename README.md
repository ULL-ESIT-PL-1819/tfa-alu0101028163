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

 assignation =  ident { "." ident | "[" expression "]"} ":=" expression ";"
 call = "call" ident { "." ident } "(" [expression (',' expression)*] ")" ";"
 begin_end = "begin" { statement } "end"
 if = "if" condition "then" statement
 while = "while" condition "do" statement
 print = "print" "(" expression ")" ";"
 
 array = "[" [expression {"," expression}] "]"
 procedure = {"procedure" ident ";" "begin" block "end"}
 class = "class" identifier ["extends" identifier] ";" "begin" { procedure | assignation } "end"


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
     ident { "." ident | "[" expression "]"}
     | number
     | "(" expression ")"
     | array

```
