/**
 * 隐秘文本加密算法 - JavaScript版本
 * 将文本转换为看起来像汉字的加密文本
 */

class TextEncryption {
    constructor() {
        // 固定的干扰字符：零宽字符
        this.interferenceChar = String.fromCharCode(0x200B); // Zero Width Space
    }

    /**
     * 将文本进行隐秘加密
     * @param {string} text - 要加密的原始文本
     * @returns {string} 加密后的文本
     */
    encryptText(text) {
        if (!text) {
            return "";
        }

        try {
            // 将文本编码为Base64
            const encodedText = btoa(unescape(encodeURIComponent(text)));
            
            const encryptedChars = [];
            
            for (let i = 0; i < encodedText.length; i++) {
                const char = encodedText[i];
                const charVal = char.charCodeAt(0);
                
                // 伪汉字1：基于Base64字符的ASCII值 + 固定偏移量
                // Base64字符的ASCII值范围是 43-122 (+, /, 0-9, A-Z, a-z)
                // 偏移量1：0x4E00 - 43 = 0x4DDB
                // 这样，加密后的字符范围是 U+4E00 到 U+4E7B，都在CJK统一汉字范围内
                const pseudoHanzi1 = String.fromCharCode(charVal + (0x4E00 - 43));
                
                // 伪汉字2：基于Base64字符的ASCII值 + 另一个固定偏移量
                // 偏移量2：0x5000 - 43 = 0x4FDB
                // 这样，加密后的字符范围是 U+5000 到 U+507B，都在CJK统一汉字范围内
                const pseudoHanzi2 = String.fromCharCode(charVal + (0x5000 - 43));
                
                encryptedChars.push(pseudoHanzi1);
                encryptedChars.push(this.interferenceChar); // 使用固定的干扰字符
                encryptedChars.push(pseudoHanzi2);
            }
            
            return encryptedChars.join("");
        } catch (error) {
            throw new Error(`加密失败: ${error.message}`);
        }
    }

    /**
     * 将加密文本解密
     * @param {string} encryptedText - 要解密的加密文本
     * @returns {string} 解密后的原始文本
     */
    decryptText(encryptedText) {
        if (!encryptedText) {
            return "";
        }

        try {
            // 移除零宽字符（只移除我们加密时使用的固定零宽字符）
            let cleanText = encryptedText.replace(new RegExp(String.fromCharCode(0x200B), 'g'), "");
            // 确保其他零宽字符不会影响解密，虽然我们加密时只用一个，但以防万一
            cleanText = cleanText.replace(new RegExp(String.fromCharCode(0x200C), 'g'), "");
            cleanText = cleanText.replace(new RegExp(String.fromCharCode(0x200D), 'g'), "");
            cleanText = cleanText.replace(new RegExp(String.fromCharCode(0xFEFF), 'g'), "");
            
            const decryptedChars = [];
            
            // 每两个字符还原一个Base64字符
            // 遍历清理后的文本，每两个字符（伪汉字1和伪汉字2）还原一个Base64字符
            // 我们可以只取第一个伪汉字进行还原，因为第二个伪汉字是冗余的，用于增加隐蔽性
            
            let i = 0;
            while (i < cleanText.length) {
                // 取第一个伪汉字
                const pseudoHanzi1Val = cleanText.charCodeAt(i);
                
                // 还原Base64字符的ASCII值
                const originalCharVal = pseudoHanzi1Val - (0x4E00 - 43);
                decryptedChars.push(String.fromCharCode(originalCharVal));
                
                // 跳过第二个伪汉字
                i += 2;
            }
            
            // 解码Base64
            const base64String = decryptedChars.join("");
            const decodedText = decodeURIComponent(escape(atob(base64String)));
            
            return decodedText;
        } catch (error) {
            throw new Error(`解密失败: ${error.message}`);
        }
    }

    /**
     * 测试加密解密功能
     * @param {string} testText - 测试文本
     * @returns {object} 测试结果
     */
    test(testText = "你好，世界！这是一个测试消息，包含中文、数字123和英文abc。") {
        try {
            const encrypted = this.encryptText(testText);
            const decrypted = this.decryptText(encrypted);
            
            return {
                success: true,
                original: testText,
                encrypted: encrypted,
                decrypted: decrypted,
                testPassed: testText === decrypted,
                originalLength: testText.length,
                encryptedLength: encrypted.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// 创建全局实例
const textEncryption = new TextEncryption();

// 导出函数供HTML页面使用
function encryptText(text) {
    return textEncryption.encryptText(text);
}

function decryptText(encryptedText) {
    return textEncryption.decryptText(encryptedText);
}

function testEncryption(testText) {
    return textEncryption.test(testText);
}

// 如果在Node.js环境中，导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TextEncryption,
        encryptText,
        decryptText,
        testEncryption
    };
}

