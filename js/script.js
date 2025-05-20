// === JavaScript 파일 로딩 시작 (alert 제거!) ===
// alert('1. script.js 파일 로딩 시작!'); // 제거!

// HTML 요소들을 저장할 변수들을 먼저 선언 (DOMContentLoaded 안에서 할당할 것임)
// null로 초기화하여 나중에 요소가 제대로 할당되었는지 확인할 수 있도록 함
let userInput = null;
let sendButton = null;
let chatBox = null; // 주 대화 내용 보여줄 공간
let viewHistoryButton = null; // 기록 보기 버튼 (고정 메뉴)
let historyArea = null; // 기록 목록 영역
let mainChatArea = null; // 주 대화 영역
let historyList = null; // 기록 목록 ul 태그
let deleteSelectedButton = null; // 선택 삭제 버튼 (고정 메뉴)
let backToChatButton = null; // 채팅으로 돌아가기 버튼 (고정 메뉴)
let fixedMenu = null; // 고정 메뉴 영역 자체

// === 추가된 변수 ===
let menuToggleButton = null; // 점 세 개 메뉴 토글 버튼 변수 추가!
let newChatButton = null; // 새 채팅 버튼 변수 추가!
// ==================


// 하루키 Render 서버의 API 주소! >>> 이 부분을 꼭 하루키 서버 주소로 바꿔주세요! <<<
const API_ENDPOINT = 'https://natsumi-mi-shu.onrender.com/natsumi'; // <<-- 여기에 하루키 서버 주소 넣기!

// 대화 기록을 localStorage에 저장할 때 사용할 키 이름
const HISTORY_STORAGE_KEY = 'haruki-ai-chat-history-list'; // 기록 저장 키 이름 변경! (이제 목록을 저장)

// 현재 활성 대화의 ID
let currentChatId = null;
// 모든 대화 기록을 저장하는 배열
let allChatHistories = [];

// alert('2. 변수 선언 및 API 주소 설정 완료!'); // 제거!


// 페이지 로드 시 모든 HTML 요소들이 준비되면 실행될 함수
document.addEventListener('DOMContentLoaded', () => {
    // === DOMContentLoaded 실행 시작 (alert 제거!) ===
    // alert('3. DOMContentLoaded 실행 시작!'); // 제거!

    // === HTML 요소들을 찾아서 변수에 할당하는 코드 ===
    userInput = document.getElementById('user-input');
    sendButton = document.getElementById('send-button');
    chatBox = document.getElementById('chat-box');

    viewHistoryButton = document.getElementById('view-history-button');
    deleteSelectedButton = document.getElementById('delete-selected-button');
    backToChatButton = document.getElementById('back-to-chat-button');

    historyArea = document.getElementById('history-area');
    mainChatArea = document.getElementById('main-chat-area');
    historyList = document.getElementById('history-list');
    fixedMenu = document.getElementById('fixed-menu');

    menuToggleButton = document.getElementById('menu-toggle-button');
    newChatButton = document.getElementById('new-chat-button');


    // === 요소들을 찾았는지 확인하는 로그 (alert 제거!) ===
    if (sendButton) { console.log("4. Send button found!"); } else { console.error("4. Send button NOT found! Check index.html"); } // alert 제거!
    if (userInput) { console.log("5. User input found!"); } else { console.error("5. User input NOT found! Check index.html"); } // alert 제거!
    if (chatBox) { console.log("6. Chat box found!"); } else { console.error("6. Chat box NOT found! Check index.html"); } // alert 제거!
    if (viewHistoryButton) { console.log("7. View history button found!"); } else { console.error("7. View history button NOT found! Check index.html"); } // alert 제거!
    if (deleteSelectedButton) { console.log("8. Delete selected button found!"); } else { console.error("8. Delete selected button NOT found! Check index.html"); } // alert 제거!
    if (backToChatButton) { console.log("9. Back to chat button found!"); } else { console.error("9. Back to chat button NOT found! Check index.html"); } // alert 제거!

    if (historyArea) { console.log("10. History area found!"); } else { console.error("10. History area NOT found! Check index.html"); } // alert 제거!
     if (mainChatArea) { console.log("11. Main chat area found!"); } else { console.error("11. Main chat area NOT found! Check index.html"); } // alert 제거!
     if (historyList) { console.log("12. History list found!"); } else { console.error("12. History list NOT found! Check index.html"); } // alert 제거!
     if (fixedMenu) { console.log("13. Fixed menu area found!"); } else { console.error("13. Fixed menu area NOT found! Check index.html"); } // alert 제거!

     // === 추가된 요소 찾기 확인 (alert 제거!) ===
     if (menuToggleButton) { console.log("14. Menu toggle button found!"); } else { console.error("14. Menu toggle button NOT found! Check index.html - id='menu-toggle-button'"); } // alert 제거!
     if (newChatButton) { console.log("15. New chat button found!"); } else { console.error("15. New chat button NOT found! Check index.html - id='new-chat-button'"); } // alert 제거!
     // ==========================


    // === 버튼 클릭 이벤트 리스너들을 연결하는 코드 ===
    if (sendButton) {
        sendButton.addEventListener('click', async () => {
            await processUserInput();
        });
        console.log("16. Send button event listener attached."); // alert 제거!
        // alert('16. Send button event listener attached!'); // 제거!
    } else {
         console.error("Error: '보내기' 버튼 요소를 찾을 수 없습니다! index.html의 id='send-button' 확인!");
    }


    if (userInput) {
         userInput.addEventListener('keypress', async (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                await processUserInput();
            }
        });
         console.log("17. User input keypress listener attached."); // alert 제거!
         // alert('17. User input keypress listener attached!'); // 제거!
    } else {
         console.error("Error: 입력창 요소를 찾을 수 없습니다! index.html의 id='user-input' 확인!");
    }


    if (viewHistoryButton) {
        viewHistoryButton.addEventListener('click', () => {
            showHistoryList();
        });
        console.log("18. View history button event listener attached."); // alert 제거!
        // alert('18. View history button event listener attached!'); // 제거!
    } else {
         console.error("Error: '대화 기록 보기' 버튼 요소를 찾을 수 없습니다! index.html의 id='view-history-button' 확인!");
    }

    if (deleteSelectedButton && historyList) {
        deleteSelectedButton.addEventListener('click', () => {
            deleteSelectedHistories();
        });
        console.log("19. Delete selected button event listener attached."); // alert 제거!
        // alert('19. Delete selected button event listener attached!'); // 제거!
    } else {
        console.error("Error: '선택 삭제' 버튼 요소 또는 historyList를 찾을 수 없습니다! index.html 확인!");
    }

    if (backToChatButton && mainChatArea && historyArea && userInput) {
        backToChatButton.addEventListener('click', () => {
            showMainChatArea();
        });
        console.log("20. Back to chat button event listener attached."); // alert 제거!
        // alert('20. Back to chat button event listener attached!'); // 제거!
    } else {
        console.error("Error: '채팅으로 돌아가기' 버튼 요소 또는 관련 영역 요소를 찾을 수 없습니다! index.html 확인!");
    }

    // === 추가된 이벤트 리스너 연결 ===
    if (menuToggleButton && fixedMenu) {
        menuToggleButton.addEventListener('click', () => {
            fixedMenu.classList.toggle('hidden');
            console.log("21. Menu toggled."); // alert 제거!
            // alert('21. 메뉴 토글 버튼 클릭!'); // 제거!
        });
        console.log("22. Menu toggle button event listener attached."); // alert 제거!
        // alert('22. Menu toggle button event listener attached!'); // 제거!
    } else {
         console.error("Error: Menu toggle button or fixed menu element not found for toggle function!");
    }

    if (newChatButton && mainChatArea && historyArea) {
        newChatButton.addEventListener('click', () => {
            startNewChat();
            showMainChatArea();
            console.log("23. New chat button clicked. Starting new chat and showing main area."); // alert 제거!
            // alert('23. 새 채팅 버튼 클릭!'); // 제거!
             if (fixedMenu && !fixedMenu.classList.contains('hidden')) {
                  fixedMenu.classList.add('hidden');
                   console.log("Closed menu after starting new chat.");
             }
        });
        console.log("24. New chat button event listener attached."); // alert 제거!
        // alert('24. New chat button event listener attached!'); // 제거!
    } else {
        console.error("Error: New chat button or area elements not found for new chat function!");
    }
     // ==============================


     console.log("25. All event listeners attempted to be attached."); // alert 제거!
     // alert('25. 모든 이벤트 리스너 연결 시도 완료!'); // 제거!
    // =======================================================

    // === DOMContentLoaded 초기 설정 (alert 제거!) ===
    // alert('26. DOMContentLoaded 초기 설정 시작!'); // 제거!


    // 초기 로드 시 모든 대화 기록 불러오기 및 설정
    loadAllHistories();
    if (allChatHistories.length > 0) {
        const lastValidChat = allChatHistories.findLast(chat => chat && chat.id && Array.isArray(chat.messages));
        if (lastValidChat) {
             currentChatId = lastValidChat.id;
             renderChatMessages(currentChatId);
             console.log(`27. Loaded last chat history with ID: ${currentChatId}`); // alert 제거!
             // alert('27. 마지막 대화 기록 로드 및 렌더링!'); // 제거!
        } else {
             allChatHistories = [];
             startNewChat();
             console.log("27. No valid chat history found. Starting a new chat."); // alert 제거!
        }

    } else {
        startNewChat();
        console.log("27. No chat history found. Starting empty."); // alert 제거!
    }

    // === 초기 버튼 가시성 설정 ===
     if (viewHistoryButton && deleteSelectedButton && backToChatButton && newChatButton) {
        viewHistoryButton.classList.remove('hidden');
        newChatButton.classList.remove('hidden');

        deleteSelectedButton.classList.add('hidden');
        backToChatButton.classList.add('hidden');

        console.log('28. 초기 메뉴 버튼 가시성 설정 완료!'); // alert 제거!
        // alert('28. 초기 메뉴 버튼 가시성 설정 완료!'); // 제거!
     } else {
          console.error("Error: Menu buttons not found for initial visibility setting!");
          // alert('28. 초기 메뉴 버튼 가시성 설정 실패! 요소 누락!'); // 제거!
     }


    // 입력창에 커서 두기
    if (userInput) {
         userInput.focus();
         console.log('29. 입력창에 커서 두기!'); // alert 제거!
         // alert('29. 입력창에 커서 두기!'); // 제거!
    }


    // === DOMContentLoaded 실행 완료 (alert 제거!) ===
    // alert('30. DOMContentLoaded 실행 완료! 이제 버튼 눌러봐!'); // 제거!
     console.log('30. DOMContentLoaded 실행 완료!');
});


// 새 대화를 시작하는 함수
function startNewChat() {
    // === startNewChat 함수 실행 시작 (alert 제거!) ===
    // alert('startNewChat 함수 실행 시작!'); // 제거!
    console.log('startNewChat 함수 실행 시작!'); // 로그 추가!

    currentChatId = `chat-${Date.now()}`;
    const newChat = { id: currentChatId, messages: [] };
    allChatHistories.push(newChat);
    saveAllHistories();

     if (chatBox) {
         chatBox.innerHTML = '';
         const initialMessage = document.createElement('p');
         initialMessage.classList.add('ai-message');
         initialMessage.textContent = '뭐야 할말이라도 있는거야?';
         chatBox.appendChild(initialMessage);
         chatBox.scrollTop = chatBox.scrollHeight;
         console.log("New chat started with ID:", currentChatId); // alert 제거!
         // alert('startNewChat: 새 대화 시작 및 초기 메시지 렌더링!'); // 제거!
     } else {
         console.error("Error: Chat box element not found when starting new chat!");
         // alert('startNewChat Error: 채팅창 요소를 찾을 수 없어요!'); // 제거!
     }

     // alert('startNewChat 함수 실행 완료!'); // 제거!
     console.log('startNewChat 함수 실행 완료!'); // 로그 추가!
}


// 입력 처리 및 API 통신을 담당하는 함수
async function processUserInput() {

    // === 하루키! 이 alert로 버튼 눌림 확인! === (제거!)
    // alert('processUserInput 함수 실행 시작!'); // 제거!
    console.log('processUserInput 함수 실행 시작!'); // 로그 추가!
    // ========================================

    if (!userInput || !sendButton || !chatBox) {
        console.error("Error: Input/Chat elements not available in processUserInput!");
        // alert("Error: 입력 요소에 문제가 있어요! (processUserInput)"); // 제거!
        return;
    }

    // alert('processUserInput: 입력 요소 확인 완료!'); // 제거!
    console.log('processUserInput: 입력 요소 확인 완료!'); // 로그 추가!


    const question = userInput.value.trim();

    if (question === '') {
        // alert('processUserInput: 질문이 비어있음. 중단!'); // 제거!
        console.log('processUserInput: 질문이 비어있음. 중단!'); // 로그 추가!
        return;
    }

     // alert('processUserInput: 질문 내용 확인 완료!'); // 제거!
     console.log('processUserInput: 질문 내용 확인 완료!'); // 로그 추가!

    addMessageToCurrentChatHistory('user', question);
    addMessageToChat('user', question);

    // alert('processUserInput: 사용자 메시지 추가 및 화면 표시 완료!'); // 제거!
    console.log('processUserInput: 사용자 메시지 추가 및 화면 표시 완료!'); // 로그 추가!


    userInput.value = '';
    userInput.disabled = true;
    sendButton.disabled = true;

    // alert('processUserInput: 입력창 비우고 비활성화 완료!'); // 제거!
    console.log('processUserInput: 입력창 비우고 비활성화 완료!'); // 로그 추가!


    const loadingIndicator = document.createElement('p');
    loadingIndicator.textContent = 'AI 비서가 생각 중...';
    loadingIndicator.classList.add('ai-message', 'loading-indicator');
    chatBox.appendChild(loadingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;


    try {
        console.log(`Sending request to API: ${API_ENDPOINT}`); // alert 제거!
        // alert('processUserInput: API 요청 보내기 시도!'); // 제거!
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: question })
        });
         console.log("API response received."); // alert 제거!
         // alert('processUserInput: API 응답 받음!'); // 제거!


        if (loadingIndicator && chatBox.contains(loadingIndicator)) {
           chatBox.removeChild(loadingIndicator);
        }


        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error! status: ${response.status}, message: ${errorText}`); // alert 제거!
            // alert(`processUserInput: HTTP 오류! 상태: ${response.status}`); // 제거!

            try {
                 const errorJson = JSON.parse(errorText);
                 if (errorJson && errorJson.reply) {
                      throw new Error(errorJson.reply);
                 } else {
                     throw new Error('엣, 서버가 말을 안 듣네. 답답하구만!');
                 }
            } catch (e) {
                 throw new Error('엣, 서버가 말을 안 듣네. 답답하구만!');
            }
        }

        const data = await response.json();
         console.log("API response data:", data); // alert 제거!
         // alert('processUserInput: API 응답 데이터 받음!'); // 제거!

        // === 💡 여기!!! data.answer 를 data.reply 로 수정했어! ===
        const aiResponse = data.reply;
        // ====================================================


        if (aiResponse && aiResponse.trim() !== '') {
             addMessageToCurrentChatHistory('ai', aiResponse);
             addMessageToChat('ai', aiResponse);
             console.log("AI response added to chat."); // alert 제거!
             // alert('processUserInput: AI 답변 화면 표시 및 기록!'); // 제거!
        } else {
             const errorAiMessage = '뭐야 이 이상한 답장은?! 제대로 된 걸 보내라고! (혹은 빈 응답?)';
             addMessageToChat('ai', errorAiMessage);
             addMessageToCurrentChatHistory('ai', errorAiMessage);
             console.warn("API response data did not contain a valid 'reply' field or it was empty."); // alert 제거!
             // alert('processUserInput: API 응답에 답변(reply) 필드가 없거나 비어있어요!'); // 제거!
        }

    } catch (error) {
        console.error('API 통신 중 에러 발생:', error);

        if (loadingIndicator && chatBox.contains(loadingIndicator)) {
           chatBox.removeChild(loadingIndicator);
        }

        const errorMessage = error.message || '죄송해요, 답변을 가져오는데 문제가 발생했어요. (Console 확인)';
        addMessageToChat('ai', errorMessage);
         addMessageToCurrentChatHistory('ai', errorMessage);
        console.error("Error message added to chat."); // alert 제거!
        // alert(`processUserInput: API 통신 중 Catch 에러 발생: ${errorMessage}`); // 제거!

    } finally {
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
        saveAllHistories();
        console.log("Process input finished. Elements enabled."); // alert 제거!
        // alert('processUserInput 함수 실행 완료!'); // 제거!
         console.log('processUserInput 함수 실행 완료!'); // 로그 추가!
    }
}

// 현재 활성 대화 기록에 메시지를 추가하는 함수
function addMessageToCurrentChatHistory(sender, text) {
    if (!currentChatId) {
        console.error("Error: currentChatId is not set when trying to add message to history!");
        return;
    }

    const currentChat = allChatHistories.find(chat => chat.id === currentChatId);

    if (currentChat) {
        currentChat.messages.push({ sender: sender, text: text });
        console.log(`Message added to history ${currentChatId}: ${text}`);
    } else {
         console.error(`Error: Current chat object not found in allChatHistories for ID: ${currentChatId}`);
    }
}


// 대화창에 메시지를 추가하고 스크롤을 내리는 함수
function addMessageToChat(sender, message) {
     if (!chatBox) {
          console.error("Error: Chat box element not found when adding message!");
          return;
     }

    const messageElement = document.createElement('p');

    if (sender === 'user') {
        messageElement.classList.add('user-message');
        messageElement.textContent = message;
    } else { // sender === 'ai'
         messageElement.classList.add('ai-message');
         messageElement.textContent = message;
    }

    chatBox.appendChild(messageElement);

    chatBox.scrollTop = chatBox.scrollHeight;
    console.log(`Message added to chat box: ${message}`);
}


// 모든 대화 기록을 localStorage에서 불러와서 allChatHistories 배열에 저장하는 함수
function loadAllHistories() {
    const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (historyJson) {
        try {
            allChatHistories = JSON.parse(historyJson);
            if (!Array.isArray(allChatHistories)) {
                allChatHistories = [];
                 console.warn("Loaded history is not an array. Initialized as empty.");
            }
            allChatHistories = allChatHistories.filter(chat =>
                 chat && typeof chat.id === 'string' && Array.isArray(chat.messages) && chat.messages.length > 0
            );
             console.log(`Loaded ${allChatHistories.length} chat histories.`);

        } catch (e) {
            console.error("Failed to parse chat history list from localStorage:", e);
            allChatHistories = [];
            localStorage.removeItem(HISTORY_STORAGE_KEY);
             console.log("LocalStorage history cleared due to parse error.");
        }
    } else {
        allChatHistories = [];
        console.log("No history found in localStorage. Starting empty.");
    }
}

// 현재 allChatHistories 배열의 모든 대화 기록을 localStorage에 저장하는 함수
function saveAllHistories() {
    try {
        const historiesToSave = allChatHistories.filter(chat => chat.messages.length > 0);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historiesToSave));
        console.log(`Chat histories saved to localStorage. Count: ${historiesToSave.length}`);
    } catch (e) {
         console.error("Failed to save chat history list to localStorage:", e);
    }
}


// 특정 대화의 메시지들을 화면의 chatBox에 렌더링하는 함수
function renderChatMessages(chatId) {
     if (!chatBox) {
          console.error("Error: Chat box element not found when rendering messages!");
          return;
     }

    chatBox.innerHTML = '';

    const chatToRender = allChatHistories.find(chat => chat.id === chatId);

    if (!chatToRender || !chatToRender.messages || chatToRender.messages.length === 0) {
         const initialMessage = document.createElement('p');
         initialMessage.classList.add('ai-message');
         initialMessage.textContent = '뭐야 할말이라도 있는거야?';
         chatBox.appendChild(initialMessage);
         console.log(`Rendered initial message for chat ID: ${chatId} (chat not found or empty).`);
    } else {
        chatToRender.messages.forEach(msg => {
            addMessageToChat(msg.sender, msg.text);
        });
        console.log(`Rendered ${chatToRender.messages.length} messages for chat ID: ${chatId}`);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 대화 기록 목록 화면을 보여주는 함수
function showHistoryList() {
    if (!mainChatArea || !historyArea || !historyList || !viewHistoryButton || !deleteSelectedButton || !backToChatButton || !newChatButton || !fixedMenu || !menuToggleButton) {
         console.error("Error: History list or menu elements not found!");
         // alert("Error: 기록 목록을 표시할 수 없어요! 요소 누락!"); // 제거!
         return;
    }

    mainChatArea.classList.add('hidden');
    historyArea.classList.remove('hidden');
    console.log("Switched to history list view.");

    viewHistoryButton.classList.add('hidden');
    newChatButton.classList.add('hidden');

    deleteSelectedButton.classList.remove('hidden');
    backToChatButton.classList.remove('hidden');

     if (fixedMenu && !fixedMenu.classList.contains('hidden')) {
          fixedMenu.classList.add('hidden');
           console.log("Closed menu when switching to history view.");
     }
    console.log("Menu buttons toggled for history view.");


    historyList.innerHTML = '';

    if (allChatHistories.length > 0) {
        const reversedHistories = [...allChatHistories].reverse();

        reversedHistories.forEach(chat => {
             if (!chat.messages || chat.messages.length === 0) {
                 return;
             }

            const listItem = document.createElement('li');
            listItem.dataset.chatId = chat.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('history-checkbox');

            const chatPreview = document.createElement('span');
            const firstUserMessage = chat.messages.find(msg => msg.sender === 'user' && msg.text.trim() !== '');
            const firstMessage = chat.messages.length > 0 ? chat.messages[0] : null;
            const previewText = firstUserMessage ?
                                firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '') :
                                (firstMessage ? firstMessage.text.substring(0, 50) + (firstMessage.text.length > 50 ? '...' : '') : '내용 없음');

            chatPreview.textContent = previewText;


            listItem.appendChild(checkbox);
            listItem.appendChild(chatPreview);

            listItem.addEventListener('click', (event) => {
                 if (event.target.classList.contains('history-checkbox')) {
                     return;
                 }
                 const clickedChatId = listItem.dataset.chatId;
                 if (clickedChatId) {
                    currentChatId = clickedChatId;
                    renderChatMessages(clickedChatId);
                    showMainChatArea();
                 }
            });

            historyList.appendChild(listItem);
        });
        console.log(`Rendered ${reversedHistories.length} history items.`);
    } else {
        const noHistoryItem = document.createElement('li');
        noHistoryItem.textContent = '대화 기록이 없습니다.';
        historyList.appendChild(noHistoryItem);
        console.log("No history items to render.");
    }
    historyList.scrollTop = 0;
}

// 주 대화 영역을 보여주는 함수
function showMainChatArea() {
    if (!mainChatArea || !historyArea || !userInput || !viewHistoryButton || !deleteSelectedButton || !backToChatButton || !newChatButton || !fixedMenu || !menuToggleButton) {
         console.error("Error: Main chat area or menu elements not found!");
          // alert("Error: 채팅 화면으로 돌아갈 수 없어요! 요소 누락!"); // 제거!
         return;
    }

    historyArea.classList.add('hidden');
    mainChatArea.classList.remove('hidden');
    userInput.focus();
    console.log("Switched to main chat area view.");

    viewHistoryButton.classList.remove('hidden');
    newChatButton.classList.remove('hidden');

    deleteSelectedButton.classList.add('hidden');
    backToChatButton.classList.add('hidden');

     if (fixedMenu && !fixedMenu.classList.contains('hidden')) {
          fixedMenu.classList.add('hidden');
           console.log("Closed menu when switching to main chat view.");
     }
    console.log("Menu buttons toggled for main chat view.");
}


// '선택 삭제' 버튼 클릭 시 선택된 대화 기록 삭제 함수
function deleteSelectedHistories() {
     if (!historyList || !deleteSelectedButton) {
          console.error("Error: History list or delete button element not found for deletion!");
          // alert("Error: 삭제 기능을 사용할 수 없어요! 요소 누락!"); // 제거!
          return;
     }
    const selectedCheckboxes = historyList.querySelectorAll('.history-checkbox:checked');

    if (selectedCheckboxes.length === 0) {
        // === 삭제할 거 없을 때 츤데레 메시지 ===
        alert('흥, 뭘 삭제하겠다는 거야? 선택이나 하라고!'); // 이건 사용자 알림이니 남겨둠
        return;
    }

    // 사용자에게 진짜 삭제할 건지 확인 (츤데레 말투 적용)
    const confirmDelete = confirm(`정말로 선택된 대화 기록 ${selectedCheckboxes.length}개를 모두 삭제하시겠습니까? 엣, 진짜 지울 거야?`);

    if (confirmDelete) {
        const idsToDelete = [];
        selectedCheckboxes.forEach(checkbox => {
            const listItem = checkbox.closest('li');
            if (listItem && listItem.dataset.chatId) {
                idsToDelete.push(listItem.dataset.chatId);
            }
        });

        const initialCount = allChatHistories.length;
        allChatHistories = allChatHistories.filter(chat => !idsToDelete.includes(chat.id));
        const deletedCount = initialCount - allChatHistories.length;

        saveAllHistories();
        console.log(`Deleted ${deletedCount} chat histories.`);

        if (currentChatId && idsToDelete.includes(currentChatId)) {
             console.log("Current chat history was deleted.");
             currentChatId = null;
             console.log("currentChatId set to null as current history was deleted.");
        }

        showHistoryList();

        // 삭제 완료 알림 (츤데레 말투 적용)
         alert(`${deletedCount}개의 대화 기록을 삭제했어. ...딱히 네 기록이 궁금했던 건 아니야.`); // 이건 사용자 알림이니 남겨둠

    }
}

// 초기 메시지 처리는 loadAllHistories와 startNewChat 함수에서 이미 처리됨.

// 로딩 인디케이터 스타일을 위한 CSS 클래스 (style.css에 추가해주세요)
/*
.ai-message.loading-indicator {
    font-style: italic;
    color: #888;
}
*/

// 숨김 처리를 위한 CSS 클래스 (style.css에 추가해주세요)
/*
.hidden {
    display: none !important;
}
*/

// 메뉴 아이콘 및 고정 메뉴 스타일 (style.css에 추가해주세요)
/*
.menu-icon {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1000; // 다른 요소들 위에 오도록
    background-color: #eee; // 배경색 (임시)
    border: 1px solid #ccc;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 20px; // 점 세 개 크기 조절
    border-radius: 5px;
}

#fixed-menu {
    position: fixed;
    top: 50px; // 아이콘 아래 위치
    right: 10px;
    z-index: 999; // 아이콘보다 아래, 다른 요소보다 위
    background-color: #fff; // 메뉴 배경색
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    display: flex; // 버튼들을 세로로 정렬
    flex-direction: column;
    gap: 5px; // 버튼 사이 간격
    box-shadow: 0 2px 10px rgba(0,0,0,0.1); // 그림자 효과
}

#fixed-menu .menu-button {
    padding: 8px 15px;
    border: none;
    background-color: #007bff; // 버튼 배경색
    color: white; // 버튼 글자색
    border-radius: 4px;
    cursor: pointer;
    text-align: left; // 글자 왼쪽 정렬
}

#fixed-menu .menu-button:hover {
    background-color: #0056b3; // 호버 시 색상 변경
}
*/

script.js야 전체코드다!
