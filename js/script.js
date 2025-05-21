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
            // ⭐️ JSON 파싱 시 오류 발생 가능성을 고려하여 try...catch 추가
            chatSessions = JSON.parse(storedSessions);
            console.log('Loaded chat sessions from localStorage:', chatSessions);
        } catch (e) {
            console.error('Failed to parse chat sessions from localStorage', e);
            chatSessions = []; // 데이터가 깨졌으면 초기화
            // ⭐️ 사용자에게도 알림
            alert('대화 기록을 불러오는데 실패했습니다. 기록이 초기화될 수 있습니다.');
        }
    } else {
        chatSessions = []; // 저장된 데이터가 없으면 빈 배열로 시작
        console.log('No chat sessions found in localStorage. Starting fresh.');
    }

    // ⭐️ 세션을 시간순(최신순)으로 정렬합니다.
    // loadSessionsFromLocalStorage 함수 내에서 정렬하여 항상 최신순으로 로드되도록 보장
    chatSessions.sort((a, b) => b.timestamp - a.timestamp);


    // ⭐️ 페이지 로드 시 어떤 대화를 보여줄지 결정
    const storedCurrentSessionId = localStorage.getItem('currentSessionId');
    if (storedCurrentSessionId) {
        // 이전에 보고 있던 대화 세션이 있다면 그걸 불러옴
        // localStorage는 문자열로 저장하니 숫자로 변환해서 비교
        const sessionToLoad = chatSessions.find(session => session.id === parseFloat(storedCurrentSessionId));
        if (sessionToLoad) {
             currentSessionId = parseFloat(storedCurrentSessionId);
             loadChatMessagesIntoView(sessionToLoad.messages); // 해당 대화 메시지들을 채팅창에 표시
             console.log('Loaded current session:', currentSessionId);
        } else {
            // ID는 있는데 해당하는 세션이 없으면 (지워졌거나 오류) 새 채팅 시작
            console.warn('Current session ID found but session not in list. Starting new chat.');
            // ⭐️ 저장 안 하고 새 채팅 시작 (이전 세션이 없으므로 저장할 내용도 없음)
            startNewChat(false);
        }
    } else if (chatSessions.length > 0) {
        // 보고 있던 대화 세션 ID가 없으면 가장 최근 대화를 불러옴 (정렬된 배열의 첫번째)
        const latestSession = chatSessions[0];
        currentSessionId = latestSession.id;
        loadChatMessagesIntoView(latestSession.messages);
        console.log('No current session ID. Loaded latest chat:', currentSessionId);
    } else {
        // 저장된 대화가 하나도 없으면 새 채팅 시작
        console.log('No sessions found. Starting new chat.');
        // ⭐️ 저장 안 하고 새 채팅 시작 (저장된 대화가 없으므로)
        startNewChat(false);
    }
}

// ⭐️ 현재 대화 세션들을 localStorage에 저장하는 함수
function saveSessionsToLocalStorage() {
    try {
        // 저장하기 전에 세션을 시간순(최신순)으로 다시 한번 정렬
        chatSessions.sort((a, b) => b.timestamp - a.timestamp);

        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
        if (currentSessionId !== null) { // 현재 보고 있는 세션 ID도 저장
             localStorage.setItem('currentSessionId', currentSessionId);
        } else { // 현재 세션이 없으면 ID도 지움
             localStorage.removeItem('currentSessionId');
        }
        console.log('Saved chat sessions and current session ID to localStorage.');
    } catch (e) {
        console.error('Failed to save chat sessions to localStorage', e);
        // localStorage 용량 초과 등의 에러 처리가 필요할 수 있음
        alert('대화 기록 저장에 실패했습니다. 브라우저 저장 공간이 부족할 수 있습니다.');
    }
}

// ⭐️ 현재 채팅창에 표시된 메시지들을 배열로 가져오는 함수
function getMessagesFromView() {
    const messages = [];
    const chatBox = document.getElementById('chat-box'); // 함수 내부에서 요소 다시 가져옴
    // 로딩 인디케이터 요소는 제외
    // ⭐️ querySelectorAll이 요소를 못 찾을 경우를 대비하여 chatBox가 있는지 먼저 확인
    if (!chatBox) {
        console.error('chatBox 요소를 찾을 수 없습니다. 메시지를 가져올 수 없습니다.');
        return messages; // 빈 배열 반환
    }
    const messageElements = chatBox.querySelectorAll('p.user-message, p.ai-message:not(.loading-indicator)');
    messageElements.forEach(el => {
         messages.push({
             sender: el.classList.contains('user-message') ? 'user' : 'ai',
             text: el.textContent,
             // timestamp: Date.now() // 메시지별 타임스탬프 (필요에 따라 주석 해제)
         });
    });
    return messages;
}

// ⭐️ 메시지 배열을 받아서 채팅창에 표시하는 함수
function loadChatMessagesIntoView(messages) {
    const chatBox = document.getElementById('chat-box'); // 함수 내부에서 요소 다시 가져옴
    // ⭐️ chatBox 요소가 있는지 확인
    if (!chatBox) {
        console.error('chatBox 요소를 찾을 수 없습니다. 메시지를 표시할 수 없습니다.');
        return;
    }
    chatBox.innerHTML = ''; // 채팅창 비우기
    messages.forEach(msg => {
        // 메시지 버블에 클래스만 추가하고 내용은 텍스트로 넣어줌 (strong 태그 제거)
        const p = document.createElement('p');
        p.classList.add('message', msg.sender === 'user' ? 'user-message' : 'ai-message'); // 'message' 클래스 추가
        p.textContent = msg.text; // 바로 텍스트만 넣음
        chatBox.appendChild(p);
    });
     // 메시지 로드 후 맨 아래로 스크롤
     chatBox.scrollTop = chatBox.scrollHeight;
     console.log('Messages loaded into chat view.');
}

// ⭐️ 메시지를 채팅창에 추가하는 함수
function addMessageToChat(sender, text, isLoading = false) {
    const chatBox = document.getElementById('chat-box'); // 함수 내부에서 요소 다시 가져옴
     if (!chatBox) {
        console.error('chatBox 요소를 찾을 수 없습니다. 메시지를 추가할 수 없습니다.');
        return null; // 요소가 없으면 null 반환
    }

    const messageElement = document.createElement('p');
    messageElement.classList.add('message', `${sender}-message`); // 'message' 클래스 및 발신자 클래스 추가

    if (isLoading) {
         messageElement.classList.add('loading-indicator');
         messageElement.textContent = '입력 중...'; // 로딩 중 텍스트
    } else {
         messageElement.textContent = text;
    }

    chatBox.appendChild(messageElement);
    // ⭐️ 스크롤 맨 아래로 이동 (메시지 추가될 때마다)
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement; // 추가된 요소 반환 (로딩 인디케이터 제거 시 사용)
}


// ⭐️ 로딩 인디케이터 표시 함수
function showLoadingIndicator() {
     return addMessageToChat('ai', '입력 중...', true); // AI 메시지로 로딩 인디케이터 추가
}

// ⭐️ 로딩 인디케이터 제거 함수
function removeLoadingIndicator(indicatorElement) {
     const chatBox = document.getElementById('chat-box'); // 함수 내부에서 요소 다시 가져옴
    if (chatBox && indicatorElement && chatBox.contains(indicatorElement)) {
        chatBox.removeChild(indicatorElement);
        console.log('로딩 인디케이터 제거 완료.');
    } else {
        console.warn('로딩 인디케이터 요소를 찾거나 제거할 수 없습니다.');
    }
}


// ⭐️ 현재 채팅 세션의 내용을 chatSessions 배열에 업데이트하거나 새로 추가하는 함수
function updateCurrentSession() {
    const currentMessages = getMessagesFromView();

    // ⭐️ 빈 대화 세션은 저장하지 않음 (초기 "츤츤거리면서 '뭐 할말있어?'" 메시지만 있는 경우 포함)
    // 초기 AI 메시지 텍스트가 변경되면 이 부분도 수정해야 함
    // ⭐️ 여기서 초기 AI 메시지 텍스트를 하루키가 원하는 "츤츤거리면서 '뭐 할말있어?'"로 맞춰줍니다!
    const initialAIMessageText = "츤츤거리면서 '뭐 할말있어?'";
    // ⭐️ 메시지 내용 비교 시 trim() 및 소문자 변환으로 좀 더 유연하게 비교
    const isEmptyChat = currentMessages.length === 0 || (currentMessages.length === 1 && currentMessages[0]?.text.trim().toLowerCase() === initialAIMessageText.toLowerCase());

    if (isEmptyChat) {
         // 현재 대화가 비어있으면 해당 세션을 sessions 배열에서 삭제 (만약 존재한다면)
         // ⭐️ 현재 세션 ID가 null이 아닐 때만 필터링 시도
         if (currentSessionId !== null) {
              // ⭐️ filter 사용 시 부동소수점 오류 방지를 위해 ID를 숫자로 정확히 비교
              chatSessions = chatSessions.filter(session => session.id !== currentSessionId);
              console.log('Empty chat session removed:', currentSessionId);
              currentSessionId = null; // 현재 세션 ID 초기화
              localStorage.removeItem('currentSessionId'); // localStorage에서도 삭제
         }
         saveSessionsToLocalStorage(); // 변경사항 저장 (삭제된 세션 반영)
         console.log('Current chat is empty or initial message. No session saved/updated.');
         return; // 빈 대화는 저장/업데이트 안 함
    }


    let currentSession = chatSessions.find(session => session.id === currentSessionId);

    if (!currentSession) {
        // 현재 세션 ID가 배열에 없으면 (새로운 대화 시작 후 첫 메시지 등) 새로 생성
        // 첫 사용자 메시지를 요약으로 사용하거나, 없으면 타임스탬프로 요약
        const firstUserMsg = currentMessages.find(msg => msg.sender === 'user');
        const summary = firstUserMsg ? firstUserMsg.text.trim().substring(0, 50) + (firstUserMsg.text.trim().length > 50 ? '...' : '') : `대화 ${new Date().toLocaleString()}`;

        currentSessionId = Date.now(); // 현재 타임스탬프를 고유 ID로 사용
        currentSession = {
             id: currentSessionId,
             timestamp: Date.now(), // 정렬 및 요약을 위한 타임스탬프
             summary: summary,
             messages: currentMessages // 현재 메시지 목록
        };
        chatSessions.push(currentSession); // 세션 목록에 추가
        console.log('Created new session:', currentSessionId);
    } else {
        // 이미 있는 세션이면 메시지 목록만 업데이트
        currentSession.messages = currentMessages;
        // 요약 내용도 최신 첫 사용자 메시지로 업데이트 (원하면 주석 해제)
        const firstUserMsg = currentMessages.find(msg => msg.sender === 'user');
        if (firstUserMsg) {
             currentSession.summary = firstUserMsg.text.trim().substring(0, 50) + (firstUserMsg.text.trim().length > 50 ? '...' : '');
        }
        // 세션의 타임스탬프도 최신 상태로 업데이트 (최신 대화가 위로 오도록)
        currentSession.timestamp = Date.now();
        console.log('Updated session:', currentSessionId);
    }

    // 업데이트된 세션 목록을 localStorage에 저장
    saveSessionsToLocalStorage();
}


// ⭐️ 메시지 전송 후 AI 응답까지 받은 뒤에 세션을 저장하도록 수정
async function handleSend() {
    console.log('보내기 버튼/Enter 키 입력 감지!');
    // ⭐️ userInput 요소가 있는지 확인
    const userInput = document.getElementById('user-input'); // 함수 내부에서 요소 다시 가져옴
    const chatBox = document.getElementById('chat-box'); // 함수 내부에서 요소 다시 가져옴
     if (!userInput || !chatBox) {
        console.error('필수 요소를 찾을 수 없습니다 (userInput 또는 chatBox). 메시지를 전송할 수 없습니다.');
        return;
    }

    const message = userInput.value.trim();
    if (!message) {
        console.warn('입력 메시지가 비어있습니다.');
        return;
    }

    // 사용자 메시지 추가 및 입력창 비우기
    addMessageToChat('user', message);
    userInput.value = '';
    console.log('사용자 메시지 추가됨.');

    // ⭐️ 사용자 메시지까지 포함된 현재 상태를 세션에 업데이트 (새 세션이면 생성)
    // 첫 메시지 입력 시 새로운 세션이 여기서 생성됩니다.
    updateCurrentSession();


    // 로딩 인디케이터 표시
    const loadingIndicator = showLoadingIndicator();
    console.log('로딩 인디케이터 표시됨.');

    // 서버에 메시지 보내고 응답 받기
    const aiReply = await sendMessageToServer(message);
    console.log('AI 응답 수신:', aiReply);

    // 로딩 인디케이터 제거
    removeLoadingIndicator(loadingIndicator);
    console.log('로딩 인디케이터 제거됨.');

    // AI 메시지 추가
    addMessageToChat('ai', aiReply);
    console.log('AI 메시지 추가됨.');

    // ⭐️ AI 메시지까지 포함된 최종 상태를 세션에 업데이트하고 localStorage에 저장
    updateCurrentSession();
}

// ⭐️ 새 채팅 시작 함수 수정 (현재 대화 저장 기능 추가 및 초기 메시지 변경)
function startNewChat(saveCurrent = true) { // saveCurrent 파라미터로 저장 여부 조절 (기본값 true)
    console.log('새 채팅 시작 요청 감지!');

    // ⭐️ 현재 진행 중인 대화 저장 (updateCurrentSession 함수가 빈 대화는 알아서 처리)
    if (saveCurrent) {
         console.log('현재 대화 저장 후 새 채팅 시작.');
         updateCurrentSession(); // 이 함수 안에서 localStorage 저장까지 이루어짐
    } else {
         console.log('현재 대화 저장 안 함. 바로 새 채팅 시작.');
         // 저장 안 하고 시작할 때 빈 대화였다면 currentSessionId를 미리 null로
         // updateCurrentSession() 내부의 isEmptyChat 로직을 사용해서 빈 대화 판별
         const currentMessages = getMessagesFromView();
         // ⭐️ 여기서도 초기 메시지 텍스트를 "츤츤거리면서 '뭐 할말있어?'"로 맞춰줍니다!
         const initialAIMessageText = "츤츤거리면서 '뭐 할말있어?'";
         const isEmptyChat = currentMessages.length === 0 || (currentMessages.length === 1 && currentMessages[0]?.text.trim().toLowerCase() === initialAIMessageText.toLowerCase());

         if (currentSessionId !== null && isEmptyChat) {
              // ⭐️ ID 비교 시 숫자형으로 변환하여 정확히 비교
              chatSessions = chatSessions.filter(session => session.id !== currentSessionId);
              saveSessionsToLocalStorage();
              console.log('Empty current session removed before new chat (saveCurrent=false).');
         }
    }

    const chatBox = document.getElementById('chat-box'); // 함수 내부에서 요소 다시 가져옴
    const historyArea = document.getElementById('history-area'); // 함수 내부에서 요소 다시 가져옴
    const mainChatArea = document.getElementById('main-chat-area'); // 함수 내부에서 요소 다시 가져옴
    const deleteSelectedButton = document.getElementById('delete-selected-button'); // 함수 내부에서 요소 다시 가져옴
    const backToChatButton = document.getElementById('back-to-chat-button'); // 함수 내부에서 요소 다시 가져옴
    // ⭐️ 메뉴 항목 컨테이너 요소 가져오기 👇
    const menuItemsContainer = document.getElementById('menu-items-container');


    // ⭐️ chatBox 요소가 있는지 확인
    if (chatBox) chatBox.innerHTML = ''; // 채팅창 비우기
    else console.error('chatBox 요소를 찾을 수 없어 채팅창을 비울 수 없습니다.');

    currentSessionId = null; // 현재 세션 ID 초기화
    localStorage.removeItem('currentSessionId'); // localStorage에서도 삭제
    console.log('Current session ID reset.');

    // 화면 전환 및 버튼 표시 (CSS와 JS 초기 설정으로 대부분 처리되지만 여기서 한번 더 확인)
    // 해당 요소가 실제로 존재하는지 확인 후 클래스 추가/제거
    if (historyArea) historyArea.classList.add('hidden');
    if (mainChatArea) mainChatArea.classList.remove('hidden');
    // 기록 관련 버튼들은 숨김
    if (deleteSelectedButton) deleteSelectedButton.classList.add('hidden');
    if (backToChatButton) backToChatButton.classList.add('hidden');
    console.log('UI switched to chat view.');


    // ⭐️ 새 채팅 시작 시 메뉴 항목 닫기 👇
    // menuItemsContainer 요소가 있는지 확인하고 hidden 클래스 추가
    if (menuItemsContainer && !menuItemsContainer.classList.contains('hidden')) {
        menuItemsContainer.classList.add('hidden');
        console.log('새 채팅 시작 시 메뉴 항목 숨김.');
    }


    // ⭐️ 초기 메시지 추가 (하루키가 원하는 츤츤 메시지로 변경!)
    addMessageToChat('ai', "츤츤거리면서 '뭐 할말있어?'");
    console.log('새 채팅 시작 기능 실행 완료. 초기 메시지 추가됨.');

    // 새 채팅 시작 시 바로 저장하지 않음 (첫 사용자 메시지 입력 시 updateCurrentSession에서 저장됨)
}

// ⭐️ 채팅으로 돌아가기 함수
function backToChat() {
     console.log('채팅으로 돌아가기 버튼 클릭 감지!');
    const historyArea = document.getElementById('history-area'); // 함수 내부에서 요소 다시 가져옴
    const mainChatArea = document.getElementById('main-chat-area'); // 함수 내부에서 요소 다시 가져옴
    const deleteSelectedButton = document.getElementById('delete-selected-button'); // 함수 내부에서 요소 다시 가져옴
    const backToChatButton = document.getElementById('back-to-chat-button'); // 함수 내부에서 요소 다시 가져옴
    const chatBox = document.getElementById('chat-box'); // 함수 내부에서 요소 다시 가져옴
    // ⭐️ 메뉴 항목 컨테이너 요소 가져오기 👇
    const menuItemsContainer = document.getElementById('menu-items-container');


     // ⭐️ historyArea가 hidden인지 확인하고, 이미 hidden이면 불필요한 동작 방지
     if(historyArea && historyArea.classList.contains('hidden')) {
          console.log('이미 채팅 화면입니다. 돌아가기 동작 안 함.');
          return;
     }


     // ⭐️ 현재 세션 ID가 없거나 해당 세션을 찾을 수 없는 경우 (예: 기록 삭제 후)
     const sessionToLoad = chatSessions.find(session => session.id === currentSessionId);
     if (currentSessionId === null || !sessionToLoad) {
         console.warn('현재 세션이 없거나 찾을 수 없습니다. 새 채팅 화면으로 전환합니다.');
         // 새 채팅 시작 함수를 호출하여 빈 화면 또는 초기 메시지 상태로 만듦 (저장 안 함)
         // startNewChat이 이미 UI 전환 및 초기 메시지 처리를 함.
         // startNewChat 함수 내부에서 메뉴 닫기도 처리됨.
         startNewChat(false);
         return;
     }


     // 현재 세션의 메시지들을 다시 로드하여 채팅창에 표시
     loadChatMessagesIntoView(sessionToLoad.messages); // loadChatMessagesIntoView 함수 안에서 chatBox 비우고 채움


     // 화면을 채팅 화면으로 전환
     // 해당 요소가 실제로 존재하는지 확인 후 클래스 추가/제거
     if (historyArea) historyArea.classList.add('hidden');
     if (mainChatArea) mainChatArea.classList.remove('hidden');

     // 기록 화면 버튼들은 숨김
     if (deleteSelectedButton) deleteSelectedButton.classList.add('hidden');
     if (backToChatButton) backToChatButton.classList.add('hidden');

    // ⭐️ 채팅으로 돌아갈 때 메뉴 항목 닫기 👇
    // menuItemsContainer 요소가 있는지 확인하고 hidden 클래스 추가
    if (menuItemsContainer && !menuItemsContainer.classList.contains('hidden')) {
        menuItemsContainer.classList.add('hidden');
        console.log('채팅으로 돌아가기 시 메뉴 항목 숨김.');
    }


     console.log('채팅 화면으로 돌아가기 완료. 현재 세션 로드됨.');
}


// ⭐️ 대화 기록 보기 함수 수정 (localStorage에서 불러와서 목록 표시)
function viewHistory() {
    console.log('대화 기록 보기 버튼 클릭 감지!');

    const historyArea = document.getElementById('history-area'); // 함수 내부에서 요소 다시 가져옴
    const mainChatArea = document.getElementById('main-chat-area'); // 함수 내부에서 요소 다시 가져옴
    const deleteSelectedButton = document.getElementById('delete-selected-button'); // 함수 내부에서 요소 다시 가져옴
    const backToChatButton = document.getElementById('back-to-chat-button'); // 함수 내부에서 요소 다시 가져옴
    const historyList = document.getElementById('history-list'); // 함수 내부에서 요소 다시 가져옴
    // ⭐️ 메뉴 항목 컨테이너 요소 가져오기 👇
    const menuItemsContainer = document.getElementById('menu-items-container');


    // ⭐️ 현재 채팅창 내용을 저장 (기록 목록 보기 전에 현재 대화 상태를 저장)
    // updateCurrentSession 함수가 빈 대화는 알아서 처리
     console.log('대화 기록 보기 전 현재 대화 저장 시도.');
     updateCurrentSession(); // 현재 세션을 최종 업데이트하여 저장


    // localStorage에서 모든 세션을 다시 불러옴 (최신 상태 반영)
    loadSessionsFromLocalStorage(); // 이 함수 호출 시 chatSessions 배열이 업데이트되고 정렬됨

    // 해당 요소가 실제로 존재하는지 확인 후 클래스 추가/제거
    if (mainChatArea) mainChatArea.classList.add('hidden'); // 채팅 화면 숨김
    if (historyArea) historyArea.classList.remove('hidden'); // 기록 화면 표시

    // 해당 버튼 요소가 실제로 존재하는지 확인 후 클래스 제거
    if (deleteSelectedButton) deleteSelectedButton.classList.remove('hidden'); // 기록 관련 버튼 표시
    if (backToChatButton) backToChatButton.classList.remove('hidden');
    console.log('UI switched to history view. History buttons shown.');


    // ⭐️ 기록 보기 시 메뉴 항목 닫기 👇
    // menuItemsContainer 요소가 있는지 확인하고 hidden 클래스 추가
    if (menuItemsContainer && !menuItemsContainer.classList.contains('hidden')) {
        menuItemsContainer.classList.add('hidden');
        console.log('기록 보기 시 메뉴 항목 숨김.');
    }


    // 기록 목록 채우기
    // ⭐️ historyList 요소가 있는지 확인
    if (historyList) historyList.innerHTML = ''; // 목록 비우기
    else { console.error('historyList 요소를 찾을 수 없습니다.'); return; } // historyList 없으면 중단


    // chatSessions 배열은 loadSessionsFromLocalStorage에서 이미 최신순으로 정렬됨

    if (chatSessions.length === 0) {
         const li = document.createElement('li');
         li.textContent = '저장된 대화 기록이 없습니다.';
         historyList.appendChild(li);
         console.log('No chat sessions to display in history.');
         // 기록이 없으면 선택 삭제 버튼 비활성화 (버튼 요소 있는지 확인)
         if(deleteSelectedButton) deleteSelectedButton.disabled = true;
         return;
    } else {
         // 기록이 있으면 선택 삭제 버튼 활성화 (버튼 요소 있는지 확인)
         if(deleteSelectedButton) deleteSelectedButton.disabled = false;
    }


    chatSessions.forEach(session => {
        const li = document.createElement('li');
        // 목록 아이템에 세션 ID와 요약 내용을 표시
        // 체크박스에 data-session-id 속성으로 세션 ID 저장
        const summaryText = session.summary || `대화 ${new Date(session.timestamp).toLocaleString()}`; // 요약이 없으면 타임스탬프로 표시
        li.innerHTML = `<input type="checkbox" data-session-id="${session.id}"> <span>${summaryText}</span>`;

        // ⭐️ 목록 아이템 (span 부분) 클릭 시 해당 대화 로드 이벤트 리스너
        const span = li.querySelector('span');
        if (span) {
            span.style.cursor = 'pointer'; // 클릭 가능한 요소임을 명시
            span.addEventListener('click', () => {
                console.log('기록 선택됨 (클릭): 세션 ID', session.id);
                // loadSession 함수 호출 시 ID를 숫자로 전달
                loadSession(session.id);
            });
        }

         // ⭐️ 체크박스 클릭 이벤트 리스너 (span 클릭 이벤트와 별개로 동작하도록)
         const checkbox = li.querySelector('input[type="checkbox']');
          if(checkbox) {
              checkbox.addEventListener('click', (event) => {
                 // 체크박스 클릭 시 목록 아이템(li) 클릭 이벤트가 발생하지 않도록 막음
                 event.stopPropagation();
                 console.log('체크박스 클릭됨:', session.id, '상태:', event.target.checked);
                 // 선택된 체크박스 상태에 따라 '선택 삭제' 버튼 활성화/비활성화 로직 추가 가능
              });
          }

        historyList.appendChild(li);
    });

    console.log('대화 기록 보기 기능 실행 완료.');
}

// ⭐️ 특정 대화 세션을 불러와서 채팅창에 표시하는 함수
function loadSession(sessionId) {
    console.log('세션 로드 요청됨:', sessionId);
    // 로드하려는 세션 ID를 숫자로 변환 (ensure it's a number)
    const numericSessionId = parseFloat(sessionId);

    // 세션 로드 전 현재 대화 저장 로직은 viewHistory에서 이미 처리됨.
    // 여기서 또 호출하면 무한 루프나 이중 저장이 될 수 있음.

    // ⭐️ chatSessions 배열에서 숫자 ID로 세션을 찾음
    const sessionToLoad = chatSessions.find(session => session.id === numericSessionId);

    const historyArea = document.getElementById('history-area'); // 함수 내부에서 요소 다시 가져옴
    const mainChatArea = document.getElementById('main-chat-area'); // 함수 내부에서 요소 다시 가져옴
    const deleteSelectedButton = document.getElementById('delete-selected-button'); // 함수 내부에서 요소 다시 가져옴
    const backToChatButton = document.getElementById('back-to-chat-button'); // 함수 내부에서 요소 다시 가져옴
    const chatBox = document.getElementById('chat-box'); // 함수 내부에서 요소 다시 가져옴
    // ⭐️ 메뉴 항목 컨테이너 요소 가져오기 👇
    const menuItemsContainer = document.getElementById('menu-items-container');


    if (sessionToLoad) {
        // ... (기존 세션 로드, currentSessionId 업데이트, localStorage 저장 코드)

        // 해당 세션의 메시지들을 채팅창에 표시
        loadChatMessagesIntoView(sessionToLoad.messages);

        // 화면을 채팅 화면으로 전환
        if (historyArea) historyArea.classList.add('hidden');
        if (mainChatArea) mainChatArea.classList.remove('hidden');
        if (deleteSelectedButton) deleteSelectedButton.classList.add('hidden');
        if (backToChatButton) backToChatButton.classList.add('hidden');

        // ⭐️ 세션 로드 후 채팅 화면으로 갈 때 메뉴 항목 닫기 👇
        // menuItemsContainer 요소가 있는지 확인하고 hidden 클래스 추가
        if (menuItemsContainer && !menuItemsContainer.classList.contains('hidden')) {
            menuItemsContainer.classList.add('hidden');
            console.log('세션 로드 시 메뉴 항목 숨김.');
        }


        console.log('세션 로드 완료:', sessionId);
    } else {
         // ... (기존 세션 로드 실패 시 처리 코드)
         // loadSession 실패 시 startNewChat(false)가 호출되므로,
         // 메뉴 닫기는 startNewChat 함수 안에서 처리될 거예요.
         startNewChat(false);
    }
}


// ⭐️ 선택된 대화 기록을 삭제하는 함수
function handleDeleteSelected() {
    console.log('선택 삭제 버튼 클릭 감지!');
    const historyList = document.getElementById('history-list'); // 함수 내부에서 요소 다시 가져옴
    const deleteSelectedButton = document.getElementById('delete-selected-button'); // 함수 내부에서 요소 다시 가져옴
    // ⭐️ 메뉴 항목 컨테이너 요소 가져오기 👇 (삭제 후 화면 전환은 없지만, 혹시 몰라)
    const menuItemsContainer = document.getElementById('menu-items-container');


    if (!historyList || !deleteSelectedButton) {
         console.error('필수 요소를 찾을 수 없습니다 (historyList 또는 deleteSelectedButton). 삭제를 진행할 수 없습니다.');
         return;
    }

    const selectedCheckboxes = historyList.querySelectorAll('input[type="checkbox"]:checked');
    // 체크된 체크박스들의 data-session-id 값을 숫자로 변환하여 배열로 만듦
    // ⭐️ ID 비교 시 숫자형으로 정확히 비교하기 위해 parseFloat 사용
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseFloat(cb.dataset.sessionId));

    if (selectedIds.length === 0) {
        alert('삭제할 기록을 선택해주세요!');
        console.warn('삭제할 기록이 선택되지 않음.');
        return;
    }

    console.log('삭제할 세션 ID:', selectedIds);

    // 사용자에게 정말 삭제할지 확인
     if (!confirm(`정말로 선택된 ${selectedIds.length}개의 기록을 삭제하시겠습니까?`)) {
         console.log('삭제 취소됨.');
         return; // 취소 시 함수 종료
     }


    // chatSessions 배열에서 선택된 ID들에 해당하는 세션들을 제외하고 새로운 배열 만듦
    const initialSessionCount = chatSessions.length;
    // ⭐️ filter 사용 시 ID 비교를 숫자형으로 정확히 수행
    chatSessions = chatSessions.filter(session => !selectedIds.includes(session.id));
    const deletedCount = initialSessionCount - chatSessions.length;

    console.log(`${deletedCount}개의 세션이 삭제되었습니다.`);


    // ⭐️ 만약 현재 보고 있는 세션이 삭제 목록에 포함되어 있다면 새 채팅 시작 및 관련 상태 초기화
    // ⭐️ 현재 세션 ID가 null이 아닌 경우에만 확인하고, ID 비교도 숫자형으로 정확히 수행
    if (currentSessionId !== null && selectedIds.includes(currentSessionId)) {
        console.log('현재 세션이 삭제되었습니다. 새 채팅을 시작합니다.');
        // 새 채팅 시작 함수 호출 (현재 대화 저장 안 함, 이미 삭제될 거니까)
        // startNewChat 함수가 이미 localStorage 저장까지 처리
        // startNewChat 내부에서 메뉴 닫기도 처리됨.
        startNewChat(false);

        // 삭제 완료 알림은 startNewChat 실행 후에 표시
         alert(`${deletedCount}개의 기록을 삭제했습니다!`);


    } else {
         // 현재 세션이 삭제되지 않았다면 변경된 세션 목록을 저장하고 기록 화면을 새로고침
        saveSessionsToLocalStorage(); // 변경사항 localStorage에 저장
        viewHistory(); // 기록 목록 화면을 새로고침해서 삭제된 항목이 안 보이게 함
        // viewHistory 함수 내부에서 메뉴 닫기도 처리됨.
        alert(`${deletedCount}개의 기록을 삭제했습니다!`); // 삭제 완료 알림
    }


    console.log('선택 삭제 기능 실행 완료.');
}

// 서버 통신 함수 (아까 준 코드와 동일)
async function sendMessageToServer(message) {
    try {
        const res = await fetch('https://natsumi-mi-shu.onrender.com/natsumi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
         if (!res.ok) {
            const errorData = await res.json().catch(() => ({})); // JSON 파싱 실패 대비
            // ⭐️ 에러 메시지를 좀 더 상세하게
            throw new Error(`서버 응답 에러: 상태 ${res.status} - ${errorData.reply || errorData.error || res.statusText || '알 수 없는 오류 발생'}`);
        }
        const data = await res.json();
        // ⭐️ 서버 응답에 reply 필드가 없을 경우 에러 메시지 반환
        return data.reply || '서버 응답 형식이 올바르지 않습니다.';
    } catch (err) {
        console.error('서버 통신 에러:', err);
        // 에러 메시지를 좀 더 친절하게 표시
        return `서버 통신 에러: ${err.message || '데이터를 가져오는데 실패했습니다.'}`;
    }
}


// DOMContentLoaded 이벤트 리스너 (스크립트 실행 시작점)
document.addEventListener('DOMContentLoaded', () => {
    console.log('2. DOMContentLoaded 실행!');

    // ⭐️ 필요한 DOM 요소들을 모두 가져옵니다. (const 사용)
    // ⭐️ 여기서 요소를 찾지 못하면 콘솔 에러가 발생하고 스크립트가 중단됩니다.
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    const newChatButton = document.getElementById('new-chat-button');
    const viewHistoryButton = document.getElementById('view-history-button');

    const historyArea = document.getElementById('history-area');
    const mainChatArea = document.getElementById('main-chat-area');

    const deleteSelectedButton = document.getElementById('delete-selected-button');
    const backToChatButton = document.getElementById('back-to-chat-button');
    const historyList = document.getElementById('history-list'); // historyList도 여기서 가져옴

    // ⭐️ 새로 추가된 메뉴 관련 요소들 가져오기! 👇
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
    // ⭐️ 새로 추가된 메뉴 요소 확인! 👇
    console.log('menuToggleButton:', menuToggleButton);
    console.log('menuItemsContainer:', menuItemsContainer);


     // ⭐️ 필수 요소가 누락되었는지 확인하고 누락 시 스크립트 중단
     // 새로 추가된 메뉴 요소들도 필수 요소에 포함시킬지 결정 (여기서는 포함) 👇
     if (!sendButton || !userInput || !chatBox || !newChatButton || !viewHistoryButton || !historyArea || !mainChatArea || !deleteSelectedButton || !backToChatButton || !historyList || !menuToggleButton || !menuItemsContainer) {
         console.error('Error: 필수 DOM 요소를 찾을 수 없습니다. 스크립트 실행을 중단합니다.');
         alert('페이지 로딩 오류! 일부 요소가 없습니다. 브라우저 콘솔을 확인해주세요.');
         return; // 스크립트 실행 중단
     }


    // ⭐️ 페이지 로드 시 localStorage에서 대화 세션들을 불러오고 초기 화면 설정
    // 이 함수 안에서 저장된 대화가 없으면 startNewChat이 호출되어 초기 메시지가 추가됩니다.
    loadSessionsFromLocalStorage();


    // ⭐️ 이벤트 리스너 연결
    // 각 버튼 요소가 null이 아닌지는 위에서 필수 요소 검사할 때 확인했으므로 여기서 다시 할 필요 없음
    sendButton.addEventListener('click', handleSend);
    console.log('sendButton 이벤트 리스너 연결 완료.');

    userInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    console.log('userInput keydown 이벤트 리스너 연결 완료.');

    // 새 채팅 시작 버튼 클릭 시 현재 대화 저장하도록 인자 전달 (기본값 true)
    newChatButton.addEventListener('click', () => startNewChat(true));
    console.log('newChatButton 이벤트 리스너 연결 완료.');

    viewHistoryButton.addEventListener('click', viewHistory);
    console.log('viewHistoryButton 이벤트 리스너 연결 완료.');

    backToChatButton.addEventListener('click', backToChat);
    console.log('backToChatButton 이벤트 리스너 연결 완료.');

    deleteSelectedButton.addEventListener('click', handleDeleteSelected);
    console.log('deleteSelectedButton 이벤트 리스너 연결 완료.');


    // ⭐️ 새로 추가: 메뉴 아이콘 클릭 시 메뉴 항목 토글 👇
    // menuToggleButton, menuItemsContainer 요소가 존재하는지는 위에서 필수 요소 검사할 때 확인했음
    menuToggleButton.addEventListener('click', (event) => {
        // 버튼 클릭 시 이벤트 버블링 막기 (나중에 전체 화면 클릭으로 메뉴 닫기 구현 시 필요)
        event.stopPropagation();
        // hidden 클래스를 토글해서 보이기/숨기기
        menuItemsContainer.classList.toggle('hidden');
        console.log('메뉴 항목 컨테이너 토글됨. 현재 상태 hidden:', menuItemsContainer.classList.contains('hidden'));
    });
    console.log('menuToggleButton 이벤트 리스너 연결 완료.');


    // ⭐️ (선택 사항) 메뉴 항목이 열려 있을 때 화면 아무 곳이나 클릭하면 닫히게 하려면 추가 👇
    document.addEventListener('click', (event) => {
        // 클릭된 요소가 메뉴 컨테이너나 토글 버튼 안에 있지 않다면 메뉴를 숨김
        if (menuItemsContainer && !menuItemsContainer.classList.contains('hidden')) {
            // event.target이 menuItemsContainer 요소 자체 또는 그 안에 포함된 요소가 아니고,
            // event.target이 menuToggleButton 자체도 아니라면
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