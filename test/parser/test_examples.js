var rewire   = require('rewire')
var assert   = require('assert');
var should   = require("should")
var chai     = require("chai")
var sinon    = require("sinon")
var lexer    = require('../../lib/lexer.js');
var parser   = rewire('../../lib/parser.js');
var ast      = require('../../lib/ast.js');
var registry = require("../../lib/registry.js")
const inspect   = require("util").inspect;
var ins         = (x) => inspect(x, {depth:null});

describe("EXAMPLES", function(){

  beforeEach(function(){
    sinon.stub(console,'log');
  });

  afterEach(function(){
    console.log.restore();
  })

  it("simple_declaration.pl", function(){
    lexer.set_program_from_file("examples/simple_declaration.pl")
    parser.get_next_token();
    var r = parser.PROGRAM();
    var x = r.evaluate(registry.topEnv)
    x.should.be.eql(1)
  })

  it("simple_declaration_2.pl", function(){
    lexer.set_program_from_file("examples/simple_declaration_2.pl")
    parser.get_next_token();
    var r = parser.PROGRAM();
    var x = r.evaluate(registry.topEnv)
    x.should.be.eql(7)
  })

  it("procedure_declaration.pl", function(){
    lexer.set_program_from_file("examples/procedure_declaration.pl")
    parser.get_next_token();
    var r = parser.PROGRAM();
    var x = r.evaluate(registry.topEnv)
    x.should.be.eql(4)
  })

  it("simple_call.pl", function(){
    lexer.set_program_from_file("examples/simple_call.pl")
    parser.get_next_token();
    var r = parser.PROGRAM();
    var x = r.evaluate(registry.topEnv)
    x.should.be.eql(2)
  })

  it("begin_end_example.pl", function(){
    lexer.set_program_from_file("examples/begin_end_example.pl")
    parser.get_next_token();
    var r = parser.PROGRAM();
    var x = r.evaluate(registry.topEnv)
    x.should.be.eql(3)
  })

  it("if_statement_1.pl", function(){
    lexer.set_program_from_file("examples/if_statement_1.pl")
    parser.get_next_token();
    var r = parser.PROGRAM();
    var x = r.evaluate(registry.topEnv)
    x.should.be.eql(2)
  })

  it("if_statement_2.pl", function(){
    lexer.set_program_from_file("examples/if_statement_2.pl")
    parser.get_next_token();
    var r = parser.PROGRAM();
    var x = r.evaluate(registry.topEnv)
    x.should.be.eql(4)
  })

  it("while_statement.pl", function(){
    lexer.set_program_from_file("examples/while_statement.pl")
    parser.get_next_token();
    var r = parser.PROGRAM();
    var x = r.evaluate(registry.topEnv)
    x.should.be.eql(false)
  })

  it("reto.pl", function(){
    lexer.set_program_from_file("examples/reto.pl")
    parser.get_next_token();
    var r = parser.PROGRAM();
    var x = r.evaluate(registry.topEnv)
    x.should.be.eql([36,2,3])
  })

  it("print_number.pl", function(){
    lexer.set_program_from_file("examples/print_number.pl")
    parser.get_next_token();
    var r = parser.PROGRAM();
    var x = r.evaluate(registry.topEnv)
    chai.expect(console.log.calledOnce).to.be.true;
    chai.expect(console.log.calledWith(6)).to.be.true;
  })

  it("print_var.pl", function(){
    lexer.set_program_from_file("examples/print_var.pl")
    parser.get_next_token();
    var r = parser.PROGRAM();
    var x = r.evaluate(registry.topEnv)
    chai.expect(console.log.calledOnce).to.be.true;
    chai.expect(console.log.calledWith(20)).to.be.true;
  })

});
