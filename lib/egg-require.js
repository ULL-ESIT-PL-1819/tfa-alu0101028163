

function REQUIRE(name) {

  var parser   = require("./parser.js")
  var registry = require("./registry.js")


  if (name in REQUIRE.cache)
    return REQUIRE.cache[name];

  let code = parser.parseFromFile(name);
  let output = code.evaluate(registry.topEnv)

  REQUIRE.cache[name] = output;
  return output;
}

REQUIRE.cache = Object.create(null);

module.exports = REQUIRE;
