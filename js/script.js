console.log('1. script.js 로딩 시작!');

// ⭐️ 대화 세션을 저장할 배열 변수 (메모리에서 관리)
let chatSessions = [];
// ⭐️ 현재 보고 있는 또는 진행 중인 대화 세션의 ID를 저장할 변수
let currentSessionId = null; // 세션 ID는 타임스탬프를 사용할 예정

// ⭐️ localStorage에서 대화 세션들을 불러오는 함수
function loadSessionsFromLocalStorage() {
    const storedSessions = localStorage.getItem('chatSessions');
    if (storedSessions) {
        try {
            chatSessions = JSON.parse(storedSessions);
            console.log('Loaded chat sessions from localStorage:', chatSessions);
        } catch (e) {
            console.error('Failed to parse chat sessions from localStorage', e);
            chatSessions = []; // 데이터가 깨졌으면 초기화
            alert('대화 기록을 불러오는데 실패했습니다. 기록이 초기화될 수 있습니다.');
        }
    } else {
        chatSessions = []; // 저장된 데이터가 없으면 빈 배열로 시작
        console.log('No chat sessions found in localStorage. Starting fresh.');
    }

    // ⭐️ 세션을 시간순(최신순)으로 정렬합니다.
    chatSessions.sort((a, b) => b.timestamp - a.timestamp);

    // ⭐️ 페이지 로드 시 어떤 대화를 보여줄지 결정
    const storedCurrentSessionId = localStorage.getItem('currentSessionId');
    if (storedCurrentSessionId) {
        const sessionToLoad = chatSessions.find(session => session.id === parseFloat(storedCurrentSessionId));
        if (sessionToLoad) {
             currentSessionId = parseFloat(storedCurrentSessionId);
             loadChatMessagesIntoView(sessionToLoad.messages);
             console.log('Loaded current session:', currentSessionId);
        } else {
            console.warn('Current session ID found but session not in list. Starting new chat.');
            startNewChat(false);
        }
    } else if (chatSessions.length > 0) {
        const latestSession = chatSessions[0];
        currentSessionId = latestSession.id;
        loadChatMessagesIntoView(latestSession.messages);
        console.log('No current session ID. Loaded latest chat:', currentSessionId);
    } else {
        console.log('No sessions found. Starting new chat.');
        startNewChat(false);
    }
}

// ⭐️ 현재 대화 세션들을 localStorage에 저장하는 함수
function saveSessionsToLocalStorage() {
    try {
        chatSessions.sort((a, b) => b.timestamp - a.timestamp);
        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
        if (currentSessionId !== null) {
             localStorage.setItem('currentSessionId', currentSessionId);
        } else {
             localStorage.removeItem('currentSessionId');
        }
        console.log('Saved chat sessions and current session ID to localStorage.');
    } catch (e) {
        console.error('Failed to save chat sessions to localStorage', e);
        alert('대화 기록 저장에 실패했습니다. 브라우저 저장 공간이 부족할 수 있습니다.');
    }
}

// ⭐️ 현재 채팅창에 표시된 메시지들을 배열로 가져오는 함수
function getMessagesFromView() {
    const messages = [];
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) {
        console.error('chatBox 요소를 찾을 수 없습니다. 메시지를 가져올 수 없습니다.');
        return messages; // 빈 배열 반환
    }
    const messageElements = chatBox.querySelectorAll('p.user-message, p.ai-message:not(.loading-indicator)');
    messageElements.forEach(el => {
         messages.push({
             sender: el.classList.contains('user-message') ? 'user' : 'ai',
             text: el.textContent,
         });
    });
    return messages;
}

// ⭐️ 메시지 배열을 받아서 채팅창에 표시하는 함수
function loadChatMessagesIntoView(messages) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) {
        console.error('chatBox 요소를 찾을 수 없습니다. 메시지를 표시할 수 없습니다.');
        return;
    }
    chatBox.innerHTML = ''; // 채팅창 비우기

    messages.forEach(msg => {
        const p = document.createElement('p');
        p.classList.add('message', msg.sender === 'user' ? 'user-message' : 'ai-message');
        p.textContent = msg.text;
        chatBox.appendChild(p);
    });

    // ⭐️ 메시지 로드 후 맨 아래로 스크롤 (마지막 메시지로 스크롤) 👇
    const lastMessage = chatBox.lastElementChild;
    if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' }); // 마지막 요소를 부드럽게 보이게 스크롤
    }
    console.log('Messages loaded into chat view and scrolled to bottom.');
}

// ⭐️ 메시지를 채팅창에 추가하는 함수
function addMessageToChat(sender, text, isLoading = false) {
    const chatBox = document.getElementById('chat-box');
     if (!chatBox) {
        console.error('chatBox 요소를 찾을 수 없습니다. 메시지를 추가할 수 없습니다.');
        return null; // 요소가 없으면 null 반환
    }

    const messageElement = document.createElement('p');
    messageElement.classList.add('message', `${sender}-message`);

    if (isLoading) {
         messageElement.classList.add('loading-indicator');
         messageElement.textContent = '입력 중...'; // 로딩 중 텍스트
    } else {
         messageElement.textContent = text;
    }

    chatBox.appendChild(messageElement);

    // ⭐️ 새로 추가된 메시지 요소가 화면에 보이도록 부드럽게 스크롤! 👇
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'end' }); // 맨 끝으로 부드럽게 스크롤

    return messageElement; // 추가된 요소 반환 (로딩 인디케이터 제거 시 사용)
}


// ⭐️ 로딩 인디케이터 표시 함수
function showLoadingIndicator() {
     return addMessageToChat('ai', '입력 중...', true); // AI 메시지로 로딩 인디케이터 추가
}

// ⭐️ 로딩 인디케이터 제거 함수
function removeLoadingIndicator(indicatorElement) {
     const chatBox = document.getElementById('chat-box');
    if (chatBox && indicatorElement && chatBox.contains(indicatorElement)) {
        chatBox.removeChild(indicatorElement);
        console.log('로딩 인디케이터 제거 완료.');
        // ⭐️ 로딩 인디케이터 제거 후에도 마지막 메시지로 스크롤! 👇
        const lastMessage = chatBox.lastElementChild;
         if (lastMessage) {
              lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
         }
    } else {
        console.warn('로딩 인디케이터 요소를 찾거나 제거할 수 없습니다.');
    }
}


// ⭐️ 현재 채팅 세션의 내용을 chatSessions 배열에 업데이트하거나 새로 추가하는 함수
function updateCurrentSession() {
    const currentMessages = getMessagesFromView();

    const initialAIMessageText = "뭐 할말있어?";
    const isEmptyChat = currentMessages.length === 0 || (currentMessages.length === 1 && currentMessages[0]?.text.trim().toLowerCase() === initialAIMessageText.toLowerCase());

    if (isEmptyChat) {
         if (currentSessionId !== null) {
              chatSessions = chatSessions.filter(session => session.id !== currentSessionId);
              console.log('Empty chat session removed:', currentSessionId);
              currentSessionId = null;
              localStorage.removeItem('currentSessionId');
         }
         saveSessionsToLocalStorage();
         console.log('Current chat is empty or initial message. No session saved/updated.');
         return; // 빈 대화는 저장/업데이트 안 함
    }

    let currentSession = chatSessions.find(session => session.id === currentSessionId);

    if (!currentSession) {
        const firstUserMsg = currentMessages.find(msg => msg.sender === 'user');
        const summary = firstUserMsg ? firstUserMsg.text.trim().substring(0, 50) + (firstUserMsg.text.trim().length > 50 ? '...' : '') : `대화 ${new Date().toLocaleString()}`;

        currentSessionId = Date.now();
        currentSession = {
             id: currentSessionId,
             timestamp: Date.now(),
             summary: summary,
             messages: currentMessages
        };
        chatSessions.push(currentSession);
        console.log('Created new session:', currentSessionId);
    } else {
        currentSession.messages = currentMessages;
        const firstUserMsg = currentMessages.find(msg => msg.sender === 'user');
        if (firstUserMsg) {
             currentSession.summary = firstUserMsg.text.trim().substring(0, 50) + (firstUserMsg.text.trim().length > 50 ? '...' : '');
        }
        currentSession.timestamp = Date.now();
        console.log('Updated session:', currentSessionId);
    }

    saveSessionsToLocalStorage();
}

// ⭐️ 메시지 전송 후 AI 응답까지 받은 뒤에 세션을 저장하도록 수정
async function handleSend() {
    console.log('보내기 버튼/Enter 키 입력 감지!');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
     if (!userInput || !chatBox) {
        console.error('필수 요소를 찾을 수 없습니다 (userInput 또는 chatBox). 메시지를 전송할 수 없습니다.');
        return;
    }

    const message = userInput.value.trim();
    if (!message) {
        console.warn('입력 메시지가 비어있습니다.');
        return;
    }

    addMessageToChat('user', message); // 메시지 추가 및 스크롤
    userInput.value = '';
    console.log('사용자 메시지 추가됨.');

    updateCurrentSession();

    const loadingIndicator = showLoadingIndicator(); // 로딩 인디케이터 추가 및 스크롤
    console.log('로딩 인디케이터 표시됨.');

    const aiReply = await sendMessageToServer(message);
    console.log('AI 응답 수신:', aiReply);

    removeLoadingIndicator(loadingIndicator); // 로딩 인디케이터 제거 및 스크롤
    console.log('로딩 인디케이터 제거됨.');

    addMessageToChat('ai', aiReply); // AI 메시지 추가 및 스크롤
    console.log('AI 메시지 추가됨.');

    updateCurrentSession();
}

// ⭐️ 새 채팅 시작 함수 수정 (현재 대화 저장 기능 추가 및 초기 메시지 변경)
function startNewChat(saveCurrent = true) {
    console.log('새 채팅 시작 요청 감지!');

    if (saveCurrent) {
         console.log('현재 대화 저장 후 새 채팅 시작.');
         updateCurrentSession();
    } else {
         console.log('현재 대화 저장 안 함. 바로 새 채팅 시작.');
         const currentMessages = getMessagesFromView();
         const initialAIMessageText = "뭐 할말있어?";
         const isEmptyChat = currentMessages.length === 0 || (currentMessages.length === 1 && currentMessages[0]?.text.trim().toLowerCase() === initialAIMessageText.toLowerCase());

         if (currentSessionId !== null && isEmptyChat) {
              chatSessions = chatSessions.filter(session => session.id !== currentSessionId);
              saveSessionsToLocalStorage();
              console.log('Empty current session removed before new chat (saveCurrent=false).');
         }
    }

    const chatBox = document.getElementById('chat-box');
    const historyArea = document.getElementById('history-area');
    const mainChatArea = document.getElementById('main-chat-area');
    const deleteSelectedButton = document.getElementById('delete-selected-button');
    const backToChatButton = document.getElementById('back-to-chat-button');
    const menuItemsContainer = document.getElementById('menu-items-container');

    if (chatBox) {
        chatBox.innerHTML = ''; // 채팅창 비우기
        // HTML에 직접 넣은 초기 메시지를 새 채팅 시작 시 다시 추가! 👇
        // addMessageToChat 함수는 메시지 추가 후 자동으로 스크롤합니다.
        addMessageToChat('ai', "뭐 할말있어?");
         console.log('새 채팅 시작 - 초기 메시지 다시 추가됨.');

    } else console.error('chatBox 요소를 찾을 수 없어 채팅창을 비울 수 없습니다.');

    currentSessionId = null;
    localStorage.removeItem('currentSessionId');
    console.log('Current session ID reset.');

    if (historyArea) historyArea.classList.add('hidden');
    if (mainChatArea) mainChatArea.classList.remove('hidden');
    if (deleteSelectedButton) deleteSelectedButton.classList.add('hidden');
    if (backToChatButton) backToChatButton.classList.add('hidden');
    console.log('UI switched to chat view.');

    if (menuItemsContainer && !menuItemsContainer.classList.contains('hidden')) {
        menuItemsContainer.classList.add('hidden');
        console.log('새 채팅 시작 시 메뉴 항목 숨김.');
    }

    console.log('새 채팅 시작 기능 실행 완료.');
}

// ⭐️ 채팅으로 돌아가기 함수
function backToChat() {
     console.log('채팅으로 돌아가기 버튼 클릭 감지!');
    const historyArea = document.getElementById('history-area');
    const mainChatArea = document.getElementById('main-chat-area');
    const deleteSelectedButton = document.getElementById('delete-selected-button');
    const backToChatButton = document.getElementById('back-to-chat-button');
    const chatBox = document.getElementById('chat-box');
    const menuItemsContainer = document.getElementById('menu-items-container');

     if(historyArea && historyArea.classList.contains('hidden')) {
          console.log('이미 채팅 화면입니다. 돌아가기 동작 안 함.');
          return;
     }

     const sessionToLoad = chatSessions.find(session => session.id === currentSessionId);
     if (currentSessionId === null || !sessionToLoad) {
         console.warn('현재 세션이 없거나 찾을 수 없습니다. 새 채팅 화면으로 전환합니다.');
         startNewChat(false);
         return;
     }

     // 현재 세션의 메시지들을 다시 로드하여 채팅창에 표시
     // loadChatMessagesIntoView 함수 안에서 chatBox 비우고 채우고 스크롤까지 처리합니다.
     loadChatMessagesIntoView(sessionToLoad.messages);

     if (historyArea) historyArea.classList.add('hidden');
     if (mainChatArea) mainChatArea.classList.remove('hidden');
     if (deleteSelectedButton) deleteSelectedButton.classList.add('hidden');
     if (backToChatButton) backToChatButton.classList.add('hidden');

    if (menuItemsContainer && !menuItemsContainer.classList.contains('hidden')) {
        menuItemsContainer.classList.add('hidden');
        console.log('채팅으로 돌아가기 시 메뉴 항목 숨김.');
    }

     console.log('채팅 화면으로 돌아가기 완료. 현재 세션 로드됨.');
}

// ⭐️ 대화 기록 보기 함수 수정 (localStorage에서 불러와서 목록 표시)
function viewHistory() {
    console.log('대화 기록 보기 버튼 클릭 감지!');

    const historyArea = document.getElementById('history-area');
    const mainChatArea = document.getElementById('main-chat-area');
    const deleteSelectedButton = document.getElementById('delete-selected-button');
    const backToChatButton = document.getElementById('back-to-chat-button');
    const historyList = document.getElementById('history-list');
    const menuItemsContainer = document.getElementById('menu-items-container');

    console.log('대화 기록 보기 전 현재 대화 저장 시도.');
    updateCurrentSession(); // 현재 대화 상태 저장

    loadSessionsFromLocalStorage(); // 최신 기록 불러오기

    if (mainChatArea) mainChatArea.classList.add('hidden');
    if (historyArea) historyArea.classList.remove('hidden');

    if (deleteSelectedButton) deleteSelectedButton.classList.remove('hidden');
    if (backToChatButton) backToChatButton.classList.remove('hidden');
    console.log('UI switched to history view. History buttons shown.');

    if (menuItemsContainer && !menuItemsContainer.classList.contains('hidden')) {
        menuItemsContainer.classList.add('hidden');
        console.log('기록 보기 시 메뉴 항목 숨김.');
    }

    if (historyList) historyList.innerHTML = '';
    else { console.error('historyList 요소를 찾을 수 없습니다.'); return; }

    if (chatSessions.length === 0) {
         const li = document.createElement('li');
         li.textContent = '저장된 대화 기록이 없습니다.';
         historyList.appendChild(li);
         console.log('No chat sessions to display in history.');
         if(deleteSelectedButton) deleteSelectedButton.disabled = true;
         return;
    } else {
         if(deleteSelectedButton) deleteSelectedButton.disabled = false;
    }

    chatSessions.forEach(session => {
        const li = document.createElement('li');
        const summaryText = session.summary || `대화 ${new Date(session.timestamp).toLocaleString()}`;
        li.innerHTML = `<input type="checkbox" data-session-id="${session.id}"> <span>${summaryText}</span>`;

        const span = li.querySelector('span');
        if (span) {
            span.style.cursor = 'pointer';
            span.addEventListener('click', () => {
                console.log('기록 선택됨 (클릭): 세션 ID', session.id);
                loadSession(session.id); // loadSession에서 스크롤 처리됨
            });
        }

        const checkbox = li.querySelector('input[type="checkbox"]');
        if(checkbox) {
            checkbox.addEventListener('click', (event) => {
                event.stopPropagation();
                console.log('체크박스 클릭됨:', session.id, '상태:', event.target.checked);
            });
        }

        historyList.appendChild(li);
    });

    console.log('대화 기록 보기 기능 실행 완료.');
}

// ⭐️ 특정 대화 세션을 불러와서 채팅창에 표시하는 함수
function loadSession(sessionId) {
    console.log('세션 로드 요청됨:', sessionId);
    const numericSessionId = parseFloat(sessionId);

    const sessionToLoad = chatSessions.find(session => session.id === numericSessionId);

    const historyArea = document.getElementById('history-area');
    const mainChatArea = document.getElementById('main-chat-area');
    const deleteSelectedButton = document.getElementById('delete-selected-button');
    const backToChatButton = document.getElementById('back-to-chat-button');
    const chatBox = document.getElementById('chat-box');
    const menuItemsContainer = document.getElementById('menu-items-container');

    if (sessionToLoad) {
        console.log('Found session to load:', sessionToLoad);
        currentSessionId = sessionToLoad.id;
        saveSessionsToLocalStorage();

        // 해당 세션의 메시지들을 채팅창에 표시
        // loadChatMessagesIntoView 함수 안에서 chatBox 비우고 채우고 스크롤까지 처리합니다.
        loadChatMessagesIntoView(sessionToLoad.messages);

        if (historyArea) historyArea.classList.add('hidden');
        if (mainChatArea) mainChatArea.classList.remove('hidden');
        if (deleteSelectedButton) deleteSelectedButton.classList.add('hidden');
        if (backToChatButton) backToChatButton.classList.add('hidden');

        if (menuItemsContainer && !menuItemsContainer.classList.contains('hidden')) {
            menuItemsContainer.classList.add('hidden');
            console.log('세션 로드 시 메뉴 항목 숨김.');
        }

        console.log('세션 로드 완료:', sessionId);
    } else {
        console.error('Error: 세션을 찾을 수 없습니다:', sessionId);
        alert('해당 대화 기록을 찾을 수 없습니다!');
        currentSessionId = null;
        localStorage.removeItem('currentSessionId');
        // 세션 로드 실패 시 새 채팅 시작 (초기 메시지 포함). 메뉴 닫기 처리됨.
        startNewChat(false);
    }
}

// ⭐️ 선택된 대화 기록을 삭제하는 함수
function handleDeleteSelected() {
    console.log('선택 삭제 버튼 클릭 감지!');
    const historyList = document.getElementById('history-list');
    const deleteSelectedButton = document.getElementById('delete-selected-button');
    const menuItemsContainer = document.getElementById('menu-items-container');

    if (!historyList || !deleteSelectedButton) {
         console.error('필수 요소를 찾을 수 없습니다 (historyList 또는 deleteSelectedButton). 삭제를 진행할 수 없습니다.');
         return;
    }

    const selectedCheckboxes = historyList.querySelectorAll('input[type="checkbox"]:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseFloat(cb.dataset.sessionId));

    if (selectedIds.length === 0) {
        alert('삭제할 기록을 선택해주세요!');
        console.warn('삭제할 기록이 선택되지 않음.');
        return;
    }

    console.log('삭제할 세션 ID:', selectedIds);

    if (!confirm(`정말로 선택된 ${selectedIds.length}개의 기록을 삭제하시겠습니까?`)) {
         console.log('삭제 취소됨.');
         return; // 취소 시 함수 종료
    }

    const initialSessionCount = chatSessions.length;
    chatSessions = chatSessions.filter(session => !selectedIds.includes(session.id));
    const deletedCount = initialSessionCount - chatSessions.length;

    console.log(`${deletedCount}개의 세션이 삭제되었습니다.`);

    if (currentSessionId !== null && selectedIds.includes(currentSessionId)) {
        console.log('현재 세션이 삭제되었습니다. 새 채팅을 시작합니다.');
        // 새 채팅 시작 (초기 메시지 포함). startNewChat 내부에서 메뉴 닫기 및 스크롤 처리됨.
        startNewChat(false);
        alert(`${deletedCount}개의 기록을 삭제했습니다!`);
    } else {
        saveSessionsToLocalStorage();
        // 기록 화면 새로고침. viewHistory 함수 내부에서 메뉴 닫기 처리됨.
        viewHistory();
        alert(`${deletedCount}개의 기록을 삭제했습니다!`);
    }

    console.log('선택 삭제 기능 실행 완료.');
}

// 서버 통신 함수
async function sendMessageToServer(message) {
    try {
        const res = await fetch('https://natsumi-mi-shu.onrender.com/natsumi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
         if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`서버 응답 에러: 상태 ${res.status} - ${errorData.reply || errorData.error || res.statusText || '알 수 없는 오류 발생'}`);
        }
        const data = await res.json();
        return data.reply || '서버 응답 형식이 올바르지 않습니다.';
    } catch (err) {
        console.error('서버 통신 에러:', err);
        return `서버 통신 에러: ${err.message || '데이터를 가져오는데 실패했습니다.'}`;
    }
}

// DOMContentLoaded 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    console.log('2. DOMContentLoaded 실행!');

    // ⭐️ 필요한 DOM 요소들을 모두 가져옵니다.
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    const newChatButton = document.getElementById('new-chat-button');
    const viewHistoryButton = document.getElementById('view-history-button');

    const historyArea = document.getElementById('history-area');
    const mainChatArea = document.getElementById('main-chat-area');

    const deleteSelectedButton = document.getElementById('delete-selected-button');
    const backToChatButton = document.getElementById('back-to-chat-button');
    const historyList = document.getElementById('history-list');

    const menuToggleButton = document.getElementById('menu-toggle-button');
    const menuItemsContainer = document.getElementById('menu-items-container');

    // ⭐️ 요소들이 제대로 가져와졌는지 확인하는 콘솔 로그
    console.log('DOM 요소 확인:');
    console.log('sendButton:', sendButton);
    console.log('userInput:', userInput);
    console.log('chatBox:', chatBox);
    console.log('newChatButton:', newChatButton);
    console.log('viewHistoryButton:', viewHistoryButton);
    console.log('historyArea:', historyArea);
    console.log('mainChatArea:', mainChatArea);
    console.log('deleteSelectedButton:', deleteSelectedButton);
    console.log('backToChatButton:', backToChatButton);
    console.log('historyList:', historyList);
    console.log('menuToggleButton:', menuToggleButton);
    console.log('menuItemsContainer:', menuItemsContainer);

    // ⭐️ 필수 요소가 누락되었는지 확인하고 누락 시 스크립트 중단
    if (!sendButton || !userInput || !chatBox || !newChatButton || !viewHistoryButton || !historyArea || !mainChatArea || !deleteSelectedButton || !backToChatButton || !historyList || !menuToggleButton || !menuItemsContainer) {
        console.error('Error: 필수 DOM 요소를 찾을 수 없습니다. 스크립트 실행을 중단합니다.');
        alert('페이지 로딩 오류! 일부 요소가 없습니다. 브라우저 콘솔을 확인해주세요.');
        return; // 스크ript 실행 중단
    }

    // ⭐️ 페이지 로드 시 localStorage에서 대화 세션들을 불러오고 초기 화면 설정
    // loadSessionsFromLocalStorage 함수 안에서 loadChatMessagesIntoView 호출 시 스크롤 처리됩니다.
    // 저장된 대화가 없으면 startNewChat 호출 시 초기 메시지 추가 및 스크롤 처리됩니다.
    loadSessionsFromLocalStorage();

    // ⭐️ 이벤트 리스너 연결
    sendButton.addEventListener('click', handleSend);
    console.log('sendButton 이벤트 리스너 연결 완료.');

    userInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    console.log('userInput keydown 이벤트 리스너 연결 완료.');

    newChatButton.addEventListener('click', () => startNewChat(true));
    console.log('newChatButton 이벤트 리스너 연결 완료.');

    viewHistoryButton.addEventListener('click', viewHistory);
    console.log('viewHistoryButton 이벤트 리스너 연결 완료.');

    backToChatButton.addEventListener('click', backToChat);
    console.log('backToChatButton 이벤트 리스너 연결 완료.');

    deleteSelectedButton.addEventListener('click', handleDeleteSelected);
    console.log('deleteSelectedButton 이벤트 리스너 연결 완료.');

    // ⭐️ 메뉴 아이콘 클릭 시 메뉴 항목 토글
    menuToggleButton.addEventListener('click', (event) => {
        event.stopPropagation();
        menuItemsContainer.classList.toggle('hidden');
        console.log('메뉴 항목 컨테이너 토글됨. 현재 상태 hidden:', menuItemsContainer.classList.contains('hidden'));
    });
    console.log('menuToggleButton 이벤트 리스너 연결 완료.');

    // ⭐️ 메뉴 항목이 열려 있을 때 화면 아무 곳이나 클릭하면 닫히게 함
    document.addEventListener('click', (event) => {
        if (menuItemsContainer && !menuItemsContainer.classList.contains('hidden')) {
            if (!menuItemsContainer.contains(event.target) && event.target !== menuToggleButton) {
                menuItemsContainer.classList.add('hidden');
                console.log('화면 외부 클릭으로 메뉴 항목 숨김.');
            }
        }
    });
    console.log('전체 화면 클릭 이벤트 리스너 연결 완료 (메뉴 닫기용).');


    console.log('3. DOMContentLoaded 실행 완료! 대화 기록 기능 및 메뉴 기능 연결됨.');
});

console.log('4. script.js 로딩 완료 (DOMContentLoaded 외부).');