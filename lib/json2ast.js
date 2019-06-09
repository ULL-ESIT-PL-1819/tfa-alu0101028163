const {Value, Word, Apply} = require("./ast.js");

function json2AST(flatObject) {
  switch(flatObject.type) {
    case 'value':
      return new Value(flatObject);

    case 'word':
      return new Word(flatObject);

    case 'apply':
    
      let operator = json2AST(flatObject.operator);
      let args = flatObject.args.map(json2AST);

      let obj = new Apply(operator, ...args);
      return obj;
    default: throw "Strange AST tree!!!"
  }
}

module.exports = {json2AST};