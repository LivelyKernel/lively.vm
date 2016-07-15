
;(function() {
  var GLOBAL = typeof window !== "undefined" ? window :
    typeof global!=="undefined" ? global :
      typeof self!=="undefined" ? self : this;
  var lively = GLOBAL.lively = GLOBAL.lively || (GLOBAL.lively = {});
/*global window, process, global*/


;(function(Global) {

  var globalInterfaceSpec = [
    {action: "installMethods", target: "Array",              sources: ["arr"],    methods: ["from","genN","range","withN"]},
    {action: "installMethods", target: "Array.prototype",    sources: ["arr"],    methods: ["all","any","batchify","clear","clone","collect","compact","delimWith","detect","doAndContinue","each","equals","filterByKey","findAll","first","flatten","forEachShowingProgress","grep","groupBy","groupByKey","histogram","include","inject","intersect","invoke","last","mapAsync", "mapAsyncSeries", "mask","max","min","mutableCompact","nestedDelay","partition","pluck","pushAll","pushAllAt","pushAt","pushIfNotIncluded","reMatches","reject","rejectByKey","remove","removeAt","replaceAt","rotate","shuffle","size","sortBy","sortByKey","sum","swap","toArray","toTuples","union","uniq","uniqBy","without","withoutAll","zip"], alias: [["select", "filter"],["find","detect"]]},
    {action: "installMethods", target: "Date",               sources: ["date"],   methods: [/*"parse"*/]},
    {action: "installMethods", target: "Date.prototype",     sources: ["date"],   methods: ["equals","format","relativeTo"]},
    {action: "installMethods", target: "Function",           sources: ["fun"],    methods: ["fromString"]},
    {action: "installMethods", target: "Function.prototype", sources: ["fun"],    methods: [/*"addProperties",*/"addToObject","argumentNames","asScript","asScriptOf","binds","curry","delay","functionNames","localFunctionNames","getOriginal","getVarMapping","logCalls","logCompletion","logErrors","qualifiedMethodName","setProperty","traceCalls","wrap"]},
    {action: "installMethods", target: "Number",             sources: ["num"],    methods: []},
    {action: "installMethods", target: "Number.prototype",   sources: ["num"],    methods: ["detent","randomSmallerInteger","roundTo","toDegrees","toRadians"]},
    {action: "installMethods", target: "Object",             sources: ["obj"],    methods: ["addScript","clone","deepCopy","extend","inherit","isArray","isBoolean","isElement","isEmpty","isFunction","isNumber","isObject","isRegExp","isString","isUndefined","merge","mergePropertyInHierarchy","values","valuesInPropertyHierarchy"]},
    {action: "installMethods", target: "Object.prototype",   sources: ["obj"],    methods: []},
    {action: "installMethods", target: "String.prototype",   sources: ["string"], methods: ["camelize","capitalize","digitValue","empty","endsWith","hashCode","include","pad","regExpEscape","startsWith","startsWithVowel","succ","times","toArray","toQueryParams","truncate"]},
    {action: "installMethods", target: "Function.prototype", sources: ["klass"],  methods: ["create","addMethods","isSubclassOf","superclasses","categoryNameFor","remove"], alias: [["subclass", "create"]]},

    {action: "installObject", target: "Numbers",                source: "num",        methods: ["average","between","convertLength","humanReadableByteSize","median","normalRandom","parseLength","random","sort"]},
    {action: "installObject", target: "Properties",             source: "properties", methods: ["all","allOwnPropertiesOrFunctions","allProperties","any","forEachOwn","hash","nameFor","own","ownValues","values"]},
    {action: "installObject", target: "Strings",                source: "string",     methods: ["camelCaseString","createDataURI","diff","format","formatFromArray","indent","lineIndexComputer","lines","md5","newUUID","nonEmptyLines","pad","paragraphs","peekLeft","peekRight","print","printNested","printTable","printTree","quote","reMatches","removeSurroundingWhitespaces","stringMatch","tableize","tokens","unescapeCharacterEntities","withDecimalPrecision"]},
    {action: "installObject", target: "Objects",                source: "obj",        methods: ["asObject", "equals","inspect","isMutableType","safeToString","shortPrintStringOf","typeStringOf"]},
    {action: "installObject", target: "Functions",              source: "fun",        methods: ["all","compose","composeAsync","createQueue","debounce","debounceNamed","either","extractBody","flip","notYetImplemented","once","own","throttle","throttleNamed","timeToRun","timeToRunN","waitFor","workerWithCallbackQueue","wrapperChain"]},
    {action: "installObject", target: "Grid",                   source: "grid"},
    {action: "installObject", target: "Interval",               source: "interval"},
    {action: "installObject", target: "lively.ArrayProjection", source: "arrayProjection"},
    {action: "installObject", target: "lively.Closure",         source: "Closure"},
    {action: "installObject", target: "lively.Grouping",        source: "Group"},
    {action: "installObject", target: "lively.PropertyPath",    source: "Path"},
    {action: "installObject", target: "lively.Worker",          source: "worker"},
    {action: "installObject", target: "lively.Class",           source: "classHelper"}
  ];

  var isNode = typeof require !== 'undefined' && typeof exports !== 'undefined';

  var livelyLang = createLivelyLangObject();
  if (isNode) { module.exports = livelyLang; if (!Global.lively) return; }

  livelyLang._prevLivelyGlobal = Global.lively;
  if (!Global.lively) Global.lively = {};
  if (!Global.lively.lang) Global.lively.lang = livelyLang;
  else
    for (var name in livelyLang) {
      Global.lively.lang[name] = livelyLang[name];
    }

  return;

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  function createLivelyLangObject() {
    return {
      chain: chain,
      noConflict: noConflict,
      installGlobals: installGlobals,
      uninstallGlobals: uninstallGlobals,
      globalInterfaceSpec: globalInterfaceSpec,
      deprecatedLivelyPatches: deprecatedLivelyPatches,
      toString: function() { return "[object lively.lang]"; }
    };
  }

  function chain(object) {
    if (!object) return object;

    var chained;
    if (Array.isArray(object)) return createChain(livelyLang.arr, object);
    if (object.constructor.name === "Date") return createChain(livelyLang.date, object);
    switch (typeof object) {
      case 'string': return createChain(livelyLang.string, object);
      case 'object': return createChain(livelyLang.obj, object);
      case 'function': return createChain(livelyLang.fun, object);
      case 'number': return createChain(livelyLang.num, object);
    }
    throw new Error("Chain for object " + object + " (" + object.constructor.name + ") no supported");
  }

  function createChain(interfaceObj, obj) {
    return Object.keys(interfaceObj).reduce(function(chained, methodName) {
      chained[methodName] = function(/*args*/) {
        var args = Array.prototype.slice.call(arguments),
            result = interfaceObj[methodName].apply(null, [obj].concat(args));
        return chain(result);
      }
      return chained;
    }, {value: function() { return obj; }});
  }

  function noConflict() {
    if (!isNode) {
      var keepLivelyNS = livelyLang._prevLivelyGlobal;
      if (!keepLivelyNS) delete Global.lively
      else delete Global.lively.lang
    }
    return livelyLang;
  }

  function installGlobals() {
    globalInterfaceSpec.forEach(function(ea) {
      if (ea.action === "installMethods") {
        var targetPath = livelyLang.Path(ea.target);
        if (!targetPath.isIn(Global)) targetPath.set(Global, {}, true);
        var sourcePath = livelyLang.Path(ea.sources[0]);
        ea.methods.forEach(function(name) {
          installProperty(
            sourcePath.concat([name]),
            targetPath.concat([name]));
        });
        if (ea.alias)
          ea.alias.forEach(function(mapping) {
            installProperty(
              sourcePath.concat([mapping[1]]),
              targetPath.concat([mapping[0]]));
          });

      } else if (ea.action === "installObject") {
        var targetPath = livelyLang.Path(ea.target);
        var source = livelyLang.Path(ea.source).get(livelyLang);
        targetPath.set(Global, source, true);

      } else throw new Error("Cannot deal with global setup action: " + ea.action);
    });
  }

  function installProperty(sourcePath, targetPath) {
    if (!sourcePath.isIn(livelyLang)) {
      var err = new Error("property not provided by lively.lang: " + sourcePath);
      console.error(err.stack || err);
      throw err;
    }

    var prop = sourcePath.get(livelyLang);
    if (typeof prop === "function" && targetPath.slice(-2, -1).toString() === "prototype") {
      var origFunc = prop;
      prop = function(/*this and args*/) {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(this);
        return origFunc.apply(null, args);
      };
      prop.toString = function() { return origFunc.toString(); };
    }
    targetPath.set(Global, prop, true);
  }

  function uninstallGlobals() {
    globalInterfaceSpec.forEach(function(ea) {
      if (ea.action === "installMethods") {
        var p = livelyLang.Path(ea.target)
        var source = livelyLang.Path(ea.source).get(livelyLang);
        var target = p.get(Global);
        if (!target) return;
        ea.methods
          .filter(function(name) { return source === target[name]; })
          .forEach(function(name) { delete target[name]; });
        if (ea.alias)
          ea.alias
            .filter(function(name) { return source === target[name]; })
            .forEach(function(mapping) { delete target[mapping[0]]; });

      } else if (ea.action === "installObject") {
        var p = livelyLang.Path(ea.target);
        p.del(Global);

      } else throw new Error("Cannot deal with global setup action: " + ea.action);
    })
  }

  function deprecatedLivelyPatches() {
    livelyLang.installGlobals();

    Global.$A = Array.from;

    // We need to redefine Function.evalJS here b/c the original definition is
    // in a JS 'use strict' block. However, not all function sources we pass in
    // #evalJS from Lively adhere to the strictness rules. To allow those
      // functions for now we define the creator again outside of a strictness block.

    // rk 2016-05-22: !!! in order to not capture objects in the lexical scope of
    // eval as they were defined while THIS files WAS loaded, we need to inject
    // globals / context, i.e. local lively here might be != Global.lively!

    Function.evalJS = livelyLang.fun.evalJS = function(src) {
        var fixVars = ""
            + "var Global = typeof System !== 'undefined' ? System.global :\n"
            + "    typeof window !== 'undefined' ? window :\n"
            + "    typeof global!=='undefined' ? global :\n"
            + "    typeof self!=='undefined' ? self : this;\n";
        if (Global.lively && Global.lively != lively)
            fixVars += "var lively = Global.lively;\n";
        return eval(fixVars + src);
    }

    livelyLang.Path.type = livelyLang.PropertyPath;
    livelyLang.Path.prototype.serializeExpr = function () {
      // ignore-in-doc
      return 'lively.PropertyPath(' + livelyLang.obj.inspect(this.parts()) + ')';
    }

    livelyLang.Closure.type = "lively.Closure";
    livelyLang.fun.methodChain = livelyLang.fun.wrapperChain;

    if (typeof JSON !== "undefined") JSON.prettyPrint = function(jso) { return JSON.stringify(jso, null, 2); };

    Global.NativeArrayFunctions = livelyLang.arrNative;
  }

})(typeof window !== "undefined" ? window :
    typeof global!=="undefined" ? global :
      typeof self!=="undefined" ? self : this);
;
(function (exports) {
    'use strict';
    function print(object) {
        if (object && obj.isArray(object)) {
            return '[' + object.map(print) + ']';
        }
        if (typeof object !== 'string') {
            return String(object);
        }
        var result = String(object);
        result = result.replace(/\n/g, '\\n\\\n');
        result = result.replace(/(")/g, '\\$1');
        result = '"' + result + '"';
        return result;
    }
    function indent(str, indentString, depth) {
        if (!depth || depth <= 0)
            return str;
        while (depth > 0) {
            depth--;
            str = indentString + str;
        }
        return str;
    }
    var obj = exports.obj = {
        isArray: function (obj) {
            return obj && Array.isArray(obj);
        },
        isElement: function (object) {
            return object && object.nodeType == 1;
        },
        isFunction: function (object) {
            return object instanceof Function;
        },
        isBoolean: function (object) {
            return typeof object == 'boolean';
        },
        isString: function (object) {
            return typeof object == 'string';
        },
        isNumber: function (object) {
            return typeof object == 'number';
        },
        isUndefined: function (object) {
            return typeof object == 'undefined';
        },
        isRegExp: function (object) {
            return object instanceof RegExp;
        },
        isObject: function (object) {
            return typeof object == 'object';
        },
        isPrimitive: function (obj) {
            if (!obj)
                return true;
            switch (typeof obj) {
            case 'string':
            case 'number':
            case 'boolean':
                return true;
            }
            return false;
        },
        isEmpty: function (object) {
            for (var key in object)
                if (object.hasOwnProperty(key))
                    return false;
            return true;
        },
        equals: function (a, b) {
            if (a === b)
                return true;
            if (!a && !b)
                return true;
            if (!a || !b)
                return false;
            if (Array.isArray(a))
                return exports.arr.deepEquals(a, b);
            switch (a.constructor) {
            case String:
            case Date:
            case Boolean:
            case Number:
                return a == b;
            }
            ;
            if (typeof a.isEqualNode === 'function')
                return a.isEqualNode(b);
            if (typeof a.equals === 'function')
                return a.equals(b);
            return cmp(a, b) && cmp(b, a);
            function cmp(left, right) {
                for (var name in left) {
                    if (typeof left[name] === 'function')
                        continue;
                    if (!obj.equals(left[name], right[name]))
                        return false;
                }
                return true;
            }
        },
        keys: Object.keys || function (object) {
            var keys = [];
            for (var property in object)
                keys.push(property);
            return keys;
        },
        values: function (object) {
            return object ? Object.keys(object).map(function (k) {
                return object[k];
            }) : [];
        },
        select: function (obj, keys) {
            var selected = {};
            for (var i = 0; i < keys.length; i++)
                selected[keys[i]] = obj[keys[i]];
            return selected;
        },
        addScript: function (object, funcOrString, optName, optMapping) {
            var func = exports.fun.fromString(funcOrString);
            return exports.fun.asScriptOf(func, object, optName, optMapping);
        },
        extend: function (destination, source) {
            var currentCategoryNames = null;
            for (var i = 1; i < arguments.length; i++) {
                if (typeof arguments[i] == 'string') {
                    var catName = arguments[i];
                    if (!destination.categories)
                        destination.categories = {};
                    if (!destination.categories[catName])
                        destination.categories[catName] = [];
                    currentCategoryNames = destination.categories[catName];
                    continue;
                }
                var source = arguments[i];
                for (var property in source) {
                    var getter = source.__lookupGetter__(property), setter = source.__lookupSetter__(property);
                    if (getter)
                        destination.__defineGetter__(property, getter);
                    if (setter)
                        destination.__defineSetter__(property, setter);
                    if (getter || setter)
                        continue;
                    var sourceObj = source[property];
                    destination[property] = sourceObj;
                    if (currentCategoryNames)
                        currentCategoryNames.push(property);
                    if (typeof sourceObj === 'function') {
                        if (!sourceObj.displayName)
                            sourceObj.displayName = property;
                        if (typeof lively !== 'undefined' && lively.Module && lively.Module.current)
                            sourceObj.sourceModule = lively.Module.current();
                    }
                }
            }
            return destination;
        },
        clone: function (object) {
            if (obj.isPrimitive(object))
                return object;
            if (Array.isArray(object))
                return Array.prototype.slice.call(object);
            var clone = {};
            for (var key in object) {
                if (object.hasOwnProperty(key))
                    clone[key] = object[key];
            }
            return clone;
        },
        extract: function (object, properties, mapFunc) {
            var copied = {};
            for (var i = 0; i < properties.length; i++) {
                if (properties[i] in object)
                    copied[properties[i]] = mapFunc ? mapFunc(properties[i], object[properties[i]]) : object[properties[i]];
            }
            return copied;
        },
        inspect: function inspect(object, options, depth) {
            options = options || {};
            depth = depth || 0;
            if (options.customPrinter) {
                var ignoreSignal = options._ignoreSignal || (options._ignoreSignal = {});
                var customInspected = options.customPrinter(object, ignoreSignal);
                if (customInspected !== ignoreSignal)
                    return customInspected;
            }
            if (!object)
                return print(object);
            if (typeof object === 'function') {
                return options.printFunctionSource ? String(object) : 'function' + (object.name ? ' ' + object.name : '') + '(' + exports.fun.argumentNames(object).join(',') + ') {/*...*/}';
            }
            switch (object.constructor) {
            case String:
            case Boolean:
            case RegExp:
            case Number:
                return print(object);
            }
            ;
            if (typeof object.serializeExpr === 'function')
                return object.serializeExpr();
            var isArray = object && Array.isArray(object), openBr = isArray ? '[' : '{', closeBr = isArray ? ']' : '}';
            if (options.maxDepth && depth >= options.maxDepth)
                return openBr + '/*...*/' + closeBr;
            var printedProps = [];
            if (isArray) {
                printedProps = object.map(function (ea) {
                    return inspect(ea, options, depth + 1);
                });
            } else {
                printedProps = Object.keys(object).sort(function (a, b) {
                    var aIsFunc = typeof object[a] === 'function', bIsFunc = typeof object[b] === 'function';
                    if (aIsFunc === bIsFunc) {
                        if (a < b)
                            return -1;
                        if (a > b)
                            return 1;
                        return 0;
                    }
                    return aIsFunc ? 1 : -1;
                }).map(function (key, i) {
                    if (isArray)
                        inspect(object[key], options, depth + 1);
                    var printedVal = inspect(object[key], options, depth + 1);
                    return options.escapeKeys ? Strings.print(key) : key + ': ' + printedVal;
                });
            }
            if (printedProps.length === 0) {
                return openBr + closeBr;
            }
            var printedPropsJoined = printedProps.join(', '), useNewLines = (!isArray || options.newLineInArrays) && (!options.minLengthForNewLine || printedPropsJoined.length >= options.minLengthForNewLine), ind = indent('', options.indent || '  ', depth), propIndent = indent('', options.indent || '  ', depth + 1), startBreak = useNewLines && !isArray ? '\n' + propIndent : '', eachBreak = useNewLines ? '\n' + propIndent : '', endBreak = useNewLines && !isArray ? '\n' + ind : '';
            if (useNewLines)
                printedPropsJoined = printedProps.join(',' + eachBreak);
            return openBr + startBreak + printedPropsJoined + endBreak + closeBr;
        },
        merge: function (objs) {
            if (arguments.length > 1) {
                return obj.merge(Array.prototype.slice.call(arguments));
            }
            if (Array.isArray(objs[0])) {
                return Array.prototype.concat.apply([], objs);
            }
            return objs.reduce(function (merged, ea) {
                for (var name in ea)
                    if (ea.hasOwnProperty(name))
                        merged[name] = ea[name];
                return merged;
            }, {});
        },
        deepMerge: function (objA, objB) {
            if (!objA)
                return objB;
            if (!objB)
                return objA;
            if (Array.isArray(objA)) {
                if (!Array.isArray(objB))
                    return objB;
                var merged = objA.map(function (ea, i) {
                    return obj.deepMerge(ea, objB[i]);
                });
                if (objB.length > objA.length)
                    merged = merged.concat(objB.slice(objA.length));
                return merged;
            }
            if (typeof objA !== 'object' || typeof objB !== 'object')
                return objB;
            return Object.keys(objA).concat(Object.keys(objB)).reduce(function (merged, name) {
                if (!objA[name])
                    merged[name] = objB[name];
                else if (!objB[name])
                    merged[name] = objA[name];
                else if (typeof objA[name] !== 'object' || typeof objB[name] !== 'object')
                    merged[name] = objB[name];
                else
                    merged[name] = obj.deepMerge(objA[name], objB[name]);
                return merged;
            }, {});
        },
        inherit: function (obj) {
            return Object.create(obj);
        },
        valuesInPropertyHierarchy: function (obj, name) {
            var result = [], lookupObj = obj;
            while (lookupObj) {
                if (lookupObj.hasOwnProperty(name))
                    result.unshift(lookupObj[name]);
                lookupObj = Object.getPrototypeOf(lookupObj);
            }
            return result;
        },
        mergePropertyInHierarchy: function (obj, propName) {
            return this.merge(this.valuesInPropertyHierarchy(obj, propName));
        },
        deepCopy: function (object) {
            if (!object || typeof object !== 'object' || object instanceof RegExp)
                return object;
            var result = Array.isArray(object) ? Array(object.length) : {};
            for (var key in object) {
                if (object.hasOwnProperty(key))
                    result[key] = obj.deepCopy(object[key]);
            }
            return result;
        },
        typeStringOf: function (obj) {
            if (obj === null)
                return 'null';
            if (typeof obj === 'undefined')
                return 'undefined';
            return obj.constructor.name;
        },
        shortPrintStringOf: function (obj) {
            if (!this.isMutableType(obj))
                return this.safeToString(obj);
            if (obj.constructor.name !== 'Object' && !Array.isArray(obj)) {
                if (obj.constructor.name)
                    return obj.constructor.name ? obj.constructor.name : Object.prototype.toString.call(obj).split(' ')[1].split(']')[0];
            }
            var typeString = '';
            function displayTypeAndLength(obj, collectionType, firstBracket, secondBracket) {
                if (obj.constructor.name === collectionType) {
                    typeString += firstBracket;
                    if (obj.length || Object.keys(obj).length)
                        typeString += '...';
                    typeString += secondBracket;
                }
            }
            displayTypeAndLength(obj, 'Object', '{', '}');
            displayTypeAndLength(obj, 'Array', '[', ']');
            return typeString;
        },
        isMutableType: function (obj) {
            var immutableTypes = [
                'null',
                'undefined',
                'Boolean',
                'Number',
                'String'
            ];
            return immutableTypes.indexOf(this.typeStringOf(obj)) === -1;
        },
        safeToString: function (obj) {
            try {
                return (obj ? obj.toString() : String(obj)).replace('\n', '');
            } catch (e) {
                return '<error printing object>';
            }
        },
        asObject: function (obj) {
            switch (typeof obj) {
            case 'string':
                return new String(obj);
            case 'boolean':
                return new Boolean(obj);
            case 'number':
                return new Number(obj);
            default:
                return obj;
            }
        }
    };
    var properties = exports.properties = {
        all: function (object, predicate) {
            var a = [];
            for (var name in object) {
                if ((object.__lookupGetter__(name) || typeof object[name] !== 'function') && (predicate ? predicate(name, object) : true))
                    a.push(name);
            }
            return a;
        },
        allOwnPropertiesOrFunctions: function (obj, predicate) {
            return Object.getOwnPropertyNames(obj).reduce(function (result, name) {
                if (predicate ? predicate(obj, name) : true)
                    result.push(name);
                return result;
            }, []);
        },
        own: function (object) {
            var a = [];
            for (var name in object) {
                if (object.hasOwnProperty(name) && (object.__lookupGetter__(name) || object[name] !== 'function'))
                    a.push(name);
            }
            return a;
        },
        forEachOwn: function (object, func, context) {
            var result = [];
            for (var name in object) {
                if (!object.hasOwnProperty(name))
                    continue;
                var value = object[name];
                if (value !== 'function') {
                    result.push(func.call(context || this, name, value));
                }
            }
            return result;
        },
        nameFor: function (object, value) {
            for (var name in object) {
                if (object[name] === value)
                    return name;
            }
            return undefined;
        },
        values: function (obj) {
            var values = [];
            for (var name in obj)
                values.push(obj[name]);
            return values;
        },
        ownValues: function (obj) {
            var values = [];
            for (var name in obj) {
                if (obj.hasOwnProperty(name))
                    values.push(obj[name]);
            }
            return values;
        },
        any: function (obj, predicate) {
            for (var name in obj) {
                if (predicate(obj, name))
                    return true;
            }
            return false;
        },
        allProperties: function (obj, predicate) {
            var result = [];
            for (var name in obj) {
                if (predicate ? predicate(obj, name) : true)
                    result.push(name);
            }
            return result;
        },
        hash: function (obj) {
            return Object.keys(obj).sort().join('').hashCode();
        }
    };
    var Path = exports.Path = function Path(p, splitter) {
        if (p instanceof Path)
            return p;
        if (!(this instanceof Path))
            return new Path(p, splitter);
        if (splitter)
            this.setSplitter(splitter);
        return this.fromPath(p);
    };
    obj.extend(Path, {
        superclass: Object,
        type: 'Path',
        categories: {}
    });
    obj.extend(Path.prototype, {
        isPathAccessor: true,
        splitter: '.',
        fromPath: function (path) {
            if (obj.isString(path) && path !== '' && path !== this.splitter) {
                this._parts = path.split(this.splitter);
                this._path = path;
            } else if (obj.isArray(path)) {
                this._parts = [].concat(path);
                this._path = path.join(this.splitter);
            } else {
                this._parts = [];
                this._path = '';
            }
            return this;
        },
        setSplitter: function (splitter) {
            if (splitter)
                this.splitter = splitter;
            return this;
        },
        parts: function () {
            return this._parts;
        },
        size: function () {
            return this._parts.length;
        },
        slice: function (n, m) {
            return Path(this.parts().slice(n, m));
        },
        normalizePath: function () {
            return this._path;
        },
        isRoot: function (obj) {
            return this._parts.length === 0;
        },
        isIn: function (obj) {
            if (this.isRoot())
                return true;
            var parent = this.get(obj, -1);
            return parent && parent.hasOwnProperty(this._parts[this._parts.length - 1]);
        },
        equals: function (obj) {
            return obj && obj.isPathAccessor && this.parts().equals(obj.parts());
        },
        isParentPathOf: function (otherPath) {
            otherPath = otherPath && otherPath.isPathAccessor ? otherPath : Path(otherPath);
            var parts = this.parts(), otherParts = otherPath.parts();
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] != otherParts[i])
                    return false;
            }
            return true;
        },
        relativePathTo: function (otherPath) {
            otherPath = Path(otherPath);
            return this.isParentPathOf(otherPath) ? otherPath.slice(this.size(), otherPath.size()) : undefined;
        },
        del: function (obj) {
            if (this.isRoot())
                return false;
            var parent = obj;
            for (var i = 0; i < this._parts.length - 1; i++) {
                var part = this._parts[i];
                if (parent.hasOwnProperty(part)) {
                    parent = parent[part];
                } else
                    return false;
            }
            return delete parent[this._parts[this._parts.length - 1]];
        },
        withParentAndKeyDo: function (obj, ensure, doFunc) {
            if (this.isRoot())
                return doFunc(null, null);
            var parent = obj;
            for (var i = 0; i < this._parts.length - 1; i++) {
                var part = this._parts[i];
                if (parent.hasOwnProperty(part) && (typeof parent[part] === 'object' || typeof parent[part] === 'function')) {
                    parent = parent[part];
                } else if (ensure) {
                    parent = parent[part] = {};
                } else {
                    return doFunc(null, part);
                }
            }
            return doFunc(parent, this._parts[this._parts.length - 1]);
        },
        set: function (obj, val, ensure) {
            return this.withParentAndKeyDo(obj, ensure, function (parent, key) {
                return parent ? parent[key] = val : undefined;
            });
        },
        defineProperty: function (obj, propertySpec, ensure) {
            return this.withParentAndKeyDo(obj, ensure, function (parent, key) {
                return parent ? Object.defineProperty(parent, key, propertySpec) : undefined;
            });
        },
        get: function (obj, n) {
            var parts = n ? this._parts.slice(0, n) : this._parts;
            return parts.reduce(function (current, pathPart) {
                return current ? current[pathPart] : current;
            }, obj);
        },
        concat: function (p, splitter) {
            return Path(this.parts().concat(Path(p, splitter).parts()));
        },
        toString: function () {
            return this.normalizePath();
        },
        serializeExpr: function () {
            return 'Path(' + Objects.inspect(this.parts()) + ')';
        },
        watch: function (options) {
            if (!options || this.isRoot())
                return;
            var target = options.target, parent = this.get(target, -1), propName = this.parts().slice(-1)[0], newPropName = 'propertyWatcher$' + propName, watcherIsInstalled = parent && parent.hasOwnProperty(newPropName), uninstall = options.uninstall, haltWhenChanged = options.haltWhenChanged, showStack = options.showStack, getter = parent.__lookupGetter__(propName), setter = parent.__lookupSetter__(propName);
            if (!target || !propName || !parent)
                return;
            if (uninstall) {
                if (!watcherIsInstalled)
                    return;
                delete parent[propName];
                parent[propName] = parent[newPropName];
                delete parent[newPropName];
                var msg = 'Watcher for ' + parent + '.' + propName + ' uninstalled';
                show(msg);
                return;
            }
            if (watcherIsInstalled) {
                var msg = 'Watcher for ' + parent + '.' + propName + ' already installed';
                show(msg);
                return;
            }
            if (getter || setter) {
                var msg = parent + '["' + propName + '"] is a getter/setter, watching not support';
                console.log(msg);
                if (typeof show === 'undefined')
                    show(msg);
                return;
            }
            parent[newPropName] = parent[propName];
            parent.__defineSetter__(propName, function (v) {
                var oldValue = parent[newPropName];
                if (options.onSet)
                    options.onSet(v, oldValue);
                var msg = parent + '.' + propName + ' changed: ' + oldValue + ' -> ' + v;
                if (showStack)
                    msg += '\n' + (typeof lively !== 'undefined' ? lively.printStack() : console.trace());
                if (options.verbose) {
                    console.log(msg);
                    if (typeof show !== 'undefined')
                        show(msg);
                }
                if (haltWhenChanged)
                    debugger;
                return parent[newPropName] = v;
            });
            parent.__defineGetter__(propName, function () {
                if (options.onGet)
                    options.onGet(parent[newPropName]);
                return parent[newPropName];
            });
            var msg = 'Watcher for ' + parent + '.' + propName + ' installed';
            console.log(msg);
            if (typeof show !== 'undefined')
                show(msg);
        },
        debugFunctionWrapper: function (options) {
            var target = options.target, parent = this.get(target, -1), funcName = this.parts().slice(-1)[0], uninstall = options.uninstall, haltWhenChanged = options.haltWhenChanged === undefined ? true : options.haltWhenChanged, showStack = options.showStack, func = parent && funcName && parent[funcName], debuggerInstalled = func && func.isDebugFunctionWrapper;
            if (!target || !funcName || !func || !parent)
                return;
            if (uninstall) {
                if (!debuggerInstalled)
                    return;
                parent[funcName] = parent[funcName].debugTargetFunction;
                var msg = 'Uninstalled debugFunctionWrapper for ' + parent + '.' + funcName;
                console.log(msg);
                if (typeof show !== 'undefined')
                    show(msg);
                show(msg);
                return;
            }
            if (debuggerInstalled) {
                var msg = 'debugFunctionWrapper for ' + parent + '.' + funcName + ' already installed';
                console.log(msg);
                if (typeof show !== 'undefined')
                    show(msg);
                return;
            }
            var debugFunc = parent[funcName] = func.wrap(function (proceed) {
                var args = Array.from(arguments);
                if (haltWhenChanged)
                    debugger;
                if (showStack)
                    show(lively.printStack());
                if (options.verbose)
                    show(funcName + ' called');
                return args.shift().apply(parent, args);
            });
            debugFunc.isDebugFunctionWrapper = true;
            debugFunc.debugTargetFunction = func;
            var msg = 'debugFunctionWrapper for ' + parent + '.' + funcName + ' installed';
            console.log(msg);
            if (typeof show !== 'undefined')
                show(msg);
        }
    });
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));

;
(function (exports) {
    'use strict';
    var isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
    var Global = typeof window !== 'undefined' ? window : global;
    var classHelper = exports.classHelper = {
        anonymousCounter: 0,
        defaultCategoryName: 'default category',
        initializerTemplate: typeof lively !== 'undefined' && lively.Config && lively.Config.loadRewrittenCode ? function CLASS() {
            classHelper.initializer.apply(this, arguments);
        }.toStringRewritten().replace(/__0/g, 'Global').replace(/__1/g, '__1') : function CLASS() {
            classHelper.initializer.apply(this, arguments);
        }.toString(),
        newInitializer: function (name) {
            var src = classHelper.initializerTemplate.replace(/function\s*(CLASS)?\(\)/, 'function ' + name + '()');
            if (typeof lively !== 'undefined' && lively.Config && lively.Config.loadRewrittenCode) {
                var idx = src.match('.*storeFrameInfo([^)]*, ([0-9]+))')[2];
                src = '__createClosure("core/lively/Base.js", ' + idx + ', Global, ' + src + ');';
            } else
                src += ' ' + name;
            var initializer = eval(src);
            initializer.displayName = name;
            return initializer;
        },
        initializer: function initializer() {
            var firstArg = arguments[0];
            if (firstArg && firstArg.isInstanceRestorer) {
            } else {
                this.initialize.apply(this, arguments);
            }
        },
        isValidIdentifier: function () {
            var tester = /^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc][$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc0-9\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19b0-\u19c0\u19c8\u19c9\u19d0-\u19d9\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1dc0-\u1de6\u1dfc-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f]*$/;
            return function (string) {
                return tester.test(string);
            };
        }(),
        isClass: function (object) {
            if (object === Object || object === Array || object === Function || object === String || object === Boolean || object === Date || object === RegExp || object === Number) {
                return true;
            }
            return object instanceof Function && object.superclass !== undefined;
        },
        className: function (cl) {
            if (cl === Object)
                return 'Object';
            if (cl === Array)
                return 'Array';
            if (cl === Function)
                return 'Function';
            if (cl === String)
                return 'String';
            if (cl === Boolean)
                return 'Boolean';
            if (cl === Date)
                return 'Date';
            if (cl === RegExp)
                return 'RegExp';
            if (cl === Number)
                return 'Number';
            return cl.type;
        },
        forName: function forName(name) {
            var ns = classHelper.namespaceFor(name), shortName = classHelper.unqualifiedNameFor(name);
            return ns[shortName];
        },
        deleteObjectNamed: function (name) {
            var ns = classHelper.namespaceFor(name), shortName = classHelper.unqualifiedNameFor(name);
            delete ns[shortName];
        },
        unqualifiedNameFor: function (name) {
            var lastDot = name.lastIndexOf('.'), unqualifiedName = name.substring(lastDot + 1);
            if (!classHelper.isValidIdentifier(unqualifiedName))
                throw new Error('not a name ' + unqualifiedName);
            return unqualifiedName;
        },
        namespaceFor: function (className) {
            var lastDot = className ? className.lastIndexOf('.') : -1;
            if (lastDot < 0)
                return Global;
            var nsName = className.slice(0, lastDot);
            if (typeof lively !== 'undefined' && lively.module)
                return lively.module(nsName);
            var path = exports.Path(nsName), ns = path.get(Global);
            return ns || path.set(Global, {}, true);
        },
        withAllClassNames: function (scope, callback) {
            for (var name in scope) {
                try {
                    if (classHelper.isClass(scope[name]))
                        callback(name);
                } catch (er) {
                }
            }
            callback('Object');
            callback('Global');
        },
        getConstructor: function (object) {
            var c = object.constructor;
            return c && c.getOriginal ? c.getOriginal() : c;
        },
        getPrototype: function (object) {
            return this.getConstructor(object).prototype;
        },
        applyPrototypeMethod: function (methodName, target, args) {
            var method = this.getPrototype(target);
            if (!method)
                throw new Error('method ' + methodName + ' not found');
            return method.apply(this, args);
        },
        getSuperConstructor: function (object) {
            return this.getConstructor(object).superclass;
        },
        getSuperPrototype: function (object) {
            var sup = this.getSuperConstructor(object);
            return sup && sup.prototype;
        },
        addPins: function (cls, spec) {
            if (Global.Relay) {
                classHelper.addMixin(cls, Relay.newDelegationMixin(spec).prototype);
                return;
            }
            if (!Object.isArray(spec))
                throw new Error('Cannot deal with non-Array spec in addPins');
            function unstripName(name) {
                return name.replace(/[\+|\-]?(.*)/, '$1');
            }
            ;
            function needsSetter(name) {
                return !exports.string.startsWith(name, '-');
            }
            ;
            function needsGetter(name) {
                return !exports.string.startsWith(name, '+');
            }
            ;
            var mixinSpec = {};
            spec.forEach(function (specString) {
                var name = unstripName(specString);
                if (needsSetter(specString))
                    mixinSpec['set' + name] = function (value) {
                        return this['_' + name] = value;
                    };
                if (needsGetter(specString))
                    mixinSpec['get' + name] = function () {
                        return this['_' + name];
                    };
            });
            classHelper.addMixin(cls, mixinSpec);
        },
        addMixin: function (cls, source) {
            var spec = {};
            for (var prop in source) {
                var value = source[prop];
                switch (prop) {
                case 'constructor':
                case 'initialize':
                case 'deserialize':
                case 'copyFrom':
                case 'toString':
                case 'definition':
                case 'description':
                    break;
                default:
                    if (cls.prototype[prop] === undefined)
                        spec[prop] = value;
                }
            }
            cls.addMethods(spec);
        }
    };
    exports.klass = exports.class = {
        create: function () {
            var args = exports.arr.from(arguments), superclass = args.shift(), className, targetScope = Global, shortName = null;
            if (!superclass || typeof superclass === 'string') {
                className = superclass;
                superclass = Object;
            } else
                className = args.shift();
            if (className) {
                targetScope = classHelper.namespaceFor(className);
                shortName = classHelper.unqualifiedNameFor(className);
            } else {
                shortName = 'anonymous_' + classHelper.anonymousCounter++;
                className = shortName;
            }
            var klass;
            if (className && targetScope[shortName] && targetScope[shortName].superclass === superclass) {
                klass = targetScope[shortName];
            } else {
                klass = classHelper.newInitializer(shortName);
                klass.superclass = superclass;
                var protoclass = function () {
                };
                protoclass.prototype = superclass.prototype;
                klass.prototype = new protoclass();
                klass.prototype.constructor = klass;
                klass.type = className;
                klass.displayName = className;
                if (className)
                    targetScope[shortName] = klass;
                if (typeof lively !== 'undefined' && lively.Module && lively.Module.current)
                    klass.sourceModule = lively.Module.current();
                klass.toString = function () {
                    var initCategory = exports.arr.detect(Object.keys(klass.categories || {}), function (category) {
                        return klass.categories[category].indexOf('initialize') > -1;
                    }) || 'default category';
                    return exports.string.format('lively.lang.class.create(%s, "%s",\n"%s", {\n  initialize: %s\n}/*...*/)', klass.superclass.type || klass.superclass.name, klass.type, initCategory, klass.prototype.initialize);
                };
            }
            ;
            exports.klass.addMethods.apply(Global, [klass].concat(args));
            if (!klass.prototype.initialize)
                klass.prototype.initialize = function () {
                };
            return klass;
        },
        addMethods: function () {
            var klass = arguments[0], args = arguments, category = classHelper.defaultCategoryName, traits = [];
            for (var i = 1; i < args.length; i++) {
                if (typeof args[i] === 'string') {
                    category = args[i];
                } else if (Global.RealTrait && args[i] instanceof RealTrait) {
                    traits.push(args[i]);
                } else {
                    exports.klass.addCategorizedMethods(klass, category, args[i] instanceof Function ? args[i]() : args[i]);
                }
            }
            for (i = 0; i < traits.length; i++)
                traits[i].applyTo(klass);
            return klass;
        },
        addCategorizedMethods: function (klass, categoryName, source) {
            if (!klass.categories)
                klass.categories = {};
            if (!klass.categories[categoryName])
                klass.categories[categoryName] = [];
            var currentCategoryNames = klass.categories[categoryName];
            if (!source)
                throw dbgOn(new Error('no source in addCategorizedMethods!'));
            var ancestor = klass.superclass && klass.superclass.prototype;
            var className = klass.type || 'Anonymous';
            for (var property in source) {
                if (property === 'constructor')
                    continue;
                var getter = source.__lookupGetter__(property);
                if (getter)
                    klass.prototype.__defineGetter__(property, getter);
                var setter = source.__lookupSetter__(property);
                if (setter)
                    klass.prototype.__defineSetter__(property, setter);
                if (getter || setter)
                    continue;
                currentCategoryNames.push(property);
                var value = source[property];
                var hasSuperCall = ancestor && typeof value === 'function' && exports.fun.argumentNames(value)[0] == '$super';
                if (hasSuperCall) {
                    (function () {
                        var method = value;
                        var advice = function (m) {
                            var cs = function callSuper() {
                                var method = ancestor[m];
                                if (!method) {
                                    throw new Error(exports.string.format('Trying to call super of' + '%s>>%s but super method non existing in %s', className, m, ancestor.constructor.type));
                                }
                                return method.apply(this, arguments);
                            };
                            cs.varMapping = {
                                ancestor: ancestor,
                                m: m
                            };
                            cs.isSuperCall = true;
                            return cs;
                        }(property);
                        advice.methodName = '$super:' + (klass.superclass ? klass.superclass.type + '>>' : '') + property;
                        value = exports.obj.extend(exports.fun.wrap(advice, method), {
                            valueOf: function () {
                                return method;
                            },
                            toString: function () {
                                return method.toString();
                            },
                            originalFunction: method,
                            methodName: advice.methodName,
                            isSuperWrapper: true
                        });
                        method.varMapping = { $super: advice };
                    }());
                }
                klass.prototype[property] = value;
                if (property === 'formals') {
                    classHelper.addPins(klass, value);
                } else if (typeof value === 'function') {
                    value.displayName = className + '$' + property;
                    if (typeof lively !== 'undefined' && lively.Module && lively.Module.current)
                        value.sourceModule = lively.Module.current();
                    for (; value; value = value.originalFunction) {
                        value.declaredClass = klass.prototype.constructor.type;
                        value.methodName = property;
                    }
                }
            }
            return klass;
        },
        addProperties: function (klass, spec, recordType) {
            classHelper.addMixin(klass, recordType.prototype.create(spec).prototype);
        },
        isSubclassOf: function (klassA, klassB) {
            return exports.klass.superclasses(klassA).indexOf(klassB) > -1;
        },
        superclasses: function (klass) {
            if (!klass.superclass)
                return [];
            if (klass.superclass === Object)
                return [Object];
            return exports.klass.superclasses(klass.superclass).concat([klass.superclass]);
        },
        categoryNameFor: function (klass, propName) {
            for (var categoryName in klass.categories) {
                if (klass.categories[categoryName].indexOf(propName) > -1)
                    return categoryName;
            }
            return null;
        },
        remove: function (klass) {
            var ownerNamespace = classHelper.namespaceFor(klass.type), ownName = classHelper.unqualifiedNameFor(klass.type);
            delete ownerNamespace[ownName];
        }
    };
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));

;
(function (exports) {
    'use strict';
    var arrNative = exports.arrNative = {
        sort: function (sortFunc) {
            if (!sortFunc) {
                sortFunc = function (x, y) {
                    if (x < y)
                        return -1;
                    if (x > y)
                        return 1;
                    return 0;
                };
            }
            var len = this.length, sorted = [];
            for (var i = 0; i < this.length; i++) {
                var inserted = false;
                for (var j = 0; j < sorted.length; j++) {
                    if (1 === sortFunc(sorted[j], this[i])) {
                        inserted = true;
                        sorted[j + 1] = sorted[j];
                        sorted[j] = this[i];
                        break;
                    }
                }
                if (!inserted)
                    sorted.push(this[i]);
            }
            return sorted;
        },
        filter: function (iterator, context) {
            var results = [];
            for (var i = 0; i < this.length; i++) {
                if (!this.hasOwnProperty(i))
                    continue;
                var value = this[i];
                if (iterator.call(context, value, i))
                    results.push(value);
            }
            return results;
        },
        forEach: function (iterator, context) {
            for (var i = 0, len = this.length; i < len; i++) {
                iterator.call(context, this[i], i, this);
            }
        },
        some: function (iterator, context) {
            return this.detect(iterator, context) !== undefined;
        },
        every: function (iterator, context) {
            var result = true;
            for (var i = 0, len = this.length; i < len; i++) {
                result = result && !!iterator.call(context, this[i], i);
                if (!result)
                    break;
            }
            return result;
        },
        map: function (iterator, context) {
            var results = [];
            this.forEach(function (value, index) {
                results.push(iterator.call(context, value, index));
            });
            return results;
        },
        reduce: function (iterator, memo, context) {
            var start = 0;
            if (!arguments.hasOwnProperty(1)) {
                start = 1;
                memo = this[0];
            }
            for (var i = start; i < this.length; i++)
                memo = iterator.call(context, memo, this[i], i, this);
            return memo;
        },
        reduceRight: function (iterator, memo, context) {
            var start = this.length - 1;
            if (!arguments.hasOwnProperty(1)) {
                start--;
                memo = this[this.length - 1];
            }
            for (var i = start; i >= 0; i--)
                memo = iterator.call(context, memo, this[i], i, this);
            return memo;
        }
    };
    var arr = exports.arr = {
        range: function (begin, end, step) {
            step = step || 1;
            var result = [];
            for (var i = begin; i <= end; i += step)
                result.push(i);
            return result;
        },
        from: function (iterable) {
            if (!iterable)
                return [];
            if (Array.isArray(iterable))
                return iterable;
            if (iterable.toArray)
                return iterable.toArray();
            var length = iterable.length, results = new Array(length);
            while (length--)
                results[length] = iterable[length];
            return results;
        },
        withN: function (n, obj) {
            var result = new Array(n);
            while (n > 0)
                result[--n] = obj;
            return result;
        },
        genN: function (n, generator) {
            var result = new Array(n);
            while (n > 0)
                result[--n] = generator(n);
            return result;
        },
        filter: function (array, iterator, context) {
            return array.filter(iterator, context);
        },
        detect: function (arr, iterator, context) {
            for (var value, i = 0, len = arr.length; i < len; i++) {
                value = arr[i];
                if (iterator.call(context, value, i))
                    return value;
            }
            return undefined;
        },
        filterByKey: function (arr, key) {
            return arr.filter(function (ea) {
                return !!ea[key];
            });
        },
        grep: function (arr, filter, context) {
            if (typeof filter === 'string')
                filter = new RegExp(filter, 'i');
            return arr.filter(filter.test.bind(filter));
        },
        mask: function (array, mask) {
            return array.filter(function (_, i) {
                return !!mask[i];
            });
        },
        reject: function (array, func, context) {
            function iterator(val, i) {
                return !func.call(context, val, i);
            }
            return array.filter(iterator);
        },
        rejectByKey: function (array, key) {
            return array.filter(function (ea) {
                return !ea[key];
            });
        },
        without: function (array, elem) {
            return array.filter(function (value) {
                return value !== elem;
            });
        },
        withoutAll: function (array, otherArr) {
            return array.filter(function (value) {
                return otherArr.indexOf(value) === -1;
            });
        },
        uniq: function (array, sorted) {
            return array.reduce(function (a, value, index) {
                if (0 === index || (sorted ? a.last() != value : a.indexOf(value) === -1))
                    a.push(value);
                return a;
            }, []);
        },
        uniqBy: function (array, comparator, context) {
            var result = arr.clone(array);
            for (var i = 0; i < result.length; i++) {
                var item = array[i];
                for (var j = i + 1; j < result.length; j++) {
                    if (comparator.call(context, item, result[j])) {
                        arr.removeAt(result, j);
                        j--;
                    }
                }
            }
            return result;
        },
        compact: function (array) {
            return array.filter(function (ea) {
                return !!ea;
            });
        },
        mutableCompact: function (array) {
            var i = 0, j = 0, len = array.length;
            while (i < len) {
                if (array.hasOwnProperty(i))
                    array[j++] = array[i];
                i++;
            }
            while (j++ < len)
                array.pop();
            return array;
        },
        forEach: function (array, iterator, context) {
            return array.forEach(iterator, context);
        },
        zip: function () {
            var args = arr.from(arguments), array = args.shift(), iterator = typeof arr.last(args) === 'function' ? args.pop() : function (x) {
                    return x;
                }, collections = [array].concat(args).map(arr.from);
            return array.map(function (value, index) {
                return iterator(arr.pluck(collections, index), index);
            });
        },
        flatten: function flatten(array, optDepth) {
            if (typeof optDepth === 'number') {
                if (optDepth <= 0)
                    return array;
                optDepth--;
            }
            return array.reduce(function (flattened, value) {
                return flattened.concat(Array.isArray(value) ? flatten(value, optDepth) : [value]);
            }, []);
        },
        flatmap: function (array, it, ctx) {
            var results = [];
            for (var i = 0; i < array.length; i++) {
                results.push.apply(results, it.call(ctx, array[i], i));
            }
            return results;
        },
        interpose: function (array, delim) {
            return array.reduce(function (xs, x) {
                if (xs.length > 0)
                    xs.push(delim);
                xs.push(x);
                return xs;
            }, []);
        },
        delimWith: function (array, delim) {
            return arr.interpose(array, delim);
        },
        map: function (array, iterator, context) {
            return array.map(iterator, context);
        },
        invoke: function (array, method, arg1, arg2, arg3, arg4, arg5, arg6) {
            return array.map(function (ea) {
                return ea[method](arg1, arg2, arg3, arg4, arg5, arg6);
            });
        },
        pluck: function (array, property) {
            return array.map(function (ea) {
                return ea[property];
            });
        },
        reduce: function (array, iterator, memo, context) {
            return array.reduce(iterator, memo, context);
        },
        reduceRight: function (array, iterator, memo, context) {
            return array.reduceRight(iterator, memo, context);
        },
        isArray: Array.isArray,
        include: function (array, object) {
            return array.indexOf(object) !== -1;
        },
        some: function (array, iterator, context) {
            return array.some(iterator, context);
        },
        every: function (array, iterator, context) {
            return array.every(iterator, context);
        },
        equals: function (array, otherArray) {
            var len = array.length;
            if (!otherArray || len !== otherArray.length)
                return false;
            for (var i = 0; i < len; i++) {
                if (array[i] && otherArray[i] && array[i].equals && otherArray[i].equals) {
                    if (!array[i].equals(otherArray[i])) {
                        return false;
                    } else {
                        continue;
                    }
                }
                if (array[i] != otherArray[i])
                    return false;
            }
            return true;
        },
        deepEquals: function (array, otherArray) {
            var len = array.length;
            if (!otherArray || len !== otherArray.length)
                return false;
            for (var i = 0; i < len; i++) {
                if (!exports.obj.equals(array[i], otherArray[i]))
                    return false;
            }
            return true;
        },
        isSorted: function (array, descending) {
            var isSorted = true;
            for (var i = 1; i < array.length; i++) {
                if (!descending && arr[i - 1] > arr[i])
                    return false;
                else if (descending && arr[i - 1] < arr[i])
                    return false;
            }
        },
        sort: function (array, sortFunc) {
            return array.sort(sortFunc);
        },
        sortBy: function (array, iterator, context) {
            return arr.pluck(array.map(function (value, index) {
                return {
                    value: value,
                    criteria: iterator.call(context, value, index)
                };
            }).sort(function (left, right) {
                var a = left.criteria, b = right.criteria;
                return a < b ? -1 : a > b ? 1 : 0;
            }), 'value');
        },
        sortByKey: function (array, key) {
            return arr.sortBy(array, function (ea) {
                return ea[key];
            });
        },
        reverse: function (array) {
            return array.reverse();
        },
        reversed: function (array) {
            return arr.clone(array).reverse();
        },
        reMatches: function (arr, re, stringifier) {
            stringifier = stringifier || String;
            return arr.map(function (ea) {
                return stringifier(ea).match(re);
            });
        },
        first: function (array) {
            return array[0];
        },
        last: function (array) {
            return array[array.length - 1];
        },
        intersect: function (array1, array2) {
            return arr.uniq(array1).filter(function (item) {
                return array2.indexOf(item) > -1;
            });
        },
        union: function (array1, array2) {
            var result = arr.clone(array1);
            for (var i = 0; i < array2.length; i++) {
                var item = array2[i];
                if (result.indexOf(item) === -1)
                    result.push(item);
            }
            return result;
        },
        pushAt: function (array, item, index) {
            array.splice(index, 0, item);
        },
        removeAt: function (array, index) {
            array.splice(index, 1);
        },
        remove: function (array, item) {
            var index = array.indexOf(item);
            if (index >= 0)
                arr.removeAt(array, index);
            return item;
        },
        pushAll: function (array, items) {
            for (var i = 0; i < items.length; i++)
                array.push(items[i]);
            return array;
        },
        pushAllAt: function (array, items, idx) {
            array.splice.apply(array, [
                idx,
                0
            ].concat(items));
        },
        pushIfNotIncluded: function (array, item) {
            if (!arr.include(array, item))
                array.push(item);
        },
        replaceAt: function (array, item, index) {
            array.splice(index, 1, item);
        },
        clear: function (array) {
            array.length = 0;
            return array;
        },
        doAndContinue: function (array, iterator, endFunc, context) {
            endFunc = endFunc || Functions.Null;
            context = context || (typeof window !== 'undefined' ? window : global);
            iterator = iterator || function (next, ea, idx) {
                ea.call(context, next, idx);
            };
            return array.reduceRight(function (nextFunc, ea, idx) {
                return function () {
                    iterator.call(context, nextFunc, ea, idx);
                };
            }, endFunc)();
        },
        nestedDelay: function (array, iterator, waitSecs, endFunc, context, optSynchronChunks) {
            endFunc = endFunc || function () {
            };
            return array.clone().reverse().reduce(function (nextFunc, ea, idx) {
                return function () {
                    iterator.call(context || (typeof window !== 'undefined' ? window : global), ea, idx);
                    if (optSynchronChunks && idx % optSynchronChunks !== 0) {
                        nextFunc();
                    } else {
                        nextFunc.delay(waitSecs);
                    }
                };
            }, endFunc)();
        },
        forEachShowingProgress: function () {
            var args = Array.from(arguments), array = args.shift(), steps = array.length, progressBar, iterator, labelFunc, whenDoneFunc, context, progressBarAdded = false;
            if (args.length === 1) {
                progressBar = args[0].progressBar;
                iterator = args[0].iterator;
                labelFunc = args[0].labelFunction;
                whenDoneFunc = args[0].whenDone;
                context = args[0].context;
            } else {
                progressBar = args[0];
                iterator = args[1];
                labelFunc = args[2];
                whenDoneFunc = args[3];
                context = args[4];
            }
            if (!context)
                context = typeof window !== 'undefined' ? window : global;
            if (!labelFunc)
                labelFunc = function (x) {
                    return x;
                };
            if (!progressBar) {
                progressBarAdded = true;
                var Global = typeof window !== 'undefined' ? window : global;
                var world = Global.lively && lively.morphic && lively.morphic.World.current();
                progressBar = world ? world.addProgressBar() : {
                    setValue: function (val) {
                    },
                    setLabel: function () {
                    },
                    remove: function () {
                    }
                };
            }
            progressBar.setValue(0);
            array.reduceRight(function (nextFunc, item, idx) {
                return function () {
                    try {
                        progressBar.setValue(idx / steps);
                        if (labelFunc)
                            progressBar.setLabel(labelFunc.call(context, item, idx));
                        iterator.call(context, item, idx);
                    } catch (e) {
                        console.error('Error in forEachShowingProgress at %s (%s)\n%s\n%s', idx, item, e, e.stack);
                    }
                    nextFunc.delay(0);
                };
            }, function () {
                progressBar.setValue(1);
                if (progressBarAdded)
                    (function () {
                        progressBar.remove();
                    }.delay(0));
                if (whenDoneFunc)
                    whenDoneFunc.call(context);
            })();
            return array;
        },
        swap: function (array, index1, index2) {
            if (index1 < 0)
                index1 = array.length + index1;
            if (index2 < 0)
                index2 = array.length + index2;
            var temp = array[index1];
            array[index1] = array[index2];
            array[index2] = temp;
            return array;
        },
        rotate: function (array, times) {
            times = times || 1;
            return array.slice(times).concat(array.slice(0, times));
        },
        groupBy: function (array, iterator, context) {
            return Group.fromArray(array, iterator, context);
        },
        groupByKey: function (array, key) {
            return arr.groupBy(array, function (ea) {
                return ea[key];
            });
        },
        partition: function (array, iterator, context) {
            iterator = iterator || function (x) {
                return x;
            };
            var trues = [], falses = [];
            array.forEach(function (value, index) {
                (iterator.call(context, value, index) ? trues : falses).push(value);
            });
            return [
                trues,
                falses
            ];
        },
        batchify: function (array, constrainedFunc, context) {
            return findBatches([], array);
            function extractBatch(batch, sizes) {
                if (!sizes.length)
                    return [
                        batch,
                        []
                    ];
                var first = sizes[0], rest = sizes.slice(1);
                var candidate = batch.concat([first]);
                if (constrainedFunc.call(context, candidate))
                    return extractBatch(candidate, rest);
                var batchAndSizes = extractBatch(batch, rest);
                return [
                    batchAndSizes[0],
                    [first].concat(batchAndSizes[1])
                ];
            }
            function findBatches(batches, sizes) {
                if (!sizes.length)
                    return batches;
                var extracted = extractBatch([], sizes);
                if (!extracted[0].length)
                    throw new Error('Batchify constrained does not ensure consumption ' + 'of at least one item per batch!');
                return findBatches(batches.concat([extracted[0]]), extracted[1]);
            }
        },
        toTuples: function (array, tupleLength) {
            tupleLength = tupleLength || 1;
            return arr.range(0, Math.ceil(array.length / tupleLength) - 1).map(function (n) {
                return array.slice(n * tupleLength, n * tupleLength + tupleLength);
            }, array);
        },
        permutations: function () {
            function computePermutations(restArray, values) {
                return !restArray.length ? [values] : arr.flatmap(restArray, function (ea, i) {
                    return computePermutations(restArray.slice(0, i).concat(restArray.slice(i + 1)), values.concat([ea]));
                });
            }
            return function (array) {
                return computePermutations(array, []);
            };
        }(),
        combinationsPick: function (listOfListsOfValues, pickIndices) {
            var values = listOfListsOfValues.map(function (subspace, i) {
                    return subspace[pickIndices[i]];
                }), nextState = pickIndices.slice();
            for (var i = listOfListsOfValues.length; i--; i >= 0) {
                var subspace = listOfListsOfValues[i], nextIndex = nextState[i] + 1;
                if (subspace[nextIndex]) {
                    nextState[i] = nextIndex;
                    break;
                } else if (i === 0) {
                    nextState = undefined;
                    break;
                } else {
                    nextState[i] = 0;
                }
            }
            return [
                values,
                nextState
            ];
        },
        combinations: function (listOfListsOfValues) {
            var size = listOfListsOfValues.reduce(function (prod, space) {
                    return prod * space.length;
                }, 1), searchState = listOfListsOfValues.map(function (_) {
                    return 0;
                }), results = new Array(size);
            for (var i = 0; i < size; i++) {
                var result = arr.combinationsPick(listOfListsOfValues, searchState);
                results[i] = result[0];
                searchState = result[1];
            }
            return results;
        },
        take: function (arr, n) {
            return arr.slice(0, n);
        },
        drop: function (arr, n) {
            return arr.slice(n);
        },
        takeWhile: function (arr, fun, context) {
            var i = 0;
            ;
            for (; i < arr.length; i++)
                if (!fun.call(context, arr[i], i))
                    break;
            return arr.slice(0, i);
        },
        dropWhile: function (arr, fun, context) {
            var i = 0;
            ;
            for (; i < arr.length; i++)
                if (!fun.call(context, arr[i], i))
                    break;
            return arr.slice(i);
        },
        shuffle: function (array) {
            var unusedIndexes = arr.range(0, array.length - 1);
            return array.reduce(function (shuffled, ea, i) {
                var shuffledIndex = unusedIndexes.splice(Math.round(Math.random() * (unusedIndexes.length - 1)), 1);
                shuffled[shuffledIndex] = ea;
                return shuffled;
            }, Array(array.length));
        },
        max: function (array, iterator, context) {
            iterator = iterator || function (x) {
                return x;
            };
            var result;
            array.reduce(function (max, ea, i) {
                var val = iterator.call(context, ea, i);
                if (typeof val !== 'number' || val <= max)
                    return max;
                result = ea;
                return val;
            }, -Infinity);
            return result;
        },
        min: function (array, iterator, context) {
            iterator = iterator || function (x) {
                return x;
            };
            return arr.max(array, function (ea, i) {
                return -iterator.call(context, ea, i);
            });
        },
        sum: function (array) {
            var sum = 0;
            for (var i = 0; i < array.length; i++)
                sum += array[i];
            return sum;
        },
        count: function (array, item) {
            return array.reduce(function (count, ea) {
                return ea === item ? count + 1 : count;
            }, 0);
        },
        size: function (array) {
            return array.length;
        },
        histogram: function (data, binSpec) {
            if (typeof binSpec === 'undefined' || typeof binSpec === 'number') {
                var binNumber = binSpec || function sturge() {
                    return Math.ceil(Math.log(data.length) / Math.log(2) + 1);
                }(data);
                var binSize = Math.ceil(Math.round(data.length / binNumber));
                return arr.range(0, binNumber - 1).map(function (i) {
                    return data.slice(i * binSize, (i + 1) * binSize);
                });
            } else if (binSpec instanceof Array) {
                var thresholds = binSpec;
                return data.reduce(function (bins, d) {
                    if (d < thresholds[1]) {
                        bins[0].push(d);
                        return bins;
                    }
                    for (var i = 1; i < thresholds.length; i++) {
                        if (d >= thresholds[i] && (!thresholds[i + 1] || d <= thresholds[i + 1])) {
                            bins[i].push(d);
                            return bins;
                        }
                    }
                    throw new Error(Strings.format('Histogram creation: Cannot group data %s into thresholds %o', d, thresholds));
                }, arr.range(1, thresholds.length).map(function () {
                    return [];
                }));
            }
        },
        clone: function (array) {
            return [].concat(array);
        },
        toArray: function (array) {
            return arr.from(array);
        },
        each: function (arr, iterator, context) {
            return arr.forEach(iterator, context);
        },
        all: function (arr, iterator, context) {
            return arr.every(iterator, context);
        },
        any: function (arr, iterator, context) {
            return arr.some(iterator, context);
        },
        collect: function (arr, iterator, context) {
            return arr.map(iterator, context);
        },
        findAll: function (arr, iterator, context) {
            return arr.filter(iterator, context);
        },
        inject: function (array, memo, iterator, context) {
            if (context)
                iterator = iterator.bind(context);
            return array.reduce(iterator, memo);
        },
        mapAsyncSeries: function (array, iterator, callback) {
            var result = [], callbackTriggered = false;
            return array.reduceRight(function (nextFunc, ea, idx) {
                if (callbackTriggered)
                    return;
                return function (err, eaResult) {
                    if (err)
                        return maybeDone(err);
                    if (idx > 0)
                        result.push(eaResult);
                    try {
                        iterator(ea, idx, exports.fun.once(nextFunc));
                    } catch (e) {
                        maybeDone(e);
                    }
                };
            }, function (err, eaResult) {
                result.push(eaResult);
                maybeDone(err, true);
            })();
            function maybeDone(err, finalCall) {
                if (callbackTriggered || !err && !finalCall)
                    return;
                callbackTriggered = true;
                try {
                    callback(err, result);
                } catch (e) {
                    console.error('Error in mapAsyncSeries - callback invocation error:\n' + (e.stack || e));
                }
            }
        },
        mapAsync: function (array, options, iterator, callback) {
            if (typeof options === 'function') {
                callback = iterator;
                iterator = options;
                options = null;
            }
            options = options || {};
            if (!array.length)
                return callback && callback(null, []);
            if (!options.parallel)
                options.parallel = Infinity;
            var results = [], completed = [], callbackTriggered = false, lastIteratorIndex = 0, nActive = 0;
            var iterators = array.map(function (item, i) {
                return function () {
                    nActive++;
                    try {
                        iterator(item, i, exports.fun.once(function (err, result) {
                            results[i] = err || result;
                            maybeDone(i, err);
                        }));
                    } catch (e) {
                        maybeDone(i, e);
                    }
                };
            });
            return activate();
            function activate() {
                while (nActive < options.parallel && lastIteratorIndex < array.length)
                    iterators[lastIteratorIndex++]();
            }
            function maybeDone(idx, err) {
                if (completed.indexOf(idx) > -1)
                    return;
                completed.push(idx);
                nActive--;
                if (callbackTriggered)
                    return;
                if (!err && completed.length < array.length) {
                    activate();
                    return;
                }
                callbackTriggered = true;
                try {
                    callback && callback(err, results);
                } catch (e) {
                    console.error('Error in mapAsync - main callback invocation error:\n' + (e.stack || e));
                }
            }
        }
    };
    var Group = exports.Group = function Group() {
    };
    Group.by = exports.arr.groupBy;
    Group.fromArray = function (array, hashFunc, context) {
        var grouping = new Group();
        for (var i = 0, len = array.length; i < len; i++) {
            var hash = hashFunc.call(context, array[i], i);
            if (!grouping[hash])
                grouping[hash] = [];
            grouping[hash].push(array[i]);
        }
        return grouping;
    };
    Group.prototype.toArray = function () {
        return this.reduceGroups(function (all, _, group) {
            return all.concat([group]);
        }, []);
    };
    Group.prototype.forEach = function (iterator, context) {
        var groups = this;
        Object.keys(groups).forEach(function (groupName) {
            groups[groupName].forEach(iterator.bind(context, groupName));
        });
        return groups;
    };
    Group.prototype.forEachGroup = function (iterator, context) {
        var groups = this;
        Object.keys(groups).forEach(function (groupName) {
            iterator.call(context, groupName, groups[groupName]);
        });
        return groups;
    };
    Group.prototype.map = function (iterator, context) {
        var result = new Group();
        this.forEachGroup(function (groupName, group) {
            result[groupName] = group.map(iterator.bind(context, groupName));
        });
        return result;
    };
    Group.prototype.mapGroups = function (iterator, context) {
        var result = new Group();
        this.forEachGroup(function (groupName, group) {
            result[groupName] = iterator.call(context, groupName, group);
        });
        return result;
    };
    Group.prototype.keys = function () {
        return Object.keys(this);
    };
    Group.prototype.reduceGroups = function (iterator, carryOver, context) {
        this.forEachGroup(function (groupName, group) {
            carryOver = iterator.call(context, carryOver, groupName, group);
        });
        return carryOver;
    };
    Group.prototype.count = function () {
        return this.reduceGroups(function (groupCount, groupName, group) {
            groupCount[groupName] = group.length;
            return groupCount;
        }, {});
    };
    var grid = exports.grid = {
        get: function (grid, nRow, nCol) {
            var row = grid[nRow];
            return row ? row[nCol] : undefined;
        },
        set: function (grid, nRow, nCol, obj) {
            var row = grid[nRow];
            if (row)
                row[nCol] = obj;
            return obj;
        },
        getRow: function (grid, nRow) {
            return grid[nRow];
        },
        setRow: function (grid, nRow, newRow) {
            return grid[nRow] = newRow;
        },
        getCol: function (grid, nCol) {
            return grid.reduce(function (col, row) {
                col.push(row[nCol]);
                return col;
            }, []);
        },
        setCol: function (grid, nCol, newCol) {
            return grid.map(function (row, i) {
                return row[nCol] ? row[nCol] = newCol[i] : undefined;
            });
        },
        create: function (rows, columns, initialObj) {
            var result = new Array(rows);
            while (rows > 0)
                result[--rows] = arr.withN(columns, initialObj);
            return result;
        },
        mapCreate: function (rows, cols, func, context) {
            var result = new Array(rows);
            for (var i = 0; i < rows; i++) {
                result[i] = new Array(cols);
                for (var j = 0; j < cols; j++) {
                    result[i][j] = func.call(context || this, i, j);
                }
            }
            return result;
        },
        forEach: function (grid, func, context) {
            grid.forEach(function (row, i) {
                row.forEach(function (val, j) {
                    func.call(context || this, val, i, j);
                });
            });
        },
        map: function (grid, func, context) {
            var result = new Array(grid.length);
            grid.forEach(function (row, i) {
                result[i] = new Array(row.length);
                row.forEach(function (val, j) {
                    result[i][j] = func.call(context || this, val, i, j);
                });
            });
            return result;
        },
        toObjects: function (grid) {
            var props = grid[0], objects = new Array(grid.length - 1);
            for (var i = 1; i < grid.length; i++) {
                var obj = objects[i - 1] = {};
                for (var j = 0; j < props.length; j++)
                    obj[props[j]] = grid[i][j];
            }
            return objects;
        },
        tableFromObjects: function (objects, valueForUndefined) {
            if (!Array.isArray(objects))
                objects = [objects];
            var table = [[]], columns = table[0], rows = objects.reduce(function (rows, ea) {
                    return rows.concat([Object.keys(ea).reduce(function (row, col) {
                            var colIdx = columns.indexOf(col);
                            if (colIdx === -1) {
                                colIdx = columns.length;
                                columns.push(col);
                            }
                            row[colIdx] = ea[col];
                            return row;
                        }, [])]);
                }, []);
            valueForUndefined = arguments.length === 1 ? null : valueForUndefined;
            rows.forEach(function (row) {
                for (var i = 0; i < columns.length; i++)
                    if (!row[i])
                        row[i] = valueForUndefined;
            });
            return table.concat(rows);
        },
        benchmark: function () {
            var results = [], t;
            var g = grid.create(1000, 200, 1), addNum = 0;
            t = lively.lang.fun.timeToRunN(function () {
                grid.forEach(g, function (n) {
                    addNum += n;
                });
            }, 10);
            results.push(exports.string.format('grid.forEach: %ims', t));
            var mapResult;
            t = Functions.timeToRunN(function () {
                mapResult = grid.map(grid, function (n, i, j) {
                    return i + j + Math.round(Math.random() * 100);
                });
            }, 10);
            results.push(exports.string.format('grid.map: %ims', t));
            var mapResult2 = grid.create(1000, 2000);
            t = Functions.timeToRunN(function () {
                mapResult2 = new Array(1000);
                for (var i = 0; i < 1000; i++)
                    mapResult2[i] = new Array(2000);
                grid.forEach(g, function (n, i, j) {
                    mapResult2[i][j] = i + j + Math.round(Math.random() * 100);
                });
            }, 10);
            results.push('grid.map with forEach: ' + t + 'ms');
            results.push('--= 2012-09-22 =--\n' + 'grid.forEach: 14.9ms\n' + 'grid.map: 19.8ms\n' + 'grid.map with forEach: 38.7ms\n');
            return results.join('\n');
        }
    };
    var interval = exports.interval = {
        isInterval: function (object) {
            return Array.isArray(object) && object.length >= 2 && object[0] <= object[1];
        },
        sort: function (intervals) {
            return intervals.sort(interval.compare);
        },
        compare: function (a, b) {
            if (a[0] < b[0]) {
                if (a[1] < b[0])
                    return -3;
                if (a[1] === b[0])
                    return -2;
                return -1;
            }
            if (a[0] === b[0]) {
                if (a[1] === b[1])
                    return 0;
                return a[1] < b[1] ? -1 : 1;
            }
            return -1 * interval.compare(b, a);
        },
        coalesce: function (interval1, interval2, optMergeCallback) {
            var cmpResult = this.compare(interval1, interval2);
            switch (cmpResult) {
            case -3:
            case 3:
                return null;
            case 0:
                optMergeCallback && optMergeCallback(interval1, interval2, interval1);
                return interval1;
            case 2:
            case 1:
                var temp = interval1;
                interval1 = interval2;
                interval2 = temp;
            case -2:
            case -1:
                var coalesced = [
                    interval1[0],
                    Math.max(interval1[1], interval2[1])
                ];
                optMergeCallback && optMergeCallback(interval1, interval2, coalesced);
                return coalesced;
            default:
                throw new Error('Interval compare failed');
            }
        },
        coalesceOverlapping: function (intervals, mergeFunc) {
            var condensed = [], len = intervals.length;
            while (len > 0) {
                var ival = intervals.shift();
                len--;
                for (var i = 0; i < len; i++) {
                    var otherInterval = intervals[i], coalesced = interval.coalesce(ival, otherInterval, mergeFunc);
                    if (coalesced) {
                        ival = coalesced;
                        intervals.splice(i, 1);
                        len--;
                        i--;
                    }
                }
                condensed.push(ival);
            }
            return this.sort(condensed);
        },
        mergeOverlapping: function (intervalsA, intervalsB, mergeFunc) {
            var result = [];
            while (intervalsA.length > 0) {
                var intervalA = intervalsA.shift();
                var toMerge = intervalsB.map(function (intervalB) {
                    var cmp = interval.compare(intervalA, intervalB);
                    return cmp === -1 || cmp === 0 || cmp === 1;
                });
                result.push(mergeFunc(intervalA, toMerge[0]));
                result.push(intervalA);
            }
            return result;
        },
        intervalsInRangeDo: function (start, end, intervals, iterator, mergeFunc, context) {
            context = context || (typeof window !== 'undefined' ? window : global);
            intervals = this.sort(intervals);
            var free = [], nextInterval, collected = [];
            while (nextInterval = intervals.shift()) {
                if (nextInterval[1] < start)
                    continue;
                if (nextInterval[0] < start) {
                    nextInterval = Array.prototype.slice.call(nextInterval);
                    nextInterval[0] = start;
                }
                ;
                var nextStart = end < nextInterval[0] ? end : nextInterval[0];
                if (start < nextStart) {
                    collected.push(iterator.call(context, [
                        start,
                        nextStart
                    ], true));
                }
                ;
                if (end < nextInterval[1]) {
                    nextInterval = Array.prototype.slice.call(nextInterval);
                    nextInterval[1] = end;
                }
                if (nextInterval[0] === nextInterval[1]) {
                    var prevInterval;
                    if (mergeFunc && (prevInterval = collected.slice(-1)[0])) {
                        mergeFunc.call(context, prevInterval, nextInterval, prevInterval);
                    }
                } else {
                    collected.push(iterator.call(context, nextInterval, false));
                }
                start = nextInterval[1];
                if (start >= end)
                    break;
            }
            if (start < end)
                collected.push(iterator.call(context, [
                    start,
                    end
                ], true));
            return collected;
        },
        intervalsInbetween: function (start, end, intervals) {
            return interval.intervalsInRangeDo(start, end, interval.coalesceOverlapping(Array.prototype.slice.call(intervals)), function (interval, isNew) {
                return isNew ? interval : null;
            }).filter(function (ea) {
                return !!ea;
            });
        },
        mapToMatchingIndexes: function (intervals, intervalsToFind) {
            var startIntervalIndex = 0, endIntervalIndex, currentInterval;
            return intervalsToFind.map(function (toFind) {
                while (currentInterval = intervals[startIntervalIndex]) {
                    if (currentInterval[0] < toFind[0]) {
                        startIntervalIndex++;
                        continue;
                    }
                    ;
                    break;
                }
                if (currentInterval && currentInterval[0] === toFind[0]) {
                    endIntervalIndex = startIntervalIndex;
                    while (currentInterval = intervals[endIntervalIndex]) {
                        if (currentInterval[1] < toFind[1]) {
                            endIntervalIndex++;
                            continue;
                        }
                        ;
                        break;
                    }
                    if (currentInterval && currentInterval[1] === toFind[1]) {
                        return arr.range(startIntervalIndex, endIntervalIndex);
                    }
                }
                return [];
            });
        },
        benchmark: function () {
            function benchmarkFunc(name, args, n) {
                return Strings.format('%s: %sms', name, Functions.timeToRunN(function () {
                    interval[name].apply(interval, args, 100000);
                }, n));
            }
            return [
                'Friday, 20. July 2012:',
                'coalesceOverlapping: 0.0003ms',
                'intervalsInbetween: 0.002ms',
                'mapToMatchingIndexes: 0.02ms',
                'vs.\n' + new Date() + ':',
                benchmarkFunc('coalesceOverlapping', [[
                        [
                            9,
                            10
                        ],
                        [
                            1,
                            8
                        ],
                        [
                            3,
                            7
                        ],
                        [
                            15,
                            20
                        ],
                        [
                            14,
                            21
                        ]
                    ]], 100000),
                benchmarkFunc('intervalsInbetween', [
                    0,
                    10,
                    [
                        [
                            8,
                            10
                        ],
                        [
                            0,
                            2
                        ],
                        [
                            3,
                            5
                        ]
                    ]
                ], 100000),
                benchmarkFunc('mapToMatchingIndexes', [
                    Array.range(0, 1000).collect(function (n) {
                        return [
                            n,
                            n + 1
                        ];
                    }),
                    [
                        [
                            4,
                            8
                        ],
                        [
                            500,
                            504
                        ],
                        [
                            900,
                            1004
                        ]
                    ]
                ], 1000)
            ].join('\n');
        }
    };
    var arrayProjection = exports.arrayProjection = {
        create: function (array, length, optStartIndex) {
            var startIndex = optStartIndex || 0;
            if (startIndex + length > array.length)
                startIndex -= startIndex + length - array.length;
            return {
                array: array,
                from: startIndex,
                to: startIndex + length
            };
        },
        toArray: function (projection) {
            return projection.array.slice(projection.from, projection.to);
        },
        originalToProjectedIndex: function (projection, index) {
            if (index < projection.from || index >= projection.to)
                return null;
            return index - projection.from;
        },
        projectedToOriginalIndex: function (projection, index) {
            if (index < 0 || index > projection.to - projection.from)
                return null;
            return projection.from + index;
        },
        transformToIncludeIndex: function (projection, index) {
            if (!(index in projection.array))
                return null;
            var delta = 0;
            if (index < projection.from)
                delta = -projection.from + index;
            if (index >= projection.to)
                delta = index - projection.to + 1;
            if (delta === 0)
                return projection;
            return arrayProjection.create(projection.array, projection.to - projection.from, projection.from + delta);
        }
    };
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));

;
(function (exports) {
    'use strict';
    var seq = exports.seq = {
        take: function (gen, n) {
            var it = gen(), vals = [];
            for (var i = 0; i < n; i++) {
                var step = it.next();
                if (step.done)
                    break;
                vals.push(step.value);
            }
            return vals;
        }
    };
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));

;
(function (exports) {
    'use strict';
    var tree = exports.tree = {
        prewalk: function (treeNode, iterator, childGetter) {
            iterator(treeNode);
            (childGetter(treeNode) || []).forEach(function (ea) {
                tree.prewalk(ea, iterator, childGetter);
            });
        },
        postwalk: function (treeNode, iterator, childGetter) {
            (childGetter(treeNode) || []).forEach(function (ea) {
                tree.postwalk(ea, iterator, childGetter);
            });
            iterator(treeNode);
        },
        detect: function (treeNode, testFunc, childGetter) {
            if (testFunc(treeNode))
                return treeNode;
            var found;
            exports.arr.detect(childGetter(treeNode) || [], function (ea) {
                return found = tree.detect(ea, testFunc, childGetter);
            });
            return found;
        },
        filter: function (treeNode, testFunc, childGetter) {
            var result = [];
            if (testFunc(treeNode))
                result.push(treeNode);
            return result.concat(exports.arr.flatten((childGetter(treeNode) || []).map(function (n) {
                return tree.filter(n, testFunc, childGetter);
            })));
        },
        map: function (treeNode, mapFunc, childGetter) {
            var result = [mapFunc(treeNode)];
            return result.concat(exports.arr.flatten((childGetter(treeNode) || []).map(function (n) {
                return tree.map(n, mapFunc, childGetter);
            })));
        },
        mapTree: function (treeNode, mapFunc, childGetter) {
            var mappedNodes = (childGetter(treeNode) || []).map(function (n) {
                return tree.mapTree(n, mapFunc, childGetter);
            });
            return mapFunc(treeNode, mappedNodes);
        }
    };
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));

;
(function (exports) {
    'use strict';
    var fun = exports.fun = {
        get Empty() {
            return function () {
            };
        },
        get K() {
            return function (arg) {
                return arg;
            };
        },
        get Null() {
            return function () {
                return null;
            };
        },
        get False() {
            return function () {
                return false;
            };
        },
        get True() {
            return function () {
                return true;
            };
        },
        get notYetImplemented() {
            return function () {
                throw new Error('Not yet implemented');
            };
        },
        all: function (object) {
            var a = [];
            for (var name in object) {
                if (!object.__lookupGetter__(name) && typeof object[name] === 'function')
                    a.push(name);
            }
            return a;
        },
        own: function (object) {
            var a = [];
            for (var name in object) {
                if (!object.__lookupGetter__(name) && object.hasOwnProperty(name) && typeof object[name] === 'function')
                    a.push(name);
            }
            return a;
        },
        argumentNames: function (f) {
            if (f.superclass)
                return [];
            var src = f.toString(), names = '', arrowMatch = src.match(/(?:\(([^\)]*)\)|([^\(\)-+!]+))\s*=>/);
            if (arrowMatch)
                names = arrowMatch[1] || arrowMatch[2] || '';
            else {
                var headerMatch = src.match(/^[\s\(]*function[^(]*\(([^)]*)\)/);
                if (headerMatch && headerMatch[1])
                    names = headerMatch[1];
            }
            return names.replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '').replace(/\s+/g, '').split(',').map(function (ea) {
                return ea.trim();
            }).filter(function (name) {
                return !!name;
            });
        },
        qualifiedMethodName: function (f) {
            var objString = '';
            if (f.declaredClass) {
                objString += f.declaredClass + '>>';
            } else if (f.declaredObject) {
                objString += f.declaredObject + '.';
            }
            return objString + (f.methodName || f.displayName || f.name || 'anonymous');
        },
        extractBody: function (func) {
            var codeString = String(func).replace(/^function[^\{]+\{\s*/, '').replace(/\}$/, '').trim(), lines = codeString.split(/\n|\r/), indent = undefined;
            for (var i = 0; i < lines.length; i++) {
                var m = lines[i].match(/^(\s+)[^\s]/);
                if (m && (indent === undefined || m[1].length < indent.length))
                    indent = m[1];
            }
            return indent ? codeString.replace(new RegExp('^' + indent, 'gm'), '') : codeString;
        },
        timeToRun: function (func) {
            var startTime = Date.now();
            func();
            return Date.now() - startTime;
        },
        timeToRunN: function (func, n) {
            var startTime = Date.now();
            for (var i = 0; i < n; i++)
                func();
            return (Date.now() - startTime) / n;
        },
        delay: function (func, timeout) {
            var args = Array.prototype.slice.call(arguments), __method = args.shift(), timeout = args.shift() * 1000;
            return setTimeout(function delayed() {
                return __method.apply(__method, args);
            }, timeout);
        },
        throttle: function (func, wait) {
            var context, args, timeout, throttling, more, result, whenDone = fun.debounce(wait, function () {
                    more = throttling = false;
                });
            return function () {
                context = this;
                args = arguments;
                var later = function () {
                    timeout = null;
                    if (more)
                        func.apply(context, args);
                    whenDone();
                };
                if (!timeout)
                    timeout = setTimeout(later, wait);
                if (throttling) {
                    more = true;
                } else {
                    result = func.apply(context, args);
                }
                whenDone();
                throttling = true;
                return result;
            };
        },
        debounce: function (wait, func, immediate) {
            var timeout;
            return function () {
                var context = this, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate)
                        func.apply(context, args);
                };
                if (immediate && !timeout)
                    func.apply(context, args);
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        throttleNamed: function (name, wait, func) {
            var store = fun._throttledByName || (fun._throttledByName = {});
            if (store[name])
                return store[name];
            function throttleNamedWrapper() {
                fun.debounceNamed(name, wait, function () {
                    delete store[name];
                })();
                func.apply(this, arguments);
            }
            return store[name] = fun.throttle(throttleNamedWrapper, wait);
        },
        debounceNamed: function (name, wait, func, immediate) {
            var store = fun._debouncedByName || (fun._debouncedByName = {});
            if (store[name])
                return store[name];
            function debounceNamedWrapper() {
                delete store[name];
                func.apply(this, arguments);
            }
            return store[name] = fun.debounce(wait, debounceNamedWrapper, immediate);
        },
        createQueue: function (id, workerFunc) {
            var store = fun._queues || (fun._queues = {});
            var queue = store[id] || (store[id] = {
                _workerActive: false,
                worker: workerFunc,
                tasks: [],
                drain: null,
                push: function (task) {
                    queue.tasks.push(task);
                    queue.activateWorker();
                },
                pushAll: function (tasks) {
                    tasks.forEach(function (ea) {
                        queue.tasks.push(ea);
                    });
                    queue.activateWorker();
                },
                pushNoActivate: function (task) {
                    queue.tasks.push(task);
                },
                handleError: function (err) {
                    err && console.error('Error in queue: ' + err);
                },
                activateWorker: function () {
                    function callback(err) {
                        queue.handleError(err);
                        queue.activateWorker();
                    }
                    var tasks = queue.tasks, active = queue._workerActive;
                    if (tasks.length === 0) {
                        if (active) {
                            queue._workerActive = false;
                            if (typeof queue.drain === 'function')
                                queue.drain();
                        }
                        delete store[id];
                    } else {
                        if (!active)
                            queue._workerActive = true;
                        try {
                            queue.worker(tasks.shift(), callback);
                        } catch (err) {
                            callback(err);
                        }
                    }
                }
            });
            return queue;
        },
        workerWithCallbackQueue: function (id, workerFunc, optTimeout) {
            var store = fun._queueUntilCallbacks || (fun._queueUntilCallbacks = {}), queueCallbacks = store[id], isRunning = !!queueCallbacks;
            if (isRunning)
                return queueCallbacks;
            var callbacksRun = false, canceled = false;
            function cleanup() {
                if (timeoutProc)
                    clearTimeout(timeoutProc);
                callbacksRun = true;
                delete store[id];
            }
            function runCallbacks(args) {
                if (callbacksRun)
                    return;
                cleanup();
                queueCallbacks.callbacks.forEach(function (cb) {
                    try {
                        cb.apply(null, args);
                    } catch (e) {
                        console.error('Error when invoking callbacks in queueUntil [' + id + ']:\n' + String(e.stack || e));
                    }
                });
            }
            if (optTimeout) {
                var timeoutProc = setTimeout(function () {
                    if (callbacksRun)
                        return;
                    runCallbacks([new Error('timeout')]);
                }, optTimeout);
            }
            queueCallbacks = store[id] = {
                callbacks: [],
                cancel: function () {
                    canceled = true;
                    cleanup();
                },
                whenDone: function (cb) {
                    queueCallbacks.callbacks.push(cb);
                    return queueCallbacks;
                }
            };
            setTimeout(function () {
                if (canceled)
                    return;
                try {
                    workerFunc(function () {
                        runCallbacks(arguments);
                    });
                } catch (e) {
                    runCallbacks([e]);
                }
            }, 0);
            return queueCallbacks;
        },
        _composeAsyncDefaultEndCallback: function _composeAsyncDefaultEndCallback(err, arg1) {
            if (err)
                console.error('lively.lang.fun.composeAsync error', err);
        },
        composeAsync: function () {
            var toArray = Array.prototype.slice, functions = toArray.call(arguments), defaultEndCb = fun._composeAsyncDefaultEndCallback, endCallback = defaultEndCb, endSuccess, endFailure, endPromise = new Promise(function (resolve, reject) {
                    endSuccess = resolve;
                    endFailure = reject;
                });
            return functions.reverse().reduce(function (prevFunc, funcOrPromise, i) {
                var nextActivated = false;
                return function () {
                    var args = toArray.call(arguments);
                    if (endCallback === defaultEndCb && i === functions.length - 1) {
                        while (args.length && typeof args[args.length - 1] !== 'function')
                            args.pop();
                        if (typeof args[args.length - 1] === 'function')
                            endCallback = args.pop();
                    }
                    function next() {
                        nextActivated = true;
                        var args = toArray.call(arguments), err = args.shift();
                        if (err) {
                            endCallback(err);
                            endFailure(err);
                        } else
                            prevFunc.apply(null, args);
                    }
                    if (typeof funcOrPromise === 'function') {
                        try {
                            var result = funcOrPromise.apply(this, args.concat([next]));
                            if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                                result.then(function (value) {
                                    return next(null, value);
                                }).catch(function (err) {
                                    return next(err);
                                });
                            }
                        } catch (e) {
                            console.error('composeAsync: ', e.stack || e);
                            if (!nextActivated) {
                                endCallback(e);
                                endFailure(e);
                            }
                        }
                    } else if (funcOrPromise && typeof funcOrPromise.then === 'function' && typeof funcOrPromise.catch === 'function') {
                        funcOrPromise.then(function (value) {
                            next(null, value);
                        }).catch(function (err) {
                            next(err);
                        });
                    } else {
                        var err = new Error('Invalid argument to composeAsync: ' + funcOrPromise);
                        endCallback(err);
                        endFailure(err);
                    }
                    return endPromise;
                };
            }, function () {
                var args = toArray.call(arguments);
                endCallback.apply(null, [null].concat(args));
                endSuccess(args[0]);
            });
        },
        compose: function () {
            var functions = Array.prototype.slice.call(arguments);
            return functions.reverse().reduce(function (prevFunc, func) {
                return function () {
                    return prevFunc(func.apply(this, arguments));
                };
            }, function (x) {
                return x;
            });
        },
        flip: function (f) {
            return function flipped() {
                var args = Array.prototype.slice.call(arguments), flippedArgs = [
                        args[1],
                        args[0]
                    ].concat(args.slice(2));
                return f.apply(null, flippedArgs);
            };
        },
        withNull: function (func) {
            func = func || function () {
            };
            return function () {
                var args = lively.lang.arr.from(arguments);
                func.apply(null, [null].concat(args));
            };
        },
        waitFor: function (timeoutMs, waitTesterFunc, thenDo) {
            var start = Date.now();
            var timeStep = 50;
            if (!thenDo) {
                thenDo = waitTesterFunc;
                waitTesterFunc = timeoutMs;
                timeoutMs = undefined;
            }
            (function test() {
                if (waitTesterFunc())
                    return thenDo();
                if (timeoutMs) {
                    var duration = Date.now() - start, timeLeft = timeoutMs - duration;
                    if (timeLeft <= 0)
                        return thenDo(new Error('timeout'));
                    if (timeLeft < timeStep)
                        timeStep = timeLeft;
                }
                setTimeout(test, timeStep);
            }());
        },
        waitForAll: function (options, funcs, thenDo) {
            if (!thenDo) {
                thenDo = funcs;
                funcs = options;
                options = null;
            }
            options = options || {};
            var results = funcs.map(function () {
                return null;
            });
            if (!funcs.length) {
                thenDo(null, results);
                return;
            }
            var leftFuncs = Array.prototype.slice.call(funcs);
            funcs.forEach(function (f, i) {
                try {
                    f(function () {
                        var args = Array.prototype.slice.call(arguments);
                        var err = args.shift();
                        markAsDone(f, i, err, args);
                    });
                } catch (e) {
                    markAsDone(f, i, e, null);
                }
            });
            if (options.timeout) {
                setTimeout(function () {
                    if (!leftFuncs.length)
                        return;
                    var missing = results.map(function (ea, i) {
                        return ea === null && i;
                    }).filter(function (ea) {
                        return typeof ea === 'number';
                    }).join(', ');
                    var err = new Error('waitForAll timed out, functions at ' + missing + ' not done');
                    markAsDone(null, null, err, null);
                }, options.timeout);
            }
            function markAsDone(f, i, err, result) {
                if (!leftFuncs.length)
                    return;
                var waitForAllErr = null;
                var fidx = leftFuncs.indexOf(f);
                fidx > -1 && leftFuncs.splice(fidx, 1);
                if (err) {
                    leftFuncs.length = 0;
                    waitForAllErr = new Error('in waitForAll at' + (typeof i === 'number' ? ' ' + i : '') + ': \n' + (err.stack || String(err)));
                } else if (result)
                    results[i] = result;
                if (!leftFuncs.length)
                    setTimeout(function () {
                        thenDo(waitForAllErr, results);
                    }, 0);
            }
        },
        curry: function (func, arg1, arg2, argN) {
            if (arguments.length <= 1)
                return arguments[0];
            var args = Array.prototype.slice.call(arguments), func = args.shift();
            function wrappedFunc() {
                return func.apply(this, args.concat(Array.prototype.slice.call(arguments)));
            }
            wrappedFunc.isWrapper = true;
            wrappedFunc.originalFunction = func;
            return wrappedFunc;
        },
        wrap: function (func, wrapper) {
            var __method = func;
            var wrappedFunc = function wrapped() {
                var args = Array.prototype.slice.call(arguments);
                var wrapperArgs = wrapper.isWrapper ? args : [__method.bind(this)].concat(args);
                return wrapper.apply(this, wrapperArgs);
            };
            wrappedFunc.isWrapper = true;
            wrappedFunc.originalFunction = __method;
            return wrappedFunc;
        },
        getOriginal: function (func) {
            while (func.originalFunction)
                func = func.originalFunction;
            return func;
        },
        wrapperChain: function (method) {
            var result = [];
            do {
                result.push(method);
                method = method.originalFunction;
            } while (method);
            return result;
        },
        replaceMethodForOneCall: function (obj, methodName, replacement) {
            replacement.originalFunction = obj[methodName];
            var reinstall = obj.hasOwnProperty(methodName);
            obj[methodName] = function () {
                if (reinstall)
                    obj[methodName] = replacement.originalFunction;
                else
                    delete obj[methodName];
                return replacement.apply(this, arguments);
            };
            return obj;
        },
        once: function (func) {
            if (!func)
                return undefined;
            if (typeof func !== 'function')
                throw new Error('fun.once() expecting a function');
            var invoked = false, result;
            return function () {
                if (invoked)
                    return result;
                invoked = true;
                return result = func.apply(this, arguments);
            };
        },
        either: function () {
            var funcs = Array.prototype.slice.call(arguments), wasCalled = false;
            return funcs.map(function (func) {
                return function () {
                    if (wasCalled)
                        return undefined;
                    wasCalled = true;
                    return func.apply(this, arguments);
                };
            });
        },
        eitherNamed: function (name, func) {
            var funcs = Array.prototype.slice.call(arguments);
            var registry = fun._eitherNameRegistry || (fun._eitherNameRegistry = {});
            var name = funcs.shift();
            var eitherCall = registry[name] || (registry[name] = {
                wasCalled: false,
                callsLeft: 0
            });
            eitherCall.callsLeft++;
            return function () {
                eitherCall.callsLeft--;
                if (eitherCall.callsLeft <= 0)
                    delete registry[name];
                if (eitherCall.wasCalled)
                    return undefined;
                eitherCall.wasCalled = true;
                return func.apply(this, arguments);
            };
        },
        evalJS: function (src) {
            return eval(src);
        },
        fromString: function (funcOrString) {
            return fun.evalJS('(' + funcOrString.toString() + ');');
        },
        asScript: function (func, optVarMapping) {
            return Closure.fromFunction(func, optVarMapping).recreateFunc();
        },
        asScriptOf: function (f, obj, optName, optMapping) {
            var name = optName || f.name;
            if (!name) {
                throw Error('Function that wants to be a script needs a name: ' + this);
            }
            var proto = Object.getPrototypeOf(obj), mapping = { 'this': obj };
            if (optMapping)
                mapping = exports.obj.merge([
                    mapping,
                    optMapping
                ]);
            if (proto && proto[name]) {
                var superFunc = function () {
                    try {
                        return Object.getPrototypeOf(obj)[name].apply(obj, arguments);
                    } catch (e) {
                        if (typeof $world !== undefined)
                            $world.logError(e, 'Error in $super call');
                        else
                            alert('Error in $super call: ' + e + '\n' + e.stack);
                        return null;
                    }
                };
                mapping['$super'] = Closure.fromFunction(superFunc, {
                    'obj': obj,
                    name: name
                }).recreateFunc();
            }
            return fun.addToObject(fun.asScript(f, mapping), obj, name);
        },
        addToObject: function (f, obj, name) {
            f.displayName = name;
            var methodConnections = obj.attributeConnections ? obj.attributeConnections.filter(function (con) {
                return con.getSourceAttrName() === 'update';
            }) : [];
            if (methodConnections)
                methodConnections.forEach(function (ea) {
                    ea.disconnect();
                });
            obj[name] = f;
            if (typeof exports.obj)
                f.declaredObject = exports.obj.safeToString(obj);
            if (typeof lively !== 'undefined' && exports.obj && lively.Tracing && lively.Tracing.stackTracingEnabled) {
                lively.Tracing.instrumentMethod(obj, name, { declaredObject: exports.obj.safeToString(obj) });
            }
            if (methodConnections)
                methodConnections.forEach(function (ea) {
                    ea.connect();
                });
            return f;
        },
        binds: function (f, varMapping) {
            return Closure.fromFunction(f, varMapping || {}).recreateFunc();
        },
        setLocalVarValue: function (f, name, value) {
            if (f.hasLivelyClosure)
                f.livelyClosure.funcProperties[name] = value;
        },
        getVarMapping: function (f) {
            if (f.hasLivelyClosure)
                return f.livelyClosure.varMapping;
            if (f.isWrapper)
                return f.originalFunction.varMapping;
            if (f.varMapping)
                return f.varMapping;
            return {};
        },
        setProperty: function (func, name, value) {
            func[name] = value;
            if (func.hasLivelyClosure)
                func.livelyClosure.funcProperties[name] = value;
        },
        functionNames: function (klass) {
            var result = [], lookupObj = klass.prototype;
            while (lookupObj) {
                result = Object.keys(lookupObj).reduce(function (result, name) {
                    if (typeof lookupObj[name] === 'function' && result.indexOf(name) === -1)
                        result.push(name);
                    return result;
                }, result);
                lookupObj = Object.getPrototypeOf(lookupObj);
            }
            return result;
        },
        localFunctionNames: function (func) {
            return Object.keys(func.prototype).filter(function (name) {
                return typeof func.prototype[name] === 'function';
            });
        },
        logErrors: function (func, prefix) {
            var advice = function logErrorsAdvice(proceed) {
                var args = Array.prototype.slice.call(arguments);
                args.shift();
                try {
                    return proceed.apply(func, args);
                } catch (er) {
                    if (typeof lively !== 'undefined' && lively.morphic && lively.morphic.World && lively.morphic.World.current()) {
                        lively.morphic.World.current().logError(er);
                        throw er;
                    }
                    if (prefix)
                        console.warn('ERROR: %s.%s(%s): err: %s %s', func, prefix, args, er, er.stack || '');
                    else
                        console.warn('ERROR: %s %s', er, er.stack || '');
                    if (typeof logStack !== 'undefined')
                        logStack();
                    if (typeof printObject !== 'undefined')
                        console.warn('details: ' + printObject(er));
                    throw er;
                }
            };
            advice.methodName = '$logErrorsAdvice';
            var result = fun.wrap(func, advice);
            result.originalFunction = func;
            result.methodName = '$logErrorsWrapper';
            return result;
        },
        logCompletion: function (func, module) {
            var advice = function logCompletionAdvice(proceed) {
                var args = Array.prototype.slice.call(arguments);
                args.shift();
                try {
                    var result = proceed.apply(func, args);
                } catch (er) {
                    console.warn('failed to load ' + module + ': ' + er);
                    if (typeof lively !== 'undefined' && lively.lang.Execution)
                        lively.lang.Execution.showStack();
                    throw er;
                }
                console.log('completed ' + module);
                return result;
            };
            advice.methodName = '$logCompletionAdvice::' + module;
            var result = fun.wrap(func, advice);
            result.methodName = '$logCompletionWrapper::' + module;
            result.originalFunction = func;
            return result;
        },
        logCalls: function (func, isUrgent) {
            var original = func, advice = function logCallsAdvice(proceed) {
                    var args = Array.prototype.slice.call(arguments);
                    args.shift(), result = proceed.apply(func, args);
                    if (isUrgent) {
                        console.warn('%s(%s) -> %s', fun.qualifiedMethodName(original), args, result);
                    } else {
                        console.log('%s(%s) -> %s', fun.qualifiedMethodName(original), args, result);
                    }
                    return result;
                };
            advice.methodName = '$logCallsAdvice::' + fun.qualifiedMethodName(func);
            var result = fun.wrap(func, advice);
            result.originalFunction = func;
            result.methodName = '$logCallsWrapper::' + fun.qualifiedMethodName(func);
            return result;
        },
        traceCalls: function (func, stack) {
            var advice = function traceCallsAdvice(proceed) {
                var args = Array.prototype.slice.call(arguments);
                args.shift();
                stack.push(args);
                var result = proceed.apply(func, args);
                stack.pop();
                return result;
            };
            return fun.wrap(func, advice);
        },
        webkitStack: function () {
            try {
                throw new Error();
            } catch (e) {
                return String(e.stack).split(/\n/).slice(2).map(function (line) {
                    return line.replace(/^\s*at\s*([^\s]+).*/, '$1');
                }).join('\n');
            }
        }
    };
    function Closure() {
        this.initialize.apply(this, arguments);
    }
    exports.Closure = Closure;
    exports.obj.extend(Closure, {
        superclass: Object,
        type: 'Closure',
        categories: {}
    });
    Closure.prototype.isLivelyClosure = true;
    Closure.prototype.doNotSerialize = ['originalFunc'];
    Closure.prototype.initialize = function (func, varMapping, source, funcProperties) {
        this.originalFunc = func;
        this.varMapping = varMapping || {};
        this.source = source;
        this.setFuncProperties(func || funcProperties);
    };
    Closure.prototype.setFuncSource = function (src) {
        this.source = src;
    };
    Closure.prototype.getFuncSource = function () {
        return this.source || String(this.originalFunc);
    };
    Closure.prototype.hasFuncSource = function () {
        return this.source && true;
    };
    Closure.prototype.getFunc = function () {
        return this.originalFunc || this.recreateFunc();
    };
    Closure.prototype.getFuncProperties = function () {
        if (!this.funcProperties)
            this.funcProperties = {};
        return this.funcProperties;
    };
    Closure.prototype.setFuncProperties = function (obj) {
        var props = this.getFuncProperties();
        for (var name in obj) {
            if (obj.hasOwnProperty(name) && name != '_cachedAst') {
                props[name] = obj[name];
            }
        }
    };
    Closure.prototype.lookup = function (name) {
        return this.varMapping[name];
    };
    Closure.prototype.parameterNames = function (methodString) {
        var parameterRegex = /function\s*\(([^\)]*)\)/, regexResult = parameterRegex.exec(methodString);
        if (!regexResult || !regexResult[1])
            return [];
        var parameterString = regexResult[1];
        if (parameterString.length == 0)
            return [];
        var parameters = parameterString.split(',').map(function (str) {
            return exports.string.removeSurroundingWhitespaces(str);
        }, this);
        return parameters;
    };
    Closure.prototype.firstParameter = function (src) {
        return this.parameterNames(src)[0] || null;
    };
    Closure.prototype.recreateFunc = function () {
        return this.recreateFuncFromSource(this.getFuncSource(), this.originalFunc);
    };
    Closure.prototype.recreateFuncFromSource = function (funcSource, optFunc) {
        var closureVars = [], thisFound = false, specificSuperHandling = this.firstParameter(funcSource) === '$super';
        for (var name in this.varMapping) {
            if (!this.varMapping.hasOwnProperty(name))
                continue;
            if (name == 'this') {
                thisFound = true;
                continue;
            }
            closureVars.push(name + '=this.varMapping["' + name + '"]');
        }
        var src = closureVars.length > 0 ? 'var ' + closureVars.join(',') + ';\n' : '';
        if (specificSuperHandling)
            src += '(function superWrapperForClosure() { return ';
        src += '(' + funcSource + ')';
        if (specificSuperHandling)
            src += '.apply(this, [$super.bind(this)].concat(Array.from(arguments))) })';
        if (typeof lively !== 'undefined' && lively.Config && lively.Config.loadRewrittenCode) {
            module('lively.ast.Rewriting').load(true);
            var namespace = '[runtime]';
            if (optFunc && optFunc.sourceModule)
                namespace = new URL(optFunc.sourceModule.findUri()).relativePathFrom(URL.root);
            var fnAst = lively.ast.acorn.parse(src), rewrittenAst = lively.ast.Rewriting.rewrite(fnAst, lively.ast.Rewriting.getCurrentASTRegistry(), namespace), retVal = rewrittenAst.body[0].block.body.last();
            retVal.type = 'ReturnStatement';
            retVal.argument = retVal.expression;
            delete retVal.expression;
            src = '(function() { ' + escodegen.generate(rewrittenAst) + '}).bind(this)();';
        }
        try {
            var func = fun.evalJS.call(this, src) || this.couldNotCreateFunc(src);
            this.addFuncProperties(func);
            this.originalFunc = func;
            if (typeof lively !== 'undefined' && lively.Config && lively.Config.loadRewrittenCode) {
                func._cachedAst.source = funcSource;
                func._cachedAst.start++;
                func._cachedAst.end--;
            }
            return func;
        } catch (e) {
            var msg = 'Cannot create function ' + e + ' src: ' + src;
            console.error(msg);
            throw new Error(msg);
        }
    };
    Closure.prototype.addFuncProperties = function (func) {
        var props = this.getFuncProperties();
        for (var name in props) {
            if (props.hasOwnProperty(name))
                func[name] = props[name];
        }
        this.addClosureInformation(func);
    };
    Closure.prototype.couldNotCreateFunc = function (src) {
        var msg = 'Could not recreate closure from source: \n' + src;
        console.error(msg);
        return function () {
            throw new Error(msg);
        };
    };
    Closure.prototype.asFunction = function () {
        return this.recreateFunc();
    };
    Closure.prototype.addClosureInformation = function (f) {
        f.hasLivelyClosure = true;
        f.livelyClosure = this;
        return f;
    };
    Closure.fromFunction = function (func, varMapping) {
        return new Closure(func, varMapping || {});
    };
    Closure.fromSource = function (source, varMapping) {
        return new Closure(null, varMapping || {}, source);
    };
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));

;
(function (exports) {
    var string = exports.string = {
        format: function strings$format() {
            return string.formatFromArray(Array.prototype.slice.call(arguments));
        },
        formatFromArray: function strings$formatFromArray(objects) {
            var self = objects.shift();
            if (!self) {
                console.log('Error in Strings>>formatFromArray, first arg is undefined');
            }
            ;
            function appendText(object, string) {
                return '' + object;
            }
            function appendInteger(value, string) {
                return value.toString();
            }
            function appendFloat(value, string, precision) {
                if (precision > -1)
                    return value.toFixed(precision);
                else
                    return value.toString();
            }
            function appendObject(value, string) {
                return exports.obj.inspect(value);
            }
            var appenderMap = {
                s: appendText,
                d: appendInteger,
                i: appendInteger,
                f: appendFloat,
                o: appendObject
            };
            var reg = /((^%|[^\\]%)(\d+)?(\.)([a-zA-Z]))|((^%|[^\\]%)([a-zA-Z]))/;
            function parseFormat(fmt) {
                var oldFmt = fmt;
                var parts = [];
                for (var m = reg.exec(fmt); m; m = reg.exec(fmt)) {
                    var type = m[8] || m[5], appender = type in appenderMap ? appenderMap[type] : appendObject, precision = m[3] ? parseInt(m[3]) : m[4] == '.' ? -1 : 0;
                    parts.push(fmt.substr(0, m[0][0] == '%' ? m.index : m.index + 1));
                    parts.push({
                        appender: appender,
                        precision: precision
                    });
                    fmt = fmt.substr(m.index + m[0].length);
                }
                if (fmt)
                    parts.push(fmt.toString());
                return parts;
            }
            ;
            var parts = parseFormat(self), str = '', objIndex = 0;
            for (var i = 0; i < parts.length; ++i) {
                var part = parts[i];
                if (part && typeof part == 'object') {
                    var object = objects[objIndex++];
                    str += (part.appender || appendText)(object, str, part.precision);
                } else {
                    str += appendText(part, str);
                }
            }
            return str;
        },
        indent: function (str, indentString, depth) {
            if (!depth || depth <= 0)
                return str;
            while (depth > 0) {
                depth--;
                str = indentString + str;
            }
            return str;
        },
        removeSurroundingWhitespaces: function (str) {
            function removeTrailingWhitespace(s) {
                while (s.length > 0 && /\s|\n|\r/.test(s[s.length - 1]))
                    s = s.substring(0, s.length - 1);
                return s;
            }
            function removeLeadingWhitespace(string) {
                return string.replace(/^[\n\s]*(.*)/, '$1');
            }
            return removeLeadingWhitespace(removeTrailingWhitespace(str));
        },
        quote: function (str) {
            return '"' + str.replace(/"/g, '\\"') + '"';
        },
        print: function print(obj) {
            if (obj && Array.isArray(obj))
                return '[' + obj.map(print) + ']';
            if (typeof obj !== 'string')
                return String(obj);
            var result = String(obj);
            result = result.replace(/\n/g, '\\n\\\n');
            result = result.replace(/(")/g, '\\$1');
            result = '"' + result + '"';
            return result;
        },
        printNested: function (list, depth) {
            depth = depth || 0;
            var s = '';
            list.forEach(function (ea) {
                if (ea instanceof Array) {
                    s += string.printNested(ea, depth + 1);
                } else {
                    s += string.indent(ea + '\n', '  ', depth);
                }
            });
            return s;
        },
        pad: function (string, n, left) {
            return left ? ' '.times(n) + string : string + ' '.times(n);
        },
        printTable: function (tableArray, options) {
            var columnWidths = [], separator = options && options.separator || ' ', alignLeftAll = !options || !options.align || options.align === 'left', alignRightAll = options && options.align === 'right';
            function alignRight(columnIndex) {
                if (alignLeftAll)
                    return false;
                if (alignRightAll)
                    return true;
                return options && Object.isArray(options.align) && options.align[columnIndex] === 'right';
            }
            tableArray.forEach(function (row) {
                row.forEach(function (cellVal, i) {
                    if (columnWidths[i] === undefined)
                        columnWidths[i] = 0;
                    columnWidths[i] = Math.max(columnWidths[i], String(cellVal).length);
                });
            });
            return tableArray.collect(function (row) {
                return row.collect(function (cellVal, i) {
                    var cellString = String(cellVal);
                    return string.pad(cellString, columnWidths[i] - cellString.length, alignRight(i));
                }).join(separator);
            }).join('\n');
        },
        printTree: function (rootNode, nodePrinter, childGetter, indent) {
            var nodeList = [];
            indent = indent || '  ';
            iterator(0, 0, rootNode);
            return nodeList.join('\n');
            function iterator(depth, index, node) {
                nodeList[index] = string.times(indent, depth) + nodePrinter(node, depth);
                var children = childGetter(node, depth), childIndex = index + 1;
                if (!children || !children.length)
                    return childIndex;
                var lastIndex = childIndex, lastI = children.length - 1;
                children.forEach(function (ea, i) {
                    childIndex = iterator(depth + 1, childIndex, ea);
                    var isLast = lastI === i, cs = nodeList[lastIndex].split(''), fromSlash = depth * indent.length + 1, toSlash = depth * indent.length + indent.length;
                    for (var i = fromSlash; i < toSlash; i++)
                        cs[i] = '-';
                    if (isLast)
                        cs[depth * indent.length] = '\\';
                    nodeList[lastIndex] = cs.join('');
                    if (!isLast)
                        nodeList.slice(lastIndex, childIndex).forEach(function (ea, i) {
                            var cs2 = ea.split('');
                            cs2[depth * indent.length] = '|';
                            nodeList[lastIndex + i] = cs2.join('');
                        });
                    lastIndex = childIndex;
                });
                return childIndex;
            }
        },
        toArray: function (s) {
            return s.split('');
        },
        lines: function (str) {
            return str.split(/\n\r?/);
        },
        paragraphs: function (string, options) {
            var sep = options ? options.sep : '\n\n';
            if (!options || !options.keepEmptyLines)
                return string.split(new RegExp(sep + '+'));
            function isWhiteSpace(s) {
                return /^\s*$/.test(s);
            }
            return string.split('\n').concat('').reduce(function (parasAndLast, line) {
                var paras = parasAndLast[0], last = parasAndLast[1];
                if (isWhiteSpace(last) === isWhiteSpace(line)) {
                    last += '\n' + line;
                } else {
                    last.length && paras.push(last);
                    last = line;
                }
                return [
                    paras,
                    last
                ];
            }, [
                [],
                ''
            ])[0];
        },
        nonEmptyLines: function (str) {
            return string.lines(str).compact();
        },
        tokens: function (str, regex) {
            return str.split(regex || /\s+/).filter(function (tok) {
                return !/^\s*$/.test(tok);
            });
        },
        tableize: function (s, options) {
            options = options || {};
            var splitter = options.cellSplitter || /\s+/, emptyStringRe = /^\s*$/, convertTypes = options.hasOwnProperty('convertTypes') ? !!options.convertTypes : true, lines = string.lines(s), table = [];
            for (var i = 0; i < lines.length; i++) {
                var tokens = string.tokens(lines[i], splitter);
                if (convertTypes) {
                    tokens = tokens.map(function (tok) {
                        if (tok.match(emptyStringRe))
                            return tok;
                        var num = Number(tok);
                        if (!isNaN(num))
                            return num;
                        var date = new Date(tok);
                        if (!isNaN(+date))
                            return date;
                        return tok.trim();
                    });
                }
                if (tokens.length > 0)
                    table.push(tokens);
            }
            return table;
        },
        unescapeCharacterEntities: function (s) {
            if (typeof document === 'undefined')
                throw new Error('Cannot unescapeCharacterEntities');
            var div = document.createElement('div');
            div.innerHTML = s;
            return div.textContent;
        },
        toQueryParams: function (s, separator) {
            var match = s.trim().match(/([^?#]*)(#.*)?$/);
            if (!match)
                return {};
            var hash = match[1].split(separator || '&').inject({}, function (hash, pair) {
                if ((pair = pair.split('='))[0]) {
                    var key = decodeURIComponent(pair.shift());
                    var value = pair.length > 1 ? pair.join('=') : pair[0];
                    if (value != undefined)
                        value = decodeURIComponent(value);
                    if (key in hash) {
                        if (!Array.isArray(hash[key]))
                            hash[key] = [hash[key]];
                        hash[key].push(value);
                    } else
                        hash[key] = value;
                }
                return hash;
            });
            return hash;
        },
        joinPath: function () {
            var args = Array.prototype.slice.call(arguments);
            return args.reduce(function (path, ea) {
                return typeof ea === 'string' ? path.replace(/\/*$/, '') + '/' + ea.replace(/^\/*/, '') : path;
            });
        },
        newUUID: function () {
            var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 3 | 8;
                return v.toString(16);
            }).toUpperCase();
            return id;
        },
        createDataURI: function (content, mimeType) {
            mimeType = mimeType || 'text/plain';
            return 'data:' + mimeType + ';base64,' + btoa(content);
        },
        hashCode: function (s) {
            var hash = 0, len = s.length;
            if (len == 0)
                return hash;
            for (var i = 0; i < len; i++) {
                var c = s.charCodeAt(i);
                hash = (hash << 5) - hash + c;
                hash = hash & hash;
            }
            return hash;
        },
        md5: function (string) {
            var add32 = function add32(x, y) {
                var lsw = (x & 65535) + (y & 65535), msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return msw << 16 | lsw & 65535;
            };
            function cmn(q, a, b, x, s, t) {
                a = add32(add32(a, q), add32(x, t));
                return add32(a << s | a >>> 32 - s, b);
            }
            function ff(a, b, c, d, x, s, t) {
                return cmn(b & c | ~b & d, a, b, x, s, t);
            }
            function gg(a, b, c, d, x, s, t) {
                return cmn(b & d | c & ~d, a, b, x, s, t);
            }
            function hh(a, b, c, d, x, s, t) {
                return cmn(b ^ c ^ d, a, b, x, s, t);
            }
            function ii(a, b, c, d, x, s, t) {
                return cmn(c ^ (b | ~d), a, b, x, s, t);
            }
            function md5cycle(x, k) {
                var a = x[0], b = x[1], c = x[2], d = x[3];
                a = ff(a, b, c, d, k[0], 7, -680876936);
                d = ff(d, a, b, c, k[1], 12, -389564586);
                c = ff(c, d, a, b, k[2], 17, 606105819);
                b = ff(b, c, d, a, k[3], 22, -1044525330);
                a = ff(a, b, c, d, k[4], 7, -176418897);
                d = ff(d, a, b, c, k[5], 12, 1200080426);
                c = ff(c, d, a, b, k[6], 17, -1473231341);
                b = ff(b, c, d, a, k[7], 22, -45705983);
                a = ff(a, b, c, d, k[8], 7, 1770035416);
                d = ff(d, a, b, c, k[9], 12, -1958414417);
                c = ff(c, d, a, b, k[10], 17, -42063);
                b = ff(b, c, d, a, k[11], 22, -1990404162);
                a = ff(a, b, c, d, k[12], 7, 1804603682);
                d = ff(d, a, b, c, k[13], 12, -40341101);
                c = ff(c, d, a, b, k[14], 17, -1502002290);
                b = ff(b, c, d, a, k[15], 22, 1236535329);
                a = gg(a, b, c, d, k[1], 5, -165796510);
                d = gg(d, a, b, c, k[6], 9, -1069501632);
                c = gg(c, d, a, b, k[11], 14, 643717713);
                b = gg(b, c, d, a, k[0], 20, -373897302);
                a = gg(a, b, c, d, k[5], 5, -701558691);
                d = gg(d, a, b, c, k[10], 9, 38016083);
                c = gg(c, d, a, b, k[15], 14, -660478335);
                b = gg(b, c, d, a, k[4], 20, -405537848);
                a = gg(a, b, c, d, k[9], 5, 568446438);
                d = gg(d, a, b, c, k[14], 9, -1019803690);
                c = gg(c, d, a, b, k[3], 14, -187363961);
                b = gg(b, c, d, a, k[8], 20, 1163531501);
                a = gg(a, b, c, d, k[13], 5, -1444681467);
                d = gg(d, a, b, c, k[2], 9, -51403784);
                c = gg(c, d, a, b, k[7], 14, 1735328473);
                b = gg(b, c, d, a, k[12], 20, -1926607734);
                a = hh(a, b, c, d, k[5], 4, -378558);
                d = hh(d, a, b, c, k[8], 11, -2022574463);
                c = hh(c, d, a, b, k[11], 16, 1839030562);
                b = hh(b, c, d, a, k[14], 23, -35309556);
                a = hh(a, b, c, d, k[1], 4, -1530992060);
                d = hh(d, a, b, c, k[4], 11, 1272893353);
                c = hh(c, d, a, b, k[7], 16, -155497632);
                b = hh(b, c, d, a, k[10], 23, -1094730640);
                a = hh(a, b, c, d, k[13], 4, 681279174);
                d = hh(d, a, b, c, k[0], 11, -358537222);
                c = hh(c, d, a, b, k[3], 16, -722521979);
                b = hh(b, c, d, a, k[6], 23, 76029189);
                a = hh(a, b, c, d, k[9], 4, -640364487);
                d = hh(d, a, b, c, k[12], 11, -421815835);
                c = hh(c, d, a, b, k[15], 16, 530742520);
                b = hh(b, c, d, a, k[2], 23, -995338651);
                a = ii(a, b, c, d, k[0], 6, -198630844);
                d = ii(d, a, b, c, k[7], 10, 1126891415);
                c = ii(c, d, a, b, k[14], 15, -1416354905);
                b = ii(b, c, d, a, k[5], 21, -57434055);
                a = ii(a, b, c, d, k[12], 6, 1700485571);
                d = ii(d, a, b, c, k[3], 10, -1894986606);
                c = ii(c, d, a, b, k[10], 15, -1051523);
                b = ii(b, c, d, a, k[1], 21, -2054922799);
                a = ii(a, b, c, d, k[8], 6, 1873313359);
                d = ii(d, a, b, c, k[15], 10, -30611744);
                c = ii(c, d, a, b, k[6], 15, -1560198380);
                b = ii(b, c, d, a, k[13], 21, 1309151649);
                a = ii(a, b, c, d, k[4], 6, -145523070);
                d = ii(d, a, b, c, k[11], 10, -1120210379);
                c = ii(c, d, a, b, k[2], 15, 718787259);
                b = ii(b, c, d, a, k[9], 21, -343485551);
                x[0] = add32(a, x[0]);
                x[1] = add32(b, x[1]);
                x[2] = add32(c, x[2]);
                x[3] = add32(d, x[3]);
            }
            function md51(s) {
                var n = s.length, state = [
                        1732584193,
                        -271733879,
                        -1732584194,
                        271733878
                    ], i;
                for (i = 64; i <= n; i += 64) {
                    md5cycle(state, md5blk(s.substring(i - 64, i)));
                }
                s = s.substring(i - 64);
                var tail = [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    ], sl = s.length;
                for (i = 0; i < sl; i++)
                    tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
                tail[i >> 2] |= 128 << (i % 4 << 3);
                if (i > 55) {
                    md5cycle(state, tail);
                    i = 16;
                    while (i--) {
                        tail[i] = 0;
                    }
                }
                tail[14] = n * 8;
                md5cycle(state, tail);
                return state;
            }
            function md5blk(s) {
                var md5blks = [], i;
                for (i = 0; i < 64; i += 4) {
                    md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
                }
                return md5blks;
            }
            var hex_chr = '0123456789abcdef'.split('');
            function rhex(n) {
                var s = '', j = 0;
                for (; j < 4; j++)
                    s += hex_chr[n >> j * 8 + 4 & 15] + hex_chr[n >> j * 8 & 15];
                return s;
            }
            function hex(x) {
                var l = x.length;
                for (var i = 0; i < l; i++)
                    x[i] = rhex(x[i]);
                return x.join('');
            }
            return hex(md51(string));
        },
        reMatches: function (string, re) {
            var matches = [];
            string.replace(re, function (match, idx) {
                matches.push({
                    match: match,
                    start: idx,
                    end: idx + match.length
                });
            });
            return matches;
        },
        stringMatch: function (s, patternString, options) {
            options = options || {};
            if (!!options.normalizeWhiteSpace)
                s = s.replace(/\s+/g, ' ');
            if (!!options.ignoreIndent) {
                s = s.replace(/^\s+/gm, '');
                patternString = patternString.replace(/^\s+/gm, '');
            }
            return s == patternString ? { matched: true } : embeddedReMatch(s, patternString);
            function splitInThree(string, start, end, startGap, endGap) {
                startGap = startGap || 0;
                endGap = endGap || 0;
                return [
                    string.slice(0, start),
                    string.slice(start + startGap, end - endGap),
                    string.slice(end)
                ];
            }
            function matchStringForward(s, pattern) {
                if (pattern.constructor !== RegExp) {
                    var idx = s.indexOf(pattern);
                    if (idx === 0)
                        return {
                            match: pattern,
                            rest: s.slice(pattern.length)
                        };
                    for (var i = 0; i < pattern.length; i++)
                        if (pattern[i] != s[i])
                            return {
                                match: null,
                                pos: i
                            };
                    return { match: null };
                }
                var matches = string.reMatches(s, pattern);
                return !matches || !matches.length || matches[0].start !== 0 ? { match: null } : {
                    match: matches[0].match,
                    rest: s.slice(matches[0].end)
                };
            }
            function matchStringForwardWithAllPatterns(s, patterns) {
                var pos = 0;
                for (var i = 0; i < patterns.length; i++) {
                    var p = patterns[i], result = matchStringForward(s, p);
                    if (!result.match)
                        return {
                            matched: false,
                            pos: pos + (result.pos || 0),
                            pattern: p
                        };
                    pos += result.match.length;
                    s = result.rest;
                }
                return s.length ? {
                    matched: false,
                    pos: pos
                } : { matched: true };
            }
            function splitIntoPatterns(matcher) {
                var starts = string.reMatches(matcher, /__\//g), ends = string.reMatches(matcher, /\/__/g);
                if (starts.length !== ends.length) {
                    throw new Error('pattern invalid: ' + matcher + ' cannot be split into __/.../__ embedded RegExps' + '\nstarts: ' + JSON.stringify(starts) + '\nvs ends:\n' + JSON.stringify(ends));
                }
                var consumed = 0;
                return starts.reduce(function (patterns, start, i) {
                    var end = ends[i];
                    var matcher = patterns.pop();
                    var splitted = splitInThree(matcher, start.start - consumed, end.end - consumed, 3, 3);
                    if (splitted[0].length) {
                        patterns.push(splitted[0]);
                        consumed += splitted[0].length;
                    }
                    try {
                        if (splitted[1].length) {
                            patterns.push(new RegExp(splitted[1]));
                            consumed += splitted[1].length + 3 + 3;
                        }
                    } catch (e) {
                        throw new Error('Cannot create pattern re from: ' + exports.obj.inspect(splitted));
                    }
                    if (splitted[2].length) {
                        patterns.push(splitted[2]);
                    }
                    return patterns;
                }, [matcher]);
            }
            function embeddedReMatch(s, patternString) {
                var patterns = splitIntoPatterns(patternString);
                var result = matchStringForwardWithAllPatterns(s, patterns);
                if (result.matched)
                    return result;
                result.error = s.slice(0, result.pos) + '<--UNMATCHED-->' + s.slice(result.pos);
                return result;
            }
        },
        peekRight: function (s, start, needle) {
            s = s.slice(start);
            if (typeof needle === 'string') {
                var idx = s.indexOf(needle);
                return idx === -1 ? null : idx + start;
            } else if (needle.constructor === RegExp) {
                var matches = string.reMatches(s, needle);
                return matches[0] ? matches[0].start : null;
            }
            return null;
        },
        peekLeft: function (s, start, needle) {
            s = s.slice(0, start);
            if (typeof needle === 'string') {
                var idx = s.lastIndexOf(needle);
                return idx === -1 ? null : idx;
            } else if (needle.constructor === RegExp) {
                var matches = string.reMatches(s, needle);
                return exports.arr.last(matches) ? exports.arr.last(matches).start : null;
            }
            return null;
        },
        lineIndexComputer: function (s) {
            var lineRanges = string.lines(s).reduce(function (lineIndexes, line) {
                var lastPos = lineIndexes.slice(-1)[0] || -1;
                return lineIndexes.concat([
                    lastPos + 1,
                    lastPos + 1 + line.length
                ]);
            }, []);
            return function (pos) {
                for (var line = 0; line < lineRanges.length; line += 2)
                    if (pos >= lineRanges[line] && pos <= lineRanges[line + 1])
                        return line / 2;
                return -1;
            };
        },
        lineNumberToIndexesComputer: function (s) {
            var lineRanges = string.lines(s).reduce(function (akk, line) {
                var start = akk.indexCount, end = akk.indexCount + line.length + 1;
                akk.lineRanges.push([
                    start,
                    end
                ]);
                akk.indexCount = end;
                return akk;
            }, {
                lineRanges: [],
                indexCount: 0
            }).lineRanges;
            return function (lineNo) {
                return lineRanges[lineNo];
            };
        },
        diff: function (s1, s2) {
            if (typeof JsDiff === 'undefined')
                return 'diff not supported';
            return JsDiff.convertChangesToXML(JsDiff.diffWordsWithSpace(s1, s2));
        },
        empty: function (s) {
            return s == '';
        },
        include: function (s, pattern) {
            return s.indexOf(pattern) > -1;
        },
        startsWith: function (s, pattern) {
            return s.indexOf(pattern) === 0;
        },
        startsWithVowel: function (s) {
            var c = s[0];
            return c === 'A' || c === 'E' || c === 'I' || c === 'O' || c === 'U' || c === 'a' || c === 'e' || c === 'i' || c === 'o' || c === 'u' || false;
        },
        endsWith: function (s, pattern) {
            var d = s.length - pattern.length;
            return d >= 0 && s.lastIndexOf(pattern) === d;
        },
        withDecimalPrecision: function (str, precision) {
            var floatValue = parseFloat(str);
            return isNaN(floatValue) ? str : floatValue.toFixed(precision);
        },
        capitalize: function (s) {
            return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
        },
        camelCaseString: function (s) {
            return s.split(' ').invoke('capitalize').join('');
        },
        camelize: function (s) {
            var parts = s.split('-'), len = parts.length;
            if (len == 1)
                return parts[0];
            var camelized = s.charAt(0) == '-' ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1) : parts[0];
            for (var i = 1; i < len; i++)
                camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
            return camelized;
        },
        truncate: function (s, length, truncation) {
            length = length || 30;
            truncation = truncation === undefined ? '...' : truncation;
            return s.length > length ? s.slice(0, length - truncation.length) + truncation : String(s);
        },
        regExpEscape: function (s) {
            return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08');
        },
        succ: function (s) {
            return s.slice(0, s.length - 1) + String.fromCharCode(s.charCodeAt(s.length - 1) + 1);
        },
        digitValue: function (s) {
            return s.charCodeAt(0) - '0'.charCodeAt(0);
        },
        times: function (s, count) {
            return count < 1 ? '' : new Array(count + 1).join(s);
        },
        applyChange: function (string, change) {
            if (change.action === 'insert') {
                return string.slice(0, change.start) + change.lines.join('\n') + string.slice(change.start);
            } else if (change.action === 'remove') {
                return string.slice(0, change.start) + string.slice(change.end);
            }
            return string;
        },
        applyChanges: function (s, changes) {
            return changes.reduce(function (result, change) {
                return string.applyChange(s, change);
            }, s);
        }
    };
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));

;
(function (exports) {
    'use strict';
    var num = exports.num = {
        random: function (min, max) {
            min = min || 0;
            max = max || 100;
            return Math.round(Math.random() * (max - min) + min);
        },
        normalRandom: function (mean, stdDev) {
            var spare, isSpareReady = false;
            return function (mean, stdDev) {
                if (isSpareReady) {
                    isSpareReady = false;
                    return spare * stdDev + mean;
                } else {
                    var u, v, s;
                    do {
                        u = Math.random() * 2 - 1;
                        v = Math.random() * 2 - 1;
                        s = u * u + v * v;
                    } while (s >= 1 || s == 0);
                    var mul = Math.sqrt(-2 * Math.log(s) / s);
                    spare = v * mul;
                    isSpareReady = true;
                    return mean + stdDev * u * mul;
                }
            };
        }(),
        randomSmallerInteger: function (n) {
            return Math.floor(Math.random() * n);
        },
        humanReadableByteSize: function (n) {
            function round(n) {
                return Math.round(n * 100) / 100;
            }
            if (n < 1000)
                return String(round(n)) + 'B';
            n = n / 1024;
            if (n < 1000)
                return String(round(n)) + 'KB';
            n = n / 1024;
            return String(round(n)) + 'MB';
        },
        average: function (numbers) {
            return numbers.reduce(function (sum, n) {
                return sum + n;
            }, 0) / numbers.length;
        },
        median: function (numbers) {
            var sorted = numbers.sort(function (a, b) {
                    return b - a;
                }), len = numbers.length;
            return len % 2 === 0 ? 0.5 * (sorted[len / 2 - 1] + sorted[len / 2]) : sorted[(len - 1) / 2];
        },
        between: function (x, a, b, eps) {
            eps = eps || 0;
            var min, max;
            if (a < b) {
                min = a, max = b;
            } else {
                max = a, min = b;
            }
            return max - x + eps >= 0 && min - x - eps <= 0;
        },
        sort: function (arr) {
            return arr.sort(function (a, b) {
                return a - b;
            });
        },
        parseLength: function (string, toUnit) {
            toUnit = toUnit || 'px';
            var match = string.match(/([0-9\.]+)\s*(.*)/);
            if (!match || !match[1])
                return undefined;
            var length = parseFloat(match[1]), fromUnit = match[2];
            return exports.num.convertLength(length, fromUnit, toUnit);
        },
        convertLength: function () {
            function toCm(n, unit) {
                if (unit === 'cm')
                    return n;
                else if (unit === 'mm')
                    return n * 0.1;
                else if (unit === 'in')
                    return n * 2.54;
                else if (unit === 'px')
                    return n * toCm(1 / 96, 'in');
                else if (unit === 'pt')
                    return n * toCm(1 / 72, 'in');
                else if (unit === 'pc')
                    return n * toCm(12, 'pt');
            }
            return function to(length, fromUnit, toUnit) {
                if (fromUnit === toUnit)
                    return length;
                else if (toUnit === 'cm')
                    return toCm(length, fromUnit);
                else if (fromUnit === 'cm')
                    return length / toCm(1, toUnit);
                else
                    return to(to(length, fromUnit, 'cm'), 'cm', toUnit);
            };
        }(),
        roundTo: function (n, quantum) {
            quantum = 1 / quantum;
            return Math.round(n * quantum) / quantum;
        },
        detent: function (n, detent, grid, snap) {
            var r1 = exports.num.roundTo(n, grid);
            if (Math.abs(n - r1) < detent / 2)
                return r1;
            if (snap)
                return n;
            var r2 = n < r1 ? r1 - detent / 2 : r1 + detent / 2;
            return r1 + (n - r2) * grid / (grid - detent);
        },
        toDegrees: function (n) {
            return n * 180 / Math.PI % 360;
        },
        toRadians: function (n) {
            return n / 180 * Math.PI;
        }
    };
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));

;
(function (exports) {
    'use strict';
    var dateFormat = function setupDateFormat() {
        var dateFormat = function () {
            var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g, timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, timezoneClip = /[^-+\dA-Z]/g, pad = function (val, len) {
                    val = String(val);
                    len = len || 2;
                    while (val.length < len)
                        val = '0' + val;
                    return val;
                };
            return function (date, mask, utc) {
                var dF = dateFormat;
                if (arguments.length == 1 && Object.prototype.toString.call(date) == '[object String]' && !/\d/.test(date)) {
                    mask = date;
                    date = undefined;
                }
                date = date ? new Date(date) : new Date();
                if (isNaN(date))
                    throw SyntaxError('invalid date');
                mask = String(dF.masks[mask] || mask || dF.masks['default']);
                if (mask.slice(0, 4) == 'UTC:') {
                    mask = mask.slice(4);
                    utc = true;
                }
                var _ = utc ? 'getUTC' : 'get', d = date[_ + 'Date'](), D = date[_ + 'Day'](), m = date[_ + 'Month'](), y = date[_ + 'FullYear'](), H = date[_ + 'Hours'](), M = date[_ + 'Minutes'](), s = date[_ + 'Seconds'](), L = date[_ + 'Milliseconds'](), o = utc ? 0 : date.getTimezoneOffset(), flags = {
                        d: d,
                        dd: pad(d),
                        ddd: dF.i18n.dayNames[D],
                        dddd: dF.i18n.dayNames[D + 7],
                        m: m + 1,
                        mm: pad(m + 1),
                        mmm: dF.i18n.monthNames[m],
                        mmmm: dF.i18n.monthNames[m + 12],
                        yy: String(y).slice(2),
                        yyyy: y,
                        h: H % 12 || 12,
                        hh: pad(H % 12 || 12),
                        H: H,
                        HH: pad(H),
                        M: M,
                        MM: pad(M),
                        s: s,
                        ss: pad(s),
                        l: pad(L, 3),
                        L: pad(L > 99 ? Math.round(L / 10) : L),
                        t: H < 12 ? 'a' : 'p',
                        tt: H < 12 ? 'am' : 'pm',
                        T: H < 12 ? 'A' : 'P',
                        TT: H < 12 ? 'AM' : 'PM',
                        Z: utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
                        o: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                        S: [
                            'th',
                            'st',
                            'nd',
                            'rd'
                        ][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                    };
                return mask.replace(token, function ($0) {
                    return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
                });
            };
        }();
        dateFormat.masks = {
            'default': 'ddd mmm dd yyyy HH:MM:ss',
            shortDate: 'm/d/yy',
            mediumDate: 'mmm d, yyyy',
            longDate: 'mmmm d, yyyy',
            fullDate: 'dddd, mmmm d, yyyy',
            shortTime: 'h:MM TT',
            mediumTime: 'h:MM:ss TT',
            longTime: 'h:MM:ss TT Z',
            isoDate: 'yyyy-mm-dd',
            isoTime: 'HH:MM:ss',
            isoDateTime: 'yyyy-mm-dd\'T\'HH:MM:ss',
            isoUtcDateTime: 'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\''
        };
        dateFormat.i18n = {
            dayNames: [
                'Sun',
                'Mon',
                'Tue',
                'Wed',
                'Thu',
                'Fri',
                'Sat',
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday'
            ],
            monthNames: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ]
        };
        return dateFormat;
    }();
    exports.date = {
        format: function (date, mask, utc) {
            return dateFormat;
        }(),
        equals: function (date, otherDate) {
            return otherDate && otherDate instanceof Date && otherDate.getTime() === date.getTime();
        },
        relativeTo: function (date, otherDate) {
            if (!(otherDate instanceof Date))
                return '';
            if (otherDate < date)
                return '';
            if (otherDate === date)
                return 'now';
            var minuteString = 'min', secondString = 'sec', hourString = 'hour', dayString = 'day', diff = otherDate - date, totalSecs = Math.round(diff / 1000), secs = totalSecs % 60, mins = Math.floor(totalSecs / 60) % 60, hours = Math.floor(totalSecs / 60 / 60) % 24, days = Math.floor(totalSecs / 60 / 60 / 24), parts = [];
            if (days > 0) {
                parts.push(days);
                if (days > 1)
                    dayString += 's';
                parts.push(dayString);
            }
            if (hours > 0 && days < 2) {
                parts.push(hours);
                if (hours > 1)
                    hourString += 's';
                parts.push(hourString);
            }
            if (mins > 0 && hours < 3 && days === 0) {
                parts.push(mins);
                if (mins > 1)
                    minuteString += 's';
                parts.push(minuteString);
            }
            if (secs > 0 && mins < 3 && hours === 0 && days === 0) {
                parts.push(secs);
                if (secs > 1)
                    secondString += 's';
                parts.push(secondString);
            }
            return parts.join(' ');
        }
    };
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));

;
(function (exports) {
    'use strict';
    var arr = exports.arr, obj = exports.obj;
    exports.promise = function promise(obj) {
        return typeof obj === 'function' ? promise.convertCallbackFun(obj) : Promise.resolve(obj);
    };
    obj.extend(exports.promise, {
        delay: function (ms, resolveVal) {
            return new Promise(function (resolve) {
                setTimeout(resolve, ms, resolveVal);
            });
        },
        delayReject: function (ms, rejectVal) {
            return new Promise(function (_, reject) {
                setTimeout(reject, ms, rejectVal);
            });
        },
        timeout: function (ms, promise) {
            return new Promise(function (resolve, reject) {
                var done = false;
                setTimeout(function () {
                    return !done && (done = true) && reject(new Error('Promise timed out'));
                }, ms);
                promise.then(function (val) {
                    return !done && (done = true) && resolve(val);
                }, function (err) {
                    return !done && (done = true) && reject(err);
                });
            });
        },
        waitFor: function (ms, tester) {
            return new Promise(function (resolve, reject) {
                if (typeof ms === 'function') {
                    tester = ms;
                    ms = undefined;
                }
                var stopped = false, error = null, value = undefined, i = setInterval(function () {
                        if (stopped) {
                            clearInterval(i);
                            return;
                        }
                        try {
                            value = tester();
                        } catch (e) {
                            error = e;
                        }
                        if (value || error) {
                            stopped = true;
                            clearInterval(i);
                            error ? reject(error) : resolve(value);
                        }
                    }, 10);
                if (typeof ms === 'number') {
                    setTimeout(function () {
                        error = new Error('timeout');
                    }, ms);
                }
            });
        },
        deferred: function () {
            var resolve, reject, promise = new Promise(function (_resolve, _reject) {
                    resolve = _resolve;
                    reject = _reject;
                });
            return {
                resolve: resolve,
                reject: reject,
                promise: promise
            };
        },
        convertCallbackFun: function (func) {
            return function promiseGenerator() {
                var args = arr.from(arguments), self = this;
                return new Promise(function (resolve, reject) {
                    args.push(function (err, result) {
                        return err ? reject(err) : resolve(result);
                    });
                    func.apply(self, args);
                });
            };
        },
        convertCallbackFunWithManyArgs: function (func) {
            return function promiseGenerator() {
                var args = arr.from(arguments), self = this;
                return new Promise(function (resolve, reject) {
                    args.push(function () {
                        var args = arr.from(arguments), err = args.shift();
                        return err ? reject(err) : resolve(args);
                    });
                    func.apply(self, args);
                });
            };
        },
        _chainResolveNext: function resolveNext(promiseFuncs, prevResult, akku, resolve, reject) {
            var next = promiseFuncs.shift();
            if (!next)
                resolve(prevResult);
            else {
                try {
                    Promise.resolve(next(prevResult, akku)).then(function (result) {
                        resolveNext(promiseFuncs, result, akku, resolve, reject);
                    }).catch(function (err) {
                        reject(err);
                    });
                } catch (err) {
                    reject(err);
                }
            }
        },
        chain: function (promiseFuncs) {
            return new Promise(function (resolve, reject) {
                exports.promise._chainResolveNext(promiseFuncs.slice(), undefined, {}, resolve, reject);
            });
        }
    });
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));

;
(function (exports) {
    'use strict';
    var isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
    var events = exports.events = {
        makeEmitter: isNode ? function (obj) {
            if (obj.on && obj.removeListener)
                return obj;
            var events = require('events');
            require('util')._extend(obj, events.EventEmitter.prototype);
            events.EventEmitter.call(obj);
            return obj;
        } : function (obj) {
            if (obj.on && obj.removeListener)
                return obj;
            obj.listeners = {};
            obj.on = function (type, handler) {
                if (!handler)
                    return;
                if (!obj.listeners[type])
                    obj.listeners[type] = [];
                obj.listeners[type].push(handler);
            };
            obj.once = function (type, handler) {
                if (!handler)
                    return;
                function onceHandler() {
                    obj.removeListener(type, onceHandler);
                    handler.apply(this, arguments);
                }
                obj.on(type, onceHandler);
            };
            obj.removeListener = function (type, handler) {
                if (!obj.listeners[type])
                    return;
                obj.listeners[type] = obj.listeners[type].filter(function (h) {
                    return h !== handler;
                });
            };
            obj.removeAllListeners = function (type) {
                if (!obj.listeners[type])
                    return;
                obj.listeners[type] = [];
            };
            obj.emit = function () {
                var args = Array.prototype.slice.call(arguments);
                var type = args.shift();
                var handlers = obj.listeners[type];
                if (!handlers || !handlers.length)
                    return;
                handlers.forEach(function (handler) {
                    try {
                        handler.apply(null, args);
                    } catch (e) {
                        console.error('Error in event handler: %s', e.stack || String(e));
                    }
                });
            };
            return obj;
        }
    };
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));

;
(function (exports) {
    'use strict';
    var obj = exports.obj;
    var arr = exports.arr;
    var graph = exports.graph = {
        clone: function (graph) {
            var cloned = {};
            for (var id in graph)
                cloned[id] = graph[id].slice();
            return cloned;
        },
        without: function (graph, ids) {
            var cloned = {};
            for (var id in graph) {
                if (ids.indexOf(id) > -1)
                    continue;
                cloned[id] = graph[id].filter(function (id) {
                    return ids.indexOf(id) === -1;
                });
            }
            return cloned;
        },
        hull: function (graphMap, id, ignore, maxDepth) {
            return arr.uniq(arr.flatten(obj.values(graph.subgraphReachableBy(graphMap, id, ignore, maxDepth))));
        },
        subgraphReachableBy: function (graphMap, id, ignore, maxDepth) {
            maxDepth = maxDepth || 10;
            if (ignore)
                graphMap = graph.without(graphMap, ignore);
            var ids = [id], step = 0, subgraph = {};
            while (ids.length && step++ < maxDepth) {
                ids = ids.reduce(function (ids, id) {
                    return subgraph[id] ? ids : ids.concat(subgraph[id] = graphMap[id] || []);
                }, []);
            }
            return subgraph;
        },
        invert: function (g) {
            return Object.keys(g).reduce(function (inverted, k) {
                g[k].forEach(function (k2) {
                    if (!inverted[k2])
                        inverted[k2] = [k];
                    else
                        inverted[k2].push(k);
                });
                return inverted;
            }, {});
        },
        sortByReference: function (depGraph, startNode) {
            var all = [startNode].concat(graph.hull(depGraph, startNode)), seen = [], groups = [];
            while (seen.length !== all.length) {
                var depsRemaining = arr.withoutAll(all, seen).reduce(function (depsRemaining, node) {
                        depsRemaining[node] = arr.withoutAll(depGraph[node] || [], seen).length;
                        return depsRemaining;
                    }, {}), min = arr.withoutAll(all, seen).reduce(function (minNode, node) {
                        return depsRemaining[node] <= depsRemaining[minNode] ? node : minNode;
                    });
                if (depsRemaining[min] === 0) {
                    groups.push(Object.keys(depsRemaining).filter(function (key) {
                        return depsRemaining[key] === 0;
                    }));
                } else {
                    groups.push([min]);
                }
                seen = arr.flatten(groups);
            }
            return groups;
        },
        reduce: function (doFunc, graph, rootNode, carryOver, ignore, context) {
            var visitedNodes = ignore || [], index = 0;
            iterator(rootNode);
            return carryOver;
            function iterator(currentNode) {
                if (visitedNodes.indexOf(currentNode) > -1)
                    return;
                carryOver = doFunc.call(context, carryOver, currentNode, index++);
                visitedNodes = visitedNodes.concat([currentNode]);
                var next = arr.withoutAll(graph[currentNode] || [], visitedNodes);
                next.forEach(function (ea) {
                    return iterator(ea);
                });
            }
        }
    };
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));

;
(function (exports) {
    'use strict';
    var arr = exports.arr;
    if (!arr)
        throw new Error('messenger.js needs collection.js!');
    var fun = exports.fun;
    if (!fun)
        throw new Error('messenger.js needs function.js!');
    var string = exports.string;
    if (!string)
        throw new Error('messenger.js needs string.js!');
    var events = exports.events;
    if (!events)
        throw new Error('messenger.js needs events.js!');
    var obj = exports.obj;
    if (!obj)
        throw new Error('messenger.js needs object.js!');
    var OFFLINE = 'offline';
    var ONLINE = 'online';
    var CONNECTING = 'connecting';
    var messenger = exports.messenger = {
        OFFLINE: OFFLINE,
        ONLINE: ONLINE,
        CONNECTING: CONNECTING,
        create: function (spec) {
            var expectedMethods = [
                {
                    name: 'send',
                    args: [
                        'msg',
                        'callback'
                    ]
                },
                {
                    name: 'listen',
                    args: [
                        'messenger',
                        'callback'
                    ]
                },
                {
                    name: 'close',
                    args: [
                        'messenger',
                        'callback'
                    ]
                },
                {
                    name: 'isOnline',
                    args: []
                }
            ];
            var ignoredAttributes = expectedMethods.map(function (ea) {
                return ea.name;
            }).concat([
                'id',
                'sendHeartbeat',
                'heartbeatInterval',
                'ignoreUnknownMessages',
                'allowConcurrentSends',
                'sendTimeout',
                'services'
            ]);
            expectedMethods.forEach(function (exp) {
                if (spec[exp.name])
                    return;
                var msg = 'message implementation needs function ' + exp.name + '(' + exp.args.join(',') + ')';
                throw new Error(msg);
            });
            var heartbeatInterval = spec.sendHeartbeat && (spec.heartbeatInterval || 1000);
            var ignoreUnknownMessages = spec.hasOwnProperty('ignoreUnknownMessages') ? spec.ignoreUnknownMessages : false;
            var messenger = {
                _outgoing: [],
                _inflight: [],
                _id: spec.id || string.newUUID(),
                _ignoreUnknownMessages: ignoreUnknownMessages,
                _services: {},
                _messageCounter: 0,
                _messageResponseCallbacks: {},
                _whenOnlineCallbacks: [],
                _statusWatcherProc: null,
                _startHeartbeatProcessProc: null,
                _listenInProgress: null,
                _heartbeatInterval: heartbeatInterval,
                _status: OFFLINE,
                _runWhenOnlineCallbacks: function () {
                    var cbs = arr.clone(messenger._whenOnlineCallbacks);
                    messenger._whenOnlineCallbacks = [];
                    cbs.forEach(function (ea) {
                        try {
                            ea.call(null, null, messenger);
                        } catch (e) {
                            console.error('error in _runWhenOnlineCallbacks: %s', e);
                        }
                    });
                },
                _ensureStatusWatcher: function () {
                    if (messenger._statusWatcherProc)
                        return;
                    messenger._statusWatcherProc = setInterval(function () {
                        if (messenger.isOnline() && messenger._whenOnlineCallbacks.length)
                            messenger._runWhenOnlineCallbacks();
                        var prevStatus = messenger._status;
                        messenger._status = messenger.isOnline() ? ONLINE : OFFLINE;
                        if (messenger._status !== ONLINE && messenger._statusWatcherProc) {
                            messenger.reconnect();
                        }
                        if (messenger._status !== prevStatus && messenger.onStatusChange) {
                            messenger.onStatusChange();
                        }
                    }, 20);
                },
                _addMissingData: function (msg) {
                    if (!msg.target)
                        throw new Error('Message needs target!');
                    if (!msg.action)
                        throw new Error('Message needs action!');
                    if (!msg.data)
                        msg.data = null;
                    if (!msg.messageId)
                        msg.messageId = string.newUUID();
                    msg.sender = messenger.id();
                    msg.messageIndex = messenger._messageCounter++;
                    return msg;
                },
                _queueSend: function (msg, onReceiveFunc) {
                    if (onReceiveFunc && typeof onReceiveFunc !== 'function')
                        throw new Error('Expecing a when send callback, got: ' + onReceiveFunc);
                    messenger._outgoing.push([
                        msg,
                        onReceiveFunc
                    ]);
                },
                _deliverMessageQueue: function () {
                    if (!spec.allowConcurrentSends && messenger._inflight.length)
                        return;
                    var queued = messenger._outgoing.shift();
                    if (!queued)
                        return;
                    messenger._inflight.push(queued);
                    if (messenger.isOnline())
                        deliver(queued);
                    else
                        messenger.whenOnline(function () {
                            deliver(queued);
                        });
                    startTimeoutProc(queued);
                    if (spec.allowConcurrentSends && messenger._outgoing.length)
                        messenger._deliverMessageQueue();
                    function deliver(queued) {
                        if (messenger._inflight.indexOf(queued) === -1)
                            return;
                        var msg = queued[0], callback = queued[1];
                        if (callback)
                            messenger._messageResponseCallbacks[msg.messageId] = callback;
                        spec.send.call(messenger, msg, function (err) {
                            arr.remove(messenger._inflight, queued);
                            if (err)
                                onSendError(err, queued);
                            messenger._deliverMessageQueue();
                        });
                    }
                    function startTimeoutProc(queued) {
                        if (typeof spec.sendTimeout !== 'number')
                            return;
                        setTimeout(function () {
                            if (messenger._inflight.indexOf(queued) === -1)
                                return;
                            arr.remove(messenger._inflight, queued);
                            onSendError(new Error('Timeout sending message'), queued);
                            messenger._deliverMessageQueue();
                        }, spec.sendTimeout);
                    }
                    function onSendError(err, queued) {
                        var msg = queued[0], callback = queued[1];
                        delete messenger._messageResponseCallbacks[msg.messageId];
                        console.error(err);
                        callback && callback(err);
                    }
                },
                _startHeartbeatProcess: function () {
                    if (messenger._startHeartbeatProcessProc)
                        return;
                    messenger._startHeartbeatProcessProc = setTimeout(function () {
                        spec.sendHeartbeat.call(messenger, function (err, result) {
                            messenger._startHeartbeatProcessProc = null;
                            messenger._startHeartbeatProcess();
                        });
                    }, messenger._heartbeatInterval);
                },
                id: function () {
                    return messenger._id;
                },
                isOnline: function () {
                    return spec.isOnline.call(messenger);
                },
                heartbeatEnabled: function () {
                    return typeof messenger._heartbeatInterval === 'number';
                },
                listen: function (thenDo) {
                    if (messenger._listenInProgress)
                        return;
                    messenger._listenInProgress = true;
                    messenger._ensureStatusWatcher();
                    return spec.listen.call(messenger, function (err) {
                        messenger._listenInProgress = null;
                        thenDo && thenDo(err);
                        if (messenger.heartbeatEnabled())
                            messenger._startHeartbeatProcess();
                    });
                    return messenger;
                },
                reconnect: function () {
                    if (messenger._status === ONLINE)
                        return;
                    messenger.listen();
                    return messenger;
                },
                send: function (msg, onReceiveFunc) {
                    messenger._addMissingData(msg);
                    messenger._queueSend(msg, onReceiveFunc);
                    messenger._deliverMessageQueue();
                    return msg;
                },
                sendTo: function (target, action, data, onReceiveFunc) {
                    var msg = {
                        target: target,
                        action: action,
                        data: data
                    };
                    return messenger.send(msg, onReceiveFunc);
                },
                onMessage: function (msg) {
                    messenger.emit('message', msg);
                    if (msg.inResponseTo) {
                        var cb = messenger._messageResponseCallbacks[msg.inResponseTo];
                        if (cb && !msg.expectMoreResponses)
                            delete messenger._messageResponseCallbacks[msg.inResponseTo];
                        if (cb)
                            cb(null, msg);
                    } else {
                        var action = messenger._services[msg.action];
                        if (action) {
                            try {
                                action.call(null, msg, messenger);
                            } catch (e) {
                                var errmMsg = String(e.stack || e);
                                console.error('Error invoking service: ' + errmMsg);
                                messenger.answer(msg, { error: errmMsg });
                            }
                        } else if (!messenger._ignoreUnknownMessages) {
                            var err = new Error('messageNotUnderstood: ' + msg.action);
                            messenger.answer(msg, { error: String(err) });
                        }
                    }
                },
                answer: function (msg, data, expectMore, whenSend) {
                    if (typeof expectMore === 'function') {
                        whenSend = expectMore;
                        expectMore = false;
                    }
                    var answer = {
                        target: msg.sender,
                        action: msg.action + 'Result',
                        inResponseTo: msg.messageId,
                        data: data
                    };
                    if (expectMore)
                        answer.expectMoreResponses = true;
                    return messenger.send(answer, whenSend);
                },
                close: function (thenDo) {
                    clearInterval(messenger._statusWatcherProc);
                    messenger._statusWatcherProc = null;
                    spec.close.call(messenger, function (err) {
                        messenger._status = OFFLINE;
                        thenDo && thenDo(err);
                    });
                    return messenger;
                },
                whenOnline: function (thenDo) {
                    messenger._whenOnlineCallbacks.push(thenDo);
                    if (messenger.isOnline())
                        messenger._runWhenOnlineCallbacks();
                    return messenger;
                },
                outgoingMessages: function () {
                    return arr.pluck(messenger._inflight.concat(messenger._outgoing), 0);
                },
                addServices: function (serviceSpec) {
                    obj.extend(messenger._services, serviceSpec);
                    return messenger;
                }
            };
            if (spec.services)
                messenger.addServices(spec.services);
            events.makeEmitter(messenger);
            for (var name in spec) {
                if (ignoredAttributes.indexOf(name) === -1 && spec.hasOwnProperty(name)) {
                    messenger[name] = spec[name];
                }
            }
            return messenger;
        }
    };
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));

;
(function (exports) {
    'use strict';
    var isNodejs = typeof require !== 'undefined' && typeof process !== 'undefined';
    var WorkerSetup = {
        loadDependenciesBrowser: function loadDependenciesBrowser(options) {
            var me = typeof self !== 'undefined' ? self : this;
            importScripts.apply(me, options.scriptsToLoad || []);
        },
        loadDependenciesNodejs: function loadDependenciesNodejs(options) {
            var lv = global.lively || (global.lively = {});
            lv.lang = require(require('path').join(options.libLocation, 'index'));
        },
        initBrowserGlobals: function initBrowserGlobals(options) {
            remoteWorker.send = function (msg) {
                postMessage(msg);
            };
            var me = typeof self !== 'undefined' ? self : this;
            var Global = me.Global = me;
            Global.window = Global;
            Global.console = Global.console || function () {
                var c = {};
                [
                    'log',
                    'error',
                    'warn'
                ].forEach(function (name) {
                    c[name] = function () {
                        var string = arguments[0];
                        for (var i = 1; i < arguments.length; i++)
                            string = string.replace('%s', arguments[i]);
                        remoteWorker.send({
                            type: name,
                            message: [
                                '[',
                                name.toUpperCase(),
                                '] ',
                                string
                            ].join('')
                        });
                    };
                });
                return c;
            }();
        },
        initOnMessageHandler: function initOnMessageHandler(options) {
            if (remoteWorker.on)
                remoteWorker.on('message', onMessage);
            else
                remoteWorker.onmessage = onMessage;
            function onMessage(msg) {
                msg = msg.data.data ? msg.data : msg;
                if (remoteWorker.messenger)
                    remoteWorker.messenger.onMessage(msg);
                else if (msg.action == 'close') {
                    remoteWorker.send({
                        type: 'closed',
                        workerReady: false
                    });
                    remoteWorker.close();
                    return;
                }
            }
        },
        initWorkerInterface: function initWorkerInterface(options) {
            remoteWorker.callStringifiedFunction = function (stringifiedFunc, args, thenDo) {
                var func;
                try {
                    func = eval('(' + stringifiedFunc + ')');
                } catch (e) {
                    thenDo(new Error('Cannot create function from string: ' + e.stack || e));
                    return;
                }
                var usesCallback = func.length === args.length + 1;
                var whenDone = lively.lang.fun.once(function (err, result) {
                    remoteWorker.isBusy = false;
                    thenDo(err, result);
                });
                remoteWorker.isBusy = true;
                if (usesCallback)
                    args.push(whenDone);
                try {
                    var result = func.apply(remoteWorker, args.concat([whenDone]));
                } catch (e) {
                    whenDone(e, null);
                    return;
                }
                if (!usesCallback)
                    whenDone(null, result);
            };
            remoteWorker.httpRequest = function (options) {
                if (!options.url) {
                    console.log('Error, httpRequest needs url');
                    return;
                }
                var req = new XMLHttpRequest(), method = options.method || 'GET';
                function handleStateChange() {
                    if (req.readyState === 4) {
                        options.done && options.done(req);
                    }
                }
                req.onreadystatechange = handleStateChange;
                req.open(method, options.url);
                req.send();
            };
            remoteWorker.terminateIfNotBusyIn = function (ms) {
                setTimeout(function () {
                    if (remoteWorker.isBusy) {
                        remoteWorker.terminateIfNotBusyIn(ms);
                        return;
                    }
                    remoteWorker.send({
                        type: 'closed',
                        workerReady: false
                    });
                    remoteWorker.close();
                }, ms);
            };
        },
        initWorkerMessenger: function initWorkerMessenger(options) {
            if (!options.useMessenger)
                return null;
            if (!lively.lang.messenger)
                throw new Error('worker.create requires messenger.js to be loaded!');
            if (!lively.lang.events)
                throw new Error('worker.create requires events.js to be loaded!');
            return remoteWorker.messenger = lively.lang.messenger.create({
                services: {
                    remoteEval: function (msg, messenger) {
                        var result;
                        try {
                            result = eval(msg.data.expr);
                        } catch (e) {
                            result = e.stack || e;
                        }
                        messenger.answer(msg, { result: String(result) });
                    },
                    run: function (msg, messenger) {
                        var funcString = msg.data.func, args = msg.data.args;
                        if (!funcString) {
                            messenger.answer(msg, { error: 'no funcString' });
                            return;
                        }
                        remoteWorker.callStringifiedFunction(funcString, args, function (err, result) {
                            messenger.answer(msg, {
                                error: err ? String(err) : null,
                                result: result
                            });
                        });
                    },
                    close: function (msg, messenger) {
                        messenger.answer(msg, { status: 'OK' });
                        remoteWorker.send({
                            type: 'closed',
                            workerReady: false
                        });
                        remoteWorker.close();
                    }
                },
                isOnline: function () {
                    return true;
                },
                send: function (msg, whenSend) {
                    remoteWorker.send(msg);
                    whenSend();
                },
                listen: function (whenListening) {
                    whenListening();
                },
                close: function (whenClosed) {
                    remoteWorker.send({
                        type: 'closed',
                        workerReady: false
                    });
                    remoteWorker.close();
                }
            });
        }
    };
    var BrowserWorker = {
        create: function (options) {
            options = options || {};
            if (!options.libLocation && !options.scriptsToLoad) {
                var workerScript = document.querySelector('script[src$="worker.js"]');
                if (!workerScript)
                    throw new Error('Cannot find library path to start worker. Use worker.create({libLocation: "..."}) to explicitly define the path!');
                options.libLocation = workerScript.src.replace(/worker.js$/, '');
            }
            var workerSetupCode = String(workerSetupFunction).replace('__FUNCTIONDECLARATIONS__', [
                WorkerSetup.initBrowserGlobals,
                WorkerSetup.loadDependenciesBrowser,
                WorkerSetup.initOnMessageHandler,
                WorkerSetup.initWorkerInterface,
                WorkerSetup.initWorkerMessenger
            ].join('\n'));
            var workerCode = '(' + workerSetupCode + ')();';
            var worker = new Worker(makeDataURI(workerCode));
            init(options, worker);
            return worker;
            function init(options, worker) {
                exports.events.makeEmitter(worker);
                if (!options.scriptsToLoad) {
                    options.scriptsToLoad = [
                        'base.js',
                        'events.js',
                        'object.js',
                        'collection.js',
                        'function.js',
                        'string.js',
                        'number.js',
                        'date.js',
                        'messenger.js',
                        'worker.js'
                    ].map(function (ea) {
                        return options.libLocation + ea;
                    });
                }
                var workerOptions = Object.keys(options).reduce(function (opts, key) {
                    if (typeof options[key] !== 'function')
                        opts[key] = options[key];
                    return opts;
                }, {});
                worker.onmessage = function (evt) {
                    if (evt.data.workerReady !== undefined) {
                        worker.ready = !!evt.data.workerReady;
                        if (worker.ready)
                            worker.emit('ready');
                        else
                            worker.emit('close');
                    } else
                        worker.emit('message', evt.data);
                };
                worker.errors = [];
                worker.onerror = function (evt) {
                    console.error(evt);
                    worker.errors.push(evt);
                    worker.emit('error', evt);
                };
                worker.postMessage({
                    action: 'setup',
                    options: workerOptions
                });
            }
            function workerSetupFunction() {
                var remoteWorker = self;
                remoteWorker.onmessage = function (evt) {
                    if (evt.data.action !== 'setup') {
                        throw new Error('expected setup to be first message but got ' + JSON.stringify(evt.data));
                    }
                    var options = evt.data.options || {};
                    initBrowserGlobals(options);
                    loadDependenciesBrowser(options);
                    initOnMessageHandler(options);
                    initWorkerInterface(options);
                    initWorkerMessenger(options);
                    postMessage({ workerReady: true });
                };
                __FUNCTIONDECLARATIONS__;
            }
            function makeDataURI(codeToInclude) {
                var blob;
                try {
                    blob = new Blob([codeToInclude], { type: 'text/javascript' });
                } catch (e) {
                    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
                    blob = new BlobBuilder();
                    blob.append(codeToInclude);
                    blob = blob.getBlob();
                }
                var urlInterface = typeof webkitURL !== 'undefined' ? webkitURL : URL;
                return urlInterface.createObjectURL(blob);
            }
        }
    };
    var NodejsWorker = {
        debug: false,
        initCodeFileCreated: false,
        create: function (options) {
            options = options || {};
            var workerProc;
            var worker = exports.events.makeEmitter({
                ready: false,
                errors: [],
                postMessage: function (msg) {
                    if (!workerProc) {
                        worker.emit('error', new Error('nodejs worker process not yet created'));
                        return;
                    }
                    if (!worker.ready) {
                        worker.emit('error', new Error('nodejs worker process not ready or already closed'));
                        return;
                    }
                    workerProc.send(msg);
                }
            });
            NodejsWorker.startWorker(options, function (err, _workerProc) {
                if (err) {
                    worker.ready = false;
                    worker.emit('error', err);
                    return;
                }
                workerProc = _workerProc;
                workerProc.on('message', function (m) {
                    NodejsWorker.debug && console.log('[WORKER PARENT] got message:', m);
                    worker.emit('message', m);
                });
                workerProc.on('close', function () {
                    console.log('[WORKER PARENT] worker closed');
                    worker.emit('close');
                });
                workerProc.on('error', function (err) {
                    console.log('[WORKER PARENT] error ', err);
                    worker.errors.push(err);
                    worker.emit('error', err);
                });
                worker.ready = true;
                worker.emit('ready');
            });
            return worker;
        },
        workerSetupFunction: function workerSetupFunction() {
            var remoteWorker = process;
            var debug = true;
            var close = false;
            debug && console.log('[WORKER] Starting init');
            remoteWorker.on('message', function (msg) {
                if (msg.action !== 'setup') {
                    throw new Error('expected setup to be first message but got ' + JSON.stringify(msg.data));
                }
                remoteWorker.removeAllListeners('message');
                var options = msg.data.options || {};
                debug && console.log('[WORKER] running setup with options', options);
                loadDependenciesNodejs(options);
                initOnMessageHandler(options);
                initWorkerInterface(options);
                initWorkerMessenger(options);
                remoteWorker.send({ workerReady: true });
            });
            __FUNCTIONDECLARATIONS__;
        },
        ensureInitCodeFile: function (options, initCode, thenDo) {
            var path = require('path');
            var os = require('os');
            var fs = require('fs');
            var workerTmpDir = path.join(os.tmpDir(), 'lively-nodejs-workers/');
            var fn = path.join(workerTmpDir, 'nodejs-worker-init.js');
            if (!NodejsWorker.initCodeFileCreated)
                NodejsWorker.createWorkerCodeFile(options, fn, initCode, thenDo);
            else
                fs.exists(fn, function (exists) {
                    if (exists)
                        thenDo(null, fn);
                    else
                        NodejsWorker.createWorkerCodeFile(options, fn, initCode, thenDo);
                });
        },
        createWorkerCodeFile: function (options, fileName, initCode, thenDo) {
            var path = require('path');
            var fs = require('fs');
            var exec = require('child_process').exec;
            exec('mkdir -p ' + path.dirname(fileName), function (code, out, err) {
                if (code) {
                    thenDo(new Error([
                        '[WORKER PARENT] Could not create worker temp dir:',
                        out,
                        err
                    ].join('\n')));
                    return;
                }
                fs.writeFile(fileName, initCode, function (err) {
                    NodejsWorker.debug && console.log('worker code file %s created', fileName);
                    NodejsWorker.initCodeFileCreated = true;
                    thenDo(err, fileName);
                });
            });
        },
        startWorker: function (options, thenDo) {
            var util = require('util');
            var fork = require('child_process').fork;
            var workerSetupCode = String(NodejsWorker.workerSetupFunction).replace('__FUNCTIONDECLARATIONS__', [
                WorkerSetup.loadDependenciesNodejs,
                WorkerSetup.initOnMessageHandler,
                WorkerSetup.initWorkerInterface,
                WorkerSetup.initWorkerMessenger
            ].join('\n'));
            var initCode = util.format('(%s)();\n', workerSetupCode);
            NodejsWorker.ensureInitCodeFile(options, initCode, function (err, codeFileName) {
                if (err)
                    return thenDo(err);
                var worker = fork(codeFileName, {});
                NodejsWorker.debug && console.log('worker forked');
                worker.on('message', function (m) {
                    if (m.action === 'pong')
                        console.log('[WORKER pong] ', m);
                    else if (m.action === 'log')
                        console.log('[Message from WORKER] ', m.data);
                });
                worker.once('message', function (m) {
                    NodejsWorker.debug && console.log('worker setup done');
                    thenDo(null, worker, m);
                });
                worker.on('close', function () {
                    NodejsWorker.debug && console.log('[WORKER PARENT] worker closed');
                });
                worker.send({
                    action: 'setup',
                    data: { options: options }
                });
                global.WORKER = worker;
            });
        }
    };
    var worker = exports.worker = {
        fork: function (options, workerFunc, thenDo) {
            if (!thenDo) {
                thenDo = workerFunc;
                workerFunc = options;
                options = null;
            }
            options = options || {};
            var args = options.args || [];
            var w = worker.create(options);
            w.run.apply(w, [workerFunc].concat(args).concat(thenDo));
            return w;
        },
        create: function (options) {
            options = options || {};
            options.useMessenger = true;
            if (!exports.messenger)
                throw new Error('worker.create requires messenger.js to be loaded!');
            if (!exports.events)
                throw new Error('worker.create requires events.js to be loaded!');
            if (!exports.obj)
                throw new Error('worker.create requires object.js to be loaded!');
            var workerId = options.workerId || exports.string.newUUID();
            var messenger = exports.messenger.create({
                sendTimeout: 5000,
                send: function (msg, whenSend) {
                    messenger.worker.postMessage(msg);
                    whenSend();
                },
                listen: function (whenListening) {
                    var w = messenger.worker = isNodejs ? NodejsWorker.create(options) : BrowserWorker.create(options);
                    w.on('message', function (msg) {
                        messenger.onMessage(msg);
                    });
                    w.on('ready', function () {
                        NodejsWorker.debug && console.log('WORKER READY!!!');
                    });
                    w.on('close', function () {
                        NodejsWorker.debug && console.log('WORKER CLOSED...!!!');
                    });
                    w.once('ready', whenListening);
                },
                close: function (whenClosed) {
                    if (!messenger.worker.ready)
                        return whenClosed(null);
                    return messenger.sendTo(workerId, 'close', {}, function (err, answer) {
                        err = err || answer.data.error;
                        err && console.error('Error in worker messenger close: ' + err.stack || err);
                        if (err)
                            whenClosed(err);
                        else {
                            var closed = false;
                            messenger.worker.once('close', function () {
                                closed = true;
                            });
                            exports.fun.waitFor(1000, function () {
                                return !!closed;
                            }, whenClosed);
                        }
                    });
                },
                isOnline: function () {
                    return messenger.worker && messenger.worker.ready;
                }
            });
            exports.obj.extend(messenger, {
                eval: function (code, thenDo) {
                    messenger.sendTo(workerId, 'remoteEval', { expr: code }, function (err, answer) {
                        thenDo(err, answer ? answer.data.result : null);
                    });
                },
                run: function () {
                    var args = Array.prototype.slice.call(arguments), workerFunc = args.shift(), thenDo = args.pop();
                    if (typeof workerFunc !== 'function')
                        throw new Error('run: no function that should run in worker passed');
                    if (typeof thenDo !== 'function')
                        throw new Error('run: no callback passed');
                    return messenger.sendTo(workerId, 'run', {
                        func: String(workerFunc),
                        args: args
                    }, function (err, answer) {
                        thenDo(err || answer.data.error, answer ? answer.data.result : null);
                    });
                }
            });
            messenger.listen();
            return messenger;
        }
    };
}(typeof lively !== 'undefined' && lively.lang ? lively.lang : {}));
})();


(function() {
  var module = undefined, require = undefined;
  (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.acorn = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

"use strict";

var _tokentype = _dereq_("./tokentype");

var _state = _dereq_("./state");

var _parseutil = _dereq_("./parseutil");

var pp = _state.Parser.prototype;

// Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.

pp.checkPropClash = function (prop, propHash) {
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) return;
  var key = prop.key;var name = undefined;
  switch (key.type) {
    case "Identifier":
      name = key.name;break;
    case "Literal":
      name = String(key.value);break;
    default:
      return;
  }
  var kind = prop.kind;

  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
      propHash.proto = true;
    }
    return;
  }
  name = "$" + name;
  var other = propHash[name];
  if (other) {
    var isGetSet = kind !== "init";
    if ((this.strict || isGetSet) && other[kind] || !(isGetSet ^ other.init)) this.raiseRecoverable(key.start, "Redefinition of property");
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }
  other[kind] = true;
};

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.

// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).

pp.parseExpression = function (noIn, refDestructuringErrors) {
  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
  if (this.type === _tokentype.types.comma) {
    var node = this.startNodeAt(startPos, startLoc);
    node.expressions = [expr];
    while (this.eat(_tokentype.types.comma)) node.expressions.push(this.parseMaybeAssign(noIn, refDestructuringErrors));
    return this.finishNode(node, "SequenceExpression");
  }
  return expr;
};

// Parse an assignment expression. This includes applications of
// operators like `+=`.

pp.parseMaybeAssign = function (noIn, refDestructuringErrors, afterLeftParse) {
  if (this.inGenerator && this.isContextual("yield")) return this.parseYield();

  var ownDestructuringErrors = false;
  if (!refDestructuringErrors) {
    refDestructuringErrors = new _parseutil.DestructuringErrors();
    ownDestructuringErrors = true;
  }
  var startPos = this.start,
      startLoc = this.startLoc;
  if (this.type == _tokentype.types.parenL || this.type == _tokentype.types.name) this.potentialArrowAt = this.start;
  var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
  if (afterLeftParse) left = afterLeftParse.call(this, left, startPos, startLoc);
  if (this.type.isAssign) {
    this.checkPatternErrors(refDestructuringErrors, true);
    if (!ownDestructuringErrors) _parseutil.DestructuringErrors.call(refDestructuringErrors);
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    node.left = this.type === _tokentype.types.eq ? this.toAssignable(left) : left;
    refDestructuringErrors.shorthandAssign = 0; // reset because shorthand default was used correctly
    this.checkLVal(left);
    this.next();
    node.right = this.parseMaybeAssign(noIn);
    return this.finishNode(node, "AssignmentExpression");
  } else {
    if (ownDestructuringErrors) this.checkExpressionErrors(refDestructuringErrors, true);
  }
  return left;
};

// Parse a ternary conditional (`?:`) operator.

pp.parseMaybeConditional = function (noIn, refDestructuringErrors) {
  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseExprOps(noIn, refDestructuringErrors);
  if (this.checkExpressionErrors(refDestructuringErrors)) return expr;
  if (this.eat(_tokentype.types.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(_tokentype.types.colon);
    node.alternate = this.parseMaybeAssign(noIn);
    return this.finishNode(node, "ConditionalExpression");
  }
  return expr;
};

// Start the precedence parser.

pp.parseExprOps = function (noIn, refDestructuringErrors) {
  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refDestructuringErrors, false);
  if (this.checkExpressionErrors(refDestructuringErrors)) return expr;
  return this.parseExprOp(expr, startPos, startLoc, -1, noIn);
};

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.

pp.parseExprOp = function (left, leftStartPos, leftStartLoc, minPrec, noIn) {
  var prec = this.type.binop;
  if (prec != null && (!noIn || this.type !== _tokentype.types._in)) {
    if (prec > minPrec) {
      var logical = this.type === _tokentype.types.logicalOR || this.type === _tokentype.types.logicalAND;
      var op = this.value;
      this.next();
      var startPos = this.start,
          startLoc = this.startLoc;
      var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical);
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn);
    }
  }
  return left;
};

pp.buildBinary = function (startPos, startLoc, left, right, op, logical) {
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.operator = op;
  node.right = right;
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
};

// Parse unary operators, both prefix and postfix.

pp.parseMaybeUnary = function (refDestructuringErrors, sawUnary) {
  var startPos = this.start,
      startLoc = this.startLoc,
      expr = undefined;
  if (this.type.prefix) {
    var node = this.startNode(),
        update = this.type === _tokentype.types.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(null, true);
    this.checkExpressionErrors(refDestructuringErrors, true);
    if (update) this.checkLVal(node.argument);else if (this.strict && node.operator === "delete" && node.argument.type === "Identifier") this.raiseRecoverable(node.start, "Deleting local variable in strict mode");else sawUnary = true;
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) return expr;
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = this.value;
      node.prefix = false;
      node.argument = expr;
      this.checkLVal(expr);
      this.next();
      expr = this.finishNode(node, "UpdateExpression");
    }
  }

  if (!sawUnary && this.eat(_tokentype.types.starstar)) return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false);else return expr;
};

// Parse call, dot, and `[]`-subscript expressions.

pp.parseExprSubscripts = function (refDestructuringErrors) {
  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseExprAtom(refDestructuringErrors);
  var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")";
  if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts) return expr;
  return this.parseSubscripts(expr, startPos, startLoc);
};

pp.parseSubscripts = function (base, startPos, startLoc, noCalls) {
  for (;;) {
    if (this.eat(_tokentype.types.dot)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      node.property = this.parseIdent(true);
      node.computed = false;
      base = this.finishNode(node, "MemberExpression");
    } else if (this.eat(_tokentype.types.bracketL)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      node.property = this.parseExpression();
      node.computed = true;
      this.expect(_tokentype.types.bracketR);
      base = this.finishNode(node, "MemberExpression");
    } else if (!noCalls && this.eat(_tokentype.types.parenL)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.callee = base;
      node.arguments = this.parseExprList(_tokentype.types.parenR, false);
      base = this.finishNode(node, "CallExpression");
    } else if (this.type === _tokentype.types.backQuote) {
      var node = this.startNodeAt(startPos, startLoc);
      node.tag = base;
      node.quasi = this.parseTemplate();
      base = this.finishNode(node, "TaggedTemplateExpression");
    } else {
      return base;
    }
  }
};

// Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.

pp.parseExprAtom = function (refDestructuringErrors) {
  var node = undefined,
      canBeArrow = this.potentialArrowAt == this.start;
  switch (this.type) {
    case _tokentype.types._super:
      if (!this.inFunction) this.raise(this.start, "'super' outside of function or class");

    case _tokentype.types._this:
      var type = this.type === _tokentype.types._this ? "ThisExpression" : "Super";
      node = this.startNode();
      this.next();
      return this.finishNode(node, type);

    case _tokentype.types.name:
      var startPos = this.start,
          startLoc = this.startLoc;
      var id = this.parseIdent(this.type !== _tokentype.types.name);
      if (canBeArrow && !this.canInsertSemicolon() && this.eat(_tokentype.types.arrow)) return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id]);
      return id;

    case _tokentype.types.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = { pattern: value.pattern, flags: value.flags };
      return node;

    case _tokentype.types.num:case _tokentype.types.string:
      return this.parseLiteral(this.value);

    case _tokentype.types._null:case _tokentype.types._true:case _tokentype.types._false:
      node = this.startNode();
      node.value = this.type === _tokentype.types._null ? null : this.type === _tokentype.types._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal");

    case _tokentype.types.parenL:
      return this.parseParenAndDistinguishExpression(canBeArrow);

    case _tokentype.types.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(_tokentype.types.bracketR, true, true, refDestructuringErrors);
      return this.finishNode(node, "ArrayExpression");

    case _tokentype.types.braceL:
      return this.parseObj(false, refDestructuringErrors);

    case _tokentype.types._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, false);

    case _tokentype.types._class:
      return this.parseClass(this.startNode(), false);

    case _tokentype.types._new:
      return this.parseNew();

    case _tokentype.types.backQuote:
      return this.parseTemplate();

    default:
      this.unexpected();
  }
};

pp.parseLiteral = function (value) {
  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  this.next();
  return this.finishNode(node, "Literal");
};

pp.parseParenExpression = function () {
  this.expect(_tokentype.types.parenL);
  var val = this.parseExpression();
  this.expect(_tokentype.types.parenR);
  return val;
};

pp.parseParenAndDistinguishExpression = function (canBeArrow) {
  var startPos = this.start,
      startLoc = this.startLoc,
      val = undefined;
  if (this.options.ecmaVersion >= 6) {
    this.next();

    var innerStartPos = this.start,
        innerStartLoc = this.startLoc;
    var exprList = [],
        first = true;
    var refDestructuringErrors = new _parseutil.DestructuringErrors(),
        spreadStart = undefined,
        innerParenStart = undefined;
    while (this.type !== _tokentype.types.parenR) {
      first ? first = false : this.expect(_tokentype.types.comma);
      if (this.type === _tokentype.types.ellipsis) {
        spreadStart = this.start;
        exprList.push(this.parseParenItem(this.parseRest()));
        break;
      } else {
        if (this.type === _tokentype.types.parenL && !innerParenStart) {
          innerParenStart = this.start;
        }
        exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
      }
    }
    var innerEndPos = this.start,
        innerEndLoc = this.startLoc;
    this.expect(_tokentype.types.parenR);

    if (canBeArrow && !this.canInsertSemicolon() && this.eat(_tokentype.types.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, true);
      if (innerParenStart) this.unexpected(innerParenStart);
      return this.parseParenArrowList(startPos, startLoc, exprList);
    }

    if (!exprList.length) this.unexpected(this.lastTokStart);
    if (spreadStart) this.unexpected(spreadStart);
    this.checkExpressionErrors(refDestructuringErrors, true);

    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }

  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression");
  } else {
    return val;
  }
};

pp.parseParenItem = function (item) {
  return item;
};

pp.parseParenArrowList = function (startPos, startLoc, exprList) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList);
};

// New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.

var empty = [];

pp.parseNew = function () {
  var node = this.startNode();
  var meta = this.parseIdent(true);
  if (this.options.ecmaVersion >= 6 && this.eat(_tokentype.types.dot)) {
    node.meta = meta;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target") this.raiseRecoverable(node.property.start, "The only valid meta property for new is new.target");
    if (!this.inFunction) this.raiseRecoverable(node.start, "new.target can only be used in functions");
    return this.finishNode(node, "MetaProperty");
  }
  var startPos = this.start,
      startLoc = this.startLoc;
  node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
  if (this.eat(_tokentype.types.parenL)) node.arguments = this.parseExprList(_tokentype.types.parenR, false);else node.arguments = empty;
  return this.finishNode(node, "NewExpression");
};

// Parse template expression.

pp.parseTemplateElement = function () {
  var elem = this.startNode();
  elem.value = {
    raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, '\n'),
    cooked: this.value
  };
  this.next();
  elem.tail = this.type === _tokentype.types.backQuote;
  return this.finishNode(elem, "TemplateElement");
};

pp.parseTemplate = function () {
  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement();
  node.quasis = [curElt];
  while (!curElt.tail) {
    this.expect(_tokentype.types.dollarBraceL);
    node.expressions.push(this.parseExpression());
    this.expect(_tokentype.types.braceR);
    node.quasis.push(curElt = this.parseTemplateElement());
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral");
};

// Parse an object literal or binding pattern.

pp.parseObj = function (isPattern, refDestructuringErrors) {
  var node = this.startNode(),
      first = true,
      propHash = {};
  node.properties = [];
  this.next();
  while (!this.eat(_tokentype.types.braceR)) {
    if (!first) {
      this.expect(_tokentype.types.comma);
      if (this.afterTrailingComma(_tokentype.types.braceR)) break;
    } else first = false;

    var prop = this.startNode(),
        isGenerator = undefined,
        startPos = undefined,
        startLoc = undefined;
    if (this.options.ecmaVersion >= 6) {
      prop.method = false;
      prop.shorthand = false;
      if (isPattern || refDestructuringErrors) {
        startPos = this.start;
        startLoc = this.startLoc;
      }
      if (!isPattern) isGenerator = this.eat(_tokentype.types.star);
    }
    this.parsePropertyName(prop);
    this.parsePropertyValue(prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors);
    this.checkPropClash(prop, propHash);
    node.properties.push(this.finishNode(prop, "Property"));
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
};

pp.parsePropertyValue = function (prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors) {
  if (this.eat(_tokentype.types.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === _tokentype.types.parenL) {
    if (isPattern) this.unexpected();
    prop.kind = "init";
    prop.method = true;
    prop.value = this.parseMethod(isGenerator);
  } else if (this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && this.type != _tokentype.types.comma && this.type != _tokentype.types.braceR) {
    if (isGenerator || isPattern) this.unexpected();
    prop.kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
    var paramCount = prop.kind === "get" ? 0 : 1;
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start;
      if (prop.kind === "get") this.raiseRecoverable(start, "getter should have no params");else this.raiseRecoverable(start, "setter should have exactly one param");
    }
    if (prop.kind === "set" && prop.value.params[0].type === "RestElement") this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    if (this.keywords.test(prop.key.name) || (this.strict ? this.reservedWordsStrictBind : this.reservedWords).test(prop.key.name) || this.inGenerator && prop.key.name == "yield") this.raiseRecoverable(prop.key.start, "'" + prop.key.name + "' can not be used as shorthand property");
    prop.kind = "init";
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
    } else if (this.type === _tokentype.types.eq && refDestructuringErrors) {
      if (!refDestructuringErrors.shorthandAssign) refDestructuringErrors.shorthandAssign = this.start;
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
    } else {
      prop.value = prop.key;
    }
    prop.shorthand = true;
  } else this.unexpected();
};

pp.parsePropertyName = function (prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(_tokentype.types.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(_tokentype.types.bracketR);
      return prop.key;
    } else {
      prop.computed = false;
    }
  }
  return prop.key = this.type === _tokentype.types.num || this.type === _tokentype.types.string ? this.parseExprAtom() : this.parseIdent(true);
};

// Initialize empty function node.

pp.initFunction = function (node) {
  node.id = null;
  if (this.options.ecmaVersion >= 6) {
    node.generator = false;
    node.expression = false;
  }
};

// Parse object or class method.

pp.parseMethod = function (isGenerator) {
  var node = this.startNode(),
      oldInGen = this.inGenerator;
  this.inGenerator = isGenerator;
  this.initFunction(node);
  this.expect(_tokentype.types.parenL);
  node.params = this.parseBindingList(_tokentype.types.parenR, false, false);
  if (this.options.ecmaVersion >= 6) node.generator = isGenerator;
  this.parseFunctionBody(node, false);
  this.inGenerator = oldInGen;
  return this.finishNode(node, "FunctionExpression");
};

// Parse arrow function expression with given parameters.

pp.parseArrowExpression = function (node, params) {
  var oldInGen = this.inGenerator;
  this.inGenerator = false;
  this.initFunction(node);
  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true);
  this.inGenerator = oldInGen;
  return this.finishNode(node, "ArrowFunctionExpression");
};

// Parse function body and check parameters.

pp.parseFunctionBody = function (node, isArrowFunction) {
  var isExpression = isArrowFunction && this.type !== _tokentype.types.braceL;

  if (isExpression) {
    node.body = this.parseMaybeAssign();
    node.expression = true;
  } else {
    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    var oldInFunc = this.inFunction,
        oldLabels = this.labels;
    this.inFunction = true;this.labels = [];
    node.body = this.parseBlock(true);
    node.expression = false;
    this.inFunction = oldInFunc;this.labels = oldLabels;
  }

  // If this is a strict mode function, verify that argument names
  // are not repeated, and it does not try to bind the words `eval`
  // or `arguments`.
  if (this.strict || !isExpression && node.body.body.length && this.isUseStrict(node.body.body[0])) {
    var oldStrict = this.strict;
    this.strict = true;
    if (node.id) this.checkLVal(node.id, true);
    this.checkParams(node);
    this.strict = oldStrict;
  } else if (isArrowFunction) {
    this.checkParams(node);
  }
};

// Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.

pp.checkParams = function (node) {
  var nameHash = {};
  for (var i = 0; i < node.params.length; i++) {
    this.checkLVal(node.params[i], true, nameHash);
  }
};

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

pp.parseExprList = function (close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var elts = [],
      first = true;
  while (!this.eat(close)) {
    if (!first) {
      this.expect(_tokentype.types.comma);
      if (allowTrailingComma && this.afterTrailingComma(close)) break;
    } else first = false;

    var elt = undefined;
    if (allowEmpty && this.type === _tokentype.types.comma) elt = null;else if (this.type === _tokentype.types.ellipsis) {
      elt = this.parseSpread(refDestructuringErrors);
      if (this.type === _tokentype.types.comma && refDestructuringErrors && !refDestructuringErrors.trailingComma) {
        refDestructuringErrors.trailingComma = this.lastTokStart;
      }
    } else elt = this.parseMaybeAssign(false, refDestructuringErrors);
    elts.push(elt);
  }
  return elts;
};

// Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.

pp.parseIdent = function (liberal) {
  var node = this.startNode();
  if (liberal && this.options.allowReserved == "never") liberal = false;
  if (this.type === _tokentype.types.name) {
    if (!liberal && (this.strict ? this.reservedWordsStrict : this.reservedWords).test(this.value) && (this.options.ecmaVersion >= 6 || this.input.slice(this.start, this.end).indexOf("\\") == -1)) this.raiseRecoverable(this.start, "The keyword '" + this.value + "' is reserved");
    if (!liberal && this.inGenerator && this.value === "yield") this.raiseRecoverable(this.start, "Can not use 'yield' as identifier inside a generator");
    node.name = this.value;
  } else if (liberal && this.type.keyword) {
    node.name = this.type.keyword;
  } else {
    this.unexpected();
  }
  this.next();
  return this.finishNode(node, "Identifier");
};

// Parses yield expression inside generator.

pp.parseYield = function () {
  var node = this.startNode();
  this.next();
  if (this.type == _tokentype.types.semi || this.canInsertSemicolon() || this.type != _tokentype.types.star && !this.type.startsExpr) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(_tokentype.types.star);
    node.argument = this.parseMaybeAssign();
  }
  return this.finishNode(node, "YieldExpression");
};

},{"./parseutil":9,"./state":10,"./tokentype":14}],2:[function(_dereq_,module,exports){
// Reserved word lists for various dialects of the language

"use strict";

exports.__esModule = true;
exports.isIdentifierStart = isIdentifierStart;
exports.isIdentifierChar = isIdentifierChar;
var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  7: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
};

exports.reservedWords = reservedWords;
// And the keywords

var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

var keywords = {
  5: ecma5AndLessKeywords,
  6: ecma5AndLessKeywords + " const class extends export import super"
};

exports.keywords = keywords;
// ## Character categories

// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
// Generated by `bin/generate-identifier-regex.js`.

var nonASCIIidentifierStartChars = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢴऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿕ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞭꞰ-ꞷꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭥꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";
var nonASCIIidentifierChars = "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣣ-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఃా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഁ-ഃാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳸᳹᷀-᷵᷼-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-꣄꣐-꣙꣠-꣱꤀-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿";

var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

// These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range. They were
// generated by bin/generate-identifier-regex.js
var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 99, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 785, 52, 76, 44, 33, 24, 27, 35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 85, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 287, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 86, 25, 391, 63, 32, 0, 449, 56, 1288, 921, 103, 110, 18, 195, 2749, 1070, 4050, 582, 8634, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67, 12, 16481, 1, 3071, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 1340, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12, 221, 3, 5761, 10591, 541];
var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52, 0, 13, 2, 49, 13, 10, 2, 4, 9, 83, 11, 168, 11, 6, 9, 7, 3, 57, 0, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 316, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 423, 9, 20855, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 3617, 6, 792618, 239];

// This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.
function isInAstralSet(code, set) {
  var pos = 0x10000;
  for (var i = 0; i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) return false;
    pos += set[i + 1];
    if (pos >= code) return true;
  }
}

// Test whether a given character code starts an identifier.

function isIdentifierStart(code, astral) {
  if (code < 65) return code === 36;
  if (code < 91) return true;
  if (code < 97) return code === 95;
  if (code < 123) return true;
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
  if (astral === false) return false;
  return isInAstralSet(code, astralIdentifierStartCodes);
}

// Test whether a given character is part of an identifier.

function isIdentifierChar(code, astral) {
  if (code < 48) return code === 36;
  if (code < 58) return true;
  if (code < 65) return false;
  if (code < 91) return true;
  if (code < 97) return code === 95;
  if (code < 123) return true;
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
  if (astral === false) return false;
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
}

},{}],3:[function(_dereq_,module,exports){
// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
// various contributors and released under an MIT license.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/ternjs/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/ternjs/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js

"use strict";

exports.__esModule = true;
exports.parse = parse;
exports.parseExpressionAt = parseExpressionAt;
exports.tokenizer = tokenizer;

var _state = _dereq_("./state");

_dereq_("./parseutil");

_dereq_("./statement");

_dereq_("./lval");

_dereq_("./expression");

_dereq_("./location");

exports.Parser = _state.Parser;
exports.plugins = _state.plugins;

var _options = _dereq_("./options");

exports.defaultOptions = _options.defaultOptions;

var _locutil = _dereq_("./locutil");

exports.Position = _locutil.Position;
exports.SourceLocation = _locutil.SourceLocation;
exports.getLineInfo = _locutil.getLineInfo;

var _node = _dereq_("./node");

exports.Node = _node.Node;

var _tokentype = _dereq_("./tokentype");

exports.TokenType = _tokentype.TokenType;
exports.tokTypes = _tokentype.types;

var _tokencontext = _dereq_("./tokencontext");

exports.TokContext = _tokencontext.TokContext;
exports.tokContexts = _tokencontext.types;

var _identifier = _dereq_("./identifier");

exports.isIdentifierChar = _identifier.isIdentifierChar;
exports.isIdentifierStart = _identifier.isIdentifierStart;

var _tokenize = _dereq_("./tokenize");

exports.Token = _tokenize.Token;

var _whitespace = _dereq_("./whitespace");

exports.isNewLine = _whitespace.isNewLine;
exports.lineBreak = _whitespace.lineBreak;
exports.lineBreakG = _whitespace.lineBreakG;
var version = "3.1.0";

exports.version = version;
// The main exported interface (under `self.acorn` when in the
// browser) is a `parse` function that takes a code string and
// returns an abstract syntax tree as specified by [Mozilla parser
// API][api].
//
// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

function parse(input, options) {
  return new _state.Parser(options, input).parse();
}

// This function tries to parse a single expression at a given
// offset in a string. Useful for parsing mixed-language formats
// that embed JavaScript expressions.

function parseExpressionAt(input, pos, options) {
  var p = new _state.Parser(options, input, pos);
  p.nextToken();
  return p.parseExpression();
}

// Acorn is organized as a tokenizer and a recursive-descent parser.
// The `tokenizer` export provides an interface to the tokenizer.

function tokenizer(input, options) {
  return new _state.Parser(options, input);
}

},{"./expression":1,"./identifier":2,"./location":4,"./locutil":5,"./lval":6,"./node":7,"./options":8,"./parseutil":9,"./state":10,"./statement":11,"./tokencontext":12,"./tokenize":13,"./tokentype":14,"./whitespace":16}],4:[function(_dereq_,module,exports){
"use strict";

var _state = _dereq_("./state");

var _locutil = _dereq_("./locutil");

var pp = _state.Parser.prototype;

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

pp.raise = function (pos, message) {
  var loc = _locutil.getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  var err = new SyntaxError(message);
  err.pos = pos;err.loc = loc;err.raisedAt = this.pos;
  throw err;
};

pp.raiseRecoverable = pp.raise;

pp.curPosition = function () {
  if (this.options.locations) {
    return new _locutil.Position(this.curLine, this.pos - this.lineStart);
  }
};

},{"./locutil":5,"./state":10}],5:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;
exports.getLineInfo = getLineInfo;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _whitespace = _dereq_("./whitespace");

// These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

var Position = (function () {
  function Position(line, col) {
    _classCallCheck(this, Position);

    this.line = line;
    this.column = col;
  }

  Position.prototype.offset = function offset(n) {
    return new Position(this.line, this.column + n);
  };

  return Position;
})();

exports.Position = Position;

var SourceLocation = function SourceLocation(p, start, end) {
  _classCallCheck(this, SourceLocation);

  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) this.source = p.sourceFile;
}

// The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

;

exports.SourceLocation = SourceLocation;

function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;;) {
    _whitespace.lineBreakG.lastIndex = cur;
    var match = _whitespace.lineBreakG.exec(input);
    if (match && match.index < offset) {
      ++line;
      cur = match.index + match[0].length;
    } else {
      return new Position(line, offset - cur);
    }
  }
}

},{"./whitespace":16}],6:[function(_dereq_,module,exports){
"use strict";

var _tokentype = _dereq_("./tokentype");

var _state = _dereq_("./state");

var _util = _dereq_("./util");

var pp = _state.Parser.prototype;

// Convert existing expression atom to assignable pattern
// if possible.

pp.toAssignable = function (node, isBinding) {
  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
      case "Identifier":
      case "ObjectPattern":
      case "ArrayPattern":
        break;

      case "ObjectExpression":
        node.type = "ObjectPattern";
        for (var i = 0; i < node.properties.length; i++) {
          var prop = node.properties[i];
          if (prop.kind !== "init") this.raise(prop.key.start, "Object pattern can't contain getter or setter");
          this.toAssignable(prop.value, isBinding);
        }
        break;

      case "ArrayExpression":
        node.type = "ArrayPattern";
        this.toAssignableList(node.elements, isBinding);
        break;

      case "AssignmentExpression":
        if (node.operator === "=") {
          node.type = "AssignmentPattern";
          delete node.operator;
          // falls through to AssignmentPattern
        } else {
            this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
            break;
          }

      case "AssignmentPattern":
        if (node.right.type === "YieldExpression") this.raise(node.right.start, "Yield expression cannot be a default value");
        break;

      case "ParenthesizedExpression":
        node.expression = this.toAssignable(node.expression, isBinding);
        break;

      case "MemberExpression":
        if (!isBinding) break;

      default:
        this.raise(node.start, "Assigning to rvalue");
    }
  }
  return node;
};

// Convert list of expression atoms to binding list.

pp.toAssignableList = function (exprList, isBinding) {
  var end = exprList.length;
  if (end) {
    var last = exprList[end - 1];
    if (last && last.type == "RestElement") {
      --end;
    } else if (last && last.type == "SpreadElement") {
      last.type = "RestElement";
      var arg = last.argument;
      this.toAssignable(arg, isBinding);
      if (arg.type !== "Identifier" && arg.type !== "MemberExpression" && arg.type !== "ArrayPattern") this.unexpected(arg.start);
      --end;
    }

    if (isBinding && last.type === "RestElement" && last.argument.type !== "Identifier") this.unexpected(last.argument.start);
  }
  for (var i = 0; i < end; i++) {
    var elt = exprList[i];
    if (elt) this.toAssignable(elt, isBinding);
  }
  return exprList;
};

// Parses spread element.

pp.parseSpread = function (refDestructuringErrors) {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(refDestructuringErrors);
  return this.finishNode(node, "SpreadElement");
};

pp.parseRest = function (allowNonIdent) {
  var node = this.startNode();
  this.next();

  // RestElement inside of a function parameter must be an identifier
  if (allowNonIdent) node.argument = this.type === _tokentype.types.name ? this.parseIdent() : this.unexpected();else node.argument = this.type === _tokentype.types.name || this.type === _tokentype.types.bracketL ? this.parseBindingAtom() : this.unexpected();

  return this.finishNode(node, "RestElement");
};

// Parses lvalue (assignable) atom.

pp.parseBindingAtom = function () {
  if (this.options.ecmaVersion < 6) return this.parseIdent();
  switch (this.type) {
    case _tokentype.types.name:
      return this.parseIdent();

    case _tokentype.types.bracketL:
      var node = this.startNode();
      this.next();
      node.elements = this.parseBindingList(_tokentype.types.bracketR, true, true);
      return this.finishNode(node, "ArrayPattern");

    case _tokentype.types.braceL:
      return this.parseObj(true);

    default:
      this.unexpected();
  }
};

pp.parseBindingList = function (close, allowEmpty, allowTrailingComma, allowNonIdent) {
  var elts = [],
      first = true;
  while (!this.eat(close)) {
    if (first) first = false;else this.expect(_tokentype.types.comma);
    if (allowEmpty && this.type === _tokentype.types.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this.afterTrailingComma(close)) {
      break;
    } else if (this.type === _tokentype.types.ellipsis) {
      var rest = this.parseRest(allowNonIdent);
      this.parseBindingListItem(rest);
      elts.push(rest);
      if (this.type === _tokentype.types.comma) this.raise(this.start, "Comma is not permitted after the rest element");
      this.expect(close);
      break;
    } else {
      var elem = this.parseMaybeDefault(this.start, this.startLoc);
      this.parseBindingListItem(elem);
      elts.push(elem);
    }
  }
  return elts;
};

pp.parseBindingListItem = function (param) {
  return param;
};

// Parses assignment pattern around given atom if possible.

pp.parseMaybeDefault = function (startPos, startLoc, left) {
  left = left || this.parseBindingAtom();
  if (this.options.ecmaVersion < 6 || !this.eat(_tokentype.types.eq)) return left;
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern");
};

// Verify that a node is an lval — something that can be assigned
// to.

pp.checkLVal = function (expr, isBinding, checkClashes) {
  switch (expr.type) {
    case "Identifier":
      if (this.strict && this.reservedWordsStrictBind.test(expr.name)) this.raiseRecoverable(expr.start, (isBinding ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
      if (checkClashes) {
        if (_util.has(checkClashes, expr.name)) this.raiseRecoverable(expr.start, "Argument name clash");
        checkClashes[expr.name] = true;
      }
      break;

    case "MemberExpression":
      if (isBinding) this.raiseRecoverable(expr.start, (isBinding ? "Binding" : "Assigning to") + " member expression");
      break;

    case "ObjectPattern":
      for (var i = 0; i < expr.properties.length; i++) {
        this.checkLVal(expr.properties[i].value, isBinding, checkClashes);
      }break;

    case "ArrayPattern":
      for (var i = 0; i < expr.elements.length; i++) {
        var elem = expr.elements[i];
        if (elem) this.checkLVal(elem, isBinding, checkClashes);
      }
      break;

    case "AssignmentPattern":
      this.checkLVal(expr.left, isBinding, checkClashes);
      break;

    case "RestElement":
      this.checkLVal(expr.argument, isBinding, checkClashes);
      break;

    case "ParenthesizedExpression":
      this.checkLVal(expr.expression, isBinding, checkClashes);
      break;

    default:
      this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " rvalue");
  }
};

},{"./state":10,"./tokentype":14,"./util":15}],7:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _state = _dereq_("./state");

var _locutil = _dereq_("./locutil");

var Node = function Node(parser, pos, loc) {
  _classCallCheck(this, Node);

  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations) this.loc = new _locutil.SourceLocation(parser, loc);
  if (parser.options.directSourceFile) this.sourceFile = parser.options.directSourceFile;
  if (parser.options.ranges) this.range = [pos, 0];
}

// Start an AST node, attaching a start offset.

;

exports.Node = Node;
var pp = _state.Parser.prototype;

pp.startNode = function () {
  return new Node(this, this.start, this.startLoc);
};

pp.startNodeAt = function (pos, loc) {
  return new Node(this, pos, loc);
};

// Finish an AST node, adding `type` and `end` properties.

function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations) node.loc.end = loc;
  if (this.options.ranges) node.range[1] = pos;
  return node;
}

pp.finishNode = function (node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
};

// Finish node at given position

pp.finishNodeAt = function (node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc);
};

},{"./locutil":5,"./state":10}],8:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;
exports.getOptions = getOptions;

var _util = _dereq_("./util");

var _locutil = _dereq_("./locutil");

// A second optional argument can be given to further configure
// the parser process. These options are recognized:

var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must
  // be either 3, or 5, or 6. This influences support for strict
  // mode, the set of reserved words, support for getters and
  // setters and other features. The default is 6.
  ecmaVersion: 6,
  // Source type ("script" or "module") for different semantics
  sourceType: "script",
  // `onInsertedSemicolon` can be a callback that will be called
  // when a semicolon is automatically inserted. It will be passed
  // th position of the comma as an offset, and if `locations` is
  // enabled, it is given the location as a `{line, column}` object
  // as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program.
  allowImportExportEverywhere: false,
  // When enabled, hashbang directive in the beginning of file
  // is allowed and treated as a line comment.
  allowHashBang: false,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false,
  plugins: {}
};

exports.defaultOptions = defaultOptions;
// Interpret and default an options object

function getOptions(opts) {
  var options = {};
  for (var opt in defaultOptions) {
    options[opt] = opts && _util.has(opts, opt) ? opts[opt] : defaultOptions[opt];
  }if (options.allowReserved == null) options.allowReserved = options.ecmaVersion < 5;

  if (_util.isArray(options.onToken)) {
    (function () {
      var tokens = options.onToken;
      options.onToken = function (token) {
        return tokens.push(token);
      };
    })();
  }
  if (_util.isArray(options.onComment)) options.onComment = pushComment(options, options.onComment);

  return options;
}

function pushComment(options, array) {
  return function (block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? 'Block' : 'Line',
      value: text,
      start: start,
      end: end
    };
    if (options.locations) comment.loc = new _locutil.SourceLocation(this, startLoc, endLoc);
    if (options.ranges) comment.range = [start, end];
    array.push(comment);
  };
}

},{"./locutil":5,"./util":15}],9:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _tokentype = _dereq_("./tokentype");

var _state = _dereq_("./state");

var _whitespace = _dereq_("./whitespace");

var pp = _state.Parser.prototype;

// ## Parser utilities

// Test whether a statement node is the string literal `"use strict"`.

pp.isUseStrict = function (stmt) {
  return this.options.ecmaVersion >= 5 && stmt.type === "ExpressionStatement" && stmt.expression.type === "Literal" && stmt.expression.raw.slice(1, -1) === "use strict";
};

// Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.

pp.eat = function (type) {
  if (this.type === type) {
    this.next();
    return true;
  } else {
    return false;
  }
};

// Tests whether parsed token is a contextual keyword.

pp.isContextual = function (name) {
  return this.type === _tokentype.types.name && this.value === name;
};

// Consumes contextual keyword if possible.

pp.eatContextual = function (name) {
  return this.value === name && this.eat(_tokentype.types.name);
};

// Asserts that following token is given contextual keyword.

pp.expectContextual = function (name) {
  if (!this.eatContextual(name)) this.unexpected();
};

// Test whether a semicolon can be inserted at the current position.

pp.canInsertSemicolon = function () {
  return this.type === _tokentype.types.eof || this.type === _tokentype.types.braceR || _whitespace.lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
};

pp.insertSemicolon = function () {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon) this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
    return true;
  }
};

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.

pp.semicolon = function () {
  if (!this.eat(_tokentype.types.semi) && !this.insertSemicolon()) this.unexpected();
};

pp.afterTrailingComma = function (tokType) {
  if (this.type == tokType) {
    if (this.options.onTrailingComma) this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
    this.next();
    return true;
  }
};

// Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.

pp.expect = function (type) {
  this.eat(type) || this.unexpected();
};

// Raise an unexpected token error.

pp.unexpected = function (pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token");
};

var DestructuringErrors = function DestructuringErrors() {
  _classCallCheck(this, DestructuringErrors);

  this.shorthandAssign = 0;
  this.trailingComma = 0;
};

exports.DestructuringErrors = DestructuringErrors;

pp.checkPatternErrors = function (refDestructuringErrors, andThrow) {
  var trailing = refDestructuringErrors && refDestructuringErrors.trailingComma;
  if (!andThrow) return !!trailing;
  if (trailing) this.raise(trailing, "Comma is not permitted after the rest element");
};

pp.checkExpressionErrors = function (refDestructuringErrors, andThrow) {
  var pos = refDestructuringErrors && refDestructuringErrors.shorthandAssign;
  if (!andThrow) return !!pos;
  if (pos) this.raise(pos, "Shorthand property assignments are valid only in destructuring patterns");
};

},{"./state":10,"./tokentype":14,"./whitespace":16}],10:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _identifier = _dereq_("./identifier");

var _tokentype = _dereq_("./tokentype");

var _whitespace = _dereq_("./whitespace");

var _options = _dereq_("./options");

// Registered plugins
var plugins = {};

exports.plugins = plugins;
function keywordRegexp(words) {
  return new RegExp("^(" + words.replace(/ /g, "|") + ")$");
}

var Parser = (function () {
  function Parser(options, input, startPos) {
    _classCallCheck(this, Parser);

    this.options = options = _options.getOptions(options);
    this.sourceFile = options.sourceFile;
    this.keywords = keywordRegexp(_identifier.keywords[options.ecmaVersion >= 6 ? 6 : 5]);
    var reserved = options.allowReserved ? "" : _identifier.reservedWords[options.ecmaVersion] + (options.sourceType == "module" ? " await" : "");
    this.reservedWords = keywordRegexp(reserved);
    var reservedStrict = (reserved ? reserved + " " : "") + _identifier.reservedWords.strict;
    this.reservedWordsStrict = keywordRegexp(reservedStrict);
    this.reservedWordsStrictBind = keywordRegexp(reservedStrict + " " + _identifier.reservedWords.strictBind);
    this.input = String(input);

    // Used to signal to callers of `readWord1` whether the word
    // contained any escape sequences. This is needed because words with
    // escape sequences must not be interpreted as keywords.
    this.containsEsc = false;

    // Load plugins
    this.loadPlugins(options.plugins);

    // Set up token state

    // The current position of the tokenizer in the input.
    if (startPos) {
      this.pos = startPos;
      this.lineStart = Math.max(0, this.input.lastIndexOf("\n", startPos));
      this.curLine = this.input.slice(0, this.lineStart).split(_whitespace.lineBreak).length;
    } else {
      this.pos = this.lineStart = 0;
      this.curLine = 1;
    }

    // Properties of the current token:
    // Its type
    this.type = _tokentype.types.eof;
    // For tokens that include more information than their type, the value
    this.value = null;
    // Its start and end offset
    this.start = this.end = this.pos;
    // And, if locations are used, the {line, column} object
    // corresponding to those offsets
    this.startLoc = this.endLoc = this.curPosition();

    // Position information for the previous token
    this.lastTokEndLoc = this.lastTokStartLoc = null;
    this.lastTokStart = this.lastTokEnd = this.pos;

    // The context stack is used to superficially track syntactic
    // context to predict whether a regular expression is allowed in a
    // given position.
    this.context = this.initialContext();
    this.exprAllowed = true;

    // Figure out if it's a module code.
    this.strict = this.inModule = options.sourceType === "module";

    // Used to signify the start of a potential arrow function
    this.potentialArrowAt = -1;

    // Flags to track whether we are in a function, a generator.
    this.inFunction = this.inGenerator = false;
    // Labels in scope.
    this.labels = [];

    // If enabled, skip leading hashbang line.
    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === '#!') this.skipLineComment(2);
  }

  // DEPRECATED Kept for backwards compatibility until 3.0 in case a plugin uses them

  Parser.prototype.isKeyword = function isKeyword(word) {
    return this.keywords.test(word);
  };

  Parser.prototype.isReservedWord = function isReservedWord(word) {
    return this.reservedWords.test(word);
  };

  Parser.prototype.extend = function extend(name, f) {
    this[name] = f(this[name]);
  };

  Parser.prototype.loadPlugins = function loadPlugins(pluginConfigs) {
    for (var _name in pluginConfigs) {
      var plugin = plugins[_name];
      if (!plugin) throw new Error("Plugin '" + _name + "' not found");
      plugin(this, pluginConfigs[_name]);
    }
  };

  Parser.prototype.parse = function parse() {
    var node = this.options.program || this.startNode();
    this.nextToken();
    return this.parseTopLevel(node);
  };

  return Parser;
})();

exports.Parser = Parser;

},{"./identifier":2,"./options":8,"./tokentype":14,"./whitespace":16}],11:[function(_dereq_,module,exports){
"use strict";

var _tokentype = _dereq_("./tokentype");

var _state = _dereq_("./state");

var _whitespace = _dereq_("./whitespace");

var _identifier = _dereq_("./identifier");

var _parseutil = _dereq_("./parseutil");

var pp = _state.Parser.prototype;

// ### Statement parsing

// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.

pp.parseTopLevel = function (node) {
  var first = true;
  if (!node.body) node.body = [];
  while (this.type !== _tokentype.types.eof) {
    var stmt = this.parseStatement(true, true);
    node.body.push(stmt);
    if (first) {
      if (this.isUseStrict(stmt)) this.setStrict(true);
      first = false;
    }
  }
  this.next();
  if (this.options.ecmaVersion >= 6) {
    node.sourceType = this.options.sourceType;
  }
  return this.finishNode(node, "Program");
};

var loopLabel = { kind: "loop" },
    switchLabel = { kind: "switch" };

pp.isLet = function () {
  if (this.type !== _tokentype.types.name || this.options.ecmaVersion < 6 || this.value != "let") return false;
  _whitespace.skipWhiteSpace.lastIndex = this.pos;
  var skip = _whitespace.skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length,
      nextCh = this.input.charCodeAt(next);
  if (nextCh === 91 || nextCh == 123) return true; // '{' and '['
  if (_identifier.isIdentifierStart(nextCh, true)) {
    for (var pos = next + 1; _identifier.isIdentifierChar(this.input.charCodeAt(pos, true)); ++pos) {}
    var ident = this.input.slice(next, pos);
    if (!this.isKeyword(ident)) return true;
  }
  return false;
};

// Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.

pp.parseStatement = function (declaration, topLevel) {
  var starttype = this.type,
      node = this.startNode(),
      kind = undefined;

  if (this.isLet()) {
    starttype = _tokentype.types._var;
    kind = "let";
  }

  // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.

  switch (starttype) {
    case _tokentype.types._break:case _tokentype.types._continue:
      return this.parseBreakContinueStatement(node, starttype.keyword);
    case _tokentype.types._debugger:
      return this.parseDebuggerStatement(node);
    case _tokentype.types._do:
      return this.parseDoStatement(node);
    case _tokentype.types._for:
      return this.parseForStatement(node);
    case _tokentype.types._function:
      if (!declaration && this.options.ecmaVersion >= 6) this.unexpected();
      return this.parseFunctionStatement(node);
    case _tokentype.types._class:
      if (!declaration) this.unexpected();
      return this.parseClass(node, true);
    case _tokentype.types._if:
      return this.parseIfStatement(node);
    case _tokentype.types._return:
      return this.parseReturnStatement(node);
    case _tokentype.types._switch:
      return this.parseSwitchStatement(node);
    case _tokentype.types._throw:
      return this.parseThrowStatement(node);
    case _tokentype.types._try:
      return this.parseTryStatement(node);
    case _tokentype.types._const:case _tokentype.types._var:
      kind = kind || this.value;
      if (!declaration && kind != "var") this.unexpected();
      return this.parseVarStatement(node, kind);
    case _tokentype.types._while:
      return this.parseWhileStatement(node);
    case _tokentype.types._with:
      return this.parseWithStatement(node);
    case _tokentype.types.braceL:
      return this.parseBlock();
    case _tokentype.types.semi:
      return this.parseEmptyStatement(node);
    case _tokentype.types._export:
    case _tokentype.types._import:
      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel) this.raise(this.start, "'import' and 'export' may only appear at the top level");
        if (!this.inModule) this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
      }
      return starttype === _tokentype.types._import ? this.parseImport(node) : this.parseExport(node);

    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
    default:
      var maybeName = this.value,
          expr = this.parseExpression();
      if (starttype === _tokentype.types.name && expr.type === "Identifier" && this.eat(_tokentype.types.colon)) return this.parseLabeledStatement(node, maybeName, expr);else return this.parseExpressionStatement(node, expr);
  }
};

pp.parseBreakContinueStatement = function (node, keyword) {
  var isBreak = keyword == "break";
  this.next();
  if (this.eat(_tokentype.types.semi) || this.insertSemicolon()) node.label = null;else if (this.type !== _tokentype.types.name) this.unexpected();else {
    node.label = this.parseIdent();
    this.semicolon();
  }

  // Verify that there is an actual destination to break or
  // continue to.
  for (var i = 0; i < this.labels.length; ++i) {
    var lab = this.labels[i];
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) break;
      if (node.label && isBreak) break;
    }
  }
  if (i === this.labels.length) this.raise(node.start, "Unsyntactic " + keyword);
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
};

pp.parseDebuggerStatement = function (node) {
  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement");
};

pp.parseDoStatement = function (node) {
  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement(false);
  this.labels.pop();
  this.expect(_tokentype.types._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6) this.eat(_tokentype.types.semi);else this.semicolon();
  return this.finishNode(node, "DoWhileStatement");
};

// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.

pp.parseForStatement = function (node) {
  this.next();
  this.labels.push(loopLabel);
  this.expect(_tokentype.types.parenL);
  if (this.type === _tokentype.types.semi) return this.parseFor(node, null);
  var isLet = this.isLet();
  if (this.type === _tokentype.types._var || this.type === _tokentype.types._const || isLet) {
    var _init = this.startNode(),
        kind = isLet ? "let" : this.value;
    this.next();
    this.parseVar(_init, true, kind);
    this.finishNode(_init, "VariableDeclaration");
    if ((this.type === _tokentype.types._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && _init.declarations.length === 1 && !(kind !== "var" && _init.declarations[0].init)) return this.parseForIn(node, _init);
    return this.parseFor(node, _init);
  }
  var refDestructuringErrors = new _parseutil.DestructuringErrors();
  var init = this.parseExpression(true, refDestructuringErrors);
  if (this.type === _tokentype.types._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) {
    this.checkPatternErrors(refDestructuringErrors, true);
    this.toAssignable(init);
    this.checkLVal(init);
    return this.parseForIn(node, init);
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true);
  }
  return this.parseFor(node, init);
};

pp.parseFunctionStatement = function (node) {
  this.next();
  return this.parseFunction(node, true);
};

pp.parseIfStatement = function (node) {
  this.next();
  node.test = this.parseParenExpression();
  node.consequent = this.parseStatement(false);
  node.alternate = this.eat(_tokentype.types._else) ? this.parseStatement(false) : null;
  return this.finishNode(node, "IfStatement");
};

pp.parseReturnStatement = function (node) {
  if (!this.inFunction && !this.options.allowReturnOutsideFunction) this.raise(this.start, "'return' outside of function");
  this.next();

  // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (this.eat(_tokentype.types.semi) || this.insertSemicolon()) node.argument = null;else {
    node.argument = this.parseExpression();this.semicolon();
  }
  return this.finishNode(node, "ReturnStatement");
};

pp.parseSwitchStatement = function (node) {
  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(_tokentype.types.braceL);
  this.labels.push(switchLabel);

  // Statements under must be grouped (by label) in SwitchCase
  // nodes. `cur` is used to keep the node that we are currently
  // adding statements to.

  for (var cur, sawDefault = false; this.type != _tokentype.types.braceR;) {
    if (this.type === _tokentype.types._case || this.type === _tokentype.types._default) {
      var isCase = this.type === _tokentype.types._case;
      if (cur) this.finishNode(cur, "SwitchCase");
      node.cases.push(cur = this.startNode());
      cur.consequent = [];
      this.next();
      if (isCase) {
        cur.test = this.parseExpression();
      } else {
        if (sawDefault) this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
        sawDefault = true;
        cur.test = null;
      }
      this.expect(_tokentype.types.colon);
    } else {
      if (!cur) this.unexpected();
      cur.consequent.push(this.parseStatement(true));
    }
  }
  if (cur) this.finishNode(cur, "SwitchCase");
  this.next(); // Closing brace
  this.labels.pop();
  return this.finishNode(node, "SwitchStatement");
};

pp.parseThrowStatement = function (node) {
  this.next();
  if (_whitespace.lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) this.raise(this.lastTokEnd, "Illegal newline after throw");
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement");
};

// Reused empty array added for node fields that are always empty.

var empty = [];

pp.parseTryStatement = function (node) {
  this.next();
  node.block = this.parseBlock();
  node.handler = null;
  if (this.type === _tokentype.types._catch) {
    var clause = this.startNode();
    this.next();
    this.expect(_tokentype.types.parenL);
    clause.param = this.parseBindingAtom();
    this.checkLVal(clause.param, true);
    this.expect(_tokentype.types.parenR);
    clause.body = this.parseBlock();
    node.handler = this.finishNode(clause, "CatchClause");
  }
  node.finalizer = this.eat(_tokentype.types._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer) this.raise(node.start, "Missing catch or finally clause");
  return this.finishNode(node, "TryStatement");
};

pp.parseVarStatement = function (node, kind) {
  this.next();
  this.parseVar(node, false, kind);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration");
};

pp.parseWhileStatement = function (node) {
  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, "WhileStatement");
};

pp.parseWithStatement = function (node) {
  if (this.strict) this.raise(this.start, "'with' in strict mode");
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement(false);
  return this.finishNode(node, "WithStatement");
};

pp.parseEmptyStatement = function (node) {
  this.next();
  return this.finishNode(node, "EmptyStatement");
};

pp.parseLabeledStatement = function (node, maybeName, expr) {
  for (var i = 0; i < this.labels.length; ++i) {
    if (this.labels[i].name === maybeName) this.raise(expr.start, "Label '" + maybeName + "' is already declared");
  }var kind = this.type.isLoop ? "loop" : this.type === _tokentype.types._switch ? "switch" : null;
  for (var i = this.labels.length - 1; i >= 0; i--) {
    var label = this.labels[i];
    if (label.statementStart == node.start) {
      label.statementStart = this.start;
      label.kind = kind;
    } else break;
  }
  this.labels.push({ name: maybeName, kind: kind, statementStart: this.start });
  node.body = this.parseStatement(true);
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement");
};

pp.parseExpressionStatement = function (node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement");
};

// Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).

pp.parseBlock = function (allowStrict) {
  var node = this.startNode(),
      first = true,
      oldStrict = undefined;
  node.body = [];
  this.expect(_tokentype.types.braceL);
  while (!this.eat(_tokentype.types.braceR)) {
    var stmt = this.parseStatement(true);
    node.body.push(stmt);
    if (first && allowStrict && this.isUseStrict(stmt)) {
      oldStrict = this.strict;
      this.setStrict(this.strict = true);
    }
    first = false;
  }
  if (oldStrict === false) this.setStrict(false);
  return this.finishNode(node, "BlockStatement");
};

// Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.

pp.parseFor = function (node, init) {
  node.init = init;
  this.expect(_tokentype.types.semi);
  node.test = this.type === _tokentype.types.semi ? null : this.parseExpression();
  this.expect(_tokentype.types.semi);
  node.update = this.type === _tokentype.types.parenR ? null : this.parseExpression();
  this.expect(_tokentype.types.parenR);
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, "ForStatement");
};

// Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.

pp.parseForIn = function (node, init) {
  var type = this.type === _tokentype.types._in ? "ForInStatement" : "ForOfStatement";
  this.next();
  node.left = init;
  node.right = this.parseExpression();
  this.expect(_tokentype.types.parenR);
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, type);
};

// Parse a list of variable declarations.

pp.parseVar = function (node, isFor, kind) {
  node.declarations = [];
  node.kind = kind;
  for (;;) {
    var decl = this.startNode();
    this.parseVarId(decl);
    if (this.eat(_tokentype.types.eq)) {
      decl.init = this.parseMaybeAssign(isFor);
    } else if (kind === "const" && !(this.type === _tokentype.types._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      this.unexpected();
    } else if (decl.id.type != "Identifier" && !(isFor && (this.type === _tokentype.types._in || this.isContextual("of")))) {
      this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
    if (!this.eat(_tokentype.types.comma)) break;
  }
  return node;
};

pp.parseVarId = function (decl) {
  decl.id = this.parseBindingAtom();
  this.checkLVal(decl.id, true);
};

// Parse a function declaration or literal (depending on the
// `isStatement` parameter).

pp.parseFunction = function (node, isStatement, allowExpressionBody) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 6) node.generator = this.eat(_tokentype.types.star);
  var oldInGen = this.inGenerator;
  this.inGenerator = node.generator;
  if (isStatement || this.type === _tokentype.types.name) node.id = this.parseIdent();
  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody);
  this.inGenerator = oldInGen;
  return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
};

pp.parseFunctionParams = function (node) {
  this.expect(_tokentype.types.parenL);
  node.params = this.parseBindingList(_tokentype.types.parenR, false, false, true);
};

// Parse a class declaration or literal (depending on the
// `isStatement` parameter).

pp.parseClass = function (node, isStatement) {
  this.next();
  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(_tokentype.types.braceL);
  while (!this.eat(_tokentype.types.braceR)) {
    if (this.eat(_tokentype.types.semi)) continue;
    var method = this.startNode();
    var isGenerator = this.eat(_tokentype.types.star);
    var isMaybeStatic = this.type === _tokentype.types.name && this.value === "static";
    this.parsePropertyName(method);
    method["static"] = isMaybeStatic && this.type !== _tokentype.types.parenL;
    if (method["static"]) {
      if (isGenerator) this.unexpected();
      isGenerator = this.eat(_tokentype.types.star);
      this.parsePropertyName(method);
    }
    method.kind = "method";
    var isGetSet = false;
    if (!method.computed) {
      var key = method.key;

      if (!isGenerator && key.type === "Identifier" && this.type !== _tokentype.types.parenL && (key.name === "get" || key.name === "set")) {
        isGetSet = true;
        method.kind = key.name;
        key = this.parsePropertyName(method);
      }
      if (!method["static"] && (key.type === "Identifier" && key.name === "constructor" || key.type === "Literal" && key.value === "constructor")) {
        if (hadConstructor) this.raise(key.start, "Duplicate constructor in the same class");
        if (isGetSet) this.raise(key.start, "Constructor can't have get/set modifier");
        if (isGenerator) this.raise(key.start, "Constructor can't be a generator");
        method.kind = "constructor";
        hadConstructor = true;
      }
    }
    this.parseClassMethod(classBody, method, isGenerator);
    if (isGetSet) {
      var paramCount = method.kind === "get" ? 0 : 1;
      if (method.value.params.length !== paramCount) {
        var start = method.value.start;
        if (method.kind === "get") this.raiseRecoverable(start, "getter should have no params");else this.raiseRecoverable(start, "setter should have exactly one param");
      }
      if (method.kind === "set" && method.value.params[0].type === "RestElement") this.raise(method.value.params[0].start, "Setter cannot use rest params");
    }
  }
  node.body = this.finishNode(classBody, "ClassBody");
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
};

pp.parseClassMethod = function (classBody, method, isGenerator) {
  method.value = this.parseMethod(isGenerator);
  classBody.body.push(this.finishNode(method, "MethodDefinition"));
};

pp.parseClassId = function (node, isStatement) {
  node.id = this.type === _tokentype.types.name ? this.parseIdent() : isStatement ? this.unexpected() : null;
};

pp.parseClassSuper = function (node) {
  node.superClass = this.eat(_tokentype.types._extends) ? this.parseExprSubscripts() : null;
};

// Parses module export declaration.

pp.parseExport = function (node) {
  this.next();
  // export * from '...'
  if (this.eat(_tokentype.types.star)) {
    this.expectContextual("from");
    node.source = this.type === _tokentype.types.string ? this.parseExprAtom() : this.unexpected();
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration");
  }
  if (this.eat(_tokentype.types._default)) {
    // export default ...
    var parens = this.type == _tokentype.types.parenL;
    var expr = this.parseMaybeAssign();
    var needsSemi = true;
    if (!parens && (expr.type == "FunctionExpression" || expr.type == "ClassExpression")) {
      needsSemi = false;
      if (expr.id) {
        expr.type = expr.type == "FunctionExpression" ? "FunctionDeclaration" : "ClassDeclaration";
      }
    }
    node.declaration = expr;
    if (needsSemi) this.semicolon();
    return this.finishNode(node, "ExportDefaultDeclaration");
  }
  // export var|const|let|function|class ...
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseStatement(true);
    node.specifiers = [];
    node.source = null;
  } else {
    // export { x, y as z } [from '...']
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers();
    if (this.eatContextual("from")) {
      node.source = this.type === _tokentype.types.string ? this.parseExprAtom() : this.unexpected();
    } else {
      // check for keywords used as local names
      for (var i = 0; i < node.specifiers.length; i++) {
        if (this.keywords.test(node.specifiers[i].local.name) || this.reservedWords.test(node.specifiers[i].local.name)) {
          this.unexpected(node.specifiers[i].local.start);
        }
      }

      node.source = null;
    }
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration");
};

pp.shouldParseExportStatement = function () {
  return this.type.keyword || this.isLet();
};

// Parses a comma-separated list of module exports.

pp.parseExportSpecifiers = function () {
  var nodes = [],
      first = true;
  // export { x, y as z } [from '...']
  this.expect(_tokentype.types.braceL);
  while (!this.eat(_tokentype.types.braceR)) {
    if (!first) {
      this.expect(_tokentype.types.comma);
      if (this.afterTrailingComma(_tokentype.types.braceR)) break;
    } else first = false;

    var node = this.startNode();
    node.local = this.parseIdent(this.type === _tokentype.types._default);
    node.exported = this.eatContextual("as") ? this.parseIdent(true) : node.local;
    nodes.push(this.finishNode(node, "ExportSpecifier"));
  }
  return nodes;
};

// Parses import declaration.

pp.parseImport = function (node) {
  this.next();
  // import '...'
  if (this.type === _tokentype.types.string) {
    node.specifiers = empty;
    node.source = this.parseExprAtom();
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === _tokentype.types.string ? this.parseExprAtom() : this.unexpected();
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration");
};

// Parses a comma-separated list of module imports.

pp.parseImportSpecifiers = function () {
  var nodes = [],
      first = true;
  if (this.type === _tokentype.types.name) {
    // import defaultObj, { x, y as z } from '...'
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLVal(node.local, true);
    nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
    if (!this.eat(_tokentype.types.comma)) return nodes;
  }
  if (this.type === _tokentype.types.star) {
    var node = this.startNode();
    this.next();
    this.expectContextual("as");
    node.local = this.parseIdent();
    this.checkLVal(node.local, true);
    nodes.push(this.finishNode(node, "ImportNamespaceSpecifier"));
    return nodes;
  }
  this.expect(_tokentype.types.braceL);
  while (!this.eat(_tokentype.types.braceR)) {
    if (!first) {
      this.expect(_tokentype.types.comma);
      if (this.afterTrailingComma(_tokentype.types.braceR)) break;
    } else first = false;

    var node = this.startNode();
    node.imported = this.parseIdent(true);
    if (this.eatContextual("as")) {
      node.local = this.parseIdent();
    } else {
      node.local = node.imported;
      if (this.isKeyword(node.local.name)) this.unexpected(node.local.start);
      if (this.reservedWordsStrict.test(node.local.name)) this.raise(node.local.start, "The keyword '" + node.local.name + "' is reserved");
    }
    this.checkLVal(node.local, true);
    nodes.push(this.finishNode(node, "ImportSpecifier"));
  }
  return nodes;
};

},{"./identifier":2,"./parseutil":9,"./state":10,"./tokentype":14,"./whitespace":16}],12:[function(_dereq_,module,exports){
// The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design

"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _state = _dereq_("./state");

var _tokentype = _dereq_("./tokentype");

var _whitespace = _dereq_("./whitespace");

var TokContext = function TokContext(token, isExpr, preserveSpace, override) {
  _classCallCheck(this, TokContext);

  this.token = token;
  this.isExpr = !!isExpr;
  this.preserveSpace = !!preserveSpace;
  this.override = override;
};

exports.TokContext = TokContext;
var types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", true),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function (p) {
    return p.readTmplToken();
  }),
  f_expr: new TokContext("function", true)
};

exports.types = types;
var pp = _state.Parser.prototype;

pp.initialContext = function () {
  return [types.b_stat];
};

pp.braceIsBlock = function (prevType) {
  if (prevType === _tokentype.types.colon) {
    var _parent = this.curContext();
    if (_parent === types.b_stat || _parent === types.b_expr) return !_parent.isExpr;
  }
  if (prevType === _tokentype.types._return) return _whitespace.lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  if (prevType === _tokentype.types._else || prevType === _tokentype.types.semi || prevType === _tokentype.types.eof || prevType === _tokentype.types.parenR) return true;
  if (prevType == _tokentype.types.braceL) return this.curContext() === types.b_stat;
  return !this.exprAllowed;
};

pp.updateContext = function (prevType) {
  var update = undefined,
      type = this.type;
  if (type.keyword && prevType == _tokentype.types.dot) this.exprAllowed = false;else if (update = type.updateContext) update.call(this, prevType);else this.exprAllowed = type.beforeExpr;
};

// Token-specific context update code

_tokentype.types.parenR.updateContext = _tokentype.types.braceR.updateContext = function () {
  if (this.context.length == 1) {
    this.exprAllowed = true;
    return;
  }
  var out = this.context.pop();
  if (out === types.b_stat && this.curContext() === types.f_expr) {
    this.context.pop();
    this.exprAllowed = false;
  } else if (out === types.b_tmpl) {
    this.exprAllowed = true;
  } else {
    this.exprAllowed = !out.isExpr;
  }
};

_tokentype.types.braceL.updateContext = function (prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
  this.exprAllowed = true;
};

_tokentype.types.dollarBraceL.updateContext = function () {
  this.context.push(types.b_tmpl);
  this.exprAllowed = true;
};

_tokentype.types.parenL.updateContext = function (prevType) {
  var statementParens = prevType === _tokentype.types._if || prevType === _tokentype.types._for || prevType === _tokentype.types._with || prevType === _tokentype.types._while;
  this.context.push(statementParens ? types.p_stat : types.p_expr);
  this.exprAllowed = true;
};

_tokentype.types.incDec.updateContext = function () {
  // tokExprAllowed stays unchanged
};

_tokentype.types._function.updateContext = function (prevType) {
  if (prevType.beforeExpr && prevType !== _tokentype.types.semi && prevType !== _tokentype.types._else && (prevType !== _tokentype.types.colon || this.curContext() !== types.b_stat)) this.context.push(types.f_expr);
  this.exprAllowed = false;
};

_tokentype.types.backQuote.updateContext = function () {
  if (this.curContext() === types.q_tmpl) this.context.pop();else this.context.push(types.q_tmpl);
  this.exprAllowed = false;
};

},{"./state":10,"./tokentype":14,"./whitespace":16}],13:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _identifier = _dereq_("./identifier");

var _tokentype = _dereq_("./tokentype");

var _state = _dereq_("./state");

var _locutil = _dereq_("./locutil");

var _whitespace = _dereq_("./whitespace");

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

var Token = function Token(p) {
  _classCallCheck(this, Token);

  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations) this.loc = new _locutil.SourceLocation(p, p.startLoc, p.endLoc);
  if (p.options.ranges) this.range = [p.start, p.end];
}

// ## Tokenizer

;

exports.Token = Token;
var pp = _state.Parser.prototype;

// Are we running under Rhino?
var isRhino = typeof Packages == "object" && Object.prototype.toString.call(Packages) == "[object JavaPackage]";

// Move to the next token

pp.next = function () {
  if (this.options.onToken) this.options.onToken(new Token(this));

  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};

pp.getToken = function () {
  this.next();
  return new Token(this);
};

// If we're in an ES6 environment, make parsers iterable
if (typeof Symbol !== "undefined") pp[Symbol.iterator] = function () {
  var self = this;
  return { next: function next() {
      var token = self.getToken();
      return {
        done: token.type === _tokentype.types.eof,
        value: token
      };
    } };
};

// Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).

pp.setStrict = function (strict) {
  this.strict = strict;
  if (this.type !== _tokentype.types.num && this.type !== _tokentype.types.string) return;
  this.pos = this.start;
  if (this.options.locations) {
    while (this.pos < this.lineStart) {
      this.lineStart = this.input.lastIndexOf("\n", this.lineStart - 2) + 1;
      --this.curLine;
    }
  }
  this.nextToken();
};

pp.curContext = function () {
  return this.context[this.context.length - 1];
};

// Read a single token, updating the parser object's token-related
// properties.

pp.nextToken = function () {
  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) this.skipSpace();

  this.start = this.pos;
  if (this.options.locations) this.startLoc = this.curPosition();
  if (this.pos >= this.input.length) return this.finishToken(_tokentype.types.eof);

  if (curContext.override) return curContext.override(this);else this.readToken(this.fullCharCodeAtPos());
};

pp.readToken = function (code) {
  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  if (_identifier.isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */) return this.readWord();

  return this.getTokenFromCode(code);
};

pp.fullCharCodeAtPos = function () {
  var code = this.input.charCodeAt(this.pos);
  if (code <= 0xd7ff || code >= 0xe000) return code;
  var next = this.input.charCodeAt(this.pos + 1);
  return (code << 10) + next - 0x35fdc00;
};

pp.skipBlockComment = function () {
  var startLoc = this.options.onComment && this.curPosition();
  var start = this.pos,
      end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) this.raise(this.pos - 2, "Unterminated comment");
  this.pos = end + 2;
  if (this.options.locations) {
    _whitespace.lineBreakG.lastIndex = start;
    var match = undefined;
    while ((match = _whitespace.lineBreakG.exec(this.input)) && match.index < this.pos) {
      ++this.curLine;
      this.lineStart = match.index + match[0].length;
    }
  }
  if (this.options.onComment) this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos, startLoc, this.curPosition());
};

pp.skipLineComment = function (startSkip) {
  var start = this.pos;
  var startLoc = this.options.onComment && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);
  while (this.pos < this.input.length && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
    ++this.pos;
    ch = this.input.charCodeAt(this.pos);
  }
  if (this.options.onComment) this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos, startLoc, this.curPosition());
};

// Called at the start of the parse and after every token. Skips
// whitespace and comments, and.

pp.skipSpace = function () {
  loop: while (this.pos < this.input.length) {
    var ch = this.input.charCodeAt(this.pos);
    switch (ch) {
      case 32:case 160:
        // ' '
        ++this.pos;
        break;
      case 13:
        if (this.input.charCodeAt(this.pos + 1) === 10) {
          ++this.pos;
        }
      case 10:case 8232:case 8233:
        ++this.pos;
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        break;
      case 47:
        // '/'
        switch (this.input.charCodeAt(this.pos + 1)) {
          case 42:
            // '*'
            this.skipBlockComment();
            break;
          case 47:
            this.skipLineComment(2);
            break;
          default:
            break loop;
        }
        break;
      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && _whitespace.nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this.pos;
        } else {
          break loop;
        }
    }
  }
};

// Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.

pp.finishToken = function (type, val) {
  this.end = this.pos;
  if (this.options.locations) this.endLoc = this.curPosition();
  var prevType = this.type;
  this.type = type;
  this.value = val;

  this.updateContext(prevType);
};

// ### Token reading

// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
pp.readToken_dot = function () {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) return this.readNumber(true);
  var next2 = this.input.charCodeAt(this.pos + 2);
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
    // 46 = dot '.'
    this.pos += 3;
    return this.finishToken(_tokentype.types.ellipsis);
  } else {
    ++this.pos;
    return this.finishToken(_tokentype.types.dot);
  }
};

pp.readToken_slash = function () {
  // '/'
  var next = this.input.charCodeAt(this.pos + 1);
  if (this.exprAllowed) {
    ++this.pos;return this.readRegexp();
  }
  if (next === 61) return this.finishOp(_tokentype.types.assign, 2);
  return this.finishOp(_tokentype.types.slash, 1);
};

pp.readToken_mult_modulo_exp = function (code) {
  // '%*'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  var tokentype = code === 42 ? _tokentype.types.star : _tokentype.types.modulo;

  // exponentiation operator ** and **=
  if (this.options.ecmaVersion >= 7 && next === 42) {
    ++size;
    tokentype = _tokentype.types.starstar;
    next = this.input.charCodeAt(this.pos + 2);
  }

  if (next === 61) return this.finishOp(_tokentype.types.assign, size + 1);
  return this.finishOp(tokentype, size);
};

pp.readToken_pipe_amp = function (code) {
  // '|&'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) return this.finishOp(code === 124 ? _tokentype.types.logicalOR : _tokentype.types.logicalAND, 2);
  if (next === 61) return this.finishOp(_tokentype.types.assign, 2);
  return this.finishOp(code === 124 ? _tokentype.types.bitwiseOR : _tokentype.types.bitwiseAND, 1);
};

pp.readToken_caret = function () {
  // '^'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) return this.finishOp(_tokentype.types.assign, 2);
  return this.finishOp(_tokentype.types.bitwiseXOR, 1);
};

pp.readToken_plus_min = function (code) {
  // '+-'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (next == 45 && this.input.charCodeAt(this.pos + 2) == 62 && _whitespace.lineBreak.test(this.input.slice(this.lastTokEnd, this.pos))) {
      // A `-->` line comment
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken();
    }
    return this.finishOp(_tokentype.types.incDec, 2);
  }
  if (next === 61) return this.finishOp(_tokentype.types.assign, 2);
  return this.finishOp(_tokentype.types.plusMin, 1);
};

pp.readToken_lt_gt = function (code) {
  // '<>'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) return this.finishOp(_tokentype.types.assign, size + 1);
    return this.finishOp(_tokentype.types.bitShift, size);
  }
  if (next == 33 && code == 60 && this.input.charCodeAt(this.pos + 2) == 45 && this.input.charCodeAt(this.pos + 3) == 45) {
    if (this.inModule) this.unexpected();
    // `<!--`, an XML-style comment that should be interpreted as a line comment
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken();
  }
  if (next === 61) size = 2;
  return this.finishOp(_tokentype.types.relational, size);
};

pp.readToken_eq_excl = function (code) {
  // '=!'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) return this.finishOp(_tokentype.types.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
    // '=>'
    this.pos += 2;
    return this.finishToken(_tokentype.types.arrow);
  }
  return this.finishOp(code === 61 ? _tokentype.types.eq : _tokentype.types.prefix, 1);
};

pp.getTokenFromCode = function (code) {
  switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46:
      // '.'
      return this.readToken_dot();

    // Punctuation tokens.
    case 40:
      ++this.pos;return this.finishToken(_tokentype.types.parenL);
    case 41:
      ++this.pos;return this.finishToken(_tokentype.types.parenR);
    case 59:
      ++this.pos;return this.finishToken(_tokentype.types.semi);
    case 44:
      ++this.pos;return this.finishToken(_tokentype.types.comma);
    case 91:
      ++this.pos;return this.finishToken(_tokentype.types.bracketL);
    case 93:
      ++this.pos;return this.finishToken(_tokentype.types.bracketR);
    case 123:
      ++this.pos;return this.finishToken(_tokentype.types.braceL);
    case 125:
      ++this.pos;return this.finishToken(_tokentype.types.braceR);
    case 58:
      ++this.pos;return this.finishToken(_tokentype.types.colon);
    case 63:
      ++this.pos;return this.finishToken(_tokentype.types.question);

    case 96:
      // '`'
      if (this.options.ecmaVersion < 6) break;
      ++this.pos;
      return this.finishToken(_tokentype.types.backQuote);

    case 48:
      // '0'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) return this.readRadixNumber(16); // '0x', '0X' - hex number
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) return this.readRadixNumber(8); // '0o', '0O' - octal number
        if (next === 98 || next === 66) return this.readRadixNumber(2); // '0b', '0B' - binary number
      }
    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
      // 1-9
      return this.readNumber(false);

    // Quotes produce strings.
    case 34:case 39:
      // '"', "'"
      return this.readString(code);

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.

    case 47:
      // '/'
      return this.readToken_slash();

    case 37:case 42:
      // '%*'
      return this.readToken_mult_modulo_exp(code);

    case 124:case 38:
      // '|&'
      return this.readToken_pipe_amp(code);

    case 94:
      // '^'
      return this.readToken_caret();

    case 43:case 45:
      // '+-'
      return this.readToken_plus_min(code);

    case 60:case 62:
      // '<>'
      return this.readToken_lt_gt(code);

    case 61:case 33:
      // '=!'
      return this.readToken_eq_excl(code);

    case 126:
      // '~'
      return this.finishOp(_tokentype.types.prefix, 1);
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

pp.finishOp = function (type, size) {
  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str);
};

// Parse a regular expression. Some context-awareness is necessary,
// since a '/' inside a '[]' set does not end the expression.

function tryCreateRegexp(src, flags, throwErrorAt, parser) {
  try {
    return new RegExp(src, flags);
  } catch (e) {
    if (throwErrorAt !== undefined) {
      if (e instanceof SyntaxError) parser.raise(throwErrorAt, "Error parsing regular expression: " + e.message);
      throw e;
    }
  }
}

var regexpUnicodeSupport = !!tryCreateRegexp("￿", "u");

pp.readRegexp = function () {
  var _this = this;

  var escaped = undefined,
      inClass = undefined,
      start = this.pos;
  for (;;) {
    if (this.pos >= this.input.length) this.raise(start, "Unterminated regular expression");
    var ch = this.input.charAt(this.pos);
    if (_whitespace.lineBreak.test(ch)) this.raise(start, "Unterminated regular expression");
    if (!escaped) {
      if (ch === "[") inClass = true;else if (ch === "]" && inClass) inClass = false;else if (ch === "/" && !inClass) break;
      escaped = ch === "\\";
    } else escaped = false;
    ++this.pos;
  }
  var content = this.input.slice(start, this.pos);
  ++this.pos;
  // Need to use `readWord1` because '\uXXXX' sequences are allowed
  // here (don't ask).
  var mods = this.readWord1();
  var tmp = content,
      tmpFlags = "";
  if (mods) {
    var validFlags = /^[gim]*$/;
    if (this.options.ecmaVersion >= 6) validFlags = /^[gimuy]*$/;
    if (!validFlags.test(mods)) this.raise(start, "Invalid regular expression flag");
    if (mods.indexOf("u") >= 0) {
      if (regexpUnicodeSupport) {
        tmpFlags = "u";
      } else {
        // Replace each astral symbol and every Unicode escape sequence that
        // possibly represents an astral symbol or a paired surrogate with a
        // single ASCII symbol to avoid throwing on regular expressions that
        // are only valid in combination with the `/u` flag.
        // Note: replacing with the ASCII symbol `x` might cause false
        // negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
        // perfectly valid pattern that is equivalent to `[a-b]`, but it would
        // be replaced by `[x-b]` which throws an error.
        tmp = tmp.replace(/\\u\{([0-9a-fA-F]+)\}/g, function (_match, code, offset) {
          code = Number("0x" + code);
          if (code > 0x10FFFF) _this.raise(start + offset + 3, "Code point out of bounds");
          return "x";
        });
        tmp = tmp.replace(/\\u([a-fA-F0-9]{4})|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
        tmpFlags = tmpFlags.replace("u", "");
      }
    }
  }
  // Detect invalid regular expressions.
  var value = null;
  // Rhino's regular expression parser is flaky and throws uncatchable exceptions,
  // so don't do detection if we are running under Rhino
  if (!isRhino) {
    tryCreateRegexp(tmp, tmpFlags, start, this);
    // Get a regular expression object for this pattern-flag pair, or `null` in
    // case the current environment doesn't support the flags it uses.
    value = tryCreateRegexp(content, mods);
  }
  return this.finishToken(_tokentype.types.regexp, { pattern: content, flags: mods, value: value });
};

// Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.

pp.readInt = function (radix, len) {
  var start = this.pos,
      total = 0;
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
    var code = this.input.charCodeAt(this.pos),
        val = undefined;
    if (code >= 97) val = code - 97 + 10; // a
    else if (code >= 65) val = code - 65 + 10; // A
      else if (code >= 48 && code <= 57) val = code - 48; // 0-9
        else val = Infinity;
    if (val >= radix) break;
    ++this.pos;
    total = total * radix + val;
  }
  if (this.pos === start || len != null && this.pos - start !== len) return null;

  return total;
};

pp.readRadixNumber = function (radix) {
  this.pos += 2; // 0x
  var val = this.readInt(radix);
  if (val == null) this.raise(this.start + 2, "Expected number in radix " + radix);
  if (_identifier.isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
  return this.finishToken(_tokentype.types.num, val);
};

// Read an integer, octal integer, or floating-point number.

pp.readNumber = function (startsWithDot) {
  var start = this.pos,
      isFloat = false,
      octal = this.input.charCodeAt(this.pos) === 48;
  if (!startsWithDot && this.readInt(10) === null) this.raise(start, "Invalid number");
  var next = this.input.charCodeAt(this.pos);
  if (next === 46) {
    // '.'
    ++this.pos;
    this.readInt(10);
    isFloat = true;
    next = this.input.charCodeAt(this.pos);
  }
  if (next === 69 || next === 101) {
    // 'eE'
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) ++this.pos; // '+-'
    if (this.readInt(10) === null) this.raise(start, "Invalid number");
    isFloat = true;
  }
  if (_identifier.isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");

  var str = this.input.slice(start, this.pos),
      val = undefined;
  if (isFloat) val = parseFloat(str);else if (!octal || str.length === 1) val = parseInt(str, 10);else if (/[89]/.test(str) || this.strict) this.raise(start, "Invalid number");else val = parseInt(str, 8);
  return this.finishToken(_tokentype.types.num, val);
};

// Read a string value, interpreting backslash-escapes.

pp.readCodePoint = function () {
  var ch = this.input.charCodeAt(this.pos),
      code = undefined;

  if (ch === 123) {
    if (this.options.ecmaVersion < 6) this.unexpected();
    var codePos = ++this.pos;
    code = this.readHexChar(this.input.indexOf('}', this.pos) - this.pos);
    ++this.pos;
    if (code > 0x10FFFF) this.raise(codePos, "Code point out of bounds");
  } else {
    code = this.readHexChar(4);
  }
  return code;
};

function codePointToString(code) {
  // UTF-16 Decoding
  if (code <= 0xFFFF) return String.fromCharCode(code);
  code -= 0x10000;
  return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00);
}

pp.readString = function (quote) {
  var out = "",
      chunkStart = ++this.pos;
  for (;;) {
    if (this.pos >= this.input.length) this.raise(this.start, "Unterminated string constant");
    var ch = this.input.charCodeAt(this.pos);
    if (ch === quote) break;
    if (ch === 92) {
      // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(false);
      chunkStart = this.pos;
    } else {
      if (_whitespace.isNewLine(ch)) this.raise(this.start, "Unterminated string constant");
      ++this.pos;
    }
  }
  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(_tokentype.types.string, out);
};

// Reads template string tokens.

pp.readTmplToken = function () {
  var out = "",
      chunkStart = this.pos;
  for (;;) {
    if (this.pos >= this.input.length) this.raise(this.start, "Unterminated template");
    var ch = this.input.charCodeAt(this.pos);
    if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
      // '`', '${'
      if (this.pos === this.start && this.type === _tokentype.types.template) {
        if (ch === 36) {
          this.pos += 2;
          return this.finishToken(_tokentype.types.dollarBraceL);
        } else {
          ++this.pos;
          return this.finishToken(_tokentype.types.backQuote);
        }
      }
      out += this.input.slice(chunkStart, this.pos);
      return this.finishToken(_tokentype.types.template, out);
    }
    if (ch === 92) {
      // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(true);
      chunkStart = this.pos;
    } else if (_whitespace.isNewLine(ch)) {
      out += this.input.slice(chunkStart, this.pos);
      ++this.pos;
      switch (ch) {
        case 13:
          if (this.input.charCodeAt(this.pos) === 10) ++this.pos;
        case 10:
          out += "\n";
          break;
        default:
          out += String.fromCharCode(ch);
          break;
      }
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
      chunkStart = this.pos;
    } else {
      ++this.pos;
    }
  }
};

// Used to read escaped characters

pp.readEscapedChar = function (inTemplate) {
  var ch = this.input.charCodeAt(++this.pos);
  ++this.pos;
  switch (ch) {
    case 110:
      return "\n"; // 'n' -> '\n'
    case 114:
      return "\r"; // 'r' -> '\r'
    case 120:
      return String.fromCharCode(this.readHexChar(2)); // 'x'
    case 117:
      return codePointToString(this.readCodePoint()); // 'u'
    case 116:
      return "\t"; // 't' -> '\t'
    case 98:
      return "\b"; // 'b' -> '\b'
    case 118:
      return "\u000b"; // 'v' -> '\u000b'
    case 102:
      return "\f"; // 'f' -> '\f'
    case 13:
      if (this.input.charCodeAt(this.pos) === 10) ++this.pos; // '\r\n'
    case 10:
      // ' \n'
      if (this.options.locations) {
        this.lineStart = this.pos;++this.curLine;
      }
      return "";
    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }
        if (octalStr !== "0" && (this.strict || inTemplate)) {
          this.raise(this.pos - 2, "Octal literal in strict mode");
        }
        this.pos += octalStr.length - 1;
        return String.fromCharCode(octal);
      }
      return String.fromCharCode(ch);
  }
};

// Used to read character escape sequences ('\x', '\u', '\U').

pp.readHexChar = function (len) {
  var codePos = this.pos;
  var n = this.readInt(16, len);
  if (n === null) this.raise(codePos, "Bad character escape sequence");
  return n;
};

// Read an identifier, and return it as a string. Sets `this.containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.

pp.readWord1 = function () {
  this.containsEsc = false;
  var word = "",
      first = true,
      chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;
  while (this.pos < this.input.length) {
    var ch = this.fullCharCodeAtPos();
    if (_identifier.isIdentifierChar(ch, astral)) {
      this.pos += ch <= 0xffff ? 1 : 2;
    } else if (ch === 92) {
      // "\"
      this.containsEsc = true;
      word += this.input.slice(chunkStart, this.pos);
      var escStart = this.pos;
      if (this.input.charCodeAt(++this.pos) != 117) // "u"
        this.raise(this.pos, "Expecting Unicode escape sequence \\uXXXX");
      ++this.pos;
      var esc = this.readCodePoint();
      if (!(first ? _identifier.isIdentifierStart : _identifier.isIdentifierChar)(esc, astral)) this.raise(escStart, "Invalid Unicode escape");
      word += codePointToString(esc);
      chunkStart = this.pos;
    } else {
      break;
    }
    first = false;
  }
  return word + this.input.slice(chunkStart, this.pos);
};

// Read an identifier or keyword token. Will check for reserved
// words when necessary.

pp.readWord = function () {
  var word = this.readWord1();
  var type = _tokentype.types.name;
  if ((this.options.ecmaVersion >= 6 || !this.containsEsc) && this.keywords.test(word)) type = _tokentype.keywords[word];
  return this.finishToken(type, word);
};

},{"./identifier":2,"./locutil":5,"./state":10,"./tokentype":14,"./whitespace":16}],14:[function(_dereq_,module,exports){
// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TokenType = function TokenType(label) {
  var conf = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  _classCallCheck(this, TokenType);

  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
};

exports.TokenType = TokenType;

function binop(name, prec) {
  return new TokenType(name, { beforeExpr: true, binop: prec });
}
var beforeExpr = { beforeExpr: true },
    startsExpr = { startsExpr: true };

var types = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  eof: new TokenType("eof"),

  // Punctuation token types.
  bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
  assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
  incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
  prefix: new TokenType("prefix", { beforeExpr: true, prefix: true, startsExpr: true }),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=", 6),
  relational: binop("</>", 7),
  bitShift: binop("<</>>", 8),
  plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", { beforeExpr: true })
};

exports.types = types;
// Map keyword names to token types.

var keywords = {};

exports.keywords = keywords;
// Succinct definitions of keyword token types
function kw(name) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  options.keyword = name;
  keywords[name] = types["_" + name] = new TokenType(name, options);
}

kw("break");
kw("case", beforeExpr);
kw("catch");
kw("continue");
kw("debugger");
kw("default", beforeExpr);
kw("do", { isLoop: true, beforeExpr: true });
kw("else", beforeExpr);
kw("finally");
kw("for", { isLoop: true });
kw("function", startsExpr);
kw("if");
kw("return", beforeExpr);
kw("switch");
kw("throw", beforeExpr);
kw("try");
kw("var");
kw("const");
kw("while", { isLoop: true });
kw("with");
kw("new", { beforeExpr: true, startsExpr: true });
kw("this", startsExpr);
kw("super", startsExpr);
kw("class");
kw("extends", beforeExpr);
kw("export");
kw("import");
kw("null", startsExpr);
kw("true", startsExpr);
kw("false", startsExpr);
kw("in", { beforeExpr: true, binop: 7 });
kw("instanceof", { beforeExpr: true, binop: 7 });
kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true });
kw("void", { beforeExpr: true, prefix: true, startsExpr: true });
kw("delete", { beforeExpr: true, prefix: true, startsExpr: true });

},{}],15:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;
exports.isArray = isArray;
exports.has = has;

function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
}

// Checks if an object has a property.

function has(obj, propName) {
  return Object.prototype.hasOwnProperty.call(obj, propName);
}

},{}],16:[function(_dereq_,module,exports){
// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

"use strict";

exports.__esModule = true;
exports.isNewLine = isNewLine;
var lineBreak = /\r\n?|\n|\u2028|\u2029/;
exports.lineBreak = lineBreak;
var lineBreakG = new RegExp(lineBreak.source, "g");

exports.lineBreakG = lineBreakG;

function isNewLine(code) {
  return code === 10 || code === 13 || code === 0x2028 || code == 0x2029;
}

var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

exports.nonASCIIwhitespace = nonASCIIwhitespace;
var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
exports.skipWhiteSpace = skipWhiteSpace;

},{}]},{},[3])(3)
});;
  (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.acorn || (g.acorn = {})).walk = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
// AST walker module for Mozilla Parser API compatible trees

// A simple walk is one where you simply specify callbacks to be
// called on specific nodes. The last two arguments are optional. A
// simple use would be
//
//     walk.simple(myTree, {
//         Expression: function(node) { ... }
//     });
//
// to do something with all expressions. All Parser API node types
// can be used to identify node types, as well as Expression,
// Statement, and ScopeBody, which denote categories of nodes.
//
// The base argument can be used to pass a custom (recursive)
// walker, and state can be used to give this walked an initial
// state.

"use strict";

exports.__esModule = true;
exports.simple = simple;
exports.ancestor = ancestor;
exports.recursive = recursive;
exports.findNodeAt = findNodeAt;
exports.findNodeAround = findNodeAround;
exports.findNodeAfter = findNodeAfter;
exports.findNodeBefore = findNodeBefore;
exports.make = make;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function simple(node, visitors, base, state, override) {
  if (!base) base = exports.base;(function c(node, st, override) {
    var type = override || node.type,
        found = visitors[type];
    base[type](node, st, c);
    if (found) found(node, st);
  })(node, state, override);
}

// An ancestor walk keeps an array of ancestor nodes (including the
// current node) and passes them to the callback as third parameter
// (and also as state parameter when no other state is present).

function ancestor(node, visitors, base, state) {
  if (!base) base = exports.base;
  var ancestors = [];(function c(node, st, override) {
    var type = override || node.type,
        found = visitors[type];
    var isNew = node != ancestors[ancestors.length - 1];
    if (isNew) ancestors.push(node);
    base[type](node, st, c);
    if (found) found(node, st || ancestors, ancestors);
    if (isNew) ancestors.pop();
  })(node, state);
}

// A recursive walk is one where your functions override the default
// walkers. They can modify and replace the state parameter that's
// threaded through the walk, and can opt how and whether to walk
// their child nodes (by calling their third argument on these
// nodes).

function recursive(node, state, funcs, base, override) {
  var visitor = funcs ? exports.make(funcs, base) : base;(function c(node, st, override) {
    visitor[override || node.type](node, st, c);
  })(node, state, override);
}

function makeTest(test) {
  if (typeof test == "string") return function (type) {
    return type == test;
  };else if (!test) return function () {
    return true;
  };else return test;
}

var Found = function Found(node, state) {
  _classCallCheck(this, Found);

  this.node = node;this.state = state;
}

// Find a node with a given start, end, and type (all are optional,
// null can be used as wildcard). Returns a {node, state} object, or
// undefined when it doesn't find a matching node.
;

function findNodeAt(node, start, end, test, base, state) {
  test = makeTest(test);
  if (!base) base = exports.base;
  try {
    ;(function c(node, st, override) {
      var type = override || node.type;
      if ((start == null || node.start <= start) && (end == null || node.end >= end)) base[type](node, st, c);
      if ((start == null || node.start == start) && (end == null || node.end == end) && test(type, node)) throw new Found(node, st);
    })(node, state);
  } catch (e) {
    if (e instanceof Found) return e;
    throw e;
  }
}

// Find the innermost node of a given type that contains the given
// position. Interface similar to findNodeAt.

function findNodeAround(node, pos, test, base, state) {
  test = makeTest(test);
  if (!base) base = exports.base;
  try {
    ;(function c(node, st, override) {
      var type = override || node.type;
      if (node.start > pos || node.end < pos) return;
      base[type](node, st, c);
      if (test(type, node)) throw new Found(node, st);
    })(node, state);
  } catch (e) {
    if (e instanceof Found) return e;
    throw e;
  }
}

// Find the outermost matching node after a given position.

function findNodeAfter(node, pos, test, base, state) {
  test = makeTest(test);
  if (!base) base = exports.base;
  try {
    ;(function c(node, st, override) {
      if (node.end < pos) return;
      var type = override || node.type;
      if (node.start >= pos && test(type, node)) throw new Found(node, st);
      base[type](node, st, c);
    })(node, state);
  } catch (e) {
    if (e instanceof Found) return e;
    throw e;
  }
}

// Find the outermost matching node before a given position.

function findNodeBefore(node, pos, test, base, state) {
  test = makeTest(test);
  if (!base) base = exports.base;
  var max = undefined;(function c(node, st, override) {
    if (node.start > pos) return;
    var type = override || node.type;
    if (node.end <= pos && (!max || max.node.end < node.end) && test(type, node)) max = new Found(node, st);
    base[type](node, st, c);
  })(node, state);
  return max;
}

// Fallback to an Object.create polyfill for older environments.
var create = Object.create || function (proto) {
  function Ctor() {}
  Ctor.prototype = proto;
  return new Ctor();
};

// Used to create a custom walker. Will fill in all missing node
// type properties with the defaults.

function make(funcs, base) {
  if (!base) base = exports.base;
  var visitor = create(base);
  for (var type in funcs) visitor[type] = funcs[type];
  return visitor;
}

function skipThrough(node, st, c) {
  c(node, st);
}
function ignore(_node, _st, _c) {}

// Node walkers.

var base = {};

exports.base = base;
base.Program = base.BlockStatement = function (node, st, c) {
  for (var i = 0; i < node.body.length; ++i) {
    c(node.body[i], st, "Statement");
  }
};
base.Statement = skipThrough;
base.EmptyStatement = ignore;
base.ExpressionStatement = base.ParenthesizedExpression = function (node, st, c) {
  return c(node.expression, st, "Expression");
};
base.IfStatement = function (node, st, c) {
  c(node.test, st, "Expression");
  c(node.consequent, st, "Statement");
  if (node.alternate) c(node.alternate, st, "Statement");
};
base.LabeledStatement = function (node, st, c) {
  return c(node.body, st, "Statement");
};
base.BreakStatement = base.ContinueStatement = ignore;
base.WithStatement = function (node, st, c) {
  c(node.object, st, "Expression");
  c(node.body, st, "Statement");
};
base.SwitchStatement = function (node, st, c) {
  c(node.discriminant, st, "Expression");
  for (var i = 0; i < node.cases.length; ++i) {
    var cs = node.cases[i];
    if (cs.test) c(cs.test, st, "Expression");
    for (var j = 0; j < cs.consequent.length; ++j) {
      c(cs.consequent[j], st, "Statement");
    }
  }
};
base.ReturnStatement = base.YieldExpression = function (node, st, c) {
  if (node.argument) c(node.argument, st, "Expression");
};
base.ThrowStatement = base.SpreadElement = function (node, st, c) {
  return c(node.argument, st, "Expression");
};
base.TryStatement = function (node, st, c) {
  c(node.block, st, "Statement");
  if (node.handler) c(node.handler, st);
  if (node.finalizer) c(node.finalizer, st, "Statement");
};
base.CatchClause = function (node, st, c) {
  c(node.param, st, "Pattern");
  c(node.body, st, "ScopeBody");
};
base.WhileStatement = base.DoWhileStatement = function (node, st, c) {
  c(node.test, st, "Expression");
  c(node.body, st, "Statement");
};
base.ForStatement = function (node, st, c) {
  if (node.init) c(node.init, st, "ForInit");
  if (node.test) c(node.test, st, "Expression");
  if (node.update) c(node.update, st, "Expression");
  c(node.body, st, "Statement");
};
base.ForInStatement = base.ForOfStatement = function (node, st, c) {
  c(node.left, st, "ForInit");
  c(node.right, st, "Expression");
  c(node.body, st, "Statement");
};
base.ForInit = function (node, st, c) {
  if (node.type == "VariableDeclaration") c(node, st);else c(node, st, "Expression");
};
base.DebuggerStatement = ignore;

base.FunctionDeclaration = function (node, st, c) {
  return c(node, st, "Function");
};
base.VariableDeclaration = function (node, st, c) {
  for (var i = 0; i < node.declarations.length; ++i) {
    c(node.declarations[i], st);
  }
};
base.VariableDeclarator = function (node, st, c) {
  c(node.id, st, "Pattern");
  if (node.init) c(node.init, st, "Expression");
};

base.Function = function (node, st, c) {
  if (node.id) c(node.id, st, "Pattern");
  for (var i = 0; i < node.params.length; i++) {
    c(node.params[i], st, "Pattern");
  }c(node.body, st, node.expression ? "ScopeExpression" : "ScopeBody");
};
// FIXME drop these node types in next major version
// (They are awkward, and in ES6 every block can be a scope.)
base.ScopeBody = function (node, st, c) {
  return c(node, st, "Statement");
};
base.ScopeExpression = function (node, st, c) {
  return c(node, st, "Expression");
};

base.Pattern = function (node, st, c) {
  if (node.type == "Identifier") c(node, st, "VariablePattern");else if (node.type == "MemberExpression") c(node, st, "MemberPattern");else c(node, st);
};
base.VariablePattern = ignore;
base.MemberPattern = skipThrough;
base.RestElement = function (node, st, c) {
  return c(node.argument, st, "Pattern");
};
base.ArrayPattern = function (node, st, c) {
  for (var i = 0; i < node.elements.length; ++i) {
    var elt = node.elements[i];
    if (elt) c(elt, st, "Pattern");
  }
};
base.ObjectPattern = function (node, st, c) {
  for (var i = 0; i < node.properties.length; ++i) {
    c(node.properties[i].value, st, "Pattern");
  }
};

base.Expression = skipThrough;
base.ThisExpression = base.Super = base.MetaProperty = ignore;
base.ArrayExpression = function (node, st, c) {
  for (var i = 0; i < node.elements.length; ++i) {
    var elt = node.elements[i];
    if (elt) c(elt, st, "Expression");
  }
};
base.ObjectExpression = function (node, st, c) {
  for (var i = 0; i < node.properties.length; ++i) {
    c(node.properties[i], st);
  }
};
base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;
base.SequenceExpression = base.TemplateLiteral = function (node, st, c) {
  for (var i = 0; i < node.expressions.length; ++i) {
    c(node.expressions[i], st, "Expression");
  }
};
base.UnaryExpression = base.UpdateExpression = function (node, st, c) {
  c(node.argument, st, "Expression");
};
base.BinaryExpression = base.LogicalExpression = function (node, st, c) {
  c(node.left, st, "Expression");
  c(node.right, st, "Expression");
};
base.AssignmentExpression = base.AssignmentPattern = function (node, st, c) {
  c(node.left, st, "Pattern");
  c(node.right, st, "Expression");
};
base.ConditionalExpression = function (node, st, c) {
  c(node.test, st, "Expression");
  c(node.consequent, st, "Expression");
  c(node.alternate, st, "Expression");
};
base.NewExpression = base.CallExpression = function (node, st, c) {
  c(node.callee, st, "Expression");
  if (node.arguments) for (var i = 0; i < node.arguments.length; ++i) {
    c(node.arguments[i], st, "Expression");
  }
};
base.MemberExpression = function (node, st, c) {
  c(node.object, st, "Expression");
  if (node.computed) c(node.property, st, "Expression");
};
base.ExportNamedDeclaration = base.ExportDefaultDeclaration = function (node, st, c) {
  if (node.declaration) c(node.declaration, st, node.type == "ExportNamedDeclaration" || node.declaration.id ? "Statement" : "Expression");
  if (node.source) c(node.source, st, "Expression");
};
base.ExportAllDeclaration = function (node, st, c) {
  c(node.source, st, "Expression");
};
base.ImportDeclaration = function (node, st, c) {
  for (var i = 0; i < node.specifiers.length; i++) {
    c(node.specifiers[i], st);
  }c(node.source, st, "Expression");
};
base.ImportSpecifier = base.ImportDefaultSpecifier = base.ImportNamespaceSpecifier = base.Identifier = base.Literal = ignore;

base.TaggedTemplateExpression = function (node, st, c) {
  c(node.tag, st, "Expression");
  c(node.quasi, st);
};
base.ClassDeclaration = base.ClassExpression = function (node, st, c) {
  return c(node, st, "Class");
};
base.Class = function (node, st, c) {
  if (node.id) c(node.id, st, "Pattern");
  if (node.superClass) c(node.superClass, st, "Expression");
  for (var i = 0; i < node.body.body.length; i++) {
    c(node.body.body[i], st);
  }
};
base.MethodDefinition = base.Property = function (node, st, c) {
  if (node.computed) c(node.key, st, "Expression");
  c(node.value, st, "Expression");
};

},{}]},{},[1])(1)
});
  (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.acorn || (g.acorn = {})).loose = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";

module.exports = typeof acorn != 'undefined' ? acorn : require("./acorn");

},{}],2:[function(_dereq_,module,exports){
"use strict";

var _state = _dereq_("./state");

var _parseutil = _dereq_("./parseutil");

var _ = _dereq_("..");

var lp = _state.LooseParser.prototype;

lp.checkLVal = function (expr) {
  if (!expr) return expr;
  switch (expr.type) {
    case "Identifier":
    case "MemberExpression":
      return expr;

    case "ParenthesizedExpression":
      expr.expression = this.checkLVal(expr.expression);
      return expr;

    default:
      return this.dummyIdent();
  }
};

lp.parseExpression = function (noIn) {
  var start = this.storeCurrentPos();
  var expr = this.parseMaybeAssign(noIn);
  if (this.tok.type === _.tokTypes.comma) {
    var node = this.startNodeAt(start);
    node.expressions = [expr];
    while (this.eat(_.tokTypes.comma)) node.expressions.push(this.parseMaybeAssign(noIn));
    return this.finishNode(node, "SequenceExpression");
  }
  return expr;
};

lp.parseParenExpression = function () {
  this.pushCx();
  this.expect(_.tokTypes.parenL);
  var val = this.parseExpression();
  this.popCx();
  this.expect(_.tokTypes.parenR);
  return val;
};

lp.parseMaybeAssign = function (noIn) {
  if (this.toks.isContextual("yield")) {
    var node = this.startNode();
    this.next();
    if (this.semicolon() || this.canInsertSemicolon() || this.tok.type != _.tokTypes.star && !this.tok.type.startsExpr) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(_.tokTypes.star);
      node.argument = this.parseMaybeAssign();
    }
    return this.finishNode(node, "YieldExpression");
  }

  var start = this.storeCurrentPos();
  var left = this.parseMaybeConditional(noIn);
  if (this.tok.type.isAssign) {
    var node = this.startNodeAt(start);
    node.operator = this.tok.value;
    node.left = this.tok.type === _.tokTypes.eq ? this.toAssignable(left) : this.checkLVal(left);
    this.next();
    node.right = this.parseMaybeAssign(noIn);
    return this.finishNode(node, "AssignmentExpression");
  }
  return left;
};

lp.parseMaybeConditional = function (noIn) {
  var start = this.storeCurrentPos();
  var expr = this.parseExprOps(noIn);
  if (this.eat(_.tokTypes.question)) {
    var node = this.startNodeAt(start);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    node.alternate = this.expect(_.tokTypes.colon) ? this.parseMaybeAssign(noIn) : this.dummyIdent();
    return this.finishNode(node, "ConditionalExpression");
  }
  return expr;
};

lp.parseExprOps = function (noIn) {
  var start = this.storeCurrentPos();
  var indent = this.curIndent,
      line = this.curLineStart;
  return this.parseExprOp(this.parseMaybeUnary(false), start, -1, noIn, indent, line);
};

lp.parseExprOp = function (left, start, minPrec, noIn, indent, line) {
  if (this.curLineStart != line && this.curIndent < indent && this.tokenStartsLine()) return left;
  var prec = this.tok.type.binop;
  if (prec != null && (!noIn || this.tok.type !== _.tokTypes._in)) {
    if (prec > minPrec) {
      var node = this.startNodeAt(start);
      node.left = left;
      node.operator = this.tok.value;
      this.next();
      if (this.curLineStart != line && this.curIndent < indent && this.tokenStartsLine()) {
        node.right = this.dummyIdent();
      } else {
        var rightStart = this.storeCurrentPos();
        node.right = this.parseExprOp(this.parseMaybeUnary(false), rightStart, prec, noIn, indent, line);
      }
      this.finishNode(node, /&&|\|\|/.test(node.operator) ? "LogicalExpression" : "BinaryExpression");
      return this.parseExprOp(node, start, minPrec, noIn, indent, line);
    }
  }
  return left;
};

lp.parseMaybeUnary = function (sawUnary) {
  var start = this.storeCurrentPos(),
      expr = undefined;
  if (this.tok.type.prefix) {
    var node = this.startNode(),
        update = this.tok.type === _.tokTypes.incDec;
    if (!update) sawUnary = true;
    node.operator = this.tok.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(true);
    if (update) node.argument = this.checkLVal(node.argument);
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else if (this.tok.type === _.tokTypes.ellipsis) {
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeUnary(sawUnary);
    expr = this.finishNode(node, "SpreadElement");
  } else {
    expr = this.parseExprSubscripts();
    while (this.tok.type.postfix && !this.canInsertSemicolon()) {
      var node = this.startNodeAt(start);
      node.operator = this.tok.value;
      node.prefix = false;
      node.argument = this.checkLVal(expr);
      this.next();
      expr = this.finishNode(node, "UpdateExpression");
    }
  }

  if (!sawUnary && this.eat(_.tokTypes.starstar)) {
    var node = this.startNodeAt(start);
    node.operator = "**";
    node.left = expr;
    node.right = this.parseMaybeUnary(false);
    return this.finishNode(node, "BinaryExpression");
  }

  return expr;
};

lp.parseExprSubscripts = function () {
  var start = this.storeCurrentPos();
  return this.parseSubscripts(this.parseExprAtom(), start, false, this.curIndent, this.curLineStart);
};

lp.parseSubscripts = function (base, start, noCalls, startIndent, line) {
  for (;;) {
    if (this.curLineStart != line && this.curIndent <= startIndent && this.tokenStartsLine()) {
      if (this.tok.type == _.tokTypes.dot && this.curIndent == startIndent) --startIndent;else return base;
    }

    if (this.eat(_.tokTypes.dot)) {
      var node = this.startNodeAt(start);
      node.object = base;
      if (this.curLineStart != line && this.curIndent <= startIndent && this.tokenStartsLine()) node.property = this.dummyIdent();else node.property = this.parsePropertyAccessor() || this.dummyIdent();
      node.computed = false;
      base = this.finishNode(node, "MemberExpression");
    } else if (this.tok.type == _.tokTypes.bracketL) {
      this.pushCx();
      this.next();
      var node = this.startNodeAt(start);
      node.object = base;
      node.property = this.parseExpression();
      node.computed = true;
      this.popCx();
      this.expect(_.tokTypes.bracketR);
      base = this.finishNode(node, "MemberExpression");
    } else if (!noCalls && this.tok.type == _.tokTypes.parenL) {
      var node = this.startNodeAt(start);
      node.callee = base;
      node.arguments = this.parseExprList(_.tokTypes.parenR);
      base = this.finishNode(node, "CallExpression");
    } else if (this.tok.type == _.tokTypes.backQuote) {
      var node = this.startNodeAt(start);
      node.tag = base;
      node.quasi = this.parseTemplate();
      base = this.finishNode(node, "TaggedTemplateExpression");
    } else {
      return base;
    }
  }
};

lp.parseExprAtom = function () {
  var node = undefined;
  switch (this.tok.type) {
    case _.tokTypes._this:
    case _.tokTypes._super:
      var type = this.tok.type === _.tokTypes._this ? "ThisExpression" : "Super";
      node = this.startNode();
      this.next();
      return this.finishNode(node, type);

    case _.tokTypes.name:
      var start = this.storeCurrentPos();
      var id = this.parseIdent();
      return this.eat(_.tokTypes.arrow) ? this.parseArrowExpression(this.startNodeAt(start), [id]) : id;

    case _.tokTypes.regexp:
      node = this.startNode();
      var val = this.tok.value;
      node.regex = { pattern: val.pattern, flags: val.flags };
      node.value = val.value;
      node.raw = this.input.slice(this.tok.start, this.tok.end);
      this.next();
      return this.finishNode(node, "Literal");

    case _.tokTypes.num:case _.tokTypes.string:
      node = this.startNode();
      node.value = this.tok.value;
      node.raw = this.input.slice(this.tok.start, this.tok.end);
      this.next();
      return this.finishNode(node, "Literal");

    case _.tokTypes._null:case _.tokTypes._true:case _.tokTypes._false:
      node = this.startNode();
      node.value = this.tok.type === _.tokTypes._null ? null : this.tok.type === _.tokTypes._true;
      node.raw = this.tok.type.keyword;
      this.next();
      return this.finishNode(node, "Literal");

    case _.tokTypes.parenL:
      var parenStart = this.storeCurrentPos();
      this.next();
      var inner = this.parseExpression();
      this.expect(_.tokTypes.parenR);
      if (this.eat(_.tokTypes.arrow)) {
        return this.parseArrowExpression(this.startNodeAt(parenStart), inner.expressions || (_parseutil.isDummy(inner) ? [] : [inner]));
      }
      if (this.options.preserveParens) {
        var par = this.startNodeAt(parenStart);
        par.expression = inner;
        inner = this.finishNode(par, "ParenthesizedExpression");
      }
      return inner;

    case _.tokTypes.bracketL:
      node = this.startNode();
      node.elements = this.parseExprList(_.tokTypes.bracketR, true);
      return this.finishNode(node, "ArrayExpression");

    case _.tokTypes.braceL:
      return this.parseObj();

    case _.tokTypes._class:
      return this.parseClass();

    case _.tokTypes._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, false);

    case _.tokTypes._new:
      return this.parseNew();

    case _.tokTypes.backQuote:
      return this.parseTemplate();

    default:
      return this.dummyIdent();
  }
};

lp.parseNew = function () {
  var node = this.startNode(),
      startIndent = this.curIndent,
      line = this.curLineStart;
  var meta = this.parseIdent(true);
  if (this.options.ecmaVersion >= 6 && this.eat(_.tokTypes.dot)) {
    node.meta = meta;
    node.property = this.parseIdent(true);
    return this.finishNode(node, "MetaProperty");
  }
  var start = this.storeCurrentPos();
  node.callee = this.parseSubscripts(this.parseExprAtom(), start, true, startIndent, line);
  if (this.tok.type == _.tokTypes.parenL) {
    node.arguments = this.parseExprList(_.tokTypes.parenR);
  } else {
    node.arguments = [];
  }
  return this.finishNode(node, "NewExpression");
};

lp.parseTemplateElement = function () {
  var elem = this.startNode();
  elem.value = {
    raw: this.input.slice(this.tok.start, this.tok.end).replace(/\r\n?/g, '\n'),
    cooked: this.tok.value
  };
  this.next();
  elem.tail = this.tok.type === _.tokTypes.backQuote;
  return this.finishNode(elem, "TemplateElement");
};

lp.parseTemplate = function () {
  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement();
  node.quasis = [curElt];
  while (!curElt.tail) {
    this.next();
    node.expressions.push(this.parseExpression());
    if (this.expect(_.tokTypes.braceR)) {
      curElt = this.parseTemplateElement();
    } else {
      curElt = this.startNode();
      curElt.value = { cooked: '', raw: '' };
      curElt.tail = true;
      this.finishNode(curElt, "TemplateElement");
    }
    node.quasis.push(curElt);
  }
  this.expect(_.tokTypes.backQuote);
  return this.finishNode(node, "TemplateLiteral");
};

lp.parseObj = function () {
  var node = this.startNode();
  node.properties = [];
  this.pushCx();
  var indent = this.curIndent + 1,
      line = this.curLineStart;
  this.eat(_.tokTypes.braceL);
  if (this.curIndent + 1 < indent) {
    indent = this.curIndent;line = this.curLineStart;
  }
  while (!this.closes(_.tokTypes.braceR, indent, line)) {
    var prop = this.startNode(),
        isGenerator = undefined,
        start = undefined;
    if (this.options.ecmaVersion >= 6) {
      start = this.storeCurrentPos();
      prop.method = false;
      prop.shorthand = false;
      isGenerator = this.eat(_.tokTypes.star);
    }
    this.parsePropertyName(prop);
    if (_parseutil.isDummy(prop.key)) {
      if (_parseutil.isDummy(this.parseMaybeAssign())) this.next();this.eat(_.tokTypes.comma);continue;
    }
    if (this.eat(_.tokTypes.colon)) {
      prop.kind = "init";
      prop.value = this.parseMaybeAssign();
    } else if (this.options.ecmaVersion >= 6 && (this.tok.type === _.tokTypes.parenL || this.tok.type === _.tokTypes.braceL)) {
      prop.kind = "init";
      prop.method = true;
      prop.value = this.parseMethod(isGenerator);
    } else if (this.options.ecmaVersion >= 5 && prop.key.type === "Identifier" && !prop.computed && (prop.key.name === "get" || prop.key.name === "set") && this.tok.type != _.tokTypes.comma && this.tok.type != _.tokTypes.braceR) {
      prop.kind = prop.key.name;
      this.parsePropertyName(prop);
      prop.value = this.parseMethod(false);
    } else {
      prop.kind = "init";
      if (this.options.ecmaVersion >= 6) {
        if (this.eat(_.tokTypes.eq)) {
          var assign = this.startNodeAt(start);
          assign.operator = "=";
          assign.left = prop.key;
          assign.right = this.parseMaybeAssign();
          prop.value = this.finishNode(assign, "AssignmentExpression");
        } else {
          prop.value = prop.key;
        }
      } else {
        prop.value = this.dummyIdent();
      }
      prop.shorthand = true;
    }
    node.properties.push(this.finishNode(prop, "Property"));
    this.eat(_.tokTypes.comma);
  }
  this.popCx();
  if (!this.eat(_.tokTypes.braceR)) {
    // If there is no closing brace, make the node span to the start
    // of the next token (this is useful for Tern)
    this.last.end = this.tok.start;
    if (this.options.locations) this.last.loc.end = this.tok.loc.start;
  }
  return this.finishNode(node, "ObjectExpression");
};

lp.parsePropertyName = function (prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(_.tokTypes.bracketL)) {
      prop.computed = true;
      prop.key = this.parseExpression();
      this.expect(_.tokTypes.bracketR);
      return;
    } else {
      prop.computed = false;
    }
  }
  var key = this.tok.type === _.tokTypes.num || this.tok.type === _.tokTypes.string ? this.parseExprAtom() : this.parseIdent();
  prop.key = key || this.dummyIdent();
};

lp.parsePropertyAccessor = function () {
  if (this.tok.type === _.tokTypes.name || this.tok.type.keyword) return this.parseIdent();
};

lp.parseIdent = function () {
  var name = this.tok.type === _.tokTypes.name ? this.tok.value : this.tok.type.keyword;
  if (!name) return this.dummyIdent();
  var node = this.startNode();
  this.next();
  node.name = name;
  return this.finishNode(node, "Identifier");
};

lp.initFunction = function (node) {
  node.id = null;
  node.params = [];
  if (this.options.ecmaVersion >= 6) {
    node.generator = false;
    node.expression = false;
  }
};

// Convert existing expression atom to assignable pattern
// if possible.

lp.toAssignable = function (node, binding) {
  if (!node || node.type == "Identifier" || node.type == "MemberExpression" && !binding) {
    // Okay
  } else if (node.type == "ParenthesizedExpression") {
      node.expression = this.toAssignable(node.expression, binding);
    } else if (this.options.ecmaVersion < 6) {
      return this.dummyIdent();
    } else if (node.type == "ObjectExpression") {
      node.type = "ObjectPattern";
      var props = node.properties;
      for (var i = 0; i < props.length; i++) {
        props[i].value = this.toAssignable(props[i].value, binding);
      }
    } else if (node.type == "ArrayExpression") {
      node.type = "ArrayPattern";
      this.toAssignableList(node.elements, binding);
    } else if (node.type == "SpreadElement") {
      node.type = "RestElement";
      node.argument = this.toAssignable(node.argument, binding);
    } else if (node.type == "AssignmentExpression") {
      node.type = "AssignmentPattern";
      delete node.operator;
    } else {
      return this.dummyIdent();
    }
  return node;
};

lp.toAssignableList = function (exprList, binding) {
  for (var i = 0; i < exprList.length; i++) {
    exprList[i] = this.toAssignable(exprList[i], binding);
  }return exprList;
};

lp.parseFunctionParams = function (params) {
  params = this.parseExprList(_.tokTypes.parenR);
  return this.toAssignableList(params, true);
};

lp.parseMethod = function (isGenerator) {
  var node = this.startNode();
  this.initFunction(node);
  node.params = this.parseFunctionParams();
  node.generator = isGenerator || false;
  node.expression = this.options.ecmaVersion >= 6 && this.tok.type !== _.tokTypes.braceL;
  node.body = node.expression ? this.parseMaybeAssign() : this.parseBlock();
  return this.finishNode(node, "FunctionExpression");
};

lp.parseArrowExpression = function (node, params) {
  this.initFunction(node);
  node.params = this.toAssignableList(params, true);
  node.expression = this.tok.type !== _.tokTypes.braceL;
  node.body = node.expression ? this.parseMaybeAssign() : this.parseBlock();
  return this.finishNode(node, "ArrowFunctionExpression");
};

lp.parseExprList = function (close, allowEmpty) {
  this.pushCx();
  var indent = this.curIndent,
      line = this.curLineStart,
      elts = [];
  this.next(); // Opening bracket
  while (!this.closes(close, indent + 1, line)) {
    if (this.eat(_.tokTypes.comma)) {
      elts.push(allowEmpty ? null : this.dummyIdent());
      continue;
    }
    var elt = this.parseMaybeAssign();
    if (_parseutil.isDummy(elt)) {
      if (this.closes(close, indent, line)) break;
      this.next();
    } else {
      elts.push(elt);
    }
    this.eat(_.tokTypes.comma);
  }
  this.popCx();
  if (!this.eat(close)) {
    // If there is no closing brace, make the node span to the start
    // of the next token (this is useful for Tern)
    this.last.end = this.tok.start;
    if (this.options.locations) this.last.loc.end = this.tok.loc.start;
  }
  return elts;
};

},{"..":1,"./parseutil":4,"./state":5}],3:[function(_dereq_,module,exports){
// Acorn: Loose parser
//
// This module provides an alternative parser (`parse_dammit`) that
// exposes that same interface as `parse`, but will try to parse
// anything as JavaScript, repairing syntax error the best it can.
// There are circumstances in which it will raise an error and give
// up, but they are very rare. The resulting AST will be a mostly
// valid JavaScript AST (as per the [Mozilla parser API][api], except
// that:
//
// - Return outside functions is allowed
//
// - Label consistency (no conflicts, break only to existing labels)
//   is not enforced.
//
// - Bogus Identifier nodes with a name of `"✖"` are inserted whenever
//   the parser got too confused to return anything meaningful.
//
// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
//
// The expected use for this is to *first* try `acorn.parse`, and only
// if that fails switch to `parse_dammit`. The loose parser might
// parse badly indented code incorrectly, so **don't** use it as
// your default parser.
//
// Quite a lot of acorn.js is duplicated here. The alternative was to
// add a *lot* of extra cruft to that file, making it less readable
// and slower. Copying and editing the code allowed me to make
// invasive changes and simplifications without creating a complicated
// tangle.

"use strict";

exports.__esModule = true;
exports.parse_dammit = parse_dammit;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _ = _dereq_("..");

var acorn = _interopRequireWildcard(_);

var _state = _dereq_("./state");

_dereq_("./tokenize");

_dereq_("./statement");

_dereq_("./expression");

exports.LooseParser = _state.LooseParser;
exports.pluginsLoose = _state.pluginsLoose;

acorn.defaultOptions.tabSize = 4;

function parse_dammit(input, options) {
  var p = new _state.LooseParser(input, options);
  p.next();
  return p.parseTopLevel();
}

acorn.parse_dammit = parse_dammit;
acorn.LooseParser = _state.LooseParser;
acorn.pluginsLoose = _state.pluginsLoose;

},{"..":1,"./expression":2,"./state":5,"./statement":6,"./tokenize":7}],4:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;
exports.isDummy = isDummy;

function isDummy(node) {
  return node.name == "✖";
}

},{}],5:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = _dereq_("..");

// Registered plugins
var pluginsLoose = {};

exports.pluginsLoose = pluginsLoose;

var LooseParser = (function () {
  function LooseParser(input) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, LooseParser);

    this.toks = _.tokenizer(input, options);
    this.options = this.toks.options;
    this.input = this.toks.input;
    this.tok = this.last = { type: _.tokTypes.eof, start: 0, end: 0 };
    if (this.options.locations) {
      var here = this.toks.curPosition();
      this.tok.loc = new _.SourceLocation(this.toks, here, here);
    }
    this.ahead = []; // Tokens ahead
    this.context = []; // Indentation contexted
    this.curIndent = 0;
    this.curLineStart = 0;
    this.nextLineStart = this.lineEnd(this.curLineStart) + 1;
    // Load plugins
    this.options.pluginsLoose = options.pluginsLoose || {};
    this.loadPlugins(this.options.pluginsLoose);
  }

  LooseParser.prototype.startNode = function startNode() {
    return new _.Node(this.toks, this.tok.start, this.options.locations ? this.tok.loc.start : null);
  };

  LooseParser.prototype.storeCurrentPos = function storeCurrentPos() {
    return this.options.locations ? [this.tok.start, this.tok.loc.start] : this.tok.start;
  };

  LooseParser.prototype.startNodeAt = function startNodeAt(pos) {
    if (this.options.locations) {
      return new _.Node(this.toks, pos[0], pos[1]);
    } else {
      return new _.Node(this.toks, pos);
    }
  };

  LooseParser.prototype.finishNode = function finishNode(node, type) {
    node.type = type;
    node.end = this.last.end;
    if (this.options.locations) node.loc.end = this.last.loc.end;
    if (this.options.ranges) node.range[1] = this.last.end;
    return node;
  };

  LooseParser.prototype.dummyNode = function dummyNode(type) {
    var dummy = this.startNode();
    dummy.type = type;
    dummy.end = dummy.start;
    if (this.options.locations) dummy.loc.end = dummy.loc.start;
    if (this.options.ranges) dummy.range[1] = dummy.start;
    this.last = { type: _.tokTypes.name, start: dummy.start, end: dummy.start, loc: dummy.loc };
    return dummy;
  };

  LooseParser.prototype.dummyIdent = function dummyIdent() {
    var dummy = this.dummyNode("Identifier");
    dummy.name = "✖";
    return dummy;
  };

  LooseParser.prototype.dummyString = function dummyString() {
    var dummy = this.dummyNode("Literal");
    dummy.value = dummy.raw = "✖";
    return dummy;
  };

  LooseParser.prototype.eat = function eat(type) {
    if (this.tok.type === type) {
      this.next();
      return true;
    } else {
      return false;
    }
  };

  LooseParser.prototype.isContextual = function isContextual(name) {
    return this.tok.type === _.tokTypes.name && this.tok.value === name;
  };

  LooseParser.prototype.eatContextual = function eatContextual(name) {
    return this.tok.value === name && this.eat(_.tokTypes.name);
  };

  LooseParser.prototype.canInsertSemicolon = function canInsertSemicolon() {
    return this.tok.type === _.tokTypes.eof || this.tok.type === _.tokTypes.braceR || _.lineBreak.test(this.input.slice(this.last.end, this.tok.start));
  };

  LooseParser.prototype.semicolon = function semicolon() {
    return this.eat(_.tokTypes.semi);
  };

  LooseParser.prototype.expect = function expect(type) {
    if (this.eat(type)) return true;
    for (var i = 1; i <= 2; i++) {
      if (this.lookAhead(i).type == type) {
        for (var j = 0; j < i; j++) {
          this.next();
        }return true;
      }
    }
  };

  LooseParser.prototype.pushCx = function pushCx() {
    this.context.push(this.curIndent);
  };

  LooseParser.prototype.popCx = function popCx() {
    this.curIndent = this.context.pop();
  };

  LooseParser.prototype.lineEnd = function lineEnd(pos) {
    while (pos < this.input.length && !_.isNewLine(this.input.charCodeAt(pos))) ++pos;
    return pos;
  };

  LooseParser.prototype.indentationAfter = function indentationAfter(pos) {
    for (var count = 0;; ++pos) {
      var ch = this.input.charCodeAt(pos);
      if (ch === 32) ++count;else if (ch === 9) count += this.options.tabSize;else return count;
    }
  };

  LooseParser.prototype.closes = function closes(closeTok, indent, line, blockHeuristic) {
    if (this.tok.type === closeTok || this.tok.type === _.tokTypes.eof) return true;
    return line != this.curLineStart && this.curIndent < indent && this.tokenStartsLine() && (!blockHeuristic || this.nextLineStart >= this.input.length || this.indentationAfter(this.nextLineStart) < indent);
  };

  LooseParser.prototype.tokenStartsLine = function tokenStartsLine() {
    for (var p = this.tok.start - 1; p >= this.curLineStart; --p) {
      var ch = this.input.charCodeAt(p);
      if (ch !== 9 && ch !== 32) return false;
    }
    return true;
  };

  LooseParser.prototype.extend = function extend(name, f) {
    this[name] = f(this[name]);
  };

  LooseParser.prototype.loadPlugins = function loadPlugins(pluginConfigs) {
    for (var _name in pluginConfigs) {
      var plugin = pluginsLoose[_name];
      if (!plugin) throw new Error("Plugin '" + _name + "' not found");
      plugin(this, pluginConfigs[_name]);
    }
  };

  return LooseParser;
})();

exports.LooseParser = LooseParser;

},{"..":1}],6:[function(_dereq_,module,exports){
"use strict";

var _state = _dereq_("./state");

var _parseutil = _dereq_("./parseutil");

var _ = _dereq_("..");

var lp = _state.LooseParser.prototype;

lp.parseTopLevel = function () {
  var node = this.startNodeAt(this.options.locations ? [0, _.getLineInfo(this.input, 0)] : 0);
  node.body = [];
  while (this.tok.type !== _.tokTypes.eof) node.body.push(this.parseStatement());
  this.last = this.tok;
  if (this.options.ecmaVersion >= 6) {
    node.sourceType = this.options.sourceType;
  }
  return this.finishNode(node, "Program");
};

lp.parseStatement = function () {
  var starttype = this.tok.type,
      node = this.startNode(),
      kind = undefined;

  if (this.toks.isLet()) {
    starttype = _.tokTypes._var;
    kind = "let";
  }

  switch (starttype) {
    case _.tokTypes._break:case _.tokTypes._continue:
      this.next();
      var isBreak = starttype === _.tokTypes._break;
      if (this.semicolon() || this.canInsertSemicolon()) {
        node.label = null;
      } else {
        node.label = this.tok.type === _.tokTypes.name ? this.parseIdent() : null;
        this.semicolon();
      }
      return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");

    case _.tokTypes._debugger:
      this.next();
      this.semicolon();
      return this.finishNode(node, "DebuggerStatement");

    case _.tokTypes._do:
      this.next();
      node.body = this.parseStatement();
      node.test = this.eat(_.tokTypes._while) ? this.parseParenExpression() : this.dummyIdent();
      this.semicolon();
      return this.finishNode(node, "DoWhileStatement");

    case _.tokTypes._for:
      this.next();
      this.pushCx();
      this.expect(_.tokTypes.parenL);
      if (this.tok.type === _.tokTypes.semi) return this.parseFor(node, null);
      var isLet = this.toks.isLet();
      if (isLet || this.tok.type === _.tokTypes._var || this.tok.type === _.tokTypes._const) {
        var _init = this.parseVar(true, isLet ? "let" : this.tok.value);
        if (_init.declarations.length === 1 && (this.tok.type === _.tokTypes._in || this.isContextual("of"))) {
          return this.parseForIn(node, _init);
        }
        return this.parseFor(node, _init);
      }
      var init = this.parseExpression(true);
      if (this.tok.type === _.tokTypes._in || this.isContextual("of")) return this.parseForIn(node, this.toAssignable(init));
      return this.parseFor(node, init);

    case _.tokTypes._function:
      this.next();
      return this.parseFunction(node, true);

    case _.tokTypes._if:
      this.next();
      node.test = this.parseParenExpression();
      node.consequent = this.parseStatement();
      node.alternate = this.eat(_.tokTypes._else) ? this.parseStatement() : null;
      return this.finishNode(node, "IfStatement");

    case _.tokTypes._return:
      this.next();
      if (this.eat(_.tokTypes.semi) || this.canInsertSemicolon()) node.argument = null;else {
        node.argument = this.parseExpression();this.semicolon();
      }
      return this.finishNode(node, "ReturnStatement");

    case _.tokTypes._switch:
      var blockIndent = this.curIndent,
          line = this.curLineStart;
      this.next();
      node.discriminant = this.parseParenExpression();
      node.cases = [];
      this.pushCx();
      this.expect(_.tokTypes.braceL);

      var cur = undefined;
      while (!this.closes(_.tokTypes.braceR, blockIndent, line, true)) {
        if (this.tok.type === _.tokTypes._case || this.tok.type === _.tokTypes._default) {
          var isCase = this.tok.type === _.tokTypes._case;
          if (cur) this.finishNode(cur, "SwitchCase");
          node.cases.push(cur = this.startNode());
          cur.consequent = [];
          this.next();
          if (isCase) cur.test = this.parseExpression();else cur.test = null;
          this.expect(_.tokTypes.colon);
        } else {
          if (!cur) {
            node.cases.push(cur = this.startNode());
            cur.consequent = [];
            cur.test = null;
          }
          cur.consequent.push(this.parseStatement());
        }
      }
      if (cur) this.finishNode(cur, "SwitchCase");
      this.popCx();
      this.eat(_.tokTypes.braceR);
      return this.finishNode(node, "SwitchStatement");

    case _.tokTypes._throw:
      this.next();
      node.argument = this.parseExpression();
      this.semicolon();
      return this.finishNode(node, "ThrowStatement");

    case _.tokTypes._try:
      this.next();
      node.block = this.parseBlock();
      node.handler = null;
      if (this.tok.type === _.tokTypes._catch) {
        var clause = this.startNode();
        this.next();
        this.expect(_.tokTypes.parenL);
        clause.param = this.toAssignable(this.parseExprAtom(), true);
        this.expect(_.tokTypes.parenR);
        clause.body = this.parseBlock();
        node.handler = this.finishNode(clause, "CatchClause");
      }
      node.finalizer = this.eat(_.tokTypes._finally) ? this.parseBlock() : null;
      if (!node.handler && !node.finalizer) return node.block;
      return this.finishNode(node, "TryStatement");

    case _.tokTypes._var:
    case _.tokTypes._const:
      return this.parseVar(false, kind || this.tok.value);

    case _.tokTypes._while:
      this.next();
      node.test = this.parseParenExpression();
      node.body = this.parseStatement();
      return this.finishNode(node, "WhileStatement");

    case _.tokTypes._with:
      this.next();
      node.object = this.parseParenExpression();
      node.body = this.parseStatement();
      return this.finishNode(node, "WithStatement");

    case _.tokTypes.braceL:
      return this.parseBlock();

    case _.tokTypes.semi:
      this.next();
      return this.finishNode(node, "EmptyStatement");

    case _.tokTypes._class:
      return this.parseClass(true);

    case _.tokTypes._import:
      return this.parseImport();

    case _.tokTypes._export:
      return this.parseExport();

    default:
      var expr = this.parseExpression();
      if (_parseutil.isDummy(expr)) {
        this.next();
        if (this.tok.type === _.tokTypes.eof) return this.finishNode(node, "EmptyStatement");
        return this.parseStatement();
      } else if (starttype === _.tokTypes.name && expr.type === "Identifier" && this.eat(_.tokTypes.colon)) {
        node.body = this.parseStatement();
        node.label = expr;
        return this.finishNode(node, "LabeledStatement");
      } else {
        node.expression = expr;
        this.semicolon();
        return this.finishNode(node, "ExpressionStatement");
      }
  }
};

lp.parseBlock = function () {
  var node = this.startNode();
  this.pushCx();
  this.expect(_.tokTypes.braceL);
  var blockIndent = this.curIndent,
      line = this.curLineStart;
  node.body = [];
  while (!this.closes(_.tokTypes.braceR, blockIndent, line, true)) node.body.push(this.parseStatement());
  this.popCx();
  this.eat(_.tokTypes.braceR);
  return this.finishNode(node, "BlockStatement");
};

lp.parseFor = function (node, init) {
  node.init = init;
  node.test = node.update = null;
  if (this.eat(_.tokTypes.semi) && this.tok.type !== _.tokTypes.semi) node.test = this.parseExpression();
  if (this.eat(_.tokTypes.semi) && this.tok.type !== _.tokTypes.parenR) node.update = this.parseExpression();
  this.popCx();
  this.expect(_.tokTypes.parenR);
  node.body = this.parseStatement();
  return this.finishNode(node, "ForStatement");
};

lp.parseForIn = function (node, init) {
  var type = this.tok.type === _.tokTypes._in ? "ForInStatement" : "ForOfStatement";
  this.next();
  node.left = init;
  node.right = this.parseExpression();
  this.popCx();
  this.expect(_.tokTypes.parenR);
  node.body = this.parseStatement();
  return this.finishNode(node, type);
};

lp.parseVar = function (noIn, kind) {
  var node = this.startNode();
  node.kind = kind;
  this.next();
  node.declarations = [];
  do {
    var decl = this.startNode();
    decl.id = this.options.ecmaVersion >= 6 ? this.toAssignable(this.parseExprAtom(), true) : this.parseIdent();
    decl.init = this.eat(_.tokTypes.eq) ? this.parseMaybeAssign(noIn) : null;
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
  } while (this.eat(_.tokTypes.comma));
  if (!node.declarations.length) {
    var decl = this.startNode();
    decl.id = this.dummyIdent();
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
  }
  if (!noIn) this.semicolon();
  return this.finishNode(node, "VariableDeclaration");
};

lp.parseClass = function (isStatement) {
  var node = this.startNode();
  this.next();
  if (this.tok.type === _.tokTypes.name) node.id = this.parseIdent();else if (isStatement) node.id = this.dummyIdent();else node.id = null;
  node.superClass = this.eat(_.tokTypes._extends) ? this.parseExpression() : null;
  node.body = this.startNode();
  node.body.body = [];
  this.pushCx();
  var indent = this.curIndent + 1,
      line = this.curLineStart;
  this.eat(_.tokTypes.braceL);
  if (this.curIndent + 1 < indent) {
    indent = this.curIndent;line = this.curLineStart;
  }
  while (!this.closes(_.tokTypes.braceR, indent, line)) {
    if (this.semicolon()) continue;
    var method = this.startNode(),
        isGenerator = undefined;
    if (this.options.ecmaVersion >= 6) {
      method["static"] = false;
      isGenerator = this.eat(_.tokTypes.star);
    }
    this.parsePropertyName(method);
    if (_parseutil.isDummy(method.key)) {
      if (_parseutil.isDummy(this.parseMaybeAssign())) this.next();this.eat(_.tokTypes.comma);continue;
    }
    if (method.key.type === "Identifier" && !method.computed && method.key.name === "static" && this.tok.type != _.tokTypes.parenL && this.tok.type != _.tokTypes.braceL) {
      method["static"] = true;
      isGenerator = this.eat(_.tokTypes.star);
      this.parsePropertyName(method);
    } else {
      method["static"] = false;
    }
    if (this.options.ecmaVersion >= 5 && method.key.type === "Identifier" && !method.computed && (method.key.name === "get" || method.key.name === "set") && this.tok.type !== _.tokTypes.parenL && this.tok.type !== _.tokTypes.braceL) {
      method.kind = method.key.name;
      this.parsePropertyName(method);
      method.value = this.parseMethod(false);
    } else {
      if (!method.computed && !method["static"] && !isGenerator && (method.key.type === "Identifier" && method.key.name === "constructor" || method.key.type === "Literal" && method.key.value === "constructor")) {
        method.kind = "constructor";
      } else {
        method.kind = "method";
      }
      method.value = this.parseMethod(isGenerator);
    }
    node.body.body.push(this.finishNode(method, "MethodDefinition"));
  }
  this.popCx();
  if (!this.eat(_.tokTypes.braceR)) {
    // If there is no closing brace, make the node span to the start
    // of the next token (this is useful for Tern)
    this.last.end = this.tok.start;
    if (this.options.locations) this.last.loc.end = this.tok.loc.start;
  }
  this.semicolon();
  this.finishNode(node.body, "ClassBody");
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
};

lp.parseFunction = function (node, isStatement) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 6) {
    node.generator = this.eat(_.tokTypes.star);
  }
  if (this.tok.type === _.tokTypes.name) node.id = this.parseIdent();else if (isStatement) node.id = this.dummyIdent();
  node.params = this.parseFunctionParams();
  node.body = this.parseBlock();
  return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
};

lp.parseExport = function () {
  var node = this.startNode();
  this.next();
  if (this.eat(_.tokTypes.star)) {
    node.source = this.eatContextual("from") ? this.parseExprAtom() : this.dummyString();
    return this.finishNode(node, "ExportAllDeclaration");
  }
  if (this.eat(_.tokTypes._default)) {
    var expr = this.parseMaybeAssign();
    if (expr.id) {
      switch (expr.type) {
        case "FunctionExpression":
          expr.type = "FunctionDeclaration";break;
        case "ClassExpression":
          expr.type = "ClassDeclaration";break;
      }
    }
    node.declaration = expr;
    this.semicolon();
    return this.finishNode(node, "ExportDefaultDeclaration");
  }
  if (this.tok.type.keyword || this.toks.isLet()) {
    node.declaration = this.parseStatement();
    node.specifiers = [];
    node.source = null;
  } else {
    node.declaration = null;
    node.specifiers = this.parseExportSpecifierList();
    node.source = this.eatContextual("from") ? this.parseExprAtom() : null;
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration");
};

lp.parseImport = function () {
  var node = this.startNode();
  this.next();
  if (this.tok.type === _.tokTypes.string) {
    node.specifiers = [];
    node.source = this.parseExprAtom();
    node.kind = '';
  } else {
    var elt = undefined;
    if (this.tok.type === _.tokTypes.name && this.tok.value !== "from") {
      elt = this.startNode();
      elt.local = this.parseIdent();
      this.finishNode(elt, "ImportDefaultSpecifier");
      this.eat(_.tokTypes.comma);
    }
    node.specifiers = this.parseImportSpecifierList();
    node.source = this.eatContextual("from") && this.tok.type == _.tokTypes.string ? this.parseExprAtom() : this.dummyString();
    if (elt) node.specifiers.unshift(elt);
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration");
};

lp.parseImportSpecifierList = function () {
  var elts = [];
  if (this.tok.type === _.tokTypes.star) {
    var elt = this.startNode();
    this.next();
    elt.local = this.eatContextual("as") ? this.parseIdent() : this.dummyIdent();
    elts.push(this.finishNode(elt, "ImportNamespaceSpecifier"));
  } else {
    var indent = this.curIndent,
        line = this.curLineStart,
        continuedLine = this.nextLineStart;
    this.pushCx();
    this.eat(_.tokTypes.braceL);
    if (this.curLineStart > continuedLine) continuedLine = this.curLineStart;
    while (!this.closes(_.tokTypes.braceR, indent + (this.curLineStart <= continuedLine ? 1 : 0), line)) {
      var elt = this.startNode();
      if (this.eat(_.tokTypes.star)) {
        elt.local = this.eatContextual("as") ? this.parseIdent() : this.dummyIdent();
        this.finishNode(elt, "ImportNamespaceSpecifier");
      } else {
        if (this.isContextual("from")) break;
        elt.imported = this.parseIdent();
        if (_parseutil.isDummy(elt.imported)) break;
        elt.local = this.eatContextual("as") ? this.parseIdent() : elt.imported;
        this.finishNode(elt, "ImportSpecifier");
      }
      elts.push(elt);
      this.eat(_.tokTypes.comma);
    }
    this.eat(_.tokTypes.braceR);
    this.popCx();
  }
  return elts;
};

lp.parseExportSpecifierList = function () {
  var elts = [];
  var indent = this.curIndent,
      line = this.curLineStart,
      continuedLine = this.nextLineStart;
  this.pushCx();
  this.eat(_.tokTypes.braceL);
  if (this.curLineStart > continuedLine) continuedLine = this.curLineStart;
  while (!this.closes(_.tokTypes.braceR, indent + (this.curLineStart <= continuedLine ? 1 : 0), line)) {
    if (this.isContextual("from")) break;
    var elt = this.startNode();
    elt.local = this.parseIdent();
    if (_parseutil.isDummy(elt.local)) break;
    elt.exported = this.eatContextual("as") ? this.parseIdent() : elt.local;
    this.finishNode(elt, "ExportSpecifier");
    elts.push(elt);
    this.eat(_.tokTypes.comma);
  }
  this.eat(_.tokTypes.braceR);
  this.popCx();
  return elts;
};

},{"..":1,"./parseutil":4,"./state":5}],7:[function(_dereq_,module,exports){
"use strict";

var _ = _dereq_("..");

var _state = _dereq_("./state");

var lp = _state.LooseParser.prototype;

function isSpace(ch) {
  return ch < 14 && ch > 8 || ch === 32 || ch === 160 || _.isNewLine(ch);
}

lp.next = function () {
  this.last = this.tok;
  if (this.ahead.length) this.tok = this.ahead.shift();else this.tok = this.readToken();

  if (this.tok.start >= this.nextLineStart) {
    while (this.tok.start >= this.nextLineStart) {
      this.curLineStart = this.nextLineStart;
      this.nextLineStart = this.lineEnd(this.curLineStart) + 1;
    }
    this.curIndent = this.indentationAfter(this.curLineStart);
  }
};

lp.readToken = function () {
  for (;;) {
    try {
      this.toks.next();
      if (this.toks.type === _.tokTypes.dot && this.input.substr(this.toks.end, 1) === "." && this.options.ecmaVersion >= 6) {
        this.toks.end++;
        this.toks.type = _.tokTypes.ellipsis;
      }
      return new _.Token(this.toks);
    } catch (e) {
      if (!(e instanceof SyntaxError)) throw e;

      // Try to skip some text, based on the error message, and then continue
      var msg = e.message,
          pos = e.raisedAt,
          replace = true;
      if (/unterminated/i.test(msg)) {
        pos = this.lineEnd(e.pos + 1);
        if (/string/.test(msg)) {
          replace = { start: e.pos, end: pos, type: _.tokTypes.string, value: this.input.slice(e.pos + 1, pos) };
        } else if (/regular expr/i.test(msg)) {
          var re = this.input.slice(e.pos, pos);
          try {
            re = new RegExp(re);
          } catch (e) {}
          replace = { start: e.pos, end: pos, type: _.tokTypes.regexp, value: re };
        } else if (/template/.test(msg)) {
          replace = { start: e.pos, end: pos,
            type: _.tokTypes.template,
            value: this.input.slice(e.pos, pos) };
        } else {
          replace = false;
        }
      } else if (/invalid (unicode|regexp|number)|expecting unicode|octal literal|is reserved|directly after number|expected number in radix/i.test(msg)) {
        while (pos < this.input.length && !isSpace(this.input.charCodeAt(pos))) ++pos;
      } else if (/character escape|expected hexadecimal/i.test(msg)) {
        while (pos < this.input.length) {
          var ch = this.input.charCodeAt(pos++);
          if (ch === 34 || ch === 39 || _.isNewLine(ch)) break;
        }
      } else if (/unexpected character/i.test(msg)) {
        pos++;
        replace = false;
      } else if (/regular expression/i.test(msg)) {
        replace = true;
      } else {
        throw e;
      }
      this.resetTo(pos);
      if (replace === true) replace = { start: pos, end: pos, type: _.tokTypes.name, value: "✖" };
      if (replace) {
        if (this.options.locations) replace.loc = new _.SourceLocation(this.toks, _.getLineInfo(this.input, replace.start), _.getLineInfo(this.input, replace.end));
        return replace;
      }
    }
  }
};

lp.resetTo = function (pos) {
  this.toks.pos = pos;
  var ch = this.input.charAt(pos - 1);
  this.toks.exprAllowed = !ch || /[\[\{\(,;:?\/*=+\-~!|&%^<>]/.test(ch) || /[enwfd]/.test(ch) && /\b(keywords|case|else|return|throw|new|in|(instance|type)of|delete|void)$/.test(this.input.slice(pos - 10, pos));

  if (this.options.locations) {
    this.toks.curLine = 1;
    this.toks.lineStart = _.lineBreakG.lastIndex = 0;
    var match = undefined;
    while ((match = _.lineBreakG.exec(this.input)) && match.index < pos) {
      ++this.toks.curLine;
      this.toks.lineStart = match.index + match[0].length;
    }
  }
};

lp.lookAhead = function (n) {
  while (n > this.ahead.length) this.ahead.push(this.readToken());
  return this.ahead[n - 1];
};

},{"..":1,"./state":5}]},{},[3])(3)
});
  (function(acorn) {
  var module = {exports: {}};
  var NotAsync = {} ;
var asyncExit = /^async[\t ]+(return|throw)/ ;
var asyncFunction = /^async[\t ]+function/ ;
var atomOrPropertyOrLabel = /^\s*[):;]/ ;
var removeComments = /([^\n])\/\*(\*(?!\/)|[^\n*])*\*\/([^\n])/g ;

function hasLineTerminatorBeforeNext(st, since) {
    return st.lineStart >= since;
}

function test(regex,st,noComment) {
    var src = st.input.slice(st.start) ;
    if (noComment) {
        src = src.replace(removeComments,"$1 $3") ;
  }
    return regex.test(src);
}

/* Return the object holding the parser's 'State'. This is different between acorn ('this')
 * and babylon ('this.state') */
function state(p) {
    if (('state' in p) && p.state.constructor && p.state.constructor.name==='State')
        return p.state ; // Probably babylon
    return p ; // Probably acorn
}

/* Create a new parser derived from the specified parser, so that in the
 * event of an error we can back out and try again */
function subParse(parser, pos, extensions) {
    // NB: The Babylon constructor does NOT expect 'pos' as an argument, and so
    // the input needs truncation at the start position, however at present
    // this doesn't work nicely as all the node location/start/end values
    // are therefore offset. Consequently, this plug-in is NOT currently working
    // with the (undocumented) Babylon plug-in interface.
    var p = new parser.constructor(parser.options, parser.input, pos);
    if (extensions)
        for (var k in extensions)
            p[k] = extensions[k] ;

    var src = state(parser) ;
    var dest = state(p) ;
    ['inFunction','inAsyncFunction','inAsync','inGenerator','inModule'].forEach(function(k){
        if (k in src)
            dest[k] = src[k] ;
    }) ;
    p.nextToken();
    return p;
}

function asyncAwaitPlugin (parser,options){
    var es7check = function(){} ;

    parser.extend("initialContext",function(base){
        return function(){
            if (this.options.ecmaVersion < 7) {
                es7check = function(node) {
                    parser.raise(node.start,"async/await keywords only available when ecmaVersion>=7") ;
                } ;
            }
      this.reservedWords = new RegExp(this.reservedWords.toString().replace(/await|async/g,"").replace("|/","/").replace("/|","/").replace("||","|")) ;
      this.reservedWordsStrict = new RegExp(this.reservedWordsStrict.toString().replace(/await|async/g,"").replace("|/","/").replace("/|","/").replace("||","|")) ;
      this.reservedWordsStrictBind = new RegExp(this.reservedWordsStrictBind.toString().replace(/await|async/g,"").replace("|/","/").replace("/|","/").replace("||","|")) ;
            this.inAsyncFunction = options.inAsyncFunction ;
            if (options.awaitAnywhere && options.inAsyncFunction)
                parser.raise(node.start,"The options awaitAnywhere and inAsyncFunction are mutually exclusive") ;

            return base.apply(this,arguments);
        }
    }) ;

    parser.extend("shouldParseExportStatement",function(base){
        return function(){
            if (this.type.label==='name' && this.value==='async' && test(asyncFunction,state(this))) {
                return true ;
            }
            return base.apply(this,arguments) ;
        }
    }) ;

    parser.extend("parseStatement",function(base){
        return function (declaration, topLevel) {
            var st = state(this) ;
            var start = st.start;
            var startLoc = st.startLoc;
            if (st.type.label==='name') {
                if (test(asyncFunction,st,true)) {
                    var wasAsync = st.inAsyncFunction ;
                    try {
                        st.inAsyncFunction = true ;
                        this.next() ;
                        var r = this.parseStatement(declaration, topLevel) ;
                        r.async = true ;
                        r.start = start;
                        r.loc && (r.loc.start = startLoc);
                        return r ;
                    } finally {
                        st.inAsyncFunction = wasAsync ;
                    }
                } else if ((typeof options==="object" && options.asyncExits) && test(asyncExit,st)) {
                    // NON-STANDARD EXTENSION iff. options.asyncExits is set, the
                    // extensions 'async return <expr>?' and 'async throw <expr>?'
                    // are enabled. In each case they are the standard ESTree nodes
                    // with the flag 'async:true'
                    this.next() ;
                    var r = this.parseStatement(declaration, topLevel) ;
                    r.async = true ;
                    r.start = start;
                    r.loc && (r.loc.start = startLoc);
                    return r ;
                }
            }
            return base.apply(this,arguments);
        }
    }) ;

  parser.extend("parseIdent",function(base){
        return function(liberal){
                var id = base.apply(this,arguments);
                var st = state(this) ;
                if (st.inAsyncFunction && id.name==='await') {
                    if (arguments.length===0) {
                        this.raise(id.start,"'await' is reserved within async functions") ;
                    }
                }
                return id ;
        }
    }) ;

    parser.extend("parseExprAtom",function(base){
        return function(refShorthandDefaultPos){
            var st = state(this) ;
            var start = st.start ;
            var startLoc = st.startLoc;
            var rhs,r = base.apply(this,arguments);
            if (r.type==='Identifier') {
                if (r.name==='async' && !hasLineTerminatorBeforeNext(st, r.end)) {
                    // Is this really an async function?
                    var isAsync = st.inAsyncFunction ;
                    try {
                        st.inAsyncFunction = true ;
                        var pp = this ;
                        var inBody = false ;

                        var parseHooks = {
                            parseFunctionBody:function(node,isArrowFunction){
                                try {
                                    var wasInBody = inBody ;
                                    inBody = true ;
                                    return pp.parseFunctionBody.apply(this,arguments) ;
                                } finally {
                                    inBody = wasInBody ;
                                }
                            },
                            raise:function(){
                                try {
                                    return pp.raise.apply(this,arguments) ;
                                } catch(ex) {
                                    throw inBody?ex:NotAsync ;
                                }
                            }
                        } ;

                        rhs = subParse(this,st.start,parseHooks).parseExpression() ;
                        if (rhs.type==='SequenceExpression')
                            rhs = rhs.expressions[0] ;
                        if (rhs.type==='FunctionExpression' || rhs.type==='FunctionDeclaration' || rhs.type==='ArrowFunctionExpression') {
                            rhs.async = true ;
                            rhs.start = start;
                            rhs.loc && (rhs.loc.start = startLoc);
                            st.pos = rhs.end;
                            this.next();
                            es7check(rhs) ;
                            return rhs ;
                        }
                    } catch (ex) {
                        if (ex!==NotAsync)
                            throw ex ;
                    }
                    finally {
                        st.inAsyncFunction = isAsync ;
                    }
                }
                else if (r.name==='await') {
                    var n = this.startNodeAt(r.start, r.loc && r.loc.start);
                    if (st.inAsyncFunction) {
                        rhs = this.parseExprSubscripts() ;
                        n.operator = 'await' ;
                        n.argument = rhs ;
                        n = this.finishNodeAt(n,'AwaitExpression', rhs.end, rhs.loc && rhs.loc.end) ;
                        es7check(n) ;
                        return n ;
                    } else
                        // NON-STANDARD EXTENSION iff. options.awaitAnywhere is true,
                        // an 'AwaitExpression' is allowed anywhere the token 'await'
                        // could not be an identifier with the name 'await'.

                        // Look-ahead to see if this is really a property or label called async or await
                        if (st.input.slice(r.end).match(atomOrPropertyOrLabel))
                            return r ; // This is a valid property name or label

                        if (typeof options==="object" && options.awaitAnywhere) {
                            start = st.start ;
                            rhs = subParse(this,start-4).parseExprSubscripts() ;
                            if (rhs.end<=start) {
                                rhs = subParse(this,start).parseExprSubscripts() ;
                                n.operator = 'await' ;
                                n.argument = rhs ;
                                n = this.finishNodeAt(n,'AwaitExpression', rhs.end, rhs.loc && rhs.loc.end) ;
                                st.pos = rhs.end;
                                this.next();
                                es7check(n) ;
                                return n ;
                            }
                        }
                }
            }
            return r ;
        }
    }) ;

    parser.extend('finishNodeAt',function(base){
            return function(node,type,pos,loc) {
                if (node.__asyncValue) {
                    delete node.__asyncValue ;
                    node.value.async = true ;
                }
                return base.apply(this,arguments) ;
            }
    }) ;

    parser.extend('finishNode',function(base){
            return function(node,type) {
                if (node.__asyncValue) {
                    delete node.__asyncValue ;
                    node.value.async = true ;
                }
                return base.apply(this,arguments) ;
            }
    }) ;

    parser.extend("parsePropertyName",function(base){
        return function (prop) {
            var st = state(this) ;
            var key = base.apply(this,arguments) ;
            if (key.type === "Identifier" && key.name === "async" && !hasLineTerminatorBeforeNext(st, key.end)) {
                // Look-ahead to see if this is really a property or label called async or await
                if (!st.input.slice(key.end).match(atomOrPropertyOrLabel)){
                    es7check(prop) ;
                    key = base.apply(this,arguments) ;
                    if (key.type==='Identifier') {
                        if (key.name==='constructor')
                            this.raise(key.start,"'constructor()' cannot be be async") ;
                        else if (key.name==='set')
                            this.raise(key.start,"'set <member>(value)' cannot be be async") ;
                    }
                    prop.__asyncValue = true ;
                }
            }
            return key;
        };
    }) ;

    parser.extend("parseClassMethod",function(base){
        return function (classBody, method, isGenerator) {
            var st, wasAsync ;
            if (method.__asyncValue) {
                st = state(this) ;
                wasAsync = st.inAsyncFunction ;
                st.inAsyncFunction = true ;
            }
            var r = base.apply(this,arguments) ;
            if (st) {
                st.inAsyncFunction = wasAsync ;
            }
            return r ;
        }
    }) ;
    
    parser.extend("parsePropertyValue",function(base){
        return function (prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors) {
            var st, wasAsync ;
            if (prop.__asyncValue) {
                st = state(this) ;
                wasAsync = st.inAsyncFunction ;
                st.inAsyncFunction = true ;
            }
            var r = base.apply(this,arguments) ;
            if (st) {
                st.inAsyncFunction = wasAsync ;
            }
            return r ;
        }
    }) ;
}

module.exports = function(acorn) {
    acorn.plugins.asyncawait = asyncAwaitPlugin ;
    return acorn
}

  module.exports(acorn);
})(this.acorn);
  return this.acorn;
})();;
;(function(GLOBAL) {
  // Generated by CommonJS Everywhere 0.9.7
(function (global) {
  function require(file, parentModule) {
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    var resolved = require.resolve(file);
    if (!resolved)
      throw new Error('Failed to resolve module ' + file);
    var module$ = {
        id: file,
        require: require,
        filename: file,
        exports: {},
        loaded: false,
        parent: parentModule,
        children: []
      };
    if (parentModule)
      parentModule.children.push(module$);
    var dirname = file.slice(0, file.lastIndexOf('/') + 1);
    require.cache[file] = module$.exports;
    resolved.call(module$.exports, module$, module$.exports, dirname, file);
    module$.loaded = true;
    return require.cache[file] = module$.exports;
  }
  require.modules = {};
  require.cache = {};
  require.resolve = function (file) {
    return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0;
  };
  require.define = function (file, fn) {
    require.modules[file] = fn;
  };
  var process = function () {
      var cwd = '/';
      return {
        title: 'browser',
        version: 'v4.1.1',
        browser: true,
        env: {},
        argv: [],
        nextTick: global.setImmediate || function (fn) {
          setTimeout(fn, 0);
        },
        cwd: function () {
          return cwd;
        },
        chdir: function (dir) {
          cwd = dir;
        }
      };
    }();
  require.define('/tools/entry-point.js', function (module, exports, __dirname, __filename) {
    (function () {
      'use strict';
      global.escodegen = require('/escodegen.js', module);
      GLOBAL.escodegen.browser = true;
    }());
  });
  require.define('/escodegen.js', function (module, exports, __dirname, __filename) {
    (function () {
      'use strict';
      var Syntax, Precedence, BinaryPrecedence, SourceNode, estraverse, esutils, isArray, base, indent, json, renumber, hexadecimal, quotes, escapeless, newline, space, parentheses, semicolons, safeConcatenation, directive, extra, parse, sourceMap, sourceCode, preserveBlankLines, FORMAT_MINIFY, FORMAT_DEFAULTS;
      estraverse = require('/node_modules/estraverse/estraverse.js', module);
      esutils = require('/node_modules/esutils/lib/utils.js', module);
      Syntax = estraverse.Syntax;
      function isExpression(node) {
        return CodeGenerator.Expression.hasOwnProperty(node.type);
      }
      function isStatement(node) {
        return CodeGenerator.Statement.hasOwnProperty(node.type);
      }
      Precedence = {
        Sequence: 0,
        Yield: 1,
        Await: 1,
        Assignment: 1,
        Conditional: 2,
        ArrowFunction: 2,
        LogicalOR: 3,
        LogicalAND: 4,
        BitwiseOR: 5,
        BitwiseXOR: 6,
        BitwiseAND: 7,
        Equality: 8,
        Relational: 9,
        BitwiseSHIFT: 10,
        Additive: 11,
        Multiplicative: 12,
        Unary: 13,
        Postfix: 14,
        Call: 15,
        New: 16,
        TaggedTemplate: 17,
        Member: 18,
        Primary: 19
      };
      BinaryPrecedence = {
        '||': Precedence.LogicalOR,
        '&&': Precedence.LogicalAND,
        '|': Precedence.BitwiseOR,
        '^': Precedence.BitwiseXOR,
        '&': Precedence.BitwiseAND,
        '==': Precedence.Equality,
        '!=': Precedence.Equality,
        '===': Precedence.Equality,
        '!==': Precedence.Equality,
        'is': Precedence.Equality,
        'isnt': Precedence.Equality,
        '<': Precedence.Relational,
        '>': Precedence.Relational,
        '<=': Precedence.Relational,
        '>=': Precedence.Relational,
        'in': Precedence.Relational,
        'instanceof': Precedence.Relational,
        '<<': Precedence.BitwiseSHIFT,
        '>>': Precedence.BitwiseSHIFT,
        '>>>': Precedence.BitwiseSHIFT,
        '+': Precedence.Additive,
        '-': Precedence.Additive,
        '*': Precedence.Multiplicative,
        '%': Precedence.Multiplicative,
        '/': Precedence.Multiplicative
      };
      var F_ALLOW_IN = 1, F_ALLOW_CALL = 1 << 1, F_ALLOW_UNPARATH_NEW = 1 << 2, F_FUNC_BODY = 1 << 3, F_DIRECTIVE_CTX = 1 << 4, F_SEMICOLON_OPT = 1 << 5;
      var E_FTT = F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW, E_TTF = F_ALLOW_IN | F_ALLOW_CALL, E_TTT = F_ALLOW_IN | F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW, E_TFF = F_ALLOW_IN, E_FFT = F_ALLOW_UNPARATH_NEW, E_TFT = F_ALLOW_IN | F_ALLOW_UNPARATH_NEW;
      var S_TFFF = F_ALLOW_IN, S_TFFT = F_ALLOW_IN | F_SEMICOLON_OPT, S_FFFF = 0, S_TFTF = F_ALLOW_IN | F_DIRECTIVE_CTX, S_TTFF = F_ALLOW_IN | F_FUNC_BODY;
      function getDefaultOptions() {
        return {
          indent: null,
          base: null,
          parse: null,
          comment: false,
          format: {
            indent: {
              style: '    ',
              base: 0,
              adjustMultilineComment: false
            },
            newline: '\n',
            space: ' ',
            json: false,
            renumber: false,
            hexadecimal: false,
            quotes: 'single',
            escapeless: false,
            compact: false,
            parentheses: true,
            semicolons: true,
            safeConcatenation: false,
            preserveBlankLines: false
          },
          moz: {
            comprehensionExpressionStartsWithAssignment: false,
            starlessGenerator: false
          },
          sourceMap: null,
          sourceMapRoot: null,
          sourceMapWithCode: false,
          directive: false,
          raw: true,
          verbatim: null,
          sourceCode: null
        };
      }
      function stringRepeat(str, num) {
        var result = '';
        for (num |= 0; num > 0; num >>>= 1, str += str) {
          if (num & 1) {
            result += str;
          }
        }
        return result;
      }
      isArray = Array.isArray;
      if (!isArray) {
        isArray = function isArray(array) {
          return Object.prototype.toString.call(array) === '[object Array]';
        };
      }
      function hasLineTerminator(str) {
        return /[\r\n]/g.test(str);
      }
      function endsWithLineTerminator(str) {
        var len = str.length;
        return len && esutils.code.isLineTerminator(str.charCodeAt(len - 1));
      }
      function merge(target, override) {
        var key;
        for (key in override) {
          if (override.hasOwnProperty(key)) {
            target[key] = override[key];
          }
        }
        return target;
      }
      function updateDeeply(target, override) {
        var key, val;
        function isHashObject(target) {
          return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);
        }
        for (key in override) {
          if (override.hasOwnProperty(key)) {
            val = override[key];
            if (isHashObject(val)) {
              if (isHashObject(target[key])) {
                updateDeeply(target[key], val);
              } else {
                target[key] = updateDeeply({}, val);
              }
            } else {
              target[key] = val;
            }
          }
        }
        return target;
      }
      function generateNumber(value) {
        var result, point, temp, exponent, pos;
        if (value !== value) {
          throw new Error('Numeric literal whose value is NaN');
        }
        if (value < 0 || value === 0 && 1 / value < 0) {
          throw new Error('Numeric literal whose value is negative');
        }
        if (value === 1 / 0) {
          return json ? 'null' : renumber ? '1e400' : '1e+400';
        }
        result = '' + value;
        if (!renumber || result.length < 3) {
          return result;
        }
        point = result.indexOf('.');
        if (!json && result.charCodeAt(0) === 48 && point === 1) {
          point = 0;
          result = result.slice(1);
        }
        temp = result;
        result = result.replace('e+', 'e');
        exponent = 0;
        if ((pos = temp.indexOf('e')) > 0) {
          exponent = +temp.slice(pos + 1);
          temp = temp.slice(0, pos);
        }
        if (point >= 0) {
          exponent -= temp.length - point - 1;
          temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
        }
        pos = 0;
        while (temp.charCodeAt(temp.length + pos - 1) === 48) {
          --pos;
        }
        if (pos !== 0) {
          exponent -= pos;
          temp = temp.slice(0, pos);
        }
        if (exponent !== 0) {
          temp += 'e' + exponent;
        }
        if ((temp.length < result.length || hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length) && +temp === value) {
          result = temp;
        }
        return result;
      }
      function escapeRegExpCharacter(ch, previousIsBackslash) {
        if ((ch & ~1) === 8232) {
          return (previousIsBackslash ? 'u' : '\\u') + (ch === 8232 ? '2028' : '2029');
        } else if (ch === 10 || ch === 13) {
          return (previousIsBackslash ? '' : '\\') + (ch === 10 ? 'n' : 'r');
        }
        return String.fromCharCode(ch);
      }
      function generateRegExp(reg) {
        var match, result, flags, i, iz, ch, characterInBrack, previousIsBackslash;
        result = reg.toString();
        if (reg.source) {
          match = result.match(/\/([^\/]*)$/);
          if (!match) {
            return result;
          }
          flags = match[1];
          result = '';
          characterInBrack = false;
          previousIsBackslash = false;
          for (i = 0, iz = reg.source.length; i < iz; ++i) {
            ch = reg.source.charCodeAt(i);
            if (!previousIsBackslash) {
              if (characterInBrack) {
                if (ch === 93) {
                  characterInBrack = false;
                }
              } else {
                if (ch === 47) {
                  result += '\\';
                } else if (ch === 91) {
                  characterInBrack = true;
                }
              }
              result += escapeRegExpCharacter(ch, previousIsBackslash);
              previousIsBackslash = ch === 92;
            } else {
              result += escapeRegExpCharacter(ch, previousIsBackslash);
              previousIsBackslash = false;
            }
          }
          return '/' + result + '/' + flags;
        }
        return result;
      }
      function escapeAllowedCharacter(code, next) {
        var hex;
        if (code === 8) {
          return '\\b';
        }
        if (code === 12) {
          return '\\f';
        }
        if (code === 9) {
          return '\\t';
        }
        hex = code.toString(16).toUpperCase();
        if (json || code > 255) {
          return '\\u' + '0000'.slice(hex.length) + hex;
        } else if (code === 0 && !esutils.code.isDecimalDigit(next)) {
          return '\\0';
        } else if (code === 11) {
          return '\\x0B';
        } else {
          return '\\x' + '00'.slice(hex.length) + hex;
        }
      }
      function escapeDisallowedCharacter(code) {
        if (code === 92) {
          return '\\\\';
        }
        if (code === 10) {
          return '\\n';
        }
        if (code === 13) {
          return '\\r';
        }
        if (code === 8232) {
          return '\\u2028';
        }
        if (code === 8233) {
          return '\\u2029';
        }
        throw new Error('Incorrectly classified character');
      }
      function escapeDirective(str) {
        var i, iz, code, quote;
        quote = quotes === 'double' ? '"' : "'";
        for (i = 0, iz = str.length; i < iz; ++i) {
          code = str.charCodeAt(i);
          if (code === 39) {
            quote = '"';
            break;
          } else if (code === 34) {
            quote = "'";
            break;
          } else if (code === 92) {
            ++i;
          }
        }
        return quote + str + quote;
      }
      function escapeString(str) {
        var result = '', i, len, code, singleQuotes = 0, doubleQuotes = 0, single, quote;
        for (i = 0, len = str.length; i < len; ++i) {
          code = str.charCodeAt(i);
          if (code === 39) {
            ++singleQuotes;
          } else if (code === 34) {
            ++doubleQuotes;
          } else if (code === 47 && json) {
            result += '\\';
          } else if (esutils.code.isLineTerminator(code) || code === 92) {
            result += escapeDisallowedCharacter(code);
            continue;
          } else if (!esutils.code.isIdentifierPartES5(code) && (json && code < 32 || !json && !escapeless && (code < 32 || code > 126))) {
            result += escapeAllowedCharacter(code, str.charCodeAt(i + 1));
            continue;
          }
          result += String.fromCharCode(code);
        }
        single = !(quotes === 'double' || quotes === 'auto' && doubleQuotes < singleQuotes);
        quote = single ? "'" : '"';
        if (!(single ? singleQuotes : doubleQuotes)) {
          return quote + result + quote;
        }
        str = result;
        result = quote;
        for (i = 0, len = str.length; i < len; ++i) {
          code = str.charCodeAt(i);
          if (code === 39 && single || code === 34 && !single) {
            result += '\\';
          }
          result += String.fromCharCode(code);
        }
        return result + quote;
      }
      function flattenToString(arr) {
        var i, iz, elem, result = '';
        for (i = 0, iz = arr.length; i < iz; ++i) {
          elem = arr[i];
          result += isArray(elem) ? flattenToString(elem) : elem;
        }
        return result;
      }
      function toSourceNodeWhenNeeded(generated, node) {
        if (!sourceMap) {
          if (isArray(generated)) {
            return flattenToString(generated);
          } else {
            return generated;
          }
        }
        if (node == null) {
          if (generated instanceof SourceNode) {
            return generated;
          } else {
            node = {};
          }
        }
        if (node.loc == null) {
          return new SourceNode(null, null, sourceMap, generated, node.name || null);
        }
        return new SourceNode(node.loc.start.line, node.loc.start.column, sourceMap === true ? node.loc.source || null : sourceMap, generated, node.name || null);
      }
      function noEmptySpace() {
        return space ? space : ' ';
      }
      function join(left, right) {
        var leftSource, rightSource, leftCharCode, rightCharCode;
        leftSource = toSourceNodeWhenNeeded(left).toString();
        if (leftSource.length === 0) {
          return [right];
        }
        rightSource = toSourceNodeWhenNeeded(right).toString();
        if (rightSource.length === 0) {
          return [left];
        }
        leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
        rightCharCode = rightSource.charCodeAt(0);
        if ((leftCharCode === 43 || leftCharCode === 45) && leftCharCode === rightCharCode || esutils.code.isIdentifierPartES5(leftCharCode) && esutils.code.isIdentifierPartES5(rightCharCode) || leftCharCode === 47 && rightCharCode === 105) {
          return [
            left,
            noEmptySpace(),
            right
          ];
        } else if (esutils.code.isWhiteSpace(leftCharCode) || esutils.code.isLineTerminator(leftCharCode) || esutils.code.isWhiteSpace(rightCharCode) || esutils.code.isLineTerminator(rightCharCode)) {
          return [
            left,
            right
          ];
        }
        return [
          left,
          space,
          right
        ];
      }
      function addIndent(stmt) {
        return [
          base,
          stmt
        ];
      }
      function withIndent(fn) {
        var previousBase;
        previousBase = base;
        base += indent;
        fn(base);
        base = previousBase;
      }
      function calculateSpaces(str) {
        var i;
        for (i = str.length - 1; i >= 0; --i) {
          if (esutils.code.isLineTerminator(str.charCodeAt(i))) {
            break;
          }
        }
        return str.length - 1 - i;
      }
      function adjustMultilineComment(value, specialBase) {
        var array, i, len, line, j, spaces, previousBase, sn;
        array = value.split(/\r\n|[\r\n]/);
        spaces = Number.MAX_VALUE;
        for (i = 1, len = array.length; i < len; ++i) {
          line = array[i];
          j = 0;
          while (j < line.length && esutils.code.isWhiteSpace(line.charCodeAt(j))) {
            ++j;
          }
          if (spaces > j) {
            spaces = j;
          }
        }
        if (typeof specialBase !== 'undefined') {
          previousBase = base;
          if (array[1][spaces] === '*') {
            specialBase += ' ';
          }
          base = specialBase;
        } else {
          if (spaces & 1) {
            --spaces;
          }
          previousBase = base;
        }
        for (i = 1, len = array.length; i < len; ++i) {
          sn = toSourceNodeWhenNeeded(addIndent(array[i].slice(spaces)));
          array[i] = sourceMap ? sn.join('') : sn;
        }
        base = previousBase;
        return array.join('\n');
      }
      function generateComment(comment, specialBase) {
        if (comment.type === 'Line') {
          if (endsWithLineTerminator(comment.value)) {
            return '//' + comment.value;
          } else {
            var result = '//' + comment.value;
            if (!preserveBlankLines) {
              result += '\n';
            }
            return result;
          }
        }
        if (extra.format.indent.adjustMultilineComment && /[\n\r]/.test(comment.value)) {
          return adjustMultilineComment('/*' + comment.value + '*/', specialBase);
        }
        return '/*' + comment.value + '*/';
      }
      function addComments(stmt, result) {
        var i, len, comment, save, tailingToStatement, specialBase, fragment, extRange, range, prevRange, prefix, infix, suffix, count;
        if (stmt.leadingComments && stmt.leadingComments.length > 0) {
          save = result;
          if (preserveBlankLines) {
            comment = stmt.leadingComments[0];
            result = [];
            extRange = comment.extendedRange;
            range = comment.range;
            prefix = sourceCode.substring(extRange[0], range[0]);
            count = (prefix.match(/\n/g) || []).length;
            if (count > 0) {
              result.push(stringRepeat('\n', count));
              result.push(addIndent(generateComment(comment)));
            } else {
              result.push(prefix);
              result.push(generateComment(comment));
            }
            prevRange = range;
            for (i = 1, len = stmt.leadingComments.length; i < len; i++) {
              comment = stmt.leadingComments[i];
              range = comment.range;
              infix = sourceCode.substring(prevRange[1], range[0]);
              count = (infix.match(/\n/g) || []).length;
              result.push(stringRepeat('\n', count));
              result.push(addIndent(generateComment(comment)));
              prevRange = range;
            }
            suffix = sourceCode.substring(range[1], extRange[1]);
            count = (suffix.match(/\n/g) || []).length;
            result.push(stringRepeat('\n', count));
          } else {
            comment = stmt.leadingComments[0];
            result = [];
            if (safeConcatenation && stmt.type === Syntax.Program && stmt.body.length === 0) {
              result.push('\n');
            }
            result.push(generateComment(comment));
            if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
              result.push('\n');
            }
            for (i = 1, len = stmt.leadingComments.length; i < len; ++i) {
              comment = stmt.leadingComments[i];
              fragment = [generateComment(comment)];
              if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                fragment.push('\n');
              }
              result.push(addIndent(fragment));
            }
          }
          result.push(addIndent(save));
        }
        if (stmt.trailingComments) {
          if (preserveBlankLines) {
            comment = stmt.trailingComments[0];
            extRange = comment.extendedRange;
            range = comment.range;
            prefix = sourceCode.substring(extRange[0], range[0]);
            count = (prefix.match(/\n/g) || []).length;
            if (count > 0) {
              result.push(stringRepeat('\n', count));
              result.push(addIndent(generateComment(comment)));
            } else {
              result.push(prefix);
              result.push(generateComment(comment));
            }
          } else {
            tailingToStatement = !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());
            specialBase = stringRepeat(' ', calculateSpaces(toSourceNodeWhenNeeded([
              base,
              result,
              indent
            ]).toString()));
            for (i = 0, len = stmt.trailingComments.length; i < len; ++i) {
              comment = stmt.trailingComments[i];
              if (tailingToStatement) {
                if (i === 0) {
                  result = [
                    result,
                    indent
                  ];
                } else {
                  result = [
                    result,
                    specialBase
                  ];
                }
                result.push(generateComment(comment, specialBase));
              } else {
                result = [
                  result,
                  addIndent(generateComment(comment))
                ];
              }
              if (i !== len - 1 && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                result = [
                  result,
                  '\n'
                ];
              }
            }
          }
        }
        return result;
      }
      function generateBlankLines(start, end, result) {
        var j, newlineCount = 0;
        for (j = start; j < end; j++) {
          if (sourceCode[j] === '\n') {
            newlineCount++;
          }
        }
        for (j = 1; j < newlineCount; j++) {
          result.push(newline);
        }
      }
      function parenthesize(text, current, should) {
        if (current < should) {
          return [
            '(',
            text,
            ')'
          ];
        }
        return text;
      }
      function generateVerbatimString(string) {
        var i, iz, result;
        result = string.split(/\r\n|\n/);
        for (i = 1, iz = result.length; i < iz; i++) {
          result[i] = newline + base + result[i];
        }
        return result;
      }
      function generateVerbatim(expr, precedence) {
        var verbatim, result, prec;
        verbatim = expr[extra.verbatim];
        if (typeof verbatim === 'string') {
          result = parenthesize(generateVerbatimString(verbatim), Precedence.Sequence, precedence);
        } else {
          result = generateVerbatimString(verbatim.content);
          prec = verbatim.precedence != null ? verbatim.precedence : Precedence.Sequence;
          result = parenthesize(result, prec, precedence);
        }
        return toSourceNodeWhenNeeded(result, expr);
      }
      function CodeGenerator() {
      }
      CodeGenerator.prototype.maybeBlock = function (stmt, flags) {
        var result, noLeadingComment, that = this;
        noLeadingComment = !extra.comment || !stmt.leadingComments;
        if (stmt.type === Syntax.BlockStatement && noLeadingComment) {
          return [
            space,
            this.generateStatement(stmt, flags)
          ];
        }
        if (stmt.type === Syntax.EmptyStatement && noLeadingComment) {
          return ';';
        }
        withIndent(function () {
          result = [
            newline,
            addIndent(that.generateStatement(stmt, flags))
          ];
        });
        return result;
      };
      CodeGenerator.prototype.maybeBlockSuffix = function (stmt, result) {
        var ends = endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString());
        if (stmt.type === Syntax.BlockStatement && (!extra.comment || !stmt.leadingComments) && !ends) {
          return [
            result,
            space
          ];
        }
        if (ends) {
          return [
            result,
            base
          ];
        }
        return [
          result,
          newline,
          base
        ];
      };
      function generateIdentifier(node) {
        return toSourceNodeWhenNeeded(node.name, node);
      }
      function generateAsyncPrefix(node, spaceRequired) {
        return node.async ? 'async' + (spaceRequired ? noEmptySpace() : space) : '';
      }
      function generateStarSuffix(node) {
        var isGenerator = node.generator && !extra.moz.starlessGenerator;
        return isGenerator ? '*' + space : '';
      }
      function generateMethodPrefix(prop) {
        var func = prop.value;
        if (func.async) {
          return generateAsyncPrefix(func, !prop.computed);
        } else {
          return generateStarSuffix(func) ? '*' : '';
        }
      }
      CodeGenerator.prototype.generatePattern = function (node, precedence, flags) {
        if (node.type === Syntax.Identifier) {
          return generateIdentifier(node);
        }
        return this.generateExpression(node, precedence, flags);
      };
      CodeGenerator.prototype.generateFunctionParams = function (node) {
        var i, iz, result, hasDefault;
        hasDefault = false;
        if (node.type === Syntax.ArrowFunctionExpression && !node.rest && (!node.defaults || node.defaults.length === 0) && node.params.length === 1 && node.params[0].type === Syntax.Identifier) {
          result = [
            generateAsyncPrefix(node, true),
            generateIdentifier(node.params[0])
          ];
        } else {
          result = node.type === Syntax.ArrowFunctionExpression ? [generateAsyncPrefix(node, false)] : [];
          result.push('(');
          if (node.defaults) {
            hasDefault = true;
          }
          for (i = 0, iz = node.params.length; i < iz; ++i) {
            if (hasDefault && node.defaults[i]) {
              result.push(this.generateAssignment(node.params[i], node.defaults[i], '=', Precedence.Assignment, E_TTT));
            } else {
              result.push(this.generatePattern(node.params[i], Precedence.Assignment, E_TTT));
            }
            if (i + 1 < iz) {
              result.push(',' + space);
            }
          }
          if (node.rest) {
            if (node.params.length) {
              result.push(',' + space);
            }
            result.push('...');
            result.push(generateIdentifier(node.rest));
          }
          result.push(')');
        }
        return result;
      };
      CodeGenerator.prototype.generateFunctionBody = function (node) {
        var result, expr;
        result = this.generateFunctionParams(node);
        if (node.type === Syntax.ArrowFunctionExpression) {
          result.push(space);
          result.push('=>');
        }
        if (node.expression) {
          result.push(space);
          expr = this.generateExpression(node.body, Precedence.Assignment, E_TTT);
          if (expr.toString().charAt(0) === '{') {
            expr = [
              '(',
              expr,
              ')'
            ];
          }
          result.push(expr);
        } else {
          result.push(this.maybeBlock(node.body, S_TTFF));
        }
        return result;
      };
      CodeGenerator.prototype.generateIterationForStatement = function (operator, stmt, flags) {
        var result = ['for' + space + '('], that = this;
        withIndent(function () {
          if (stmt.left.type === Syntax.VariableDeclaration) {
            withIndent(function () {
              result.push(stmt.left.kind + noEmptySpace());
              result.push(that.generateStatement(stmt.left.declarations[0], S_FFFF));
            });
          } else {
            result.push(that.generateExpression(stmt.left, Precedence.Call, E_TTT));
          }
          result = join(result, operator);
          result = [
            join(result, that.generateExpression(stmt.right, Precedence.Sequence, E_TTT)),
            ')'
          ];
        });
        result.push(this.maybeBlock(stmt.body, flags));
        return result;
      };
      CodeGenerator.prototype.generatePropertyKey = function (expr, computed) {
        var result = [];
        if (computed) {
          result.push('[');
        }
        result.push(this.generateExpression(expr, Precedence.Sequence, E_TTT));
        if (computed) {
          result.push(']');
        }
        return result;
      };
      CodeGenerator.prototype.generateAssignment = function (left, right, operator, precedence, flags) {
        if (Precedence.Assignment < precedence) {
          flags |= F_ALLOW_IN;
        }
        return parenthesize([
          this.generateExpression(left, Precedence.Call, flags),
          space + operator + space,
          this.generateExpression(right, Precedence.Assignment, flags)
        ], Precedence.Assignment, precedence);
      };
      CodeGenerator.prototype.semicolon = function (flags) {
        if (!semicolons && flags & F_SEMICOLON_OPT) {
          return '';
        }
        return ';';
      };
      CodeGenerator.Statement = {
        BlockStatement: function (stmt, flags) {
          var range, content, result = [
              '{',
              newline
            ], that = this;
          withIndent(function () {
            if (stmt.body.length === 0 && preserveBlankLines) {
              range = stmt.range;
              if (range[1] - range[0] > 2) {
                content = sourceCode.substring(range[0] + 1, range[1] - 1);
                if (content[0] === '\n') {
                  result = ['{'];
                }
                result.push(content);
              }
            }
            var i, iz, fragment, bodyFlags;
            bodyFlags = S_TFFF;
            if (flags & F_FUNC_BODY) {
              bodyFlags |= F_DIRECTIVE_CTX;
            }
            for (i = 0, iz = stmt.body.length; i < iz; ++i) {
              if (preserveBlankLines) {
                if (i === 0) {
                  if (stmt.body[0].leadingComments) {
                    range = stmt.body[0].leadingComments[0].extendedRange;
                    content = sourceCode.substring(range[0], range[1]);
                    if (content[0] === '\n') {
                      result = ['{'];
                    }
                  }
                  if (!stmt.body[0].leadingComments) {
                    generateBlankLines(stmt.range[0], stmt.body[0].range[0], result);
                  }
                }
                if (i > 0) {
                  if (!stmt.body[i - 1].trailingComments && !stmt.body[i].leadingComments) {
                    generateBlankLines(stmt.body[i - 1].range[1], stmt.body[i].range[0], result);
                  }
                }
              }
              if (i === iz - 1) {
                bodyFlags |= F_SEMICOLON_OPT;
              }
              if (stmt.body[i].leadingComments && preserveBlankLines) {
                fragment = that.generateStatement(stmt.body[i], bodyFlags);
              } else {
                fragment = addIndent(that.generateStatement(stmt.body[i], bodyFlags));
              }
              result.push(fragment);
              if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                if (preserveBlankLines && i < iz - 1) {
                  if (!stmt.body[i + 1].leadingComments) {
                    result.push(newline);
                  }
                } else {
                  result.push(newline);
                }
              }
              if (preserveBlankLines) {
                if (i === iz - 1) {
                  if (!stmt.body[i].trailingComments) {
                    generateBlankLines(stmt.body[i].range[1], stmt.range[1], result);
                  }
                }
              }
            }
          });
          result.push(addIndent('}'));
          return result;
        },
        BreakStatement: function (stmt, flags) {
          if (stmt.label) {
            return 'break ' + stmt.label.name + this.semicolon(flags);
          }
          return 'break' + this.semicolon(flags);
        },
        ContinueStatement: function (stmt, flags) {
          if (stmt.label) {
            return 'continue ' + stmt.label.name + this.semicolon(flags);
          }
          return 'continue' + this.semicolon(flags);
        },
        ClassBody: function (stmt, flags) {
          var result = [
              '{',
              newline
            ], that = this;
          withIndent(function (indent) {
            var i, iz;
            for (i = 0, iz = stmt.body.length; i < iz; ++i) {
              result.push(indent);
              result.push(that.generateExpression(stmt.body[i], Precedence.Sequence, E_TTT));
              if (i + 1 < iz) {
                result.push(newline);
              }
            }
          });
          if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
            result.push(newline);
          }
          result.push(base);
          result.push('}');
          return result;
        },
        ClassDeclaration: function (stmt, flags) {
          var result, fragment;
          result = ['class ' + stmt.id.name];
          if (stmt.superClass) {
            fragment = join('extends', this.generateExpression(stmt.superClass, Precedence.Assignment, E_TTT));
            result = join(result, fragment);
          }
          result.push(space);
          result.push(this.generateStatement(stmt.body, S_TFFT));
          return result;
        },
        DirectiveStatement: function (stmt, flags) {
          if (extra.raw && stmt.raw) {
            return stmt.raw + this.semicolon(flags);
          }
          return escapeDirective(stmt.directive) + this.semicolon(flags);
        },
        DoWhileStatement: function (stmt, flags) {
          var result = join('do', this.maybeBlock(stmt.body, S_TFFF));
          result = this.maybeBlockSuffix(stmt.body, result);
          return join(result, [
            'while' + space + '(',
            this.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
            ')' + this.semicolon(flags)
          ]);
        },
        CatchClause: function (stmt, flags) {
          var result, that = this;
          withIndent(function () {
            var guard;
            result = [
              'catch' + space + '(',
              that.generateExpression(stmt.param, Precedence.Sequence, E_TTT),
              ')'
            ];
            if (stmt.guard) {
              guard = that.generateExpression(stmt.guard, Precedence.Sequence, E_TTT);
              result.splice(2, 0, ' if ', guard);
            }
          });
          result.push(this.maybeBlock(stmt.body, S_TFFF));
          return result;
        },
        DebuggerStatement: function (stmt, flags) {
          return 'debugger' + this.semicolon(flags);
        },
        EmptyStatement: function (stmt, flags) {
          return ';';
        },
        ExportDefaultDeclaration: function (stmt, flags) {
          var result = ['export'], bodyFlags;
          bodyFlags = flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF;
          result = join(result, 'default');
          if (isStatement(stmt.declaration)) {
            result = join(result, this.generateStatement(stmt.declaration, bodyFlags));
          } else {
            result = join(result, this.generateExpression(stmt.declaration, Precedence.Assignment, E_TTT) + this.semicolon(flags));
          }
          return result;
        },
        ExportNamedDeclaration: function (stmt, flags) {
          var result = ['export'], bodyFlags, that = this;
          bodyFlags = flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF;
          if (stmt.declaration) {
            return join(result, this.generateStatement(stmt.declaration, bodyFlags));
          }
          if (stmt.specifiers) {
            if (stmt.specifiers.length === 0) {
              result = join(result, '{' + space + '}');
            } else if (stmt.specifiers[0].type === Syntax.ExportBatchSpecifier) {
              result = join(result, this.generateExpression(stmt.specifiers[0], Precedence.Sequence, E_TTT));
            } else {
              result = join(result, '{');
              withIndent(function (indent) {
                var i, iz;
                result.push(newline);
                for (i = 0, iz = stmt.specifiers.length; i < iz; ++i) {
                  result.push(indent);
                  result.push(that.generateExpression(stmt.specifiers[i], Precedence.Sequence, E_TTT));
                  if (i + 1 < iz) {
                    result.push(',' + newline);
                  }
                }
              });
              if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                result.push(newline);
              }
              result.push(base + '}');
            }
            if (stmt.source) {
              result = join(result, [
                'from' + space,
                this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
                this.semicolon(flags)
              ]);
            } else {
              result.push(this.semicolon(flags));
            }
          }
          return result;
        },
        ExportAllDeclaration: function (stmt, flags) {
          return [
            'export' + space,
            '*' + space,
            'from' + space,
            this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
            this.semicolon(flags)
          ];
        },
        ExpressionStatement: function (stmt, flags) {
          var result, fragment;
          function isClassPrefixed(fragment) {
            var code;
            if (fragment.slice(0, 5) !== 'class') {
              return false;
            }
            code = fragment.charCodeAt(5);
            return code === 123 || esutils.code.isWhiteSpace(code) || esutils.code.isLineTerminator(code);
          }
          function isFunctionPrefixed(fragment) {
            var code;
            if (fragment.slice(0, 8) !== 'function') {
              return false;
            }
            code = fragment.charCodeAt(8);
            return code === 40 || esutils.code.isWhiteSpace(code) || code === 42 || esutils.code.isLineTerminator(code);
          }
          function isAsyncPrefixed(fragment) {
            var code, i, iz;
            if (fragment.slice(0, 5) !== 'async') {
              return false;
            }
            if (!esutils.code.isWhiteSpace(fragment.charCodeAt(5))) {
              return false;
            }
            for (i = 6, iz = fragment.length; i < iz; ++i) {
              if (!esutils.code.isWhiteSpace(fragment.charCodeAt(i))) {
                break;
              }
            }
            if (i === iz) {
              return false;
            }
            if (fragment.slice(i, i + 8) !== 'function') {
              return false;
            }
            code = fragment.charCodeAt(i + 8);
            return code === 40 || esutils.code.isWhiteSpace(code) || code === 42 || esutils.code.isLineTerminator(code);
          }
          result = [this.generateExpression(stmt.expression, Precedence.Sequence, E_TTT)];
          fragment = toSourceNodeWhenNeeded(result).toString();
          if (fragment.charCodeAt(0) === 123 || isClassPrefixed(fragment) || isFunctionPrefixed(fragment) || isAsyncPrefixed(fragment) || directive && flags & F_DIRECTIVE_CTX && stmt.expression.type === Syntax.Literal && typeof stmt.expression.value === 'string') {
            result = [
              '(',
              result,
              ')' + this.semicolon(flags)
            ];
          } else {
            result.push(this.semicolon(flags));
          }
          return result;
        },
        ImportDeclaration: function (stmt, flags) {
          var result, cursor, that = this;
          if (stmt.specifiers.length === 0) {
            return [
              'import',
              space,
              this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
              this.semicolon(flags)
            ];
          }
          result = ['import'];
          cursor = 0;
          if (stmt.specifiers[cursor].type === Syntax.ImportDefaultSpecifier) {
            result = join(result, [this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT)]);
            ++cursor;
          }
          if (stmt.specifiers[cursor]) {
            if (cursor !== 0) {
              result.push(',');
            }
            if (stmt.specifiers[cursor].type === Syntax.ImportNamespaceSpecifier) {
              result = join(result, [
                space,
                this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT)
              ]);
            } else {
              result.push(space + '{');
              if (stmt.specifiers.length - cursor === 1) {
                result.push(space);
                result.push(this.generateExpression(stmt.specifiers[cursor], Precedence.Sequence, E_TTT));
                result.push(space + '}' + space);
              } else {
                withIndent(function (indent) {
                  var i, iz;
                  result.push(newline);
                  for (i = cursor, iz = stmt.specifiers.length; i < iz; ++i) {
                    result.push(indent);
                    result.push(that.generateExpression(stmt.specifiers[i], Precedence.Sequence, E_TTT));
                    if (i + 1 < iz) {
                      result.push(',' + newline);
                    }
                  }
                });
                if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
                  result.push(newline);
                }
                result.push(base + '}' + space);
              }
            }
          }
          result = join(result, [
            'from' + space,
            this.generateExpression(stmt.source, Precedence.Sequence, E_TTT),
            this.semicolon(flags)
          ]);
          return result;
        },
        VariableDeclarator: function (stmt, flags) {
          var itemFlags = flags & F_ALLOW_IN ? E_TTT : E_FTT;
          if (stmt.init) {
            return [
              this.generateExpression(stmt.id, Precedence.Assignment, itemFlags),
              space,
              '=',
              space,
              this.generateExpression(stmt.init, Precedence.Assignment, itemFlags)
            ];
          }
          return this.generatePattern(stmt.id, Precedence.Assignment, itemFlags);
        },
        VariableDeclaration: function (stmt, flags) {
          var result, i, iz, node, bodyFlags, that = this;
          result = [stmt.kind];
          bodyFlags = flags & F_ALLOW_IN ? S_TFFF : S_FFFF;
          function block() {
            node = stmt.declarations[0];
            if (extra.comment && node.leadingComments) {
              result.push('\n');
              result.push(addIndent(that.generateStatement(node, bodyFlags)));
            } else {
              result.push(noEmptySpace());
              result.push(that.generateStatement(node, bodyFlags));
            }
            for (i = 1, iz = stmt.declarations.length; i < iz; ++i) {
              node = stmt.declarations[i];
              if (extra.comment && node.leadingComments) {
                result.push(',' + newline);
                result.push(addIndent(that.generateStatement(node, bodyFlags)));
              } else {
                result.push(',' + space);
                result.push(that.generateStatement(node, bodyFlags));
              }
            }
          }
          if (stmt.declarations.length > 1) {
            withIndent(block);
          } else {
            block();
          }
          result.push(this.semicolon(flags));
          return result;
        },
        ThrowStatement: function (stmt, flags) {
          return [
            join('throw', this.generateExpression(stmt.argument, Precedence.Sequence, E_TTT)),
            this.semicolon(flags)
          ];
        },
        TryStatement: function (stmt, flags) {
          var result, i, iz, guardedHandlers;
          result = [
            'try',
            this.maybeBlock(stmt.block, S_TFFF)
          ];
          result = this.maybeBlockSuffix(stmt.block, result);
          if (stmt.handlers) {
            for (i = 0, iz = stmt.handlers.length; i < iz; ++i) {
              result = join(result, this.generateStatement(stmt.handlers[i], S_TFFF));
              if (stmt.finalizer || i + 1 !== iz) {
                result = this.maybeBlockSuffix(stmt.handlers[i].body, result);
              }
            }
          } else {
            guardedHandlers = stmt.guardedHandlers || [];
            for (i = 0, iz = guardedHandlers.length; i < iz; ++i) {
              result = join(result, this.generateStatement(guardedHandlers[i], S_TFFF));
              if (stmt.finalizer || i + 1 !== iz) {
                result = this.maybeBlockSuffix(guardedHandlers[i].body, result);
              }
            }
            if (stmt.handler) {
              if (isArray(stmt.handler)) {
                for (i = 0, iz = stmt.handler.length; i < iz; ++i) {
                  result = join(result, this.generateStatement(stmt.handler[i], S_TFFF));
                  if (stmt.finalizer || i + 1 !== iz) {
                    result = this.maybeBlockSuffix(stmt.handler[i].body, result);
                  }
                }
              } else {
                result = join(result, this.generateStatement(stmt.handler, S_TFFF));
                if (stmt.finalizer) {
                  result = this.maybeBlockSuffix(stmt.handler.body, result);
                }
              }
            }
          }
          if (stmt.finalizer) {
            result = join(result, [
              'finally',
              this.maybeBlock(stmt.finalizer, S_TFFF)
            ]);
          }
          return result;
        },
        SwitchStatement: function (stmt, flags) {
          var result, fragment, i, iz, bodyFlags, that = this;
          withIndent(function () {
            result = [
              'switch' + space + '(',
              that.generateExpression(stmt.discriminant, Precedence.Sequence, E_TTT),
              ')' + space + '{' + newline
            ];
          });
          if (stmt.cases) {
            bodyFlags = S_TFFF;
            for (i = 0, iz = stmt.cases.length; i < iz; ++i) {
              if (i === iz - 1) {
                bodyFlags |= F_SEMICOLON_OPT;
              }
              fragment = addIndent(this.generateStatement(stmt.cases[i], bodyFlags));
              result.push(fragment);
              if (!endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                result.push(newline);
              }
            }
          }
          result.push(addIndent('}'));
          return result;
        },
        SwitchCase: function (stmt, flags) {
          var result, fragment, i, iz, bodyFlags, that = this;
          withIndent(function () {
            if (stmt.test) {
              result = [
                join('case', that.generateExpression(stmt.test, Precedence.Sequence, E_TTT)),
                ':'
              ];
            } else {
              result = ['default:'];
            }
            i = 0;
            iz = stmt.consequent.length;
            if (iz && stmt.consequent[0].type === Syntax.BlockStatement) {
              fragment = that.maybeBlock(stmt.consequent[0], S_TFFF);
              result.push(fragment);
              i = 1;
            }
            if (i !== iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
              result.push(newline);
            }
            bodyFlags = S_TFFF;
            for (; i < iz; ++i) {
              if (i === iz - 1 && flags & F_SEMICOLON_OPT) {
                bodyFlags |= F_SEMICOLON_OPT;
              }
              fragment = addIndent(that.generateStatement(stmt.consequent[i], bodyFlags));
              result.push(fragment);
              if (i + 1 !== iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
                result.push(newline);
              }
            }
          });
          return result;
        },
        IfStatement: function (stmt, flags) {
          var result, bodyFlags, semicolonOptional, that = this;
          withIndent(function () {
            result = [
              'if' + space + '(',
              that.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
              ')'
            ];
          });
          semicolonOptional = flags & F_SEMICOLON_OPT;
          bodyFlags = S_TFFF;
          if (semicolonOptional) {
            bodyFlags |= F_SEMICOLON_OPT;
          }
          if (stmt.alternate) {
            result.push(this.maybeBlock(stmt.consequent, S_TFFF));
            result = this.maybeBlockSuffix(stmt.consequent, result);
            if (stmt.alternate.type === Syntax.IfStatement) {
              result = join(result, [
                'else ',
                this.generateStatement(stmt.alternate, bodyFlags)
              ]);
            } else {
              result = join(result, join('else', this.maybeBlock(stmt.alternate, bodyFlags)));
            }
          } else {
            result.push(this.maybeBlock(stmt.consequent, bodyFlags));
          }
          return result;
        },
        ForStatement: function (stmt, flags) {
          var result, that = this;
          withIndent(function () {
            result = ['for' + space + '('];
            if (stmt.init) {
              if (stmt.init.type === Syntax.VariableDeclaration) {
                result.push(that.generateStatement(stmt.init, S_FFFF));
              } else {
                result.push(that.generateExpression(stmt.init, Precedence.Sequence, E_FTT));
                result.push(';');
              }
            } else {
              result.push(';');
            }
            if (stmt.test) {
              result.push(space);
              result.push(that.generateExpression(stmt.test, Precedence.Sequence, E_TTT));
              result.push(';');
            } else {
              result.push(';');
            }
            if (stmt.update) {
              result.push(space);
              result.push(that.generateExpression(stmt.update, Precedence.Sequence, E_TTT));
              result.push(')');
            } else {
              result.push(')');
            }
          });
          result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
          return result;
        },
        ForInStatement: function (stmt, flags) {
          return this.generateIterationForStatement('in', stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
        },
        ForOfStatement: function (stmt, flags) {
          return this.generateIterationForStatement('of', stmt, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF);
        },
        LabeledStatement: function (stmt, flags) {
          return [
            stmt.label.name + ':',
            this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF)
          ];
        },
        Program: function (stmt, flags) {
          var result, fragment, i, iz, bodyFlags;
          iz = stmt.body.length;
          result = [safeConcatenation && iz > 0 ? '\n' : ''];
          bodyFlags = S_TFTF;
          for (i = 0; i < iz; ++i) {
            if (!safeConcatenation && i === iz - 1) {
              bodyFlags |= F_SEMICOLON_OPT;
            }
            if (preserveBlankLines) {
              if (i === 0) {
                if (!stmt.body[0].leadingComments) {
                  generateBlankLines(stmt.range[0], stmt.body[i].range[0], result);
                }
              }
              if (i > 0) {
                if (!stmt.body[i - 1].trailingComments && !stmt.body[i].leadingComments) {
                  generateBlankLines(stmt.body[i - 1].range[1], stmt.body[i].range[0], result);
                }
              }
            }
            fragment = addIndent(this.generateStatement(stmt.body[i], bodyFlags));
            result.push(fragment);
            if (i + 1 < iz && !endsWithLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
              if (preserveBlankLines) {
                if (!stmt.body[i + 1].leadingComments) {
                  result.push(newline);
                }
              } else {
                result.push(newline);
              }
            }
            if (preserveBlankLines) {
              if (i === iz - 1) {
                if (!stmt.body[i].trailingComments) {
                  generateBlankLines(stmt.body[i].range[1], stmt.range[1], result);
                }
              }
            }
          }
          return result;
        },
        FunctionDeclaration: function (stmt, flags) {
          return [
            generateAsyncPrefix(stmt, true),
            'function',
            generateStarSuffix(stmt) || noEmptySpace(),
            stmt.id ? generateIdentifier(stmt.id) : '',
            this.generateFunctionBody(stmt)
          ];
        },
        ReturnStatement: function (stmt, flags) {
          if (stmt.argument) {
            return [
              join('return', this.generateExpression(stmt.argument, Precedence.Sequence, E_TTT)),
              this.semicolon(flags)
            ];
          }
          return ['return' + this.semicolon(flags)];
        },
        WhileStatement: function (stmt, flags) {
          var result, that = this;
          withIndent(function () {
            result = [
              'while' + space + '(',
              that.generateExpression(stmt.test, Precedence.Sequence, E_TTT),
              ')'
            ];
          });
          result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
          return result;
        },
        WithStatement: function (stmt, flags) {
          var result, that = this;
          withIndent(function () {
            result = [
              'with' + space + '(',
              that.generateExpression(stmt.object, Precedence.Sequence, E_TTT),
              ')'
            ];
          });
          result.push(this.maybeBlock(stmt.body, flags & F_SEMICOLON_OPT ? S_TFFT : S_TFFF));
          return result;
        }
      };
      merge(CodeGenerator.prototype, CodeGenerator.Statement);
      CodeGenerator.Expression = {
        SequenceExpression: function (expr, precedence, flags) {
          var result, i, iz;
          if (Precedence.Sequence < precedence) {
            flags |= F_ALLOW_IN;
          }
          result = [];
          for (i = 0, iz = expr.expressions.length; i < iz; ++i) {
            result.push(this.generateExpression(expr.expressions[i], Precedence.Assignment, flags));
            if (i + 1 < iz) {
              result.push(',' + space);
            }
          }
          return parenthesize(result, Precedence.Sequence, precedence);
        },
        AssignmentExpression: function (expr, precedence, flags) {
          return this.generateAssignment(expr.left, expr.right, expr.operator, precedence, flags);
        },
        ArrowFunctionExpression: function (expr, precedence, flags) {
          return parenthesize(this.generateFunctionBody(expr), Precedence.ArrowFunction, precedence);
        },
        ConditionalExpression: function (expr, precedence, flags) {
          if (Precedence.Conditional < precedence) {
            flags |= F_ALLOW_IN;
          }
          return parenthesize([
            this.generateExpression(expr.test, Precedence.LogicalOR, flags),
            space + '?' + space,
            this.generateExpression(expr.consequent, Precedence.Assignment, flags),
            space + ':' + space,
            this.generateExpression(expr.alternate, Precedence.Assignment, flags)
          ], Precedence.Conditional, precedence);
        },
        LogicalExpression: function (expr, precedence, flags) {
          return this.BinaryExpression(expr, precedence, flags);
        },
        BinaryExpression: function (expr, precedence, flags) {
          var result, currentPrecedence, fragment, leftSource;
          currentPrecedence = BinaryPrecedence[expr.operator];
          if (currentPrecedence < precedence) {
            flags |= F_ALLOW_IN;
          }
          fragment = this.generateExpression(expr.left, currentPrecedence, flags);
          leftSource = fragment.toString();
          if (leftSource.charCodeAt(leftSource.length - 1) === 47 && esutils.code.isIdentifierPartES5(expr.operator.charCodeAt(0))) {
            result = [
              fragment,
              noEmptySpace(),
              expr.operator
            ];
          } else {
            result = join(fragment, expr.operator);
          }
          fragment = this.generateExpression(expr.right, currentPrecedence + 1, flags);
          if (expr.operator === '/' && fragment.toString().charAt(0) === '/' || expr.operator.slice(-1) === '<' && fragment.toString().slice(0, 3) === '!--') {
            result.push(noEmptySpace());
            result.push(fragment);
          } else {
            result = join(result, fragment);
          }
          if (expr.operator === 'in' && !(flags & F_ALLOW_IN)) {
            return [
              '(',
              result,
              ')'
            ];
          }
          return parenthesize(result, currentPrecedence, precedence);
        },
        CallExpression: function (expr, precedence, flags) {
          var result, i, iz;
          result = [this.generateExpression(expr.callee, Precedence.Call, E_TTF)];
          result.push('(');
          for (i = 0, iz = expr['arguments'].length; i < iz; ++i) {
            result.push(this.generateExpression(expr['arguments'][i], Precedence.Assignment, E_TTT));
            if (i + 1 < iz) {
              result.push(',' + space);
            }
          }
          result.push(')');
          if (!(flags & F_ALLOW_CALL)) {
            return [
              '(',
              result,
              ')'
            ];
          }
          return parenthesize(result, Precedence.Call, precedence);
        },
        NewExpression: function (expr, precedence, flags) {
          var result, length, i, iz, itemFlags;
          length = expr['arguments'].length;
          itemFlags = flags & F_ALLOW_UNPARATH_NEW && !parentheses && length === 0 ? E_TFT : E_TFF;
          result = join('new', this.generateExpression(expr.callee, Precedence.New, itemFlags));
          if (!(flags & F_ALLOW_UNPARATH_NEW) || parentheses || length > 0) {
            result.push('(');
            for (i = 0, iz = length; i < iz; ++i) {
              result.push(this.generateExpression(expr['arguments'][i], Precedence.Assignment, E_TTT));
              if (i + 1 < iz) {
                result.push(',' + space);
              }
            }
            result.push(')');
          }
          return parenthesize(result, Precedence.New, precedence);
        },
        MemberExpression: function (expr, precedence, flags) {
          var result, fragment;
          result = [this.generateExpression(expr.object, Precedence.Call, flags & F_ALLOW_CALL ? E_TTF : E_TFF)];
          if (expr.computed) {
            result.push('[');
            result.push(this.generateExpression(expr.property, Precedence.Sequence, flags & F_ALLOW_CALL ? E_TTT : E_TFT));
            result.push(']');
          } else {
            if (expr.object.type === Syntax.Literal && typeof expr.object.value === 'number') {
              fragment = toSourceNodeWhenNeeded(result).toString();
              if (fragment.indexOf('.') < 0 && !/[eExX]/.test(fragment) && esutils.code.isDecimalDigit(fragment.charCodeAt(fragment.length - 1)) && !(fragment.length >= 2 && fragment.charCodeAt(0) === 48)) {
                result.push('.');
              }
            }
            result.push('.');
            result.push(generateIdentifier(expr.property));
          }
          return parenthesize(result, Precedence.Member, precedence);
        },
        MetaProperty: function (expr, precedence, flags) {
          var result;
          result = [];
          result.push(expr.meta);
          result.push('.');
          result.push(expr.property);
          return parenthesize(result, Precedence.Member, precedence);
        },
        UnaryExpression: function (expr, precedence, flags) {
          var result, fragment, rightCharCode, leftSource, leftCharCode;
          fragment = this.generateExpression(expr.argument, Precedence.Unary, E_TTT);
          if (space === '') {
            result = join(expr.operator, fragment);
          } else {
            result = [expr.operator];
            if (expr.operator.length > 2) {
              result = join(result, fragment);
            } else {
              leftSource = toSourceNodeWhenNeeded(result).toString();
              leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
              rightCharCode = fragment.toString().charCodeAt(0);
              if ((leftCharCode === 43 || leftCharCode === 45) && leftCharCode === rightCharCode || esutils.code.isIdentifierPartES5(leftCharCode) && esutils.code.isIdentifierPartES5(rightCharCode)) {
                result.push(noEmptySpace());
                result.push(fragment);
              } else {
                result.push(fragment);
              }
            }
          }
          return parenthesize(result, Precedence.Unary, precedence);
        },
        YieldExpression: function (expr, precedence, flags) {
          var result;
          if (expr.delegate) {
            result = 'yield*';
          } else {
            result = 'yield';
          }
          if (expr.argument) {
            result = join(result, this.generateExpression(expr.argument, Precedence.Yield, E_TTT));
          }
          return parenthesize(result, Precedence.Yield, precedence);
        },
        AwaitExpression: function (expr, precedence, flags) {
          var result = join(expr.all ? 'await*' : 'await', this.generateExpression(expr.argument, Precedence.Await, E_TTT));
          return parenthesize(result, Precedence.Await, precedence);
        },
        UpdateExpression: function (expr, precedence, flags) {
          if (expr.prefix) {
            return parenthesize([
              expr.operator,
              this.generateExpression(expr.argument, Precedence.Unary, E_TTT)
            ], Precedence.Unary, precedence);
          }
          return parenthesize([
            this.generateExpression(expr.argument, Precedence.Postfix, E_TTT),
            expr.operator
          ], Precedence.Postfix, precedence);
        },
        FunctionExpression: function (expr, precedence, flags) {
          var result = [
              generateAsyncPrefix(expr, true),
              'function'
            ];
          if (expr.id) {
            result.push(generateStarSuffix(expr) || noEmptySpace());
            result.push(generateIdentifier(expr.id));
          } else {
            result.push(generateStarSuffix(expr) || space);
          }
          result.push(this.generateFunctionBody(expr));
          return result;
        },
        ArrayPattern: function (expr, precedence, flags) {
          return this.ArrayExpression(expr, precedence, flags, true);
        },
        ArrayExpression: function (expr, precedence, flags, isPattern) {
          var result, multiline, that = this;
          if (!expr.elements.length) {
            return '[]';
          }
          multiline = isPattern ? false : expr.elements.length > 1;
          result = [
            '[',
            multiline ? newline : ''
          ];
          withIndent(function (indent) {
            var i, iz;
            for (i = 0, iz = expr.elements.length; i < iz; ++i) {
              if (!expr.elements[i]) {
                if (multiline) {
                  result.push(indent);
                }
                if (i + 1 === iz) {
                  result.push(',');
                }
              } else {
                result.push(multiline ? indent : '');
                result.push(that.generateExpression(expr.elements[i], Precedence.Assignment, E_TTT));
              }
              if (i + 1 < iz) {
                result.push(',' + (multiline ? newline : space));
              }
            }
          });
          if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
            result.push(newline);
          }
          result.push(multiline ? base : '');
          result.push(']');
          return result;
        },
        RestElement: function (expr, precedence, flags) {
          return '...' + this.generatePattern(expr.argument);
        },
        ClassExpression: function (expr, precedence, flags) {
          var result, fragment;
          result = ['class'];
          if (expr.id) {
            result = join(result, this.generateExpression(expr.id, Precedence.Sequence, E_TTT));
          }
          if (expr.superClass) {
            fragment = join('extends', this.generateExpression(expr.superClass, Precedence.Assignment, E_TTT));
            result = join(result, fragment);
          }
          result.push(space);
          result.push(this.generateStatement(expr.body, S_TFFT));
          return result;
        },
        MethodDefinition: function (expr, precedence, flags) {
          var result, fragment;
          if (expr['static']) {
            result = ['static' + space];
          } else {
            result = [];
          }
          if (expr.kind === 'get' || expr.kind === 'set') {
            fragment = [
              join(expr.kind, this.generatePropertyKey(expr.key, expr.computed)),
              this.generateFunctionBody(expr.value)
            ];
          } else {
            fragment = [
              generateMethodPrefix(expr),
              this.generatePropertyKey(expr.key, expr.computed),
              this.generateFunctionBody(expr.value)
            ];
          }
          return join(result, fragment);
        },
        Property: function (expr, precedence, flags) {
          if (expr.kind === 'get' || expr.kind === 'set') {
            return [
              expr.kind,
              noEmptySpace(),
              this.generatePropertyKey(expr.key, expr.computed),
              this.generateFunctionBody(expr.value)
            ];
          }
          if (expr.shorthand) {
            return this.generatePropertyKey(expr.key, expr.computed);
          }
          if (expr.method) {
            return [
              generateMethodPrefix(expr),
              this.generatePropertyKey(expr.key, expr.computed),
              this.generateFunctionBody(expr.value)
            ];
          }
          return [
            this.generatePropertyKey(expr.key, expr.computed),
            ':' + space,
            this.generateExpression(expr.value, Precedence.Assignment, E_TTT)
          ];
        },
        ObjectExpression: function (expr, precedence, flags) {
          var multiline, result, fragment, that = this;
          if (!expr.properties.length) {
            return '{}';
          }
          multiline = expr.properties.length > 1;
          withIndent(function () {
            fragment = that.generateExpression(expr.properties[0], Precedence.Sequence, E_TTT);
          });
          if (!multiline) {
            if (!hasLineTerminator(toSourceNodeWhenNeeded(fragment).toString())) {
              return [
                '{',
                space,
                fragment,
                space,
                '}'
              ];
            }
          }
          withIndent(function (indent) {
            var i, iz;
            result = [
              '{',
              newline,
              indent,
              fragment
            ];
            if (multiline) {
              result.push(',' + newline);
              for (i = 1, iz = expr.properties.length; i < iz; ++i) {
                result.push(indent);
                result.push(that.generateExpression(expr.properties[i], Precedence.Sequence, E_TTT));
                if (i + 1 < iz) {
                  result.push(',' + newline);
                }
              }
            }
          });
          if (!endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
            result.push(newline);
          }
          result.push(base);
          result.push('}');
          return result;
        },
        AssignmentPattern: function (expr, precedence, flags) {
          return this.generateAssignment(expr.left, expr.right, expr.operator, precedence, flags);
        },
        ObjectPattern: function (expr, precedence, flags) {
          var result, i, iz, multiline, property, that = this;
          if (!expr.properties.length) {
            return '{}';
          }
          multiline = false;
          if (expr.properties.length === 1) {
            property = expr.properties[0];
            if (property.value.type !== Syntax.Identifier) {
              multiline = true;
            }
          } else {
            for (i = 0, iz = expr.properties.length; i < iz; ++i) {
              property = expr.properties[i];
              if (!property.shorthand) {
                multiline = true;
                break;
              }
            }
          }
          result = [
            '{',
            multiline ? newline : ''
          ];
          withIndent(function (indent) {
            var i, iz;
            for (i = 0, iz = expr.properties.length; i < iz; ++i) {
              result.push(multiline ? indent : '');
              result.push(that.generateExpression(expr.properties[i], Precedence.Sequence, E_TTT));
              if (i + 1 < iz) {
                result.push(',' + (multiline ? newline : space));
              }
            }
          });
          if (multiline && !endsWithLineTerminator(toSourceNodeWhenNeeded(result).toString())) {
            result.push(newline);
          }
          result.push(multiline ? base : '');
          result.push('}');
          return result;
        },
        ThisExpression: function (expr, precedence, flags) {
          return 'this';
        },
        Super: function (expr, precedence, flags) {
          return 'super';
        },
        Identifier: function (expr, precedence, flags) {
          return generateIdentifier(expr);
        },
        ImportDefaultSpecifier: function (expr, precedence, flags) {
          return generateIdentifier(expr.id || expr.local);
        },
        ImportNamespaceSpecifier: function (expr, precedence, flags) {
          var result = ['*'];
          var id = expr.id || expr.local;
          if (id) {
            result.push(space + 'as' + noEmptySpace() + generateIdentifier(id));
          }
          return result;
        },
        ImportSpecifier: function (expr, precedence, flags) {
          var imported = expr.imported;
          var result = [imported.name];
          var local = expr.local;
          if (local && local.name !== imported.name) {
            result.push(noEmptySpace() + 'as' + noEmptySpace() + generateIdentifier(local));
          }
          return result;
        },
        ExportSpecifier: function (expr, precedence, flags) {
          var local = expr.local;
          var result = [local.name];
          var exported = expr.exported;
          if (exported && exported.name !== local.name) {
            result.push(noEmptySpace() + 'as' + noEmptySpace() + generateIdentifier(exported));
          }
          return result;
        },
        Literal: function (expr, precedence, flags) {
          var raw;
          if (expr.hasOwnProperty('raw') && parse && extra.raw) {
            try {
              raw = parse(expr.raw).body[0].expression;
              if (raw.type === Syntax.Literal) {
                if (raw.value === expr.value) {
                  return expr.raw;
                }
              }
            } catch (e) {
            }
          }
          if (expr.value === null) {
            return 'null';
          }
          if (typeof expr.value === 'string') {
            return escapeString(expr.value);
          }
          if (typeof expr.value === 'number') {
            return generateNumber(expr.value);
          }
          if (typeof expr.value === 'boolean') {
            return expr.value ? 'true' : 'false';
          }
          return generateRegExp(expr.value);
        },
        GeneratorExpression: function (expr, precedence, flags) {
          return this.ComprehensionExpression(expr, precedence, flags);
        },
        ComprehensionExpression: function (expr, precedence, flags) {
          var result, i, iz, fragment, that = this;
          result = expr.type === Syntax.GeneratorExpression ? ['('] : ['['];
          if (extra.moz.comprehensionExpressionStartsWithAssignment) {
            fragment = this.generateExpression(expr.body, Precedence.Assignment, E_TTT);
            result.push(fragment);
          }
          if (expr.blocks) {
            withIndent(function () {
              for (i = 0, iz = expr.blocks.length; i < iz; ++i) {
                fragment = that.generateExpression(expr.blocks[i], Precedence.Sequence, E_TTT);
                if (i > 0 || extra.moz.comprehensionExpressionStartsWithAssignment) {
                  result = join(result, fragment);
                } else {
                  result.push(fragment);
                }
              }
            });
          }
          if (expr.filter) {
            result = join(result, 'if' + space);
            fragment = this.generateExpression(expr.filter, Precedence.Sequence, E_TTT);
            result = join(result, [
              '(',
              fragment,
              ')'
            ]);
          }
          if (!extra.moz.comprehensionExpressionStartsWithAssignment) {
            fragment = this.generateExpression(expr.body, Precedence.Assignment, E_TTT);
            result = join(result, fragment);
          }
          result.push(expr.type === Syntax.GeneratorExpression ? ')' : ']');
          return result;
        },
        ComprehensionBlock: function (expr, precedence, flags) {
          var fragment;
          if (expr.left.type === Syntax.VariableDeclaration) {
            fragment = [
              expr.left.kind,
              noEmptySpace(),
              this.generateStatement(expr.left.declarations[0], S_FFFF)
            ];
          } else {
            fragment = this.generateExpression(expr.left, Precedence.Call, E_TTT);
          }
          fragment = join(fragment, expr.of ? 'of' : 'in');
          fragment = join(fragment, this.generateExpression(expr.right, Precedence.Sequence, E_TTT));
          return [
            'for' + space + '(',
            fragment,
            ')'
          ];
        },
        SpreadElement: function (expr, precedence, flags) {
          return [
            '...',
            this.generateExpression(expr.argument, Precedence.Assignment, E_TTT)
          ];
        },
        TaggedTemplateExpression: function (expr, precedence, flags) {
          var itemFlags = E_TTF;
          if (!(flags & F_ALLOW_CALL)) {
            itemFlags = E_TFF;
          }
          var result = [
              this.generateExpression(expr.tag, Precedence.Call, itemFlags),
              this.generateExpression(expr.quasi, Precedence.Primary, E_FFT)
            ];
          return parenthesize(result, Precedence.TaggedTemplate, precedence);
        },
        TemplateElement: function (expr, precedence, flags) {
          return expr.value.raw;
        },
        TemplateLiteral: function (expr, precedence, flags) {
          var result, i, iz;
          result = ['`'];
          for (i = 0, iz = expr.quasis.length; i < iz; ++i) {
            result.push(this.generateExpression(expr.quasis[i], Precedence.Primary, E_TTT));
            if (i + 1 < iz) {
              result.push('${' + space);
              result.push(this.generateExpression(expr.expressions[i], Precedence.Sequence, E_TTT));
              result.push(space + '}');
            }
          }
          result.push('`');
          return result;
        },
        ModuleSpecifier: function (expr, precedence, flags) {
          return this.Literal(expr, precedence, flags);
        }
      };
      merge(CodeGenerator.prototype, CodeGenerator.Expression);
      CodeGenerator.prototype.generateExpression = function (expr, precedence, flags) {
        var result, type;
        type = expr.type || Syntax.Property;
        if (extra.verbatim && expr.hasOwnProperty(extra.verbatim)) {
          return generateVerbatim(expr, precedence);
        }
        result = this[type](expr, precedence, flags);
        if (extra.comment) {
          result = addComments(expr, result);
        }
        return toSourceNodeWhenNeeded(result, expr);
      };
      CodeGenerator.prototype.generateStatement = function (stmt, flags) {
        var result, fragment;
        result = this[stmt.type](stmt, flags);
        if (extra.comment) {
          result = addComments(stmt, result);
        }
        fragment = toSourceNodeWhenNeeded(result).toString();
        if (stmt.type === Syntax.Program && !safeConcatenation && newline === '' && fragment.charAt(fragment.length - 1) === '\n') {
          result = sourceMap ? toSourceNodeWhenNeeded(result).replaceRight(/\s+$/, '') : fragment.replace(/\s+$/, '');
        }
        return toSourceNodeWhenNeeded(result, stmt);
      };
      function generateInternal(node) {
        var codegen;
        codegen = new CodeGenerator;
        if (isStatement(node)) {
          return codegen.generateStatement(node, S_TFFF);
        }
        if (isExpression(node)) {
          return codegen.generateExpression(node, Precedence.Sequence, E_TTT);
        }
        throw new Error('Unknown node type: ' + node.type);
      }
      function generate(node, options) {
        var defaultOptions = getDefaultOptions(), result, pair;
        if (options != null) {
          if (typeof options.indent === 'string') {
            defaultOptions.format.indent.style = options.indent;
          }
          if (typeof options.base === 'number') {
            defaultOptions.format.indent.base = options.base;
          }
          options = updateDeeply(defaultOptions, options);
          indent = options.format.indent.style;
          if (typeof options.base === 'string') {
            base = options.base;
          } else {
            base = stringRepeat(indent, options.format.indent.base);
          }
        } else {
          options = defaultOptions;
          indent = options.format.indent.style;
          base = stringRepeat(indent, options.format.indent.base);
        }
        json = options.format.json;
        renumber = options.format.renumber;
        hexadecimal = json ? false : options.format.hexadecimal;
        quotes = json ? 'double' : options.format.quotes;
        escapeless = options.format.escapeless;
        newline = options.format.newline;
        space = options.format.space;
        if (options.format.compact) {
          newline = space = indent = base = '';
        }
        parentheses = options.format.parentheses;
        semicolons = options.format.semicolons;
        safeConcatenation = options.format.safeConcatenation;
        directive = options.directive;
        parse = json ? null : options.parse;
        sourceMap = options.sourceMap;
        sourceCode = options.sourceCode;
        preserveBlankLines = options.format.preserveBlankLines && sourceCode !== null;
        extra = options;
        if (sourceMap) {
          if (!exports.browser) {
            SourceNode = require('/node_modules/source-map/lib/source-map.js', module).SourceNode;
          } else {
            SourceNode = global.sourceMap.SourceNode;
          }
        }
        result = generateInternal(node);
        if (!sourceMap) {
          pair = {
            code: result.toString(),
            map: null
          };
          return options.sourceMapWithCode ? pair : pair.code;
        }
        pair = result.toStringWithSourceMap({
          file: options.file,
          sourceRoot: options.sourceMapRoot
        });
        if (options.sourceContent) {
          pair.map.setSourceContent(options.sourceMap, options.sourceContent);
        }
        if (options.sourceMapWithCode) {
          return pair;
        }
        return pair.map.toString();
      }
      FORMAT_MINIFY = {
        indent: {
          style: '',
          base: 0
        },
        renumber: true,
        hexadecimal: true,
        quotes: 'auto',
        escapeless: true,
        compact: true,
        parentheses: false,
        semicolons: false
      };
      FORMAT_DEFAULTS = getDefaultOptions().format;
      exports.version = require('/package.json', module).version;
      exports.generate = generate;
      exports.attachComments = estraverse.attachComments;
      exports.Precedence = updateDeeply({}, Precedence);
      exports.browser = false;
      exports.FORMAT_MINIFY = FORMAT_MINIFY;
      exports.FORMAT_DEFAULTS = FORMAT_DEFAULTS;
    }());
  });
  require.define('/package.json', function (module, exports, __dirname, __filename) {
    module.exports = {
      'name': 'escodegen',
      'description': 'ECMAScript code generator',
      'homepage': 'http://github.com/estools/escodegen',
      'main': 'escodegen.js',
      'bin': {
        'esgenerate': './bin/esgenerate.js',
        'escodegen': './bin/escodegen.js'
      },
      'files': [
        'LICENSE.BSD',
        'LICENSE.source-map',
        'README.md',
        'bin',
        'escodegen.js',
        'package.json'
      ],
      'version': '1.8.0',
      'engines': { 'node': '>=0.12.0' },
      'maintainers': [{
          'name': 'Yusuke Suzuki',
          'email': 'utatane.tea@gmail.com',
          'web': 'http://github.com/Constellation'
        }],
      'repository': {
        'type': 'git',
        'url': 'http://github.com/estools/escodegen.git'
      },
      'dependencies': {
        'estraverse': '^1.9.1',
        'esutils': '^2.0.2',
        'esprima': '^2.7.1',
        'optionator': '^0.8.1'
      },
      'optionalDependencies': { 'source-map': '~0.2.0' },
      'devDependencies': {
        'acorn-6to5': '^0.11.1-25',
        'bluebird': '^2.3.11',
        'bower-registry-client': '^0.2.1',
        'chai': '^1.10.0',
        'commonjs-everywhere': '^0.9.7',
        'gulp': '^3.8.10',
        'gulp-eslint': '^0.2.0',
        'gulp-mocha': '^2.0.0',
        'semver': '^5.1.0'
      },
      'license': 'BSD-2-Clause',
      'scripts': {
        'test': 'gulp travis',
        'unit-test': 'gulp test',
        'lint': 'gulp lint',
        'release': 'node tools/release.js',
        'build-min': './node_modules/.bin/cjsify -ma path: tools/entry-point.js > escodegen.browser.min.js',
        'build': './node_modules/.bin/cjsify -a path: tools/entry-point.js > escodegen.browser.js'
      }
    };
  });
  require.define('/node_modules/source-map/lib/source-map.js', function (module, exports, __dirname, __filename) {
    exports.SourceMapGenerator = require('/node_modules/source-map/lib/source-map/source-map-generator.js', module).SourceMapGenerator;
    exports.SourceMapConsumer = require('/node_modules/source-map/lib/source-map/source-map-consumer.js', module).SourceMapConsumer;
    exports.SourceNode = require('/node_modules/source-map/lib/source-map/source-node.js', module).SourceNode;
  });
  require.define('/node_modules/source-map/lib/source-map/source-node.js', function (module, exports, __dirname, __filename) {
    if (typeof define !== 'function') {
      var define = require('/node_modules/source-map/node_modules/amdefine/amdefine.js', module)(module, require);
    }
    define(function (require, exports, module) {
      var SourceMapGenerator = require('/node_modules/source-map/lib/source-map/source-map-generator.js', module).SourceMapGenerator;
      var util = require('/node_modules/source-map/lib/source-map/util.js', module);
      var REGEX_NEWLINE = /(\r?\n)/;
      var NEWLINE_CODE = 10;
      var isSourceNode = '$$$isSourceNode$$$';
      function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
        this.children = [];
        this.sourceContents = {};
        this.line = aLine == null ? null : aLine;
        this.column = aColumn == null ? null : aColumn;
        this.source = aSource == null ? null : aSource;
        this.name = aName == null ? null : aName;
        this[isSourceNode] = true;
        if (aChunks != null)
          this.add(aChunks);
      }
      SourceNode.fromStringWithSourceMap = function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
        var node = new SourceNode;
        var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
        var shiftNextLine = function () {
          var lineContents = remainingLines.shift();
          var newLine = remainingLines.shift() || '';
          return lineContents + newLine;
        };
        var lastGeneratedLine = 1, lastGeneratedColumn = 0;
        var lastMapping = null;
        aSourceMapConsumer.eachMapping(function (mapping) {
          if (lastMapping !== null) {
            if (lastGeneratedLine < mapping.generatedLine) {
              var code = '';
              addMappingWithCode(lastMapping, shiftNextLine());
              lastGeneratedLine++;
              lastGeneratedColumn = 0;
            } else {
              var nextLine = remainingLines[0];
              var code = nextLine.substr(0, mapping.generatedColumn - lastGeneratedColumn);
              remainingLines[0] = nextLine.substr(mapping.generatedColumn - lastGeneratedColumn);
              lastGeneratedColumn = mapping.generatedColumn;
              addMappingWithCode(lastMapping, code);
              lastMapping = mapping;
              return;
            }
          }
          while (lastGeneratedLine < mapping.generatedLine) {
            node.add(shiftNextLine());
            lastGeneratedLine++;
          }
          if (lastGeneratedColumn < mapping.generatedColumn) {
            var nextLine = remainingLines[0];
            node.add(nextLine.substr(0, mapping.generatedColumn));
            remainingLines[0] = nextLine.substr(mapping.generatedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
          }
          lastMapping = mapping;
        }, this);
        if (remainingLines.length > 0) {
          if (lastMapping) {
            addMappingWithCode(lastMapping, shiftNextLine());
          }
          node.add(remainingLines.join(''));
        }
        aSourceMapConsumer.sources.forEach(function (sourceFile) {
          var content = aSourceMapConsumer.sourceContentFor(sourceFile);
          if (content != null) {
            if (aRelativePath != null) {
              sourceFile = util.join(aRelativePath, sourceFile);
            }
            node.setSourceContent(sourceFile, content);
          }
        });
        return node;
        function addMappingWithCode(mapping, code) {
          if (mapping === null || mapping.source === undefined) {
            node.add(code);
          } else {
            var source = aRelativePath ? util.join(aRelativePath, mapping.source) : mapping.source;
            node.add(new SourceNode(mapping.originalLine, mapping.originalColumn, source, code, mapping.name));
          }
        }
      };
      SourceNode.prototype.add = function SourceNode_add(aChunk) {
        if (Array.isArray(aChunk)) {
          aChunk.forEach(function (chunk) {
            this.add(chunk);
          }, this);
        } else if (aChunk[isSourceNode] || typeof aChunk === 'string') {
          if (aChunk) {
            this.children.push(aChunk);
          }
        } else {
          throw new TypeError('Expected a SourceNode, string, or an array of SourceNodes and strings. Got ' + aChunk);
        }
        return this;
      };
      SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
        if (Array.isArray(aChunk)) {
          for (var i = aChunk.length - 1; i >= 0; i--) {
            this.prepend(aChunk[i]);
          }
        } else if (aChunk[isSourceNode] || typeof aChunk === 'string') {
          this.children.unshift(aChunk);
        } else {
          throw new TypeError('Expected a SourceNode, string, or an array of SourceNodes and strings. Got ' + aChunk);
        }
        return this;
      };
      SourceNode.prototype.walk = function SourceNode_walk(aFn) {
        var chunk;
        for (var i = 0, len = this.children.length; i < len; i++) {
          chunk = this.children[i];
          if (chunk[isSourceNode]) {
            chunk.walk(aFn);
          } else {
            if (chunk !== '') {
              aFn(chunk, {
                source: this.source,
                line: this.line,
                column: this.column,
                name: this.name
              });
            }
          }
        }
      };
      SourceNode.prototype.join = function SourceNode_join(aSep) {
        var newChildren;
        var i;
        var len = this.children.length;
        if (len > 0) {
          newChildren = [];
          for (i = 0; i < len - 1; i++) {
            newChildren.push(this.children[i]);
            newChildren.push(aSep);
          }
          newChildren.push(this.children[i]);
          this.children = newChildren;
        }
        return this;
      };
      SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
        var lastChild = this.children[this.children.length - 1];
        if (lastChild[isSourceNode]) {
          lastChild.replaceRight(aPattern, aReplacement);
        } else if (typeof lastChild === 'string') {
          this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
        } else {
          this.children.push(''.replace(aPattern, aReplacement));
        }
        return this;
      };
      SourceNode.prototype.setSourceContent = function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
        this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
      };
      SourceNode.prototype.walkSourceContents = function SourceNode_walkSourceContents(aFn) {
        for (var i = 0, len = this.children.length; i < len; i++) {
          if (this.children[i][isSourceNode]) {
            this.children[i].walkSourceContents(aFn);
          }
        }
        var sources = Object.keys(this.sourceContents);
        for (var i = 0, len = sources.length; i < len; i++) {
          aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
        }
      };
      SourceNode.prototype.toString = function SourceNode_toString() {
        var str = '';
        this.walk(function (chunk) {
          str += chunk;
        });
        return str;
      };
      SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
        var generated = {
            code: '',
            line: 1,
            column: 0
          };
        var map = new SourceMapGenerator(aArgs);
        var sourceMappingActive = false;
        var lastOriginalSource = null;
        var lastOriginalLine = null;
        var lastOriginalColumn = null;
        var lastOriginalName = null;
        this.walk(function (chunk, original) {
          generated.code += chunk;
          if (original.source !== null && original.line !== null && original.column !== null) {
            if (lastOriginalSource !== original.source || lastOriginalLine !== original.line || lastOriginalColumn !== original.column || lastOriginalName !== original.name) {
              map.addMapping({
                source: original.source,
                original: {
                  line: original.line,
                  column: original.column
                },
                generated: {
                  line: generated.line,
                  column: generated.column
                },
                name: original.name
              });
            }
            lastOriginalSource = original.source;
            lastOriginalLine = original.line;
            lastOriginalColumn = original.column;
            lastOriginalName = original.name;
            sourceMappingActive = true;
          } else if (sourceMappingActive) {
            map.addMapping({
              generated: {
                line: generated.line,
                column: generated.column
              }
            });
            lastOriginalSource = null;
            sourceMappingActive = false;
          }
          for (var idx = 0, length = chunk.length; idx < length; idx++) {
            if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
              generated.line++;
              generated.column = 0;
              if (idx + 1 === length) {
                lastOriginalSource = null;
                sourceMappingActive = false;
              } else if (sourceMappingActive) {
                map.addMapping({
                  source: original.source,
                  original: {
                    line: original.line,
                    column: original.column
                  },
                  generated: {
                    line: generated.line,
                    column: generated.column
                  },
                  name: original.name
                });
              }
            } else {
              generated.column++;
            }
          }
        });
        this.walkSourceContents(function (sourceFile, sourceContent) {
          map.setSourceContent(sourceFile, sourceContent);
        });
        return {
          code: generated.code,
          map: map
        };
      };
      exports.SourceNode = SourceNode;
    });
  });
  require.define('/node_modules/source-map/lib/source-map/util.js', function (module, exports, __dirname, __filename) {
    if (typeof define !== 'function') {
      var define = require('/node_modules/source-map/node_modules/amdefine/amdefine.js', module)(module, require);
    }
    define(function (require, exports, module) {
      function getArg(aArgs, aName, aDefaultValue) {
        if (aName in aArgs) {
          return aArgs[aName];
        } else if (arguments.length === 3) {
          return aDefaultValue;
        } else {
          throw new Error('"' + aName + '" is a required argument.');
        }
      }
      exports.getArg = getArg;
      var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
      var dataUrlRegexp = /^data:.+\,.+$/;
      function urlParse(aUrl) {
        var match = aUrl.match(urlRegexp);
        if (!match) {
          return null;
        }
        return {
          scheme: match[1],
          auth: match[2],
          host: match[3],
          port: match[4],
          path: match[5]
        };
      }
      exports.urlParse = urlParse;
      function urlGenerate(aParsedUrl) {
        var url = '';
        if (aParsedUrl.scheme) {
          url += aParsedUrl.scheme + ':';
        }
        url += '//';
        if (aParsedUrl.auth) {
          url += aParsedUrl.auth + '@';
        }
        if (aParsedUrl.host) {
          url += aParsedUrl.host;
        }
        if (aParsedUrl.port) {
          url += ':' + aParsedUrl.port;
        }
        if (aParsedUrl.path) {
          url += aParsedUrl.path;
        }
        return url;
      }
      exports.urlGenerate = urlGenerate;
      function normalize(aPath) {
        var path = aPath;
        var url = urlParse(aPath);
        if (url) {
          if (!url.path) {
            return aPath;
          }
          path = url.path;
        }
        var isAbsolute = path.charAt(0) === '/';
        var parts = path.split(/\/+/);
        for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
          part = parts[i];
          if (part === '.') {
            parts.splice(i, 1);
          } else if (part === '..') {
            up++;
          } else if (up > 0) {
            if (part === '') {
              parts.splice(i + 1, up);
              up = 0;
            } else {
              parts.splice(i, 2);
              up--;
            }
          }
        }
        path = parts.join('/');
        if (path === '') {
          path = isAbsolute ? '/' : '.';
        }
        if (url) {
          url.path = path;
          return urlGenerate(url);
        }
        return path;
      }
      exports.normalize = normalize;
      function join(aRoot, aPath) {
        if (aRoot === '') {
          aRoot = '.';
        }
        if (aPath === '') {
          aPath = '.';
        }
        var aPathUrl = urlParse(aPath);
        var aRootUrl = urlParse(aRoot);
        if (aRootUrl) {
          aRoot = aRootUrl.path || '/';
        }
        if (aPathUrl && !aPathUrl.scheme) {
          if (aRootUrl) {
            aPathUrl.scheme = aRootUrl.scheme;
          }
          return urlGenerate(aPathUrl);
        }
        if (aPathUrl || aPath.match(dataUrlRegexp)) {
          return aPath;
        }
        if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
          aRootUrl.host = aPath;
          return urlGenerate(aRootUrl);
        }
        var joined = aPath.charAt(0) === '/' ? aPath : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);
        if (aRootUrl) {
          aRootUrl.path = joined;
          return urlGenerate(aRootUrl);
        }
        return joined;
      }
      exports.join = join;
      function relative(aRoot, aPath) {
        if (aRoot === '') {
          aRoot = '.';
        }
        aRoot = aRoot.replace(/\/$/, '');
        var url = urlParse(aRoot);
        if (aPath.charAt(0) == '/' && url && url.path == '/') {
          return aPath.slice(1);
        }
        return aPath.indexOf(aRoot + '/') === 0 ? aPath.substr(aRoot.length + 1) : aPath;
      }
      exports.relative = relative;
      function toSetString(aStr) {
        return '$' + aStr;
      }
      exports.toSetString = toSetString;
      function fromSetString(aStr) {
        return aStr.substr(1);
      }
      exports.fromSetString = fromSetString;
      function strcmp(aStr1, aStr2) {
        var s1 = aStr1 || '';
        var s2 = aStr2 || '';
        return (s1 > s2) - (s1 < s2);
      }
      function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
        var cmp;
        cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp || onlyCompareOriginal) {
          return cmp;
        }
        cmp = strcmp(mappingA.name, mappingB.name);
        if (cmp) {
          return cmp;
        }
        cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp) {
          return cmp;
        }
        return mappingA.generatedColumn - mappingB.generatedColumn;
      }
      ;
      exports.compareByOriginalPositions = compareByOriginalPositions;
      function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
        var cmp;
        cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp || onlyCompareGenerated) {
          return cmp;
        }
        cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      ;
      exports.compareByGeneratedPositions = compareByGeneratedPositions;
    });
  });
  require.define('/node_modules/source-map/node_modules/amdefine/amdefine.js', function (module, exports, __dirname, __filename) {
    'use strict';
    function amdefine(module, requireFn) {
      'use strict';
      var defineCache = {}, loaderCache = {}, alreadyCalled = false, path = require('path', module), makeRequire, stringRequire;
      function trimDots(ary) {
        var i, part;
        for (i = 0; ary[i]; i += 1) {
          part = ary[i];
          if (part === '.') {
            ary.splice(i, 1);
            i -= 1;
          } else if (part === '..') {
            if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
              break;
            } else if (i > 0) {
              ary.splice(i - 1, 2);
              i -= 2;
            }
          }
        }
      }
      function normalize(name, baseName) {
        var baseParts;
        if (name && name.charAt(0) === '.') {
          if (baseName) {
            baseParts = baseName.split('/');
            baseParts = baseParts.slice(0, baseParts.length - 1);
            baseParts = baseParts.concat(name.split('/'));
            trimDots(baseParts);
            name = baseParts.join('/');
          }
        }
        return name;
      }
      function makeNormalize(relName) {
        return function (name) {
          return normalize(name, relName);
        };
      }
      function makeLoad(id) {
        function load(value) {
          loaderCache[id] = value;
        }
        load.fromText = function (id, text) {
          throw new Error('amdefine does not implement load.fromText');
        };
        return load;
      }
      makeRequire = function (systemRequire, exports, module, relId) {
        function amdRequire(deps, callback) {
          if (typeof deps === 'string') {
            return stringRequire(systemRequire, exports, module, deps, relId);
          } else {
            deps = deps.map(function (depName) {
              return stringRequire(systemRequire, exports, module, depName, relId);
            });
            if (callback) {
              process.nextTick(function () {
                callback.apply(null, deps);
              });
            }
          }
        }
        amdRequire.toUrl = function (filePath) {
          if (filePath.indexOf('.') === 0) {
            return normalize(filePath, path.dirname(module.filename));
          } else {
            return filePath;
          }
        };
        return amdRequire;
      };
      requireFn = requireFn || function req() {
        return module.require.apply(module, arguments);
      };
      function runFactory(id, deps, factory) {
        var r, e, m, result;
        if (id) {
          e = loaderCache[id] = {};
          m = {
            id: id,
            uri: __filename,
            exports: e
          };
          r = makeRequire(requireFn, e, m, id);
        } else {
          if (alreadyCalled) {
            throw new Error('amdefine with no module ID cannot be called more than once per file.');
          }
          alreadyCalled = true;
          e = module.exports;
          m = module;
          r = makeRequire(requireFn, e, m, module.id);
        }
        if (deps) {
          deps = deps.map(function (depName) {
            return r(depName);
          });
        }
        if (typeof factory === 'function') {
          result = factory.apply(m.exports, deps);
        } else {
          result = factory;
        }
        if (result !== undefined) {
          m.exports = result;
          if (id) {
            loaderCache[id] = m.exports;
          }
        }
      }
      stringRequire = function (systemRequire, exports, module, id, relId) {
        var index = id.indexOf('!'), originalId = id, prefix, plugin;
        if (index === -1) {
          id = normalize(id, relId);
          if (id === 'require') {
            return makeRequire(systemRequire, exports, module, relId);
          } else if (id === 'exports') {
            return exports;
          } else if (id === 'module') {
            return module;
          } else if (loaderCache.hasOwnProperty(id)) {
            return loaderCache[id];
          } else if (defineCache[id]) {
            runFactory.apply(null, defineCache[id]);
            return loaderCache[id];
          } else {
            if (systemRequire) {
              return systemRequire(originalId);
            } else {
              throw new Error('No module with ID: ' + id);
            }
          }
        } else {
          prefix = id.substring(0, index);
          id = id.substring(index + 1, id.length);
          plugin = stringRequire(systemRequire, exports, module, prefix, relId);
          if (plugin.normalize) {
            id = plugin.normalize(id, makeNormalize(relId));
          } else {
            id = normalize(id, relId);
          }
          if (loaderCache[id]) {
            return loaderCache[id];
          } else {
            plugin.load(id, makeRequire(systemRequire, exports, module, relId), makeLoad(id), {});
            return loaderCache[id];
          }
        }
      };
      function define(id, deps, factory) {
        if (Array.isArray(id)) {
          factory = deps;
          deps = id;
          id = undefined;
        } else if (typeof id !== 'string') {
          factory = id;
          id = deps = undefined;
        }
        if (deps && !Array.isArray(deps)) {
          factory = deps;
          deps = undefined;
        }
        if (!deps) {
          deps = [
            'require',
            'exports',
            'module'
          ];
        }
        if (id) {
          defineCache[id] = [
            id,
            deps,
            factory
          ];
        } else {
          runFactory(id, deps, factory);
        }
      }
      define.require = function (id) {
        if (loaderCache[id]) {
          return loaderCache[id];
        }
        if (defineCache[id]) {
          runFactory.apply(null, defineCache[id]);
          return loaderCache[id];
        }
      };
      define.amd = {};
      return define;
    }
    module.exports = amdefine;
  });
  require.define('/node_modules/source-map/lib/source-map/source-map-generator.js', function (module, exports, __dirname, __filename) {
    if (typeof define !== 'function') {
      var define = require('/node_modules/source-map/node_modules/amdefine/amdefine.js', module)(module, require);
    }
    define(function (require, exports, module) {
      var base64VLQ = require('/node_modules/source-map/lib/source-map/base64-vlq.js', module);
      var util = require('/node_modules/source-map/lib/source-map/util.js', module);
      var ArraySet = require('/node_modules/source-map/lib/source-map/array-set.js', module).ArraySet;
      var MappingList = require('/node_modules/source-map/lib/source-map/mapping-list.js', module).MappingList;
      function SourceMapGenerator(aArgs) {
        if (!aArgs) {
          aArgs = {};
        }
        this._file = util.getArg(aArgs, 'file', null);
        this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
        this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
        this._sources = new ArraySet;
        this._names = new ArraySet;
        this._mappings = new MappingList;
        this._sourcesContents = null;
      }
      SourceMapGenerator.prototype._version = 3;
      SourceMapGenerator.fromSourceMap = function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
        var sourceRoot = aSourceMapConsumer.sourceRoot;
        var generator = new SourceMapGenerator({
            file: aSourceMapConsumer.file,
            sourceRoot: sourceRoot
          });
        aSourceMapConsumer.eachMapping(function (mapping) {
          var newMapping = {
              generated: {
                line: mapping.generatedLine,
                column: mapping.generatedColumn
              }
            };
          if (mapping.source != null) {
            newMapping.source = mapping.source;
            if (sourceRoot != null) {
              newMapping.source = util.relative(sourceRoot, newMapping.source);
            }
            newMapping.original = {
              line: mapping.originalLine,
              column: mapping.originalColumn
            };
            if (mapping.name != null) {
              newMapping.name = mapping.name;
            }
          }
          generator.addMapping(newMapping);
        });
        aSourceMapConsumer.sources.forEach(function (sourceFile) {
          var content = aSourceMapConsumer.sourceContentFor(sourceFile);
          if (content != null) {
            generator.setSourceContent(sourceFile, content);
          }
        });
        return generator;
      };
      SourceMapGenerator.prototype.addMapping = function SourceMapGenerator_addMapping(aArgs) {
        var generated = util.getArg(aArgs, 'generated');
        var original = util.getArg(aArgs, 'original', null);
        var source = util.getArg(aArgs, 'source', null);
        var name = util.getArg(aArgs, 'name', null);
        if (!this._skipValidation) {
          this._validateMapping(generated, original, source, name);
        }
        if (source != null && !this._sources.has(source)) {
          this._sources.add(source);
        }
        if (name != null && !this._names.has(name)) {
          this._names.add(name);
        }
        this._mappings.add({
          generatedLine: generated.line,
          generatedColumn: generated.column,
          originalLine: original != null && original.line,
          originalColumn: original != null && original.column,
          source: source,
          name: name
        });
      };
      SourceMapGenerator.prototype.setSourceContent = function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
        var source = aSourceFile;
        if (this._sourceRoot != null) {
          source = util.relative(this._sourceRoot, source);
        }
        if (aSourceContent != null) {
          if (!this._sourcesContents) {
            this._sourcesContents = {};
          }
          this._sourcesContents[util.toSetString(source)] = aSourceContent;
        } else if (this._sourcesContents) {
          delete this._sourcesContents[util.toSetString(source)];
          if (Object.keys(this._sourcesContents).length === 0) {
            this._sourcesContents = null;
          }
        }
      };
      SourceMapGenerator.prototype.applySourceMap = function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
        var sourceFile = aSourceFile;
        if (aSourceFile == null) {
          if (aSourceMapConsumer.file == null) {
            throw new Error('SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' + 'or the source map\'s "file" property. Both were omitted.');
          }
          sourceFile = aSourceMapConsumer.file;
        }
        var sourceRoot = this._sourceRoot;
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        var newSources = new ArraySet;
        var newNames = new ArraySet;
        this._mappings.unsortedForEach(function (mapping) {
          if (mapping.source === sourceFile && mapping.originalLine != null) {
            var original = aSourceMapConsumer.originalPositionFor({
                line: mapping.originalLine,
                column: mapping.originalColumn
              });
            if (original.source != null) {
              mapping.source = original.source;
              if (aSourceMapPath != null) {
                mapping.source = util.join(aSourceMapPath, mapping.source);
              }
              if (sourceRoot != null) {
                mapping.source = util.relative(sourceRoot, mapping.source);
              }
              mapping.originalLine = original.line;
              mapping.originalColumn = original.column;
              if (original.name != null) {
                mapping.name = original.name;
              }
            }
          }
          var source = mapping.source;
          if (source != null && !newSources.has(source)) {
            newSources.add(source);
          }
          var name = mapping.name;
          if (name != null && !newNames.has(name)) {
            newNames.add(name);
          }
        }, this);
        this._sources = newSources;
        this._names = newNames;
        aSourceMapConsumer.sources.forEach(function (sourceFile) {
          var content = aSourceMapConsumer.sourceContentFor(sourceFile);
          if (content != null) {
            if (aSourceMapPath != null) {
              sourceFile = util.join(aSourceMapPath, sourceFile);
            }
            if (sourceRoot != null) {
              sourceFile = util.relative(sourceRoot, sourceFile);
            }
            this.setSourceContent(sourceFile, content);
          }
        }, this);
      };
      SourceMapGenerator.prototype._validateMapping = function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource, aName) {
        if (aGenerated && 'line' in aGenerated && 'column' in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) {
          return;
        } else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated && aOriginal && 'line' in aOriginal && 'column' in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) {
          return;
        } else {
          throw new Error('Invalid mapping: ' + JSON.stringify({
            generated: aGenerated,
            source: aSource,
            original: aOriginal,
            name: aName
          }));
        }
      };
      SourceMapGenerator.prototype._serializeMappings = function SourceMapGenerator_serializeMappings() {
        var previousGeneratedColumn = 0;
        var previousGeneratedLine = 1;
        var previousOriginalColumn = 0;
        var previousOriginalLine = 0;
        var previousName = 0;
        var previousSource = 0;
        var result = '';
        var mapping;
        var mappings = this._mappings.toArray();
        for (var i = 0, len = mappings.length; i < len; i++) {
          mapping = mappings[i];
          if (mapping.generatedLine !== previousGeneratedLine) {
            previousGeneratedColumn = 0;
            while (mapping.generatedLine !== previousGeneratedLine) {
              result += ';';
              previousGeneratedLine++;
            }
          } else {
            if (i > 0) {
              if (!util.compareByGeneratedPositions(mapping, mappings[i - 1])) {
                continue;
              }
              result += ',';
            }
          }
          result += base64VLQ.encode(mapping.generatedColumn - previousGeneratedColumn);
          previousGeneratedColumn = mapping.generatedColumn;
          if (mapping.source != null) {
            result += base64VLQ.encode(this._sources.indexOf(mapping.source) - previousSource);
            previousSource = this._sources.indexOf(mapping.source);
            result += base64VLQ.encode(mapping.originalLine - 1 - previousOriginalLine);
            previousOriginalLine = mapping.originalLine - 1;
            result += base64VLQ.encode(mapping.originalColumn - previousOriginalColumn);
            previousOriginalColumn = mapping.originalColumn;
            if (mapping.name != null) {
              result += base64VLQ.encode(this._names.indexOf(mapping.name) - previousName);
              previousName = this._names.indexOf(mapping.name);
            }
          }
        }
        return result;
      };
      SourceMapGenerator.prototype._generateSourcesContent = function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
        return aSources.map(function (source) {
          if (!this._sourcesContents) {
            return null;
          }
          if (aSourceRoot != null) {
            source = util.relative(aSourceRoot, source);
          }
          var key = util.toSetString(source);
          return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key] : null;
        }, this);
      };
      SourceMapGenerator.prototype.toJSON = function SourceMapGenerator_toJSON() {
        var map = {
            version: this._version,
            sources: this._sources.toArray(),
            names: this._names.toArray(),
            mappings: this._serializeMappings()
          };
        if (this._file != null) {
          map.file = this._file;
        }
        if (this._sourceRoot != null) {
          map.sourceRoot = this._sourceRoot;
        }
        if (this._sourcesContents) {
          map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
        }
        return map;
      };
      SourceMapGenerator.prototype.toString = function SourceMapGenerator_toString() {
        return JSON.stringify(this);
      };
      exports.SourceMapGenerator = SourceMapGenerator;
    });
  });
  require.define('/node_modules/source-map/lib/source-map/mapping-list.js', function (module, exports, __dirname, __filename) {
    if (typeof define !== 'function') {
      var define = require('/node_modules/source-map/node_modules/amdefine/amdefine.js', module)(module, require);
    }
    define(function (require, exports, module) {
      var util = require('/node_modules/source-map/lib/source-map/util.js', module);
      function generatedPositionAfter(mappingA, mappingB) {
        var lineA = mappingA.generatedLine;
        var lineB = mappingB.generatedLine;
        var columnA = mappingA.generatedColumn;
        var columnB = mappingB.generatedColumn;
        return lineB > lineA || lineB == lineA && columnB >= columnA || util.compareByGeneratedPositions(mappingA, mappingB) <= 0;
      }
      function MappingList() {
        this._array = [];
        this._sorted = true;
        this._last = {
          generatedLine: -1,
          generatedColumn: 0
        };
      }
      MappingList.prototype.unsortedForEach = function MappingList_forEach(aCallback, aThisArg) {
        this._array.forEach(aCallback, aThisArg);
      };
      MappingList.prototype.add = function MappingList_add(aMapping) {
        var mapping;
        if (generatedPositionAfter(this._last, aMapping)) {
          this._last = aMapping;
          this._array.push(aMapping);
        } else {
          this._sorted = false;
          this._array.push(aMapping);
        }
      };
      MappingList.prototype.toArray = function MappingList_toArray() {
        if (!this._sorted) {
          this._array.sort(util.compareByGeneratedPositions);
          this._sorted = true;
        }
        return this._array;
      };
      exports.MappingList = MappingList;
    });
  });
  require.define('/node_modules/source-map/lib/source-map/array-set.js', function (module, exports, __dirname, __filename) {
    if (typeof define !== 'function') {
      var define = require('/node_modules/source-map/node_modules/amdefine/amdefine.js', module)(module, require);
    }
    define(function (require, exports, module) {
      var util = require('/node_modules/source-map/lib/source-map/util.js', module);
      function ArraySet() {
        this._array = [];
        this._set = {};
      }
      ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
        var set = new ArraySet;
        for (var i = 0, len = aArray.length; i < len; i++) {
          set.add(aArray[i], aAllowDuplicates);
        }
        return set;
      };
      ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
        var isDuplicate = this.has(aStr);
        var idx = this._array.length;
        if (!isDuplicate || aAllowDuplicates) {
          this._array.push(aStr);
        }
        if (!isDuplicate) {
          this._set[util.toSetString(aStr)] = idx;
        }
      };
      ArraySet.prototype.has = function ArraySet_has(aStr) {
        return Object.prototype.hasOwnProperty.call(this._set, util.toSetString(aStr));
      };
      ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
        if (this.has(aStr)) {
          return this._set[util.toSetString(aStr)];
        }
        throw new Error('"' + aStr + '" is not in the set.');
      };
      ArraySet.prototype.at = function ArraySet_at(aIdx) {
        if (aIdx >= 0 && aIdx < this._array.length) {
          return this._array[aIdx];
        }
        throw new Error('No element indexed by ' + aIdx);
      };
      ArraySet.prototype.toArray = function ArraySet_toArray() {
        return this._array.slice();
      };
      exports.ArraySet = ArraySet;
    });
  });
  require.define('/node_modules/source-map/lib/source-map/base64-vlq.js', function (module, exports, __dirname, __filename) {
    if (typeof define !== 'function') {
      var define = require('/node_modules/source-map/node_modules/amdefine/amdefine.js', module)(module, require);
    }
    define(function (require, exports, module) {
      var base64 = require('/node_modules/source-map/lib/source-map/base64.js', module);
      var VLQ_BASE_SHIFT = 5;
      var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
      var VLQ_BASE_MASK = VLQ_BASE - 1;
      var VLQ_CONTINUATION_BIT = VLQ_BASE;
      function toVLQSigned(aValue) {
        return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
      }
      function fromVLQSigned(aValue) {
        var isNegative = (aValue & 1) === 1;
        var shifted = aValue >> 1;
        return isNegative ? -shifted : shifted;
      }
      exports.encode = function base64VLQ_encode(aValue) {
        var encoded = '';
        var digit;
        var vlq = toVLQSigned(aValue);
        do {
          digit = vlq & VLQ_BASE_MASK;
          vlq >>>= VLQ_BASE_SHIFT;
          if (vlq > 0) {
            digit |= VLQ_CONTINUATION_BIT;
          }
          encoded += base64.encode(digit);
        } while (vlq > 0);
        return encoded;
      };
      exports.decode = function base64VLQ_decode(aStr, aOutParam) {
        var i = 0;
        var strLen = aStr.length;
        var result = 0;
        var shift = 0;
        var continuation, digit;
        do {
          if (i >= strLen) {
            throw new Error('Expected more digits in base 64 VLQ value.');
          }
          digit = base64.decode(aStr.charAt(i++));
          continuation = !!(digit & VLQ_CONTINUATION_BIT);
          digit &= VLQ_BASE_MASK;
          result = result + (digit << shift);
          shift += VLQ_BASE_SHIFT;
        } while (continuation);
        aOutParam.value = fromVLQSigned(result);
        aOutParam.rest = aStr.slice(i);
      };
    });
  });
  require.define('/node_modules/source-map/lib/source-map/base64.js', function (module, exports, __dirname, __filename) {
    if (typeof define !== 'function') {
      var define = require('/node_modules/source-map/node_modules/amdefine/amdefine.js', module)(module, require);
    }
    define(function (require, exports, module) {
      var charToIntMap = {};
      var intToCharMap = {};
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('').forEach(function (ch, index) {
        charToIntMap[ch] = index;
        intToCharMap[index] = ch;
      });
      exports.encode = function base64_encode(aNumber) {
        if (aNumber in intToCharMap) {
          return intToCharMap[aNumber];
        }
        throw new TypeError('Must be between 0 and 63: ' + aNumber);
      };
      exports.decode = function base64_decode(aChar) {
        if (aChar in charToIntMap) {
          return charToIntMap[aChar];
        }
        throw new TypeError('Not a valid base 64 digit: ' + aChar);
      };
    });
  });
  require.define('/node_modules/source-map/lib/source-map/source-map-consumer.js', function (module, exports, __dirname, __filename) {
    if (typeof define !== 'function') {
      var define = require('/node_modules/source-map/node_modules/amdefine/amdefine.js', module)(module, require);
    }
    define(function (require, exports, module) {
      var util = require('/node_modules/source-map/lib/source-map/util.js', module);
      function SourceMapConsumer(aSourceMap) {
        var sourceMap = aSourceMap;
        if (typeof aSourceMap === 'string') {
          sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
        }
        if (sourceMap.sections != null) {
          var indexedSourceMapConsumer = require('/node_modules/source-map/lib/source-map/indexed-source-map-consumer.js', module);
          return new indexedSourceMapConsumer.IndexedSourceMapConsumer(sourceMap);
        } else {
          var basicSourceMapConsumer = require('/node_modules/source-map/lib/source-map/basic-source-map-consumer.js', module);
          return new basicSourceMapConsumer.BasicSourceMapConsumer(sourceMap);
        }
      }
      SourceMapConsumer.fromSourceMap = function (aSourceMap) {
        var basicSourceMapConsumer = require('/node_modules/source-map/lib/source-map/basic-source-map-consumer.js', module);
        return basicSourceMapConsumer.BasicSourceMapConsumer.fromSourceMap(aSourceMap);
      };
      SourceMapConsumer.prototype._version = 3;
      SourceMapConsumer.prototype.__generatedMappings = null;
      Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
        get: function () {
          if (!this.__generatedMappings) {
            this.__generatedMappings = [];
            this.__originalMappings = [];
            this._parseMappings(this._mappings, this.sourceRoot);
          }
          return this.__generatedMappings;
        }
      });
      SourceMapConsumer.prototype.__originalMappings = null;
      Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
        get: function () {
          if (!this.__originalMappings) {
            this.__generatedMappings = [];
            this.__originalMappings = [];
            this._parseMappings(this._mappings, this.sourceRoot);
          }
          return this.__originalMappings;
        }
      });
      SourceMapConsumer.prototype._nextCharIsMappingSeparator = function SourceMapConsumer_nextCharIsMappingSeparator(aStr) {
        var c = aStr.charAt(0);
        return c === ';' || c === ',';
      };
      SourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
        throw new Error('Subclasses must implement _parseMappings');
      };
      SourceMapConsumer.GENERATED_ORDER = 1;
      SourceMapConsumer.ORIGINAL_ORDER = 2;
      SourceMapConsumer.prototype.eachMapping = function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
        var context = aContext || null;
        var order = aOrder || SourceMapConsumer.GENERATED_ORDER;
        var mappings;
        switch (order) {
        case SourceMapConsumer.GENERATED_ORDER:
          mappings = this._generatedMappings;
          break;
        case SourceMapConsumer.ORIGINAL_ORDER:
          mappings = this._originalMappings;
          break;
        default:
          throw new Error('Unknown order of iteration.');
        }
        var sourceRoot = this.sourceRoot;
        mappings.map(function (mapping) {
          var source = mapping.source;
          if (source != null && sourceRoot != null) {
            source = util.join(sourceRoot, source);
          }
          return {
            source: source,
            generatedLine: mapping.generatedLine,
            generatedColumn: mapping.generatedColumn,
            originalLine: mapping.originalLine,
            originalColumn: mapping.originalColumn,
            name: mapping.name
          };
        }).forEach(aCallback, context);
      };
      SourceMapConsumer.prototype.allGeneratedPositionsFor = function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
        var needle = {
            source: util.getArg(aArgs, 'source'),
            originalLine: util.getArg(aArgs, 'line'),
            originalColumn: Infinity
          };
        if (this.sourceRoot != null) {
          needle.source = util.relative(this.sourceRoot, needle.source);
        }
        var mappings = [];
        var index = this._findMapping(needle, this._originalMappings, 'originalLine', 'originalColumn', util.compareByOriginalPositions);
        if (index >= 0) {
          var mapping = this._originalMappings[index];
          while (mapping && mapping.originalLine === needle.originalLine) {
            mappings.push({
              line: util.getArg(mapping, 'generatedLine', null),
              column: util.getArg(mapping, 'generatedColumn', null),
              lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
            });
            mapping = this._originalMappings[--index];
          }
        }
        return mappings.reverse();
      };
      exports.SourceMapConsumer = SourceMapConsumer;
    });
  });
  require.define('/node_modules/source-map/lib/source-map/basic-source-map-consumer.js', function (module, exports, __dirname, __filename) {
    if (typeof define !== 'function') {
      var define = require('/node_modules/source-map/node_modules/amdefine/amdefine.js', module)(module, require);
    }
    define(function (require, exports, module) {
      var util = require('/node_modules/source-map/lib/source-map/util.js', module);
      var binarySearch = require('/node_modules/source-map/lib/source-map/binary-search.js', module);
      var ArraySet = require('/node_modules/source-map/lib/source-map/array-set.js', module).ArraySet;
      var base64VLQ = require('/node_modules/source-map/lib/source-map/base64-vlq.js', module);
      var SourceMapConsumer = require('/node_modules/source-map/lib/source-map/source-map-consumer.js', module).SourceMapConsumer;
      function BasicSourceMapConsumer(aSourceMap) {
        var sourceMap = aSourceMap;
        if (typeof aSourceMap === 'string') {
          sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
        }
        var version = util.getArg(sourceMap, 'version');
        var sources = util.getArg(sourceMap, 'sources');
        var names = util.getArg(sourceMap, 'names', []);
        var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
        var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
        var mappings = util.getArg(sourceMap, 'mappings');
        var file = util.getArg(sourceMap, 'file', null);
        if (version != this._version) {
          throw new Error('Unsupported version: ' + version);
        }
        sources = sources.map(util.normalize);
        this._names = ArraySet.fromArray(names, true);
        this._sources = ArraySet.fromArray(sources, true);
        this.sourceRoot = sourceRoot;
        this.sourcesContent = sourcesContent;
        this._mappings = mappings;
        this.file = file;
      }
      BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
      BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;
      BasicSourceMapConsumer.fromSourceMap = function SourceMapConsumer_fromSourceMap(aSourceMap) {
        var smc = Object.create(BasicSourceMapConsumer.prototype);
        smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
        smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
        smc.sourceRoot = aSourceMap._sourceRoot;
        smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(), smc.sourceRoot);
        smc.file = aSourceMap._file;
        smc.__generatedMappings = aSourceMap._mappings.toArray().slice();
        smc.__originalMappings = aSourceMap._mappings.toArray().slice().sort(util.compareByOriginalPositions);
        return smc;
      };
      BasicSourceMapConsumer.prototype._version = 3;
      Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
        get: function () {
          return this._sources.toArray().map(function (s) {
            return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
          }, this);
        }
      });
      BasicSourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
        var generatedLine = 1;
        var previousGeneratedColumn = 0;
        var previousOriginalLine = 0;
        var previousOriginalColumn = 0;
        var previousSource = 0;
        var previousName = 0;
        var str = aStr;
        var temp = {};
        var mapping;
        while (str.length > 0) {
          if (str.charAt(0) === ';') {
            generatedLine++;
            str = str.slice(1);
            previousGeneratedColumn = 0;
          } else if (str.charAt(0) === ',') {
            str = str.slice(1);
          } else {
            mapping = {};
            mapping.generatedLine = generatedLine;
            base64VLQ.decode(str, temp);
            mapping.generatedColumn = previousGeneratedColumn + temp.value;
            previousGeneratedColumn = mapping.generatedColumn;
            str = temp.rest;
            if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
              base64VLQ.decode(str, temp);
              mapping.source = this._sources.at(previousSource + temp.value);
              previousSource += temp.value;
              str = temp.rest;
              if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
                throw new Error('Found a source, but no line and column');
              }
              base64VLQ.decode(str, temp);
              mapping.originalLine = previousOriginalLine + temp.value;
              previousOriginalLine = mapping.originalLine;
              mapping.originalLine += 1;
              str = temp.rest;
              if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
                throw new Error('Found a source and line, but no column');
              }
              base64VLQ.decode(str, temp);
              mapping.originalColumn = previousOriginalColumn + temp.value;
              previousOriginalColumn = mapping.originalColumn;
              str = temp.rest;
              if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
                base64VLQ.decode(str, temp);
                mapping.name = this._names.at(previousName + temp.value);
                previousName += temp.value;
                str = temp.rest;
              }
            }
            this.__generatedMappings.push(mapping);
            if (typeof mapping.originalLine === 'number') {
              this.__originalMappings.push(mapping);
            }
          }
        }
        this.__generatedMappings.sort(util.compareByGeneratedPositions);
        this.__originalMappings.sort(util.compareByOriginalPositions);
      };
      BasicSourceMapConsumer.prototype._findMapping = function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator) {
        if (aNeedle[aLineName] <= 0) {
          throw new TypeError('Line must be greater than or equal to 1, got ' + aNeedle[aLineName]);
        }
        if (aNeedle[aColumnName] < 0) {
          throw new TypeError('Column must be greater than or equal to 0, got ' + aNeedle[aColumnName]);
        }
        return binarySearch.search(aNeedle, aMappings, aComparator);
      };
      BasicSourceMapConsumer.prototype.computeColumnSpans = function SourceMapConsumer_computeColumnSpans() {
        for (var index = 0; index < this._generatedMappings.length; ++index) {
          var mapping = this._generatedMappings[index];
          if (index + 1 < this._generatedMappings.length) {
            var nextMapping = this._generatedMappings[index + 1];
            if (mapping.generatedLine === nextMapping.generatedLine) {
              mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
              continue;
            }
          }
          mapping.lastGeneratedColumn = Infinity;
        }
      };
      BasicSourceMapConsumer.prototype.originalPositionFor = function SourceMapConsumer_originalPositionFor(aArgs) {
        var needle = {
            generatedLine: util.getArg(aArgs, 'line'),
            generatedColumn: util.getArg(aArgs, 'column')
          };
        var index = this._findMapping(needle, this._generatedMappings, 'generatedLine', 'generatedColumn', util.compareByGeneratedPositions);
        if (index >= 0) {
          var mapping = this._generatedMappings[index];
          if (mapping.generatedLine === needle.generatedLine) {
            var source = util.getArg(mapping, 'source', null);
            if (source != null && this.sourceRoot != null) {
              source = util.join(this.sourceRoot, source);
            }
            return {
              source: source,
              line: util.getArg(mapping, 'originalLine', null),
              column: util.getArg(mapping, 'originalColumn', null),
              name: util.getArg(mapping, 'name', null)
            };
          }
        }
        return {
          source: null,
          line: null,
          column: null,
          name: null
        };
      };
      BasicSourceMapConsumer.prototype.sourceContentFor = function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
        if (!this.sourcesContent) {
          return null;
        }
        if (this.sourceRoot != null) {
          aSource = util.relative(this.sourceRoot, aSource);
        }
        if (this._sources.has(aSource)) {
          return this.sourcesContent[this._sources.indexOf(aSource)];
        }
        var url;
        if (this.sourceRoot != null && (url = util.urlParse(this.sourceRoot))) {
          var fileUriAbsPath = aSource.replace(/^file:\/\//, '');
          if (url.scheme == 'file' && this._sources.has(fileUriAbsPath)) {
            return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
          }
          if ((!url.path || url.path == '/') && this._sources.has('/' + aSource)) {
            return this.sourcesContent[this._sources.indexOf('/' + aSource)];
          }
        }
        if (nullOnMissing) {
          return null;
        } else {
          throw new Error('"' + aSource + '" is not in the SourceMap.');
        }
      };
      BasicSourceMapConsumer.prototype.generatedPositionFor = function SourceMapConsumer_generatedPositionFor(aArgs) {
        var needle = {
            source: util.getArg(aArgs, 'source'),
            originalLine: util.getArg(aArgs, 'line'),
            originalColumn: util.getArg(aArgs, 'column')
          };
        if (this.sourceRoot != null) {
          needle.source = util.relative(this.sourceRoot, needle.source);
        }
        var index = this._findMapping(needle, this._originalMappings, 'originalLine', 'originalColumn', util.compareByOriginalPositions);
        if (index >= 0) {
          var mapping = this._originalMappings[index];
          return {
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          };
        }
        return {
          line: null,
          column: null,
          lastColumn: null
        };
      };
      exports.BasicSourceMapConsumer = BasicSourceMapConsumer;
    });
  });
  require.define('/node_modules/source-map/lib/source-map/binary-search.js', function (module, exports, __dirname, __filename) {
    if (typeof define !== 'function') {
      var define = require('/node_modules/source-map/node_modules/amdefine/amdefine.js', module)(module, require);
    }
    define(function (require, exports, module) {
      function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
        var mid = Math.floor((aHigh - aLow) / 2) + aLow;
        var cmp = aCompare(aNeedle, aHaystack[mid], true);
        if (cmp === 0) {
          return mid;
        } else if (cmp > 0) {
          if (aHigh - mid > 1) {
            return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
          }
          return mid;
        } else {
          if (mid - aLow > 1) {
            return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
          }
          return aLow < 0 ? -1 : aLow;
        }
      }
      exports.search = function search(aNeedle, aHaystack, aCompare) {
        if (aHaystack.length === 0) {
          return -1;
        }
        return recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare);
      };
    });
  });
  require.define('/node_modules/source-map/lib/source-map/indexed-source-map-consumer.js', function (module, exports, __dirname, __filename) {
    if (typeof define !== 'function') {
      var define = require('/node_modules/source-map/node_modules/amdefine/amdefine.js', module)(module, require);
    }
    define(function (require, exports, module) {
      var util = require('/node_modules/source-map/lib/source-map/util.js', module);
      var binarySearch = require('/node_modules/source-map/lib/source-map/binary-search.js', module);
      var SourceMapConsumer = require('/node_modules/source-map/lib/source-map/source-map-consumer.js', module).SourceMapConsumer;
      var BasicSourceMapConsumer = require('/node_modules/source-map/lib/source-map/basic-source-map-consumer.js', module).BasicSourceMapConsumer;
      function IndexedSourceMapConsumer(aSourceMap) {
        var sourceMap = aSourceMap;
        if (typeof aSourceMap === 'string') {
          sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
        }
        var version = util.getArg(sourceMap, 'version');
        var sections = util.getArg(sourceMap, 'sections');
        if (version != this._version) {
          throw new Error('Unsupported version: ' + version);
        }
        var lastOffset = {
            line: -1,
            column: 0
          };
        this._sections = sections.map(function (s) {
          if (s.url) {
            throw new Error('Support for url field in sections not implemented.');
          }
          var offset = util.getArg(s, 'offset');
          var offsetLine = util.getArg(offset, 'line');
          var offsetColumn = util.getArg(offset, 'column');
          if (offsetLine < lastOffset.line || offsetLine === lastOffset.line && offsetColumn < lastOffset.column) {
            throw new Error('Section offsets must be ordered and non-overlapping.');
          }
          lastOffset = offset;
          return {
            generatedOffset: {
              generatedLine: offsetLine + 1,
              generatedColumn: offsetColumn + 1
            },
            consumer: new SourceMapConsumer(util.getArg(s, 'map'))
          };
        });
      }
      IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
      IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;
      IndexedSourceMapConsumer.prototype._version = 3;
      Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
        get: function () {
          var sources = [];
          for (var i = 0; i < this._sections.length; i++) {
            for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
              sources.push(this._sections[i].consumer.sources[j]);
            }
          }
          ;
          return sources;
        }
      });
      IndexedSourceMapConsumer.prototype.originalPositionFor = function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
        var needle = {
            generatedLine: util.getArg(aArgs, 'line'),
            generatedColumn: util.getArg(aArgs, 'column')
          };
        var sectionIndex = binarySearch.search(needle, this._sections, function (needle, section) {
            var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
            if (cmp) {
              return cmp;
            }
            return needle.generatedColumn - section.generatedOffset.generatedColumn;
          });
        var section = this._sections[sectionIndex];
        if (!section) {
          return {
            source: null,
            line: null,
            column: null,
            name: null
          };
        }
        return section.consumer.originalPositionFor({
          line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
          column: needle.generatedColumn - (section.generatedOffset.generatedLine === needle.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0)
        });
      };
      IndexedSourceMapConsumer.prototype.sourceContentFor = function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
        for (var i = 0; i < this._sections.length; i++) {
          var section = this._sections[i];
          var content = section.consumer.sourceContentFor(aSource, true);
          if (content) {
            return content;
          }
        }
        if (nullOnMissing) {
          return null;
        } else {
          throw new Error('"' + aSource + '" is not in the SourceMap.');
        }
      };
      IndexedSourceMapConsumer.prototype.generatedPositionFor = function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
        for (var i = 0; i < this._sections.length; i++) {
          var section = this._sections[i];
          if (section.consumer.sources.indexOf(util.getArg(aArgs, 'source')) === -1) {
            continue;
          }
          var generatedPosition = section.consumer.generatedPositionFor(aArgs);
          if (generatedPosition) {
            var ret = {
                line: generatedPosition.line + (section.generatedOffset.generatedLine - 1),
                column: generatedPosition.column + (section.generatedOffset.generatedLine === generatedPosition.line ? section.generatedOffset.generatedColumn - 1 : 0)
              };
            return ret;
          }
        }
        return {
          line: null,
          column: null
        };
      };
      IndexedSourceMapConsumer.prototype._parseMappings = function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        for (var i = 0; i < this._sections.length; i++) {
          var section = this._sections[i];
          var sectionMappings = section.consumer._generatedMappings;
          for (var j = 0; j < sectionMappings.length; j++) {
            var mapping = sectionMappings[i];
            var source = mapping.source;
            var sourceRoot = section.consumer.sourceRoot;
            if (source != null && sourceRoot != null) {
              source = util.join(sourceRoot, source);
            }
            var adjustedMapping = {
                source: source,
                generatedLine: mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
                generatedColumn: mapping.column + (section.generatedOffset.generatedLine === mapping.generatedLine) ? section.generatedOffset.generatedColumn - 1 : 0,
                originalLine: mapping.originalLine,
                originalColumn: mapping.originalColumn,
                name: mapping.name
              };
            this.__generatedMappings.push(adjustedMapping);
            if (typeof adjustedMapping.originalLine === 'number') {
              this.__originalMappings.push(adjustedMapping);
            }
          }
          ;
        }
        ;
        this.__generatedMappings.sort(util.compareByGeneratedPositions);
        this.__originalMappings.sort(util.compareByOriginalPositions);
      };
      exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;
    });
  });
  require.define('/node_modules/esutils/lib/utils.js', function (module, exports, __dirname, __filename) {
    (function () {
      'use strict';
      exports.ast = require('/node_modules/esutils/lib/ast.js', module);
      exports.code = require('/node_modules/esutils/lib/code.js', module);
      exports.keyword = require('/node_modules/esutils/lib/keyword.js', module);
    }());
  });
  require.define('/node_modules/esutils/lib/keyword.js', function (module, exports, __dirname, __filename) {
    (function () {
      'use strict';
      var code = require('/node_modules/esutils/lib/code.js', module);
      function isStrictModeReservedWordES6(id) {
        switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'let':
          return true;
        default:
          return false;
        }
      }
      function isKeywordES5(id, strict) {
        if (!strict && id === 'yield') {
          return false;
        }
        return isKeywordES6(id, strict);
      }
      function isKeywordES6(id, strict) {
        if (strict && isStrictModeReservedWordES6(id)) {
          return true;
        }
        switch (id.length) {
        case 2:
          return id === 'if' || id === 'in' || id === 'do';
        case 3:
          return id === 'var' || id === 'for' || id === 'new' || id === 'try';
        case 4:
          return id === 'this' || id === 'else' || id === 'case' || id === 'void' || id === 'with' || id === 'enum';
        case 5:
          return id === 'while' || id === 'break' || id === 'catch' || id === 'throw' || id === 'const' || id === 'yield' || id === 'class' || id === 'super';
        case 6:
          return id === 'return' || id === 'typeof' || id === 'delete' || id === 'switch' || id === 'export' || id === 'import';
        case 7:
          return id === 'default' || id === 'finally' || id === 'extends';
        case 8:
          return id === 'function' || id === 'continue' || id === 'debugger';
        case 10:
          return id === 'instanceof';
        default:
          return false;
        }
      }
      function isReservedWordES5(id, strict) {
        return id === 'null' || id === 'true' || id === 'false' || isKeywordES5(id, strict);
      }
      function isReservedWordES6(id, strict) {
        return id === 'null' || id === 'true' || id === 'false' || isKeywordES6(id, strict);
      }
      function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
      }
      function isIdentifierNameES5(id) {
        var i, iz, ch;
        if (id.length === 0) {
          return false;
        }
        ch = id.charCodeAt(0);
        if (!code.isIdentifierStartES5(ch)) {
          return false;
        }
        for (i = 1, iz = id.length; i < iz; ++i) {
          ch = id.charCodeAt(i);
          if (!code.isIdentifierPartES5(ch)) {
            return false;
          }
        }
        return true;
      }
      function decodeUtf16(lead, trail) {
        return (lead - 55296) * 1024 + (trail - 56320) + 65536;
      }
      function isIdentifierNameES6(id) {
        var i, iz, ch, lowCh, check;
        if (id.length === 0) {
          return false;
        }
        check = code.isIdentifierStartES6;
        for (i = 0, iz = id.length; i < iz; ++i) {
          ch = id.charCodeAt(i);
          if (55296 <= ch && ch <= 56319) {
            ++i;
            if (i >= iz) {
              return false;
            }
            lowCh = id.charCodeAt(i);
            if (!(56320 <= lowCh && lowCh <= 57343)) {
              return false;
            }
            ch = decodeUtf16(ch, lowCh);
          }
          if (!check(ch)) {
            return false;
          }
          check = code.isIdentifierPartES6;
        }
        return true;
      }
      function isIdentifierES5(id, strict) {
        return isIdentifierNameES5(id) && !isReservedWordES5(id, strict);
      }
      function isIdentifierES6(id, strict) {
        return isIdentifierNameES6(id) && !isReservedWordES6(id, strict);
      }
      module.exports = {
        isKeywordES5: isKeywordES5,
        isKeywordES6: isKeywordES6,
        isReservedWordES5: isReservedWordES5,
        isReservedWordES6: isReservedWordES6,
        isRestrictedWord: isRestrictedWord,
        isIdentifierNameES5: isIdentifierNameES5,
        isIdentifierNameES6: isIdentifierNameES6,
        isIdentifierES5: isIdentifierES5,
        isIdentifierES6: isIdentifierES6
      };
    }());
  });
  require.define('/node_modules/esutils/lib/code.js', function (module, exports, __dirname, __filename) {
    (function () {
      'use strict';
      var ES6Regex, ES5Regex, NON_ASCII_WHITESPACES, IDENTIFIER_START, IDENTIFIER_PART, ch;
      ES5Regex = {
        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
        NonAsciiIdentifierPart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/
      };
      ES6Regex = {
        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDE00-\uDE11\uDE13-\uDE2B\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDE00-\uDE2F\uDE44\uDE80-\uDEAA]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/,
        NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDD0-\uDDDA\uDE00-\uDE11\uDE13-\uDE37\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF01-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
      };
      function isDecimalDigit(ch) {
        return 48 <= ch && ch <= 57;
      }
      function isHexDigit(ch) {
        return 48 <= ch && ch <= 57 || 97 <= ch && ch <= 102 || 65 <= ch && ch <= 70;
      }
      function isOctalDigit(ch) {
        return ch >= 48 && ch <= 55;
      }
      NON_ASCII_WHITESPACES = [
        5760,
        6158,
        8192,
        8193,
        8194,
        8195,
        8196,
        8197,
        8198,
        8199,
        8200,
        8201,
        8202,
        8239,
        8287,
        12288,
        65279
      ];
      function isWhiteSpace(ch) {
        return ch === 32 || ch === 9 || ch === 11 || ch === 12 || ch === 160 || ch >= 5760 && NON_ASCII_WHITESPACES.indexOf(ch) >= 0;
      }
      function isLineTerminator(ch) {
        return ch === 10 || ch === 13 || ch === 8232 || ch === 8233;
      }
      function fromCodePoint(cp) {
        if (cp <= 65535) {
          return String.fromCharCode(cp);
        }
        var cu1 = String.fromCharCode(Math.floor((cp - 65536) / 1024) + 55296);
        var cu2 = String.fromCharCode((cp - 65536) % 1024 + 56320);
        return cu1 + cu2;
      }
      IDENTIFIER_START = new Array(128);
      for (ch = 0; ch < 128; ++ch) {
        IDENTIFIER_START[ch] = ch >= 97 && ch <= 122 || ch >= 65 && ch <= 90 || ch === 36 || ch === 95;
      }
      IDENTIFIER_PART = new Array(128);
      for (ch = 0; ch < 128; ++ch) {
        IDENTIFIER_PART[ch] = ch >= 97 && ch <= 122 || ch >= 65 && ch <= 90 || ch >= 48 && ch <= 57 || ch === 36 || ch === 95;
      }
      function isIdentifierStartES5(ch) {
        return ch < 128 ? IDENTIFIER_START[ch] : ES5Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
      }
      function isIdentifierPartES5(ch) {
        return ch < 128 ? IDENTIFIER_PART[ch] : ES5Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
      }
      function isIdentifierStartES6(ch) {
        return ch < 128 ? IDENTIFIER_START[ch] : ES6Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
      }
      function isIdentifierPartES6(ch) {
        return ch < 128 ? IDENTIFIER_PART[ch] : ES6Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
      }
      module.exports = {
        isDecimalDigit: isDecimalDigit,
        isHexDigit: isHexDigit,
        isOctalDigit: isOctalDigit,
        isWhiteSpace: isWhiteSpace,
        isLineTerminator: isLineTerminator,
        isIdentifierStartES5: isIdentifierStartES5,
        isIdentifierPartES5: isIdentifierPartES5,
        isIdentifierStartES6: isIdentifierStartES6,
        isIdentifierPartES6: isIdentifierPartES6
      };
    }());
  });
  require.define('/node_modules/esutils/lib/ast.js', function (module, exports, __dirname, __filename) {
    (function () {
      'use strict';
      function isExpression(node) {
        if (node == null) {
          return false;
        }
        switch (node.type) {
        case 'ArrayExpression':
        case 'AssignmentExpression':
        case 'BinaryExpression':
        case 'CallExpression':
        case 'ConditionalExpression':
        case 'FunctionExpression':
        case 'Identifier':
        case 'Literal':
        case 'LogicalExpression':
        case 'MemberExpression':
        case 'NewExpression':
        case 'ObjectExpression':
        case 'SequenceExpression':
        case 'ThisExpression':
        case 'UnaryExpression':
        case 'UpdateExpression':
          return true;
        }
        return false;
      }
      function isIterationStatement(node) {
        if (node == null) {
          return false;
        }
        switch (node.type) {
        case 'DoWhileStatement':
        case 'ForInStatement':
        case 'ForStatement':
        case 'WhileStatement':
          return true;
        }
        return false;
      }
      function isStatement(node) {
        if (node == null) {
          return false;
        }
        switch (node.type) {
        case 'BlockStatement':
        case 'BreakStatement':
        case 'ContinueStatement':
        case 'DebuggerStatement':
        case 'DoWhileStatement':
        case 'EmptyStatement':
        case 'ExpressionStatement':
        case 'ForInStatement':
        case 'ForStatement':
        case 'IfStatement':
        case 'LabeledStatement':
        case 'ReturnStatement':
        case 'SwitchStatement':
        case 'ThrowStatement':
        case 'TryStatement':
        case 'VariableDeclaration':
        case 'WhileStatement':
        case 'WithStatement':
          return true;
        }
        return false;
      }
      function isSourceElement(node) {
        return isStatement(node) || node != null && node.type === 'FunctionDeclaration';
      }
      function trailingStatement(node) {
        switch (node.type) {
        case 'IfStatement':
          if (node.alternate != null) {
            return node.alternate;
          }
          return node.consequent;
        case 'LabeledStatement':
        case 'ForStatement':
        case 'ForInStatement':
        case 'WhileStatement':
        case 'WithStatement':
          return node.body;
        }
        return null;
      }
      function isProblematicIfStatement(node) {
        var current;
        if (node.type !== 'IfStatement') {
          return false;
        }
        if (node.alternate == null) {
          return false;
        }
        current = node.consequent;
        do {
          if (current.type === 'IfStatement') {
            if (current.alternate == null) {
              return true;
            }
          }
          current = trailingStatement(current);
        } while (current);
        return false;
      }
      module.exports = {
        isExpression: isExpression,
        isStatement: isStatement,
        isIterationStatement: isIterationStatement,
        isSourceElement: isSourceElement,
        isProblematicIfStatement: isProblematicIfStatement,
        trailingStatement: trailingStatement
      };
    }());
  });
  require.define('/node_modules/estraverse/estraverse.js', function (module, exports, __dirname, __filename) {
    (function (root, factory) {
      'use strict';
      if (typeof GLOBAL.define === 'function' && GLOBAL.define.amd) {
        GLOBAL.define(['exports'], factory);
      } else if (typeof exports !== 'undefined') {
        factory(exports);
      } else {
        factory(root.estraverse = {});
      }
    }(this, function clone(exports) {
      'use strict';
      var Syntax, isArray, VisitorOption, VisitorKeys, objectCreate, objectKeys, BREAK, SKIP, REMOVE;
      function ignoreJSHintError() {
      }
      isArray = Array.isArray;
      if (!isArray) {
        isArray = function isArray(array) {
          return Object.prototype.toString.call(array) === '[object Array]';
        };
      }
      function deepCopy(obj) {
        var ret = {}, key, val;
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            val = obj[key];
            if (typeof val === 'object' && val !== null) {
              ret[key] = deepCopy(val);
            } else {
              ret[key] = val;
            }
          }
        }
        return ret;
      }
      function shallowCopy(obj) {
        var ret = {}, key;
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            ret[key] = obj[key];
          }
        }
        return ret;
      }
      ignoreJSHintError(shallowCopy);
      function upperBound(array, func) {
        var diff, len, i, current;
        len = array.length;
        i = 0;
        while (len) {
          diff = len >>> 1;
          current = i + diff;
          if (func(array[current])) {
            len = diff;
          } else {
            i = current + 1;
            len -= diff + 1;
          }
        }
        return i;
      }
      function lowerBound(array, func) {
        var diff, len, i, current;
        len = array.length;
        i = 0;
        while (len) {
          diff = len >>> 1;
          current = i + diff;
          if (func(array[current])) {
            i = current + 1;
            len -= diff + 1;
          } else {
            len = diff;
          }
        }
        return i;
      }
      ignoreJSHintError(lowerBound);
      objectCreate = Object.create || function () {
        function F() {
        }
        return function (o) {
          F.prototype = o;
          return new F;
        };
      }();
      objectKeys = Object.keys || function (o) {
        var keys = [], key;
        for (key in o) {
          keys.push(key);
        }
        return keys;
      };
      function extend(to, from) {
        var keys = objectKeys(from), key, i, len;
        for (i = 0, len = keys.length; i < len; i += 1) {
          key = keys[i];
          to[key] = from[key];
        }
        return to;
      }
      Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        AwaitExpression: 'AwaitExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ComprehensionBlock: 'ComprehensionBlock',
        ComprehensionExpression: 'ComprehensionExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DebuggerStatement: 'DebuggerStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        EmptyStatement: 'EmptyStatement',
        ExportBatchSpecifier: 'ExportBatchSpecifier',
        ExportDeclaration: 'ExportDeclaration',
        ExportSpecifier: 'ExportSpecifier',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        ForOfStatement: 'ForOfStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        GeneratorExpression: 'GeneratorExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportDeclaration: 'ImportDeclaration',
        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
        ImportSpecifier: 'ImportSpecifier',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MethodDefinition: 'MethodDefinition',
        ModuleSpecifier: 'ModuleSpecifier',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SpreadElement: 'SpreadElement',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        TaggedTemplateExpression: 'TaggedTemplateExpression',
        TemplateElement: 'TemplateElement',
        TemplateLiteral: 'TemplateLiteral',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
      };
      VisitorKeys = {
        AssignmentExpression: [
          'left',
          'right'
        ],
        ArrayExpression: ['elements'],
        ArrayPattern: ['elements'],
        ArrowFunctionExpression: [
          'params',
          'defaults',
          'rest',
          'body'
        ],
        AwaitExpression: ['argument'],
        BlockStatement: ['body'],
        BinaryExpression: [
          'left',
          'right'
        ],
        BreakStatement: ['label'],
        CallExpression: [
          'callee',
          'arguments'
        ],
        CatchClause: [
          'param',
          'body'
        ],
        ClassBody: ['body'],
        ClassDeclaration: [
          'id',
          'body',
          'superClass'
        ],
        ClassExpression: [
          'id',
          'body',
          'superClass'
        ],
        ComprehensionBlock: [
          'left',
          'right'
        ],
        ComprehensionExpression: [
          'blocks',
          'filter',
          'body'
        ],
        ConditionalExpression: [
          'test',
          'consequent',
          'alternate'
        ],
        ContinueStatement: ['label'],
        DebuggerStatement: [],
        DirectiveStatement: [],
        DoWhileStatement: [
          'body',
          'test'
        ],
        EmptyStatement: [],
        ExportBatchSpecifier: [],
        ExportDeclaration: [
          'declaration',
          'specifiers',
          'source'
        ],
        ExportSpecifier: [
          'id',
          'name'
        ],
        ExpressionStatement: ['expression'],
        ForStatement: [
          'init',
          'test',
          'update',
          'body'
        ],
        ForInStatement: [
          'left',
          'right',
          'body'
        ],
        ForOfStatement: [
          'left',
          'right',
          'body'
        ],
        FunctionDeclaration: [
          'id',
          'params',
          'defaults',
          'rest',
          'body'
        ],
        FunctionExpression: [
          'id',
          'params',
          'defaults',
          'rest',
          'body'
        ],
        GeneratorExpression: [
          'blocks',
          'filter',
          'body'
        ],
        Identifier: [],
        IfStatement: [
          'test',
          'consequent',
          'alternate'
        ],
        ImportDeclaration: [
          'specifiers',
          'source'
        ],
        ImportDefaultSpecifier: ['id'],
        ImportNamespaceSpecifier: ['id'],
        ImportSpecifier: [
          'id',
          'name'
        ],
        Literal: [],
        LabeledStatement: [
          'label',
          'body'
        ],
        LogicalExpression: [
          'left',
          'right'
        ],
        MemberExpression: [
          'object',
          'property'
        ],
        MethodDefinition: [
          'key',
          'value'
        ],
        ModuleSpecifier: [],
        NewExpression: [
          'callee',
          'arguments'
        ],
        ObjectExpression: ['properties'],
        ObjectPattern: ['properties'],
        Program: ['body'],
        Property: [
          'key',
          'value'
        ],
        ReturnStatement: ['argument'],
        SequenceExpression: ['expressions'],
        SpreadElement: ['argument'],
        SwitchStatement: [
          'discriminant',
          'cases'
        ],
        SwitchCase: [
          'test',
          'consequent'
        ],
        TaggedTemplateExpression: [
          'tag',
          'quasi'
        ],
        TemplateElement: [],
        TemplateLiteral: [
          'quasis',
          'expressions'
        ],
        ThisExpression: [],
        ThrowStatement: ['argument'],
        TryStatement: [
          'block',
          'handlers',
          'handler',
          'guardedHandlers',
          'finalizer'
        ],
        UnaryExpression: ['argument'],
        UpdateExpression: ['argument'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: [
          'id',
          'init'
        ],
        WhileStatement: [
          'test',
          'body'
        ],
        WithStatement: [
          'object',
          'body'
        ],
        YieldExpression: ['argument']
      };
      BREAK = {};
      SKIP = {};
      REMOVE = {};
      VisitorOption = {
        Break: BREAK,
        Skip: SKIP,
        Remove: REMOVE
      };
      function Reference(parent, key) {
        this.parent = parent;
        this.key = key;
      }
      Reference.prototype.replace = function replace(node) {
        this.parent[this.key] = node;
      };
      Reference.prototype.remove = function remove() {
        if (isArray(this.parent)) {
          this.parent.splice(this.key, 1);
          return true;
        } else {
          this.replace(null);
          return false;
        }
      };
      function Element(node, path, wrap, ref) {
        this.node = node;
        this.path = path;
        this.wrap = wrap;
        this.ref = ref;
      }
      function Controller() {
      }
      Controller.prototype.path = function path() {
        var i, iz, j, jz, result, element;
        function addToPath(result, path) {
          if (isArray(path)) {
            for (j = 0, jz = path.length; j < jz; ++j) {
              result.push(path[j]);
            }
          } else {
            result.push(path);
          }
        }
        if (!this.__current.path) {
          return null;
        }
        result = [];
        for (i = 2, iz = this.__leavelist.length; i < iz; ++i) {
          element = this.__leavelist[i];
          addToPath(result, element.path);
        }
        addToPath(result, this.__current.path);
        return result;
      };
      Controller.prototype.type = function () {
        var node = this.current();
        return node.type || this.__current.wrap;
      };
      Controller.prototype.parents = function parents() {
        var i, iz, result;
        result = [];
        for (i = 1, iz = this.__leavelist.length; i < iz; ++i) {
          result.push(this.__leavelist[i].node);
        }
        return result;
      };
      Controller.prototype.current = function current() {
        return this.__current.node;
      };
      Controller.prototype.__execute = function __execute(callback, element) {
        var previous, result;
        result = undefined;
        previous = this.__current;
        this.__current = element;
        this.__state = null;
        if (callback) {
          result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
        }
        this.__current = previous;
        return result;
      };
      Controller.prototype.notify = function notify(flag) {
        this.__state = flag;
      };
      Controller.prototype.skip = function () {
        this.notify(SKIP);
      };
      Controller.prototype['break'] = function () {
        this.notify(BREAK);
      };
      Controller.prototype.remove = function () {
        this.notify(REMOVE);
      };
      Controller.prototype.__initialize = function (root, visitor) {
        this.visitor = visitor;
        this.root = root;
        this.__worklist = [];
        this.__leavelist = [];
        this.__current = null;
        this.__state = null;
        this.__fallback = visitor.fallback === 'iteration';
        this.__keys = VisitorKeys;
        if (visitor.keys) {
          this.__keys = extend(objectCreate(this.__keys), visitor.keys);
        }
      };
      function isNode(node) {
        if (node == null) {
          return false;
        }
        return typeof node === 'object' && typeof node.type === 'string';
      }
      function isProperty(nodeType, key) {
        return (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && 'properties' === key;
      }
      Controller.prototype.traverse = function traverse(root, visitor) {
        var worklist, leavelist, element, node, nodeType, ret, key, current, current2, candidates, candidate, sentinel;
        this.__initialize(root, visitor);
        sentinel = {};
        worklist = this.__worklist;
        leavelist = this.__leavelist;
        worklist.push(new Element(root, null, null, null));
        leavelist.push(new Element(null, null, null, null));
        while (worklist.length) {
          element = worklist.pop();
          if (element === sentinel) {
            element = leavelist.pop();
            ret = this.__execute(visitor.leave, element);
            if (this.__state === BREAK || ret === BREAK) {
              return;
            }
            continue;
          }
          if (element.node) {
            ret = this.__execute(visitor.enter, element);
            if (this.__state === BREAK || ret === BREAK) {
              return;
            }
            worklist.push(sentinel);
            leavelist.push(element);
            if (this.__state === SKIP || ret === SKIP) {
              continue;
            }
            node = element.node;
            nodeType = element.wrap || node.type;
            candidates = this.__keys[nodeType];
            if (!candidates) {
              if (this.__fallback) {
                candidates = objectKeys(node);
              } else {
                throw new Error('Unknown node type ' + nodeType + '.');
              }
            }
            current = candidates.length;
            while ((current -= 1) >= 0) {
              key = candidates[current];
              candidate = node[key];
              if (!candidate) {
                continue;
              }
              if (isArray(candidate)) {
                current2 = candidate.length;
                while ((current2 -= 1) >= 0) {
                  if (!candidate[current2]) {
                    continue;
                  }
                  if (isProperty(nodeType, candidates[current])) {
                    element = new Element(candidate[current2], [
                      key,
                      current2
                    ], 'Property', null);
                  } else if (isNode(candidate[current2])) {
                    element = new Element(candidate[current2], [
                      key,
                      current2
                    ], null, null);
                  } else {
                    continue;
                  }
                  worklist.push(element);
                }
              } else if (isNode(candidate)) {
                worklist.push(new Element(candidate, key, null, null));
              }
            }
          }
        }
      };
      Controller.prototype.replace = function replace(root, visitor) {
        function removeElem(element) {
          var i, key, nextElem, parent;
          if (element.ref.remove()) {
            key = element.ref.key;
            parent = element.ref.parent;
            i = worklist.length;
            while (i--) {
              nextElem = worklist[i];
              if (nextElem.ref && nextElem.ref.parent === parent) {
                if (nextElem.ref.key < key) {
                  break;
                }
                --nextElem.ref.key;
              }
            }
          }
        }
        var worklist, leavelist, node, nodeType, target, element, current, current2, candidates, candidate, sentinel, outer, key;
        this.__initialize(root, visitor);
        sentinel = {};
        worklist = this.__worklist;
        leavelist = this.__leavelist;
        outer = { root: root };
        element = new Element(root, null, null, new Reference(outer, 'root'));
        worklist.push(element);
        leavelist.push(element);
        while (worklist.length) {
          element = worklist.pop();
          if (element === sentinel) {
            element = leavelist.pop();
            target = this.__execute(visitor.leave, element);
            if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
              element.ref.replace(target);
            }
            if (this.__state === REMOVE || target === REMOVE) {
              removeElem(element);
            }
            if (this.__state === BREAK || target === BREAK) {
              return outer.root;
            }
            continue;
          }
          target = this.__execute(visitor.enter, element);
          if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
            element.ref.replace(target);
            element.node = target;
          }
          if (this.__state === REMOVE || target === REMOVE) {
            removeElem(element);
            element.node = null;
          }
          if (this.__state === BREAK || target === BREAK) {
            return outer.root;
          }
          node = element.node;
          if (!node) {
            continue;
          }
          worklist.push(sentinel);
          leavelist.push(element);
          if (this.__state === SKIP || target === SKIP) {
            continue;
          }
          nodeType = element.wrap || node.type;
          candidates = this.__keys[nodeType];
          if (!candidates) {
            if (this.__fallback) {
              candidates = objectKeys(node);
            } else {
              throw new Error('Unknown node type ' + nodeType + '.');
            }
          }
          current = candidates.length;
          while ((current -= 1) >= 0) {
            key = candidates[current];
            candidate = node[key];
            if (!candidate) {
              continue;
            }
            if (isArray(candidate)) {
              current2 = candidate.length;
              while ((current2 -= 1) >= 0) {
                if (!candidate[current2]) {
                  continue;
                }
                if (isProperty(nodeType, candidates[current])) {
                  element = new Element(candidate[current2], [
                    key,
                    current2
                  ], 'Property', new Reference(candidate, current2));
                } else if (isNode(candidate[current2])) {
                  element = new Element(candidate[current2], [
                    key,
                    current2
                  ], null, new Reference(candidate, current2));
                } else {
                  continue;
                }
                worklist.push(element);
              }
            } else if (isNode(candidate)) {
              worklist.push(new Element(candidate, key, null, new Reference(node, key)));
            }
          }
        }
        return outer.root;
      };
      function traverse(root, visitor) {
        var controller = new Controller;
        return controller.traverse(root, visitor);
      }
      function replace(root, visitor) {
        var controller = new Controller;
        return controller.replace(root, visitor);
      }
      function extendCommentRange(comment, tokens) {
        var target;
        target = upperBound(tokens, function search(token) {
          return token.range[0] > comment.range[0];
        });
        comment.extendedRange = [
          comment.range[0],
          comment.range[1]
        ];
        if (target !== tokens.length) {
          comment.extendedRange[1] = tokens[target].range[0];
        }
        target -= 1;
        if (target >= 0) {
          comment.extendedRange[0] = tokens[target].range[1];
        }
        return comment;
      }
      function attachComments(tree, providedComments, tokens) {
        var comments = [], comment, len, i, cursor;
        if (!tree.range) {
          throw new Error('attachComments needs range information');
        }
        if (!tokens.length) {
          if (providedComments.length) {
            for (i = 0, len = providedComments.length; i < len; i += 1) {
              comment = deepCopy(providedComments[i]);
              comment.extendedRange = [
                0,
                tree.range[0]
              ];
              comments.push(comment);
            }
            tree.leadingComments = comments;
          }
          return tree;
        }
        for (i = 0, len = providedComments.length; i < len; i += 1) {
          comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
        }
        cursor = 0;
        traverse(tree, {
          enter: function (node) {
            var comment;
            while (cursor < comments.length) {
              comment = comments[cursor];
              if (comment.extendedRange[1] > node.range[0]) {
                break;
              }
              if (comment.extendedRange[1] === node.range[0]) {
                if (!node.leadingComments) {
                  node.leadingComments = [];
                }
                node.leadingComments.push(comment);
                comments.splice(cursor, 1);
              } else {
                cursor += 1;
              }
            }
            if (cursor === comments.length) {
              return VisitorOption.Break;
            }
            if (comments[cursor].extendedRange[0] > node.range[1]) {
              return VisitorOption.Skip;
            }
          }
        });
        cursor = 0;
        traverse(tree, {
          leave: function (node) {
            var comment;
            while (cursor < comments.length) {
              comment = comments[cursor];
              if (node.range[1] < comment.extendedRange[0]) {
                break;
              }
              if (node.range[1] === comment.extendedRange[0]) {
                if (!node.trailingComments) {
                  node.trailingComments = [];
                }
                node.trailingComments.push(comment);
                comments.splice(cursor, 1);
              } else {
                cursor += 1;
              }
            }
            if (cursor === comments.length) {
              return VisitorOption.Break;
            }
            if (comments[cursor].extendedRange[0] > node.range[1]) {
              return VisitorOption.Skip;
            }
          }
        });
        return tree;
      }
      exports.version = '1.8.1-dev';
      exports.Syntax = Syntax;
      exports.traverse = traverse;
      exports.replace = replace;
      exports.attachComments = attachComments;
      exports.VisitorKeys = VisitorKeys;
      exports.VisitorOption = VisitorOption;
      exports.Controller = Controller;
      exports.cloneEnvironment = function () {
        return clone({});
      };
      return exports;
    }));
  });
  require('/tools/entry-point.js');
}.call(GLOBAL, GLOBAL));

})(typeof window !== "undefined" ? window :
    typeof global!=="undefined" ? global :
      typeof self!=="undefined" ? self : this);
;
(function() {
  var GLOBAL = typeof window !== "undefined" ? window :
      typeof global!=="undefined" ? global :
        typeof self!=="undefined" ? self : this;
  (function() {
    this.lively = this.lively || {};
(function (exports,lively_lang,escodegen,acorn$1) {
  'use strict';

  var babelHelpers = {};
  babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  babelHelpers.defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  babelHelpers.get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  babelHelpers.inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  babelHelpers.possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  babelHelpers.slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  babelHelpers.toArray = function (arr) {
    return Array.isArray(arr) ? arr : Array.from(arr);
  };

  babelHelpers.toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  babelHelpers;

  // <<<<<<<<<<<<< BEGIN OF AUTO GENERATED CODE <<<<<<<<<<<<<
  // Generated on 16-06-07 00:29 PDT

  function Visitor() {}
  Visitor.prototype.accept = function accept(node, state, path) {
    if (!node) throw new Error("Undefined AST node in Visitor.accept:\n  " + path.join(".") + "\n  " + node);
    if (!node.type) throw new Error("Strangee AST node without type in Visitor.accept:\n  " + path.join(".") + "\n  " + JSON.stringify(node));
    switch (node.type) {
      case "Node":
        return this.visitNode(node, state, path);
      case "SourceLocation":
        return this.visitSourceLocation(node, state, path);
      case "Position":
        return this.visitPosition(node, state, path);
      case "Program":
        return this.visitProgram(node, state, path);
      case "Function":
        return this.visitFunction(node, state, path);
      case "Statement":
        return this.visitStatement(node, state, path);
      case "SwitchCase":
        return this.visitSwitchCase(node, state, path);
      case "CatchClause":
        return this.visitCatchClause(node, state, path);
      case "VariableDeclarator":
        return this.visitVariableDeclarator(node, state, path);
      case "Expression":
        return this.visitExpression(node, state, path);
      case "Property":
        return this.visitProperty(node, state, path);
      case "Pattern":
        return this.visitPattern(node, state, path);
      case "Super":
        return this.visitSuper(node, state, path);
      case "SpreadElement":
        return this.visitSpreadElement(node, state, path);
      case "TemplateElement":
        return this.visitTemplateElement(node, state, path);
      case "Class":
        return this.visitClass(node, state, path);
      case "ClassBody":
        return this.visitClassBody(node, state, path);
      case "MethodDefinition":
        return this.visitMethodDefinition(node, state, path);
      case "ModuleDeclaration":
        return this.visitModuleDeclaration(node, state, path);
      case "ModuleSpecifier":
        return this.visitModuleSpecifier(node, state, path);
      case "Identifier":
        return this.visitIdentifier(node, state, path);
      case "Literal":
        return this.visitLiteral(node, state, path);
      case "ExpressionStatement":
        return this.visitExpressionStatement(node, state, path);
      case "BlockStatement":
        return this.visitBlockStatement(node, state, path);
      case "EmptyStatement":
        return this.visitEmptyStatement(node, state, path);
      case "DebuggerStatement":
        return this.visitDebuggerStatement(node, state, path);
      case "WithStatement":
        return this.visitWithStatement(node, state, path);
      case "ReturnStatement":
        return this.visitReturnStatement(node, state, path);
      case "LabeledStatement":
        return this.visitLabeledStatement(node, state, path);
      case "BreakStatement":
        return this.visitBreakStatement(node, state, path);
      case "ContinueStatement":
        return this.visitContinueStatement(node, state, path);
      case "IfStatement":
        return this.visitIfStatement(node, state, path);
      case "SwitchStatement":
        return this.visitSwitchStatement(node, state, path);
      case "ThrowStatement":
        return this.visitThrowStatement(node, state, path);
      case "TryStatement":
        return this.visitTryStatement(node, state, path);
      case "WhileStatement":
        return this.visitWhileStatement(node, state, path);
      case "DoWhileStatement":
        return this.visitDoWhileStatement(node, state, path);
      case "ForStatement":
        return this.visitForStatement(node, state, path);
      case "ForInStatement":
        return this.visitForInStatement(node, state, path);
      case "Declaration":
        return this.visitDeclaration(node, state, path);
      case "ThisExpression":
        return this.visitThisExpression(node, state, path);
      case "ArrayExpression":
        return this.visitArrayExpression(node, state, path);
      case "ObjectExpression":
        return this.visitObjectExpression(node, state, path);
      case "FunctionExpression":
        return this.visitFunctionExpression(node, state, path);
      case "UnaryExpression":
        return this.visitUnaryExpression(node, state, path);
      case "UpdateExpression":
        return this.visitUpdateExpression(node, state, path);
      case "BinaryExpression":
        return this.visitBinaryExpression(node, state, path);
      case "AssignmentExpression":
        return this.visitAssignmentExpression(node, state, path);
      case "LogicalExpression":
        return this.visitLogicalExpression(node, state, path);
      case "MemberExpression":
        return this.visitMemberExpression(node, state, path);
      case "ConditionalExpression":
        return this.visitConditionalExpression(node, state, path);
      case "CallExpression":
        return this.visitCallExpression(node, state, path);
      case "SequenceExpression":
        return this.visitSequenceExpression(node, state, path);
      case "ArrowFunctionExpression":
        return this.visitArrowFunctionExpression(node, state, path);
      case "YieldExpression":
        return this.visitYieldExpression(node, state, path);
      case "TemplateLiteral":
        return this.visitTemplateLiteral(node, state, path);
      case "TaggedTemplateExpression":
        return this.visitTaggedTemplateExpression(node, state, path);
      case "AssignmentProperty":
        return this.visitAssignmentProperty(node, state, path);
      case "ObjectPattern":
        return this.visitObjectPattern(node, state, path);
      case "ArrayPattern":
        return this.visitArrayPattern(node, state, path);
      case "RestElement":
        return this.visitRestElement(node, state, path);
      case "AssignmentPattern":
        return this.visitAssignmentPattern(node, state, path);
      case "ClassExpression":
        return this.visitClassExpression(node, state, path);
      case "MetaProperty":
        return this.visitMetaProperty(node, state, path);
      case "ImportDeclaration":
        return this.visitImportDeclaration(node, state, path);
      case "ImportSpecifier":
        return this.visitImportSpecifier(node, state, path);
      case "ImportDefaultSpecifier":
        return this.visitImportDefaultSpecifier(node, state, path);
      case "ImportNamespaceSpecifier":
        return this.visitImportNamespaceSpecifier(node, state, path);
      case "ExportNamedDeclaration":
        return this.visitExportNamedDeclaration(node, state, path);
      case "ExportSpecifier":
        return this.visitExportSpecifier(node, state, path);
      case "ExportDefaultDeclaration":
        return this.visitExportDefaultDeclaration(node, state, path);
      case "ExportAllDeclaration":
        return this.visitExportAllDeclaration(node, state, path);
      case "AwaitExpression":
        return this.visitAwaitExpression(node, state, path);
      case "RegExpLiteral":
        return this.visitRegExpLiteral(node, state, path);
      case "FunctionDeclaration":
        return this.visitFunctionDeclaration(node, state, path);
      case "VariableDeclaration":
        return this.visitVariableDeclaration(node, state, path);
      case "NewExpression":
        return this.visitNewExpression(node, state, path);
      case "ForOfStatement":
        return this.visitForOfStatement(node, state, path);
      case "ClassDeclaration":
        return this.visitClassDeclaration(node, state, path);
    }
    throw new Error("No visit function in AST visitor Visitor for:\n  " + path.join(".") + "\n  " + JSON.stringify(node));
  };
  Visitor.prototype.visitNode = function visitNode(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitSourceLocation = function visitSourceLocation(node, state, path) {
    var visitor = this;
    // start is of types Position
    node["start"] = visitor.accept(node["start"], state, path.concat(["start"]));
    // end is of types Position
    node["end"] = visitor.accept(node["end"], state, path.concat(["end"]));
    return node;
  };
  Visitor.prototype.visitPosition = function visitPosition(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitProgram = function visitProgram(node, state, path) {
    var visitor = this;
    // body is a list with types Statement, ModuleDeclaration
    var newElements = [];
    for (var i = 0; i < node["body"].length; i++) {
      var ea = node["body"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["body", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["body"] = newElements;
    return node;
  };
  Visitor.prototype.visitFunction = function visitFunction(node, state, path) {
    var visitor = this;
    // id is of types Identifier
    if (node["id"]) {
      node["id"] = visitor.accept(node["id"], state, path.concat(["id"]));
    }
    // params is a list with types Pattern
    var newElements = [];
    for (var i = 0; i < node["params"].length; i++) {
      var ea = node["params"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["params", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["params"] = newElements;
    // body is of types BlockStatement
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    return node;
  };
  Visitor.prototype.visitStatement = function visitStatement(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitSwitchCase = function visitSwitchCase(node, state, path) {
    var visitor = this;
    // test is of types Expression
    if (node["test"]) {
      node["test"] = visitor.accept(node["test"], state, path.concat(["test"]));
    }
    // consequent is a list with types Statement
    var newElements = [];
    for (var i = 0; i < node["consequent"].length; i++) {
      var ea = node["consequent"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["consequent", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["consequent"] = newElements;
    return node;
  };
  Visitor.prototype.visitCatchClause = function visitCatchClause(node, state, path) {
    var visitor = this;
    // param is of types Pattern
    node["param"] = visitor.accept(node["param"], state, path.concat(["param"]));
    // body is of types BlockStatement
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    return node;
  };
  Visitor.prototype.visitVariableDeclarator = function visitVariableDeclarator(node, state, path) {
    var visitor = this;
    // id is of types Pattern
    node["id"] = visitor.accept(node["id"], state, path.concat(["id"]));
    // init is of types Expression
    if (node["init"]) {
      node["init"] = visitor.accept(node["init"], state, path.concat(["init"]));
    }
    return node;
  };
  Visitor.prototype.visitExpression = function visitExpression(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitProperty = function visitProperty(node, state, path) {
    var visitor = this;
    // key is of types Expression
    node["key"] = visitor.accept(node["key"], state, path.concat(["key"]));
    // value is of types Expression
    node["value"] = visitor.accept(node["value"], state, path.concat(["value"]));
    return node;
  };
  Visitor.prototype.visitPattern = function visitPattern(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitSuper = function visitSuper(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitSpreadElement = function visitSpreadElement(node, state, path) {
    var visitor = this;
    // argument is of types Expression
    node["argument"] = visitor.accept(node["argument"], state, path.concat(["argument"]));
    return node;
  };
  Visitor.prototype.visitTemplateElement = function visitTemplateElement(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitClass = function visitClass(node, state, path) {
    var visitor = this;
    // id is of types Identifier
    if (node["id"]) {
      node["id"] = visitor.accept(node["id"], state, path.concat(["id"]));
    }
    // superClass is of types Expression
    if (node["superClass"]) {
      node["superClass"] = visitor.accept(node["superClass"], state, path.concat(["superClass"]));
    }
    // body is of types ClassBody
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    return node;
  };
  Visitor.prototype.visitClassBody = function visitClassBody(node, state, path) {
    var visitor = this;
    // body is a list with types MethodDefinition
    var newElements = [];
    for (var i = 0; i < node["body"].length; i++) {
      var ea = node["body"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["body", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["body"] = newElements;
    return node;
  };
  Visitor.prototype.visitMethodDefinition = function visitMethodDefinition(node, state, path) {
    var visitor = this;
    // key is of types Expression
    node["key"] = visitor.accept(node["key"], state, path.concat(["key"]));
    // value is of types FunctionExpression
    node["value"] = visitor.accept(node["value"], state, path.concat(["value"]));
    return node;
  };
  Visitor.prototype.visitModuleDeclaration = function visitModuleDeclaration(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitModuleSpecifier = function visitModuleSpecifier(node, state, path) {
    var visitor = this;
    // local is of types Identifier
    node["local"] = visitor.accept(node["local"], state, path.concat(["local"]));
    return node;
  };
  Visitor.prototype.visitIdentifier = function visitIdentifier(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitLiteral = function visitLiteral(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitExpressionStatement = function visitExpressionStatement(node, state, path) {
    var visitor = this;
    // expression is of types Expression
    node["expression"] = visitor.accept(node["expression"], state, path.concat(["expression"]));
    return node;
  };
  Visitor.prototype.visitBlockStatement = function visitBlockStatement(node, state, path) {
    var visitor = this;
    // body is a list with types Statement
    var newElements = [];
    for (var i = 0; i < node["body"].length; i++) {
      var ea = node["body"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["body", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["body"] = newElements;
    return node;
  };
  Visitor.prototype.visitEmptyStatement = function visitEmptyStatement(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitDebuggerStatement = function visitDebuggerStatement(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitWithStatement = function visitWithStatement(node, state, path) {
    var visitor = this;
    // object is of types Expression
    node["object"] = visitor.accept(node["object"], state, path.concat(["object"]));
    // body is of types Statement
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    return node;
  };
  Visitor.prototype.visitReturnStatement = function visitReturnStatement(node, state, path) {
    var visitor = this;
    // argument is of types Expression
    if (node["argument"]) {
      node["argument"] = visitor.accept(node["argument"], state, path.concat(["argument"]));
    }
    return node;
  };
  Visitor.prototype.visitLabeledStatement = function visitLabeledStatement(node, state, path) {
    var visitor = this;
    // label is of types Identifier
    node["label"] = visitor.accept(node["label"], state, path.concat(["label"]));
    // body is of types Statement
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    return node;
  };
  Visitor.prototype.visitBreakStatement = function visitBreakStatement(node, state, path) {
    var visitor = this;
    // label is of types Identifier
    if (node["label"]) {
      node["label"] = visitor.accept(node["label"], state, path.concat(["label"]));
    }
    return node;
  };
  Visitor.prototype.visitContinueStatement = function visitContinueStatement(node, state, path) {
    var visitor = this;
    // label is of types Identifier
    if (node["label"]) {
      node["label"] = visitor.accept(node["label"], state, path.concat(["label"]));
    }
    return node;
  };
  Visitor.prototype.visitIfStatement = function visitIfStatement(node, state, path) {
    var visitor = this;
    // test is of types Expression
    node["test"] = visitor.accept(node["test"], state, path.concat(["test"]));
    // consequent is of types Statement
    node["consequent"] = visitor.accept(node["consequent"], state, path.concat(["consequent"]));
    // alternate is of types Statement
    if (node["alternate"]) {
      node["alternate"] = visitor.accept(node["alternate"], state, path.concat(["alternate"]));
    }
    return node;
  };
  Visitor.prototype.visitSwitchStatement = function visitSwitchStatement(node, state, path) {
    var visitor = this;
    // discriminant is of types Expression
    node["discriminant"] = visitor.accept(node["discriminant"], state, path.concat(["discriminant"]));
    // cases is a list with types SwitchCase
    var newElements = [];
    for (var i = 0; i < node["cases"].length; i++) {
      var ea = node["cases"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["cases", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["cases"] = newElements;
    return node;
  };
  Visitor.prototype.visitThrowStatement = function visitThrowStatement(node, state, path) {
    var visitor = this;
    // argument is of types Expression
    node["argument"] = visitor.accept(node["argument"], state, path.concat(["argument"]));
    return node;
  };
  Visitor.prototype.visitTryStatement = function visitTryStatement(node, state, path) {
    var visitor = this;
    // block is of types BlockStatement
    node["block"] = visitor.accept(node["block"], state, path.concat(["block"]));
    // handler is of types CatchClause
    if (node["handler"]) {
      node["handler"] = visitor.accept(node["handler"], state, path.concat(["handler"]));
    }
    // finalizer is of types BlockStatement
    if (node["finalizer"]) {
      node["finalizer"] = visitor.accept(node["finalizer"], state, path.concat(["finalizer"]));
    }
    return node;
  };
  Visitor.prototype.visitWhileStatement = function visitWhileStatement(node, state, path) {
    var visitor = this;
    // test is of types Expression
    node["test"] = visitor.accept(node["test"], state, path.concat(["test"]));
    // body is of types Statement
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    return node;
  };
  Visitor.prototype.visitDoWhileStatement = function visitDoWhileStatement(node, state, path) {
    var visitor = this;
    // body is of types Statement
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    // test is of types Expression
    node["test"] = visitor.accept(node["test"], state, path.concat(["test"]));
    return node;
  };
  Visitor.prototype.visitForStatement = function visitForStatement(node, state, path) {
    var visitor = this;
    // init is of types VariableDeclaration, Expression
    if (node["init"]) {
      node["init"] = visitor.accept(node["init"], state, path.concat(["init"]));
    }
    // test is of types Expression
    if (node["test"]) {
      node["test"] = visitor.accept(node["test"], state, path.concat(["test"]));
    }
    // update is of types Expression
    if (node["update"]) {
      node["update"] = visitor.accept(node["update"], state, path.concat(["update"]));
    }
    // body is of types Statement
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    return node;
  };
  Visitor.prototype.visitForInStatement = function visitForInStatement(node, state, path) {
    var visitor = this;
    // left is of types VariableDeclaration, Pattern
    node["left"] = visitor.accept(node["left"], state, path.concat(["left"]));
    // right is of types Expression
    node["right"] = visitor.accept(node["right"], state, path.concat(["right"]));
    // body is of types Statement
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    return node;
  };
  Visitor.prototype.visitDeclaration = function visitDeclaration(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitThisExpression = function visitThisExpression(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitArrayExpression = function visitArrayExpression(node, state, path) {
    var visitor = this;
    // elements is a list with types Expression, SpreadElement
    if (node["elements"]) {
      var newElements = [];
      for (var i = 0; i < node["elements"].length; i++) {
        var ea = node["elements"][i];
        var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["elements", i])) : ea;
        if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
      }
      node["elements"] = newElements;
    }
    return node;
  };
  Visitor.prototype.visitObjectExpression = function visitObjectExpression(node, state, path) {
    var visitor = this;
    // properties is a list with types Property
    var newElements = [];
    for (var i = 0; i < node["properties"].length; i++) {
      var ea = node["properties"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["properties", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["properties"] = newElements;
    return node;
  };
  Visitor.prototype.visitFunctionExpression = function visitFunctionExpression(node, state, path) {
    var visitor = this;
    // id is of types Identifier
    if (node["id"]) {
      node["id"] = visitor.accept(node["id"], state, path.concat(["id"]));
    }
    // params is a list with types Pattern
    var newElements = [];
    for (var i = 0; i < node["params"].length; i++) {
      var ea = node["params"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["params", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["params"] = newElements;
    // body is of types BlockStatement
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    return node;
  };
  Visitor.prototype.visitUnaryExpression = function visitUnaryExpression(node, state, path) {
    var visitor = this;
    // argument is of types Expression
    node["argument"] = visitor.accept(node["argument"], state, path.concat(["argument"]));
    return node;
  };
  Visitor.prototype.visitUpdateExpression = function visitUpdateExpression(node, state, path) {
    var visitor = this;
    // argument is of types Expression
    node["argument"] = visitor.accept(node["argument"], state, path.concat(["argument"]));
    return node;
  };
  Visitor.prototype.visitBinaryExpression = function visitBinaryExpression(node, state, path) {
    var visitor = this;
    // left is of types Expression
    node["left"] = visitor.accept(node["left"], state, path.concat(["left"]));
    // right is of types Expression
    node["right"] = visitor.accept(node["right"], state, path.concat(["right"]));
    return node;
  };
  Visitor.prototype.visitAssignmentExpression = function visitAssignmentExpression(node, state, path) {
    var visitor = this;
    // left is of types Pattern
    node["left"] = visitor.accept(node["left"], state, path.concat(["left"]));
    // right is of types Expression
    node["right"] = visitor.accept(node["right"], state, path.concat(["right"]));
    return node;
  };
  Visitor.prototype.visitLogicalExpression = function visitLogicalExpression(node, state, path) {
    var visitor = this;
    // left is of types Expression
    node["left"] = visitor.accept(node["left"], state, path.concat(["left"]));
    // right is of types Expression
    node["right"] = visitor.accept(node["right"], state, path.concat(["right"]));
    return node;
  };
  Visitor.prototype.visitMemberExpression = function visitMemberExpression(node, state, path) {
    var visitor = this;
    // object is of types Expression, Super
    node["object"] = visitor.accept(node["object"], state, path.concat(["object"]));
    // property is of types Expression
    node["property"] = visitor.accept(node["property"], state, path.concat(["property"]));
    return node;
  };
  Visitor.prototype.visitConditionalExpression = function visitConditionalExpression(node, state, path) {
    var visitor = this;
    // test is of types Expression
    node["test"] = visitor.accept(node["test"], state, path.concat(["test"]));
    // alternate is of types Expression
    node["alternate"] = visitor.accept(node["alternate"], state, path.concat(["alternate"]));
    // consequent is of types Expression
    node["consequent"] = visitor.accept(node["consequent"], state, path.concat(["consequent"]));
    return node;
  };
  Visitor.prototype.visitCallExpression = function visitCallExpression(node, state, path) {
    var visitor = this;
    // callee is of types Expression, Super
    node["callee"] = visitor.accept(node["callee"], state, path.concat(["callee"]));
    // arguments is a list with types Expression, SpreadElement
    var newElements = [];
    for (var i = 0; i < node["arguments"].length; i++) {
      var ea = node["arguments"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["arguments", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["arguments"] = newElements;
    return node;
  };
  Visitor.prototype.visitSequenceExpression = function visitSequenceExpression(node, state, path) {
    var visitor = this;
    // expressions is a list with types Expression
    var newElements = [];
    for (var i = 0; i < node["expressions"].length; i++) {
      var ea = node["expressions"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["expressions", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["expressions"] = newElements;
    return node;
  };
  Visitor.prototype.visitArrowFunctionExpression = function visitArrowFunctionExpression(node, state, path) {
    var visitor = this;
    // body is of types BlockStatement, Expression
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    // id is of types Identifier
    if (node["id"]) {
      node["id"] = visitor.accept(node["id"], state, path.concat(["id"]));
    }
    // params is a list with types Pattern
    var newElements = [];
    for (var i = 0; i < node["params"].length; i++) {
      var ea = node["params"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["params", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["params"] = newElements;
    return node;
  };
  Visitor.prototype.visitYieldExpression = function visitYieldExpression(node, state, path) {
    var visitor = this;
    // argument is of types Expression
    if (node["argument"]) {
      node["argument"] = visitor.accept(node["argument"], state, path.concat(["argument"]));
    }
    return node;
  };
  Visitor.prototype.visitTemplateLiteral = function visitTemplateLiteral(node, state, path) {
    var visitor = this;
    // quasis is a list with types TemplateElement
    var newElements = [];
    for (var i = 0; i < node["quasis"].length; i++) {
      var ea = node["quasis"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["quasis", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["quasis"] = newElements;
    // expressions is a list with types Expression
    var newElements = [];
    for (var i = 0; i < node["expressions"].length; i++) {
      var ea = node["expressions"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["expressions", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["expressions"] = newElements;
    return node;
  };
  Visitor.prototype.visitTaggedTemplateExpression = function visitTaggedTemplateExpression(node, state, path) {
    var visitor = this;
    // tag is of types Expression
    node["tag"] = visitor.accept(node["tag"], state, path.concat(["tag"]));
    // quasi is of types TemplateLiteral
    node["quasi"] = visitor.accept(node["quasi"], state, path.concat(["quasi"]));
    return node;
  };
  Visitor.prototype.visitAssignmentProperty = function visitAssignmentProperty(node, state, path) {
    var visitor = this;
    // value is of types Pattern, Expression
    node["value"] = visitor.accept(node["value"], state, path.concat(["value"]));
    // key is of types Expression
    node["key"] = visitor.accept(node["key"], state, path.concat(["key"]));
    return node;
  };
  Visitor.prototype.visitObjectPattern = function visitObjectPattern(node, state, path) {
    var visitor = this;
    // properties is a list with types AssignmentProperty
    var newElements = [];
    for (var i = 0; i < node["properties"].length; i++) {
      var ea = node["properties"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["properties", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["properties"] = newElements;
    return node;
  };
  Visitor.prototype.visitArrayPattern = function visitArrayPattern(node, state, path) {
    var visitor = this;
    // elements is a list with types Pattern
    if (node["elements"]) {
      var newElements = [];
      for (var i = 0; i < node["elements"].length; i++) {
        var ea = node["elements"][i];
        var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["elements", i])) : ea;
        if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
      }
      node["elements"] = newElements;
    }
    return node;
  };
  Visitor.prototype.visitRestElement = function visitRestElement(node, state, path) {
    var visitor = this;
    // argument is of types Pattern
    node["argument"] = visitor.accept(node["argument"], state, path.concat(["argument"]));
    return node;
  };
  Visitor.prototype.visitAssignmentPattern = function visitAssignmentPattern(node, state, path) {
    var visitor = this;
    // left is of types Pattern
    node["left"] = visitor.accept(node["left"], state, path.concat(["left"]));
    // right is of types Expression
    node["right"] = visitor.accept(node["right"], state, path.concat(["right"]));
    return node;
  };
  Visitor.prototype.visitClassExpression = function visitClassExpression(node, state, path) {
    var visitor = this;
    // id is of types Identifier
    if (node["id"]) {
      node["id"] = visitor.accept(node["id"], state, path.concat(["id"]));
    }
    // superClass is of types Expression
    if (node["superClass"]) {
      node["superClass"] = visitor.accept(node["superClass"], state, path.concat(["superClass"]));
    }
    // body is of types ClassBody
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    return node;
  };
  Visitor.prototype.visitMetaProperty = function visitMetaProperty(node, state, path) {
    var visitor = this;
    // meta is of types Identifier
    node["meta"] = visitor.accept(node["meta"], state, path.concat(["meta"]));
    // property is of types Identifier
    node["property"] = visitor.accept(node["property"], state, path.concat(["property"]));
    return node;
  };
  Visitor.prototype.visitImportDeclaration = function visitImportDeclaration(node, state, path) {
    var visitor = this;
    // specifiers is a list with types ImportSpecifier, ImportDefaultSpecifier, ImportNamespaceSpecifier
    var newElements = [];
    for (var i = 0; i < node["specifiers"].length; i++) {
      var ea = node["specifiers"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["specifiers", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["specifiers"] = newElements;
    // source is of types Literal
    node["source"] = visitor.accept(node["source"], state, path.concat(["source"]));
    return node;
  };
  Visitor.prototype.visitImportSpecifier = function visitImportSpecifier(node, state, path) {
    var visitor = this;
    // imported is of types Identifier
    node["imported"] = visitor.accept(node["imported"], state, path.concat(["imported"]));
    // local is of types Identifier
    node["local"] = visitor.accept(node["local"], state, path.concat(["local"]));
    return node;
  };
  Visitor.prototype.visitImportDefaultSpecifier = function visitImportDefaultSpecifier(node, state, path) {
    var visitor = this;
    // local is of types Identifier
    node["local"] = visitor.accept(node["local"], state, path.concat(["local"]));
    return node;
  };
  Visitor.prototype.visitImportNamespaceSpecifier = function visitImportNamespaceSpecifier(node, state, path) {
    var visitor = this;
    // local is of types Identifier
    node["local"] = visitor.accept(node["local"], state, path.concat(["local"]));
    return node;
  };
  Visitor.prototype.visitExportNamedDeclaration = function visitExportNamedDeclaration(node, state, path) {
    var visitor = this;
    // declaration is of types Declaration
    if (node["declaration"]) {
      node["declaration"] = visitor.accept(node["declaration"], state, path.concat(["declaration"]));
    }
    // specifiers is a list with types ExportSpecifier
    var newElements = [];
    for (var i = 0; i < node["specifiers"].length; i++) {
      var ea = node["specifiers"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["specifiers", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["specifiers"] = newElements;
    // source is of types Literal
    if (node["source"]) {
      node["source"] = visitor.accept(node["source"], state, path.concat(["source"]));
    }
    return node;
  };
  Visitor.prototype.visitExportSpecifier = function visitExportSpecifier(node, state, path) {
    var visitor = this;
    // exported is of types Identifier
    node["exported"] = visitor.accept(node["exported"], state, path.concat(["exported"]));
    // local is of types Identifier
    node["local"] = visitor.accept(node["local"], state, path.concat(["local"]));
    return node;
  };
  Visitor.prototype.visitExportDefaultDeclaration = function visitExportDefaultDeclaration(node, state, path) {
    var visitor = this;
    // declaration is of types Declaration, Expression
    node["declaration"] = visitor.accept(node["declaration"], state, path.concat(["declaration"]));
    return node;
  };
  Visitor.prototype.visitExportAllDeclaration = function visitExportAllDeclaration(node, state, path) {
    var visitor = this;
    // source is of types Literal
    node["source"] = visitor.accept(node["source"], state, path.concat(["source"]));
    return node;
  };
  Visitor.prototype.visitAwaitExpression = function visitAwaitExpression(node, state, path) {
    var visitor = this;
    // argument is of types Expression
    if (node["argument"]) {
      node["argument"] = visitor.accept(node["argument"], state, path.concat(["argument"]));
    }
    return node;
  };
  Visitor.prototype.visitRegExpLiteral = function visitRegExpLiteral(node, state, path) {
    var visitor = this;
    return node;
  };
  Visitor.prototype.visitFunctionDeclaration = function visitFunctionDeclaration(node, state, path) {
    var visitor = this;
    // id is of types Identifier
    node["id"] = visitor.accept(node["id"], state, path.concat(["id"]));
    // params is a list with types Pattern
    var newElements = [];
    for (var i = 0; i < node["params"].length; i++) {
      var ea = node["params"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["params", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["params"] = newElements;
    // body is of types BlockStatement
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    return node;
  };
  Visitor.prototype.visitVariableDeclaration = function visitVariableDeclaration(node, state, path) {
    var visitor = this;
    // declarations is a list with types VariableDeclarator
    var newElements = [];
    for (var i = 0; i < node["declarations"].length; i++) {
      var ea = node["declarations"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["declarations", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["declarations"] = newElements;
    return node;
  };
  Visitor.prototype.visitNewExpression = function visitNewExpression(node, state, path) {
    var visitor = this;
    // callee is of types Expression, Super
    node["callee"] = visitor.accept(node["callee"], state, path.concat(["callee"]));
    // arguments is a list with types Expression, SpreadElement
    var newElements = [];
    for (var i = 0; i < node["arguments"].length; i++) {
      var ea = node["arguments"][i];
      var acceptedNodes = ea ? visitor.accept(ea, state, path.concat(["arguments", i])) : ea;
      if (Array.isArray(acceptedNodes)) newElements.push.apply(newElements, acceptedNodes);else newElements.push(acceptedNodes);
    }
    node["arguments"] = newElements;
    return node;
  };
  Visitor.prototype.visitForOfStatement = function visitForOfStatement(node, state, path) {
    var visitor = this;
    // left is of types VariableDeclaration, Pattern
    node["left"] = visitor.accept(node["left"], state, path.concat(["left"]));
    // right is of types Expression
    node["right"] = visitor.accept(node["right"], state, path.concat(["right"]));
    // body is of types Statement
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    return node;
  };
  Visitor.prototype.visitClassDeclaration = function visitClassDeclaration(node, state, path) {
    var visitor = this;
    // id is of types Identifier
    node["id"] = visitor.accept(node["id"], state, path.concat(["id"]));
    // superClass is of types Expression
    if (node["superClass"]) {
      node["superClass"] = visitor.accept(node["superClass"], state, path.concat(["superClass"]));
    }
    // body is of types ClassBody
    node["body"] = visitor.accept(node["body"], state, path.concat(["body"]));
    return node;
  };

  var PrinterVisitor = function (_Visitor) {
    babelHelpers.inherits(PrinterVisitor, _Visitor);

    function PrinterVisitor() {
      babelHelpers.classCallCheck(this, PrinterVisitor);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(PrinterVisitor).apply(this, arguments));
    }

    babelHelpers.createClass(PrinterVisitor, [{
      key: "accept",
      value: function accept(node, state, path) {
        var pathString = path.map(function (ea) {
          return typeof ea === 'string' ? "." + ea : "[" + ea + "]";
        }).join(''),
            myChildren = [],
            result = babelHelpers.get(Object.getPrototypeOf(PrinterVisitor.prototype), "accept", this).call(this, node, { index: state.index, tree: myChildren }, path);
        state.tree.push({
          node: node,
          path: pathString,
          index: state.index++,
          children: myChildren
        });
        return result;
      }
    }]);
    return PrinterVisitor;
  }(Visitor);

  var ComparisonVisitor = function (_Visitor2) {
    babelHelpers.inherits(ComparisonVisitor, _Visitor2);

    function ComparisonVisitor() {
      babelHelpers.classCallCheck(this, ComparisonVisitor);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ComparisonVisitor).apply(this, arguments));
    }

    babelHelpers.createClass(ComparisonVisitor, [{
      key: "recordNotEqual",
      value: function recordNotEqual(node1, node2, state, msg) {
        state.comparisons.errors.push({
          node1: node1, node2: node2,
          path: state.completePath, msg: msg
        });
      }
    }, {
      key: "compareType",
      value: function compareType(node1, node2, state) {
        return this.compareField('type', node1, node2, state);
      }
    }, {
      key: "compareField",
      value: function compareField(field, node1, node2, state) {
        node2 = lively.PropertyPath(state.completePath.join('.')).get(node2);
        if (node1 && node2 && node1[field] === node2[field]) return true;
        if (node1 && node1[field] === '*' || node2 && node2[field] === '*') return true;
        var fullPath = state.completePath.join('.') + '.' + field,
            msg;
        if (!node1) msg = "node1 on " + fullPath + " not defined";else if (!node2) msg = 'node2 not defined but node1 (' + fullPath + ') is: ' + node1[field];else msg = fullPath + ' is not equal: ' + node1[field] + ' vs. ' + node2[field];
        this.recordNotEqual(node1, node2, state, msg);
        return false;
      }
    }, {
      key: "accept",
      value: function accept(node1, node2, state, path) {
        var patternNode = lively.PropertyPath(path.join('.')).get(node2);
        if (node1 === '*' || patternNode === '*') return;
        var nextState = {
          completePath: path,
          comparisons: state.comparisons
        };
        if (this.compareType(node1, node2, nextState)) this['visit' + node1.type](node1, node2, nextState, path);
      }
    }, {
      key: "visitFunction",
      value: function visitFunction(node1, node2, state, path) {
        // node1.generator has a specific type that is boolean
        if (node1.generator) {
          this.compareField("generator", node1, node2, state);
        }

        // node1.expression has a specific type that is boolean
        if (node1.expression) {
          this.compareField("expression", node1, node2, state);
        }

        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitFunction", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitSwitchStatement",
      value: function visitSwitchStatement(node1, node2, state, path) {
        // node1.lexical has a specific type that is boolean
        if (node1.lexical) {
          this.compareField("lexical", node1, node2, state);
        }

        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitSwitchStatement", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitForInStatement",
      value: function visitForInStatement(node1, node2, state, path) {
        // node1.each has a specific type that is boolean
        if (node1.each) {
          this.compareField("each", node1, node2, state);
        }

        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitForInStatement", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitFunctionDeclaration",
      value: function visitFunctionDeclaration(node1, node2, state, path) {
        // node1.generator has a specific type that is boolean
        if (node1.generator) {
          this.compareField("generator", node1, node2, state);
        }

        // node1.expression has a specific type that is boolean
        if (node1.expression) {
          this.compareField("expression", node1, node2, state);
        }

        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitFunctionDeclaration", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitVariableDeclaration",
      value: function visitVariableDeclaration(node1, node2, state, path) {
        // node1.kind is "var" or "let" or "const"
        this.compareField("kind", node1, node2, state);
        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitVariableDeclaration", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitUnaryExpression",
      value: function visitUnaryExpression(node1, node2, state, path) {
        // node1.operator is an UnaryOperator enum:
        // "-" | "+" | "!" | "~" | "typeof" | "void" | "delete"
        this.compareField("operator", node1, node2, state);

        // node1.prefix has a specific type that is boolean
        if (node1.prefix) {
          this.compareField("prefix", node1, node2, state);
        }

        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitUnaryExpression", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitBinaryExpression",
      value: function visitBinaryExpression(node1, node2, state, path) {
        // node1.operator is an BinaryOperator enum:
        // "==" | "!=" | "===" | "!==" | | "<" | "<=" | ">" | ">=" | | "<<" | ">>" | ">>>" | | "+" | "-" | "*" | "/" | "%" | | "|" | "^" | "&" | "in" | | "instanceof" | ".."
        this.compareField("operator", node1, node2, state);
        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitBinaryExpression", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitAssignmentExpression",
      value: function visitAssignmentExpression(node1, node2, state, path) {
        // node1.operator is an AssignmentOperator enum:
        // "=" | "+=" | "-=" | "*=" | "/=" | "%=" | | "<<=" | ">>=" | ">>>=" | | "|=" | "^=" | "&="
        this.compareField("operator", node1, node2, state);
        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitAssignmentExpression", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitUpdateExpression",
      value: function visitUpdateExpression(node1, node2, state, path) {
        // node1.operator is an UpdateOperator enum:
        // "++" | "--"
        this.compareField("operator", node1, node2, state);
        // node1.prefix has a specific type that is boolean
        if (node1.prefix) {
          this.compareField("prefix", node1, node2, state);
        }
        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitUpdateExpression", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitLogicalExpression",
      value: function visitLogicalExpression(node1, node2, state, path) {
        // node1.operator is an LogicalOperator enum:
        // "||" | "&&"
        this.compareField("operator", node1, node2, state);
        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitLogicalExpression", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitMemberExpression",
      value: function visitMemberExpression(node1, node2, state, path) {
        // node1.computed has a specific type that is boolean
        if (node1.computed) {
          this.compareField("computed", node1, node2, state);
        }
        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitMemberExpression", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitComprehensionBlock",
      value: function visitComprehensionBlock(node1, node2, state, path) {
        // node1.each has a specific type that is boolean
        if (node1.each) {
          this.compareField("each", node1, node2, state);
        }
        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitComprehensionBlock", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitIdentifier",
      value: function visitIdentifier(node1, node2, state, path) {
        // node1.name has a specific type that is string
        this.compareField("name", node1, node2, state);
        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitIdentifier", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitLiteral",
      value: function visitLiteral(node1, node2, state, path) {
        this.compareField("value", node1, node2, state);
        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitLiteral", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitClassDeclaration",
      value: function visitClassDeclaration(node1, node2, state, path) {
        this.compareField("id", node1, node2, state);
        if (node1.superClass) {
          this.compareField("superClass", node1, node2, state);
        }
        this.compareField("body", node1, node2, state);
        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitClassDeclaration", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitClassBody",
      value: function visitClassBody(node1, node2, state, path) {
        this.compareField("body", node1, node2, state);
        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitClassBody", this).call(this, node1, node2, state, path);
      }
    }, {
      key: "visitMethodDefinition",
      value: function visitMethodDefinition(node1, node2, state, path) {
        this.compareField("static", node1, node2, state);
        this.compareField("computed", node1, node2, state);
        this.compareField("kind", node1, node2, state);
        this.compareField("key", node1, node2, state);
        this.compareField("value", node1, node2, state);
        return babelHelpers.get(Object.getPrototypeOf(ComparisonVisitor.prototype), "visitMethodDefinition", this).call(this, node1, node2, state, path);
      }
    }]);
    return ComparisonVisitor;
  }(Visitor);

  var ScopeVisitor = function (_Visitor3) {
    babelHelpers.inherits(ScopeVisitor, _Visitor3);

    function ScopeVisitor() {
      babelHelpers.classCallCheck(this, ScopeVisitor);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ScopeVisitor).apply(this, arguments));
    }

    babelHelpers.createClass(ScopeVisitor, [{
      key: "newScope",
      value: function newScope(scopeNode, parentScope) {
        var scope = {
          node: scopeNode,
          varDecls: [],
          varDeclPaths: [],
          funcDecls: [],
          funcDeclPaths: [],
          classDecls: [],
          classDeclPaths: [],
          classExprs: [],
          classExprPaths: [],
          methodDecls: [],
          methodDeclPaths: [],
          importDecls: [],
          importDeclPaths: [],
          exportDecls: [],
          exportDeclPaths: [],
          refs: [],
          thisRefs: [],
          params: [],
          catches: [],
          subScopes: []
        };
        if (parentScope) parentScope.subScopes.push(scope);
        return scope;
      }
    }, {
      key: "visitVariableDeclaration",
      value: function visitVariableDeclaration(node, scope, path) {
        scope.varDecls.push(node);
        scope.varDeclPaths.push(path);
        return babelHelpers.get(Object.getPrototypeOf(ScopeVisitor.prototype), "visitVariableDeclaration", this).call(this, node, scope, path);
      }
    }, {
      key: "visitVariableDeclarator",
      value: function visitVariableDeclarator(node, scope, path) {
        var visitor = this;
        // ignore id
        // // id is of types Pattern
        // node["id"] = visitor.accept(node["id"], scope, path.concat(["id"]));
        // init is of types Expression
        if (node["init"]) {
          node["init"] = visitor.accept(node["init"], scope, path.concat(["init"]));
        }
        return node;
      }
    }, {
      key: "visitFunction",
      value: function visitFunction(node, scope, path) {
        var newScope = this.newScope(node, scope);
        newScope.params = Array.prototype.slice.call(node.params);
        return newScope;
      }
    }, {
      key: "visitFunctionDeclaration",
      value: function visitFunctionDeclaration(node, scope, path) {
        var newScope = this.visitFunction(node, scope, path);
        scope.funcDecls.push(node);
        scope.funcDeclPaths.push(path);

        // don't visit id and params 
        var visitor = this;

        if (node.defaults) {
          node["defaults"] = node["defaults"].reduce(function (results, ea, i) {
            var result = visitor.accept(ea, newScope, path.concat(["defaults", i]));
            if (Array.isArray(result)) results.push.apply(results, result);else results.push(result);
            return results;
          }, []);
        }

        if (node.rest) {
          node["rest"] = visitor.accept(node["rest"], newScope, path.concat(["rest"]));
        }

        node["body"] = visitor.accept(node["body"], newScope, path.concat(["body"]));

        // loc is of types SourceLocation
        if (node["loc"]) {
          node["loc"] = visitor.accept(node["loc"], newScope, path.concat(["loc"]));
        }
        return node;
      }
    }, {
      key: "visitFunctionExpression",
      value: function visitFunctionExpression(node, scope, path) {
        var newScope = this.visitFunction(node, scope, path);

        // don't visit id and params 
        var visitor = this;

        if (node.defaults) {
          node["defaults"] = node["defaults"].reduce(function (results, ea, i) {
            var result = visitor.accept(ea, newScope, path.concat(["defaults", i]));
            if (Array.isArray(result)) results.push.apply(results, result);else results.push(result);
            return results;
          }, []);
        }

        if (node.rest) {
          node["rest"] = visitor.accept(node["rest"], newScope, path.concat(["rest"]));
        }

        node["body"] = visitor.accept(node["body"], newScope, path.concat(["body"]));

        // loc is of types SourceLocation
        if (node["loc"]) {
          node["loc"] = visitor.accept(node["loc"], newScope, path.concat(["loc"]));
        }
        return node;
      }
    }, {
      key: "visitArrowFunctionExpression",
      value: function visitArrowFunctionExpression(node, scope, path) {
        var newScope = this.visitFunction(node, scope, path);
        var visitor = this;

        if (node.defaults) {
          node["defaults"] = node["defaults"].reduce(function (results, ea, i) {
            var result = visitor.accept(ea, newScope, path.concat(["defaults", i]));
            if (Array.isArray(result)) results.push.apply(results, result);else results.push(result);
            return results;
          }, []);
        }

        if (node.rest) {
          node["rest"] = visitor.accept(node["rest"], newScope, path.concat(["rest"]));
        }

        // body is of types BlockStatement, Expression
        node["body"] = visitor.accept(node["body"], newScope, path.concat(["body"]));

        // loc is of types SourceLocation
        if (node["loc"]) {
          node["loc"] = visitor.accept(node["loc"], newScope, path.concat(["loc"]));
        }
        // node.generator has a specific type that is boolean
        if (node.generator) {} /*do stuff*/

        // node.expression has a specific type that is boolean
        if (node.expression) {/*do stuff*/}
        return node;
      }
    }, {
      key: "visitIdentifier",
      value: function visitIdentifier(node, scope, path) {
        scope.refs.push(node);
        return babelHelpers.get(Object.getPrototypeOf(ScopeVisitor.prototype), "visitIdentifier", this).call(this, node, scope, path);
      }
    }, {
      key: "visitMemberExpression",
      value: function visitMemberExpression(node, scope, path) {
        // only visit property part when prop is computed so we don't gather
        // prop ids

        var visitor = this;
        // object is of types Expression, Super
        node["object"] = visitor.accept(node["object"], scope, path.concat(["object"]));
        // property is of types Expression
        if (node.computed) {
          node["property"] = visitor.accept(node["property"], scope, path.concat(["property"]));
        }
        return node;
      }
    }, {
      key: "visitProperty",
      value: function visitProperty(node, scope, path) {
        var visitor = this;
        // key is of types Expression
        if (node.computed) node["key"] = visitor.accept(node["key"], scope, path.concat(["key"]));
        // value is of types Expression
        node["value"] = visitor.accept(node["value"], scope, path.concat(["value"]));
        return node;
      }
    }, {
      key: "visitThisExpression",
      value: function visitThisExpression(node, scope, path) {
        scope.thisRefs.push(node);
        return babelHelpers.get(Object.getPrototypeOf(ScopeVisitor.prototype), "visitThisExpression", this).call(this, node, scope, path);
      }
    }, {
      key: "visitTryStatement",
      value: function visitTryStatement(node, scope, path) {
        var visitor = this;
        // block is of types BlockStatement
        node["block"] = visitor.accept(node["block"], scope, path.concat(["block"]));
        // handler is of types CatchClause
        if (node["handler"]) {
          node["handler"] = visitor.accept(node["handler"], scope, path.concat(["handler"]));
          scope.catches.push(node.handler.param);
        }

        // finalizer is of types BlockStatement
        if (node["finalizer"]) {
          node["finalizer"] = visitor.accept(node["finalizer"], scope, path.concat(["finalizer"]));
        }
        return node;
      }
    }, {
      key: "visitLabeledStatement",
      value: function visitLabeledStatement(node, scope, path) {
        var visitor = this;
        // ignore label
        // // label is of types Identifier
        // node["label"] = visitor.accept(node["label"], scope, path.concat(["label"]));
        // body is of types Statement
        node["body"] = visitor.accept(node["body"], scope, path.concat(["body"]));
        return node;
      }
    }, {
      key: "visitClassDeclaration",
      value: function visitClassDeclaration(node, scope, path) {
        scope.classDecls.push(node);
        scope.classDeclPaths.push(path);

        var visitor = this;
        // ignore id
        // // id is of types Identifier
        // node["id"] = visitor.accept(node["id"], scope, path.concat(["id"]));
        // superClass is of types Expression
        if (node["superClass"]) {
          node["superClass"] = visitor.accept(node["superClass"], scope, path.concat(["superClass"]));
        }
        // body is of types ClassBody
        node["body"] = visitor.accept(node["body"], scope, path.concat(["body"]));
        return node;
      }
    }, {
      key: "visitClassExpression",
      value: function visitClassExpression(node, scope, path) {
        if (node.id) {
          scope.classExprs.push(node);
          scope.classExprPaths.push(path);
        }

        var visitor = this;
        // ignore id
        // // id is of types Identifier
        // node["id"] = visitor.accept(node["id"], scope, path.concat(["id"]));
        // superClass is of types Expression
        if (node["superClass"]) {
          node["superClass"] = visitor.accept(node["superClass"], scope, path.concat(["superClass"]));
        }
        // body is of types ClassBody
        node["body"] = visitor.accept(node["body"], scope, path.concat(["body"]));
        return node;
      }
    }, {
      key: "visitMethodDefinition",
      value: function visitMethodDefinition(node, scope, path) {
        var visitor = this;
        // don't visit key Identifier for now
        // // key is of types Expression
        // node["key"] = visitor.accept(node["key"], scope, path.concat(["key"]));
        // value is of types FunctionExpression
        node["value"] = visitor.accept(node["value"], scope, path.concat(["value"]));
        return node;
      }
    }, {
      key: "visitBreakStatement",
      value: function visitBreakStatement(node, scope, path) {
        return node;
      }
    }, {
      key: "visitContinueStatement",
      value: function visitContinueStatement(node, scope, path) {
        return node;
      }

      // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
      // es6 modules

    }, {
      key: "visitImportSpecifier",
      value: function visitImportSpecifier(node, scope, path) {
        scope.importDecls.push(node.local);
        scope.importDeclPaths.push(path);

        var visitor = this;
        // // imported is of types Identifier
        // node["imported"] = visitor.accept(node["imported"], scope, path.concat(["imported"]));
        // local is of types Identifier
        node["local"] = visitor.accept(node["local"], scope, path.concat(["local"]));
        return node;
      }
    }, {
      key: "visitImportDefaultSpecifier",
      value: function visitImportDefaultSpecifier(node, scope, path) {
        scope.importDecls.push(node.local);
        scope.importDeclPaths.push(path);
        var visitor = this;
        // // local is of types Identifier
        // node["local"] = visitor.accept(node["local"], scope, path.concat(["local"]));
        return node;
      }
    }, {
      key: "visitImportNamespaceSpecifier",
      value: function visitImportNamespaceSpecifier(node, scope, path) {
        scope.importDecls.push(node.local);
        scope.importDeclPaths.push(path);
        var visitor = this;
        // // local is of types Identifier
        // node["local"] = visitor.accept(node["local"], scope, path.concat(["local"]));
        return node;
      }
    }, {
      key: "visitExportSpecifier",
      value: function visitExportSpecifier(node, scope, path) {
        var visitor = this;
        // // exported is of types Identifier
        // node["exported"] = visitor.accept(node["exported"], scope, path.concat(["exported"]));
        // local is of types Identifier
        node["local"] = visitor.accept(node["local"], scope, path.concat(["local"]));
        return node;
      }
    }, {
      key: "visitExportNamedDeclaration",
      value: function visitExportNamedDeclaration(node, scope, path) {
        scope.exportDecls.push(node);
        scope.exportDeclPaths.push(path);
        return babelHelpers.get(Object.getPrototypeOf(ScopeVisitor.prototype), "visitExportNamedDeclaration", this).call(this, node, scope, path);
      }
    }, {
      key: "visitExportDefaultDeclaration",
      value: function visitExportDefaultDeclaration(node, scope, path) {
        scope.exportDecls.push(node);
        scope.exportDeclPaths.push(path);
        return babelHelpers.get(Object.getPrototypeOf(ScopeVisitor.prototype), "visitExportDefaultDeclaration", this).call(this, node, scope, path);
      }
    }, {
      key: "visitExportAllDeclaration",
      value: function visitExportAllDeclaration(node, scope, path) {
        scope.exportDecls.push(node);
        scope.exportDeclPaths.push(path);
        return babelHelpers.get(Object.getPrototypeOf(ScopeVisitor.prototype), "visitExportAllDeclaration", this).call(this, node, scope, path);
      }
    }]);
    return ScopeVisitor;
  }(Visitor);

  var es = escodegen.escodegen || escodegen;

  function stringify(node, opts) {
    return es.generate(fixParamDefaults(node), opts);
  }

  var FixParamsForEscodegenVisitor = function (_Visitor) {
    babelHelpers.inherits(FixParamsForEscodegenVisitor, _Visitor);

    function FixParamsForEscodegenVisitor() {
      babelHelpers.classCallCheck(this, FixParamsForEscodegenVisitor);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(FixParamsForEscodegenVisitor).apply(this, arguments));
    }

    babelHelpers.createClass(FixParamsForEscodegenVisitor, [{
      key: "fixFunctionNode",
      value: function fixFunctionNode(node) {
        node.defaults = node.params.map(function (p, i) {
          if (p.type === "AssignmentPattern") {
            node.params[i] = p.left;
            return p.right;
          }
          return undefined;
        });
      }
    }, {
      key: "visitFunction",
      value: function visitFunction(node, state, path) {
        this.fixFunctionNode(node);
        return babelHelpers.get(Object.getPrototypeOf(FixParamsForEscodegenVisitor.prototype), "visitFunction", this).call(this, node, state, path);
      }
    }, {
      key: "visitArrowFunctionExpression",
      value: function visitArrowFunctionExpression(node, state, path) {
        this.fixFunctionNode(node);
        return babelHelpers.get(Object.getPrototypeOf(FixParamsForEscodegenVisitor.prototype), "visitArrowFunctionExpression", this).call(this, node, state, path);
      }
    }, {
      key: "visitFunctionExpression",
      value: function visitFunctionExpression(node, state, path) {
        this.fixFunctionNode(node);
        return babelHelpers.get(Object.getPrototypeOf(FixParamsForEscodegenVisitor.prototype), "visitFunctionExpression", this).call(this, node, state, path);
      }
    }, {
      key: "visitFunctionDeclaration",
      value: function visitFunctionDeclaration(node, state, path) {
        this.fixFunctionNode(node);
        return babelHelpers.get(Object.getPrototypeOf(FixParamsForEscodegenVisitor.prototype), "visitFunctionDeclaration", this).call(this, node, state, path);
      }
    }]);
    return FixParamsForEscodegenVisitor;
  }(Visitor);

  // debugger;
  // var node = lively.ast.parse("/^file:\\/\\//");
  // fixParamDefaults(node).body[0].expression.value

  function fixParamDefaults(parsed) {
    parsed = lively_lang.obj.deepCopy(parsed);
    new FixParamsForEscodegenVisitor().accept(parsed, null, []);
    return parsed;
  }

  var walk = acorn.walk;
  var loose = acorn.loose;
  // rk 2016-05-17 FIXME: the current version of acorn.walk doesn't support async
  // await. We patch the walker here until it does
  if (!walk.base.AwaitExpression) {
    walk.base.AwaitExpression = function (node, st, c) {
      if (node.argument) c(node.argument, st, 'Expression');
    };
  }

  // FIXME, don't add to walk object, that's our own stuff!
  walk.forEachNode = forEachNode;
  walk.matchNodes = matchNodes;
  walk.findNodesIncluding = findNodesIncluding;
  walk.addSource = addSource;
  walk.inspect = inspect;
  walk.withParentInfo = withParentInfo;
  walk.copy = copy;
  walk.findSiblings = findSiblings;

  walk.findNodeByAstIndex = findNodeByAstIndex;
  walk.findStatementOfNode = findStatementOfNode;
  walk.addAstIndex = addAstIndex;

  // -=-=-=-=-=-=-=-=-=-=-=-
  // from lively.ast.acorn
  // -=-=-=-=-=-=-=-=-=-=-=-
  function forEachNode(parsed, func, state, options) {
    // note: func can get called with the same node for different
    // visitor callbacks!
    // func args: node, state, depth, type
    options = options || {};
    var traversal = options.traversal || 'preorder'; // also: postorder

    var visitors = lively_lang.obj.clone(options.visitors ? options.visitors : walk.visitors.withMemberExpression);
    var iterator = traversal === 'preorder' ? function (orig, type, node, depth, cont) {
      func(node, state, depth, type);return orig(node, depth + 1, cont);
    } : function (orig, type, node, depth, cont) {
      var result = orig(node, depth + 1, cont);func(node, state, depth, type);return result;
    };
    Object.keys(visitors).forEach(function (type) {
      var orig = visitors[type];
      visitors[type] = function (node, depth, cont) {
        return iterator(orig, type, node, depth, cont);
      };
    });
    walk.recursive(parsed, 0, null, visitors);
    return parsed;
  };

  function matchNodes(parsed, visitor, state, options) {
    function visit(node, state, depth, type) {
      if (visitor[node.type]) visitor[node.type](node, state, depth, type);
    }
    return forEachNode(parsed, visit, state, options);
  };

  // findNodesIncluding: function(ast, pos, test, base) {
  //   var nodes = [];
  //   base = base || acorn.walk.make({});
  //   Object.keys(base).forEach(function(name) {
  //       var orig = base[name];
  //       base[name] = function(node, state, cont) {
  //           nodes.pushIfNotIncluded(node);
  //           return orig(node, state, cont);
  //       }
  //   });
  //   acorn.walk.findNodeAround(ast, pos, test, base);
  //   return nodes;
  // }

  function findNodesIncluding(parsed, pos, test, base) {
    var nodes = [];
    base = base || acorn.walk.make({});
    Object.keys(acorn.walk.base).forEach(function (name) {
      var orig = base[name];
      base[name] = function (node, state, cont) {
        lively_lang.arr.pushIfNotIncluded(nodes, node);
        return orig(node, state, cont);
      };
    });
    base["Property"] = function (node, st, c) {
      lively_lang.arr.pushIfNotIncluded(nodes, node);
      c(node.key, st, "Expression");
      c(node.value, st, "Expression");
    };
    base["LabeledStatement"] = function (node, st, c) {
      node.label && c(node.label, st, "Expression");
      c(node.body, st, "Statement");
    };
    walk.findNodeAround(parsed, pos, test, base);
    return nodes;
  };

  function addSource(parsed, source, completeSrc, forceNewSource) {
    var options = {};
    options.ecmaVersion = options.ecmaVersion || 7;
    options.sourceType = options.sourceType || "module";
    options.plugins = options.plugins || {};
    options.plugins.asyncawait = options.plugins.hasOwnProperty("asyncawait") ? options.plugins.asyncawait : { inAsyncFunction: true };

    source = typeof parsed === 'string' ? parsed : source;
    parsed = typeof parsed === 'string' ? acorn.parse(parsed, options) : parsed;
    completeSrc = !!completeSrc;
    return forEachNode(parsed, function (node) {
      if (node.source && !forceNewSource) return;
      node.source = completeSrc ? source : source.slice(node.start, node.end);
    });
  };

  function inspect(parsed, source) {
    var options = {};
    options.ecmaVersion = options.ecmaVersion || 7;
    options.sourceType = options.sourceType || "module";
    options.plugins = options.plugins || {};
    options.plugins.asyncawait = options.plugins.hasOwnProperty("asyncawait") ? options.plugins.asyncawait : { inAsyncFunction: true };

    source = typeof parsed === 'string' ? parsed : null;
    parsed = typeof parsed === 'string' ? acorn.parse(parsed, options) : parsed;
    source && addSource(parsed, source);
    return lively_lang.obj.inspect(parsed);
  };

  function withParentInfo(parsed, iterator, options) {
    // options = {visitAllNodes: BOOL}
    options = options || {};
    function makeScope(parentScope) {
      var scope = { id: lively_lang.string.newUUID(), parentScope: parentScope, containingScopes: [] };
      parentScope && parentScope.containingScopes.push(scope);
      return scope;
    }
    var visitors = walk.make({
      Function: function Function(node, st, c) {
        if (st && st.scope) st.scope = makeScope(st.scope);
        c(node.body, st, "ScopeBody");
      },
      VariableDeclarator: function VariableDeclarator(node, st, c) {
        // node.id && c(node.id, st, 'Identifier');
        node.init && c(node.init, st, 'Expression');
      },
      VariableDeclaration: function VariableDeclaration(node, st, c) {
        for (var i = 0; i < node.declarations.length; ++i) {
          var decl = node.declarations[i];
          if (decl) c(decl, st, "VariableDeclarator");
        }
      },
      ObjectExpression: function ObjectExpression(node, st, c) {
        for (var i = 0; i < node.properties.length; ++i) {
          var prop = node.properties[i];
          c(prop.key, st, "Expression");
          c(prop.value, st, "Expression");
        }
      },
      MemberExpression: function MemberExpression(node, st, c) {
        c(node.object, st, "Expression");
        c(node.property, st, "Expression");
      }
    }, walk.base);
    var lastActiveProp,
        getters = [];
    forEachNode(parsed, function (node) {
      lively_lang.arr.withoutAll(Object.keys(node), ['end', 'start', 'type', 'source', 'raw']).forEach(function (propName) {
        if (node.__lookupGetter__(propName)) return; // already defined
        var val = node[propName];
        node.__defineGetter__(propName, function () {
          lastActiveProp = propName;return val;
        });
        getters.push([node, propName, node[propName]]);
      });
    }, null, { visitors: visitors });
    var result = [];
    Object.keys(visitors).forEach(function (type) {
      var orig = visitors[type];
      visitors[type] = function (node, state, cont) {
        if (type === node.type || options.visitAllNodes) {
          result.push(iterator.call(null, node, { scope: state.scope, depth: state.depth, parent: state.parent, type: type, propertyInParent: lastActiveProp }));
          return orig(node, { scope: state.scope, parent: node, depth: state.depth + 1 }, cont);
        } else {
          return orig(node, state, cont);
        }
      };
    });
    walk.recursive(parsed, { scope: makeScope(), parent: null, propertyInParent: '', depth: 0 }, null, visitors);
    getters.forEach(function (nodeNameVal) {
      delete nodeNameVal[0][nodeNameVal[1]];
      nodeNameVal[0][nodeNameVal[1]] = nodeNameVal[2];
    });
    return result;
  };

  function copy(ast, override) {
    var visitors = lively_lang.obj.extend({
      Program: function Program(n, c) {
        return {
          start: n.start, end: n.end, type: 'Program',
          body: n.body.map(c),
          source: n.source, astIndex: n.astIndex
        };
      },
      FunctionDeclaration: function FunctionDeclaration(n, c) {
        return {
          start: n.start, end: n.end, type: 'FunctionDeclaration',
          id: c(n.id), params: n.params.map(c), body: c(n.body),
          source: n.source, astIndex: n.astIndex
        };
      },
      BlockStatement: function BlockStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'BlockStatement',
          body: n.body.map(c),
          source: n.source, astIndex: n.astIndex
        };
      },
      ExpressionStatement: function ExpressionStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'ExpressionStatement',
          expression: c(n.expression),
          source: n.source, astIndex: n.astIndex
        };
      },
      CallExpression: function CallExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'CallExpression',
          callee: c(n.callee), arguments: n.arguments.map(c),
          source: n.source, astIndex: n.astIndex
        };
      },
      MemberExpression: function MemberExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'MemberExpression',
          object: c(n.object), property: c(n.property), computed: n.computed,
          source: n.source, astIndex: n.astIndex
        };
      },
      NewExpression: function NewExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'NewExpression',
          callee: c(n.callee), arguments: n.arguments.map(c),
          source: n.source, astIndex: n.astIndex
        };
      },
      VariableDeclaration: function VariableDeclaration(n, c) {
        return {
          start: n.start, end: n.end, type: 'VariableDeclaration',
          declarations: n.declarations.map(c), kind: n.kind,
          source: n.source, astIndex: n.astIndex
        };
      },
      VariableDeclarator: function VariableDeclarator(n, c) {
        return {
          start: n.start, end: n.end, type: 'VariableDeclarator',
          id: c(n.id), init: c(n.init),
          source: n.source, astIndex: n.astIndex
        };
      },
      FunctionExpression: function FunctionExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'FunctionExpression',
          id: c(n.id), params: n.params.map(c), body: c(n.body),
          source: n.source, astIndex: n.astIndex
        };
      },
      IfStatement: function IfStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'IfStatement',
          test: c(n.test), consequent: c(n.consequent),
          alternate: c(n.alternate),
          source: n.source, astIndex: n.astIndex
        };
      },
      ConditionalExpression: function ConditionalExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'ConditionalExpression',
          test: c(n.test), consequent: c(n.consequent),
          alternate: c(n.alternate),
          source: n.source, astIndex: n.astIndex
        };
      },
      SwitchStatement: function SwitchStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'SwitchStatement',
          discriminant: c(n.discriminant), cases: n.cases.map(c),
          source: n.source, astIndex: n.astIndex
        };
      },
      SwitchCase: function SwitchCase(n, c) {
        return {
          start: n.start, end: n.end, type: 'SwitchCase',
          test: c(n.test), consequent: n.consequent.map(c),
          source: n.source, astIndex: n.astIndex
        };
      },
      BreakStatement: function BreakStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'BreakStatement',
          label: n.label,
          source: n.source, astIndex: n.astIndex
        };
      },
      ContinueStatement: function ContinueStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'ContinueStatement',
          label: n.label,
          source: n.source, astIndex: n.astIndex
        };
      },
      TryStatement: function TryStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'TryStatement',
          block: c(n.block), handler: c(n.handler), finalizer: c(n.finalizer),
          guardedHandlers: n.guardedHandlers.map(c),
          source: n.source, astIndex: n.astIndex
        };
      },
      CatchClause: function CatchClause(n, c) {
        return {
          start: n.start, end: n.end, type: 'CatchClause',
          param: c(n.param), guard: c(n.guard), body: c(n.body),
          source: n.source, astIndex: n.astIndex
        };
      },
      ThrowStatement: function ThrowStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'ThrowStatement',
          argument: c(n.argument),
          source: n.source, astIndex: n.astIndex
        };
      },
      ForStatement: function ForStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'ForStatement',
          init: c(n.init), test: c(n.test), update: c(n.update),
          body: c(n.body),
          source: n.source, astIndex: n.astIndex
        };
      },
      ForInStatement: function ForInStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'ForInStatement',
          left: c(n.left), right: c(n.right), body: c(n.body),
          source: n.source, astIndex: n.astIndex
        };
      },
      WhileStatement: function WhileStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'WhileStatement',
          test: c(n.test), body: c(n.body),
          source: n.source, astIndex: n.astIndex
        };
      },
      DoWhileStatement: function DoWhileStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'DoWhileStatement',
          test: c(n.test), body: c(n.body),
          source: n.source, astIndex: n.astIndex
        };
      },
      WithStatement: function WithStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'WithStatement',
          object: c(n.object), body: c(n.body),
          source: n.source, astIndex: n.astIndex
        };
      },
      UnaryExpression: function UnaryExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'UnaryExpression',
          argument: c(n.argument), operator: n.operator, prefix: n.prefix,
          source: n.source, astIndex: n.astIndex
        };
      },
      BinaryExpression: function BinaryExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'BinaryExpression',
          left: c(n.left), operator: n.operator, right: c(n.right),
          source: n.source, astIndex: n.astIndex
        };
      },
      LogicalExpression: function LogicalExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'LogicalExpression',
          left: c(n.left), operator: n.operator, right: c(n.right),
          source: n.source, astIndex: n.astIndex
        };
      },
      AssignmentExpression: function AssignmentExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'AssignmentExpression',
          left: c(n.left), operator: n.operator, right: c(n.right),
          source: n.source, astIndex: n.astIndex
        };
      },
      UpdateExpression: function UpdateExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'UpdateExpression',
          argument: c(n.argument), operator: n.operator, prefix: n.prefix,
          source: n.source, astIndex: n.astIndex
        };
      },
      ReturnStatement: function ReturnStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'ReturnStatement',
          argument: c(n.argument),
          source: n.source, astIndex: n.astIndex
        };
      },
      Identifier: function Identifier(n, c) {
        return {
          start: n.start, end: n.end, type: 'Identifier',
          name: n.name,
          source: n.source, astIndex: n.astIndex
        };
      },
      Literal: function Literal(n, c) {
        return {
          start: n.start, end: n.end, type: 'Literal',
          value: n.value, raw: n.raw /* Acorn-specific */
          , source: n.source, astIndex: n.astIndex
        };
      },
      ObjectExpression: function ObjectExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'ObjectExpression',
          properties: n.properties.map(function (prop) {
            return {
              key: c(prop.key), value: c(prop.value), kind: prop.kind
            };
          }),
          source: n.source, astIndex: n.astIndex
        };
      },
      ArrayExpression: function ArrayExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'ArrayExpression',
          elements: n.elements.map(c),
          source: n.source, astIndex: n.astIndex
        };
      },
      SequenceExpression: function SequenceExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'SequenceExpression',
          expressions: n.expressions.map(c),
          source: n.source, astIndex: n.astIndex
        };
      },
      EmptyStatement: function EmptyStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'EmptyStatement',
          source: n.source, astIndex: n.astIndex
        };
      },
      ThisExpression: function ThisExpression(n, c) {
        return {
          start: n.start, end: n.end, type: 'ThisExpression',
          source: n.source, astIndex: n.astIndex
        };
      },
      DebuggerStatement: function DebuggerStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'DebuggerStatement',
          source: n.source, astIndex: n.astIndex
        };
      },
      LabeledStatement: function LabeledStatement(n, c) {
        return {
          start: n.start, end: n.end, type: 'LabeledStatement',
          label: n.label, body: c(n.body),
          source: n.source, astIndex: n.astIndex
        };
      }
    }, override || {});

    function c(node) {
      if (node === null) return null;
      return visitors[node.type](node, c);
    }
    return c(ast);
  }

  function findSiblings(parsed, node, beforeOrAfter) {
    if (!node) return [];
    var nodes = findNodesIncluding(parsed, node.start),
        idx = nodes.indexOf(node),
        parents = nodes.slice(0, idx),
        parentWithBody = lively_lang.arr.detect(parents.reverse(), function (p) {
      return Array.isArray(p.body);
    }),
        siblingsWithNode = parentWithBody.body;
    if (!beforeOrAfter) return lively_lang.arr.without(siblingsWithNode, node);
    var nodeIdxInSiblings = siblingsWithNode.indexOf(node);
    return beforeOrAfter === 'before' ? siblingsWithNode.slice(0, nodeIdxInSiblings) : siblingsWithNode.slice(nodeIdxInSiblings + 1);
  }

  // // cached visitors that are used often
  walk.visitors = {
    stopAtFunctions: walk.make({
      'Function': function Function() {/* stop descent */}
    }, walk.base),

    withMemberExpression: walk.make({
      MemberExpression: function MemberExpression(node, st, c) {
        c(node.object, st, "Expression");
        c(node.property, st, "Expression");
      }
    }, walk.base)
  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-
  // from lively.ast.AstHelper
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-
  function findNodeByAstIndex(parsed, astIndexToFind, addIndex) {
    addIndex = addIndex == null ? true : !!addIndex;
    if (!parsed.astIndex && addIndex) addAstIndex(parsed);
    // we need to visit every node, forEachNode is highly
    // inefficient, the compilled Mozilla visitors are a better fit
    var found = null;
    withMozillaAstDo(parsed, null, function (next, node, state) {
      if (found) return;
      var idx = node.astIndex;
      if (idx < astIndexToFind) return;
      if (node.astIndex === astIndexToFind) {
        found = node;return;
      }
      next();
    });
    return found;
  };

  // FIXME: global (and temporary) findNodeByAstIndex is used by __getClosure and defined in Rewriting.js
  // Global.findNodeByAstIndex = findNodeByAstIndex;

  function findStatementOfNode(options, parsed, target) {
    // DEPRECATED in favor of query.statementOf(parsed, node)
    // Can also be called with just ast and target. options can be {asPath: BOOLEAN}.
    // Find the statement that a target node is in. Example:
    // let source be "var x = 1; x + 1;" and we are looking for the
    // Identifier "x" in "x+1;". The second statement is what will be found.
    if (!target) {
      target = parsed;parsed = options;options = null;
    }
    if (!options) options = {};
    if (!parsed.astIndex) addAstIndex(parsed);
    var found,
        targetReached = false;
    var statements = [
    // ES5
    'EmptyStatement', 'BlockStatement', 'ExpressionStatement', 'IfStatement', 'LabeledStatement', 'BreakStatement', 'ContinueStatement', 'WithStatement', 'SwitchStatement', 'ReturnStatement', 'ThrowStatement', 'TryStatement', 'WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForInStatement', 'DebuggerStatement', 'FunctionDeclaration', 'VariableDeclaration',
    // ES2015:
    'ClassDeclaration'];
    withMozillaAstDo(parsed, {}, function (next, node, state, path) {
      if (targetReached || node.astIndex < target.astIndex) return;
      if (node === target || node.astIndex === target.astIndex) {
        targetReached = true;
        if (options.asPath) found = path;else {
          var p = lively_lang.Path(path);
          do {
            found = p.get(parsed);
            p = p.slice(0, p.size() - 1);
          } while (statements.indexOf(found.type) == -1 && p.size() > 0);
        }
      }
      !targetReached && next();
    });
    return found;
  };

  function addAstIndex(parsed) {
    // we need to visit every node, forEachNode is highly
    // inefficient, the compilled Mozilla visitors are a better fit
    withMozillaAstDo(parsed, { index: 0 }, function (next, node, state) {
      next();node.astIndex = state.index++;
    });
    return parsed;
  };

  var FindToplevelFuncDeclVisitor = function (_Visitor) {
    babelHelpers.inherits(FindToplevelFuncDeclVisitor, _Visitor);

    function FindToplevelFuncDeclVisitor() {
      babelHelpers.classCallCheck(this, FindToplevelFuncDeclVisitor);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(FindToplevelFuncDeclVisitor).apply(this, arguments));
    }

    babelHelpers.createClass(FindToplevelFuncDeclVisitor, [{
      key: "accept",
      value: function accept(node, funcDecls, path) {
        switch (node.type) {
          case "ArrowFunctionExpression":
            return node;
          case "FunctionExpression":
            return node;
          case "FunctionDeclaration":
            funcDecls.unshift({ node: node, path: path });return node;
          default:
            return babelHelpers.get(Object.getPrototypeOf(FindToplevelFuncDeclVisitor.prototype), "accept", this).call(this, node, funcDecls, path);
        }
      }
    }], [{
      key: "run",
      value: function run(parsed) {
        var state = [];
        new this().accept(parsed, state, []);
        return state;
      }
    }]);
    return FindToplevelFuncDeclVisitor;
  }(Visitor);

  var AllNodesVisitor = function (_Visitor2) {
    babelHelpers.inherits(AllNodesVisitor, _Visitor2);

    function AllNodesVisitor() {
      babelHelpers.classCallCheck(this, AllNodesVisitor);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(AllNodesVisitor).apply(this, arguments));
    }

    babelHelpers.createClass(AllNodesVisitor, [{
      key: "accept",
      value: function accept(node, state, path) {
        this.doFunc(node, state, path);
        return babelHelpers.get(Object.getPrototypeOf(AllNodesVisitor.prototype), "accept", this).call(this, node, state, path);
      }
    }], [{
      key: "run",
      value: function run(parsed, doFunc, state) {
        var v = new this();
        v.doFunc = doFunc;
        v.accept(parsed, state, []);
        return state;
      }
    }]);
    return AllNodesVisitor;
  }(Visitor);

  function nodesAt(pos, ast) {
    ast = typeof ast === 'string' ? this.parse(ast) : ast;
    return findNodesIncluding(ast, pos);
  }

  function parseFunction(source, options) {
    var src = '(' + source + ')',
        ast = parse(src, options);
    /*if (options.addSource) */addSource(ast, src);
    return ast.body[0].expression;
  }

  function fuzzyParse(source, options) {
    // options: verbose, addSource, type
    options = options || {};
    options.ecmaVersion = options.ecmaVersion || 7;
    options.sourceType = options.sourceType || "module";
    options.plugins = options.plugins || {};
    // if (options.plugins.hasOwnProperty("jsx")) options.plugins.jsx = options.plugins.jsx;
    options.plugins.asyncawait = options.plugins.hasOwnProperty("asyncawait") ? options.plugins.asyncawait : { inAsyncFunction: true };

    var ast, safeSource, err;
    if (options.type === 'LabeledStatement') {
      safeSource = '$={' + source + '}';
    }
    try {
      // we only parse to find errors
      ast = parse(safeSource || source, options);
      if (safeSource) ast = null; // we parsed only for finding errors
      else if (options.addSource) addSource(ast, source);
    } catch (e) {
      err = e;
    }
    if (err && err.raisedAt !== undefined) {
      if (safeSource) {
        // fix error pos
        err.pos -= 3;err.raisedAt -= 3;err.loc.column -= 3;
      }
      var parseErrorSource = '';
      parseErrorSource += source.slice(err.raisedAt - 20, err.raisedAt);
      parseErrorSource += '<-error->';
      parseErrorSource += source.slice(err.raisedAt, err.raisedAt + 20);
      options.verbose && show('parse error: ' + parseErrorSource);
      err.parseErrorSource = parseErrorSource;
    } else if (err && options.verbose) {
      show('' + err + err.stack);
    }
    if (!ast) {
      ast = loose.parse_dammit(source, options);
      if (options.addSource) addSource(ast, source);
      ast.isFuzzy = true;
      ast.parseError = err;
    }
    return ast;
  }

  function parse(source, options) {
    // proxy function to acorn.parse.
    // Note that we will implement useful functionality on top of the pure
    // acorn interface and make it available here (such as more convenient
    // comment parsing). For using the pure acorn interface use the acorn
    // global.
    // See https://github.com/marijnh/acorn for full acorn doc and parse options.
    // options: {
    //   addSource: BOOL, -- add source property to each node
    //   addAstIndex: BOOL, -- each node gets an index  number
    //   withComments: BOOL, -- adds comment objects to Program/BlockStatements:
    //              {isBlock: BOOL, text: STRING, node: NODE,
    //               start: INTEGER, end: INTEGER, line: INTEGER, column: INTEGER}
    //   ecmaVersion: 3|5|6,
    //   allowReturnOutsideFunction: BOOL, -- Default is false
    //   locations: BOOL -- Default is false
    // }

    options = options || {};
    options.ecmaVersion = options.ecmaVersion || 7;
    options.sourceType = options.sourceType || "module";
    if (!options.hasOwnProperty("allowImportExportEverywhere")) options.allowImportExportEverywhere = true;
    options.plugins = options.plugins || {};
    options.plugins.asyncawait = options.plugins.hasOwnProperty("asyncawait") ? options.plugins.asyncawait : { inAsyncFunction: true };

    if (options.withComments) {
      // record comments
      delete options.withComments;
      var comments = [];
      options.onComment = function (isBlock, text, start, end, line, column) {
        comments.push({
          isBlock: isBlock,
          text: text, node: null,
          start: start, end: end,
          line: line, column: column
        });
      };
    }

    var parsed = acorn.parse(source, options);

    if (options.addSource) AllNodesVisitor.run(parsed, function (node, state, path) {
      return !node.source && (node.source = source.slice(node.start, node.end));
    });

    if (options.addAstIndex && !parsed.hasOwnProperty('astIndex')) addAstIndex(parsed);

    if (parsed && comments) attachCommentsToAST({ ast: parsed, comments: comments, nodesWithComments: [] });

    return parsed;

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    function attachCommentsToAST(commentData) {
      // for each comment: assign the comment to a block-level AST node
      commentData = mergeComments(assignCommentsToBlockNodes(commentData));
      parsed.allComments = commentData.comments;
    }

    function assignCommentsToBlockNodes(commentData) {
      comments.forEach(function (comment) {
        var node = lively_lang.arr.detect(nodesAt(comment.start, parsed).reverse(), function (node) {
          return node.type === 'BlockStatement' || node.type === 'Program';
        });
        if (!node) node = parsed;
        if (!node.comments) node.comments = [];
        node.comments.push(comment);
        commentData.nodesWithComments.push(node);
      });
      return commentData;
    }

    function mergeComments(commentData) {
      // coalesce non-block comments (multiple following lines of "// ...") into one comment.
      // This only happens if line comments aren't seperated by newlines
      commentData.nodesWithComments.forEach(function (blockNode) {
        lively_lang.arr.clone(blockNode.comments).reduce(function (coalesceData, comment) {
          if (comment.isBlock) {
            coalesceData.lastComment = null;
            return coalesceData;
          }

          if (!coalesceData.lastComment) {
            coalesceData.lastComment = comment;
            return coalesceData;
          }

          // if the comments are seperated by a statement, don't merge
          var last = coalesceData.lastComment;
          var nodeInbetween = lively_lang.arr.detect(blockNode.body, function (node) {
            return node.start >= last.end && node.end <= comment.start;
          });
          if (nodeInbetween) {
            coalesceData.lastComment = comment;
            return coalesceData;
          }

          // if the comments are seperated by a newline, don't merge
          var codeInBetween = source.slice(last.end, comment.start);
          if (/[\n\r][\n\r]+/.test(codeInBetween)) {
            coalesceData.lastComment = comment;
            return coalesceData;
          }

          // merge comments into one
          last.text += "\n" + comment.text;
          last.end = comment.end;
          lively_lang.arr.remove(blockNode.comments, comment);
          lively_lang.arr.remove(commentData.comments, comment);
          return coalesceData;
        }, { lastComment: null });
      });
      return commentData;
    }
  }

  var methods = {

    withMozillaAstDo: function withMozillaAstDo(parsed, state, func) {
      // simple interface to mozilla AST visitor. function gets passed three
      // arguments:
      // acceptNext, -- continue visiting
      // node, -- current node being visited
      // state -- state variable that is passed along
      var vis = new Visitor(),
          origAccept = vis.accept;
      vis.accept = function (node, st, path) {
        var next = function next() {
          origAccept.call(vis, node, st, path);
        };
        state = func(next, node, st, path);
        return node;
      };
      vis.accept(parsed, state, []);
      return state;
    },

    printAst: function printAst(astOrSource, options) {
      options = options || {};
      var printSource = options.printSource || false,
          printPositions = options.printPositions || false,
          printIndex = options.printIndex || false,
          source,
          parsed,
          tree = [];

      if (typeof astOrSource === "string") {
        source = astOrSource;
        parsed = parse(astOrSource);
      } else {
        parsed = astOrSource;source = options.source || parsed.source;
      }

      if (printSource && !parsed.source) {
        // ensure that nodes have source attached
        if (!source) {
          source = stringify(parsed);
          parsed = parse(source);
        }
        addSource(parsed, source);
      }

      function printFunc(ea) {
        var line = ea.path + ':' + ea.node.type,
            additional = [];
        if (printIndex) {
          additional.push(ea.index);
        }
        if (printPositions) {
          additional.push(ea.node.start + '-' + ea.node.end);
        }
        if (printSource) {
          var src = ea.node.source || source.slice(ea.node.start, ea.node.end),
              printed = lively_lang.string.print(src.truncate(60).replace(/\n/g, '').replace(/\s+/g, ' '));
          additional.push(printed);
        }
        if (additional.length) {
          line += '(' + additional.join(',') + ')';
        }
        return line;
      }

      new PrinterVisitor().accept(parsed, { index: 0, tree: tree }, []);
      return lively_lang.string.printTree(tree[0], printFunc, function (ea) {
        return ea.children;
      }, '  ');
    },

    compareAst: function compareAst(node1, node2) {
      if (!node1 || !node2) throw new Error('node' + (node1 ? '1' : '2') + ' not defined');
      var state = { completePath: [], comparisons: { errors: [] } };
      new ComparisonVisitor().accept(node1, node2, state, []);
      return !state.comparisons.errors.length ? null : state.comparisons.errors.pluck('msg');
    },

    pathToNode: function pathToNode(parsed, index, options) {
      options = options || {};
      if (!parsed.astIndex) addAstIndex(parsed);
      var vis = new Visitor(),
          found = null;
      (vis.accept = function (node, pathToHere, state, path) {
        if (found) return;
        var fullPath = pathToHere.concat(path);
        if (node.astIndex === index) {
          var pathString = fullPath.map(function (ea) {
            return typeof ea === 'string' ? '.' + ea : '[' + ea + ']';
          }).join('');
          found = { pathString: pathString, path: fullPath, node: node };
        }
        return this['visit' + node.type](node, fullPath, state, path);
      }).call(vis, parsed, [], {}, []);
      return found;
    },

    rematchAstWithSource: function rematchAstWithSource(parsed, source, addLocations, subTreePath) {
      addLocations = !!addLocations;
      var parsed2 = parse(source, addLocations ? { locations: true } : undefined),
          visitor = new Visitor();
      if (subTreePath) parsed2 = lively_lang.Path(subTreePath).get(parsed2);

      visitor.accept = function (node, state, path) {
        path = path || [];
        var node2 = path.reduce(function (node, pathElem) {
          return node[pathElem];
        }, parsed);
        node2.start = node.start;
        node2.end = node.end;
        if (addLocations) node2.loc = node.loc;
        return this['visit' + node.type](node, state, path);
      };

      visitor.accept(parsed2);
    }

  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  var withMozillaAstDo = methods.withMozillaAstDo;
  var printAst = methods.printAst;
  var compareAst = methods.compareAst;
  var pathToNode = methods.pathToNode;
  var rematchAstWithSource = methods.rematchAstWithSource;

  var identifierRe = /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;
  function isIdentifier(string) {
    // Note: It's not so easy...
    // http://wiki.ecmascript.org/doku.php?id=strawman:identifier_identification
    // https://mathiasbynens.be/notes/javascript-identifiers-es6
    return identifierRe.test(string) && string.indexOf("-") === -1;
  }

  function id(name) {
    return name === "this" ? { type: "ThisExpression" } : { name: String(name), type: "Identifier" };
  }

  function literal(value) {
    return { type: "Literal", value: value };
  }

  function exprStmt(expression) {
    return { type: "ExpressionStatement", expression: expression };
  }

  function returnStmt(expr) {
    return { type: "ReturnStatement", argument: expr };
  }

  function empty() {
    return { type: "EmptyStatement" };
  }

  function binaryExpr(left, op, right) {
    return {
      left: left, right: right, operator: op,
      type: "BinaryExpression"
    };
  }

  function funcExpr(_ref) {
    for (var _len = arguments.length, statements = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      statements[_key - 2] = arguments[_key];
    }

    var arrow = _ref.arrow;
    var funcId = _ref.id;
    var expression = _ref.expression;
    var generator = _ref.generator;
    var params = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    // lively.ast.stringify(funcExpr({id: "foo"}, ["a"], exprStmt(id("3"))))
    // // => "function foo(a) { 3; }"
    params = params.map(function (ea) {
      return typeof ea === "string" ? id(ea) : ea;
    });
    return {
      type: (arrow ? "Arrow" : "") + "FunctionExpression",
      id: funcId ? typeof funcId === "string" ? id(funcId) : funcId : undefined,
      params: params,
      body: { body: statements, type: "BlockStatement" },
      expression: expression || false,
      generator: generator || false
    };
  }

  function funcCall(callee) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    if (typeof callee === "string") callee = id(callee);
    return {
      type: "CallExpression",
      callee: callee,
      arguments: args
    };
  }

  function varDecl(id, init, kind) {
    if (typeof id === "string") id = { name: id, type: "Identifier" };
    return {
      type: "VariableDeclaration", kind: kind || "var",
      declarations: [{ type: "VariableDeclarator", id: id, init: init }]
    };
  }

  function member(obj, prop, computed) {
    // Example:
    // lively.ast.stringify(member("foo", "bar"))
    // // => "foo.bar"
    // lively.ast.stringify(member("foo", "b-a-r"))
    // // => "foo['b-a-r']"
    // lively.ast.stringify(member("foo", "zork", true))
    // // => "foo['zork']"
    // lively.ast.stringify(member("foo", 0))
    // // => "foo[0]"
    if (typeof obj === "string") obj = id(obj);
    if (typeof prop === "string") {
      if (!computed && !isIdentifier(prop)) computed = true;
      prop = computed ? literal(prop) : id(prop);
    } else if (typeof prop === "number") {
      prop = literal(prop);
      computed = true;
    } else if (prop.type === "Literal") {
      computed = true;
    }
    return {
      type: "MemberExpression",
      computed: !!computed,
      object: obj, property: prop
    };
  }

  function memberChain(first) {
    for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      rest[_key3 - 1] = arguments[_key3];
    }

    // lively.ast.stringify(memberChain("foo", "bar", 0, "baz-zork"));
    // // => "foo.bar[0]['baz-zork']"
    return rest.reduce(function (memberExpr, key) {
      return member(memberExpr, key);
    }, (typeof first === "undefined" ? "undefined" : babelHelpers.typeof(first)) === "object" ? first : id(first));
  }

  function assign(left, right) {
    // lively.ast.stringify(assign("a", "x"))
    // // => "a = x"
    // lively.ast.stringify(assign(member("a", "x"), literal(23)))
    // // => "a.x = 23"
    return {
      type: "AssignmentExpression", operator: "=",
      right: right ? typeof right === "string" ? id(right) : right : id("undefined"),
      left: typeof left === "string" ? id(left) : left
    };
  }

  function block() {
    for (var _len4 = arguments.length, body = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      body[_key4] = arguments[_key4];
    }

    return { body: Array.isArray(body[0]) ? body[0] : body, type: "BlockStatement" };
  }

  function program() {
    return Object.assign(block.apply(undefined, arguments), { sourceType: "module", type: "Program" });
  }

  function tryStmt(exName, handlerBody, finalizerBody) {
    for (var _len5 = arguments.length, body = Array(_len5 > 3 ? _len5 - 3 : 0), _key5 = 3; _key5 < _len5; _key5++) {
      body[_key5 - 3] = arguments[_key5];
    }

    // Example:
    // var stmt = exprStmt(binaryExpr(literal(3), "+", literal(2)));
    // lively.ast.stringify(tryStmt("err", [stmt], [stmt], stmt, stmt))
    // // => "try { 3 + 2; 3 + 2; } catch (err) { 3 + 2; } finally { 3 + 2; }"
    if (!Array.isArray(finalizerBody)) {
      body.unshift(finalizerBody);
      finalizerBody = null;
    }
    return {
      block: block(body),
      finalizer: finalizerBody ? block(finalizerBody) : null,
      handler: {
        body: block(handlerBody),
        param: id(exName),
        type: "CatchClause"
      },
      type: "TryStatement"
    };
  }

  function prop(key, value) {
    return {
      type: "Property",
      key: key,
      computed: key.type !== "Identifier",
      shorthand: false,
      value: value
    };
  }

  function objectLiteral(keysAndValues) {
    var props = [];
    for (var i = 0; i < keysAndValues.length; i += 2) {
      var key = keysAndValues[i];
      if (typeof key === "string") key = id(key);
      props.push(prop(key, keysAndValues[i + 1]));
    }
    return {
      properties: props,
      type: "ObjectExpression"
    };
  }

  function ifStmt(test) {
    var consequent = arguments.length <= 1 || arguments[1] === undefined ? block() : arguments[1];
    var alternate = arguments.length <= 2 || arguments[2] === undefined ? block() : arguments[2];

    return {
      consequent: consequent, alternate: alternate, test: test,
      type: "IfStatement"
    };
  }

  function logical(op, left, right) {
    return {
      operator: op, left: left, right: right,
      type: "LogicalExpression"
    };
  }

var nodes = Object.freeze({
    isIdentifier: isIdentifier,
    id: id,
    literal: literal,
    objectLiteral: objectLiteral,
    prop: prop,
    exprStmt: exprStmt,
    returnStmt: returnStmt,
    empty: empty,
    binaryExpr: binaryExpr,
    funcExpr: funcExpr,
    funcCall: funcCall,
    varDecl: varDecl,
    member: member,
    memberChain: memberChain,
    assign: assign,
    block: block,
    program: program,
    tryStmt: tryStmt,
    ifStmt: ifStmt,
    logical: logical
  });

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  var helpers = {
    declIds: function declIds(nodes) {
      return lively_lang.arr.flatmap(nodes, function (ea) {
        if (!ea) return [];
        if (ea.type === "Identifier") return [ea];
        if (ea.type === "RestElement") return [ea.argument];
        if (ea.type === "AssignmentPattern") return helpers.declIds([ea.left]);
        if (ea.type === "ObjectPattern") return helpers.declIds(lively_lang.arr.pluck(ea.properties, "value"));
        if (ea.type === "ArrayPattern") return helpers.declIds(ea.elements);
        return [];
      });
    },
    varDecls: function varDecls(scope) {
      return lively_lang.arr.flatmap(scope.varDecls, function (varDecl) {
        return lively_lang.arr.flatmap(varDecl.declarations, function (decl) {
          return helpers.declIds([decl.id]).map(function (id) {
            return [decl, id];
          });
        });
      });
    },
    varDeclIds: function varDeclIds(scope) {
      return helpers.declIds(scope.varDecls.reduce(function (all, ea) {
        all.push.apply(all, ea.declarations);return all;
      }, []).map(function (ea) {
        return ea.id;
      }));
    },
    objPropertiesAsList: function objPropertiesAsList(objExpr, path, onlyLeafs) {
      // takes an obj expr like {x: 23, y: [{z: 4}]} an returns the key and value
      // nodes as a list
      return lively_lang.arr.flatmap(objExpr.properties, function (prop) {
        var key = prop.key.name;
        // var result = [{key: path.concat([key]), value: prop.value}];
        var result = [];
        var thisNode = { key: path.concat([key]), value: prop.value };
        switch (prop.value.type) {
          case "ArrayExpression":case "ArrayPattern":
            if (!onlyLeafs) result.push(thisNode);
            result = result.concat(lively_lang.arr.flatmap(prop.value.elements, function (el, i) {
              return helpers.objPropertiesAsList(el, path.concat([key, i]), onlyLeafs);
            }));
            break;
          case "ObjectExpression":case "ObjectPattern":
            if (!onlyLeafs) result.push(thisNode);
            result = result.concat(helpers.objPropertiesAsList(prop.value, path.concat([key]), onlyLeafs));
            break;
          case "AssignmentPattern":
            if (!onlyLeafs) result.push(thisNode);
            result = result.concat(helpers.objPropertiesAsList(prop.left, path.concat([key]), onlyLeafs));
            break;
          default:
            result.push(thisNode);
        }
        return result;
      });
    },
    isDeclaration: function isDeclaration(node) {
      return node.type === "FunctionDeclaration" || node.type === "VariableDeclaration" || node.type === "ClassDeclaration";
    }
  };

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  var knownGlobals = ["true", "false", "null", "undefined", "arguments", "Object", "Function", "String", "Array", "Date", "Boolean", "Number", "RegExp", "Symbol", "Error", "EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError", "Math", "NaN", "Infinity", "Intl", "JSON", "Promise", "parseFloat", "parseInt", "isNaN", "isFinite", "eval", "alert", "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "navigator", "window", "document", "console", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame", "cancelAnimationFrame", "Node", "HTMLCanvasElement", "Image", "lively", "pt", "rect", "rgb", "$super", "$morph", "$world", "show"];

  function scopes(parsed) {
    var vis = new ScopeVisitor(),
        scope = vis.newScope(parsed, null);
    vis.accept(parsed, scope, []);
    return scope;
  }

  function nodesAtIndex(parsed, index) {
    return withMozillaAstDo(parsed, [], function (next, node, found) {
      if (node.start <= index && index <= node.end) {
        found.push(node);next();
      }
      return found;
    });
  }

  function scopesAtIndex(parsed, index) {
    return lively_lang.tree.filter(scopes(parsed), function (scope) {
      var n = scope.node;
      var start = n.start,
          end = n.end;
      if (n.type === 'FunctionDeclaration') {
        start = n.params.length ? n.params[0].start : n.body.start;
        end = n.body.end;
      }
      return start <= index && index <= end;
    }, function (s) {
      return s.subScopes;
    });
  }

  function scopeAtIndex(parsed, index) {
    return lively_lang.arr.last(scopesAtIndex(parsed, index));
  }

  function scopesAtPos(pos, parsed) {
    // DEPRECATED
    // FIXME "scopes" should actually not referer to a node but to a scope
    // object, see exports.scopes!
    return nodesAt$1(pos, parsed).filter(function (node) {
      return node.type === 'Program' || node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression';
    });
  }

  function nodesInScopeOf(node) {
    // DEPRECATED
    // FIXME "scopes" should actually not referer to a node but to a scope
    // object, see exports.scopes!
    return withMozillaAstDo(node, { root: node, result: [] }, function (next, node, state) {
      state.result.push(node);
      if (node !== state.root && (node.type === 'Program' || node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression')) return state;
      next();
      return state;
    }).result;
  }

  function declarationsOfScope(scope, includeOuter) {
    // returns Identifier nodes
    return (includeOuter && scope.node.id && scope.node.id.name ? [scope.node.id] : []).concat(helpers.declIds(scope.params)).concat(scope.funcDecls.map(function (ea) {
      return ea.id;
    })).concat(helpers.varDeclIds(scope)).concat(scope.catches).concat(scope.classDecls.map(function (ea) {
      return ea.id;
    })).concat(scope.importDecls);
  }

  function declarationsWithIdsOfScope(scope) {
    // returns a list of pairs [(DeclarationNode,IdentifierNode)]
    var bareIds = helpers.declIds(scope.params).concat(scope.catches),
        declNodes = (scope.node.id && scope.node.id.name ? [scope.node] : []).concat(scope.funcDecls).concat(scope.classDecls);
    return bareIds.map(function (ea) {
      return [ea, ea];
    }).concat(declNodes.map(function (ea) {
      return [ea, ea.id];
    })).concat(helpers.varDecls(scope)).concat(scope.importDecls.map(function (im) {
      return [statementOf(scope.node, im), im];
    }));
  }

  function _declaredVarNames(scope, useComments) {
    return lively_lang.arr.pluck(declarationsOfScope(scope, true), 'name').concat(!useComments ? [] : _findJsLintGlobalDeclarations(scope.node.type === 'Program' ? scope.node : scope.node.body));
  }

  function _findJsLintGlobalDeclarations(node) {
    if (!node || !node.comments) return [];
    return lively_lang.arr.flatten(node.comments.filter(function (ea) {
      return ea.text.trim().match(/^global/);
    }).map(function (ea) {
      return lively_lang.arr.invoke(ea.text.replace(/^\s*global\s*/, '').split(','), 'trim');
    }));
  }

  function topLevelFuncDecls(parsed) {
    return FindToplevelFuncDeclVisitor.run(parsed);
  }

  function resolveReference(ref, scopePath) {
    if (scopePath.length == 0) return [null, null];

    var _scopePath = babelHelpers.toArray(scopePath);

    var scope = _scopePath[0];

    var outer = _scopePath.slice(1);

    var decls = scope.decls || declarationsWithIdsOfScope(scope);
    scope.decls = decls;
    var decl = decls.find(function (_ref) {
      var _ref2 = babelHelpers.slicedToArray(_ref, 2);

      var _ = _ref2[0];
      var id = _ref2[1];
      return id.name == ref;
    });
    return decl || resolveReference(ref, outer);
  }

  function resolveReferences(scope) {
    function rec(scope, outerScopes) {
      var path = [scope].concat(outerScopes);
      scope.refs.forEach(function (ref) {
        var _resolveReference = resolveReference(ref.name, path);

        var _resolveReference2 = babelHelpers.slicedToArray(_resolveReference, 2);

        var decl = _resolveReference2[0];
        var id = _resolveReference2[1];

        map.set(ref, { decl: decl, declId: id, ref: ref });
      });
      scope.subScopes.forEach(function (s) {
        return rec(s, path);
      });
    }
    if (scope.referencesResolvedSafely) return scope;
    var map = scope.resolvedRefMap = new Map();
    rec(scope, []);
    scope.referencesResolvedSafely = true;
    return scope;
  }

  function refWithDeclAt(pos, scope) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = scope.resolvedRefMap.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var ref = _step.value;
        var _ref$ref = ref.ref;
        var start = _ref$ref.start;
        var end = _ref$ref.end;

        if (start <= pos && pos <= end) return ref;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  function topLevelDeclsAndRefs(parsed, options) {
    options = options || {};
    options.withComments = true;

    if (typeof parsed === "string") parsed = parse(parsed, options);

    var scope = scopes(parsed),
        useComments = !!options.jslintGlobalComment,
        declared = _declaredVarNames(scope, useComments),
        refs = scope.refs.concat(lively_lang.arr.flatten(scope.subScopes.map(findUndeclaredReferences))),
        undeclared = lively_lang.arr.withoutAll(refs.map(function (ea) {
      return ea.name;
    }), declared);

    return {
      scope: scope,
      varDecls: scope.varDecls,
      funcDecls: scope.funcDecls,
      classDecls: scope.classDecls,
      declaredNames: declared,
      undeclaredNames: undeclared,
      refs: refs,
      thisRefs: scope.thisRefs
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    function findUndeclaredReferences(scope) {
      var names = _declaredVarNames(scope, useComments);
      return scope.subScopes.map(findUndeclaredReferences).reduce(function (refs, ea) {
        return refs.concat(ea);
      }, scope.refs).filter(function (ref) {
        return names.indexOf(ref.name) === -1;
      });
    }
  }

  function findGlobalVarRefs(parsed, options) {
    var topLevel = topLevelDeclsAndRefs(parsed, options),
        noGlobals = topLevel.declaredNames.concat(knownGlobals);
    return topLevel.refs.filter(function (ea) {
      return noGlobals.indexOf(ea.name) === -1;
    });
  }

  function findNodesIncludingLines(parsed, code, lines, options) {
    if (!code && !parsed) throw new Error("Need at least ast or code");
    code = code ? code : stringify(parsed);
    parsed = parsed && parsed.loc ? parsed : parse(code, { locations: true });
    return withMozillaAstDo(parsed, [], function (next, node, found) {
      if (lines.every(function (line) {
        return lively_lang.num.between(line, node.loc.start.line, node.loc.end.line);
      })) {
        lively_lang.arr.pushIfNotIncluded(found, node);next();
      }
      return found;
    });
  }

  function findReferencesAndDeclsInScope(scope, name) {
    if (name === "this") {
      return scope.thisRefs;
    }

    return lively_lang.arr.flatten( // all references
    lively_lang.tree.map(scope, function (scope) {
      return scope.refs.concat(varDeclIdsOf(scope)).filter(function (ref) {
        return ref.name === name;
      });
    }, function (s) {
      return s.subScopes.filter(function (subScope) {
        return varDeclIdsOf(subScope).every(function (id) {
          return id.name !== name;
        });
      });
    }));

    function varDeclIdsOf(scope) {
      return scope.params.concat(lively_lang.arr.pluck(scope.funcDecls, 'id')).concat(lively_lang.arr.pluck(scope.classDecls, 'id')).concat(helpers.varDeclIds(scope));
    }
  }

  function findDeclarationClosestToIndex(parsed, name, index) {
    var found = null;
    lively_lang.arr.detect(scopesAtIndex(parsed, index).reverse(), function (scope) {
      var decls = declarationsOfScope(scope, true),
          idx = lively_lang.arr.pluck(decls, 'name').indexOf(name);
      if (idx === -1) return false;
      found = decls[idx];return true;
    });
    return found;
  }

  function nodesAt$1(pos, ast) {
    ast = typeof ast === 'string' ? parse(ast) : ast;
    return acorn.walk.findNodesIncluding(ast, pos);
  }

  var _stmtTypes = ["EmptyStatement", "BlockStatement", "ExpressionStatement", "IfStatement", "BreakStatement", "ContinueStatement", "WithStatement", "ReturnStatement", "ThrowStatement", "TryStatement", "WhileStatement", "DoWhileStatement", "ForStatement", "ForInStatement", "ForOfStatement", "DebuggerStatement", "FunctionDeclaration", "VariableDeclaration", "ClassDeclaration", "ImportDeclaration", "ImportDeclaration", "ExportNamedDeclaration", "ExportDefaultDeclaration", "ExportAllDeclaration"];

  function statementOf(parsed, node, options) {
    // Find the statement that a target node is in. Example:
    // let source be "var x = 1; x + 1;" and we are looking for the
    // Identifier "x" in "x+1;". The second statement is what will be found.
    var nodes = nodesAt$1(node.start, parsed),
        found = nodes.reverse().find(function (node) {
      return lively_lang.arr.include(_stmtTypes, node.type);
    });
    if (options && options.asPath) {
      var v = new Visitor(),
          foundPath = void 0;
      v.accept = lively_lang.fun.wrap(v.accept, function (proceed, node, state, path) {
        if (node === found) {
          foundPath = path;throw new Error("stop search");
        };
        return proceed(node, state, path);
      });
      try {
        v.accept(parsed, {}, []);
      } catch (e) {}
      return foundPath;
    }
    return found;
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // imports and exports
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  function imports(scope) {
    var imports = scope.importDecls.reduce(function (imports, node) {
      var nodes = nodesAtIndex(scope.node, node.start),
          importStmt = lively_lang.arr.without(nodes, scope.node)[0];
      if (!importStmt) return imports;

      var from = importStmt.source ? importStmt.source.value : "unknown module";
      if (!importStmt.specifiers.length) // no imported vars
        return imports.concat([{
          local: null,
          imported: null,
          fromModule: from,
          node: node
        }]);

      return imports.concat(importStmt.specifiers.map(function (importSpec) {
        var imported;
        if (importSpec.type === "ImportNamespaceSpecifier") imported = "*";else if (importSpec.type === "ImportDefaultSpecifier") imported = "default";else if (importSpec.type === "ImportSpecifier") imported = importSpec.imported.name;else if (importStmt.source) imported = importStmt.source.name;else imported = null;
        return {
          local: importSpec.local ? importSpec.local.name : null,
          imported: imported,
          fromModule: from,
          node: node
        };
      }));
    }, []);

    return lively_lang.arr.uniqBy(imports, function (a, b) {
      return a.local == b.local && a.imported == b.imported && a.fromModule == b.fromModule;
    });
  }

  function exports$1(scope) {
    var resolve = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    if (resolve) resolveReferences(scope);

    var exports = scope.exportDecls.reduce(function (exports, node) {

      var exportsStmt = statementOf(scope.node, node);
      if (!exportsStmt) return exports;

      var from = exportsStmt.source ? exportsStmt.source.value : null;

      if (exportsStmt.type === "ExportAllDeclaration") {
        return exports.concat([{
          local: null,
          exported: "*",
          imported: "*",
          fromModule: from,
          node: node,
          type: "all"
        }]);
      }
      if (exportsStmt.type === "ExportDefaultDeclaration") {
        if (helpers.isDeclaration(exportsStmt.declaration)) {
          return exports.concat({
            local: exportsStmt.declaration.id.name,
            exported: "default",
            type: exportsStmt.declaration.type === "FunctionDeclaration" ? "function" : exportsStmt.declaration.type === "ClassDeclaration" ? "class" : null,
            fromModule: null,
            node: node,
            decl: exportsStmt.declaration,
            declId: exportsStmt.declaration.id
          });
        } else if (exportsStmt.declaration.type === "Identifier") {
          var _ref3 = scope.resolvedRefMap.get(exportsStmt.declaration) || {};

          var decl = _ref3.decl;
          var declId = _ref3.declId;

          return exports.concat([{
            local: exportsStmt.declaration.name,
            exported: "default",
            fromModule: null,
            node: node,
            type: "id",
            decl: decl,
            declId: declId
          }]);
        } else {
          // exportsStmt.declaration is an expression
          return exports.concat([{
            local: null,
            exported: "default",
            fromModule: null,
            node: node,
            type: "expr",
            decl: exportsStmt.declaration,
            declId: exportsStmt.declaration
          }]);
        }
      }

      if (exportsStmt.specifiers && exportsStmt.specifiers.length) {
        return exports.concat(exportsStmt.specifiers.map(function (exportSpec) {
          var decl, declId;
          if (from) {
            // "export { x as y } from 'foo'" is the only case where export
            // creates a (non-local) declaration itself
            decl = node;declId = exportSpec.exported;
          } else if (exportSpec.local) {
            var resolved = scope.resolvedRefMap.get(exportSpec.local);
            decl = resolved.decl, declId = resolved.declId;
          }

          return {
            local: !from && exportSpec.local ? exportSpec.local.name : null,
            exported: exportSpec.exported ? exportSpec.exported.name : null,
            imported: from && exportSpec.local ? exportSpec.local.name : null,
            fromModule: from || null,
            type: "id",
            node: node,
            decl: decl,
            declId: declId
          };
        }));
      }

      if (exportsStmt.declaration && exportsStmt.declaration.declarations) {
        return exports.concat(exportsStmt.declaration.declarations.map(function (decl) {
          return {
            local: decl.id.name,
            exported: decl.id.name,
            type: exportsStmt.declaration.kind,
            fromModule: null,
            node: node,
            decl: decl,
            declId: decl.id
          };
        }));
      }

      if (exportsStmt.declaration) {
        return exports.concat({
          local: exportsStmt.declaration.id.name,
          exported: exportsStmt.declaration.id.name,
          type: exportsStmt.declaration.type === "FunctionDeclaration" ? "function" : exportsStmt.declaration.type === "ClassDeclaration" ? "class" : null,
          fromModule: null,
          node: node,
          decl: exportsStmt.declaration,
          declId: exportsStmt.declaration.id
        });
      }
      return exports;
    }, []);

    return lively_lang.arr.uniqBy(exports, function (a, b) {
      return a.local == b.local && a.exported == b.exported && a.fromModule == b.fromModule;
    });
  }



  var query = Object.freeze({
    helpers: helpers,
    knownGlobals: knownGlobals,
    scopes: scopes,
    nodesAtIndex: nodesAtIndex,
    scopesAtIndex: scopesAtIndex,
    scopeAtIndex: scopeAtIndex,
    scopesAtPos: scopesAtPos,
    nodesInScopeOf: nodesInScopeOf,
    declarationsOfScope: declarationsOfScope,
    _declaredVarNames: _declaredVarNames,
    _findJsLintGlobalDeclarations: _findJsLintGlobalDeclarations,
    topLevelDeclsAndRefs: topLevelDeclsAndRefs,
    topLevelFuncDecls: topLevelFuncDecls,
    findGlobalVarRefs: findGlobalVarRefs,
    findNodesIncludingLines: findNodesIncludingLines,
    findReferencesAndDeclsInScope: findReferencesAndDeclsInScope,
    findDeclarationClosestToIndex: findDeclarationClosestToIndex,
    nodesAt: nodesAt$1,
    statementOf: statementOf,
    resolveReferences: resolveReferences,
    refWithDeclAt: refWithDeclAt,
    imports: imports,
    exports: exports$1
  });

  var helper = {
    // currently this is used by the replacement functions below but
    // I don't wan't to make it part of our AST API

    _node2string: function _node2string(node) {
      return node.source || stringify(node);
    },

    _findIndentAt: function _findIndentAt(s, pos) {
      var bol = lively_lang.string.peekLeft(s, pos, /\s+$/),
          indent = typeof bol === 'number' ? s.slice(bol, pos) : '';
      if (indent[0] === '\n') indent = indent.slice(1);
      return indent;
    },

    _applyChanges: function _applyChanges(changes, source) {
      return changes.reduce(function (source, change) {
        if (change.type === 'del') {
          return source.slice(0, change.pos) + source.slice(change.pos + change.length);
        } else if (change.type === 'add') {
          return source.slice(0, change.pos) + change.string + source.slice(change.pos);
        }
        throw new Error('Uexpected change ' + Objects.inspect(change));
      }, source);
    },

    _compareNodesForReplacement: function _compareNodesForReplacement(nodeA, nodeB) {
      // equals
      if (nodeA.start === nodeB.start && nodeA.end === nodeB.end) return 0;
      // a "left" of b
      if (nodeA.end <= nodeB.start) return -1;
      // a "right" of b
      if (nodeA.start >= nodeB.end) return 1;
      // a contains b
      if (nodeA.start <= nodeB.start && nodeA.end >= nodeB.end) return 1;
      // b contains a
      if (nodeB.start <= nodeA.start && nodeB.end >= nodeA.end) return -1;
      throw new Error('Comparing nodes');
    },

    replaceNode: function replaceNode(target, replacementFunc, sourceOrChanges) {
      // parameters:
      //   - target: ast node
      //   - replacementFunc that gets this node and its source snippet
      //     handed and should produce a new ast node.
      //   - sourceOrChanges: If its a string -- the source code to rewrite
      //                      If its and object -- {changes: ARRAY, source: STRING}

      var sourceChanges = (typeof sourceOrChanges === "undefined" ? "undefined" : babelHelpers.typeof(sourceOrChanges)) === 'object' ? sourceOrChanges : { changes: [], source: sourceOrChanges },
          insideChangedBefore = false,
          pos = sourceChanges.changes.reduce(function (pos, change) {
        // fixup the start and end indices of target using the del/add
        // changes already applied
        if (pos.end < change.pos) return pos;

        var isInFront = change.pos < pos.start;
        insideChangedBefore = insideChangedBefore || change.pos >= pos.start && change.pos <= pos.end;

        if (change.type === 'add') return {
          start: isInFront ? pos.start + change.string.length : pos.start,
          end: pos.end + change.string.length
        };

        if (change.type === 'del') return {
          start: isInFront ? pos.start - change.length : pos.start,
          end: pos.end - change.length
        };

        throw new Error('Cannot deal with change ' + Objects.inspect(change));
      }, { start: target.start, end: target.end });

      var source = sourceChanges.source,
          replacement = replacementFunc(target, source.slice(pos.start, pos.end), insideChangedBefore),
          replacementSource = Array.isArray(replacement) ? replacement.map(helper._node2string).join('\n' + helper._findIndentAt(source, pos.start)) : replacementSource = helper._node2string(replacement);

      var changes = [{ type: 'del', pos: pos.start, length: pos.end - pos.start }, { type: 'add', pos: pos.start, string: replacementSource }];

      return {
        changes: sourceChanges.changes.concat(changes),
        source: this._applyChanges(changes, source)
      };
    },

    replaceNodes: function replaceNodes(targetAndReplacementFuncs, sourceOrChanges) {
      // replace multiple AST nodes, order rewriting from inside out and
      // top to bottom so that nodes to rewrite can overlap or be contained
      // in each other
      return targetAndReplacementFuncs.sort(function (a, b) {
        return helper._compareNodesForReplacement(a.target, b.target);
      }).reduce(function (sourceChanges, ea) {
        return helper.replaceNode(ea.target, ea.replacementFunc, sourceChanges);
      }, (typeof sourceOrChanges === "undefined" ? "undefined" : babelHelpers.typeof(sourceOrChanges)) === 'object' ? sourceOrChanges : { changes: [], source: sourceOrChanges });
    }

  };

  function replace(astOrSource, targetNode, replacementFunc, options) {
    // replaces targetNode in astOrSource with what replacementFunc returns
    // (one or multiple ast nodes)
    // Example:
    // var ast = exports.parse('foo.bar("hello");')
    // exports.transform.replace(
    //     ast, ast.body[0].expression,
    //     function(node, source) {
    //         return {type: "CallExpression",
    //             callee: {name: node.arguments[0].value, type: "Identifier"},
    //             arguments: [{value: "world", type: "Literal"}]
    //         }
    //     });
    // => {
    //      source: "hello('world');",
    //      changes: [{pos: 0,length: 16,type: "del"},{pos: 0,string: "hello('world')",type: "add"}]
    //    }

    var parsed = (typeof astOrSource === "undefined" ? "undefined" : babelHelpers.typeof(astOrSource)) === 'object' ? astOrSource : null,
        source = typeof astOrSource === 'string' ? astOrSource : parsed.source || helper._node2string(parsed),
        result = helper.replaceNode(targetNode, replacementFunc, source);

    return result;
  }

  function oneDeclaratorPerVarDecl(astOrSource) {
    // exports.transform.oneDeclaratorPerVarDecl(
    //    "var x = 3, y = (function() { var y = 3, x = 2; })(); ").source

    var parsed = (typeof astOrSource === "undefined" ? "undefined" : babelHelpers.typeof(astOrSource)) === 'object' ? astOrSource : parse(astOrSource),
        source = typeof astOrSource === 'string' ? astOrSource : parsed.source || helper._node2string(parsed),
        scope = scopes(parsed),
        varDecls = function findVarDecls(scope) {
      return lively_lang.arr.flatten(scope.varDecls.concat(scope.subScopes.map(findVarDecls)));
    }(scope);

    var targetsAndReplacements = varDecls.map(function (decl) {
      return {
        target: decl,
        replacementFunc: function replacementFunc(declNode, s, wasChanged) {
          if (wasChanged) {
            // reparse node if necessary, e.g. if init was changed before like in
            // var x = (function() { var y = ... })();
            declNode = parse(s).body[0];
          }

          return declNode.declarations.map(function (ea) {
            return {
              type: "VariableDeclaration",
              kind: "var", declarations: [ea]
            };
          });
        }
      };
    });

    return helper.replaceNodes(targetsAndReplacements, source);
  }

  function oneDeclaratorForVarsInDestructoring(astOrSource) {
    var parsed = (typeof astOrSource === "undefined" ? "undefined" : babelHelpers.typeof(astOrSource)) === 'object' ? astOrSource : parse(astOrSource),
        source = typeof astOrSource === 'string' ? astOrSource : parsed.source || helper._node2string(parsed),
        scope = scopes(parsed),
        varDecls = function findVarDecls(scope) {
      return lively_lang.arr.flatten(scope.varDecls.concat(scope.subScopes.map(findVarDecls)));
    }(scope);

    var targetsAndReplacements = varDecls.map(function (decl) {
      return {
        target: decl,
        replacementFunc: function replacementFunc(declNode, s, wasChanged) {
          if (wasChanged) {
            // reparse node if necessary, e.g. if init was changed before like in
            // var x = (function() { var y = ... })();
            declNode = parse(s).body[0];
          }

          return lively_lang.arr.flatmap(declNode.declarations, function (declNode) {
            var extractedId = { type: "Identifier", name: "__temp" },
                extractedInit = {
              type: "VariableDeclaration", kind: "var",
              declarations: [{ type: "VariableDeclarator", id: extractedId, init: declNode.init }]
            };

            var propDecls = helpers.objPropertiesAsList(declNode.id, [], false).map(function (ea) {
              return ea.key;
            }).map(function (keyPath) {
              return varDecl(lively_lang.arr.last(keyPath), memberChain.apply(undefined, [extractedId.name].concat(babelHelpers.toConsumableArray(keyPath))), "var");
            });

            return [extractedInit].concat(propDecls);
          });
        }
      };
    });

    return helper.replaceNodes(targetsAndReplacements, source);
  }

  function returnLastStatement(source, opts) {
    opts = opts || {};

    var parsed = parse(source, opts),
        last = lively_lang.arr.last(parsed.body);
    if (last.type === "ExpressionStatement") {
      parsed.body.splice(parsed.body.length - 1, 1, returnStmt(last.expression));
      return opts.asAST ? parsed : stringify(parsed);
    } else {
      return opts.asAST ? parsed : source;
    }
  }

  function wrapInFunction(code, opts) {
    opts = opts || {};
    var transformed = returnLastStatement(code, opts);
    return opts.asAST ? program(funcExpr.apply(undefined, [{ id: opts.id || undefined }, []].concat(babelHelpers.toConsumableArray(transformed.body)))) : "function" + (opts.id ? " " + opts.id : "") + "() {\n" + transformed + "\n}";
  }

  function wrapInStartEndCall(parsed, options) {
    // Wraps a piece of code into two function calls: One before the first
    // statement and one after the last. Also wraps the entire thing into a try /
    // catch block. The end call gets the result of the last statement (if it is
    // something that returns a value, i.e. an expression) passed as the second
    // argument. If an error occurs the end function is called with an error as
    // first parameter
    // Why? This allows to easily track execution of code, especially for
    // asynchronus / await code!
    // Example:
    // stringify(wrapInStartEndCall("var y = x + 23; y"))
    // // generates code
    // try {
    //     __start_execution();
    //     __lvVarRecorder.y = x + 23;
    //     return __end_execution(null, __lvVarRecorder.y);
    // } catch (err) {
    //     return __end_execution(err, undefined);
    // }

    if (typeof parsed === "string") parsed = parse(parsed);
    options = options || {};

    var isProgram = parsed.type === "Program",
        startFuncNode = options.startFuncNode || id("__start_execution"),
        endFuncNode = options.endFuncNode || id("__end_execution"),
        funcDecls = topLevelFuncDecls(parsed),
        innerBody = parsed.body,
        outerBody = [];

    // 1. Hoist func decls outside the actual eval start - end code. The async /
    // generator transforms require this!
    funcDecls.forEach(function (_ref) {
      var node = _ref.node;
      var path = _ref.path;

      lively_lang.Path(path).set(parsed, exprStmt(node.id));
      outerBody.push(node);
    });

    // 2. add start-eval call
    innerBody.unshift(exprStmt(funcCall(startFuncNode)));

    // 3. if last statement is an expression, transform it so we can pass it to
    // the end-eval call, replacing the original expression. If it's a
    // non-expression we record undefined as the eval result
    var last = lively_lang.arr.last(innerBody);
    if (last.type === "ExpressionStatement") {
      innerBody.pop();
      innerBody.push(exprStmt(funcCall(endFuncNode, id("null"), last.expression)));
    } else if (last.type === "VariableDeclaration" && lively_lang.arr.last(last.declarations).id.type === "Identifier") {
      innerBody.push(exprStmt(funcCall(endFuncNode, id("null"), lively_lang.arr.last(last.declarations).id)));
    } else {
      innerBody.push(exprStmt(funcCall(endFuncNode, id("null"), id("undefined"))));
    }

    // 4. Wrap that stuff in a try stmt
    outerBody.push(tryStmt.apply(undefined, ["err", [exprStmt(funcCall(endFuncNode, id("err"), id("undefined")))]].concat(babelHelpers.toConsumableArray(innerBody))));

    return isProgram ? program.apply(undefined, outerBody) : block.apply(undefined, outerBody);
  }

  var isProbablySingleExpressionRe = /^\s*(\{|function\s*\()/;

  function transformSingleExpression(code) {
    // evaling certain expressions such as single functions or object
    // literals will fail or not work as intended. When the code being
    // evaluated consists just out of a single expression we will wrap it in
    // parens to allow for those cases
    // Example:
    // transformSingleExpression("{foo: 23}") // => "({foo: 23})"

    if (!isProbablySingleExpressionRe.test(code) || code.split("\n").length > 30) return code;

    try {
      var parsed = fuzzyParse(code);
      if (parsed.body.length === 1 && (parsed.body[0].type === 'FunctionDeclaration' || parsed.body[0].type === 'BlockStatement' && parsed.body[0].body[0].type === 'LabeledStatement')) {
        code = '(' + code.replace(/;\s*$/, '') + ')';
      }
    } catch (e) {
      if ((typeof lively === "undefined" ? "undefined" : babelHelpers.typeof(lively)) && lively.Config && lively.Config.showImprovedJavaScriptEvalErrors) $world.logError(e);else console.error("Eval preprocess error: %s", e.stack || e);
    }
    return code;
  }



  var transform = Object.freeze({
    helper: helper,
    replace: replace,
    oneDeclaratorPerVarDecl: oneDeclaratorPerVarDecl,
    oneDeclaratorForVarsInDestructoring: oneDeclaratorForVarsInDestructoring,
    returnLastStatement: returnLastStatement,
    wrapInFunction: wrapInFunction,
    wrapInStartEndCall: wrapInStartEndCall,
    transformSingleExpression: transformSingleExpression
  });

  var isTransformedClassVarDeclSymbol = Symbol();

  function createsNewScope(node) {
    return node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression" || node.type === "FunctionDeclaration";
  }

  var simpleReplace = function () {
    var ReplaceVisitor = function (_Visitor) {
      babelHelpers.inherits(ReplaceVisitor, _Visitor);

      function ReplaceVisitor() {
        babelHelpers.classCallCheck(this, ReplaceVisitor);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ReplaceVisitor).apply(this, arguments));
      }

      babelHelpers.createClass(ReplaceVisitor, [{
        key: "accept",
        value: function accept(node, classHolder, path) {
          if (createsNewScope(node)) classHolder = objectLiteral([]);
          return this.replacer(babelHelpers.get(Object.getPrototypeOf(ReplaceVisitor.prototype), "accept", this).call(this, node, classHolder, path), classHolder, path);
        }
      }], [{
        key: "run",
        value: function run(parsed, classHolder, replacer) {
          var v = new this();
          v.replacer = replacer;
          return v.accept(parsed, classHolder, []);
        }
      }]);
      return ReplaceVisitor;
    }(Visitor);

    return function simpleReplace(parsed, classHolder, replacer) {
      return ReplaceVisitor.run(parsed, classHolder, replacer);
    };
  }();

  function replaceSuper(node, classHolder, path, options) {
    console.assert(node.type === "Super");

    var _path$slice = path.slice(-2);

    var _path$slice2 = babelHelpers.slicedToArray(_path$slice, 2);

    var parentReferencedAs = _path$slice2[0];
    var referencedAs = _path$slice2[1];

    if (parentReferencedAs === 'callee' && referencedAs === 'object' || referencedAs === 'callee') return node; // deal with this in replaceSuperCall

    return member(member(member("this", "constructor"), funcCall(member("Symbol", "for"), literal("lively-instance-superclass")), true), "prototype");
  }

  function replaceSuperMethodCall(node, classHolder, path, options) {
    // like super.foo()
    console.assert(node.type === "CallExpression");
    console.assert(node.callee.object.type === "Super");
    return funcCall.apply(undefined, [member(member(replaceSuper(node.callee.object, classHolder, [], options), node.callee.property), "call"), id("this")].concat(babelHelpers.toConsumableArray(node.arguments)));
  }

  function replaceDirectSuperCall(node, classHolder, path, options) {
    // like super.foo()
    console.assert(node.type === "CallExpression");
    console.assert(node.callee.type === "Super");
    return funcCall.apply(undefined, [member(member(replaceSuper(node.callee, classHolder, [], options), funcCall(member("Symbol", "for"), literal("lively-instance-initialize")), true), "call"), id("this")].concat(babelHelpers.toConsumableArray(node.arguments)));
  }

  function replaceClass(node, classHolder, path, options) {
    console.assert(node.type === "ClassDeclaration" || node.type === "ClassExpression");
    var instanceProps = id("undefined"),
        classProps = id("undefined");

    var body = node.body.body;
    var superClass = node.superClass;
    var classId = node.id;
    var type = node.type;


    if (body.length) {
      var _body$reduce = body.reduce(function (props, propNode) {
        var decl;var key = propNode.key;
        var kind = propNode.kind;
        var value = propNode.value;
        var classSide = propNode.static;

        if (key.type !== "Literal" && key.type !== "Identifier") {
          console.warn("Unexpected key in classToFunctionTransform! " + JSON.stringify(key));
        }

        if (kind === "method") {
          decl = objectLiteral(["key", literal(key.name || key.value), "value", Object.assign({}, value, { id: null })]);
        } else if (kind === "get" || kind === "set") {
          decl = objectLiteral(["key", literal(key.name || key.value), kind, Object.assign({}, value, { id: id(kind) })]);
        } else if (kind === "constructor") {
          decl = objectLiteral(["key", funcCall(member("Symbol", "for"), literal("lively-instance-initialize")), "value", Object.assign({}, value, { id: null })]);
        } else {
          console.warn("classToFunctionTransform encountered unknown class property with kind " + kind + ", ignoring it, " + JSON.stringify(propNode));
        }
        (classSide ? props.clazz : props.inst).push(decl);
        return props;
      }, { inst: [], clazz: [] });

      var inst = _body$reduce.inst;
      var clazz = _body$reduce.clazz;


      if (inst.length) instanceProps = { type: "ArrayExpression", elements: inst };
      if (clazz.length) classProps = { type: "ArrayExpression", elements: clazz };
    }

    var scope = options.scope,
        superClassReferencedAs,
        superClassRef;

    if (superClass && options.currentModuleAccessor) {
      if (options.classHolder === superClass.object) {
        superClassRef = superClass;
        superClassReferencedAs = superClass.property.name;
      } else {
        var found = scope && scope.resolvedRefMap && scope.resolvedRefMap.get(superClass),
            isTopLevel = found && found.decl && scope.decls && scope.decls.find(function (_ref) {
          var _ref2 = babelHelpers.slicedToArray(_ref, 1);

          var decl = _ref2[0];
          return decl === found.decl;
        });
        if (isTopLevel) {
          superClassRef = superClass;
          superClassReferencedAs = superClass.name;
        };
      }
    }

    var superClassSpec = superClassRef ? objectLiteral(["referencedAs", literal(superClassReferencedAs), "value", superClassRef]) : superClass || id("undefined");

    var classCreator = funcCall(options.functionNode, classId ? literal(classId.name) : id("undefined"), superClassSpec, instanceProps, classProps, classHolder, options.currentModuleAccessor || id("undefined"));

    if (type === "ClassExpression") return classCreator;

    var result = classCreator;

    if (options.declarationWrapper && classHolder === options.classHolder /*i.e. toplevel*/) result = funcCall(options.declarationWrapper, literal(classId.name), literal("class"), result, options.classHolder);

    // since it is a declaration and we removed the class construct we need to add a var-decl
    result = varDecl(classId, result, "var");
    result[isTransformedClassVarDeclSymbol] = true;

    return result;
  }

  function splitExportDefaultWithClass(node, classHolder, path, options) {
    return !node.declaration || !node.declaration[isTransformedClassVarDeclSymbol] ? node : [node.declaration, {
      declaration: node.declaration.declarations[0].id,
      type: "ExportDefaultDeclaration"
    }];
  }

  // var opts = {classHolder: {type: "Identifier", name: "_rec"}, functionNode: {type: "Identifier", name: "createOrExtendClass"}};
  // stringify(classToFunctionTransform(parse("class Foo extends Bar {m() { super.m(); }}"), opts))
  // stringify(classToFunctionTransform(parse("class Foo {constructor() {}}"), opts))

  function classToFunctionTransform(sourceOrAst, options) {
    // required: options = {functionNode, classHolder}
    // From
    //   class Foo extends SuperFoo { m() { return 2 + super.m() }}
    // produces something like
    //   createOrExtend({}, {referencedAs: "SuperFoo", value: SuperFoo}, "Foo2", [{
    //     key: "m",
    //     value: function m() {
    //       return 2 + this.constructor[superclassSymbol].prototype.m.call(this);
    //     }
    //   }])

    var parsed = typeof sourceOrAst === "string" ? parse(sourceOrAst) : sourceOrAst;
    options.scope = resolveReferences(scopes(parsed));

    var replaced = simpleReplace(parsed, options.classHolder, function (node, classHolder, path) {

      if (node.type === "ClassExpression" || node.type === "ClassDeclaration") return replaceClass(node, classHolder, path, options);

      if (node.type === "Super") return replaceSuper(node, classHolder, path, options);

      if (node.type === "CallExpression" && node.callee.type === "Super") return replaceDirectSuperCall(node, classHolder, path, options);

      if (node.type === "CallExpression" && node.callee.object && node.callee.object.type === "Super") return replaceSuperMethodCall(node, classHolder, path, options);

      if (node.type === "ExportDefaultDeclaration") {
        return splitExportDefaultWithClass(node, classHolder, path, options);
      }

      return node;
    });

    return replaced;
  }

  var merge = Object.assign;

  function rewriteToCaptureTopLevelVariables(parsed, assignToObj, options) {
    /* replaces var and function declarations with assignment statements.
     * Example:
       stringify(
         rewriteToCaptureTopLevelVariables2(
           parse("var x = 3, y = 2, z = 4"),
           {name: "A", type: "Identifier"}, ['z']));
       // => "A.x = 3; A.y = 2; z = 4"
     */

    if (!assignToObj) assignToObj = { type: "Identifier", name: "__rec" };

    options = Object.assign({
      ignoreUndeclaredExcept: null,
      includeRefs: null,
      excludeRefs: options && options.exclude || [],
      includeDecls: null,
      excludeDecls: options && options.exclude || [],
      recordDefRanges: false,
      es6ExportFuncId: null,
      es6ImportFuncId: null,
      captureObj: assignToObj,
      moduleExportFunc: { name: options && options.es6ExportFuncId || "_moduleExport", type: "Identifier" },
      moduleImportFunc: { name: options && options.es6ImportFuncId || "_moduleImport", type: "Identifier" },
      declarationWrapper: undefined,
      classToFunction: options && options.hasOwnProperty("classToFunction") ? options.classToFunction : Object.assign({
        classHolder: assignToObj,
        functionNode: { type: "Identifier", name: "_createOrExtendClass" },
        declarationWrapper: options && options.declarationWrapper
      })
    }, options);

    var rewritten = parsed;

    // "ignoreUndeclaredExcept" is null if we want to capture all globals in the toplevel scope
    // if it is a list of names we will capture all refs with those names
    if (options.ignoreUndeclaredExcept) {
      var topLevel = topLevelDeclsAndRefs(parsed);
      options.excludeRefs = lively_lang.arr.withoutAll(topLevel.undeclaredNames, options.ignoreUndeclaredExcept).concat(options.excludeRefs);
      options.excludeDecls = lively_lang.arr.withoutAll(topLevel.undeclaredNames, options.ignoreUndeclaredExcept).concat(options.excludeDecls);
    }

    options.excludeRefs = options.excludeRefs.concat(options.captureObj.name);
    options.excludeDecls = options.excludeDecls.concat(options.captureObj.name);

    // 1. def ranges so that we know at which source code positions the
    // definitions are
    var defRanges = options.recordDefRanges ? computeDefRanges(rewritten, options) : null;

    // 2. find those var declarations that should not be rewritten. we
    // currently ignore var declarations in for loops and the error parameter
    // declaration in catch clauses. Also es6 import / export declaration need
    // a special treatment
    // DO NOT rewrite exports like "export { foo as bar }" => "export { _rec.foo as bar }"
    // as this is not valid syntax. Instead we add a var declaration using the
    // recorder as init for those exports later
    options.excludeRefs = options.excludeRefs.concat(additionalIgnoredRefs(parsed, options));
    options.excludeDecls = options.excludeDecls.concat(additionalIgnoredDecls(parsed, options));

    rewritten = fixDefaultAsyncFunctionExportForRegeneratorBug(rewritten, options);

    // 3. if the es6ExportFuncId options is defined we rewrite the es6 form into an
    // obj assignment, converting es6 code to es5 using the extra
    // options.moduleExportFunc and options.moduleImportFunc as capture / sources
    if (options.es6ExportFuncId) {
      options.excludeRefs.push(options.es6ExportFuncId);
      options.excludeRefs.push(options.es6ImportFuncId);
      rewritten = es6ModuleTransforms(rewritten, options);
    }

    // 4. make all references declared in the toplevel scope into property
    // reads of captureObj
    // Example "var foo = 3; 99 + foo;" -> "var foo = 3; 99 + Global.foo;"
    rewritten = replaceRefs(rewritten, options);

    // 5.a turn var declarations into assignments to captureObj
    // Example: "var foo = 3; 99 + foo;" -> "Global.foo = 3; 99 + foo;"
    // if declarationWrapper is requested:
    //   "var foo = 3;" -> "Global.foo = _define(3, 'foo', _rec, 'var');"
    rewritten = replaceVarDecls(rewritten, options);

    // 5.b record class declarations
    // Example: "class Foo {}" -> "class Foo {}; Global.Foo = Foo;"
    // if declarationWrapper is requested:
    //   "class Foo {}" -> "Global.Foo = _define(class Foo {});"
    rewritten = replaceClassDecls(rewritten, options);

    // 6. es6 export declaration are left untouched but a capturing assignment
    // is added after the export so that we get the value:
    // "export var x = 23;" => "export var x = 23; Global.x = x;"
    rewritten = insertCapturesForExportDeclarations(rewritten, options);

    // 7. es6 import declaration are left untouched but a capturing assignment
    // is added after the import so that we get the value:
    // "import x from './some-es6-module.js';" => "import x from './some-es6-module.js';\n_rec.x = x;"
    rewritten = insertCapturesForImportDeclarations(rewritten, options);

    // 8. Since variable declarations like "var x = 23" were transformed to sth
    // like "_rex.x = 23" exports can't simply reference vars anymore and
    // "export { _rec.x }" is invalid syntax. So in front of those exports we add
    // var decls manually
    rewritten = insertDeclarationsForExports(rewritten, options);

    // 9. assignments for function declarations in the top level scope are
    // put in front of everything else to mirror the func hoisting:
    // "return bar(); function bar() { return 23 }" ->
    //   "Global.bar = bar; return bar(); function bar() { return 23 }"
    // if declarationWrapper is requested:
    //   "Global.bar = _define(bar, 'bar', _rec, 'function'); function bar() {}"
    rewritten = putFunctionDeclsInFront(rewritten, options);

    return rewritten;
  }

  function rewriteToRegisterModuleToCaptureSetters(parsed, assignToObj, options) {
    // for rewriting the setters part in code like
    // ```js
    //   System.register(["a.js"], function (_export, _context) {
    //     var a, _rec;
    //     return {
    //       setters: [function(foo_a_js) { a = foo_a_js.x }],
    //       execute: function () { _rec.x = 23 + _rec.a; }
    //     };
    //   });
    // ```
    // This allows us to capture (and potentially re-export) imports and their
    // changes without actively running the module again.

    options = merge({
      captureObj: assignToObj || { type: "Identifier", name: "__rec" },
      exclude: [],
      declarationWrapper: undefined
    }, options);

    var registerCall = lively_lang.Path("body.0.expression").get(parsed);
    if (registerCall.callee.object.name !== "System") throw new Error("rewriteToRegisterModuleToCaptureSetters: input doesn't seem to be a System.register call: " + stringify(parsed).slice(0, 300) + "...");
    if (registerCall.callee.property.name !== "register") throw new Error("rewriteToRegisterModuleToCaptureSetters: input doesn't seem to be a System.register call: " + stringify(parsed).slice(0, 300) + "...");
    var registerBody = lively_lang.Path("arguments.1.body.body").get(registerCall),
        registerReturn = lively_lang.arr.last(registerBody);
    if (registerReturn.type !== "ReturnStatement") throw new Error("rewriteToRegisterModuleToCaptureSetters: input doesn't seem to be a System.register call, at return statement: " + stringify(parsed).slice(0, 300) + "...");
    var setters = registerReturn.argument.properties.find(function (prop) {
      return prop.key.name === "setters";
    });
    if (!setters) throw new Error("rewriteToRegisterModuleToCaptureSetters: input doesn't seem to be a System.register call, at finding setters: " + stringify(parsed).slice(0, 300) + "...");
    var execute = registerReturn.argument.properties.find(function (prop) {
      return prop.key.name === "execute";
    });
    if (!execute) throw new Error("rewriteToRegisterModuleToCaptureSetters: input doesn't seem to be a System.register call, at finding execute: " + stringify(parsed).slice(0, 300) + "...");

    // in each setter function: intercept the assignments to local vars and inject capture object
    setters.value.elements.forEach(function (funcExpr) {
      return funcExpr.body.body = funcExpr.body.body.map(function (stmt) {
        if (stmt.type !== "ExpressionStatement" || stmt.expression.type !== "AssignmentExpression" || stmt.expression.left.type !== "Identifier" || lively_lang.arr.include(options.exclude, stmt.expression.left.name)) return stmt;

        var id = stmt.expression.left,
            rhs = options.declarationWrapper ? funcCall(options.declarationWrapper, literal(id.name), literal("var"), stmt.expression, options.captureObj) : stmt.expression;
        return exprStmt(assign(member(options.captureObj, id), rhs));
      });
    });

    var captureInitialize = execute.value.body.body.find(function (stmt) {
      return stmt.type === "ExpressionStatement" && stmt.expression.type == "AssignmentExpression" && stmt.expression.left.name === options.captureObj.name;
    });
    if (captureInitialize) {
      lively_lang.arr.pushAt(registerBody, captureInitialize, registerBody.length - 1);
    }

    return parsed;
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // replacing helpers
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  // TODO move this stuff over into transform? Or separate replace.js?

  var ReplaceVisitor = function (_Visitor) {
    babelHelpers.inherits(ReplaceVisitor, _Visitor);

    function ReplaceVisitor() {
      babelHelpers.classCallCheck(this, ReplaceVisitor);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ReplaceVisitor).apply(this, arguments));
    }

    babelHelpers.createClass(ReplaceVisitor, [{
      key: "accept",
      value: function accept(node, state, path) {
        return this.replacer(babelHelpers.get(Object.getPrototypeOf(ReplaceVisitor.prototype), "accept", this).call(this, node, state, path), path);
      }
    }], [{
      key: "run",
      value: function run(parsed, replacer) {
        var v = new this();
        v.replacer = replacer;
        return v.accept(parsed, null, []);
      }
    }]);
    return ReplaceVisitor;
  }(Visitor);

  function replace$1(parsed, replacer) {
    return ReplaceVisitor.run(parsed, replacer);
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  var canBeInlinedSym = Symbol("canBeInlined");

  function blockInliner(node) {
    // FIXME what about () => x kind of functions?
    if (Array.isArray(node.body)) {
      for (var i = node.body.length - 1; i >= 0; i--) {
        var stmt = node.body[i];
        if (stmt.type === "BlockStatement" && stmt[canBeInlinedSym]) {
          node.body.splice.apply(node.body, [i, 1].concat(stmt.body));
        }
      }
    }
    return node;
  }

  var ReplaceManyVisitor = function (_Visitor2) {
    babelHelpers.inherits(ReplaceManyVisitor, _Visitor2);

    function ReplaceManyVisitor() {
      babelHelpers.classCallCheck(this, ReplaceManyVisitor);
      return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ReplaceManyVisitor).apply(this, arguments));
    }

    babelHelpers.createClass(ReplaceManyVisitor, [{
      key: "accept",
      value: function accept(node, state, path) {
        return this.replacer(babelHelpers.get(Object.getPrototypeOf(ReplaceManyVisitor.prototype), "accept", this).call(this, node, state, path));
        var replaced = this.replacer(babelHelpers.get(Object.getPrototypeOf(ReplaceManyVisitor.prototype), "accept", this).call(this, node, state, path), path);
        return !Array.isArray(replaced) ? replaced : replaced.length === 1 ? replaced[0] : Object.assign(block$1(replaced), babelHelpers.defineProperty({}, canBeInlinedSym, true));
      }
    }, {
      key: "visitBlockStatement",
      value: function visitBlockStatement(node, state, path) {
        return blockInliner(babelHelpers.get(Object.getPrototypeOf(ReplaceManyVisitor.prototype), "visitBlockStatement", this).call(this, node, state, path));
      }
    }, {
      key: "visitProgram",
      value: function visitProgram(node, state, path) {
        return blockInliner(babelHelpers.get(Object.getPrototypeOf(ReplaceManyVisitor.prototype), "visitProgram", this).call(this, node, state, path));
      }
    }], [{
      key: "run",
      value: function run(parsed, replacer) {
        var v = new this();
        v.replacer = replacer;
        return v.accept(parsed, null, []);
      }
    }]);
    return ReplaceManyVisitor;
  }(Visitor);

  function replaceWithMany(parsed, replacer) {
    return ReplaceManyVisitor.run(parsed, replacer);
  }

  function replaceRefs(parsed, options) {
    var topLevel = topLevelDeclsAndRefs(parsed),
        refsToReplace = topLevel.refs.filter(function (ref) {
      return shouldRefBeCaptured(ref, topLevel, options);
    });

    var replaced = replace$1(parsed, function (node, path) {
      return node.type === "Property" && refsToReplace.indexOf(node.key) > -1 && node.shorthand ? prop(id(node.key.name), node.value) : node;
    });

    return replace$1(replaced, function (node, path) {
      return refsToReplace.indexOf(node) > -1 ? member(options.captureObj, node) : node;
    });
  }

  function replaceVarDecls(parsed, options) {
    // rewrites var declarations so that they can be captured by
    // `options.captureObj`.
    // For normal vars we will do a transform like
    //   "var x = 23;" => "_rec.x = 23";
    // For patterns (destructuring assignments) we will create assignments for
    // all properties that are being destructured, creating helper vars as needed
    //   "var {x: [y]} = foo" => "var _1 = foo; var _1$x = _1.x; __rec.y = _1$x[0];"

    var topLevel = topLevelDeclsAndRefs(parsed);
    return replaceWithMany(parsed, function (node) {
      if (topLevel.varDecls.indexOf(node) === -1 || node.declarations.every(function (decl) {
        return !shouldDeclBeCaptured(decl, options);
      })) return node;

      return lively_lang.arr.flatmap(node.declarations, function (decl) {
        if (!shouldDeclBeCaptured(decl, options)) return [{ type: "VariableDeclaration", kind: node.kind || "var", declarations: [decl] }];

        var init = decl.init || {
          operator: "||",
          type: "LogicalExpression",
          left: { computed: false, object: options.captureObj, property: decl.id, type: "MemberExpression" },
          right: { name: "undefined", type: "Identifier" }
        };

        var initWrapped = options.declarationWrapper && decl.id.name ? funcCall(options.declarationWrapper, literal(decl.id.name), literal(node.kind), init, options.captureObj) : init;

        // Here we create the object pattern / destructuring replacements
        if (decl.id.type.match(/Pattern/)) {
          var declRootName = generateUniqueName(topLevel.declaredNames, "destructured_1"),
              declRoot = { type: "Identifier", name: declRootName },
              state = { parent: declRoot, declaredNames: topLevel.declaredNames },
              extractions = transformPattern(decl.id, state).map(function (decl) {
            return decl[annotationSym] && decl[annotationSym].capture ? assignExpr(options.captureObj, decl.declarations[0].id, options.declarationWrapper ? funcCall(options.declarationWrapper, literal(decl.declarations[0].id.name), literal(node.kind), decl.declarations[0].init, options.captureObj) : decl.declarations[0].init, false) : decl;
          });
          topLevel.declaredNames.push(declRootName);
          return [varDecl(declRoot, initWrapped, node.kind)].concat(extractions);
        }

        // This is rewriting normal vars
        return [assignExpr(options.captureObj, decl.id, initWrapped, false)];
      });
    });
  }

  function replaceClassDecls(parsed, options) {

    if (options.classToFunction) return classToFunctionTransform(parsed, options.classToFunction);

    var topLevel = topLevelDeclsAndRefs(parsed);
    if (!topLevel.classDecls.length) return parsed;
    for (var i = parsed.body.length - 1; i >= 0; i--) {
      var stmt = parsed.body[i];
      if (topLevel.classDecls.indexOf(stmt) !== -1) {
        if (false && options.declarationWrapper) {} else {
          parsed.body.splice(i + 1, 0, assignExpr(options.captureObj, stmt.id, stmt.id, false));
        }
      }
    }
    return parsed;
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // naming
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  function generateUniqueName(declaredNames, hint) {
    var unique = hint,
        n = 1;
    while (declaredNames.indexOf(unique) > -1) {
      if (n > 1000) throw new Error("Endless loop searching for unique variable " + unique);
      unique = unique.replace(/_[0-9]+$|$/, "_" + ++n);
    }
    return unique;
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // exclude / include helpers
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  function additionalIgnoredDecls(parsed, options) {
    var topLevel = topLevelDeclsAndRefs(parsed),
        ignoreDecls = [];
    for (var i = 0; i < topLevel.scope.varDecls.length; i++) {
      var decl = topLevel.scope.varDecls[i],
          path = lively_lang.Path(topLevel.scope.varDeclPaths[i]),
          parent = path.slice(0, -1).get(parsed);
      if (parent.type === "ForStatement" || parent.type === "ForInStatement" || parent.type === "ForOfStatement" || parent.type === "ExportNamedDeclaration") {
        ignoreDecls.push.apply(ignoreDecls, babelHelpers.toConsumableArray(decl.declarations));
      }
    }

    return topLevel.scope.catches.map(function (ea) {
      return ea.name;
    }).concat(ignoreDecls.map(function (ea) {
      return ea.id.name;
    }));
  }

  function additionalIgnoredRefs(parsed, options) {
    // FIXME rk 2016-05-11: in shouldRefBeCaptured we now also test for import
    // decls, this should somehow be consolidated with this function and with the
    // fact that naming based ignores aren't good enough...
    var topLevel = topLevelDeclsAndRefs(parsed);

    var ignoreDecls = [];
    for (var i = 0; i < topLevel.scope.varDecls.length; i++) {
      var decl = topLevel.scope.varDecls[i],
          path = lively_lang.Path(topLevel.scope.varDeclPaths[i]),
          parent = path.slice(0, -1).get(parsed);
      if (parent.type === "ForStatement" || parent.type === "ForInStatement" || parent.type === "ForOfStatement" || parent.type === "ExportNamedDeclaration") {
        ignoreDecls.push.apply(ignoreDecls, babelHelpers.toConsumableArray(decl.declarations));
      }
    }

    var ignoredImportAndExportNames = [];
    for (var i = 0; i < parsed.body.length; i++) {
      var stmt = parsed.body[i];
      if (!options.es6ImportFuncId && stmt.type === "ImportDeclaration") {
        ignoredImportAndExportNames.push.apply(ignoredImportAndExportNames, babelHelpers.toConsumableArray(stmt.specifiers.filter(function (ea) {
          return ea.type === "ImportSpecifier";
        }).map(function (ea) {
          return ea.imported.name;
        })));
      } else if (!options.es6ExportFuncId && (stmt.type === "ExportNamedDeclaration" || stmt.type === "ExportDefaultDeclaration") && stmt.specifiers) {
        ignoredImportAndExportNames.push.apply(ignoredImportAndExportNames, babelHelpers.toConsumableArray(stmt.specifiers.map(function (specifier) {
          return specifier.local.name;
        })));
      }
    }

    return [].concat(topLevel.scope.catches.map(function (ea) {
      return ea.name;
    })).concat(ignoredImportAndExportNames).concat(ignoreDecls.map(function (ea) {
      return ea.id.name;
    }));
  }

  function shouldDeclBeCaptured(decl, options) {
    return options.excludeDecls.indexOf(decl.id.name) === -1 && (!options.includeDecls || options.includeDecls.indexOf(decl.id.name) > -1);
  }

  function shouldRefBeCaptured(ref, toplevel, options) {
    return toplevel.scope.importDecls.indexOf(ref) === -1 && lively_lang.arr.flatmap(toplevel.scope.exportDecls, function (ea) {
      return ea.declarations ? ea.declarations : ea.declaration ? [ea.declaration] : [];
    }).indexOf(ref) === -1 && options.excludeRefs.indexOf(ref.name) === -1 && (!options.includeRefs || options.includeRefs.indexOf(ref.name) !== -1);
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // capturing specific code
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  function insertCapturesForExportDeclarations(parsed, options) {
    var body = [];
    for (var i = 0; i < parsed.body.length; i++) {
      var stmt = parsed.body[i];
      body.push(stmt);
      // ExportNamedDeclaration can have specifieres = refs, those should already
      // be captured. Only focus on export declarations and only those
      // declarations that are no refs, i.e.
      // ignore: "export default x;"
      // capture: "export default function foo () {};", "export var x = 23, y = 3;"
      if (stmt.type !== "ExportNamedDeclaration" && stmt.type !== "ExportDefaultDeclaration" || !stmt.declaration) {
        /*...*/
      } else if (stmt.declaration.declarations) {
          body.push.apply(body, babelHelpers.toConsumableArray(stmt.declaration.declarations.map(function (decl) {
            return assignExpr(options.captureObj, decl.id, decl.id, false);
          })));
        } else if (stmt.declaration.type === "FunctionDeclaration") {
          /*handled by function rewriter as last step*/
        } else if (stmt.declaration.type === "ClassDeclaration") {
            body.push(assignExpr(options.captureObj, stmt.declaration.id, stmt.declaration.id, false));
          }
    }
    parsed.body = body;
    return parsed;
  }

  function insertCapturesForImportDeclarations(parsed, options) {
    parsed.body = parsed.body.reduce(function (stmts, stmt) {
      return stmts.concat(stmt.type !== "ImportDeclaration" || !stmt.specifiers.length ? [stmt] : [stmt].concat(stmt.specifiers.map(function (specifier) {
        return assignExpr(options.captureObj, specifier.local, specifier.local, false);
      })));
    }, []);
    return parsed;
  }

  function insertDeclarationsForExports(parsed, options) {
    var topLevel = topLevelDeclsAndRefs(parsed),
        body = [];
    for (var i = 0; i < parsed.body.length; i++) {
      var stmt = parsed.body[i];
      if (stmt.type === "ExportDefaultDeclaration" && stmt.declaration && stmt.declaration.type.indexOf("Declaration") === -1) {
        body = body.concat([varDeclOrAssignment(parsed, {
          type: "VariableDeclarator",
          id: stmt.declaration,
          init: member(options.captureObj, stmt.declaration)
        }), stmt]);
      } else if (stmt.type !== "ExportNamedDeclaration" || !stmt.specifiers.length || stmt.source) {
        body.push(stmt);
      } else {
        body = body.concat(stmt.specifiers.map(function (specifier) {
          return lively_lang.arr.include(topLevel.declaredNames, specifier.local.name) ? null : varDeclOrAssignment(parsed, {
            type: "VariableDeclarator",
            id: specifier.local,
            init: member(options.captureObj, specifier.local)
          });
        }).filter(Boolean)).concat(stmt);
      }
    }

    parsed.body = body;
    return parsed;
  }

  function fixDefaultAsyncFunctionExportForRegeneratorBug(parsed, options) {
    // rk 2016-06-02: see https://github.com/LivelyKernel/lively.modules/issues/9
    // FIXME this needs to be removed as soon as the cause for the issue is fixed
    var body = [];
    for (var i = 0; i < parsed.body.length; i++) {
      var stmt = parsed.body[i];
      if (stmt.type === "ExportDefaultDeclaration" && stmt.declaration.type === "FunctionDeclaration" && stmt.declaration.id && stmt.declaration.async) {
        body.push(stmt.declaration);
        stmt.declaration = { type: "Identifier", name: stmt.declaration.id.name };
      }
      body.push(stmt);
    }
    parsed.body = body;
    return parsed;
  }

  function es6ModuleTransforms(parsed, options) {
    parsed.body = parsed.body.reduce(function (stmts, stmt) {
      var nodes;
      if (stmt.type === "ExportNamedDeclaration") {

        if (stmt.source) {
          var key = moduleId = stmt.source;
          nodes = stmt.specifiers.map(function (specifier) {
            return {
              type: "ExpressionStatement",
              expression: exportFromImport({ type: "Literal", value: specifier.exported.name }, { type: "Literal", value: specifier.local.name }, moduleId, options.moduleExportFunc, options.moduleImportFunc) };
          });
        } else if (stmt.declaration) {
          var decls = stmt.declaration.declarations;
          if (!decls) {
            // func decl or class
            nodes = [stmt.declaration].concat(exportCallStmt(options.moduleExportFunc, stmt.declaration.id.name, stmt.declaration.id));
          } else {
            nodes = decls.map(function (decl) {
              options.excludeRefs.push(decl.id);
              options.excludeDecls.push(decl.id);
              return varDecl(decl.id, assignExpr(options.captureObj, decl.id, options.declarationWrapper ? funcCall(options.declarationWrapper, literal(decl.id.name), literal(stmt.declaration.kind), decl, options.captureObj) : decl.init, false), stmt.declaration.kind);
            }).concat(decls.map(function (decl) {
              return exportCallStmt(options.moduleExportFunc, decl.id.name, decl.id);
            }));
          }
        } else {
          nodes = stmt.specifiers.map(function (specifier) {
            return exportCallStmt(options.moduleExportFunc, specifier.exported.name, shouldDeclBeCaptured({ id: specifier.local }, options) ? member(options.captureObj, specifier.local) : specifier.local);
          });
        }
      } else if (stmt.type === "ExportDefaultDeclaration") {
        if (stmt.declaration && stmt.declaration.id) {
          nodes = [stmt.declaration].concat(exportCallStmt(options.moduleExportFunc, "default", stmt.declaration.id));
        } else {
          nodes = [exportCallStmt(options.moduleExportFunc, "default", stmt.declaration)];
        }
      } else if (stmt.type === "ExportAllDeclaration") {
        var key = { name: options.es6ExportFuncId + "__iterator__", type: "Identifier" },
            moduleId = stmt.source;
        nodes = [{
          type: "ForInStatement",
          body: { type: "ExpressionStatement", expression: exportFromImport(key, key, moduleId, options.moduleExportFunc, options.moduleImportFunc) },
          left: { type: "VariableDeclaration", kind: "var", declarations: [{ type: "VariableDeclarator", id: key, init: null }] },
          right: importCall(null, moduleId, options.moduleImportFunc)
        }];
        options.excludeRefs.push(key.name);
        options.excludeDecls.push(key.name);
      } else if (stmt.type === "ImportDeclaration") {
        nodes = stmt.specifiers.length ? stmt.specifiers.map(function (specifier) {
          var local = specifier.local,
              imported = specifier.type === "ImportSpecifier" && specifier.imported.name || specifier.type === "ImportDefaultSpecifier" && "default" || null;
          return varDeclAndImportCall(parsed, local, imported || null, stmt.source, options.moduleImportFunc);
        }) : importCallStmt(null, stmt.source, options.moduleImportFunc);
      } else nodes = [stmt];
      return stmts.concat(nodes);
    }, []);

    return parsed;
  }

  function putFunctionDeclsInFront(parsed, options) {
    var scope = topLevelDeclsAndRefs(parsed).scope,
        funcDecls = scope.funcDecls;
    if (!funcDecls.length) return parsed;

    var putInFront = [];

    for (var i = funcDecls.length; i--;) {
      var decl = funcDecls[i];
      if (!shouldDeclBeCaptured(decl, options)) continue;

      var parentPath = scope.funcDeclPaths[i].slice(0, -1),

      // ge the parent so we can replace the original function:
      parent = lively_lang.Path(parentPath).get(scope.node),
          funcId = { type: "Identifier", name: decl.id.name },

      // what we capture:
      init = options.declarationWrapper ? funcCall(options.declarationWrapper, literal(funcId.name), literal("function"), funcId, options.captureObj) : funcId,
          declFront = Object.assign({}, decl);

      if (Array.isArray(parent)) {
        // If the parent is a body array we remove the original func decl from it
        // and replace it with a reference to the function
        parent.splice(parent.indexOf(decl), 1, exprStmt(decl.id));
      } else if (parent.type === "ExportNamedDeclaration") {
        // If the function is exported we change the export declaration into a reference
        var parentIndexInBody = scope.node.body.indexOf(parent);
        if (parentIndexInBody > -1) {
          scope.node.body.splice(parentIndexInBody, 1, { type: "ExportNamedDeclaration", specifiers: [{ type: "ExportSpecifier", exported: decl.id, local: decl.id }] });
        }
      } else if (parent.type === "ExportDefaultDeclaration") {
        parent.declaration = decl.id;
      } else {}
      // ??? just leave it alone...
      // decl.type = "EmptyStatement";


      // hoist the function to the front, also it's capture
      putInFront.unshift(assignExpr(options.captureObj, funcId, init, false));
      putInFront.unshift(declFront);
    }
    parsed.body = putInFront.concat(parsed.body);
    return parsed;
  }

  function computeDefRanges(parsed, options) {
    var topLevel = topLevelDeclsAndRefs(parsed);
    return lively_lang.chain(topLevel.scope.varDecls).pluck("declarations").flatten().value().concat(topLevel.scope.funcDecls).reduce(function (defs, decl) {
      if (!defs[decl.id.name]) defs[decl.id.name] = [];
      defs[decl.id.name].push({ type: decl.type, start: decl.start, end: decl.end });
      return defs;
    }, {});
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // capturing oobject patters / destructuring
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  var annotationSym = Symbol("lively.ast-destructuring-transform");

  function transformPattern(pattern, transformState) {
    // For transforming destructuring expressions into plain vars and member access.
    // Takes a var or argument pattern node (of type ArrayPattern or
    // ObjectPattern) and transforms it into a set of var declarations that will
    // "pull out" the nested properties
    // Example:
    // var parsed = ast.parse("var [{b: {c: [a]}}] = foo;");
    // var state = {parent: {type: "Identifier", name: "arg"}, declaredNames: ["foo"]}
    // transformPattern(parsed.body[0].declarations[0].id, state).map(ast.stringify).join("\n");
    // // => "var arg$0 = arg[0];\n"
    // //  + "var arg$0$b = arg$0.b;\n"
    // //  + "var arg$0$b$c = arg$0$b.c;\n"
    // //  + "var a = arg$0$b$c[0];"
    if (pattern.type === "ArrayPattern") {
      return transformArrayPattern(pattern, transformState);
    } else if (pattern.type === "ObjectPattern") {
      return transformObjectPattern(pattern, transformState);
    } else {
      return [];
    }
  }

  function transformArrayPattern(pattern, transformState) {
    var declaredNames = transformState.declaredNames,
        p = annotationSym;
    return lively_lang.arr.flatmap(pattern.elements, function (el, i) {

      // like [a]
      if (el.type === "Identifier") {
        return [merge(varDecl(el, member(transformState.parent, id(i), true)), babelHelpers.defineProperty({}, p, { capture: true }))];

        // like [...foo]
      } else if (el.type === "RestElement") {
          return [merge(varDecl(el.argument, {
            type: "CallExpression",
            arguments: [{ type: "Literal", value: i }],
            callee: member(transformState.parent, id("slice"), false) }), babelHelpers.defineProperty({}, p, { capture: true }))];

          // like [{x}]
        } else {
            var helperVarId = id(generateUniqueName(declaredNames, transformState.parent.name + "$" + i)),
                helperVar = merge(varDecl(helperVarId, member(transformState.parent, i)), babelHelpers.defineProperty({}, p, { capture: true }));
            declaredNames.push(helperVarId.name);
            return [helperVar].concat(transformPattern(el, { parent: helperVarId, declaredNames: declaredNames }));
          }
    });
  }

  function transformObjectPattern(pattern, transformState) {
    var declaredNames = transformState.declaredNames,
        p = annotationSym;
    return lively_lang.arr.flatmap(pattern.properties, function (prop) {

      // like {x: y}
      if (prop.value.type == "Identifier") {
        return [merge(varDecl(prop.value, member(transformState.parent, prop.key)), babelHelpers.defineProperty({}, p, { capture: true }))];

        // like {x: {z}} or {x: [a]}
      } else {
          var helperVarId = id(generateUniqueName(declaredNames, transformState.parent.name + "$" + prop.key.name)),
              helperVar = merge(varDecl(helperVarId, member(transformState.parent, prop.key)), babelHelpers.defineProperty({}, p, { capture: false }));
          declaredNames.push(helperVarId.name);
          return [helperVar].concat(transformPattern(prop.value, { parent: helperVarId, declaredNames: declaredNames }));
        }
    });
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // code generation helpers
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  function block$1(nodes) {
    return { type: "BlockStatement", body: nodes };
  }

  function varDeclOrAssignment(parsed, declarator, kind) {
    var topLevel = topLevelDeclsAndRefs(parsed),
        name = declarator.id.name;
    return topLevel.declaredNames.indexOf(name) > -1 ?
    // only create a new declaration if necessary
    exprStmt(assign(declarator.id, declarator.init)) : {
      declarations: [declarator],
      kind: kind || "var", type: "VariableDeclaration"
    };
  }

  function assignExpr(assignee, propId, value, computed) {
    return exprStmt(assign(member(assignee, propId, computed), value || id("undefined")));
  }

  function exportFromImport(keyLeft, keyRight, moduleId, moduleExportFunc, moduleImportFunc) {
    return exportCall(moduleExportFunc, keyLeft, importCall(keyRight, moduleId, moduleImportFunc));
  }

  function varDeclAndImportCall(parsed, localId, imported, moduleSource, moduleImportFunc) {
    // return varDeclOrAssignment(parsed, {
    //   type: "VariableDeclarator",
    //   id: localId,
    //   init: importCall(imported, moduleSource, moduleImportFunc)
    // });
    return varDecl(localId, importCall(imported, moduleSource, moduleImportFunc));
  }

  function importCall(imported, moduleSource, moduleImportFunc) {
    if (typeof imported === "string") imported = literal(imported);
    return {
      arguments: [moduleSource].concat(imported || []),
      callee: moduleImportFunc, type: "CallExpression"
    };
  }

  function importCallStmt(imported, moduleSource, moduleImportFunc) {
    return exprStmt(importCall(imported, moduleSource, moduleImportFunc));
  }

  function exportCall(exportFunc, local, exportedObj) {
    if (typeof local === "string") local = literal(local);
    exportedObj = lively_lang.obj.deepCopy(exportedObj);
    return funcCall(exportFunc, local, exportedObj);
  }

  function exportCallStmt(exportFunc, local, exportedObj) {
    return exprStmt(exportCall(exportFunc, local, exportedObj));
  }

var capturing = Object.freeze({
    rewriteToCaptureTopLevelVariables: rewriteToCaptureTopLevelVariables,
    rewriteToRegisterModuleToCaptureSetters: rewriteToRegisterModuleToCaptureSetters
  });

  function getCommentPrecedingNode(parsed, node) {
    var statementPath = statementOf(parsed, node, { asPath: true }),
        blockPath = statementPath.slice(0, -2),
        block = lively_lang.Path(blockPath).get(parsed);

    return !block.comments || !block.comments.length ? null : lively_lang.chain(extractComments(parsed)).reversed().detect(function (ea) {
      return ea.followingNode === node;
    }).value();
  }

  function extractComments(astOrCode, optCode) {
    var parsed = typeof astOrCode === "string" ? parse(astOrCode, { withComments: true }) : astOrCode,
        code = optCode ? optCode : typeof astOrCode === "string" ? astOrCode : stringify(astOrCode),
        parsedComments = lively_lang.arr.sortBy(commentsWithPathsAndNodes(parsed), function (c) {
      return c.comment.start;
    });

    return parsedComments.map(function (c, i) {

      // 1. a method comment like "x: function() {\n//foo\n ...}"?
      if (isInObjectMethod(c)) {
        return lively_lang.obj.merge([c, c.comment, { type: 'method', comment: c.comment.text }, methodAttributesOf(c)]);
      }

      if (isInComputedMethod(c)) {
        return lively_lang.obj.merge([c, c.comment, { type: 'method', comment: c.comment.text }, computedMethodAttributesOf(c)]);
      }

      // 2. function statement comment like "function foo() {\n//foo\n ...}"?
      if (isInFunctionStatement(c)) {
        return lively_lang.obj.merge([c, c.comment, { type: 'function', comment: c.comment.text }, functionAttributesOf(c)]);
      }

      // 3. assigned method like "foo.bar = function(x) {/*comment*/};"
      if (isInAssignedMethod(c)) {
        return lively_lang.obj.merge([c, c.comment, { type: 'method', comment: c.comment.text }, methodAttributesOfAssignment(c)]);
      }

      // 4. comment preceding another node?
      var followingNode = followingNodeOf(c);
      if (!followingNode) return lively_lang.obj.merge([c, c.comment, { followingNode: followingNode }, unknownComment(c)]);

      // is there another comment in front of the node>
      var followingComment = parsedComments[i + 1];
      if (followingComment && followingComment.comment.start <= followingNode.start) return lively_lang.obj.merge([c, c.comment, { followingNode: followingNode }, unknownComment(c)]);

      // 3. an obj var comment like "// foo\nvar obj = {...}"?
      if (isSingleObjVarDeclaration(followingNode)) {
        return lively_lang.obj.merge([c, c.comment, { followingNode: followingNode }, { type: 'object', comment: c.comment.text }, objAttributesOf(followingNode)]);
      }

      // 4. Is it a simple var declaration like "// foo\nvar obj = 23"?
      if (isSingleVarDeclaration(followingNode)) {
        return lively_lang.obj.merge([c, c.comment, { followingNode: followingNode }, { type: 'var', comment: c.comment.text }, objAttributesOf(followingNode)]);
      }

      return lively_lang.obj.merge([c, c.comment, { followingNode: followingNode }, unknownComment(c)]);
    });

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    function commentsWithPathsAndNodes(parsed) {
      var comments = [],
          v = new Visitor();
      v.accept = lively_lang.fun.wrap(v.accept, function (proceed, node, state, path) {
        if (node.comments) {
          lively_lang.arr.pushAll(comments, node.comments.map(function (comment) {
            return { path: path, comment: comment, node: node };
          }));
        }
        return proceed(node, state, path);
      });
      v.accept(parsed, comments, []);
      return comments;
    }

    function followingNodeOf(comment) {
      return lively_lang.arr.detect(comment.node.body, function (node) {
        return node.start > comment.comment.end;
      });
    }

    function unknownComment(comment) {
      return { type: "unknown", comment: comment.comment.text };
    }
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    function isInFunctionStatement(comment) {
      var node = lively_lang.Path(comment.path.slice(0, -1)).get(parsed);
      return node && node.type === "FunctionDeclaration";
    }

    function functionAttributesOf(comment) {
      var funcNode = lively_lang.Path(comment.path.slice(0, -1)).get(parsed),
          name = funcNode.id ? funcNode.id.name : "<error: no name for function>";
      return { name: name, args: lively_lang.arr.pluck(funcNode.params, "name") };
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    function isInObjectMethod(comment) {
      return lively_lang.arr.equals(comment.path.slice(-2), ["value", "body"]); // obj expr
    }

    function isInAssignedMethod(comment) {
      return lively_lang.arr.equals(comment.path.slice(-2), ["right", "body"]); // asignment
    }

    function methodAttributesOf(comment) {
      var methodNode = lively_lang.Path(comment.path.slice(0, -2)).get(parsed),
          name = methodNode.key ? methodNode.key.name : "<error: no name for method>";

      // if it's someting like "var obj = {foo: function() {...}};"
      var p = comment.path.slice(),
          objectName = "<error: no object found for method>";

      while (p.length && lively_lang.arr.last(p) !== 'init') {
        p.pop();
      }if (p.length) {
        objectName = lively_lang.Path(p.slice(0, -1).concat(["id", "name"])).get(parsed);
      }

      // if it's someting like "exports.obj = {foo: function() {...}};"
      if (lively_lang.string.startsWith(objectName, "<error")) {
        p = comment.path.slice();
        while (p.length && lively_lang.arr.last(p) !== 'right') {
          p.pop();
        }if (p.length) {
          var assignNode = lively_lang.Path(p.slice(0, -1).concat(["left"])).get(parsed);
          objectName = code.slice(assignNode.start, assignNode.end);
        }
      }

      // if it's someting like "Object.extend(Foo.prototype, {m: function() {/*some comment*/ return 23; }})"
      if (lively_lang.string.startsWith(objectName, "<error")) {
        p = comment.path.slice();
        var callExpr = lively_lang.Path(p.slice(0, -6)).get(parsed),
            isCall = callExpr && callExpr.type === "CallExpression",
            firstArg = isCall && callExpr.arguments[0];
        if (firstArg) objectName = code.slice(firstArg.start, firstArg.end);
      }

      return {
        name: name,
        args: lively_lang.arr.pluck(methodNode.value.params, "name"),
        objectName: objectName
      };
    }

    function methodAttributesOfAssignment(comment) {

      var node = lively_lang.Path(comment.path.slice(0, -1)).get(parsed);
      if (node.type !== "FunctionExpression" && node.type !== "FunctionDeclaration") return {};

      var statement = statementOf(parsed, node);
      if (statement.type !== "ExpressionStatement" || statement.expression.type !== "AssignmentExpression") return {};

      var objName = code.slice(statement.expression.left.object.start, statement.expression.left.object.end);

      var methodName = code.slice(statement.expression.left.property.start, statement.expression.left.property.end);

      return {
        name: methodName,
        objectName: objName,
        args: lively_lang.arr.pluck(node.params, "name")
      };
    }

    function isInComputedMethod(comment) {
      var path = comment.path.slice(-5);
      lively_lang.arr.removeAt(path, 1);
      return lively_lang.arr.equals(path, ["properties", "value", "callee", "body"]);
    }

    function computedMethodAttributesOf(comment) {
      var name, args, pathToProp;

      pathToProp = comment.path.slice(0, -3);
      var propertyNode = lively_lang.Path(pathToProp).get(parsed);
      if (propertyNode && propertyNode.type === "Property") {
        // if it is a function immediatelly called
        args = lively_lang.arr.pluck(propertyNode.value.callee.params, "name");
        name = propertyNode.key ? propertyNode.key.name : "<error: no name for method>";
      }

      if (!name) {
        // if it is an object member function
        pathToProp = comment.path.slice(0, -2);
        propertyNode = lively_lang.Path(pathToProp).get(parsed);
        if (propertyNode && propertyNode.type === "Property") {
          args = lively_lang.arr.pluck(propertyNode.value.params, "name");
          name = propertyNode.key ? propertyNode.key.name : "<error: no name for method>";
        }
      }

      if (!name) {
        name = "<error: no name for method>";
        args = [];
        pathToProp = comment.path;
      }

      // if it's someting like "var obj = {foo: function() {...}};"
      var p = lively_lang.arr.clone(pathToProp);
      var objectName = "<error: no object found for method>";

      while (p.length && lively_lang.arr.last(p) !== 'init') {
        p.pop();
      }if (p.length) {
        objectName = lively_lang.Path(p.slice(0, -1).concat(["id", "name"])).get(parsed);
      }

      // if it's someting like "exports.obj = {foo: function() {...}};"
      if (lively_lang.string.startsWith(objectName, "<error")) {
        var p = lively_lang.arr.clone(pathToProp);
        while (p.length && lively_lang.arr.last(p) !== 'right') {
          p.pop();
        }if (p.length) {
          var assignNode = lively_lang.Path(p.slice(0, -1).concat(["left"])).get(parsed);
          objectName = code.slice(assignNode.start, assignNode.end);
        }
      }

      // if it's someting like "Object.extend(Foo.prototype, {m: function() {/*some comment*/ return 23; }})"
      if (lively_lang.string.startsWith(objectName, "<error")) {
        var p = lively_lang.arr.clone(pathToProp);
        var callExpr = lively_lang.Path(p.slice(0, -4)).get(parsed),
            isCall = callExpr && callExpr.type === "CallExpression",
            firstArg = isCall && callExpr.arguments[0];
        if (firstArg) objectName = code.slice(firstArg.start, firstArg.end);
      }

      return { name: name, args: args, objectName: objectName };
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    // like "var foo = {/*...*/}" or  "var foo = bar = {/*...*/};"
    function isSingleObjVarDeclaration(node) {
      // should be a var declaration with one declarator with a value
      // being an JS object
      return isSingleVarDeclaration(node) && (node.declarations[0].init.type === "ObjectExpression" || isObjectAssignment(node.declarations[0].init));
    }

    function isSingleVarDeclaration(node) {
      return node && node.type === 'VariableDeclaration' && node.declarations.length === 1;
    }

    function objAttributesOf(node) {
      return { name: node.declarations[0].id.name };
    };

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    // like "foo = {/*...*/}"
    function isObjectAssignment(node) {
      if (node.type !== "AssignmentExpression") return false;
      if (node.right.type === "ObjectExpression") return true;
      if (node.right.type === "AssignmentExpression") return isObjectAssignment(node.right);;
      return false;
    }
  }



  var comments = Object.freeze({
    getCommentPrecedingNode: getCommentPrecedingNode,
    extractComments: extractComments
  });

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // main method
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  function findDecls(parsed, options) {
    // lively.debugNextMethodCall(lively.ast.codeCategorizer, "findDecls")

    options = options || lively_lang.obj.merge({ hideOneLiners: false }, options);

    if (typeof parsed === "string") parsed = parse(parsed, { addSource: true });

    var topLevelNodes = parsed.type === "Program" ? parsed.body : parsed.body.body,
        defs = lively_lang.arr.flatmap(topLevelNodes, function (n) {
      return moduleDef(n, options) || functionWrapper(n, options) || varDefs(n) || funcDef(n) || classDef(n) || es6ClassDef(n) || extendDef(n) || someObjectExpressionCall(n);
    });

    if (options.hideOneLiners && parsed.source) {
      defs = defs.reduce(function (defs, def) {
        if (def.parent && defs.indexOf(def.parent) > -1) defs.push(def);else if ((def.node.source || "").indexOf("\n") > -1) defs.push(def);
        return defs;
      }, []);
    }

    if (options.hideOneLiners && parsed.loc) defs = defs.filter(function (def) {
      return !def.node.loc || def.node.loc.start.line !== def.node.loc.end.line;
      parsed;
    });

    return defs;
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // helpers

  function objectKeyValsAsDefs(objectExpression) {
    return objectExpression.properties.map(function (prop) {
      return {
        name: prop.key.name || prop.key.value,
        type: prop.value.type === "FunctionExpression" ? "method" : "property",
        node: prop
      };
    });
  }

  function classDef(node) {
    if (lively_lang.Path("expression.callee.property.name").get(node) !== "subclass") return null;
    var def = {
      type: "lively-class-definition",
      name: lively_lang.Path("expression.arguments.0.value").get(node),
      node: node
    };
    var props = lively_lang.arr.flatmap(node.expression.arguments, function (argNode) {
      if (argNode.type !== "ObjectExpression") return [];
      return objectKeyValsAsDefs(argNode).map(function (ea) {
        ea.type = "lively-class-instance-" + ea.type;
        ea.parent = def;
        return ea;
      });
    });
    return [def].concat(props);
  }

  function es6ClassDef(node) {
    if (node.type !== "ClassDeclaration") return null;
    var def = {
      type: "class",
      name: node.id.name,
      node: node
    };
    // FIXME need to differentiate between class / instance methods, getters, setters!
    var props = node.body.body.map(function (propNode) {
      if (propNode.type === "MethodDefinition") {
        return {
          type: "class-method",
          parent: def,
          name: propNode.key.name,
          node: propNode
        };
      }
      return null;
    }).filter(function (ea) {
      return !!ea;
    });
    return [def].concat(props);
  }

  function extendDef(node) {
    if (lively_lang.Path("expression.callee.property.name").get(node) !== "extend" || lively_lang.Path("expression.arguments.0.type").get(node) !== "ObjectExpression") return null;
    var name = lively_lang.Path("expression.arguments.0.name").get(node);
    if (!name) return null;
    var def = {
      name: name, node: node,
      type: "lively-extend-definition"
    };
    var props = (objectKeyValsAsDefs(lively_lang.Path("expression.arguments.1").get(node)) || []).map(function (d) {
      d.parent = def;return d;
    });
    return [def].concat(props);
  }

  function varDefs(node) {
    if (node.type !== "VariableDeclaration") return null;
    return lively_lang.arr.flatmap(withVarDeclIds(node), function (ea) {
      return lively_lang.arr.flatmap(ea.ids, function (id) {
        var def = { name: id.name, node: ea.node, type: "var-decl" };
        if (!def.node.init) return [def];
        var node = def.node.init;
        while (node.type === "AssignmentExpression") {
          node = node.right;
        }if (node.type === "ObjectExpression") {
          return [def].concat(objectKeyValsAsDefs(node).map(function (ea) {
            ea.type = "object-" + ea.type;ea.parent = def;return ea;
          }));
        }
        var objDefs = someObjectExpressionCall(node);
        if (objDefs) return [def].concat(objDefs.map(function (d) {
          d.parent = def;return d;
        }));
        return [def];
      });
    });
  }

  function funcDef(node) {
    if (node.type !== "FunctionStatement" && node.type !== "FunctionDeclaration") return null;
    return [{
      name: node.id.name,
      node: node,
      type: "function-decl"
    }];
  }

  function someObjectExpressionCall(node) {
    if (node.type === "ExpressionStatement") node = node.expression;
    if (node.type !== "CallExpression") return null;
    var objArg = node.arguments.detect(function (a) {
      return a.type === "ObjectExpression";
    });
    if (!objArg) return null;
    return objectKeyValsAsDefs(objArg);
  }

  function moduleDef(node, options) {
    if (!isModuleDeclaration(node)) return null;
    var decls = findDecls(lively_lang.Path("expression.arguments.0").get(node), options),
        parent = { node: node, name: lively_lang.Path("expression.callee.object.callee.object.arguments.0.value").get(node) };
    decls.forEach(function (decl) {
      return decl.parent = parent;
    });
    return decls;
  }

  function functionWrapper(node, options) {
    if (!isFunctionWrapper(node)) return null;
    var decls;
    // Is it a function wrapper passed as arg?
    // like ;(function(run) {... })(function(exports) {...})     
    var argFunc = lively_lang.Path("expression.arguments.0").get(node);
    if (argFunc && argFunc.type === "FunctionExpression" && lively_lang.string.lines(argFunc.source || "").length > 5) {
      // lively.debugNextMethodCall(lively.ast.CodeCategorizer, "findDecls");
      decls = findDecls(argFunc, options);
    } else {
      decls = findDecls(lively_lang.Path("expression.callee").get(node), options);
    }
    var parent = { node: node, name: lively_lang.Path("expression.callee.id.name").get(node) };
    decls.forEach(function (decl) {
      return decl.parent || (decl.parent = parent);
    });
    return decls;
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  function isModuleDeclaration(node) {
    return lively_lang.Path("expression.callee.object.callee.object.callee.name").get(node) === "module" && lively_lang.Path("expression.callee.property.name").get(node) === "toRun";
  }

  function isFunctionWrapper(node) {
    return lively_lang.Path("expression.type").get(node) === "CallExpression" && lively_lang.Path("expression.callee.type").get(node) === "FunctionExpression";
  }

  function declIds(idNodes) {
    return lively_lang.arr.flatmap(idNodes, function (ea) {
      if (!ea) return [];
      if (ea.type === "Identifier") return [ea];
      if (ea.type === "RestElement") return [ea.argument];
      if (ea.type === "ObjectPattern") return declIds(lively_lang.arr.pluck(ea.properties, "value"));
      if (ea.type === "ArrayPattern") return declIds(ea.elements);
      return [];
    });
  }

  function withVarDeclIds(varNode) {
    return varNode.declarations.map(function (declNode) {
      if (!declNode.source && declNode.init) declNode.source = declNode.id.name + " = " + declNode.init.source;
      return { node: declNode, ids: declIds([declNode.id]) };
    });
  }

var categorizer = Object.freeze({
    findDecls: findDecls
  });

  exports.withMozillaAstDo = withMozillaAstDo;
  exports.printAst = printAst;
  exports.compareAst = compareAst;
  exports.pathToNode = pathToNode;
  exports.rematchAstWithSource = rematchAstWithSource;
  exports.parse = parse;
  exports.parseFunction = parseFunction;
  exports.fuzzyParse = fuzzyParse;
  exports.escodegen = es;
  exports.acorn = acorn;
  exports.query = query;
  exports.transform = transform;
  exports.capturing = capturing;
  exports.comments = comments;
  exports.categorizer = categorizer;
  exports.stringify = stringify;
  exports.nodes = nodes;

}((this.lively.ast = this.lively.ast || {}),lively.lang,GLOBAL.escodegen,acorn));
  }).call(GLOBAL);
  if (typeof module !== "undefined" && module.exports) module.exports = GLOBAL.lively.ast;
})();

(function() {
  var GLOBAL = typeof window !== "undefined" ? window :
      typeof global!=="undefined" ? global :
        typeof self!=="undefined" ? self : this;
  this.lively = this.lively || {};
(function (exports,lively_lang,lively_ast) {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  var asyncToGenerator = function (fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              return step("next", value);
            }, function (err) {
              return step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  var get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  // helper
  function signatureOf(name, func) {
    var source = String(func),
        match = source.match(/function\s*[a-zA-Z0-9_$]*\s*\(([^\)]*)\)/),
        params = match && match[1] || '';
    return name + '(' + params + ')';
  }

  function pluck(list, prop) {
    return list.map(function (ea) {
      return ea[prop];
    });
  }

  function getObjectForCompletion(evalFunc, stringToEval) {
    var startLetters = '';
    return Promise.resolve().then(function () {
      // thenDo = function(err, obj, startLetters)
      var idx = stringToEval.lastIndexOf('.');
      if (idx >= 0) {
        startLetters = stringToEval.slice(idx + 1);
        stringToEval = stringToEval.slice(0, idx);
      } else {
        startLetters = stringToEval;
        stringToEval = '(typeof window === "undefined" ? global : window)';
      }
      return evalFunc(stringToEval);
    }).then(function (evalResult) {
      return {
        evalResult: evalResult,
        startLetters: startLetters,
        code: stringToEval
      };
    });
  }

  var knownSymbols = function () {
    return Object.getOwnPropertyNames(Symbol).filter(function (ea) {
      return _typeof(Symbol[ea]) === "symbol";
    }).reduce(function (map, ea) {
      return map.set(Symbol[ea], "Symbol." + ea);
    }, new Map());
  }();

  var symMatcher = /^Symbol\((.*)\)$/;

  function printSymbolForCompletion(sym) {
    if (Symbol.keyFor(sym)) return 'Symbol.for("' + Symbol.keyFor(sym) + '")';
    if (knownSymbols.get(sym)) return knownSymbols.get(sym);
    var matched = String(sym).match(symMatcher);
    return String(sym);
  }
  function propertyExtract(excludes, obj, extractor) {
    return Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj).map(printSymbolForCompletion)).filter(function (key) {
      return excludes.indexOf(key) === -1;
    }).map(extractor).filter(function (ea) {
      return !!ea;
    }).sort(function (a, b) {
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
  }

  function getMethodsOf(excludes, obj) {
    return propertyExtract(excludes, obj, function (key) {
      if (obj.__lookupGetter__ && obj.__lookupGetter__(key) || typeof obj[key] !== 'function') return null;
      return { name: key, completion: signatureOf(key, obj[key]) };
    });
  }

  function getAttributesOf(excludes, obj) {
    return propertyExtract(excludes, obj, function (key) {
      if (obj.__lookupGetter__ && !obj.__lookupGetter__(key) && typeof obj[key] === 'function') return null;
      return { name: key, completion: key };
    });
  }

  function getProtoChain(obj) {
    var protos = [],
        proto = obj;
    while (obj) {
      protos.push(obj);obj = obj.__proto__;
    }
    return protos;
  }

  function getDescriptorOf(originalObj, proto) {
    function shorten(s, len) {
      if (s.length > len) s = s.slice(0, len) + '...';
      return s.replace(/\n/g, '').replace(/\s+/g, ' ');
    }

    if (originalObj === proto) {
      if (typeof originalObj !== 'function') return shorten(originalObj.toString ? originalObj.toString() : "[some object]", 50);
      var funcString = originalObj.toString(),
          body = shorten(funcString.slice(funcString.indexOf('{') + 1, funcString.lastIndexOf('}')), 50);
      return signatureOf(originalObj.displayName || originalObj.name || 'function', originalObj) + ' {' + body + '}';
    }

    var klass = proto.hasOwnProperty('constructor') && proto.constructor;
    if (!klass) return 'prototype';
    if (typeof klass.type === 'string' && klass.type.length) return shorten(klass.type, 50);
    if (typeof klass.name === 'string' && klass.name.length) return shorten(klass.name, 50);
    return "anonymous class";
  }

  function descriptorsOfObjAndProtoProperties(obj) {
    var excludes = [],
        completions = getProtoChain(obj).map(function (proto) {
      var descr = getDescriptorOf(obj, proto),
          methodsAndAttributes = getMethodsOf(excludes, proto).concat(getAttributesOf(excludes, proto));
      excludes = excludes.concat(pluck(methodsAndAttributes, 'name'));
      return [descr, pluck(methodsAndAttributes, 'completion')];
    });
    return completions;
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // the main deal
  function getCompletions(evalFunc, string, thenDo) {
    // thendo = function(err, completions/*ARRAY*/)
    // eval string and for the resulting object find attributes and methods,
    // grouped by its prototype / class chain
    // if string is something like "foo().bar.baz" then treat "baz" as start
    // letters = filter for properties of foo().bar
    // ("foo().bar.baz." for props of the result of the complete string)
    var promise = getObjectForCompletion(evalFunc, string).then(function (evalResultAndStartLetters) {
      var evalResult = evalResultAndStartLetters.evalResult,
          value = evalResult && evalResult.isEvalResult ? evalResult.value : evalResult,
          result = {
        completions: descriptorsOfObjAndProtoProperties(value),
        startLetters: evalResultAndStartLetters.startLetters,
        code: evalResultAndStartLetters.code
      };

      if (evalResult && evalResult.isPromise) {
        if (evalResult.promiseStatus === "fulfilled") result.promiseResolvedCompletions = descriptorsOfObjAndProtoProperties(evalResult.promisedValue);else if (evalResult.promiseStatus === "rejected") result.promiseRejectedCompletions = descriptorsOfObjAndProtoProperties(evalResult.promisedValue);
      }
      return result;
    });
    if (typeof thenDo === "function") {
      promise.then(function (result) {
        return thenDo(null, result);
      }).catch(function (err) {
        return thenDo(err);
      });
    }
    return promise;
  }



  var completions = Object.freeze({
    getCompletions: getCompletions
  });

  var initializerTemplate = "(function CLASS(){\n  var firstArg = arguments[0];\n  if (firstArg && firstArg[Symbol.for(\"lively-instance-restorer\")]) {\n    // for deserializing instances just do nothing\n  } else {\n    // automatically call the initialize method\n    this[Symbol.for(\"lively-instance-initialize\")].apply(this, arguments);\n  }\n})";

  var initializeSymbol = Symbol.for("lively-instance-initialize");
  var superclassSymbol = Symbol.for("lively-instance-superclass");
  var moduleMetaSymbol = Symbol.for("lively-instance-module-meta");
  var moduleSubscribeToToplevelChangesSym = Symbol.for("lively-klass-changes-subscriber");
  var constructorArgMatcher = /\([^\\)]*\)/;

  var defaultPropertyDescriptorForGetterSetter = {
    enumerable: false,
    configurable: true
  };

  var defaultPropertyDescriptorForValue = {
    enumerable: false,
    configurable: true,
    writable: true
  };

  function createClass$1(name) {
    if (!name) name = "anonymous_class";
    var constructor = eval(initializerTemplate.replace(/CLASS/, name));
    constructor.displayName = "class " + name;
    return constructor;
  }

  function setSuperclass(klass, superclassOrSpec) {
    // define klass.prototype, klass.prototype[constructor], klass[superclassSymbol]
    var superclass = !superclassOrSpec ? Object : typeof superclassOrSpec === "function" ? superclassOrSpec : superclassOrSpec.value ? superclassOrSpec.value : Object;
    var existingSuperclass = klass && klass[superclassSymbol];
    // set the superclass if necessary and set prototype
    if (!existingSuperclass || existingSuperclass !== superclass) {
      ensureInitializeStub(superclass);
      klass[superclassSymbol] = superclass;
      klass.prototype = Object.create(superclass.prototype);
      klass.prototype.constructor = klass;
    }
    return superclass;
  }

  function addMethods(klass, instanceMethods, classMethods) {
    // install methods from two lists (static + instance) of {key, value} or
    // {key, get/set} descriptors
    classMethods && classMethods.forEach(function (ea) {
      var descr = ea.value ? defaultPropertyDescriptorForValue : defaultPropertyDescriptorForGetterSetter;
      Object.defineProperty(klass, ea.key, Object.assign(ea, descr));
      if (typeof ea.value === "function") klass[ea.key].displayName = ea.key;
    });

    instanceMethods && instanceMethods.forEach(function (ea) {
      var descr = ea.value ? defaultPropertyDescriptorForValue : defaultPropertyDescriptorForGetterSetter;
      Object.defineProperty(klass.prototype, ea.key, Object.assign(ea, descr));
      if (typeof ea.value === "function") klass.prototype[ea.key].displayName = ea.key;
    });

    // 4. define initializer method, in our class system the constructor is always
    // as defined in initializerTemplate and re-directs to the initializer method.
    // This way we can change the constructor without loosing the identity of the
    // class
    if (!klass.prototype[initializeSymbol]) {
      Object.defineProperty(klass.prototype, initializeSymbol, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function value() {}
      });
      klass.prototype[initializeSymbol].displayName = "lively-initialize";
    }
  }

  function ensureInitializeStub(superclass) {
    // when we inherit from "conventional classes" those don't have an
    // initializer method. We install a stub that calls the superclass function
    // itself
    if (superclass === Object || superclass.prototype[initializeSymbol]) return;
    Object.defineProperty(superclass.prototype, initializeSymbol, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function value() /*args*/{
        superclass.apply(this, arguments);
      }
    });
    superclass.prototype[initializeSymbol].displayName = "lively-initialize-stub";
  }

  function createOrExtend(name, superclassSpec) {
    var instanceMethods = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
    var classMethods = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];
    var classHolder = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
    var currentModule = arguments[5];

    // Given a `classHolder` object as "environment", will try to find a "class"
    // (JS constructor function) inside it. If no class is found it will create a
    // new costructor function object and will attach the methods to it. If a class
    // is found it will be modified.
    // This is being used as the compile target for es6 class syntax by the
    // lively.ast capturing / transform logic
    // Example:
    // var Foo = createOrExtend({}, function Foo() {}, "Foo", [{key: "m", value: function m() { return 23 }}]);
    // new Foo().m() // => 23

    // 1. create a new constructor function if necessary, re-use an exisiting if the
    // classHolder object has it
    var klass = name && classHolder.hasOwnProperty(name) && classHolder[name],
        existingSuperclass = klass && klass[superclassSymbol];
    if (!klass || typeof klass !== "function" || !existingSuperclass) klass = createClass$1(name);

    // 2. set the superclass if necessary and set prototype
    var superclass = setSuperclass(klass, superclassSpec);

    // 3. Install methods
    addMethods(klass, instanceMethods, classMethods);

    // 4. If we have a `currentModule` instance (from lively.modules/src/module.js)
    // then we also store some meta data about the module. This allows us to
    // (de)serialize class instances in lively.serializer
    if (currentModule) {
      var p = currentModule.package();
      klass[moduleMetaSymbol] = {
        package: p ? { name: p.name, version: p.version } : {},
        pathInPackage: currentModule.pathInPackage()
      };

      // if we have a module, we can listen to toplevel changes of it in case the
      // superclass binding changes. With that we can keep our class up-to-date
      // even if the superclass binding changes. This is especially useful for
      // situations where modules have a circular dependency and classes in modules
      // won't get defined correctly when loaded first. See
      // https://github.com/LivelyKernel/lively.modules/issues/27 for more details
      if (superclassSpec && superclassSpec.referencedAs) {
        if (klass[moduleSubscribeToToplevelChangesSym]) {
          currentModule.unsubscribeFromToplevelDefinitionChanges(klass[moduleSubscribeToToplevelChangesSym]);
        }
        klass[moduleSubscribeToToplevelChangesSym] = currentModule.subscribeToToplevelDefinitionChanges(function (name, val) {
          if (name === superclassSpec.referencedAs) {
            setSuperclass(klass, val);
            addMethods(klass, instanceMethods, classMethods);
          }
        });
      }
    }

    // 6. Add a toString method for the class to allows us to see its constructor arguments
    var init = klass.prototype[initializeSymbol],
        constructorArgs = String(klass.prototype[initializeSymbol]).match(constructorArgMatcher),
        string = "class " + name + " " + (superclass ? "extends " + superclass.name : "") + " {\n" + ("  constructor" + (constructorArgs ? constructorArgs[0] : "()") + " { /*...*/ }") + "\n}";
    klass.toString = function () {
      return string;
    };

    return klass;
  }

  var id = lively_ast.nodes.id;
  var literal = lively_ast.nodes.literal;
  var member = lively_ast.nodes.member;
  var defaultDeclarationWrapperName = "lively.capturing-declaration-wrapper";
  var defaultClassToFunctionConverterName = "createOrExtendES6ClassForLively";
  function evalCodeTransform(code, options) {
    // variable declaration and references in the the source code get
    // transformed so that they are bound to `varRecorderName` aren't local
    // state. THis makes it possible to capture eval results, e.g. for
    // inspection, watching and recording changes, workspace vars, and
    // incrementally evaluating var declarations and having values bound later.

    // 1. Allow evaluation of function expressions and object literals
    code = lively_ast.transform.transformSingleExpression(code);
    var parsed = lively_ast.parse(code);

    // 2. capture top level vars into topLevelVarRecorder "environment"

    if (options.topLevelVarRecorder) {

      // capture and wrap logic
      var blacklist = (options.dontTransform || []).concat(["arguments"]),
          undeclaredToTransform = !!options.recordGlobals ? null /*all*/ : lively_lang.arr.withoutAll(Object.keys(options.topLevelVarRecorder), blacklist),
          varRecorder = id(options.varRecorderName || '__lvVarRecorder'),
          es6ClassToFunctionOptions = undefined,
          declarationWrapperName = options.declarationWrapperName || defaultDeclarationWrapperName;

      if (options.keepPreviouslyDeclaredValues) {
        // 2.1 declare a function that should wrap all definitions, i.e. all var
        // decls, functions, classes etc that get captured will be wrapped in this
        // function. When using this with the option.keepPreviouslyDeclaredValues
        // we will use a wrapping function that keeps the identity of prevously
        // defined objects
        options.declarationWrapper = member(id(options.varRecorderName), literal(declarationWrapperName), true);
        options.topLevelVarRecorder[declarationWrapperName] = declarationWrapperForKeepingValues;

        // Class declarations and expressions are converted into a function call
        // to `createOrExtendClass`, a helper that will produce (or extend an
        // existing) constructor function in a way that allows us to redefine
        // methods and properties of the class while keeping the class object
        // identical
        options.topLevelVarRecorder[defaultClassToFunctionConverterName] = createOrExtend;
        es6ClassToFunctionOptions = {
          currentModuleAccessor: options.currentModuleAccessor,
          classHolder: varRecorder,
          functionNode: member(varRecorder, defaultClassToFunctionConverterName),
          declarationWrapper: options.declarationWrapper
        };
      }

      // 2.2 Here we call out to the actual code transformation that installs the

      parsed = lively_ast.capturing.rewriteToCaptureTopLevelVariables(parsed, varRecorder, {
        es6ImportFuncId: options.es6ImportFuncId,
        es6ExportFuncId: options.es6ExportFuncId,
        ignoreUndeclaredExcept: undeclaredToTransform,
        exclude: blacklist,
        declarationWrapper: options.declarationWrapper || undefined,
        classToFunction: es6ClassToFunctionOptions
      });
    }

    if (options.wrapInStartEndCall) {
      parsed = lively_ast.transform.wrapInStartEndCall(parsed, {
        startFuncNode: options.startFuncNode,
        endFuncNode: options.endFuncNode
      });
    }

    var result = lively_ast.stringify(parsed);

    if (options.sourceURL) result += "\n//# sourceURL=" + options.sourceURL.replace(/\s/g, "_");

    return result;
  }

  function evalCodeTransformOfSystemRegisterSetters(code, options) {
    if (!options.topLevelVarRecorder) return code;

    var parsed = lively_ast.parse(code),
        blacklist = (options.dontTransform || []).concat(["arguments"]),
        undeclaredToTransform = !!options.recordGlobals ? null /*all*/ : lively_lang.arr.withoutAll(Object.keys(options.topLevelVarRecorder), blacklist),
        result = lively_ast.capturing.rewriteToRegisterModuleToCaptureSetters(parsed, id(options.varRecorderName || '__lvVarRecorder'), { exclude: blacklist });

    return lively_ast.stringify(result);
  }

  function declarationWrapperForKeepingValues(name, kind, value, recorder) {
    // show(`declaring ${name}, a ${kind}, value ${value}`);

    if (kind === "function") return value;
    if (kind === "class") {
      recorder[name] = value;
      return value;
    }

    // if (!value || typeof value !== "object" || Array.isArray(value) || value.constructor === RegExp)
    //   return value;

    // if (recorder.hasOwnProperty(name) && typeof recorder[name] === "object") {
    //   if (Object.isFrozen(recorder[name])) return value;
    //   try {
    //     copyProperties(value, recorder[name]);
    //     return recorder[name];
    //   } catch (e) {
    //     console.error(`declarationWrapperForKeepingValues: could not copy properties for object ${name}, won't keep identity of previously defined object!`)
    //     return value;
    //   }
    // }

    return value;
  }

  var defaultTopLevelVarRecorderName = '__lvVarRecorder';
  var startEvalFunctionName = "lively.vm-on-eval-start";
  var endEvalFunctionName = "lively.vm-on-eval-end";
  function _normalizeEvalOptions(opts) {
    if (!opts) opts = {};

    opts = Object.assign({
      targetModule: null,
      sourceURL: opts.targetModule,
      runtime: null,
      context: getGlobal(),
      varRecorderName: defaultTopLevelVarRecorderName,
      dontTransform: [], // blacklist vars
      recordGlobals: null,
      returnPromise: true,
      promiseTimeout: 200,
      waitForPromise: true,
      wrapInStartEndCall: false,
      onStartEval: null,
      onEndEval: null,
      keepPreviouslyDeclaredValues: true
    }, opts);

    if (opts.targetModule) {
      var moduleEnv = opts.runtime && opts.runtime.modules && opts.runtime.modules[opts.targetModule];
      if (moduleEnv) opts = Object.assign(opts, moduleEnv);
    }

    if (opts.wrapInStartEndCall) {
      opts.startFuncNode = {
        type: "MemberExpression",
        object: { type: "Identifier", name: opts.varRecorderName },
        property: { type: "Literal", value: startEvalFunctionName },
        computed: true
      };
      opts.endFuncNode = {
        type: "MemberExpression",
        object: { type: "Identifier", name: opts.varRecorderName },
        property: { type: "Literal", value: endEvalFunctionName },
        computed: true
      };
    }

    return opts;
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // eval
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  function getGlobal() {
    if (typeof System !== "undefined") return System.global;
    if (typeof window !== "undefined") return window;
    if (typeof global !== "undefined") return global;
    if (typeof Global !== "undefined") return Global;
    return function () {
      return this;
    }();
  }

  function _eval(__lvEvalStatement, __lvVarRecorder /*needed as arg for capturing*/) {
    return eval(__lvEvalStatement);
  }

  function vmRunEval(code, options, thenDo) {
    // The main function where all eval options are configured.
    // options can be: {
    //   runtime: {
    //     modules: {[MODULENAME: PerModuleOptions]}
    //   }
    // }
    // or directly, PerModuleOptions = {
    //   varRecorderName: STRING, // default is '__lvVarRecorder'
    //   topLevelVarRecorder: OBJECT,
    //   context: OBJECT,
    //   sourceURL: STRING,
    //   recordGlobals: BOOLEAN, // also transform free vars? default is false
    //   transpiler: FUNCTION(source, options) // for transforming the source after the lively xfm
    //   wrapInStartEndCall: BOOLEAN
    //   onStartEval: FUNCTION()?,
    //   onEndEval: FUNCTION(err, value)? // note: we pass in the value of last expr, not EvalResult!
    //   keepPreviouslyDeclaredValues: BOOLEAN // maintain the identity of objects that were declared before
    // }

    if (typeof options === 'function' && arguments.length === 2) {
      thenDo = options;options = null;
    }

    var warnings = [],
        result = new EvalResult(),
        returnedError,
        returnedValue,
        onEvalEndError,
        onEvalEndValue,
        onEvalStartCalled = false,
        onEvalEndCalled = false;
    options = _normalizeEvalOptions(options);

    // 1. In case we rewrite the code with on-start and on-end calls we prepare
    // the environment with actual function handlers that will get called once
    // the code is evaluated

    var evalDone = lively_lang.promise.deferred(),
        recorder = options.topLevelVarRecorder || getGlobal();

    if (options.wrapInStartEndCall) {
      if (recorder[startEvalFunctionName]) console.warn("startEvalFunctionName " + startEvalFunctionName + " already exists in recorder!");

      if (recorder[endEvalFunctionName]) console.warn("endEvalFunctionName " + endEvalFunctionName + " already exists in recorder!");

      recorder[startEvalFunctionName] = function () {
        if (onEvalStartCalled) {
          console.warn("onEvalStartCalled multiple times!");return;
        }
        onEvalStartCalled = true;
        if (typeof options.onStartEval === "function") options.onStartEval();
      };

      recorder[endEvalFunctionName] = function (err, value) {
        if (onEvalEndCalled) {
          console.warn("onEvalEndCalled multiple times!");return;
        }
        onEvalEndCalled = true;
        finishEval(err, value, result, options, recorder, evalDone, thenDo);
      };
    }

    // 2. Transform the code to capture top-level variables, inject function calls, ...
    try {
      code = evalCodeTransform(code, options);
      if (options.header) code = options.header + code;
      if (options.footer) code = code + options.footer;
      if (options.transpiler) code = options.transpiler(code, options.transpilerOptions);
      // console.log(code);
    } catch (e) {
      var warning = "lively.vm evalCodeTransform not working: " + (e.stack || e);
      console.warn(warning);
      warnings.push(warning);
    }

    // 3. Now really run eval!
    try {
      typeof $morph !== "undefined" && $morph('log') && ($morph('log').textString = code);
      returnedValue = _eval.call(options.context, code, options.topLevelVarRecorder);
    } catch (e) {
      returnedError = e;
    }

    // 4. Wrapping up: if we inject a on-eval-end call we let it handle the
    // wrap-up, otherwise we firectly call finishEval()
    if (options.wrapInStartEndCall) {
      if (returnedError && !onEvalEndCalled) recorder[endEvalFunctionName](returnedError, undefined);
    } else {
      finishEval(returnedError, returnedError || returnedValue, result, options, recorder, evalDone, thenDo);
    }

    return options.sync ? result : evalDone.promise;
  }

  function finishEval(err, value, result, options, recorder, evalDone, thenDo) {
    // 5. Here we end the evaluation. Note that if we are in sync mode we cannot
    // use any Promise since promises always run on next tick. That's why we have
    // to slightly duplicate the finish logic...

    if (options.wrapInStartEndCall) {
      delete recorder[startEvalFunctionName];
      delete recorder[endEvalFunctionName];
    }

    if (err) {
      result.isError = true;result.value = err;
    } else result.value = value;
    if (result.value instanceof Promise) result.isPromise = true;

    if (options.sync) {
      result.processSync(options);
      if (typeof options.onEndEval === "function") options.onEndEval(err, value);
    } else {
      result.process(options).then(function () {
        typeof thenDo === "function" && thenDo(null, result);
        typeof options.onEndEval === "function" && options.onEndEval(err, value);
        return result;
      }, function (err) {
        typeof thenDo === "function" && thenDo(err, undefined);
        typeof options.onEndEval === "function" && options.onEndEval(err, undefined);
        return result;
      }).then(evalDone.resolve, evalDone.reject);
    }
  }

  function syncEval$1(string, options) {
    // See #runEval for options.
    // Although the defaul eval is synchronous we assume that the general
    // evaluation might not return immediatelly. This makes is possible to
    // change the evaluation backend, e.g. to be a remotely attached runtime
    options = Object.assign(options || {}, { sync: true });
    return vmRunEval(string, options);
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // EvalResult
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  var EvalResult = function () {
    function EvalResult() {
      classCallCheck(this, EvalResult);

      this.isEvalResult = true;
      this.value = undefined;
      this.warnings = [];
      this.isError = false;
      this.isPromise = false;
      this.promisedValue = undefined;
      this.promiseStatus = "unknown";
    }

    createClass(EvalResult, [{
      key: "printed",
      value: function printed(options) {
        this.value = print(this.value, Object.assign(options || {}, {
          isError: this.isError,
          isPromise: this.isPromise,
          promisedValue: this.promisedValue,
          promiseStatus: this.promiseStatus
        }));
      }
    }, {
      key: "processSync",
      value: function processSync(options) {
        if (options.inspect || options.asString) this.value = this.print(this.value, options);
        return this;
      }
    }, {
      key: "process",
      value: function process(options) {
        var result = this;
        if (result.isPromise && options.waitForPromise) {
          return tryToWaitForPromise(result, options.promiseTimeout).then(function () {
            if (options.inspect || options.asString) result.printed(options);
            return result;
          });
        }
        if (options.inspect || options.asString) result.printed(options);
        return Promise.resolve(result);
      }
    }]);
    return EvalResult;
  }();

  function tryToWaitForPromise(evalResult, timeoutMs) {
    console.assert(evalResult.isPromise, "no promise in tryToWaitForPromise???");
    var timeout = {},
        timeoutP = new Promise(function (resolve) {
      return setTimeout(resolve, timeoutMs, timeout);
    });
    return Promise.race([timeoutP, evalResult.value]).then(function (resolved) {
      return Object.assign(evalResult, resolved !== timeout ? { promiseStatus: "fulfilled", promisedValue: resolved } : { promiseStatus: "pending" });
    }).catch(function (rejected) {
      return Object.assign(evalResult, { promiseStatus: "rejected", promisedValue: rejected });
    });
  }

  function print(value, options) {
    if (options.isError || value instanceof Error) return String(value.stack || value);

    if (options.isPromise) {
      var status = lively_lang.string.print(options.promiseStatus),
          printed = options.promiseStatus === "pending" ? undefined : print(options.promisedValue, Object.assign(options || {}, { isPromise: false }));
      return "Promise({status: " + status + ", " + (value === undefined ? "" : "value: " + printed) + "})";
    }

    if (value instanceof Promise) return 'Promise({status: "unknown"})';

    if (options.inspect) return printInspect(value, options);

    // options.asString
    return String(value);
  }

  function printInspect(value, options) {
    var printDepth = options.printDepth || 2,
        customPrintInspect = lively_lang.Path("lively.morphic.printInspect").get(getGlobal()),
        customPrinter = customPrintInspect ? function (val, _) {
      return customPrintInspect(val, printDepth);
    } : undefined;
    return lively_lang.obj.inspect(value, { maxDepth: printDepth, customPrinter: customPrinter });
  }

  // import { moduleEnv } from "lively.modules/src/system.js";
  // import { recordDoitRequest, recordDoitResult } from "lively.modules/src/notify.js";

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // load support

  var ensureImportsAreLoaded = function () {
    var _ref = asyncToGenerator(regeneratorRuntime.mark(function _callee(System, code, parentModule) {
      var body, imports;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // FIXME do we have to do a reparse? We should be able to get the ast from
              // the rewriter...
              body = lively_ast.parse(code).body, imports = body.filter(function (node) {
                return node.type === "ImportDeclaration";
              });
              return _context.abrupt("return", Promise.all(imports.map(function (node) {
                return System.normalize(node.source.value, parentModule).then(function (fullName) {
                  return System.get(fullName) || System.import(fullName);
                });
              })).catch(function (err) {
                console.error("Error ensuring imports: " + err.message);throw err;
              }));

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function ensureImportsAreLoaded(_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // transpiler to make es next work

  var getEs6Transpiler = function () {
    var _ref2 = asyncToGenerator(regeneratorRuntime.mark(function _callee2(System, options, env) {
      var babel, babelPluginPath, babelPath, babelPlugin;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!options.transpiler) {
                _context2.next = 2;
                break;
              }

              return _context2.abrupt("return", Promise.resolve(options.transpiler));

            case 2:
              if (options.es6Transpile) {
                _context2.next = 4;
                break;
              }

              return _context2.abrupt("return", Promise.resolve(null));

            case 4:
              if (!(System.transpiler === "babel")) {
                _context2.next = 12;
                break;
              }

              _context2.t0 = System.global[System.transpiler];

              if (_context2.t0) {
                _context2.next = 10;
                break;
              }

              _context2.next = 9;
              return System.import(System.transpiler);

            case 9:
              _context2.t0 = _context2.sent;

            case 10:
              babel = _context2.t0;
              return _context2.abrupt("return", babelTranspilerForAsyncAwaitCode(System, babel, options.targetModule, env));

            case 12:
              if (!(System.transpiler === "plugin-babel")) {
                _context2.next = 21;
                break;
              }

              _context2.next = 15;
              return System.normalize("plugin-babel");

            case 15:
              babelPluginPath = _context2.sent;
              babelPath = babelPluginPath.split("/").slice(0, -1).concat("systemjs-babel-browser.js").join("/");
              _context2.next = 19;
              return System.import(babelPath);

            case 19:
              babelPlugin = _context2.sent;
              return _context2.abrupt("return", babelPluginTranspilerForAsyncAwaitCode(System, babelPlugin, options.targetModule, env));

            case 21:
              throw new Error("Sorry, currently only babel is supported as es6 transpiler for runEval!");

            case 22:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function getEs6Transpiler(_x4, _x5, _x6) {
      return _ref2.apply(this, arguments);
    };
  }();

  var funcCall = lively_ast.nodes.funcCall;
  var member$1 = lively_ast.nodes.member;
  var literal$1 = lively_ast.nodes.literal;


  function babelTranspilerForAsyncAwaitCode(System, babel, filename, env) {
    // The function wrapper is needed b/c we need toplevel awaits and babel
    // converts "this" => "undefined" for modules
    return function (source, options) {
      options = Object.assign({
        sourceMap: undefined, // 'inline' || true || false
        inputSourceMap: undefined,
        filename: filename,
        code: true,
        ast: false
      }, options);
      var sourceForBabel = "(async function(__rec) {\n" + source + "\n}).call(this);",
          transpiled = babel.transform(sourceForBabel, options).code;
      transpiled = transpiled.replace(/\}\)\.call\(undefined\);$/, "}).call(this)");
      return transpiled;
    };
  }

  function babelPluginTranspilerForAsyncAwaitCode(System, babelWrapper, filename, env) {

    // The function wrapper is needed b/c we need toplevel awaits and babel
    // converts "this" => "undefined" for modules
    return function (source, options) {
      var babelOptions = System.babelOptions || {},
          presets = [];
      presets.push(babelWrapper.presetES2015);
      if (babelOptions.stage3) presets.push({ plugins: babelWrapper.pluginsStage3 });
      if (babelOptions.stage2) presets.push({ plugins: babelWrapper.pluginsStage2 });
      if (babelOptions.stage1) presets.push({ plugins: babelWrapper.pluginsStage1 });

      options = Object.assign({
        sourceMap: undefined, // 'inline' || true || false
        inputSourceMap: undefined,
        filename: filename,
        babelrc: false,
        // plugins: plugins,
        presets: presets,
        moduleIds: false,
        code: true,
        ast: false
      }, options);
      var sourceForBabel = "(async function(__rec) {\n" + source + "\n}).call(this);",
          transpiled = babelWrapper.babel.transform(sourceForBabel, options).code;
      transpiled = transpiled.replace(/\}\)\.call\(undefined\);$/, "}).call(this)");
      return transpiled;
    };
  }

  var runEval$1 = function () {
    var _ref3 = asyncToGenerator(regeneratorRuntime.mark(function _callee3(System, code, options) {
      var originalCode, fullname, env, recorder, recorderName, dontTransform, transpiler, header, result;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              options = lively_lang.obj.merge({
                targetModule: null, parentModule: null,
                parentAddress: null,
                es6Transpile: true,
                transpiler: null, // function with params: source, options
                transpilerOptions: null
              }, options);
              originalCode = code;


              System.debug && console.log("[lively.module] runEval: " + code.slice(0, 100).replace(/\n/mg, " ") + "...");

              _context3.next = 5;
              return System.normalize(options.targetModule || "*scratch*", options.parentModule, options.parentAddress);

            case 5:
              fullname = _context3.sent;

              options.targetModule = fullname;

              _context3.next = 9;
              return System.import(fullname);

            case 9:
              _context3.next = 11;
              return ensureImportsAreLoaded(System, code, fullname);

            case 11:
              env = System.get("@lively-env").moduleEnv(fullname);
              recorder = env.recorder;
              recorderName = env.recorderName;
              dontTransform = env.dontTransform;
              _context3.next = 17;
              return getEs6Transpiler(System, options, env);

            case 17:
              transpiler = _context3.sent;
              header = "var _moduleExport = " + recorderName + "._moduleExport,\n" + ("    _moduleImport = " + recorderName + "._moduleImport;\n");


              code = header + code;
              options = Object.assign({ waitForPromise: true }, options, {
                recordGlobals: true,
                dontTransform: dontTransform,
                varRecorderName: recorderName,
                topLevelVarRecorder: recorder,
                sourceURL: options.sourceURL || options.targetModule,
                context: options.context || recorder,
                wrapInStartEndCall: true, // for async / await eval support
                es6ExportFuncId: "_moduleExport",
                es6ImportFuncId: "_moduleImport",
                transpiler: transpiler,
                currentModuleAccessor: funcCall(member$1(funcCall(member$1("System", "get"), literal$1("@lively-env")), "moduleEnv"), literal$1(options.targetModule))
              });

              System.debug && console.log("[lively.module] runEval in module " + fullname + " started");

              // console.warn("FIX recordDoitRequest")
              // recordDoitRequest(
              //   System, originalCode,
              //   {waitForPromise: options.waitForPromise, targetModule: options.targetModule},
              //   Date.now());

              _context3.next = 24;
              return vmRunEval(code, options);

            case 24:
              result = _context3.sent;


              System.get("@lively-env").evaluationDone(fullname);
              System.debug && console.log("[lively.module] runEval in module " + fullname + " done");
              // console.warn("FIX recordDoitResult")

              // recordDoitResult(
              //   System, originalCode,
              //   {waitForPromise: options.waitForPromise, targetModule: options.targetModule},
              //   result, Date.now());
              return _context3.abrupt("return", result);

            case 28:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function runEval(_x7, _x8, _x9) {
      return _ref3.apply(this, arguments);
    };
  }();

  var _EvalableTextMorphTra;

  var EvalStrategy = function () {
    function EvalStrategy() {
      classCallCheck(this, EvalStrategy);
    }

    createClass(EvalStrategy, [{
      key: "runEval",
      value: function () {
        var _ref = asyncToGenerator(regeneratorRuntime.mark(function _callee(source, options) {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", Promise.reject("runEval(source, options) not yet implemented for " + this.constructor.name));

                case 1:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function runEval(_x, _x2) {
          return _ref.apply(this, arguments);
        }

        return runEval;
      }()
    }, {
      key: "keysOfObject",
      value: function () {
        var _ref2 = asyncToGenerator(regeneratorRuntime.mark(function _callee2(prefix, options) {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  return _context2.abrupt("return", Promise.reject("keysOfObject(prefix, options) not yet implemented for " + this.constructor.name));

                case 1:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function keysOfObject(_x3, _x4) {
          return _ref2.apply(this, arguments);
        }

        return keysOfObject;
      }()
    }]);
    return EvalStrategy;
  }();

  var SimpleEvalStrategy = function (_EvalStrategy) {
    inherits(SimpleEvalStrategy, _EvalStrategy);

    function SimpleEvalStrategy() {
      classCallCheck(this, SimpleEvalStrategy);
      return possibleConstructorReturn(this, Object.getPrototypeOf(SimpleEvalStrategy).apply(this, arguments));
    }

    createClass(SimpleEvalStrategy, [{
      key: "runEval",
      value: function () {
        var _ref3 = asyncToGenerator(regeneratorRuntime.mark(function _callee3(source, options) {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  return _context3.abrupt("return", Promise.resolve().then(function () {
                    try {
                      return Promise.resolve({ value: eval(source) });
                    } catch (err) {
                      return { isError: true, value: err };
                    }
                  }));

                case 1:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        function runEval(_x5, _x6) {
          return _ref3.apply(this, arguments);
        }

        return runEval;
      }()
    }, {
      key: "keysOfObject",
      value: function () {
        var _ref4 = asyncToGenerator(regeneratorRuntime.mark(function _callee4(prefix, options) {
          var _this2 = this;

          var result;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return lively.vm.completions.getCompletions(function (code) {
                    return _this2.runEval(code, options);
                  }, prefix);

                case 2:
                  result = _context4.sent;
                  return _context4.abrupt("return", { completions: result.completions, prefix: result.startLetters });

                case 4:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, this);
        }));

        function keysOfObject(_x7, _x8) {
          return _ref4.apply(this, arguments);
        }

        return keysOfObject;
      }()
    }]);
    return SimpleEvalStrategy;
  }(EvalStrategy);

  var LivelyVmEvalStrategy = function (_EvalStrategy2) {
    inherits(LivelyVmEvalStrategy, _EvalStrategy2);

    function LivelyVmEvalStrategy() {
      classCallCheck(this, LivelyVmEvalStrategy);
      return possibleConstructorReturn(this, Object.getPrototypeOf(LivelyVmEvalStrategy).apply(this, arguments));
    }

    createClass(LivelyVmEvalStrategy, [{
      key: "normalizeOptions",
      value: function normalizeOptions(options) {
        if (!options.targetModule) throw new Error("runEval called but options.targetModule not specified!");

        return Object.assign({
          sourceURL: options.targetModule + "_doit_" + Date.now(),
          keepPreviouslyDeclaredValues: true
        }, options);
      }
    }, {
      key: "runEval",
      value: function () {
        var _ref5 = asyncToGenerator(regeneratorRuntime.mark(function _callee5(source, options) {
          var conf;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  options = this.normalizeOptions(options);
                  conf = { meta: {} };
                  conf.meta[options.targetModule] = { format: "esm" };
                  lively.modules.System.config(conf);
                  return _context5.abrupt("return", lively.vm.runEval(source, options));

                case 5:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, this);
        }));

        function runEval(_x9, _x10) {
          return _ref5.apply(this, arguments);
        }

        return runEval;
      }()
    }, {
      key: "keysOfObject",
      value: function () {
        var _ref6 = asyncToGenerator(regeneratorRuntime.mark(function _callee6(prefix, options) {
          var result;
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  _context6.next = 2;
                  return lively.vm.completions.getCompletions(function (code) {
                    return lively.vm.runEval(code, options);
                  }, prefix);

                case 2:
                  result = _context6.sent;
                  return _context6.abrupt("return", { completions: result.completions, prefix: result.startLetters });

                case 4:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6, this);
        }));

        function keysOfObject(_x11, _x12) {
          return _ref6.apply(this, arguments);
        }

        return keysOfObject;
      }()
    }]);
    return LivelyVmEvalStrategy;
  }(EvalStrategy);

  var HttpEvalStrategy = function (_LivelyVmEvalStrategy) {
    inherits(HttpEvalStrategy, _LivelyVmEvalStrategy);
    createClass(HttpEvalStrategy, null, [{
      key: "defaultURL",
      get: function get() {
        return "http://localhost:3000/lively";
      }
    }]);

    function HttpEvalStrategy(url) {
      classCallCheck(this, HttpEvalStrategy);

      var _this4 = possibleConstructorReturn(this, Object.getPrototypeOf(HttpEvalStrategy).call(this));

      _this4.url = url || _this4.constructor.defaultURL;
      return _this4;
    }

    createClass(HttpEvalStrategy, [{
      key: "normalizeOptions",
      value: function normalizeOptions(options) {
        options = get(Object.getPrototypeOf(HttpEvalStrategy.prototype), "normalizeOptions", this).call(this, options);
        return Object.assign({ serverEvalURL: this.url }, options, { context: null });
      }
    }, {
      key: "sourceForServer",
      value: function sourceForServer(action, arg, options) {
        return "\n(function() {\n  var arg = " + JSON.stringify(arg) + ",\n      options = " + JSON.stringify(options) + ";\n  options.context = System.global;\n  function evalFunction(source, options) {\n    var conf = {meta: {}}; conf.meta[options.targetModule] = {format: \"esm\"};\n    lively.modules.System.config(conf);\n    return lively.vm.runEval(source, options);\n  }\n  function keysOfObjectFunction(prefix, options) {\n    return lively.vm.completions.getCompletions(code => evalFunction(code, options), prefix)\n      .then(result => ({completions: result.completions, prefix: result.startLetters}));\n  }\n  options.asString = " + (action === "eval" ? "true" : "false") + ";\n  return " + (action === "eval" ? "evalFunction" : "keysOfObjectFunction") + "(arg, options)\n    .catch(err => ({isError: true, value: String(err.stack || err)}));\n})();\n";
      }
    }, {
      key: "sendRequest",
      value: function () {
        var _ref7 = asyncToGenerator(regeneratorRuntime.mark(function _callee7(payload, url) {
          var method, content;
          return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  method = "sendRequest" + (System.get("@system-env").node ? "_node" : "_web");
                  _context7.next = 3;
                  return this[method](payload, url);

                case 3:
                  content = _context7.sent;
                  _context7.prev = 4;
                  return _context7.abrupt("return", JSON.parse(content));

                case 8:
                  _context7.prev = 8;
                  _context7.t0 = _context7["catch"](4);
                  return _context7.abrupt("return", { isError: true, value: "Server eval failed: " + content });

                case 11:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7, this, [[4, 8]]);
        }));

        function sendRequest(_x13, _x14) {
          return _ref7.apply(this, arguments);
        }

        return sendRequest;
      }()
    }, {
      key: "sendRequest_web",
      value: function () {
        var _ref8 = asyncToGenerator(regeneratorRuntime.mark(function _callee8(payload, url) {
          var res;
          return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  _context8.prev = 0;
                  _context8.next = 3;
                  return window.fetch(url, payload);

                case 3:
                  res = _context8.sent;
                  _context8.next = 9;
                  break;

                case 6:
                  _context8.prev = 6;
                  _context8.t0 = _context8["catch"](0);
                  throw new Error("Cannot reach server at " + url + ": " + _context8.t0.message);

                case 9:
                  if (res.ok) {
                    _context8.next = 11;
                    break;
                  }

                  throw new Error("Server at " + url + ": " + res.statusText);

                case 11:
                  return _context8.abrupt("return", res.text());

                case 12:
                case "end":
                  return _context8.stop();
              }
            }
          }, _callee8, this, [[0, 6]]);
        }));

        function sendRequest_web(_x15, _x16) {
          return _ref8.apply(this, arguments);
        }

        return sendRequest_web;
      }()
    }, {
      key: "sendRequest_node",
      value: function () {
        var _ref9 = asyncToGenerator(regeneratorRuntime.mark(function _callee9(payload, url) {
          var urlParse, http, opts;
          return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
              switch (_context9.prev = _context9.next) {
                case 0:
                  urlParse = System._nodeRequire("url").parse, http = System._nodeRequire("http"), opts = Object.assign({ method: payload.method || "GET" }, urlParse(url));
                  return _context9.abrupt("return", new Promise(function (resolve, reject) {
                    var request = http.request(opts, function (res) {
                      res.setEncoding('utf8');
                      var data = "";
                      res.on('data', function (chunk) {
                        return data += chunk;
                      });
                      res.on('end', function () {
                        return resolve(data);
                      });
                      res.on('error', function (err) {
                        return reject(err);
                      });
                    });
                    request.on('error', function (err) {
                      return reject(err);
                    });
                    request.end(payload.body);
                  }));

                case 2:
                case "end":
                  return _context9.stop();
              }
            }
          }, _callee9, this);
        }));

        function sendRequest_node(_x17, _x18) {
          return _ref9.apply(this, arguments);
        }

        return sendRequest_node;
      }()
    }, {
      key: "runEval",
      value: function () {
        var _ref10 = asyncToGenerator(regeneratorRuntime.mark(function _callee10(source, options) {
          var payLoad;
          return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  options = this.normalizeOptions(options);
                  payLoad = { method: "POST", body: this.sourceForServer("eval", source, options) };
                  return _context10.abrupt("return", this.sendRequest(payLoad, options.serverEvalURL));

                case 3:
                case "end":
                  return _context10.stop();
              }
            }
          }, _callee10, this);
        }));

        function runEval(_x19, _x20) {
          return _ref10.apply(this, arguments);
        }

        return runEval;
      }()
    }, {
      key: "keysOfObject",
      value: function () {
        var _ref11 = asyncToGenerator(regeneratorRuntime.mark(function _callee11(prefix, options) {
          var payLoad, result;
          return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
              switch (_context11.prev = _context11.next) {
                case 0:
                  options = this.normalizeOptions(options);
                  payLoad = { method: "POST", body: this.sourceForServer("keysOfObject", prefix, options) };
                  _context11.next = 4;
                  return this.sendRequest(payLoad, options.serverEvalURL);

                case 4:
                  result = _context11.sent;

                  if (!result.isError) {
                    _context11.next = 7;
                    break;
                  }

                  throw new Error(result.value);

                case 7:
                  return _context11.abrupt("return", result);

                case 8:
                case "end":
                  return _context11.stop();
              }
            }
          }, _callee11, this);
        }));

        function keysOfObject(_x21, _x22) {
          return _ref11.apply(this, arguments);
        }

        return keysOfObject;
      }()
    }]);
    return HttpEvalStrategy;
  }(LivelyVmEvalStrategy);

  function evalStrategy(morph) {
    return morph.state && morph.state.evalStrategy || new LivelyVmEvalStrategy();
  }

  var EvalableTextMorphTrait = (_EvalableTextMorphTra = {
    applyTo: function applyTo(obj) {
      var overrides = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      var trait = this,
          dontCopy = ["applyTo"].concat(lively.lang.arr.withoutAll(lively.lang.properties.allProperties(obj), overrides));
      Object.keys(trait).filter(function (key) {
        return !dontCopy.includes(key);
      }).forEach(function (key) {
        return Object.defineProperty(obj, key, { configurable: true, get: function get() {
            return trait[key];
          }
        });
      });
      return obj;
    },
    doit: function doit(printResult, editor, options) {
      var _this5 = this;

      return asyncToGenerator(regeneratorRuntime.mark(function _callee12() {
        var result;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.prev = 0;

                options = Object.assign({
                  inspect: !printResult,
                  printDepth: _this5.printInspectMaxDepth,
                  targetModule: _this5.moduleId(),
                  context: _this5
                }, options);
                _context12.next = 4;
                return evalStrategy(_this5).runEval(_this5.getCodeForEval(), options);

              case 4:
                result = _context12.sent;

                if (printResult) {
                  _this5.printObject(editor, result.value, false, _this5.getPrintItAsComment());
                } else {
                  _this5.setStatusMessage(result.value);
                }
                _this5.onDoitDone(result);
                return _context12.abrupt("return", result);

              case 10:
                _context12.prev = 10;
                _context12.t0 = _context12["catch"](0);
                _this5.showError(_context12.t0);throw _context12.t0;

              case 14:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, _this5, [[0, 10]]);
      }))();
    },
    printInspect: function printInspect(options) {
      var _this6 = this;

      return asyncToGenerator(regeneratorRuntime.mark(function _callee13() {
        var msgMorph, ed;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                options = options || {};
                msgMorph = _this6._statusMorph;
                _context13.next = 4;
                return new Promise(function (resolve, reject) {
                  return _this6.withAceDo(resolve);
                });

              case 4:
                ed = _context13.sent;

                if (!(msgMorph && msgMorph.world())) {
                  _context13.next = 7;
                  break;
                }

                return _context13.abrupt("return", ed.execCommand('insertEvalResult'));

              case 7:
                return _context13.abrupt("return", _this6.doit(true, ed, { inspect: true, printDepth: options.depth || _this6.printInspectMaxDepth }));

              case 8:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, _this6);
      }))();
    },
    evalSelection: function evalSelection(printIt) {
      var _this7 = this;

      return asyncToGenerator(regeneratorRuntime.mark(function _callee14() {
        var options, result;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                options = { context: _this7, targetModule: _this7.moduleId(), asString: !!printIt };
                _context14.next = 3;
                return evalStrategy(_this7).runEval(_this7.getCodeForEval(), options);

              case 3:
                result = _context14.sent;

                if (printIt) _this7.insertAtCursor(result.value, true);
                return _context14.abrupt("return", result);

              case 6:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, _this7);
      }))();
    },
    doListProtocol: function doListProtocol() {
      var _this8 = this;

      return asyncToGenerator(regeneratorRuntime.mark(function _callee15() {
        var m, prefix, completions, lister;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.prev = 0;
                m = lively.module("lively.ide.codeeditor.Completions");

                if (m.isLoaded()) {
                  _context15.next = 5;
                  break;
                }

                _context15.next = 5;
                return m.load();

              case 5:
                prefix = _this8.getCodeForCompletions();
                _context15.next = 8;
                return evalStrategy(_this8).keysOfObject(prefix, { context: _this8, targetModule: _this8.moduleId() });

              case 8:
                completions = _context15.sent;
                lister = new lively.ide.codeeditor.Completions.ProtocolLister(_this8);

                lister.openNarrower(completions);
                return _context15.abrupt("return", lister);

              case 14:
                _context15.prev = 14;
                _context15.t0 = _context15["catch"](0);
                _this8.showError(_context15.t0);
              case 17:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, _this8, [[0, 14]]);
      }))();
    },
    doSave: function doSave() {
      var _this9 = this;

      return asyncToGenerator(regeneratorRuntime.mark(function _callee16() {
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                _this9.savedTextString = _this9.textString;

                if (!_this9.getEvalOnSave()) {
                  _context16.next = 10;
                  break;
                }

                _context16.prev = 2;
                _context16.next = 5;
                return lively.modules.moduleSourceChange(_this9.moduleId(), _this9.textString);

              case 5:
                _context16.next = 10;
                break;

              case 7:
                _context16.prev = 7;
                _context16.t0 = _context16["catch"](2);
                return _context16.abrupt("return", _this9.showError(_context16.t0));

              case 10:
                _this9.onSaveDone();

              case 11:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, _this9, [[2, 7]]);
      }))();
    },
    onDoitDone: function onDoitDone(result) {},
    onSaveDone: function onSaveDone() {},
    getAllCode: function getAllCode() {
      throw new Error("getAllCode() not yet implemented for " + this.constructor.name);
    },
    getCodeForEval: function getCodeForEval() {
      throw new Error("getCodeForEval() not yet implemented for " + this.constructor.name);
    },
    getCodeForCompletions: function getCodeForCompletions() {
      throw new Error("getCodeForCompletions() not yet implemented for " + this.constructor.name);
    },
    moduleId: function moduleId() {
      throw new Error("moduleId() not yet implemented for " + this.constructor.name);
    },
    printObject: function printObject() {
      throw new Error("printObject() not yet implemented for " + this.constructor.name);
    },
    getPrintItAsComment: function getPrintItAsComment() {
      throw new Error("getPrintItAsComment() not yet implemented for " + this.constructor.name);
    },
    insertAtCursor: function insertAtCursor() {
      throw new Error("insertAtCursor() not yet implemented for " + this.constructor.name);
    },
    setStatusMessage: function setStatusMessage() {
      throw new Error("setStatusMessage() not yet implemented for " + this.constructor.name);
    }
  }, defineProperty(_EvalableTextMorphTra, "setStatusMessage", function setStatusMessage() {
    throw new Error("setStatusMessage() not yet implemented for " + this.constructor.name);
  }), defineProperty(_EvalableTextMorphTra, "showError", function showError() {
    throw new Error("showError() not yet implemented for " + this.constructor.name);
  }), _EvalableTextMorphTra);



  var evalStrategies = Object.freeze({
    EvalStrategy: EvalStrategy,
    SimpleEvalStrategy: SimpleEvalStrategy,
    LivelyVmEvalStrategy: LivelyVmEvalStrategy,
    HttpEvalStrategy: HttpEvalStrategy,
    EvalableTextMorphTrait: EvalableTextMorphTrait
  });

  function runEval(code, options) {
    options = Object.assign({
      format: "global",
      System: null,
      targetModule: null
    }, options);

    var S = options.System || typeof System !== "undefined" && System;
    if (!S && options.targetModule) {
      return Promise.reject(new Error("options to runEval have targetModule but cannot find system loader!"));
    }

    return options.targetModule ? runEval$1(options.System || System, code, options) : vmRunEval(code, options);
  }

  function syncEval(code, options) {
    return syncEval$1(code, options);
  }

  exports.completions = completions;
  exports.runEval = runEval;
  exports.syncEval = syncEval;
  exports.evalStrategies = evalStrategies;
  exports.defaultTopLevelVarRecorderName = defaultTopLevelVarRecorderName;
  exports.evalCodeTransform = evalCodeTransform;
  exports.evalCodeTransformOfSystemRegisterSetters = evalCodeTransformOfSystemRegisterSetters;

}((this.lively.vm = this.lively.vm || {}),lively.lang,lively.ast));
  if (typeof module !== "undefined" && module.exports) module.exports = GLOBAL.lively.vm;
})();