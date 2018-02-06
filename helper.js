"use strict";
function getGlobal() {
    if (typeof window !== "undefined") {
        return window;
    }
    if (typeof global !== "undefined") {
        // eslint-disable-next-line no-undef
        return global;
    }
}
var glob = getGlobal();
var uuidPattern = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
var uuidRegexPattern = uuidPattern.replace(/x/g, "[a-fA-F0-9]").replace(/y/g, "[89abAB]");
var uuidRegex = new RegExp(uuidRegexPattern);
/** contains general helper functions */
var helper = {
    executeOnce: function (func) {
        var val;
        return function () {
            if (!val) {
                val = func();
            }
            return val;
        };
    },
    ensurePromise: function (p, cb) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return p.resolve(cb.apply(void 0, args));
        };
    },
    hasErrorId: function (response, id) {
        var errorData = response.errorData;
        return Object.keys(errorData).some(function (key) {
            return errorData[key].id === id;
        });
    },
    createErrorType: function (name) {
        function CustomError(message, extra) {
            var error = Error.call(this, message);
            this.name = name;
            this.extra = extra;
            this.message = error.message;
            this.stack = error.stack;
        }
        CustomError.prototype = Object.create(Error.prototype);
        CustomError.prototype.constructor = CustomError;
        return CustomError;
    },
    cacheResult: function (func) {
        var result;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!result) {
                result = func.apply(this, args);
            }
            return result;
        };
    },
    cacheUntilSettled: function (func) {
        var resultPromise;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!resultPromise) {
                resultPromise = func.apply(this, args);
            }
            resultPromise.finally(function () {
                resultPromise = null;
            });
            return resultPromise;
        };
    },
    randomIntFromInterval: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    generateUUID: function () {
        /* eslint-disable no-bitwise */
        var d = new Date().getTime();
        var uuid = uuidPattern.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
        });
        /* eslint-enable no-bitwise */
        return uuid;
    },
    repeatUntilTrue: function (Promise, func, delay) {
        function repeatFunc() {
            return func().then(function (res) {
                if (!res) {
                    return Promise.delay(delay).then(function () {
                        return repeatFunc();
                    });
                }
            });
        }
        return repeatFunc();
    },
    encodeParameters: function (parameters) {
        var keys = Object.keys(parameters);
        if (keys.length === 0) {
            return "";
        }
        var result = "?";
        keys.forEach(function (key) {
            result += key;
            if (parameters[key] !== null) {
                result += "=" + parameters[key];
            }
            result += "&";
        });
        result = result.substr(0, result.length - 1);
        return result;
    },
    getWeekNumber: function (d) {
        // Copy date so don't modify original
        d = new Date(+d);
        d.setHours(0, 0, 0);
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        // Get first day of year
        var yearStart = new Date(d.getFullYear(), 0, 1).getTime();
        // Calculate full weeks to nearest Thursday
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        // Return array of year and week number
        return weekNo;
    },
    getLanguageFromPath: function () {
        return window.top.location.pathname.split("/")[1];
    },
    or: function (v1, v2) {
        return v1 || v2;
    },
    and: function (v1, v2) {
        return v1 && v2;
    },
    not: function (func) {
        return function () {
            return !func.apply(this, arguments);
        };
    },
    addAfterHook: function (func, hook, thisArg) {
        return function () {
            func.apply(thisArg, arguments);
            hook.apply(thisArg, arguments);
        };
    },
    concatBuffers: function () {
        var bufs = Array.prototype.slice.call(arguments);
        var len = 0, offset = 0;
        bufs.forEach(function (buf) {
            len += buf.byteLength;
        });
        var tmp = new Uint8Array(len);
        bufs.forEach(function (buf) {
            tmp.set(new Uint8Array(buf), offset);
            offset += buf.byteLength;
        });
        return tmp.buffer;
    },
    debouncePromise: function (Bluebird, func, time) {
        var timer = null;
        return function () {
            var args = arguments;
            if (timer) {
                clearTimeout(timer);
            }
            var promise = new Bluebird(function (resolve) {
                timer = setTimeout(function () {
                    resolve();
                }, time);
            }).then(function () {
                return func.apply(null, args);
            });
            return promise;
        };
    },
    debounce: function (func, time) {
        var timeout, args;
        return function () {
            args = arguments;
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function () {
                func.apply(null, args);
            }, time);
        };
    },
    promisify: function (Promise, cb) {
        return new Promise(function (resolve, reject) {
            try {
                cb(function (e, result) {
                    if (e) {
                        reject(e);
                    }
                    else {
                        resolve(result);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    },
    joinArraysToObject: function (config) {
        var result = [];
        var len = config[Object.keys(config)[0]].length;
        if (len === 0) {
            return result;
        }
        var i;
        for (i = 0; i < len; i += 1) {
            result.push({});
        }
        helper.objectEach(config, function (key, arrVal) {
            if (arrVal.length !== len) {
                throw new Error("arrays need to have the same length");
            }
            arrVal.forEach(function (val, index) {
                result[index][key] = val;
            });
        });
        return result;
    },
    capitaliseFirstLetter: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    lowercaseFirstLetter: function (string) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    },
    objectifyResult: function (name, cb) {
        return function (e, result) {
            var data = {};
            if (e) {
                cb(e);
            }
            else {
                data[name] = result;
                cb(null, data);
            }
        };
    },
    array: {
        isArray: function (arr) {
            return Object.prototype.toString.call(arr) === "[object Array]";
        },
        first: function (arr) {
            return arr[0];
        },
        last: function (arr) {
            return arr[arr.length - 1];
        },
        find: function (arr, func) {
            var results = arr.filter(func);
            if (results.length === 1) {
                return results[0];
            }
        },
        spreadByArray: function (toSpread, attributeNames) {
            var res = {};
            toSpread.forEach(function (val, index) {
                res[attributeNames[index]] = val;
            });
            return res;
        },
        contains: function (arr, element) {
            return arr.indexOf(element) > -1;
        },
        flatten: function (arr) {
            var i, result = [];
            for (i = 0; i < arr.length; i += 1) {
                if (arr[i] instanceof Array) {
                    result = result.concat(helper.array.flatten(arr[i]));
                }
                else {
                    result.push(arr[i]);
                }
            }
            return result;
        }
    },
    object: {
        deepSet: function (obj, partials, value) {
            obj = obj || {};
            if (partials.length === 0) {
                return value;
            }
            var curPartial = obj;
            partials.forEach(function (part, index) {
                if (index === partials.length - 1) {
                    curPartial[part] = value;
                }
                if (!curPartial[part]) {
                    curPartial[part] = {};
                }
            });
            return obj;
        },
        deepHas: function (obj, partials) {
            var hasDeep = true, currentPartial = obj;
            partials.forEach(function (partial) {
                if (currentPartial.hasOwnProperty(partial)) {
                    currentPartial = currentPartial[partial];
                }
                else {
                    hasDeep = false;
                }
            });
            return hasDeep;
        },
        deepGet: function (obj, partials) {
            var currentPart = obj, depth = 0, previousPart;
            if (partials.length === 0) {
                return {
                    depth: 0,
                    value: obj
                };
            }
            partials.forEach(function (partial) {
                if (typeof currentPart[partial] !== "undefined") {
                    previousPart = currentPart;
                    currentPart = currentPart[partial];
                    depth += 1;
                }
            });
            return {
                depth: depth,
                value: currentPart,
                parentValue: previousPart
            };
        },
        multipleFlatJoin: function (objs) {
            var result = {};
            function doJoin(base, obj) {
                helper.objectEach(obj, function (key, value) {
                    if (base.hasOwnProperty(key) && value !== base[key]) {
                        throw new Error("attribute already set!");
                    }
                    else {
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
    canvasToBlob: function (canvas, type, cb) {
        canvas.toBlob(function (blob) {
            cb(null, blob);
        }, type);
    },
    blobToDataURI: function (blob, cb) {
        var reader = new FileReader();
        reader.onload = function () {
            cb(null, reader.result);
        };
        reader.readAsDataURL(blob);
    },
    dataURItoBlob: function (dataURI) {
        if (glob.atob && glob.Blob && glob.ArrayBuffer && glob.Uint8Array) {
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
                try {
                    return new Blob([ab], { type: mimeString });
                }
                catch (e) {
                    // TypeError old chrome and FF
                    window.BlobBuilder = window.BlobBuilder ||
                        window.WebKitBlobBuilder ||
                        window.MozBlobBuilder ||
                        window.MSBlobBuilder;
                    if (e.name === "TypeError" && window.BlobBuilder) {
                        var bb = new window.BlobBuilder();
                        bb.append([ab]);
                        return bb.getBlob(mimeString);
                    }
                    return false;
                }
            }
            catch (e) {
                return false;
            }
        }
        else {
            return false;
        }
    },
    /** calls all listeners */
    callListener: function (listener, arg1) {
        var i;
        for (i = 0; i < listener.length; i += 1) {
            try {
                listener[i](null, arg1);
            }
            catch (e) {
                console.log(e);
            }
        }
    },
    aggregateOnce: function (delayTime, callFunction) {
        var timerStarted = false;
        function doLoad() {
            timerStarted = false;
            callFunction();
        }
        return function () {
            if (!timerStarted) {
                timerStarted = true;
                window.setTimeout(doLoad, delayTime);
            }
        };
    },
    FullFiller: function () {
        var running = false, waiters = [];
        var success = false, failure = false, error;
        this.finish = function (e) {
            failure = !!e;
            success = !e;
            error = e;
            helper.callEach(waiters, [error]);
        };
        this.success = function () {
            if (!success && !failure) {
                success = true;
                helper.callEach(waiters);
            }
        };
        this.fail = function (e) {
            if (!success && !failure) {
                failure = true;
                error = e;
                helper.callEach(waiters, [error]);
            }
        };
        this.isSuccess = function () {
            return success;
        };
        this.start = function (cb) {
            if (!running && !success && !failure) {
                running = true;
                cb();
            }
        };
        this.await = function (cb) {
            if (success || failure) {
                cb(error);
            }
            else {
                waiters.push(cb);
            }
        };
    },
    delayMultiplePromise: function (Bluebird, delayTime, loadFunction, maxOnce) {
        var idsToLoad = [];
        var loadPromises = {}, loaderPromise;
        function doLoad() {
            var identifiers = idsToLoad.splice(0, maxOnce || idsToLoad.length);
            return loadFunction(identifiers).then(function (results) {
                loaderPromise = null;
                return results;
            }).map(function (result, i) {
                var id = identifiers[i];
                delete loadPromises[id];
                return {
                    id: id,
                    result: result
                };
            });
        }
        function getLoaderPromise() {
            if (!loaderPromise) {
                loaderPromise = Bluebird.delay(delayTime)
                    .then(function () { return doLoad(); });
            }
            return loaderPromise;
        }
        function awaitNextLoad(identifier) {
            return getLoaderPromise()
                .filter(function (res) { return res.id === identifier; })
                .then(function (remainingResults) {
                return remainingResults.length === 0 ?
                    awaitNextLoad(identifier) :
                    remainingResults[0].result;
            });
        }
        return function (identifier) {
            if (!loadPromises[identifier]) {
                idsToLoad.push(identifier);
                loadPromises[identifier] = awaitNextLoad(identifier);
            }
            return loadPromises[identifier];
        };
    },
    delayMultiple: function (delayTime, loadFunction, maxOnce) {
        var timerStarted = false;
        var idsToLoad = [];
        var loadListeners = {};
        function doLoad() {
            var identifier = idsToLoad.splice(0, maxOnce || idsToLoad.length);
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
                if (idsToLoad.length === 0) {
                    timerStarted = false;
                }
                else {
                    window.setTimeout(doLoad, delayTime);
                }
            });
        }
        return function (identifier, cb) {
            if (loadListeners[identifier]) {
                loadListeners[identifier].push(cb);
            }
            else {
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
        switch (state) {
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
                }
                else {
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
                }
                else {
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
        for (i = 0; i < l; i += 1) {
            if (arr[i]) {
                hashMap[arr[i]] = arr[i];
            }
        }
        for (name in hashMap) {
            if (hashMap.hasOwnProperty(name)) {
                result.push(hashMap[name]);
            }
        }
        return result;
    },
    arrayEqual: function (arr1, arr2) {
        return arr1.length === arr2.length && helper.arraySubtract(arr1, arr2).length === 0 && helper.arraySubtract(arr2, arr1).length === 0;
    },
    deepEqual: function (obj1, obj2) {
        if (obj1 === obj2) {
            return true;
        }
        else if (typeof obj1 === "object" && typeof obj2 === "object") {
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
        }
        else {
            return false;
        }
        return true;
    },
    deepCopyArray: function (arr, depth) {
        var result = [], i;
        for (i = 0; i < arr.length; i += 1) {
            result[i] = helper.deepCopyObj(arr[i], depth - 1);
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
            if (obj.hasOwnProperty(attr)) {
                value = obj[attr];
                result[attr] = helper.deepCopyObj(value, depth - 1);
            }
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
            if (extender.hasOwnProperty(attr)) {
                target[attr] = target[attr] || {};
                given = target[attr];
                added = extender[attr];
                if (added !== undefined) {
                    if (typeof given === "object" && typeof added === "object" && !(added instanceof Array)) {
                        helper.extend(given, added, depth - 1, removeEmpty);
                    }
                    else {
                        target[attr] = added;
                    }
                    if (shouldDeleteAttribute(target[attr])) {
                        delete target[attr];
                    }
                }
            }
        }
        return target;
    },
    extendNoOverwrite: function (target, extender) {
        helper.objectEach(extender, function (key, value) {
            if (typeof target[key] === "undefined") {
                target[key] = helper.deepCopyObj(value);
            }
            else if (typeof target[key] === "object") {
                helper.extendNoOverwrite(target[key], value);
            }
        });
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
    nop: function () { },
    objectJoin: function (obj1, obj2) {
        var result = {};
        helper.objectEach(obj1, function (key, value) {
            if (obj2.hasOwnProperty(key) && value !== obj2[key]) {
                if (typeof value === "object" && typeof obj2[key] === "object") {
                    result[key] = helper.objectJoin(value, obj2[key]);
                }
                else {
                    throw new Error("attribute set in both!");
                }
            }
            else {
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
        if (returnFunction === void 0) { returnFunction = function () { }; }
        var result;
        listener.forEach(function (theListener) {
            try {
                var currentResult = theListener.apply(null, args);
                if (result) {
                    result = returnFunction(result, currentResult);
                }
                else {
                    result = currentResult;
                }
            }
            catch (e) {
                console.log(e);
            }
        });
        return result;
    },
    objectMap: function (obj, func, thisArg) {
        var attr, res = {}, result;
        for (attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                result = func.call(thisArg, obj[attr], attr);
                if (result) {
                    res[attr] = result;
                }
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
                }
                else {
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
            }
            else {
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
        }
        else {
            return false;
        }
    },
    toUrl: function (file) {
        var url;
        if (file.localURL) {
            return file.localURL;
        }
        if (typeof URL !== "undefined") {
            url = URL.createObjectURL(file);
        }
        else if (typeof webkitURL !== "undefined") {
            url = webkitURL.createObjectURL(file);
        }
        return url;
    },
    deepSetCreate: function (obj, keys, value) {
        var changed = false, cur = obj;
        keys.forEach(function (key, index) {
            if (index + 1 < keys.length) {
                if (!cur[key]) {
                    cur[key] = {};
                }
                cur = cur[key];
            }
            else if (cur[key] !== value) {
                cur[key] = helper.deepCopyObj(value);
                changed = true;
            }
        });
        return changed;
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
                    }
                    else if (typeof reference[key] === "function") {
                        if (!reference[key](data[key])) {
                            return false;
                        }
                    }
                    else if (reference[key] !== true) {
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
    isUUID: function (uuid) {
        return helper.isString(uuid) && uuid.match(uuidRegex);
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
        if (typeof data !== "string") {
            return false;
        }
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
        var regex = /^.+@.+$/;
        return (helper.isString(data) && data.length !== 0 && regex.test(data));
    },
    /** is data a session Key (hex value with certain length) */
    isSessionKey: function (data) {
        return (helper.isset(data) && (data.length === 64 || data.length === 32) && helper.isHex(data));
    },
    isPassword: function (data) {
        return (helper.isHex(data) && data.length === 64);
    },
    isCurve: function (data) {
        if (data === "c256" || data === "256") {
            return true;
        }
        //TODO!
        return false;
    },
    isBase64: function (data) {
        return (helper.isset(data) && typeof data === "string" && !!data.match(/^[A-Za-z0-9\+\/=]|=[^=]|={3,}$/));
    },
    isSignature: function (data) {
        return helper.isHex(data);
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
        }
        else {
            return false;
        }
        for (i = 1; i < arguments.length; i += 1) {
            if (helper.isset(memory[arguments[i]])) {
                memory = memory[arguments[i]];
            }
            else {
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
            }
            else {
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
            return cb.apply(this, args);
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
        return function (err) {
            if (err) {
                console.log(err);
                var passToNext = false;
                if (errors instanceof Array) {
                    var i;
                    for (i = 0; i < errors.length; i += 1) {
                        if (err instanceof errors[i]) {
                            passToNext = true;
                        }
                    }
                }
                else {
                    passToNext = err instanceof errors;
                }
                if (!passToNext) {
                    this(err);
                    return;
                }
            }
            return cb.apply(this, arguments);
        };
    },
    emptyUnion: function (arr1, arr2) {
        return helper.arraySubtract(arr1, arr2).length === arr1.length && helper.arraySubtract(arr2, arr1).length === arr2.length;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = helper;
