/**
 * 隐秘文本加密工具 - 应用逻辑
 * 处理用户界面交互和功能调用
 */

// 应用状态管理
const AppState = {
    currentTab: 'encrypt',
    isProcessing: false
};

// DOM元素引用
const Elements = {
    // 选项卡
    encryptTab: null,
    decryptTab: null,
    tabButtons: null,
    
    // 输入输出元素
    originalText: null,
    encryptedText: null,
    encryptedInput: null,
    decryptedResult: null,
    
    // 状态和统计
    status: null,
    loading: null,
    stats: null,
    originalLength: null,
    encryptedLength: null,
    compressionRatio: null,
    
    // 按钮
    encryptBtn: null,
    decryptBtn: null,
    copyBtns: null,
    clearBtns: null
};

// 初始化应用
function initializeApp() {
    // 获取DOM元素引用
    Elements.encryptTab = document.getElementById('encrypt-tab');
    Elements.decryptTab = document.getElementById('decrypt-tab');
    Elements.tabButtons = document.querySelectorAll('.tab-button');
    
    Elements.originalText = document.getElementById('originalText');
    Elements.encryptedText = document.getElementById('encryptedText');
    Elements.encryptedInput = document.getElementById('encryptedInput');
    Elements.decryptedResult = document.getElementById('decryptedResult');
    
    Elements.status = document.getElementById('status');
    Elements.loading = document.getElementById('loading');
    Elements.stats = document.getElementById('stats');
    Elements.originalLength = document.getElementById('originalLength');
    Elements.encryptedLength = document.getElementById('encryptedLength');
    Elements.compressionRatio = document.getElementById('compressionRatio');
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 运行自测试
    runSelfTest();
    
    console.log('隐秘文本加密工具已初始化');
}

// 绑定事件监听器
function bindEventListeners() {
    // 选项卡切换
    Elements.tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.target.textContent.includes('加密') ? 'encrypt' : 'decrypt';
            switchTab(tabName);
        });
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // 文本区域自动调整高度
    if (Elements.originalText) {
        Elements.originalText.addEventListener('input', autoResizeTextarea);
    }
    if (Elements.encryptedInput) {
        Elements.encryptedInput.addEventListener('input', autoResizeTextarea);
    }
}

// 处理键盘快捷键
function handleKeyboardShortcuts(e) {
    // Ctrl+Enter 执行当前选项卡的主要操作
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (AppState.currentTab === 'encrypt') {
            performEncryption();
        } else {
            performDecryptionFromInput();
        }
    }
    
    // Ctrl+1 切换到加密选项卡
    if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        switchTab('encrypt');
    }
    
    // Ctrl+2 切换到解密选项卡
    if (e.ctrlKey && e.key === '2') {
        e.preventDefault();
        switchTab('decrypt');
    }
}

// 自动调整文本区域高度
function autoResizeTextarea(e) {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(200, textarea.scrollHeight) + 'px';
}

// 切换选项卡
function switchTab(tabName) {
    // 更新应用状态
    AppState.currentTab = tabName;
    
    // 隐藏所有选项卡内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有按钮的活动状态
    Elements.tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的选项卡内容
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // 激活对应的按钮
    const activeButton = Array.from(Elements.tabButtons).find(btn => 
        (tabName === 'encrypt' && btn.textContent.includes('加密')) ||
        (tabName === 'decrypt' && btn.textContent.includes('解密'))
    );
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // 清空状态和统计信息
    hideStatus();
    hideStats();
    
    console.log(`切换到${tabName === 'encrypt' ? '加密' : '解密'}选项卡`);
}

// 显示状态消息
function showStatus(message, type = 'success') {
    if (!Elements.status) return;
    
    Elements.status.textContent = message;
    Elements.status.className = `status show ${type}`;
    
    // 3秒后自动隐藏
    setTimeout(() => {
        hideStatus();
    }, 3000);
}

// 隐藏状态消息
function hideStatus() {
    if (Elements.status) {
        Elements.status.classList.remove('show');
    }
}

// 显示/隐藏加载状态
function showLoading(show) {
    if (Elements.loading) {
        Elements.loading.classList.toggle('show', show);
    }
    AppState.isProcessing = show;
}

// 更新统计信息
function updateStats(originalLength, encryptedLength) {
    if (!Elements.stats) return;
    
    if (Elements.originalLength) {
        Elements.originalLength.textContent = originalLength;
    }
    if (Elements.encryptedLength) {
        Elements.encryptedLength.textContent = encryptedLength;
    }
    
    const ratio = originalLength > 0 ? Math.round((encryptedLength / originalLength) * 100) : 0;
    if (Elements.compressionRatio) {
        Elements.compressionRatio.textContent = ratio + '%';
    }
    
    Elements.stats.style.display = 'grid';
}

// 隐藏统计信息
function hideStats() {
    if (Elements.stats) {
        Elements.stats.style.display = 'none';
    }
}

// 执行加密操作
function performEncryption() {
    if (AppState.isProcessing) return;
    
    const originalText = Elements.originalText?.value || '';
    
    if (!originalText.trim()) {
        showStatus('请输入要加密的文本', 'error');
        Elements.originalText?.focus();
        return;
    }

    showLoading(true);

    try {
        // 使用异步处理来避免阻塞UI
        setTimeout(() => {
            try {
                const encryptedText = textEncryption.encryptText(originalText);
                
                if (Elements.encryptedText) {
                    Elements.encryptedText.value = encryptedText;
                }
                
                updateStats(originalText.length, encryptedText.length);
                showStatus('加密成功！', 'success');
                
                console.log('加密完成:', {
                    originalLength: originalText.length,
                    encryptedLength: encryptedText.length
                });
            } catch (error) {
                showStatus(`加密失败: ${error.message}`, 'error');
                console.error('加密错误:', error);
            } finally {
                showLoading(false);
            }
        }, 100);
    } catch (error) {
        showStatus(`加密失败: ${error.message}`, 'error');
        showLoading(false);
        console.error('加密错误:', error);
    }
}

// 从独立输入框执行解密操作
function performDecryptionFromInput() {
    if (AppState.isProcessing) return;
    
    const encryptedText = Elements.encryptedInput?.value || '';
    
    if (!encryptedText.trim()) {
        showStatus('请输入要解密的文本', 'error');
        Elements.encryptedInput?.focus();
        return;
    }

    showLoading(true);

    try {
        // 使用异步处理来避免阻塞UI
        setTimeout(() => {
            try {
                const decryptedText = textEncryption.decryptText(encryptedText);
                
                if (Elements.decryptedResult) {
                    Elements.decryptedResult.value = decryptedText;
                }
                
                updateStats(decryptedText.length, encryptedText.length);
                showStatus('解密成功！', 'success');
                
                console.log('解密完成:', {
                    encryptedLength: encryptedText.length,
                    decryptedLength: decryptedText.length
                });
            } catch (error) {
                showStatus(`解密失败: ${error.message}`, 'error');
                console.error('解密错误:', error);
            } finally {
                showLoading(false);
            }
        }, 100);
    } catch (error) {
        showStatus(`解密失败: ${error.message}`, 'error');
        showLoading(false);
        console.error('解密错误:', error);
    }
}

// 复制到剪贴板
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element || !element.value.trim()) {
        showStatus('没有内容可复制', 'error');
        return;
    }

    try {
        // 选择文本
        element.select();
        element.setSelectionRange(0, 99999); // 移动端兼容
        
        // 复制到剪贴板
        const successful = document.execCommand('copy');
        
        if (successful) {
            showStatus('已复制到剪贴板', 'success');
            
            // 添加视觉反馈
            element.style.backgroundColor = '#d4edda';
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 300);
        } else {
            // 尝试使用现代API
            if (navigator.clipboard) {
                navigator.clipboard.writeText(element.value).then(() => {
                    showStatus('已复制到剪贴板', 'success');
                }).catch(() => {
                    showStatus('复制失败，请手动复制', 'error');
                });
            } else {
                showStatus('复制失败，请手动复制', 'error');
            }
        }
    } catch (error) {
        console.error('复制错误:', error);
        showStatus('复制失败，请手动复制', 'error');
    }
}

// 清空函数
function clearOriginal() {
    if (Elements.originalText) {
        Elements.originalText.value = '';
        Elements.originalText.focus();
    }
    hideStats();
}

function clearEncrypted() {
    if (Elements.encryptedText) {
        Elements.encryptedText.value = '';
    }
    hideStats();
}

function clearEncryptedInput() {
    if (Elements.encryptedInput) {
        Elements.encryptedInput.value = '';
        Elements.encryptedInput.focus();
    }
    hideStats();
}

function clearDecryptedResult() {
    if (Elements.decryptedResult) {
        Elements.decryptedResult.value = '';
    }
    hideStats();
}

// 运行自测试
function runSelfTest() {
    try {
        const testResult = testEncryption();
        if (testResult.success && testResult.testPassed) {
            console.log('✅ 加密算法自测试通过');
            console.log('测试详情:', testResult);
        } else {
            console.error('❌ 加密算法自测试失败:', testResult);
        }
    } catch (error) {
        console.error('❌ 自测试过程中发生错误:', error);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initializeApp);

// 导出全局函数供HTML调用
window.switchTab = switchTab;
window.performEncryption = performEncryption;
window.performDecryptionFromInput = performDecryptionFromInput;
window.copyToClipboard = copyToClipboard;
window.clearOriginal = clearOriginal;
window.clearEncrypted = clearEncrypted;
window.clearEncryptedInput = clearEncryptedInput;
window.clearDecryptedResult = clearDecryptedResult;

// 为了向后兼容，保留原有的函数名
window.encryptText = performEncryption;
window.decryptFromInput = performDecryptionFromInput;

