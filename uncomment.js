/**
 * uncomment.js - Strips comments out of JavaScript code.
 *
 * Copyright (c) 2011 - 2016 Juerg Lehni
 * http://scratchdisk.com/
 *
 * Distributed under the MIT license.
 */

function uncomment(str, options) {
	options = options || {};
	var length = str.length,
		chr = str[0],
		prev,
		next,
		parts = [],
		index = 0,
		prevToken,
		quote = false,
		quoteChar,
		regularExpression = false,
		characterClass = false,
		blockComment = false,
		lineComment = false,
		preserveComment = false;

	for (var i = 0; i < length; i++) {
		next = str[i + 1];
		// When checking for quote escaping, we also need to check that the
		// escape sign itself is not escaped, as otherwise '\\' would cause the
		// wrong impression of an unclosed string:
		var unescaped = prev !== '\\' || str[i - 2] === '\\';
		if (quote) {
			if (chr === quoteChar && unescaped)
				quote = false;
		} else if (regularExpression) {
			// Make sure '/'' inside character classes is not considered the end
			// of the regular expression.
			if (chr === '[' && unescaped) {
				characterClass = true;
			} else if (chr === ']' && unescaped && characterClass) {
				characterClass = false;
			} else if (chr === '/' && unescaped && !characterClass) {
				regularExpression = false;
			}
		} else if (blockComment) {
			// Is the block comment closing?
			if (chr === '*' && next === '/') {
				// Increase by 1 to skip closing '/', as it would be mistaken
				// for a regexp otherwise.
				i++;
				if (!preserveComment) {
					// Next content starts after the comment.
					index = i + 1;
				}
				blockComment = preserveComment = false;
			}
		} else if (lineComment) {
			// One-line comments end with the line-break.
			if (/[\n\r]/.test(next)) {
				lineComment = false;
				// Next content starts after the comment.
				index = i + 1;
			}
		} else {
			if (/['"]/.test(chr)) {
				quote = true;
				// Remember the type of opening quote so we can match it.
				quoteChar = chr;
			} else if (chr === '/') {
				if (next === '*') {
					// Do not filter out conditional comments /*@ ... */
					// and comments marked as protected /*! ... */
					preserveComment = /[@!]/.test(str[i + 2]);
					blockComment = true;
				} else if (next === '/') {
					lineComment = true;
				} else {
					// We need to make sure we don't count normal divisions as
					// regular expressions. Look at the previous token in the
					// code to decide if this is a regular expression.
					// This check is based on code in JSLint:
					regularExpression = /[(,=:[!&|?{};\/]/.test(prevToken);
				}
				if (index < i && (lineComment ||
						blockComment && !preserveComment)) {
					// Insert valid content up to the comment.
					parts.push(str.substring(index, i));
					index = i;
				}
			}
		}
		// Keep track of the previous non-whitespace character, as required by
		// the regular expression check above.
		if (!/\s/.test(chr))
			prevToken = chr;
		prev = chr;
		chr = next;
	}
	if (index < length && !lineComment && (!blockComment || preserveComment)) {
		// Insert valid content up to the end of the string.
		parts.push(str.substring(index, length));
	}
	// Convert back to one string, by concatenating the valid parts.
	str = parts.join('');

	if (options.removeEmptyLines || options.mergeEmptyLines) {
		// Strip empty lines that contain only white space and line breaks, as
		// they are left-overs from comment removal.
		str = str.replace(/^([ \t]+(?:\r\n|\n|\r))/gm, function(all) {
			return '';
		});

		// Replace a sequence of two or more line breaks with:
		// - One break, if removeEmptyLines is set.
		// - Two breaks, if mergeEmptyLines is set, meaning they all merge to 
		//   one empty line.
		str = str.replace(/(\r\n|\n|\r){2,}/g, function(all, lineBreak) {
			return options.mergeEmptyLines ? lineBreak + lineBreak : lineBreak;
		});
	}

	return str;
}

// Export uncomment function for node
if (typeof module !== 'undefined')
	module.exports = uncomment;
