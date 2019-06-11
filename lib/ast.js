let registry      = require('./registry.js');
let parser        = require("./parser.js")
let specialForms  = registry.specialForms;
const inspect   = require("util").inspect;
let ins         = (x) => inspect(x, {depth:null});



class Value{

  constructor(token){
    this.value = token.value;
  }

  cout(){
    console.log(this.value);
  }

  evaluate(){
    return this.value;
  }

}

class Word{

  constructor(token){
    this.value  = token.value;
  }


  cout(){
      console.log(this.value);
  }

  evaluate(env){
    if (this.value in env) {
      return env[this.value];
    } else {
      throw new ReferenceError(`Undefined variable: ${this.value}`);
    }
  }

}

class Apply{

  constructor(tree, ...args){
    this.operator = tree;
    this.args = args;
  }

  push(arg){
    this.args.push(arg);
  }

  setOperator(operator){
    this.operator = operator;
  }

  cout(){
    this.args.forEach(function(arg){
      arg.cout()
    });
  }

  evaluate(env){
    
    /*
    * Si el operador es una sentencia del lenguaje la ejecutas.
    */
    if (this.operator instanceof Word && this.operator.value in specialForms){
      return specialForms[this.operator.value](this.args, env);
    }



    let op = this.operator;
    /*
    * Si el operador está definido en memoria evalúalo.
    */
    try{
      op = this.operator.evaluate(env);

    }catch( ex ){
      // Continue
    }

    /*
    * Puede que el operador no esté definido en memoria, o que esté definido pero
    * no sea una función.
    */
    if (typeof op != "function") {
      /*
      * El primer argumento puede ser el nombre de un método o de una función, pero
      * también podría ser una función que una vez llamada retorne el nombre de un
      * método o función, por eso lo evaluamos.
      */

      var methodName = this.args[0].evaluate(env)
      var methodArgs = []
      var i = 1
      // Mientras no obtengas un Apply todo lo que estás obteniendo
      // son los atributos del método al que vas a llamar.
      // Obtengo el valor de los argumentos porque actualmente son Words o Values.
      // Los evaluo por el mismo motivo que antes.
      while ( i < this.args.length ){
        methodArgs.push(this.args[i].evaluate(env))
        i++;
      }

      // Llamada a un método
      if(op[methodName] instanceof Function){
        try{
          op = op[methodName](...methodArgs)
        }catch(err){
          console.log(err);
        }
      }else{ // Llamada a un atributo
        try{
          op = op[methodName]
        }catch(err){
          console.log(err);
        }
      }



      /*
      * Quedan un Apply por evaluar, por lo tanto establecemos como operador
      * de este el resultado de la evaluación actual y lo evaluamos.
      */

         return op;


    }else{

      var m = this.args.map((arg) => arg.evaluate(env));
      return op(...m);                    


    }


    }
  }

module.exports = {Apply, Word, Value};
