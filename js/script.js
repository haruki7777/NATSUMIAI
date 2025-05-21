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
        }
    } else {
        chatSessions = []; // 저장된 데이터가 없으면 빈 배열로 시작
        console.log('No chat sessions found in localStorage. Starting fresh.');
    }

    // ⭐️ 페이지 로드 시 어떤 대화를 보여줄지 결정
    const storedCurrentSessionId = localStorage.getItem('currentSessionId');
    if (storedCurrentSessionId) {
        // 이전에 보고 있던 대화 세션이 있다면 그걸 불러옴
        const sessionToLoad = chatSessions.find(session => session.id === parseFloat(storedCurrentSessionId)); // localStorage는 문자열로 저장하니 숫자로 변환
        if (sessionToLoad) {
             currentSessionId = parseFloat(storedCurrentSessionId);
             loadChatMessagesIntoView(sessionToLoad.messages); // 해당 대화 메시지들을 채팅창에 표시
             console.log('Loaded current session:', currentSessionId);
        } else {
            // ID는 있는데 해당하는 세션이 없으면 (지워졌거나 오류) 새 채팅 시작
            console.warn('Current session ID found but session not in list. Starting new chat.');
            startNewChat(false); // 저장 안 하고 새 채팅 시작
        }
    } else if (chatSessions.length > 0) {
        // 보고 있던 대화 세션 ID가 없으면 가장 최근 대화를 불러옴
        const latestSession = chatSessions[chatSessions.length - 1]; // 가장 마지막 세션
        currentSessionId = latestSession.id;
        loadChatMessagesIntoView(latestSession.messages);
        console.log('No current session ID. Loaded latest chat:', currentSessionId);
    } else {
        // 저장된 대화가 하나도 없으면 새 채팅 시작
        console.log('No sessions found. Starting new chat.');
        startNewChat(false); // 저장 안 하고 새 채팅 시작 (어차피 빈 대화라 저장할 것도 없지만)
    }
}

// ⭐️ 현재 대화 세션들을 localStorage에 저장하는 함수
function saveSessionsToLocalStorage() {
    try {
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
    }
}

// ⭐️ 현재 채팅창에 표시된 메시지들을 배열로 가져오는 함수
function getMessagesFromView() {
    const messages = [];
    const messageElements = chatBox.querySelectorAll('p.user-message, p.ai-message, p.loading-indicator');
    messageElements.forEach(el => {
        // 로딩 인디케이터는 저장하지 않음
        if (!el.classList.contains('loading-indicator')) {
             messages.push({
                 sender: el.classList.contains('user-message') ? 'user' : 'ai',
                 text: el.textContent
             });
        }
    });
    return messages;
}

// ⭐️ 메시지 배열을 받아서 채팅창에 표시하는 함수
function loadChatMessagesIntoView(messages) {
    chatBox.innerHTML = ''; // 채팅창 비우기
    messages.forEach(msg => {
        addMessageToChat(msg.sender, msg.text); // 기존 addMessageToChat 함수 재사용
    });
     chatBox.scrollTop = chatBox.scrollHeight; // 맨 아래로 스크롤
     console.log('Messages loaded into chat view.');
}


// ⭐️ 현재 채팅 세션의 내용을 chatSessions 배열에 업데이트하거나 새로 추가하는 함수
function updateCurrentSession() {
    const currentMessages = getMessagesFromView();

    if (currentMessages.length === 0) {
         // 현재 대화가 비어있으면 해당 세션을 sessions 배열에서 삭제
         chatSessions = chatSessions.filter(session => session.id !== currentSessionId);
         currentSessionId = null; // 현재 세션 ID 초기화
         console.log('Current chat is empty, session removed.');
         saveSessionsToLocalStorage(); // 변경사항 저장
         return; // 빈 대화는 저장 안 함
    }

    let currentSession = chatSessions.find(session => session.id === currentSessionId);

    if (!currentSession) {
        // 현재 세션 ID가 배열에 없으면 (새로운 대화 시작 후 첫 메시지 등) 새로 생성
        // 첫 사용자 메시지를 요약으로 사용하거나, 없으면 기본값 사용
        const firstUserMsg = currentMessages.find(msg => msg.sender === 'user');
        const summary = firstUserMsg ? firstUserMsg.text.substring(0, 50) + (firstUserMsg.text.length > 50 ? '...' : '') : '새 대화';
        currentSessionId = Date.now(); // 현재 타임스탬프를 고유 ID로 사용
        currentSession = {
             id: currentSessionId,
             timestamp: Date.now(), // 정렬을 위한 타임스탬프
             summary: summary,
             messages: currentMessages // 현재 메시지 목록
        };
        chatSessions.push(currentSession); // 세션 목록에 추가
        console.log('Created new session:', currentSessionId);
    } else {
        // 이미 있는 세션이면 메시지 목록만 업데이트
        currentSession.messages = currentMessages;
        // 요약을 첫 메시지로 업데이트할 수도 있지만 (필요에 따라 주석 해제)
        // const firstUserMsg = currentMessages.find(msg => msg.sender === 'user');
        // if (firstUserMsg) {
        //      currentSession.summary = firstUserMsg.text.substring(0, 50) + (firstUserMsg.text.length > 50 ? '...' : '');
        // }
        console.log('Updated session:', currentSessionId);
    }

    // 세션을 시간순으로 정렬 (선택 사항, 기록 화면에 표시할 때 유용)
    // chatSessions.sort((a, b) => a.timestamp - b.timestamp); // 오름차순
    chatSessions.sort((a, b) => b.timestamp - a.timestamp); // 내림차순 (최신순)


    // 업데이트된 세션 목록을 localStorage에 저장
    saveSessionsToLocalStorage();
}


// ⭐️ 메시지 전송 후 AI 응답까지 받은 뒤에 세션을 저장하도록 수정
async function handleSend() {
    console.log('보내기 버튼/Enter 키 입력 감지!');
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

// ⭐️ 새 채팅 시작 함수 수정 (현재 대화 저장 기능 추가)
function startNewChat(saveCurrent = true) { // saveCurrent 파라미터로 저장 여부 조절
    console.log('새 채팅 시작 버튼 클릭 감지!');

    // ⭐️ 현재 진행 중인 대화가 비어있지 않으면 저장
    if (saveCurrent && getMessagesFromView().length > 0) {
         console.log('현재 대화 저장 후 새 채팅 시작.');
         // 현재 세션을 최종 업데이트해서 저장 목록에 반영
         updateCurrentSession(); // 이 함수 안에서 localStorage 저장까지 이루어짐
    } else {
         console.log('현재 대화가 비어있거나 저장 안 함. 바로 새 채팅 시작.');
         // 현재 대화가 비어있는데 currentSessionId가 있다면, 해당 세션을 목록에서 지워야 함.
         if (currentSessionId !== null && getMessagesFromView().length === 0) {
              chatSessions = chatSessions.filter(session => session.id !== currentSessionId);
              saveSessionsToLocalStorage();
              console.log('Empty current session removed from history.');
         }
    }

    chatBox.innerHTML = ''; // 채팅창 비우기
    currentSessionId = null; // 현재 세션 ID 초기화
    localStorage.removeItem('currentSessionId'); // localStorage에서도 삭제
    console.log('Current session ID reset.');

    // 화면 전환 및 버튼 표시 (CSS와 JS 초기 설정으로 대부분 처리되지만 여기서 한번 더 확인)
    historyArea.classList.add('hidden');
    mainChatArea.classList.remove('hidden');
    deleteSelectedButton.classList.add('hidden');
    backToChatButton.classList.add('hidden');

    addMessageToChat('ai', '새 채팅 시작! 뭐 물어볼래?'); // 초기 메시지 추가
    console.log('새 채팅 시작 기능 실행 완료.');
}


// ⭐️ 대화 기록 보기 함수 수정 (localStorage에서 불러와서 목록 표시)
function viewHistory() {
    console.log('대화 기록 보기 버튼 클릭 감지!');

    // ⭐️ 현재 채팅창 내용을 저장 (기록 목록 보기 전에 현재 대화 상태를 저장)
    // 빈 대화는 저장 안 함
     if (getMessagesFromView().length > 0) {
          console.log('대화 기록 보기 전 현재 대화 저장.');
          updateCurrentSession(); // 현재 세션을 최종 업데이트하여 저장
     } else {
         // 현재 대화가 비어있는데 currentSessionId가 있다면, 해당 세션을 목록에서 지워야 함.
         if (currentSessionId !== null) {
              chatSessions = chatSessions.filter(session => session.id !== currentSessionId);
              saveSessionsToLocalStorage();
              console.log('Empty current session removed from history before viewing history.');
         }
     }


    // localStorage에서 모든 세션을 다시 불러옴 (최신 상태 반영)
    loadSessionsFromLocalStorage();

    mainChatArea.classList.add('hidden'); // 채팅 화면 숨김
    historyArea.classList.remove('hidden'); // 기록 화면 표시

    deleteSelectedButton.classList.remove('hidden'); // 기록 관련 버튼 표시
    backToChatButton.classList.remove('hidden');

    // 기록 목록 채우기
    historyList.innerHTML = ''; // 목록 비우기

    if (chatSessions.length === 0) {
         const li = document.createElement('li');
         li.textContent = '저장된 대화 기록이 없습니다.';
         historyList.appendChild(li);
         console.log('No chat sessions to display in history.');
         // 기록이 없으면 선택 삭제 버튼 비활성화
         if(deleteSelectedButton) deleteSelectedButton.disabled = true;
         return;
    } else {
         // 기록이 있으면 선택 삭제 버튼 활성화
         if(deleteSelectedButton) deleteSelectedButton.disabled = false;
    }

    // 세션을 최신순으로 정렬 (loadSessionsFromLocalStorage에서 이미 했지만 혹시 몰라 다시)
    // const sortedSessions = [...chatSessions].sort((a, b) => b.timestamp - a.timestamp);


    chatSessions.forEach(session => {
        const li = document.createElement('li');
        // 목록 아이템에 세션 ID와 요약 내용을 표시
        // 체크박스에 data-session-id 속성으로 세션 ID 저장
        const summaryText = session.summary || `대화 ${new Date(session.timestamp).toLocaleString()}`; // 요약이 없으면 타임스탬프로 표시
        li.innerHTML = `<input type="checkbox" data-session-id="${session.id}"> <span>${summaryText}</span>`;

        // ⭐️ 목록 아이템 (span 부분) 클릭 시 해당 대화 로드 이벤트 리스너
        const span = li.querySelector('span');
        if (span) {
            span.addEventListener('click', () => {
                console.log('기록 선택됨 (클릭): 세션 ID', session.id);
                loadSession(session.id); // 선택된 세션을 로드하는 함수 호출
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
    // currentSessionId가 null이 아니고 현재 세션 ID와 다르면 현재 대화를 저장
    // 이건 viewHistory에서 이미 저장하니까 여기서 또 할 필요는 없을 것 같기도... 로직 고민
    // 일단 viewHistory에서 저장했다고 가정하고, 여기서는 그냥 해당 세션 찾아서 로드
    const sessionToLoad = chatSessions.find(session => session.id === parseFloat(sessionId)); // localStorage ID는 문자열이므로 parseFloat

    if (sessionToLoad) {
        // 로드하려는 세션으로 현재 세션 ID 업데이트
        currentSessionId = sessionToLoad.id;
        localStorage.setItem('currentSessionId', currentSessionId); // localStorage에 현재 세션 ID 저장

        // 해당 세션의 메시지들을 채팅창에 표시
        loadChatMessagesIntoView(sessionToLoad.messages);

        // 화면을 채팅 화면으로 전환
        historyArea.classList.add('hidden');
        mainChatArea.classList.remove('hidden');
        // 기록 화면 버튼들은 숨김
        deleteSelectedButton.classList.add('hidden');
        backToChatButton.classList.add('hidden');

        console.log('세션 로드 완료:', sessionId);
    } else {
        console.error('Error: 세션을 찾을 수 없습니다:', sessionId);
        alert('해당 대화 기록을 찾을 수 없습니다!');
    }
}


// ⭐️ 선택된 대화 기록을 삭제하는 함수
function handleDeleteSelected() {
    console.log('선택 삭제 버튼 클릭 감지!');
    // historyList에서 체크된 체크박스들을 모두 찾음
    const selectedCheckboxes = historyList.querySelectorAll('input[type="checkbox"]:checked');
    // 체크된 체크박스들의 data-session-id 값을 배열로 만듦
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseFloat(cb.dataset.sessionId)); // localStorage ID는 문자열이니 숫자로 변환

    if (selectedIds.length === 0) {
        alert('삭제할 기록을 선택해주세요!');
        console.warn('삭제할 기록이 선택되지 않음.');
        return;
    }

    console.log('삭제할 세션 ID:', selectedIds);

    // chatSessions 배열에서 선택된 ID들에 해당하는 세션들을 제외하고 새로운 배열 만듦
    const initialSessionCount = chatSessions.length;
    chatSessions = chatSessions.filter(session => !selectedIds.includes(session.id));
    const deletedCount = initialSessionCount - chatSessions.length;

    console.log(`${deletedCount}개의 세션이 삭제되었습니다.`);

    // ⭐️ 만약 현재 보고 있는 세션이 삭제 목록에 포함되어 있다면 새 채팅 시작
    if (currentSessionId !== null && selectedIds.includes(currentSessionId)) {
        console.log('현재 세션이 삭제되었습니다. 새 채팅을 시작합니다.');
        currentSessionId = null; // 현재 세션 ID 초기화
        localStorage.removeItem('currentSessionId'); // localStorage에서도 삭제
        chatBox.innerHTML = ''; // 채팅창 비우기
        addMessageToChat('ai', '삭제된 대화 기록입니다. 새 채팅을 시작합니다!'); // 안내 메시지
        // 삭제 후에는 채팅 화면으로 돌아가는 게 자연스러움
        backToChat();
    } else {
         // 현재 세션이 삭제되지 않았다면 변경된 세션 목록을 저장하고 기록 화면을 새로고침
        saveSessionsToLocalStorage(); // 변경사항 localStorage에 저장
        viewHistory(); // 기록 목록 화면을 새로고침해서 삭제된 항목이 안 보이게 함
    }


    alert(`${deletedCount}개의 기록을 삭제했습니다!`); // 삭제 완료 알림
    console.log('선택 삭제 기능 실행 완료.');
}


// DOMContentLoaded 이벤트 리스너 (스크립트 실행 시작점)
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

     // ⭐️ 필수 요소가 누락되었는지 확인하고 누락 시 스크립트 중단
     if (!sendButton || !userInput || !chatBox || !newChatButton || !viewHistoryButton || !historyArea || !mainChatArea || !deleteSelectedButton || !backToChatButton) {
         console.error('Error: 필수 DOM 요소를 찾을 수 없습니다. 스크립트 실행을 중단합니다.');
         // 사용자에게 오류 메시지를 보여줄 수도 있습니다.
         // alert('페이지 로딩 오류! 일부 요소가 없습니다. 브라우저 콘솔을 확인해주세요.');
         return; // 스크립트 실행 중단
     }


    // ⭐️ 페이지 로드 시 localStorage에서 대화 세션들을 불러오고 초기 화면 설정
    loadSessionsFromLocalStorage();


    // ⭐️ 이벤트 리스너 연결
    sendButton.addEventListener('click', handleSend);
    userInput.addEventListener('keydown', e => {
        // Enter 키만 눌렀을 때 전송 (Shift + Enter는 줄바꿈)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 기본 줄바꿈 동작 막기
            handleSend(); // 메시지 전송 함수 호출
        }
    });

    // 메뉴 버튼들에 이벤트 리스너 연결
    newChatButton.addEventListener('click', startNewChat); // '새 채팅 시작' 버튼
    viewHistoryButton.addEventListener('click', viewHistory); // '대화 기록 보기' 버튼
    backToChatButton.addEventListener('click', backToChat); // '채팅으로 돌아가기' 버튼
    deleteSelectedButton.addEventListener('click', handleDeleteSelected); // '선택 삭제' 버튼


    // ⭐️ 초기 화면 설정은 loadSessionsFromLocalStorage 함수에서 이미 처리됨
    // 여기서는 혹시 몰라 요소의 hidden 클래스 상태를 다시 한번 확인하고 기록 관련 버튼들의 초기 상태를 설정
     if (historyArea.classList.contains('hidden')) {
         // 기록 화면이 숨겨져 있다면 (즉, 채팅 화면이 보이는 상태라면)
         deleteSelectedButton.classList.add('hidden'); // 기록 버튼 숨김
         backToChatButton.classList.add('hidden');
         console.log('초기 로드 상태: 채팅 화면. 기록 관련 버튼 숨김.');
     } else {
         // 기록 화면이 보이는 상태라면
         deleteSelectedButton.classList.remove('hidden'); // 기록 버튼 표시
         backToChatButton.classList.remove('hidden');
         console.log('초기 로드 상태: 기록 화면. 기록 관련 버튼 표시.');
     }


    // 초기 AI 메시지 추가는 loadSessionsFromLocalStorage 또는 startNewChat에서 처리됨


    console.log('3. DOMContentLoaded 실행 완료! 대화 기록 기능 연결됨.');
});

console.log('4. script.js 로딩 완료 (DOMContentLoaded 외부).');