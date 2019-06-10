const lexer = require("./lexer.js")
const parser = require("./parser.js");
const inspect   = require("util").inspect;
const json2AST  = require("./json2ast.js");
const registry = require("./registry.js")
var ins         = (x) => inspect(x, {depth:null});

// console.log(ins(parser.parse("../examples/simple_expression.pl")))

// parser.parse_test("class a; begin a := 1; procedure b; begin c := 3; end end")
// console.log(ins(parser.parse_class()));

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

// parser.initialize("if a < 20 then a := 1; b := 2; if b < 50 then x := 20;;")
// console.log(ins(parser.parse_if_stmt()));

// parser.initialize("var a, b, c;");
// console.log(ins(parser.parse_variables()));


// parser.initialize("const a := 20, c := 30;")
// console.log(ins(parser.parse_constants()));

// parser.initialize("procedure a; begin const a := 1; end")
// console.log(ins(parser.parse("../examples/class.pl")));
// 
// 
// console.log(ins(parser.parse("../examples/simple_declaration.pl")));

let ast_ = parser.parse("../examples/array_access.pl");
console.log(ins(ast_));
// ast_ = json2AST.json2AST(ast_);
// console.log(ins(ast_));
// // console.log(ins(json2AST.json2AST(ast)));
// 
console.log(ins(ast_.evaluate(registry.topEnv)));

// 
// obj = {
//   type: "word",
//   value: "do"
// }
// console.log(ins(json2AST.json2AST(obj)));
