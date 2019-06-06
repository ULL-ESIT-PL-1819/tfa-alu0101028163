var parser = require("./parser.js")
var lexer = require("./lexer.js")
var registry = require("./registry.js")
var ast = require("./ast.js")
const inspect   = require("util").inspect;
var ins         = (x) => inspect(x, {depth:null});


// lexer.set_program_from_file("../examples/reto.pl")
// parser.get_next_token();
// var r = parser.PROGRAM();
// var x = r.evaluate(registry.topEnv)
// console.log(x)


var program = "var a; begin a:= [1,2,[4,5,6]]; print(a) end."
lexer.set_program(program);
parser.get_next_token();
var r = parser.PROGRAM();
// console.log(ins(r))
console.log(r.evaluate(registry.topEnv))
