/* ----------------------------------------------------------------------------
                                  Packages
   ----------------------------------------------------------------------------*/
var XRegExp = require('xregexp')
var fs      = require("fs");
const inspect   = require("util").inspect;
let ins         = (x) => inspect(x, {depth:null});


/* ----------------------------------------------------------------------------
                          Global variables & structures.
   ----------------------------------------------------------------------------*/


var i = 0;
var offset = 0;        // Posición actual de la cadena que se está inspeccionando.
var lineno = 0;       // Numero de línea.


const KEYWORDS = ["CONST","VAR","PROCEDURE","CALL","BEGIN","END","IF","THEN","WHILE","DO"];

function isKeyword(identifier){
  if(KEYWORDS.indexOf(identifier.toUpperCase()) >= 0)
    return true;
  else return false;
}

const TOKENS = {

  white_space: {
    id: 'white_space',
    regex: XRegExp(`(\\s+|\\t+)`,`y`),
    skip: true,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  line_break: {
    id: 'line_break',
    regex: XRegExp(`[\\n\\r]+`,`y`),
    skip: true,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  comment: {
    id: 'comment',
    regex: XRegExp(`(\\/\\*.*?\\*\\/|\\#.*)`,`y`),
    skip: true,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  number: {
    id: 'number',
    regex: XRegExp(`[+-]?\\d+\\.?(\\d+[eE][+-]?\\d+)?`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  string: {
    id: 'string',
    regex: XRegExp(`"(\\.|[^"])+"`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[1], m[1].length, this.skip);
      }else return null;
    }
  },

  identifier:{
    id: 'identifier',
    regex: XRegExp(`[a-zA-Z_][a-zA-Z0-9_]*`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        if(isKeyword(m[0])){
          return create_token_info("keyword", m[0], m[0].length, this.skip);
        }else return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  dot : {
    id: 'dot',
    regex: XRegExp(`[.]`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  comma : {
    id: 'comma',
    regex: XRegExp(`[,]`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  colon : {
    id: 'colon',
    regex: XRegExp(`[,]`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  semicolon : {
    id: 'semicolon',
    regex: XRegExp(`[;]`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  lpar : {
    id: 'lpar',
    regex: XRegExp(`\\(`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  rpar : {
    id: 'rpar',
    regex: XRegExp(`\\)`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  lbrack : {
    id: 'lbrack',
    regex: XRegExp(`\\[`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  rbrack : {
    id: 'rbrack',
    regex: XRegExp(`\\[`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  comparison_op : {
    id: 'comparison_op',
    regex: XRegExp(`(==|!=|<=|>=|<|>)`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  assign_op : {
    id: 'assign_op',
    regex: XRegExp(`:=`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  add_sub_op : {
    id: 'add_sub_op',
    regex: XRegExp(`[+-]`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  },

  mult_div_op : {
    id: 'mult_div_op',
    regex: XRegExp(`[*\\/]`,'y'),
    skip: false,
    parse(input){
      const m = this.regex.exec(input);
      if(m){
        return create_token_info(this.id, m[0], m[0].length, this.skip);
      }else return null;
    }
  }

}

var create_token = function(type, value, lineno, offset){
  return {
    type: type,
    value: value,
    lineno: lineno,
    offset: offset
  }
}

var create_token_info = function(type, value, length, skip) {
  return {
    type: type,
    value: value,
    length: length,
    skip: skip
  }
}

/* TODO: Actualmente los blancos los parsea y devuelve null*/
function lex(input){


  if(i < input.length){

    matched = false;

    for(const token_type in TOKENS){
      TOKENS[token_type].regex.lastIndex = i;
      const match = TOKENS[token_type].parse(input);
      if(match){
        matched = true;
        if(match.type == 'line_break'){
          lineno += 1;
          offset = 0;
        }else offset += match.length;

        i += match.length;

        if(!match.skip){
          return create_token(match.type, match.value, lineno, offset);
        }
      }
    }

    if(!matched){
      throw SyntaxError(`Unexpected token at line ${lineno}:${offset}`);
    }

  }else return null;

}

function tokenize_program(input){
  const tokens = [];
  let token;
  while(token = lex(input)){
    tokens.push(token);
  }
  return tokens;
}

function set_program(program){
  index = 0;
  lineno = 0;
  token_arr = []
  lookahead = null;
  this.program = program;
  refresh_offset();
}

function set_program_from_file(file_name){
  try {
    this.program = fs.readFileSync(file_name, 'utf8');
    index = 0;
    lineno = 0;
    token_arr = []
    lookahead = null;
    refresh_offset();
  }
  catch (err) {
    console.log(err);
    throw err;
  }
}


console.log(ins(tokenize_program("/*Hola*/ Adios")))


module.exports = {

}
