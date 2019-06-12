const lexer = require("./lexer.js")
const parser = require("./parser.js");
const inspect   = require("util").inspect;
const program = require('commander');
const json2AST  = require("./json2ast.js");
const registry = require("./registry.js");
const version_ = require("../package.json").version
var ins         = (x) => inspect(x, {depth:null});

program
  .version(version_)
  .option('-r, --run', 'Run a program from the example dir')
  .option('-t, --tree', 'Display an abstract syntax tree of an example located in the example dir')
  .option('-d, --description', 'Displays a description of the program')

program.parse(process.argv);


if (program.run){
  let ast_ = parser.parse("../examples/" + process.argv[3]);
  console.log(ins(ast_.evaluate(registry.topEnv)));
};
if (program.tree){
  let ast_ = parser.parse("../examples/" + process.argv[3]);
  console.log(ins(ast_))
};