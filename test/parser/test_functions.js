var assert      = require('assert');
var should      = require("should")
var chai        = require("chai")
var expect      = chai.expect;
var lexer       = require('../../lib/lexer.js');
var parser      = require('../../lib/parser.js');
const inspect   = require("util").inspect;
var ins         = (x) => inspect(x, {depth:null});
var { tokenize_program, TOKENS, lex } = require('../../lib/lexer.js');



describe("TEST_FUNCTIONS", function(){

  beforeEach(()=>{
    var program = "var a := 1;";
    parser.initialize(program);
  })

  it("shift", function(){
    parser.shift().should.be.eql({type: "keyword", value:"var", lineno: 1, offset: 0});
    parser.shift().should.be.eql({type: "identifier", value:"a", lineno: 1, offset: 4});
    parser.shift().should.be.eql({type: "assign_op", value:":=", lineno: 1, offset: 6});
    parser.shift().should.be.eql({type: "number", value:1, lineno: 1, offset: 9});
    parser.shift().should.be.eql({type: "semicolon", value:";", lineno: 1, offset: 10});
    expect(parser.shift()).to.be.eql(null);
  });

  it("assert_type",function(){
    expect(parser.assert_type("keyword")).to.be.eql(undefined);

    for(const type in TOKENS){
      should(function() {parser.assert_type(TOKENS[type].id)}).throw(SyntaxError);
    }

    parser.shift();

    for(const type in TOKENS){
      if(type != 'identifier')
      should(function() {parser.assert_type(TOKENS[type].id)}).throw(SyntaxError);
    }

    parser.shift();

    for(const type in TOKENS){
      if(type != 'assign_op')
      should(function() {parser.assert_type(TOKENS[type].id)}).throw(SyntaxError);
    }


  });

  it("assert_value", function(){
    expect(parser.assert_value("var")).to.be.eql(undefined);
    parser.shift();
    expect(parser.assert_value("a")).to.be.eql(undefined);
    parser.shift();
    expect(parser.assert_value(":=")).to.be.eql(undefined);
    parser.shift();
    expect(parser.assert_value(1)).to.be.eql(undefined);
    parser.shift();
    expect(parser.assert_value(";")).to.be.eql(undefined);
    parser.shift();
  });

  it("is_word", function(){
    parser.is_word().should.be.eql(true);
    parser.shift();
    parser.shift();
    parser.shift();
    parser.is_word().should.be.eql(false);
  });

  it("is_value", function(){
    parser.is_value().should.be.eql(false);
    parser.shift();
    parser.shift();
    parser.shift();
    parser.is_value().should.be.eql(true);
  });

  it("get_token", function(){
    parser.get_token("var", "keyword").should.be.eql({type:"word", value:"var", lineno:1, offset:0});
    parser.get_token("a", "identifier").should.be.eql({type:"word", value:"a", lineno:1, offset:4});
    parser.get_token(":=", "assign_op").should.be.eql({type:"word", value:":=", lineno:1, offset:6});
  })

  it("get_token_of_type", function(){
    parser.get_token_of_type("keyword").should.be.eql({type:"word", value:"var", lineno:1, offset:0});
    parser.get_token_of_type("identifier").should.be.eql({type:"word", value:"a", lineno:1, offset:4});
    parser.get_token_of_type("assign_op").should.be.eql({type:"word", value:":=", lineno:1, offset:6});
  })

})
