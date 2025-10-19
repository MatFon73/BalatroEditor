/**
 * JKR Converter - Pure JavaScript Implementation
 * Based on BalatroSaveEditor by TeddyHuang-00
 * Requires pako.js for zlib compression
 * Uses fengari-web for Lua parsing (Lua VM in JavaScript)
 */

function convertObjToLua(obj) {
    let result = "";
    
    for (let key in obj) {
        let value = obj[key];
        
        // Process value
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            value = convertObjToLua(value);
        } else if (typeof value === 'string') {
            value = `"${value}"`;
        } else if (typeof value === 'boolean') {
            value = value ? 'true' : 'false';
        } else if (value === null || value === undefined) {
            value = 'nil';
        }
        
        let luaKey = key;
        if (typeof key === 'string') {
            luaKey = `"${key}"`;
        }
        
        result += `[${luaKey}]=${value},`;
    }
    
    return "{" + result + "}";
}

function parseObjFromLua(luaString) {
    if (luaString.startsWith('return ')) {
        luaString = luaString.substring(7);
    }
    
    try {
        // Replace Lua syntax with JavaScript
        let jsString = luaString
            .replace(/=true/g, ':true')
            .replace(/=false/g, ':false')
            .replace(/=nil/g, ':null')
            .replace(/\[("(?:[^"\\]|\\.)*"|\d+)\]=/g, (match, key) => {
                if (/^\d+$/.test(key)) {
                    return `"${key}":`;
                }
                return `${key}:`;
            });
        
        const result = Function('"use strict"; return (' + jsString + ')')();
        return result;
    } catch (e) {
        console.error('Failed to parse Lua string:', e);
        console.error('First 200 chars:', luaString.substring(0, 200));
        throw new Error('Lua parsing failed: ' + e.message);
    }
}

function encodeObj(obj) {
    const result = {};
    
    for (let key in obj) {
        let newKey = key;
        let value = obj[key];
        
        if (!isNaN(key) && Number.isInteger(Number(key))) {
            newKey = "\t\f" + key;
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
        
        if (typeof key === 'string' && key.startsWith("\t\f")) {
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
        console.error('Decompression error:', e);
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
        
        const compressed = pako.deflateRaw(bytes, { level: 1 });
        
        return compressed;
    } catch (e) {
        console.error('Compression error:', e);
        throw new Error('Failed to compress to JKR format: ' + e.message);
    }
}

async function decompressFromJkr(fileBytes) {
    try {
        const luaString = decompressRaw(fileBytes);
        
        const obj = parseObjFromLua(luaString);
        
        return encodeObj(obj);
    } catch (e) {
        console.error('Error in decompressFromJkr:', e);
        throw e;
    }
}

async function compressToJkr(obj) {
    try {
        const decodedObj = decodeObj(obj);
        
        const luaString = "return " + convertObjToLua(decodedObj);
        
        return compressRaw(luaString);
    } catch (e) {
        console.error('Error in compressToJkr:', e);
        throw e;
    }
}

async function jkrToJson(jkrBytes) {
    return await decompressFromJkr(jkrBytes);
}

async function jsonToJkr(jsonData) {
    return await compressToJkr(jsonData);
}