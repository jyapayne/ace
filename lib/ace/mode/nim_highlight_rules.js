/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */
/*
 * TODO: nim delimiters
 */

define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var num_suffix = "(\'[Ff]32|\'[Ff]64|\'[IiUu]8|\'[IiUu]16|\'[IiUu]32|\'[IiUu]64)";

var NimHighlightRules = function() {

    var keywords = (
        "addr|and|as|asm|atomic|bind|block|break|case|cast|const|continue|" +
        "converter|defer|discard|distinct|div|do|elif|else|end|enum|except|" +
        "export|finally|for|from|func|generic|if|import|in|include|interface|" +
        "is|isnot|iterator|let|macro|method|mixin|mod|nil|not|notin|object|of|" +
        "or|out|proc|ptr|raise|ref|return|shl|shr|static|template|try|tuple|" +
        "type|using|var|when|while|with|without|xor|yield"
    );

    var builtinConstants = (
        "true|false|nil|NotImplemented|Ellipsis"
    );

    var storageType = (
        "string|seq|array|expr|stmt|typed|untyped|any|auto|bool|cdouble|cfloat|"+
        "cchar|clongdouble|clong|clonglong|cshort|csize|cstring|cstringarray|"+
        "culong|culonglong|cushort|guarded|natural|openarray|ordinal|pointer|"+
        "range|set|shared|static|typedesc|varargs|void"
    );

    var builtinFunctions = (
        "defined|declared|declaredInScope|echo|$"
    );

    //var futureReserved = "";
    var keywordMapper = this.createKeywordMapper({
        "invalid.deprecated": "debugger",
        "support.function": builtinFunctions,
        //"invalid.illegal": futureReserved,
        "constant.language": builtinConstants,
        "storage.type" : storageType,
        "keyword": keywords
    }, "identifier");

    var strPre = "(?:r|R)?";

    var decimalInteger = "(?:(?:[1-9]\\d*)|(?:0))";
    var octInteger = "(?:0[o]?[0-7]+)";
    var hexInteger = "(?:0[xX][\\dA-Fa-f]+)";
    var binInteger = "(?:0[bB][01]+)";
    var integer = "(?:" + decimalInteger + "|" + octInteger + "|" + hexInteger + "|" + binInteger + ")";

    var exponent = "(?:[eE][+-]?\\d+)";
    var fraction = "(?:\\.\\d+)";
    var intPart = "(?:\\d+)";
    var pointFloat = "(?:(?:" + intPart + "?" + fraction + ")|(?:" + intPart + "\\.))";
    var exponentFloat = "(?:(?:" + pointFloat + "|" +  intPart + ")" + exponent + ")";
    var floatNumber = "(?:" + exponentFloat + "|" + pointFloat + ")";

    var stringEscape =  "\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})";

    this.$rules = {
        "start" : [ {
            token : "comment",
            regex : "#.*$"
        }, {
            token : "keyword",
            regex : "(proc|method|temdplate|macro|macromethod|converter|func|iterator) ",
            next  : "qproc_name"
        }, {
            token : "storage.type",
            regex : "(c|cu|u)?int(8|16|32|64)?",
        }, {
            token : "storage.type",
            regex : "(c|cu|u|cs)?char",
        }, {
            token : "storage.type",
            regex : "float(32|64)?",
        }, {
            token : "docstring",
            regex : "##.*$"
        }, {
            token : "string",           // multi line """ string start
            regex : strPre + '"{3}',
            next : "qqstring3"
        }, {
            token : "string",           // " string
            regex : strPre + '"(?=.)',
            next : "qqstring"
        }, {
            token : "string",           // multi line ''' string start
            regex : strPre + "'{3}",
            next : "qstring3"
        }, {
            token : "backtick",           // ` string
            regex : strPre + "`(?=.)",
            next : "qxstring"
        }, {
            token : "string",           // ' string
            regex : strPre + "'(?=.)",
            next : "qstring"
        }, {
            token : "constant.numeric", // imaginary
            regex : "(?:" + floatNumber + "|\\d+)[jJ]\\b"
        }, {
            token : "constant.numeric", // float
            regex : floatNumber
        }, {
            token : "constant.numeric", // long integer
            regex : integer + "[lL]\\b"
        }, {
            token : "constant.numeric", // integer
            regex : integer + "\\b"
        }, {
            token : keywordMapper,
            regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
        }, {
            token : "keyword.operator",
            regex : "\\+|\\-|\\*|\\*\\*|\\/|\\/\\/|%|<<|>>|&|\\||\\^|~|<|>|<=|=>|==|!=|<>|="
        }, {
            token : "paren.lparen",
            regex : "[\\[\\(\\{]"
        }, {
            token : "paren.rparen",
            regex : "[\\]\\)\\}]"
        }, {
            token : "text",
            regex : "\\s+"
        } ],
        "qqstring3" : [ {
            token : "constant.language.escape",
            regex : stringEscape
        }, {
            token : "string", // multi line """ string end
            regex : '"{3}',
            next : "start"
        }, {
            defaultToken : "string"
        } ],
        "qstring3" : [ {
            token : "constant.language.escape",
            regex : stringEscape
        }, {
            token : "string",  // multi line ''' string end
            regex : "'{3}",
            next : "start"
        }, {
            defaultToken : "string"
        } ],
        "qqstring" : [{
            token : "constant.language.escape",
            regex : stringEscape
        }, {
            token : "string",
            regex : "\\\\$",
            next  : "qqstring"
        }, {
            token : "string",
            regex : '"|$',
            next  : "start"
        }, {
            defaultToken: "string"
        }],
        "qstring" : [{
            token : "constant.language.escape",
            regex : stringEscape
        }, {
            token : "string",
            regex : "\\\\$",
            next  : "qstring"
        }, {
            token : "string",
            regex : "'|$",
            next  : "start"
        }, {
            defaultToken: "string"
        }],
        "qxstring" : [{
            token : "constant.language.escape",
            regex : stringEscape
        }, {
            token : "backtick",
            regex : "\\\\$",
            next  : "qxstring"
        }, {
            token : "backtick",
            regex : "`|$",
            next  : "start"
        }, {
            defaultToken: "backtick"
        }],
        "qproc_name":[{
            token : "proc_name",
            regex : "\\w+",
        },{
            token : "start_bracket",
            regex : "(\\(|=|$)",
            next : "start"
        }],
    };
};

oop.inherits(NimHighlightRules, TextHighlightRules);

exports.NimHighlightRules = NimHighlightRules;
});
