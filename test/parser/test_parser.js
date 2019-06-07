var rewire      = require('rewire')
var assert      = require('assert');
var should      = require("should")
var chai        = require("chai")
var lexer       = require('../../lib/lexer.js');
var parser      = rewire('../../lib/parser.js');
var ast         = require('../../lib/ast.js');
const inspect   = require("util").inspect;
var ins         = (x) => inspect(x, {depth:null});



describe("Parser", function(){


  beforeEach(() =>{
    parser.__set__("lookahead",null); //
    parser.__set__("index",0);        //
    parser.__set__("program",[]);     // Array de tokens
  })


  it("Parses an IDENTIFIER", function(){
    var lookahead = {type: "IDENTIFIER", value: "a", offset: 0, lineno: 0}
    parser.__set__("lookahead", lookahead);

    var word = new ast.Word(lookahead);

    var ident = parser.IDENT;
    var result = ident();

    result.should.be.eql(word);
  });

  it("Parses a NUMBER", function(){
    var lookahead = {type: "NUMBER", value: 5 , offset: 0, lineno: 0}
    parser.__set__("lookahead", lookahead);

    var value = new ast.Value(lookahead);

    var number = parser.NUMBER;
    var result = number();

    result.should.be.eql(value);
  });

  describe("ARITHMETIC OPERATIONS", function(){
    it("Parses 2+3+4", function(){
      var sum1 = new ast.Apply(new ast.Word({value: "+", offset: 3, lineno: 0}));
      var sum2 = new ast.Apply(new ast.Word({value: "+", offset: 1, lineno: 0}));
      sum2.push(new ast.Value({value:2, offset: 0, lineno:0}))
      sum2.push(new ast.Value({value:3, offset: 2, lineno:0}))
      sum1.push(sum2)
      sum1.push(new ast.Value({value:4, offset: 4, lineno:0}))


      var pr = "2+3+4"
      lexer.set_program(pr);
      parser.get_next_token();
      var expr = parser.EXPRESSION();
      expr.should.be.eql(sum1)

    })

    it("Parses -2+3+4", function(){
      var sum1 = new ast.Apply(new ast.Word({value: "+", offset: 4, lineno: 0}));
      var sum2 = new ast.Apply(new ast.Word({value: "+", offset: 2, lineno: 0}));
      var sub1 = new ast.Apply(new ast.Word({value: "-", offset: 0, lineno: 0}));
      sub1.push(new ast.Value({value:2, offset: 1, lineno:0}))
      sum2.push(sub1);
      sum2.push(new ast.Value({value:3, offset: 3, lineno:0}))
      sum1.push(sum2)
      sum1.push(new ast.Value({value:4, offset: 5, lineno:0}))


      var pr = "-2+3+4"
      lexer.set_program(pr);
      parser.get_next_token();
      var expr = parser.EXPRESSION();
      expr.should.be.eql(sum1)

    })

    it("Parses 2+(3+4)", function(){
      var sum1 = new ast.Apply(new ast.Word({value: "+", offset: 1, lineno: 0}));
      var sum2 = new ast.Apply(new ast.Word({value: "+", offset: 4, lineno: 0}));
      sum2.push(new ast.Value({value:3, offset: 3, lineno:0}))
      sum2.push(new ast.Value({value:4, offset: 5, lineno:0}))
      sum1.push(new ast.Value({value:2, offset: 0, lineno:0}))
      sum1.push(sum2)


      var pr = "2+(3+4)"
      lexer.set_program(pr);
      parser.get_next_token();
      var expr = parser.EXPRESSION();
      expr.should.be.eql(sum1)

    })


    it("Parses 2+(3*4)", function(){
      var sum1 = new ast.Apply(new ast.Word({value: "+", offset: 1, lineno: 0}));
      var sum2 = new ast.Apply(new ast.Word({value: "*", offset: 4, lineno: 0}));
      sum2.push(new ast.Value({value:3, offset: 3, lineno:0}))
      sum2.push(new ast.Value({value:4, offset: 5, lineno:0}))
      sum1.push(new ast.Value({value:2, offset: 0, lineno:0}))
      sum1.push(sum2)


      var pr = "2+(3*4)"
      lexer.set_program(pr);
      parser.get_next_token();
      var expr = parser.EXPRESSION();
      expr.should.be.eql(sum1)

    })

    it("Parses 2*(3+4)", function(){
      var sum1 = new ast.Apply(new ast.Word({value: "*", offset: 1, lineno: 0}));
      var sum2 = new ast.Apply(new ast.Word({value: "+", offset: 4, lineno: 0}));
      sum1.push(new ast.Value({value:2, offset: 0, lineno:0}))
      sum2.push(new ast.Value({value:3, offset: 3, lineno:0}))
      sum2.push(new ast.Value({value:4, offset: 5, lineno:0}))
      sum1.push(sum2)


      var pr = "2*(3+4)"
      lexer.set_program(pr);
      parser.get_next_token();
      var expr = parser.EXPRESSION();
      expr.should.be.eql(sum1)

    })


    it("Parses -2*(3+4)", function(){
      var sum1 = new ast.Apply(new ast.Word({value: "*", offset: 2, lineno: 0}));
      var sum2 = new ast.Apply(new ast.Word({value: "+", offset: 5, lineno: 0}));
      var sub1 = new ast.Apply(new ast.Word({value: "-", offset: 0, lineno: 0}))
      sum2.push(new ast.Value({value:3, offset: 4, lineno:0}))
      sum2.push(new ast.Value({value:4, offset: 6, lineno:0}))
      sum1.push(new ast.Value({value:2, offset: 1, lineno:0}))
      sum1.push(sum2)
      sub1.push(sum1)


      var pr = "-2*(3+4)"
      lexer.set_program(pr);
      parser.get_next_token();
      var expr = parser.EXPRESSION();
      expr.should.be.eql(sub1)

    })

    it("Parses (-2)*(3+4)", function(){

      var sub1 = new ast.Apply(new ast.Word({value: "-", offset: 1, lineno: 0}));
      sub1.push(new ast.Value({value:2, offset: 2, lineno:0}))

      var sum2 = new ast.Apply(new ast.Word({value: "+", offset: 7, lineno: 0}));
      sum2.push(new ast.Value({value:3, offset: 6, lineno:0}))
      sum2.push(new ast.Value({value:4, offset: 8, lineno:0}))

      var sum1 = new ast.Apply(new ast.Word({value: "*", offset: 4, lineno: 0}));
      sum1.push(sub1)
      sum1.push(sum2)


      var pr = "(-2)*(3+4)"
      lexer.set_program(pr);
      parser.get_next_token();
      var expr = parser.EXPRESSION();
      expr.should.be.eql(sum1)

    })
  })


  describe("CONDITIONS", function(){
    it("Parses a < b", function(){
      var expr1 = new ast.Word({value: "a", offset: 0, lineno: 0 })
      var expr2 = new ast.Word({value: "b", offset: 4, lineno: 0 })
      var operator = new ast.Apply(new ast.Word({value: "<", offset: 2, lineno: 0}))
      operator.push(expr1)
      operator.push(expr2)

      var pr = "a < b"
      lexer.set_program(pr);
      parser.get_next_token();
      var expr = parser.CONDITION();
      expr.should.be.eql(operator)

    })

    it("Parses a > b", function(){
      var expr1 = new ast.Word({value: "a", offset: 0, lineno: 0 })
      var expr2 = new ast.Word({value: "b", offset: 4, lineno: 0 })
      var operator = new ast.Apply(new ast.Word({value: ">", offset: 2, lineno: 0}))
      operator.push(expr1)
      operator.push(expr2)

      var pr = "a > b"
      lexer.set_program(pr);
      parser.get_next_token();
      var expr = parser.CONDITION();
      expr.should.be.eql(operator)

    })

    it("Parses a = b", function(){
      var expr1 = new ast.Word({value: "a", offset: 0, lineno: 0 })
      var expr2 = new ast.Word({value: "b", offset: 4, lineno: 0 })
      var operator = new ast.Apply(new ast.Word({value: "=", offset: 2, lineno: 0}))
      operator.push(expr1)
      operator.push(expr2)

      var pr = "a = b"
      lexer.set_program(pr);
      parser.get_next_token();
      var expr = parser.CONDITION();
      expr.should.be.eql(operator)

    })

    it("Parses a <= b", function(){
      var expr1 = new ast.Word({value: "a", offset: 0, lineno: 0 })
      var expr2 = new ast.Word({value: "b", offset: 5, lineno: 0 })
      var operator = new ast.Apply(new ast.Word({value: "<=", offset: 2, lineno: 0}))
      operator.push(expr1)
      operator.push(expr2)

      var pr = "a <= b"
      lexer.set_program(pr);
      parser.get_next_token();
      var expr = parser.CONDITION();
      expr.should.be.eql(operator)

    })

    it("Parses a >= b", function(){
      var expr1 = new ast.Word({value: "a", offset: 0, lineno: 0 })
      var expr2 = new ast.Word({value: "b", offset: 5, lineno: 0 })
      var operator = new ast.Apply(new ast.Word({value: ">=", offset: 2, lineno: 0}))
      operator.push(expr1)
      operator.push(expr2)

      var pr = "a >= b"
      lexer.set_program(pr);
      parser.get_next_token();
      var expr = parser.CONDITION();
      expr.should.be.eql(operator)

    })

  });


});
