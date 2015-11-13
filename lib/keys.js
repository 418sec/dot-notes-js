const ParseException
  = require('./exception');
const patterns
  = require('./patterns');

/**
 * Takes a String argument and outputs an Array of
 * keys, based on the dot notation. Integer keys
 * represent Array indices, and Strings obviously
 * represent Object properties. This function will
 * attempt to tell you of any issues in your notation,
 * although it's a best guess rather than an exact error.
 *
 * @param input the String input
 * @returns {Array} an Array of keys
 * @throws ParseException if parsing fails
 */
function keys(input) {
  var keys = [];
  var position = 0;

  if (!input) {
    throw new ParseException('Unable to parse empty string!');
  }
  else if (typeof input !== 'string') {
    throw new ParseException('Unexpected non-string value provided!');
  }

  while (!!input) {
    var m = input.match(patterns.segment);

    if (!m || m[1] === undefined) {
      throw new ParseException({
        char: input[0],
        index: position
      });
    }

    var prop = m[1];
    var val;

    if (patterns.accessor.test(prop)) {
      val = prop;
    }
    else if (patterns.index.test(prop)) {
      val = +prop.match(patterns.index)[1];
    }
    else {
      val = prop.match(patterns.property)[1];
    }

    keys.push(val);

    var remainder;

    if (input.length === prop.length) {
      remainder = '';
    } else {
      remainder = input.substring(prop.length);

      var isDot = remainder[0] === '.';

      if (remainder.length > 1) {
        var nextChar = remainder[1];
        if (!(isDot ? patterns.accessor : patterns.opener).test(nextChar)) {
          throw new ParseException({
            char: nextChar,
            index: position + prop.length + 1
          });
        }
      } else {
        throw new ParseException('Unable to parse key with trailing ' +
          (isDot ? 'dot' : 'bracket') + '!');
      }

      if (isDot) {
        remainder = remainder.substring(1);
      }
    }

    position += (input.length - remainder.length);
    input = remainder;
  }

  return keys;
}

/**
 * Export the `keys` function
 * to the public API.
 *
 * @type {keys}
 */
module.exports = keys;