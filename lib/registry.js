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

 specialForms['object'] = function(args, env){

  let object = new function(){};
  for(let i = 0; i < args.length; i++){
    const arg = args[i];
    const arg_id = arg.args[0].value;
    let arg_value = arg.args[1].evaluate(env); 
    object[arg_id] = arg_value;
  }
  

  return object;
}



specialForms['extends'] = function(args, env){
    
  let parent_object = args[0].evaluate(env);
  let child_object  = {...parent_object }

  let object_properties = args.slice(1, args.length);
  for(let i = 0; i < object_properties.length; i++){
      obj_property = object_properties[i];
      property_name = obj_property.args[0].value;
      property_value = obj_property.args[1].evaluate(env);
      child_object[property_name] = property_value;
  }
  
  return child_object;
  
}


specialForms['call'] = function(args, env){
  
  let this_value = null;
  if(args[0].hasOwnProperty('operator') && args[0].operator.value === 'element'){
     this_value = env[args[0].args[0].value];
  }
  
  var calling_object = args[0].evaluate(env);
  var function_args = args.slice(1,args.length).map(elem => elem.evaluate(env));
  return calling_object(this_value, ...function_args);
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
    if ((arguments.length - 1) != argNames.length) {
      throw new TypeError('Wrong number of arguments');
    }

    let localEnv = Object.create(env);
    for (let i = 0; i < arguments.length - 1; i++) {
      localEnv[argNames[i]] = arguments[i + 1];
    }
    
    localEnv["this"] = arguments[0];
    
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

  
  for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
    if (Object.prototype.hasOwnProperty.call(scope, args[0].value)) {

      obj = scope[args[0].value];
      for(var i = 0; i < indexes.length - 1; i++){
        obj = obj[indexes[i].value];
      }
      obj[indexes[indexes.length-1].value] = value;      
      return value;
    }
  }

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


topEnv["length"] = function(array) {
  return array.length;
};

topEnv["[]"] = topEnv["element"] = topEnv["<-"] = function(calling_object, ...args) {
  
    if(args.length < 1){
	   throw SyntaxError("Expected at least 2 arguments");
  }
  
  let result = calling_object;
  for(let i = 0; i < args.length; i++){
  	result = result[args[i]];
  }

  return result;
  
};


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

module.exports = {specialForms, topEnv}
