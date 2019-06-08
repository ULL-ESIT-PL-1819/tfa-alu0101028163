const lexer = require("./lexer.js")
const parser = require("./parser.js");
const inspect   = require("util").inspect;
var ins         = (x) => inspect(x, {depth:null});

// parser.initialize("3 * (4 + 5)");
// console.log(ins(parser.parse_expression()));

// parser.initialize("call a(1,2,3,m,y)");
// console.log(ins(parser.parse_call_stmt()));

// parser.initialize("begin a := 1; b[0][1] := a; end")
// console.log(ins(parser.parse_begin_stmt()));

// program  = "if a < 20";
// program += "{"
//   program += "a := 1;"
//   program += "b := 2;"
// program +=   "if b < 30"
//     program += "{"
//     program +=   "then b := 40;"
//     program += "}"
// program += "}"

parser.initialize("if a < 20 then a := 1; b := 2; if b < 50 then x := 20;;")
console.log(ins(parser.parse_if_stmt()));
