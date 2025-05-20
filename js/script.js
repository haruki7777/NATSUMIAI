const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatBox = document.getElementById('chat-box');
const viewHistoryButton = document.getElementById('view-history-button');
const historyArea = document.getElementById('history-area');
const mainChatArea = document.getElementById('main-chat-area');
const historyList = document.getElementById('history-list');
const deleteSelectedButton = document.getElementById('delete-selected-button');
const backToChatButton = document.getElementById('back-to-chat-button');
const newChatButton = document.getElementById('new-chat-button');

// Render 서버 주소, 하루키 서버에 맞게 바꿔라~!
const API_ENDPOINT = 'https://natsumi-mi-shu.onrender.com/natsumi';

// 로컬 스토리지 키명
const HISTORY_STORAGE_KEY = 'haruki-ai-chat-history-list';

let allChatHistories = [];
let currentChatId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAllHistories();

    if (allChatHistories.length > 0) {
        // 가장 최근 대화로 복귀
        const lastValidChat = allChatHistories.slice().reverse().find(chat => chat && chat.id);
        if (lastValidChat) {
            currentChatId = lastValidChat.id;
            renderChatMessages(currentChatId);
        } else {
            allChatHistories = [];
            startNewChat();
        }
    } else {
        startNewChat();
    }

    userInput.focus();
});

// 새 대화 시작 함수
function startNewChat() {
    currentChatId = `chat-${Date.now()}`;
    allChatHistories.push({ id: currentChatId, messages: [] });
    saveAllHistories();
    renderChatMessages(currentChatId);
    chatBox.innerHTML = '';
    appendAiMessage('뭐야 할말이라도 있는거야?');
}

// 저장된 기록 로드
function loadAllHistories() {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (data) {
        try {
            allChatHistories = JSON.parse(data);
            if (!Array.isArray(allChatHistories)) allChatHistories = [];
            allChatHistories = allChatHistories.filter(chat => chat && chat.id && Array.isArray(chat.messages));
        } catch (e) {
            console.error('기록 불러오기 실패:', e);
            allChatHistories = [];
            localStorage.removeItem(HISTORY_STORAGE_KEY);
        }
    } else {
        allChatHistories = [];
    }
}

// 기록 저장
function saveAllHistories() {
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(allChatHistories));
    } catch (e) {
        console.error('기록 저장 실패:', e);
    }
}

// 메시지 추가 (대화기록 + 화면)
function addMessageToCurrentChatHistory(sender, text) {
    const chat = allChatHistories.find(c => c.id === currentChatId);
    if (!chat) {
        startNewChat();
        addMessageToCurrentChatHistory(sender, text);
        return;
    }
    chat.messages.push({ sender, text });
    saveAllHistories();
}

function appendUserMessage(text) {
    const p = document.createElement('p');
    p.classList.add('user-message');
    p.textContent = text;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendAiMessage(text) {
    const p = document.createElement('p');
    p.classList.add('ai-message');
    p.textContent = text;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function renderChatMessages(chatId) {
    chatBox.innerHTML = '';
    const chat = allChatHistories.find(c => c.id === chatId);
    if (!chat) return;

    for (const msg of chat.messages) {
        if (msg.sender === 'user') {
            appendUserMessage(msg.text);
        } else {
            appendAiMessage(msg.text);
        }
    }
}

// 보내기 버튼 클릭 또는 Enter 입력 시 처리
async function processUserInput() {
    const question = userInput.value.trim();
    if (!question) return;

    addMessageToCurrentChatHistory('user', question);
    appendUserMessage(question);
    userInput.value = '';
    userInput.disabled = true;
    sendButton.disabled = true;

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: question }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`서버 오류: ${response.status}, 내용: ${errorText}`);
            throw new Error('서버가 말을 안 듣는 것 같아...');
        }

        const data = await response.json();
        const answer = data.answer || '뭐야, 이상한 답변이야!';

        addMessageToCurrentChatHistory('ai', answer);
        appendAiMessage(answer);

    } catch (error) {
        console.error('API 통신 에러:', error);
        const errorMsg = '죄송해요, 답변을 받을 수 없어요. 콘솔 확인해봐요.';
        addMessageToCurrentChatHistory('ai', errorMsg);
        appendAiMessage(errorMsg);
    } finally {
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}

sendButton.addEventListener('click', processUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        processUserInput();
    }
});

// 기록 보기 버튼 클릭
viewHistoryButton.addEventListener('click', () => {
    mainChatArea.classList.add('hidden');
    historyArea.classList.remove('hidden');
    renderHistoryList();
});

// 채팅으로 돌아가기 버튼 클릭
backToChatButton.addEventListener('click', () => {
    historyArea.classList.add('hidden');
    mainChatArea.classList.remove('hidden');
});

// 새 대화 시작 버튼 클릭
newChatButton.addEventListener('click', () => {
    startNewChat();
});

// 기록 목록 렌더링
function renderHistoryList() {
    historyList.innerHTML = '';
    allChatHistories.forEach(chat => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = chat.id;
        checkbox.classList.add('history-checkbox');

        const label = document.createElement('label');
        label.textContent = `대화 - ${new Date(parseInt(chat.id.split('-')[1], 10)).toLocaleString()}`;
        label.addEventListener('click', () => {
            currentChatId = chat.id;
            renderChatMessages(chat.id);
            historyArea.classList.add('hidden');
            mainChatArea.classList.remove('hidden');
        });

        li.appendChild(checkbox);
        li.appendChild(label);
        historyList.appendChild(li);
    });
}

// 선택된 기록 삭제
deleteSelectedButton.addEventListener('click', () => {
    const checkedBoxes = document.querySelectorAll('.history-checkbox:checked');
    if (checkedBoxes.length === 0) {
        alert('삭제할 대화를 선택해!');
        return;
    }

    if (!confirm('정말 선택한 대화를 삭제할 거야?')) return;

    checkedBoxes.forEach(cb => {
        const idToDelete = cb.value;
        allChatHistories = allChatHistories.filter(chat => chat.id !== idToDelete);
        if (currentChatId === idToDelete) {
            currentChatId = null;
        }
    });

    saveAllHistories();
    renderHistoryList();

    if (!currentChatId && allChatHistories.length > 0) {
        currentChatId = allChatHistories[allChatHistories.length - 1].id;
        renderChatMessages(currentChatId);
    } else if (!currentChatId) {
        startNewChat();
    }
});