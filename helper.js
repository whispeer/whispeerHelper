"use strict";

/** contains general helper functions */
var helper = {
	capitaliseFirstLetter: function (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	array: {
		contains: function (arr, element) {
			return arr.indexOf(element) > -1;
		},
		flatten: function (arr) {
			var i, result = [];
			for (i = 0; i < arr.length; i += 1) {
				if (arr[i] instanceof Array) {
					result = result.concat(helper.array.flatten(arr[i]));
				} else {
					result.push(arr[i]);
				}
			}

			return result;
		}
	},

	object: {
		multipleFlatJoin: function (objs) {
			var result = {};

			function doJoin(base, obj) {
				helper.objectEach(obj, function (key, value) {
					if (base.hasOwnProperty(key) && value !== base[key]) {
						throw new Error("attribute already set!");
					} else {
						result[key] = value;
					}
				});
			}

			objs.map(function (e) {
				doJoin(result, e);
			});

			return result;
		}
	},

	pad: function (str, max) {
		str = str.toString();
		return str.length < max ? helper.pad("0" + str, max) : str;
	},

	blobToDataURI: function (blob) {
		return "data:" + blob.type + ";base64," + blob.toString("base64");
	},

	dataURItoBlob: function (dataURI) {
		if (atob && Blob && ArrayBuffer && Uint8Array) {
			try {
				// convert base64 to raw binary data held in a string
				// doesn't handle URLEncoded DataURIs
				var byteString = atob(dataURI.split(",")[1]);

				// separate out the mime component
				var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

				// write the bytes of the string to an ArrayBuffer
				var ab = new ArrayBuffer(byteString.length);
				var ia = new Uint8Array(ab);
				for (var i = 0; i < byteString.length; i++) {
					ia[i] = byteString.charCodeAt(i);
				}

				return new Blob([ab], { type: mimeString });
			} catch (e) {
				return false;
			}
		} else {
			return false;
		}
	},

	/** calls all listeners */
	callListener: function(listener, arg1) {
		var i;
		for (i = 0; i < listener.length; i += 1) {
			try {
				listener[i](null,arg1);
			} catch (e) {
				console.log(e);
			}
		}
	},

	delayMultiple: function (delayTime, loadFunction) {
		var timerStarted = false;
		var idsToLoad = [];
		var loadListeners = {};

		function doLoad() {
			var identifier = idsToLoad;
			idsToLoad = [];
			timerStarted = false;

			loadFunction(identifier, function (err, results) {
				if (err) {
					throw err;
				}

				var i, curIdentifier, curListener;
				for (i = 0; i < results.length; i += 1) {
					curIdentifier = identifier[i];
					curListener = loadListeners[curIdentifier];

					helper.callListener(curListener, results[i]);
					delete loadListeners[curIdentifier];
				}
			});
		}

		return function (identifier, cb) {
			if (loadListeners[identifier]) {
				loadListeners[identifier].push(cb);
			} else {
				loadListeners[identifier] = [cb];
				idsToLoad.push(identifier);

				if (!timerStarted) {
					timerStarted = true;

					window.setTimeout(doLoad, delayTime);
				}
			}
		};
	},

	setGeneralState: function (state, obj) {
		obj.saving = false;
		obj.success = false;
		obj.failure = false;

		switch(state) {
			case "saving":
				obj.saving = true;
				break;
			case "success":
				obj.success = true;
				break;
			case "failure":
			default:
				obj.failure = true;
				break;
		}
	},

	stringifyCertainAttributes: function (obj, attributes) {
		var attr, result = {};
		for (attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				if (attributes.indexOf(attr) > -1) {
					result[attr] = JSON.stringify(obj[attr]);
				} else {
					if (typeof obj[attr] === "object") {
						throw new Error("value should not be stringified but is object");
					}

					result[attr] = obj[attr];
				}
			}
		}

		return result;
	},

	unStringifyCertainAttributes: function (obj, attributes) {
		var attr, result = {};
		for (attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				if (attributes.indexOf(attr) > -1) {
					result[attr] = JSON.parse(obj[attr]);
				} else {
					result[attr] = obj[attr];
				}
			}
		}

		return result;
	},

	newElement: function (Constructor) {
		return function (e) {
			return new Constructor(e);
		};
	},

	arraySubtract: function (original, subtractor) {
		var i, result = [];
		for (i = 0; i < original.length; i += 1) {
			if (subtractor.indexOf(original[i]) === -1) {
				result.push(original[i]);
			}
		}

		return result;
	},

	arrayUnique: function (arr) {
		var hashMap = {}, i, name, l = arr.length, result = [];

		for(i=0; i<l; i+=1) {
			if (arr[i]) {
				hashMap[arr[i]] = arr[i];
			}
		}

		for(name in hashMap) {
			result.push(hashMap[name]);
		}

		return result;
	},

	arrayEqual: function (arr1, arr2) {
		return arr1.length === arr2.length && helper.arraySubtract(arr1, arr2).length === 0 && helper.arraySubtract(arr2, arr1).length === 0;
	},

	deepEqual: function (obj1, obj2) {
		if (obj1 === obj2) {
			return true;
		} else if (typeof obj1 === "object" && typeof obj2 === "object") {
			var keys1 = Object.keys(obj1), keys2 = Object.keys(obj2);

			if (!helper.arrayEqual(keys1, keys2)) {
				return false;
			}

			var i, cur;
			for (i = 0; i < keys1.length; i += 1) {
				cur = keys1[i];

				if (!helper.deepEqual(obj1[cur], obj2[cur])) {
					return false;
				}
			}
		} else {
			return false;
		}

		return true;
	},

	deepCopyArray: function (arr, depth) {
		var result = [], i;
		for (i = 0; i < arr.length; i += 1) {
			result[i] = helper.deepCopyObj(arr[i], depth-1);
		}

		return result;
	},

	deepCopyObj: function (obj, depth) {
		if (typeof obj !== "object") {
			return obj;
		}

		if (depth < 0) {
			throw new Error("too deep");
		}

		if (obj instanceof Array) {
			return helper.deepCopyArray(obj, depth);
		}

		var attr, value, result = {};
		// Extend the base object
		for (attr in obj) {
			value = obj[attr];

			result[attr] = helper.deepCopyObj(value, depth-1);
		}

		return result;
	},

	extend: function (target, extender, depth, removeEmpty) {
		function shouldDeleteAttribute(value) {
			if (!removeEmpty) {
				return false;
			}

			return value === "" || value === null || (typeof value === "object" && Object.keys(value).length === 0);
		}

		if (!target) {
			return extender;
		}

		if (depth < 0) {
			throw new Error("too deep");
		}

		var attr, given, added;
		// Extend the base object
		for (attr in extender) {
			target[attr] = target[attr] || {};

			given = target[attr];
			added = extender[attr];

			if (added !== undefined) {
				if (typeof given === "object" && typeof added === "object" && !(added instanceof Array)) {
					helper.extend(given, added, depth-1, removeEmpty);
				} else {
					target[attr] = added;
				}

				if (shouldDeleteAttribute(target[attr])) {
					delete target[attr];
				}
			}
		}

		return target;
	},

	parseDecimal: function (e) {
		return parseInt(e, 10);
	},

	assert: function (bool) {
		if (!bool) {
			throw new Error("assertion not met!");
		}
	},

	qm: function (attr) {
		return function (obj) {
			return obj[attr];
		};
	},

	nop: function () {},

	objectJoin: function (obj1, obj2) {
		var result = {};

		helper.objectEach(obj1, function (key, value) {
			if (obj2.hasOwnProperty(key) && value !== obj2[key]) {
				if (typeof value === "object" && typeof obj2[key] === "object") {
					result[key] = helper.objectJoin(value, obj2[key]);
				} else {
					throw new Error("attribute set in both!");
				}
			} else {
				result[key] = value;
			}
		});

		helper.objectEach(obj2, function (key, value) {
			if (!obj1.hasOwnProperty(key)) {
				result[key] = value;
			}
		});

		return result;
	},

	objectEach: function (obj, cb, thisArg) {
		var attr;
		for (attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				cb.call(thisArg, attr, obj[attr]);
			}
		}
	},

	copyObj: function (obj) {
		var newObj = {}, attr;
		for (attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				newObj[attr] = obj[attr];
			}
		}

		return newObj;
	},

	containsOr: function (value) {
		var i;
		for (i = 1; i < arguments.length; i += 1) {
			if (arguments[i].indexOf(value) > -1) {
				return true;
			}
		}

		return false;
	},

	arrayToObject: function (arr, func) {
		var i, res = {};
		for (i = 0; i < arr.length; i += 1) {
			res[func(arr[i], i)] = arr[i];
		}

		return res;
	},

	removeArray: function (arr, val) {
		if (!arr) {
			return [];
		}

		var ax;

		while ((ax = arr.indexOf(val)) !== -1) {
			arr.splice(ax, 1);
		}

		return arr;
	},

	callEach: function (listener, args, returnFunction) {
		if (typeof returnFunction !== "function") {
			returnFunction = function () {};
		}

		var result, currentResult;

		var i;
		for (i = 0; i < listener.length; i += 1) {
			try {
				currentResult = listener[i].apply(null, args);
				if (result) {
					result = returnFunction(result, currentResult);
				} else {
					result = currentResult;
				}
			} catch (e) {
				console.log(e);
			}
		}

		return result;
	},

	objectMap: function (obj, func) {
		var attr, res = {};
		for (attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				res[attr] = func(obj[attr]);
			}
		}
		return res;
	},

	setAll: function (obj, value) {
		var attr;
		for (attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				if (typeof obj[attr] === "object") {
					helper.setAll(obj, value);
				} else {
					obj[attr] = value;
				}
			}
		}
	},

	deepGet: function (obj, key) {
		var i;
		var cur = obj;

		if (typeof key === "string") {
			key = [key];
		}

		if (!cur) {
			return;
		}

		for (i = 0; i < key.length; i += 1) {
			if (cur[key[i]]) {
				cur = cur[key[i]];
			} else {
				return;
			}
		}

		return cur;
	},

	deepSet: function (obj, key, value) {
		var toSet = key.pop();
		var branch = helper.deepGet(obj, key);
		if (branch) {
			branch[toSet] = value;
		} else {
			return false;
		}
	},

	deepSetCreate: function (obj, key, value) {
		var i, cur = obj;
		for (i = 0; i < key.length - 1; i += 1) {
			if (!cur[key[i]]) {
				cur[key[i]] = {};
			}

			cur = cur[key[i]];
		}

		if (cur[key[key.length - 1]] !== value) {
			cur[key[key.length - 1]] = value;
			return true;
		}

		return false;
	},

	validateObjects: function validateObjectsF(reference, data, noValueCheck) {
		var key;
		for (key in data) {
			if (data.hasOwnProperty(key)) {
				if (!reference[key]) {
					return false;
				}

				if (!noValueCheck) {
					if (typeof reference[key] === "object") {
						if (!helper.validateObjects(reference[key], data[key])) {
							return false;
						}
					} else if (typeof reference[key] === "function") {
						if (!reference[key](data[key])) {
							return false;
						}
					} else if (reference[key] !== true) {
						return false;
					}
				}
			}
		}

		return true;
	},

	/** chars for a sid */
	codeChars: ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Y", "X", "C", "V", "B", "N", "M", "q", "w", "e", "r", "t", "z", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "y", "x", "c", "v", "b", "n", "m", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],

	/** get a file names extension */
	getExtension: function (filename) {
		var i = filename.lastIndexOf(".");
		return (i < 0) ? "" : filename.substr(i);
	},

	/** get a filenames name */
	getName: function (filename) {
		var i = filename.lastIndexOf(".");
		return (i < 0) ? filename : filename.substr(0, i);
	},

	/** just a function which moves on in step */
	passFunction: function () {
		this.apply(null, arguments);
	},
	/** order a certain ass-array correctly
	* @param object object to sort
	* @param order correct order (normal array)
	* @param getFunction which func to call on objects to get their "value"
	* @return ordered object
	*/
	orderCorrectly: function (object, order, getFunction) {
		var i, j, results = [];
		for (i = 0; i < order.length; i += 1) {
			for (j = 0; j < object.length; j += 1) {
				if (object[j][getFunction]() === order[i]) {
					results.push(object[j]);

					object.splice(j, 1);

					break;
				}
			}
		}

		return results;
	},
	/** decode an EncryptedSignedMessage */
	decodeESM: function (esm) {
		var result = {};
		result.m = helper.base64ToHex(esm.m);
		result.s = helper.base64ToHex(esm.s);
		result.iv = helper.base64ToHex(esm.iv);

		return result;
	},

	/** is data an integer?
	* @param data value to check for int value
	* @return bool is integer?
	*/
	isInt: function (data) {
		var y = parseInt(data, 10);
		if (isNaN(y)) {
			return false;
		}
		return y.toString() === data.toString();
	},

	/** is data an id?*/
	isID: function (data) {
		if (helper.isInt(data)) {
			data = parseInt(data, 10);

			return (data > 0);
		}

		return false;
	},

	isRealID: function (data) {
		var parts = data.split(":");

		if (parts.length !== 2) {
			return false;
		}

		if (parts[1].length !== 64) {
			return false;
		}

		if (!helper.isNickname(parts[0]) && !helper.isMail(parts[0])) {
			return false;
		}

		return true;
	},

	/** is data a valid nickname? */
	isNickname: function (data) {
		return (helper.isString(data) && data.length !== 0 && !!data.match(/^[A-z][A-z0-9]*$/));
	},

	/** is data an e-mail? */
	isMail: function (data) {
		return (helper.isString(data) && data.length !== 0 && !!data.match(/^[A-Z0-9._%\-]+@[A-Z0-9.\-]+\.[A-Z]+$/i));
	},

	/** is data a session Key (hex value with certain length) */
	isSessionKey: function (data) {
		return (helper.isset(data) && (data.length === 64 || data.length === 32) && helper.isHex(data));
	},

	isPassword: function (data) {
		return (helper.isHex(data) && data.length === 10);
	},

	isCurve: function (data) {
		if (data === "c256" || data === "256") {
			return true;
		}
		//TODO!
		return false;
	},

	isHex: function (data) {
		return (helper.isset(data) && typeof data === "string" && !!data.match(/^[A-Fa-f0-9]*$/));
	},

	/** typeof val == object? */
	isObject: function (val) {
		return (typeof val === "object");
	},

	/** is val set (not null/undefined) */
	isString: function (val) {
		return (val !== undefined && val !== null && typeof val === "string");
	},

	/** is val set (not null/undefined) */
	isset: function (val) {
		return (val !== undefined && val !== null);
	},

	/** checks if an array is set and attributes in that array are set.
	* @param arrayName the array to check
	* @param other attributes to check for
	* checks if arrayName[1][2][3][4]... is set where 1-inf are the given attributes.
	* helper function
	* @author Nilos
	*/
	arraySet: function (arrayName) {
		var i = 1;
		var memory;
		if (helper.isset(arrayName)) {
			memory = arrayName;
		} else {
			return false;
		}

		for (i = 1; i < arguments.length; i += 1) {
			if (helper.isset(memory[arguments[i]])) {
				memory = memory[arguments[i]];
			} else {
				return false;
			}
		}

		return true;
	},

	nT: function (cb) {
		var nT = function nTf() {
			var args = arguments;
			if (typeof process !== "undefined") {
				process.nextTick(function () {
					cb.apply(this, args);
				});
			} else {
				cb.apply(this, args);
			}
		};

		return nT;
	},

	/** step function
	* throws given errors
	* passes on all other stuff to given function
	*/
	sF: function (cb) {
		var mysf = function sfFunction(err) {
			if (err) {
				console.log(err.stack);
				this(err);
				return;
			}

			var args = []; // empty array
			var i;
			// copy all other arguments we want to "pass through"
			for (i = 1; i < arguments.length; i += 1) {
				args.push(arguments[i]);
			}

			cb.apply(this, args);
		};

		mysf.getRealFunction = function () {
			return cb;
		};

		return mysf;
	},

	/** handle Error function for step
	* passes given errors to callback but only those!
	* throws other errors.
	*/
	hE: function (cb, errors) {
		function throwCertainError(err, type) {
			if (err instanceof type) {
				return true;
			}
		}

		return function (err) {
			if (err) {
				console.log(err);

				var passToNext = false;

				if (errors instanceof Array) {
					var doThrow = false;
					var i;
					for (i = 0; i < errors.length; i += 1) {
						if (err instanceof errors[i]) {
							passToNext = true;
						}
					}
				} else {
					passToNext = err instanceof errors;
				}

				if (!passToNext) {
					this(err);
					return;
				}
			}

			cb.apply(this, arguments);
		};
	},

	/** is needle in haystack? */
	inArray: function (haystack, needle) {
		var i = 0;
		for (i = 0; i < haystack.length; i += 1) {
			if (haystack[i] === needle) {
				return true;
			}
		}

		return false;
	},

	firstCapital: function (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
};

// Hook into commonJS module systems
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
	module.exports = helper;
}

if (typeof define !== "undefined") {
	define([], function () {
		return helper;
	});
}