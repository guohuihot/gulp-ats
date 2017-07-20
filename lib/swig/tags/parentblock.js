/**
 * Inject the content from the parent template's block of the same name into the current block.
 *
 * See <a href="#inheritance">Template Inheritance</a> for more information.
 *
 * @alias parentblock
 *
 * @example
 * {% extends "./foo.html" %}
 * {% block content %}
 *   My content.
 * {% endblock %}
 *
 * 
 * {% parentblock 'content' %}
 *
 */
exports.compile = function (compiler, args, content, parents, options, blockName) {
  if (!parents || !parents.length) {
    return '';
  }

  var parentFile = args[0].replace(/'|"/g, ''),
    breaker = true,
    l = parents.length,
    i = 0,
    parent,
    block;
    
  for (i; i < l; i += 1) {
    parent = parents[i];
    if (!parent.blocks || (!parent.blocks.hasOwnProperty(parentFile) && !parent.blocks.hasOwnProperty(blockName))) {
      continue;
    }
    // Silly JSLint "Strange Loop" requires return to be in a conditional
    if (breaker && parentFile !== parent.name) {
      block = parent.blocks[parentFile] || parent.blocks[blockName];

      return block.compile(compiler, [blockName], block.content, parents.slice(i + 1), options) + '\n';
    }
  }
};

exports.parse = function (str, line, parser, types, stack, opts) {
  var file;

  parser.on(types.STRING, function (token) {
    if (!file) {
      file = token.match;
      this.out.push(file);
      return;
    }
    return true;
  });

  parser.on('*', function (token) {
    throw new Error('Unexpected argument "' + token.match + '" on line ' + line + '.');
  });

  parser.on('end', function () {
    this.out.push(opts.filename);
  });

  return true;
};
