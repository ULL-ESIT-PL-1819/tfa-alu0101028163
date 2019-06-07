var assert   = require('assert');
var should   = require("should")
var chai     = require("chai")
var lexer    = require('../../lib/lexer.js');

describe("OPERATORS", function(){

  beforeEach(()=>{
    lexer.OPERATOR.lastIndex = 0;
  });

  it("Debería casar :=", function(){
    lexer.OPERATOR.test(":=").should.eql(true);
  });

  it("Debería casar =", function(){
    lexer.OPERATOR.test("=").should.eql(true);
  });

  it("Debería casar ?", function(){
    lexer.OPERATOR.test("?").should.eql(true);
  });

  it("Debería casar !", function(){
    lexer.OPERATOR.test("!" ).should.eql(true);
  });

  it("Debería casar #", function(){
    lexer.OPERATOR.test("#" ).should.eql(true);
  });

  it("Debería casar <", function(){
    lexer.OPERATOR.test("<" ).should.eql(true);
  });

  it("Debería casar <=", function(){
    lexer.OPERATOR.test("<=" ).should.eql(true);
  });

  it("Debería casar >", function(){
    lexer.OPERATOR.test(">" ).should.eql(true);
  });

  it("Debería casar >=", function(){
    lexer.OPERATOR.test(">=" ).should.eql(true);
  });

  it("Debería casar !", function(){
    lexer.OPERATOR.test("!" ).should.eql(true);
  });

  it("Debería casar +", function(){
    lexer.OPERATOR.test("+" ).should.eql(true);
  });

  it("Debería casar -", function(){
    lexer.OPERATOR.test("-" ).should.eql(true);
  });

  it("Debería casar *", function(){
    lexer.OPERATOR.test("*" ).should.eql(true);
  });

  it("Debería casar /", function(){
    lexer.OPERATOR.test("/" ).should.eql(true);
  });




})


describe("WHITES", function(){


  beforeEach(()=>{
    lexer.WHITES.lastIndex = 0;
  })

  it("Deberia casar espacios en blanco", function(){
    lexer.WHITES.test("          ").should.eql(true);
  })

})


describe("PARENTHESIS", function(){

  beforeEach(()=>{
    lexer.RP.lastIndex = 0;
    lexer.LP.lastIndex = 0;
  })


  it("Debería casar )", function(){
    lexer.RP.test(")").should.eql(true);
  });

  it("Debería casar (", function(){
    lexer.LP.test("(").should.eql(true);
  });

});

describe("IDENTIFIERS", function(){

  beforeEach(() => {
    lexer.IDENTIFIER.lastIndex = 0;
  })

  it("Debería casar identificadores en minuscula", function(){
    lexer.IDENTIFIER.test("a").should.eql(true);
  })

  it("Debería casar identificadores en mayuscula", function(){
    lexer.IDENTIFIER.test("A").should.eql(true);
  })

  it("Debería casar identificadores en minuscula con numeros", function(){
    lexer.IDENTIFIER.test("a12").should.eql(true);
  })

  it("Debería casar identificadores en mayuscula con numeros", function(){
    lexer.IDENTIFIER.test("A12").should.eql(true);
  })

  it("Debería casar identificadores con barrabajas en minusculo", function(){
    lexer.IDENTIFIER.test("a_b").should.eql(true);
  })

  it("Debería casar identificadores con barrabaja en minuscula", function(){
    lexer.IDENTIFIER.test("A_B").should.eql(true);
  })

  it("Debería no casar identificadores que empiecen por numeros", function(){
    lexer.IDENTIFIER.test("12a").should.eql(false);
  })

  it("Debería no casar identificadores que empiecen por barrabaja", function(){
    lexer.IDENTIFIER.test("_a2").should.eql(false);
  })

  it("No deberia casar con un espacio en blanco", function(){
    lexer.IDENTIFIER.test(" ").should.eql(false);
  })

})

describe("STRINGS", function(){

    beforeEach(()=>{
      lexer.STRING.lastIndex = 0;
    })

    it("Deberia casar Strings simples", function(){
      lexer.STRING.test("\"This is a string\"").should.eql(true);
    })

    it("Deberia casar Strings escapadas", function(){
      lexer.STRING.test("\"This is a \"escapated\" string\"").should.eql(true);
    })

    it("No deberia casar Strings mal escapadas", function(){
      lexer.STRING.test("\"This is a badly \\\"escapated string").should.eql(false);
    })

    it("No deberia casar Strings mal escritas", function(){
      lexer.STRING.test("\"This is a badly escapated string").should.eql(false);
    })



})

describe("KEYWORDS", function(){

  beforeEach(()=>{
    lexer.KEYWORD.lastIndex = 0;
  })

  it("Debería casar const", function(){
    lexer.KEYWORD.test("const").should.eql(true);
  });

  it("Debería casar var", function(){
    lexer.KEYWORD.test("var").should.eql(true);
  });

  it("Debería casar procedure", function(){
    lexer.KEYWORD.test("procedure").should.eql(true);
  });

  it("Debería casar call", function(){
    lexer.KEYWORD.test("call").should.eql(true);
  });

  it("Debería casar begin", function(){
    lexer.KEYWORD.test("begin").should.eql(true);
  });

  it("Debería casar end", function(){
    lexer.KEYWORD.test("end").should.eql(true);
  });

  it("Debería casar if", function(){
    lexer.KEYWORD.test("if").should.eql(true);
  });

  it("Debería casar then", function(){
    lexer.KEYWORD.test("then").should.eql(true);
  });

  it("Debería casar while", function(){
    lexer.KEYWORD.test("while").should.eql(true);
  });

  it("Debería casar do", function(){
    lexer.KEYWORD.test("do").should.eql(true);
  });

  it("Debería casar odd", function(){
    lexer.KEYWORD.test("odd").should.eql(true);
  });

  describe("NUMBERS", function(){

    beforeEach(()=>{
      lexer.NUMBER.lastIndex = 0;
    })

    it("Debería casar con enteros", function(){
      lexer.NUMBER.test("4").should.eql(true);
    })
  })


})
