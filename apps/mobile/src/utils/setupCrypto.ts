// Configuração do polyfill para crypto.getRandomValues
// Este arquivo deve ser importado no início da aplicação

import 'react-native-get-random-values';

// Polyfill para btoa e atob no React Native
if (!global.btoa) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    
    global.btoa = (input: string) => {
        let output = '';
        
        for (let i = 0; i < input.length; i += 3) {
            const byte1 = input.charCodeAt(i);
            const byte2 = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
            const byte3 = i + 2 < input.length ? input.charCodeAt(i + 2) : 0;
            
            const bitmap = (byte1 << 16) | (byte2 << 8) | byte3;
            
            output += chars.charAt((bitmap >> 18) & 63);
            output += chars.charAt((bitmap >> 12) & 63);
            output += i + 1 < input.length ? chars.charAt((bitmap >> 6) & 63) : '=';
            output += i + 2 < input.length ? chars.charAt(bitmap & 63) : '=';
        }
        
        return output;
    };
}

if (!global.atob) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    
    global.atob = (input: string) => {
        input = input.replace(/=+$/, '');
        let output = '';
        
        for (let i = 0; i < input.length; i += 4) {
            const encoded1 = chars.indexOf(input.charAt(i));
            const encoded2 = chars.indexOf(input.charAt(i + 1));
            const encoded3 = i + 2 < input.length ? chars.indexOf(input.charAt(i + 2)) : 64;
            const encoded4 = i + 3 < input.length ? chars.indexOf(input.charAt(i + 3)) : 64;
            
            const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
            
            output += String.fromCharCode((bitmap >> 16) & 255);
            if (encoded3 !== 64) output += String.fromCharCode((bitmap >> 8) & 255);
            if (encoded4 !== 64) output += String.fromCharCode(bitmap & 255);
        }
        
        return output;
    };
}

export default {};