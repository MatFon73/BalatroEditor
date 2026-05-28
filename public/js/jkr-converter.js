let _tokenIndex = 0;
let _tokens = [];

function tokenize(luaString) {
    const tokens = [];
    let i = 0;
    while (i < luaString.length) {
        const ch = luaString[i];
        if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { i++; continue; }
        if (ch === '{' || ch === '}' || ch === '[' || ch === ']' || ch === '=' || ch === ',') {
            tokens.push({ type: ch, value: ch });
            i++; continue;
        }
        if (ch === '"') {
            let str = '';
            i++;
            while (i < luaString.length) {
                if (luaString[i] === '\\' && i + 1 < luaString.length) {
                    str += luaString[i + 1];
                    i += 2;
                } else if (luaString[i] === '"') {
                    i++;
                    break;
                } else {
                    str += luaString[i];
                    i++;
                }
            }
            tokens.push({ type: 'string', value: str });
            continue;
        }
        if (ch === '-' || ch === '.' || (ch >= '0' && ch <= '9')) {
            let num = '';
            while (i < luaString.length && (
                luaString[i] === '-' || luaString[i] === '.' ||
                (luaString[i] >= '0' && luaString[i] <= '9') ||
                luaString[i] === 'e' || luaString[i] === 'E' ||
                luaString[i] === '+'
            )) {
                num += luaString[i];
                i++;
            }
            tokens.push({ type: 'number', value: parseFloat(num) });
            continue;
        }
        if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
            let word = '';
            while (i < luaString.length && (
                (luaString[i] >= 'a' && luaString[i] <= 'z') ||
                (luaString[i] >= 'A' && luaString[i] <= 'Z') ||
                (luaString[i] >= '0' && luaString[i] <= '9') ||
                luaString[i] === '_'
            )) {
                word += luaString[i];
                i++;
            }
            if (word === 'true') tokens.push({ type: 'bool', value: true });
            else if (word === 'false') tokens.push({ type: 'bool', value: false });
            else if (word === 'nil') tokens.push({ type: 'nil', value: null });
            else throw new Error('Unknown identifier: ' + word);
            continue;
        }
        throw new Error('Unexpected character: ' + ch + ' at position ' + i);
    }
    return tokens;
}

function peek() {
    return _tokens[_tokenIndex] || null;
}

function consume(type) {
    const token = peek();
    if (!token || (type && token.type !== type)) {
        throw new Error('Expected ' + type + ' but got ' + (token ? token.type : 'EOF'));
    }
    _tokenIndex++;
    return token;
}

function parseValue() {
    const token = peek();
    if (!token) throw new Error('Unexpected end of Lua data');
    if (token.type === '{') return parseTable();
    if (token.type === 'string') { consume('string'); return token.value; }
    if (token.type === 'number') { consume('number'); return token.value; }
    if (token.type === 'bool') { consume('bool'); return token.value; }
    if (token.type === 'nil') { consume('nil'); return null; }
    throw new Error('Unexpected token: ' + token.type + ' (' + token.value + ')');
}

function parseTable() {
    consume('{');
    const result = {};
    while (peek() && peek().type !== '}') {
        consume('[');
        let key;
        const keyToken = peek();
        if (keyToken.type === 'string') {
            key = consume('string').value;
        } else if (keyToken.type === 'number') {
            key = String(consume('number').value);
        } else {
            throw new Error('Expected string or number key');
        }
        consume(']');
        consume('=');
        result[key] = parseValue();
        if (peek() && peek().type === ',') {
            consume(',');
        }
    }
    consume('}');
    return result;
}

function parseObjFromLua(luaString) {
    if (luaString.startsWith('return ')) {
        luaString = luaString.substring(7);
    }
    _tokens = tokenize(luaString);
    _tokenIndex = 0;
    const result = parseValue();
    if (_tokenIndex !== _tokens.length) {
        throw new Error('Unexpected trailing content in Lua data');
    }
    return result;
}

function convertObjToLua(obj) {
    let result = "";
    for (let key in obj) {
        let value = obj[key];
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            value = convertObjToLua(value);
        } else if (typeof value === 'string') {
            value = '"' + value + '"';
        } else if (typeof value === 'boolean') {
            value = value ? 'true' : 'false';
        } else if (value === null || value === undefined) {
            value = 'nil';
        }
        let luaKey = key;
        if (typeof key === 'string' && /^\d+$/.test(key)) {
            luaKey = key;
        } else if (typeof key === 'string') {
            luaKey = '"' + key + '"';
        }
        result += '[' + luaKey + ']=' + value + ',';
    }
    return '{' + result + '}';
}

function encodeObj(obj) {
    const result = {};
    for (let key in obj) {
        let newKey = key;
        let value = obj[key];
        if (!isNaN(key) && Number.isInteger(Number(key))) {
            newKey = '\t\f' + key;
        }
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            value = encodeObj(value);
        }
        result[newKey] = value;
    }
    return result;
}

function decodeObj(obj) {
    const result = {};
    for (let key in obj) {
        let newKey = key;
        let value = obj[key];
        if (typeof key === 'string' && key.startsWith('\t\f')) {
            newKey = parseInt(key.substring(2));
        }
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            value = decodeObj(value);
        }
        result[newKey] = value;
    }
    return result;
}

function decompressRaw(fileBytes) {
    if (typeof pako === 'undefined') {
        throw new Error('pako library not loaded. Include: https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js');
    }
    try {
        const decompressed = pako.inflateRaw(fileBytes);
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(decompressed);
    } catch (e) {
        throw new Error('Failed to decompress JKR file: ' + e.message);
    }
}

function compressRaw(luaString) {
    if (typeof pako === 'undefined') {
        throw new Error('pako library not loaded. Include: https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js');
    }
    try {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(luaString);
        return pako.deflateRaw(bytes, { level: 1 });
    } catch (e) {
        throw new Error('Failed to compress to JKR format: ' + e.message);
    }
}

async function decompressFromJkr(fileBytes) {
    try {
        const luaString = decompressRaw(fileBytes);
        const obj = parseObjFromLua(luaString);
        return encodeObj(obj);
    } catch (e) {
        throw e;
    }
}

async function compressToJkr(obj) {
    try {
        const decodedObj = decodeObj(obj);
        const luaString = 'return ' + convertObjToLua(decodedObj);
        return compressRaw(luaString);
    } catch (e) {
        throw e;
    }
}

async function jkrToJson(jkrBytes) {
    return await decompressFromJkr(jkrBytes);
}

async function jsonToJkr(jsonData) {
    return await compressToJkr(jsonData);
}
