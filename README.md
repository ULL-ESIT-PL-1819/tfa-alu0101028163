# PRÁCTICA AÚN NO FINALIZADA
# Parser Predictivo Descendente Recursivo para la gramática PL/0

La gramática a implementar es la que sostiene el lenguaje de programación **PL/0** creado por **Niklaus Wirth** y que tiene la siguiente forma:

```
program = block "."

 block =
     ["var" ident {"," ident} ";"]
     {"procedure" ident ";" block ";"} {statement ";"}

 assignation =  ident ":=" (expression)
 call = "call" ident
 begin_end = "begin" statement {";" statement } "end"
 if = "if" condition "then" statement "else" statement
 while = "while" condition "do" statement
 print = "print" "(" expression ")"

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
     ident {"[" expression "]"}
     | number
     | "(" expression ")"
     | array

  array = "[" [expression {"," expression}] "]"

```
