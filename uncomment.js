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
		parts = [],
		index = 0,
		quote = false,
		quoteChar,
		regularExpression = false,
		characterClass = false,
		blockComment = false,
		lineComment = false,
		preserveComment = false;

	for (var i = 0; i < length; i++) {
		// When checking for quote escaping, we also need to check that the
		// escape sign itself is not escaped, as otherwise '\\' would cause the
		// wrong impression of an unclosed string:
		var unescaped = str[i - 1] !== '\\' || str[i - 2] === '\\';

		if (quote) {
			if (str[i] === quoteChar && unescaped)
				quote = false;
		} else if (regularExpression) {
			// Make sure '/'' inside character classes is not considered the end
			// of the regular expression.
			if (str[i] === '[' && unescaped) {
				characterClass = true;
			} else if (str[i] === ']' && unescaped && characterClass) {
				characterClass = false;
			} else if (str[i] === '/' && unescaped && !characterClass) {
				regularExpression = false;
			}
		} else if (blockComment) {
			// Is the block comment closing?
			if (str[i] === '*' && str[i + 1] === '/') {
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
			if (/[\n\r]/.test(str[i + 1])) {
				lineComment = false;
				// Next content starts after the comment.
				index = i + 1;
			}
		} else {
			if (/['"]/.test(str[i])) {
				quote = true;
				// Remember the type of opening quote so we can match it.
				quoteChar = str[i];
			} else if (str[i] === '/') {
				var next = str[i + 1];
				if (next === '*') {
					// Do not filter out conditional comments /*@ ... */
					// and comments marked as protected /*! ... */
					preserveComment = /[@!]/.test(str[i + 2]);
					blockComment = true;
				} else if (next === '/') {
					lineComment = true;
				} else {
					// We need to make sure we don't count normal divisions as
					// regular expressions. Matching this properly is difficult,
					// but if we assume that normal division always have a space
					// after /, a simple check for white space or '='' (for /=)
					// is enough to distinguish divisions from regexps.
					// TODO: Develop a proper check for regexps.
					regularExpression = !/[\s=]/.test(next);
				}
				if (index < i && (lineComment ||
						blockComment && !preserveComment)) {
					// Insert valid content up to the comment.
					parts.push(str.substring(index, index = i));
				}
			}
		}
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
