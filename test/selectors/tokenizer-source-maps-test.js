var vows = require('vows');
var assert = require('assert');
var Tokenizer = require('../../lib/selectors/tokenizer');
var SourceTracker = require('../../lib/utils/source-tracker');

function sourceMapContext(group, specs) {
  var ctx = {};

  function tokenizedContext(target, index) {
    return function (tokenized) {
      assert.deepEqual(tokenized[index], target);
    };
  }

  for (var test in specs) {
    for (var i = 0; i < specs[test][1].length; i++) {
      var target = specs[test][1][i];

      ctx[group + ' ' + test + ' - #' + (i + 1)] = {
        topic: typeof specs[test][0] == 'function' ?
          specs[test][0]() :
          new Tokenizer({ sourceTracker: new SourceTracker() }, false, true).toTokens(specs[test][0]),
        tokenized: tokenizedContext(target, i)
      };
    }
  }

  return ctx;
}

vows.describe('source-maps/analyzer')
  .addBatch(
    sourceMapContext('selectors', {
      'single': [
        'a{}',
        [{
          kind: 'selector',
          value: [{ value: 'a', metadata: { line: 1, column: 0, source: undefined } }],
          body: []
        }]
      ],
      'double': [
        'a,div{}',
        [{
          kind: 'selector',
          value: [
            { value: 'a', metadata: { line: 1, column: 0, source: undefined } },
            { value: 'div', metadata: { line: 1, column: 2, source: undefined } }
          ],
          body: []
        }]
      ],
      'double with whitespace': [
        ' a,\n\ndiv{}',
        [{
          kind: 'selector',
          value: [
            { value: 'a', metadata: { line: 1, column: 1, source: undefined } },
            { value: '\n\ndiv', metadata: { line: 3, column: 0, source: undefined } }
          ],
          body: []
        }]
      ],
      'triple': [
        'a,div,p{}',
        [{
          kind: 'selector',
          value: [
            { value: 'a', metadata: { line: 1, column: 0, source: undefined } },
            { value: 'div', metadata: { line: 1, column: 2, source: undefined } },
            { value: 'p', metadata: { line: 1, column: 6, source: undefined } }
          ],
          body: []
        }]
      ],
      'triple with whitespace': [
        ' a,\n\ndiv\na,\n p{}',
        [{
          kind: 'selector',
          value: [
            { value: 'a', metadata: { line: 1, column: 1, source: undefined } },
            { value: '\n\ndiv\na', metadata: { line: 3, column: 0, source: undefined } },
            { value: '\n p', metadata: { line: 5, column: 1, source: undefined } }
          ],
          body: []
        }]
      ],
      'two': [
        'a{}div{}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 0, source: undefined } }],
            body: []
          },
          {
            kind: 'selector',
            value: [{ value: 'div', metadata: { line: 1, column: 3, source: undefined } }],
            body: []
          }
        ]
      ],
      'three with whitespace and breaks': [
        'a {}\n\ndiv{}\n \n  p{}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a ', metadata: { line: 1, column: 0, source: undefined } }],
            body: []
          },
          {
            kind: 'selector',
            value: [{ value: 'div', metadata: { line: 3, column: 0, source: undefined } }],
            body: []
          },
          {
            kind: 'selector',
            value: [{ value: 'p', metadata: { line: 5, column: 2, source: undefined } }],
            body: []
          }
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('properties', {
      'single': [
        'a{color:red}',
        [{
          kind: 'selector',
          value: [{ value: 'a', metadata: { line: 1, column: 0, source: undefined } }],
          body: [{ value: 'color:red', metadata: { line: 1, column: 2, source: undefined } }]
        }]
      ],
      'double': [
        'a{color:red;border:none}',
        [{
          kind: 'selector',
          value: [{ value: 'a', metadata: { line: 1, column: 0, source: undefined } }],
          body: [
            { value: 'color:red', metadata: { line: 1, column: 2, source: undefined } },
            { value: 'border:none', metadata: { line: 1, column: 12, source: undefined } }
          ]
        }]
      ],
      'triple with whitespace': [
        'a{color:red;\nborder:\nnone;\n\n  display:block}',
        [{
          kind: 'selector',
          value: [{ value: 'a', metadata: { line: 1, column: 0, source: undefined } }],
          body: [
            { value: 'color:red', metadata: { line: 1, column: 2, source: undefined } },
            { value: 'border:none', metadata: { line: 2, column: 0, source: undefined } },
            { value: 'display:block', metadata: { line: 5, column: 2, source: undefined } }
          ]
        }]
      ],
      'two declarations': [
        'a{color:red}div{color:blue}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 0, source: undefined } }],
            body: [{ value: 'color:red', metadata: { line: 1, column: 2, source: undefined } }]
          },
          {
            kind: 'selector',
            value: [{ value: 'div', metadata: { line: 1, column: 12, source: undefined } }],
            body: [{ value: 'color:blue', metadata: { line: 1, column: 16, source: undefined } }]
          }
        ]
      ],
      'two declarations with whitespace': [
        'a{color:red}\n div{color:blue}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 0, source: undefined } }],
            body: [{ value: 'color:red', metadata: { line: 1, column: 2, source: undefined } }]
          },
          {
            kind: 'selector',
            value: [{ value: 'div', metadata: { line: 2, column: 1, source: undefined } }],
            body: [{ value: 'color:blue', metadata: { line: 2, column: 5, source: undefined } }]
          }
        ]
      ],
      'two declarations with whitespace and ending semicolon': [
        'a{color:red;\n}\n div{color:blue}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 0, source: undefined } }],
            body: [{ value: 'color:red', metadata: { line: 1, column: 2, source: undefined } }]
          },
          {
            kind: 'selector',
            value: [{ value: 'div', metadata: { line: 3, column: 1, source: undefined } }],
            body: [{ value: 'color:blue', metadata: { line: 3, column: 5, source: undefined } }]
          }
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('at rules', {
      '@import': [
        'a{}@import \n"test.css";\n\na{color:red}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 0, source: undefined } }],
            body: []
          },
          {
            kind: 'at-rule',
            value: '@import \n"test.css";',
            metadata: { line: 1, column: 3, source: undefined }
          },
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 4, column: 0, source: undefined } }],
            body: [{ value: 'color:red', metadata: { line: 4, column: 2, source: undefined } }]
          }
        ]
      ],
      '@charset': [
        '@charset "utf-8";a{color:red}',
        [
          {
            kind: 'at-rule',
            value: '@charset "utf-8";',
            metadata: { line: 1, column: 0, source: undefined }
          },
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 18, source: undefined } }],
            body: [{ value: 'color:red', metadata: { line: 1, column: 20, source: undefined } }]
          }
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('blocks', {
      '@media - simple': [
        '@media (min-width:980px){a{color:red}}',
        [
          {
            kind: 'block',
            value: '@media (min-width:980px)',
            metadata: { line: 1, column: 0, source: undefined },
            isFlatBlock: false,
            body: [{
              kind: 'selector',
              value: [{ value: 'a', metadata: { line: 1, column: 25, source: undefined } }],
              body: [{ value: 'color:red', metadata: { line: 1, column: 27, source: undefined } }]
            }]
          }
        ]
      ],
      '@media - with whitespace': [
        '@media (\nmin-width:980px)\n{\na{\ncolor:\nred}p{}}',
        [
          {
            kind: 'block',
            value: '@media (\nmin-width:980px)',
            metadata: { line: 1, column: 0, source: undefined },
            isFlatBlock: false,
            body: [
              {
                kind: 'selector',
                value: [{ value: 'a', metadata: { line: 4, column: 0, source: undefined } }],
                body: [{ value: 'color:red', metadata: { line: 5, column: 0, source: undefined } }]
              },
              {
                kind: 'selector',
                value: [{ value: 'p', metadata: { line: 6, column: 4, source: undefined } }],
                body: []
              }
            ]
          }
        ]
      ],
      '@media - stray whitespace at end': [
        '@media (min-width:980px){a{color:red} }p{color:red}',
        [
          {
            kind: 'block',
            value: '@media (min-width:980px)',
            metadata: { line: 1, column: 0, source: undefined },
            isFlatBlock: false,
            body: [
              {
                kind: 'selector',
                value: [{ value: 'a', metadata: { line: 1, column: 25, source: undefined } }],
                body: [{ value: 'color:red', metadata: { line: 1, column: 27, source: undefined } }]
              },
            ]
          },
          {
            kind: 'selector',
            value: [{ value: 'p', metadata: { line: 1, column: 39, source: undefined } }],
            body: [{ value: 'color:red', metadata: { line: 1, column: 41, source: undefined } }]
          }
        ]
      ],
      '@font-face': [
        '@font-face{font-family: "Font";\nsrc: url("font.ttf");\nfont-weight: normal;font-style: normal}a{}',
        [
          {
            kind: 'block',
            value: '@font-face',
            metadata: { line: 1, column: 0, source: undefined },
            isFlatBlock: true,
            body: [
              { value: 'font-family:"Font"', metadata: { line: 1, column: 11, source: undefined } },
              { value: 'src:url("font.ttf")', metadata: { line: 2, column: 0, source: undefined } },
              { value: 'font-weight:normal', metadata: { line: 3, column: 0, source: undefined } },
              { value: 'font-style:normal', metadata: { line: 3, column: 20, source: undefined } }
            ]
          },
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 3, column: 39, source: undefined } }],
            body: []
          }
        ]
      ],
      '@font-face with breaks': [
        '\n@font-face\n{font-family: "Font"}',
        [
          {
            kind: 'block',
            value: '@font-face',
            metadata: { line: 2, column: 0, source: undefined },
            isFlatBlock: true,
            body: [
              { value: 'font-family:"Font"', metadata: { line: 3, column: 1, source: undefined } },
            ]
          }
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('escaped content', {
      'top-level': [
        '__ESCAPED_COMMENT_CLEAN_CSS0(0, 5)__a{}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 5, source: undefined } }],
            body: []
          }
        ]
      ],
      'top-level with line breaks': [
        '__ESCAPED_COMMENT_CLEAN_CSS0(2, 5)__a{}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 3, column: 5, source: undefined } }],
            body: []
          }
        ]
      ],
      'in selectors': [
        'div[data-type=__ESCAPED_FREE_TEXT_CLEAN_CSS0(1,3)__],div[data-id=__ESCAPED_FREE_TEXT_CLEAN_CSS1(0,7)__]{color:red}',
        [{
          kind: 'selector',
          value: [
            { value: 'div[data-type=__ESCAPED_FREE_TEXT_CLEAN_CSS0(1,3)__]', metadata: { line: 1, column: 0, source: undefined } },
            { value: 'div[data-id=__ESCAPED_FREE_TEXT_CLEAN_CSS1(0,7)__]', metadata: { line: 2, column: 5, source: undefined } }
          ],
          body: [{ value: 'color:red', metadata: { line: 2, column: 26, source: undefined } }]
        }]
      ],
      'in properties': [
        'div{__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0(2,5)__background:url(__ESCAPED_URL_CLEAN_CSS0(0,20)__);color:blue}a{font-family:__ESCAPED_FREE_TEXT_CLEAN_CSS0(1,3)__;color:red}',
        [
          {
            kind: 'selector',
            value: [{ value: 'div', metadata: { line: 1, column: 0, source: undefined } }],
            body: [
              { value: '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0(2,5)__', metadata: { line: 1, column: 4, source: undefined }},
              { value: 'background:url(__ESCAPED_URL_CLEAN_CSS0(0,20)__)', metadata: { line: 3, column: 5, source: undefined } },
              { value: 'color:blue', metadata: { line: 3, column: 42, source: undefined } }
            ]
          },
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 3, column: 53, source: undefined } }],
            body: [
              { value: 'font-family:__ESCAPED_FREE_TEXT_CLEAN_CSS0(1,3)__', metadata: { line: 3, column: 55, source: undefined } },
              { value: 'color:red', metadata: { line: 4, column: 4, source: undefined } }
            ]
          }
        ]
      ],
      'in at-rules': [
        '@charset __ESCAPED_FREE_TEXT_CLEAN_CSS0(1, 5)__;div{}',
        [
          {
            kind: 'at-rule',
            value: '@charset __ESCAPED_FREE_TEXT_CLEAN_CSS0(1, 5)__;',
            metadata: { line: 1, column: 0, source: undefined }
          },
          {
            kind: 'selector',
            value: [{ value: 'div', metadata: { line: 2, column: 7, source: undefined } }],
            body: []
          }
        ]
      ],
      'in blocks': [
        '@media (__ESCAPED_COMMENT_CLEAN_CSS0(2, 1)__min-width:980px){a{color:red}}',
        [
          {
            kind: 'block',
            value: '@media (__ESCAPED_COMMENT_CLEAN_CSS0(2, 1)__min-width:980px)',
            metadata: { line: 1, column: 0, source: undefined },
            isFlatBlock: false,
            body: [{
              kind: 'selector',
              value: [{ value: 'a', metadata: { line: 3, column: 18, source: undefined } }],
              body: [{ value: 'color:red', metadata: { line: 3, column: 20, source: undefined } }]
            }]
          }
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('sources', {
      'one': [
        function () {
          var tracker = new SourceTracker();
          var tokenizer = new Tokenizer({ sourceTracker: tracker }, false, true);
          var data = tracker.store('one.css', 'a{}');
          return tokenizer.toTokens(data);
        },
        [{
          kind: 'selector',
          value: [{ value: 'a', metadata: { line: 1, column: 0, source: 'one.css' } }],
          body: []
        }]
      ],
      'two': [
        function () {
          var tracker = new SourceTracker();
          var tokenizer = new Tokenizer({ sourceTracker: tracker }, false, true);
          var data1 = tracker.store('one.css', 'a{}');
          var data2 = tracker.store('two.css', '\na{color:red}');
          return tokenizer.toTokens(data1 + data2);
        },
        [
          {
            kind: 'selector',
            value: [
              { value: 'a', metadata: { line: 1, column: 0, source: 'one.css' } }
            ],
            body: []
          },
          {
            kind: 'selector',
            value: [
              { value: 'a', metadata: { line: 2, column: 0, source: 'two.css' } }
            ],
            body: [{ value: 'color:red', metadata: { line: 2, column: 2, source: 'two.css' } }]
          }
        ]
      ]
    })
  )
  .export(module);
