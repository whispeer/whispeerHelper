declare var webkitURL: any;
declare var define: any;
declare var global: any;
declare var process: any;
declare var module: any;
interface Window {
    BlobBuilder: any;
    WebKitBlobBuilder: any;
    MozBlobBuilder: any;
    MSBlobBuilder: any;
}
declare function getGlobal(): any;
declare var glob: any;
declare var uuidPattern: string;
declare var uuidRegexPattern: string;
declare var uuidRegex: RegExp;
/** contains general helper functions */
declare var helper: {
    executeOnce: (func: () => any) => () => any;
    ensurePromise: (p: any, cb: any) => (...args: any[]) => any;
    hasErrorId: (response: any, id: any) => boolean;
    createErrorType: (name: any) => (message: any, extra: any) => void;
    randomIntFromInterval: (min: any, max: any) => number;
    generateUUID: () => string;
    repeatUntilTrue: (Promise: any, func: any, delay: any) => any;
    encodeParameters: (parameters: any) => string;
    getWeekNumber: (d: any) => number;
    getLanguageFromPath: () => string;
    or: (v1: any, v2: any) => any;
    and: (v1: any, v2: any) => any;
    not: (func: any) => () => boolean;
    addAfterHook: (func: any, hook: any, thisArg: any) => () => void;
    concatBuffers: () => ArrayBuffer;
    debouncePromise: (Bluebird: any, func: any, time: any) => () => any;
    debounce: (func: any, time: any) => () => void;
    promisify: (Promise: any, cb: any) => any;
    joinArraysToObject: (config: any) => any[];
    capitaliseFirstLetter: (string: any) => any;
    lowercaseFirstLetter: (string: string) => string;
    objectifyResult: (name: any, cb: any) => (e: any, result: any) => void;
    array: {
        isArray: (arr: any) => boolean;
        first: (arr: any) => any;
        last: (arr: any) => any;
        find: (arr: any, func: any) => any;
        spreadByArray: (toSpread: any, attributeNames: any) => {};
        contains: (arr: any, element: any) => boolean;
        flatten: (arr: any) => any[];
    };
    object: {
        deepSet: (obj: any, partials: any, value: any) => any;
        deepHas: (obj: any, partials: any) => boolean;
        deepGet: (obj: any, partials: any) => any;
        multipleFlatJoin: (objs: any) => {};
    };
    pad: (str: any, max: any) => any;
    canvasToBlob: (canvas: any, type: any, cb: any) => void;
    blobToDataURI: (blob: any, cb: any) => void;
    dataURItoBlob: (dataURI: any) => any;
    callListener: (listener: any, arg1: any) => void;
    aggregateOnce: (delayTime: any, callFunction: any) => () => void;
    FullFiller: () => void;
    delayMultiplePromise: (Bluebird: any, delayTime: any, loadFunction: any, maxOnce: any) => (identifier: any) => any;
    delayMultiple: (delayTime: any, loadFunction: any, maxOnce: any) => (identifier: any, cb: any) => void;
    setGeneralState: (state: any, obj: any) => void;
    stringifyCertainAttributes: (obj: any, attributes: any) => {};
    unStringifyCertainAttributes: (obj: any, attributes: any) => {};
    newElement: (Constructor: any) => (e: any) => any;
    arraySubtract: (original: any, subtractor: any) => any[];
    arrayUnique: (arr: any) => any[];
    arrayEqual: (arr1: any, arr2: any) => boolean;
    deepEqual: (obj1: any, obj2: any) => boolean;
    deepCopyArray: (arr: any, depth: any) => any[];
    deepCopyObj: (obj: any, depth?: number) => any;
    extend: (target: any, extender: any, depth: any, removeEmpty: any) => any;
    extendNoOverwrite: (target: any, extender: any) => void;
    parseDecimal: (e: any) => number;
    assert: (bool: any) => void;
    qm: (attr: any) => (obj: any) => any;
    nop: () => void;
    objectJoin: (obj1: any, obj2: any) => {};
    objectEach: (obj: any, cb: any, thisArg?: any) => void;
    copyObj: (obj: any) => {};
    containsOr: (value: any) => boolean;
    arrayToObject: (arr: any, func: any) => {};
    removeArray: (arr: any, val: any) => any;
    callEach: (listener: any, args?: any, returnFunction?: Function) => any;
    objectMap: (obj: any, func: any, thisArg: any) => {};
    setAll: (obj: any, value: any) => void;
    deepGet: (obj: any, key: any) => any;
    deepSet: (obj: any, key: any, value: any) => boolean;
    toUrl: (file: any) => any;
    deepSetCreate: (obj: any, keys: any, value: any) => boolean;
    validateObjects: (reference: any, data: any, noValueCheck?: any) => boolean;
    codeChars: string[];
    getExtension: (filename: any) => any;
    getName: (filename: any) => any;
    passFunction: () => void;
    orderCorrectly: (object: any, order: any, getFunction: any) => any[];
    isUUID: (uuid: any) => any;
    isInt: (data: any) => boolean;
    isID: (data: any) => boolean;
    isRealID: (data: any) => boolean;
    isNickname: (data: any) => boolean;
    isMail: (data: any) => boolean;
    isSessionKey: (data: any) => boolean;
    isPassword: (data: any) => boolean;
    isCurve: (data: any) => boolean;
    isBase64: (data: any) => boolean;
    isSignature: (data: any) => boolean;
    isHex: (data: any) => boolean;
    isObject: (val: any) => boolean;
    isString: (val: any) => boolean;
    isset: (val: any) => boolean;
    arraySet: (arrayName: any) => boolean;
    nT: (cb: any) => () => void;
    sF: (cb: any) => any;
    hE: (cb: any, errors: any) => (err: any) => any;
    emptyUnion: (arr1: any, arr2: any) => boolean;
    inArray: (haystack: any, needle: any) => boolean;
    firstCapital: (string: any) => any;
};
