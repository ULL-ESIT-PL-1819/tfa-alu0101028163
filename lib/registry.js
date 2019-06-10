let environment   = require("./environment.js")
let parser        = require("./parser.js")
let specialForms  = environment.specialForms;
let topEnv        = environment.topEnv;
// var pjson         = require('../package.json');
const {Value, Word, Apply} = require("./ast.js");
// let ast           = require("./ast.js")
const inspect     = require("util").inspect;
let ins           = (x) => inspect(x, {depth:null});
let REQUIRE       = require("./egg-require.js")
var XRegExp     = require('xregexp');

specialForms['program'] = function(args, env){
  let value = false;

  if(args.length != 1){
    throw "Error, un programa debe englobar su código en un único bloque."
  }

  value = args[0].evaluate(env);

  return value;
}

specialForms['class'] = function(args, env){
  const class_name = args[0].value;
  let class_properties = new function(){};
  for(let i = 1; i < args.length; i++){
    const arg = args[i];
    const arg_id = arg.args[0].value;
    let arg_value;
    if(arg.args[1].hasOwnProperty('operator') && arg.args[1].operator === 'do'){        // It's a procedure.
      arg_value = arg.args[1];
    }else arg_value = arg.args[1].evaluate(env); 
    class_properties[arg_id] = arg_value;
  }
  
  env[class_name] = class_properties;
  return env[class_name];
  
}

function iterationCopy(src) {
  let target = {};
  for (let prop in src) {
    if (src.hasOwnProperty(prop)) {
      target[prop] = src[prop];
    }
  }
  return target;
}

specialForms['new'] = function(args, env){
  
  if(args.length != 1){
    throw new SyntaxError('Bad number of args, class name must be provided.');
  }
  
  if(!env[args[0].value]){
    throw new SyntaxError('Class doesn\'t exist!');
  }
  
  return iterationCopy(env[args[0].value])
  // return {...env[args[0].value]};
  
}

specialForms['block'] = function(args, env){
  let value = false;

  args.forEach(function(arg){
    value = arg.evaluate(env);
  })

  return value;
}

specialForms['call'] = function(args, env){
  var f = args[0].evaluate(env);
  if(f.hasOwnProperty('operator')){
    return f.evaluate(env);
  }else return f;
}

specialForms['if'] = function(args, env) {
  if (args.length != 2) {
    throw new SyntaxError('Bad number of args to if');
  }

  if(args[0].evaluate(env) !== false){
    return args[1].evaluate(env);
  }else return false;
};

specialForms['while'] = function(args, env) {
  if (args.length != 2) {
    throw new SyntaxError('Bad number of args to while');
  }

  while(args[0].evaluate(env) !== false){
    args[1].evaluate(env);
  }
  // Egg has no undefined so we return false when there's no meaningful result.
  return false;
};

specialForms['do'] = function(args, env) {
  let value = false;

  args.forEach(function(arg){
    value = arg.evaluate(env);
  })

  return value;
};

specialForms["do_together"] = function(args, env){


  var value = false;

  for (var i = 0; i < args.length - 1; i++){
    value = args[i].evaluate(env);
    args[i+1].setOperator(value);
  }

  return args[args.length - 1].evaluate(env);

}


specialForms['def'] = specialForms['define'] = function(args, env) {
 if ((args.length != 2 ) || (!args[0].type === 'Word')) {
   throw new SyntaxError('Bad use of define');
 }

 let value = args[1].evaluate(env);
 env[args[0].value] = value;
 return value;
};

 specialForms[':='] = function(args, env) {
  if ((args.length != 2 ) || (!args[0].type === 'Word')) {
    throw new SyntaxError('Bad use of define');
  }

  if(env[args[0].value] === null){
    throw "Variable " + args[0].value + " not declared."
  }
  
  let value = args[1].evaluate(env);
  env[args[0].value] = value;
  return value;
};

specialForms['loop'] = function(args,env){
  for (var i = 0; i < args[0].evaluate(env); i++){
    args[1].evaluate(env)
  }

}

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
    if (arguments.length != argNames.length) {
      throw new TypeError('Wrong number of arguments');
    }

    let localEnv = Object.create(env);
    for (let i = 0; i < arguments.length; i++) {
      localEnv[argNames[i]] = arguments[i];
    }

  //  return evaluate(body, localEnv);
    return body.evaluate(localEnv);
  };
};

specialForms["set"] = specialForms["="] = function(args, env) {
  if (args.length < 3 || !args[0].type === 'Word') {
    throw new SyntaxError('Bad use of set');
  }
  
  
  obj = args[0].value;
  indexes = args.slice(1, args.length - 1);
  value = args[args.length - 1].evaluate(env);
  // 
  // for(var i = 0; i < indexes.length; i++){
  //   obj = obj[indexes[i].evaluate(env)];
  // }
  // obj[indexes[indexes.length-1]] = value;
  // env[args[0].evaluate(env)] = obj;
  // 
  
  for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
    if (Object.prototype.hasOwnProperty.call(scope, args[0].value)) {
      // if(typeof(scope[valName][index_1]) == "undefined")
      //   throw new ReferenceError(`Tried to set with indices a scalar variable: ${valName}`);
      // 
      obj = scope[args[0].value];
      for(var i = 0; i < indexes.length - 1; i++){
        obj = obj[indexes[i].value];
      }
      obj[indexes[indexes.length-1].value] = value;      
      return value;
    }
  }

  // let valName = args[0].value;
  // let index_1 = args[1].evaluate(env)
  // let index_2 = undefined;
  // let value = undefined;
  // 
  // if (args.length == 3){
  //   value = args[2].evaluate(env);
  // }
  // 
  // if (args.length == 4){
  //   index_2 = args[2].evaluate(env);
  //   value = args[3].evaluate(env);
  // }
  // 
  // for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
  //   if (Object.prototype.hasOwnProperty.call(scope, valName)) {
  // 
  //     if(typeof(scope[valName][index_1]) == "undefined")
  //       throw new ReferenceError(`Tried to set with indices a scalar variable: ${valName}`);
  // 
  //     if(args.length == 3)
  //       scope[valName][index_1] = value;
  //     else
  //       scope[valName][index_1][index_2] = value;
  //     return value;
  //   }
  // }
  // 
  // throw new ReferenceError(`Tried setting an undefined variable: ${valName}`);
};

specialForms["require"] = function(args, env){
  var module = REQUIRE(args[0].evaluate(env));
  return module;
}

specialForms["RegExp"] = function(args,env){
  var r = new XRegExp(args[0].evaluate(env),args[1].evaluate(env));
  return r
}


topEnv['true'] = true;
topEnv['false'] = false;

[
  '+',
  '-',
  '*',
  '/',
  '==',
  '<',
  '>',
  '&&',
  '||'
].forEach(op => {
  // Esto empíricamente devuelve la operación que se le pide,
  // pero no sé qué es ni cómo funciona.
  topEnv[op] = new Function('a, b', `return a ${op} b;`);
});

topEnv['print'] = function(value) {
  console.log(value);
  return value;
};

topEnv["arr"] = topEnv["array"] = function(...args) {
  return args;
};


topEnv["map"] = function(...args){
  var map = new Map();
  for (var i = 0; i < args.length; i+=2){
      map[args[i]] = args[i+1]
  }
  return map;
}

class CustomObject{}

topEnv["object"] = function(...args){
  var obj = new CustomObject();
  for (var i = 0; i < args.length; i+=2){
      obj[args[i]] = args[i+1]
  }
  return obj;
}

topEnv["length"] = function(array) {
  return array.length;
};

topEnv["[]"] = topEnv["element"] = topEnv["<-"] = function(array, ...args) {
  
    if(args.length < 1){
	   throw SyntaxError("Expected at least 2 arguments");
  }
  // console.log(args);
  let result = array;
  for(let i = 0; i < args.length; i++){
  	result = result[args[i]];
  }
  return result;
  
};


// topEnv["version"] = pjson.version;

Array.prototype.toUpperCase = function(){
  toUp = []
  this.forEach(function(element, index){
    toUp.push(element.toUpperCase())
  })
  return toUp
}

Array.prototype.sub = function(arg){
  return this[arg];
}

Number.prototype["+"] = function(){
    var args = Array.from(arguments)
    var result = this.valueOf()
    args.forEach(function(arg){
        result += arg
    })
		return result
}


Map.prototype.sub = function(...args){
	var result = this;
	for(var i = 0; i < args.length; i++){
		result = result[args[i]];
	}
	return result;
}

module.exports = {specialForms, topEnv, CustomObject}
