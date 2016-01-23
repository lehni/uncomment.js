## uncomment.js

A helper function that uncomments / strips all comments out of your JavaScript
code.

It uses a proper parser that is aware of JS syntax, in order to distinguish
regular expressions and strings from actual code blocks, and knows how to handle
them properly.

It also preserves conditional comments (`/*@ … */`) and comments marked as
protected (`/*! … */`).

Example:

```js
var uncomment = require('./uncomment.js');

var str = "\
var one = 1;\n\
// two\n\
three(/[\s\\/]/);\n\
// four\n\
five(one / 2);\n\
six(); /* seven\n\
eight\n\
nine\n\
*/ // ten\n\
eleven();\n\
";

var res = uncomment(str, {
	removeEmptyLines: true
});

console.log(res);
```

Input:

```js
var one = 1;
// two
three(/[\s\/]/);
// four
five(one / 2);
six(); /* seven
eight
nine
*/ // ten
eleven();
```

Output:

```js
var one = 1;
three(/[s\/]/);
five(one / 2);
six(); 
eleven();
```

Copyright © 2011 - 2016, [Jürg Lehni](http://scratchdisk.com/)
