var assert   = require('assert');
var should   = require("should")
var chai     = require("chai")
var sinon    = require("sinon")
var lexer    = require('../../lib/lexer.js');
var parser   = require('../../lib/parser.js');
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
    var r = parser.parse("examples/simple_declaration.pl");
    var x = r.evaluate(registry.topEnv);
    x.should.be.eql(1)
  })

  it("simple_declaration_2.pl", function(){
    var r = parser.parse("examples/simple_declaration_2.pl");
    var x = r.evaluate(registry.topEnv);
    x.should.be.eql(7)
  })

  it("procedure_declaration.pl", function(){
    var r = parser.parse("examples/procedure_declaration.pl");
    var x = r.evaluate(registry.topEnv)
    x.should.be.eql(4)
  })

  it("simple_call.pl", function(){
    var r = parser.parse("examples/simple_call.pl");
    var x = r.evaluate(registry.topEnv)
    x.should.be.eql(2)
  })

  it("begin_end_example.pl", function(){
    var r = parser.parse("examples/begin_end_example.pl");
    var x = r.evaluate(registry.topEnv)
    x.should.be.eql(3)
  })

  it("if_statement_1.pl", function(){
    var r = parser.parse("examples/if_statement_1.pl");
    var x = r.evaluate(registry.topEnv);
    x.should.be.eql(2)
  })

  it("if_statement_2.pl", function(){
    var r = parser.parse("examples/if_statement_2.pl");
    var x = r.evaluate(registry.topEnv);
    x.should.be.eql(false);
  })

  it("while_statement.pl", function(){
    var r = parser.parse("examples/while_statement.pl");
    var x = r.evaluate(registry.topEnv);
    x.should.be.eql(false)
  })

  it("reto.pl", function(){
    var r = parser.parse("examples/reto.pl");
    var x = r.evaluate(registry.topEnv);
    x.should.be.eql([36,1,1])
  })

  it("print_number.pl", function(){
    var r = parser.parse("examples/print_number.pl");
    var x = r.evaluate(registry.topEnv);
    chai.expect(console.log.calledOnce).to.be.true;
    chai.expect(console.log.calledWith(6)).to.be.true;
  })

  it("print_var.pl", function(){
    var r = parser.parse("examples/print_var.pl");
    var x = r.evaluate(registry.topEnv);
    chai.expect(console.log.calledOnce).to.be.true;
    chai.expect(console.log.calledWith(20)).to.be.true;
  })
  
  it("array_access.pl", function(){
    var r = parser.parse("examples/array_access.pl");
    var x = r.evaluate(registry.topEnv);
    x.should.be.eql([1,[1,2],1])
    chai.expect(console.log.calledOnce).to.be.true;
    chai.expect(console.log.calledWith([1,[1,2],1])).to.be.true;
  })
  
  it("object_declaration", function(){
    var r = parser.parse("examples/object_declaration.pl");
    var x = r.evaluate(registry.topEnv);
    x.should.be.eql(4);
    chai.expect(console.log.calledWith(1)).to.be.true;
    chai.expect(console.log.calledWith(3)).to.be.true;
    chai.expect(console.log.calledWith(4)).to.be.true;
  })
  
  it("object_procedure_call", function(){
    var r = parser.parse("examples/object_procedure_call.pl");
    var x = r.evaluate(registry.topEnv);
    x.should.be.eql(199);
    chai.expect(console.log.calledWith(199)).to.be.true;
  })

});
