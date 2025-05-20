// HTML 요소들을 저장할 변수들을 먼저 선언 (DOMContentLoaded 안에서 할당할 것임)
let userInput;
let sendButton;
let chatBox; // 주 대화 내용 보여줄 공간
let viewHistoryButton; // 기록 보기 버튼
let historyArea; // 기록 목록 영역
let mainChatArea; // 주 대화 영역
let historyList; // 기록 목록 ul 태그
let deleteSelectedButton; // 선택 삭제 버튼
let backToChatButton; // 채팅으로 돌아가기 버튼


// 하루키 Render 서버의 API 주소! >>> 이 부분을 꼭 하루키 서버 주소로 바꿔주세요! <<<
const API_ENDPOINT = 'https://natsumi-mi-shu.onrender.com/natsumi'; // <<-- 여기에 하루키 서버 주소 넣기!

// 대화 기록을 localStorage에 저장할 때 사용할 키 이름
const HISTORY_STORAGE_KEY = 'haruki-ai-chat-history-list'; // 기록 저장 키 이름 변경! (이제 목록을 저장)

// 현재 활성 대화의 ID
let currentChatId = null;
// 모든 대화 기록을 저장하는 배열
let allChatHistories = [];


// 페이지 로드 시 모든 HTML 요소들이 준비되면 실행될 함수
document.addEventListener('DOMContentLoaded', () => {
    // === HTML 요소들을 찾아서 변수에 할당하는 코드 ===
    // 이 코드들이 HTML이 다 로드된 후에 실행되도록 DOMContentLoaded 안으로 옮겼어요!
    userInput = document.getElementById('user-input');
    sendButton = document.getElementById('send-button');
    chatBox = document.getElementById('chat-box');
    viewHistoryButton = document.getElementById('view-history-button');
    historyArea = document.getElementById('history-area');
    mainChatArea = document.getElementById('main-chat-area');
    historyList = document.getElementById('history-list');
    deleteSelectedButton = document.getElementById('delete-selected-button');
    backToChatButton = document.getElementById('back-to-chat-button');

    // === 버튼 클릭 이벤트 리스너들을 연결하는 코드 ===
    // 이제 HTML 요소들이 다 로드된 후에 연결됨!
    // sendButton 요소가 제대로 찾아졌는지 확인하는 코드 추가
    if (sendButton) {
        sendButton.addEventListener('click', async () => {
            await processUserInput(); // 입력 처리 함수 호출
        });
        console.log("Send button found and event listener attached."); // 콘솔 로그 추가 (PC에서 Console 확인 시 유용)
    } else {
         console.error("Error: '보내기' 버튼 요소를 찾을 수 없습니다! index.html의 id='send-button' 확인!"); // 버튼 못 찾았을 때 에러 로그 (Console 확인용)
         // alert("Error: '보내기' 버튼을 찾을 수 없어요! index.html의 id='send-button'을 확인해주세요!"); // 혹시 몰라 사용자에게도 알림 (Console 확인이 어려우니)
    }


    // userInput 요소가 제대로 찾아졌는지 확인하는 코드 추가
    if (userInput) {
         userInput.addEventListener('keypress', async (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Enter 키 기본 동작 (줄바꿈) 막기
                await processUserInput(); // 입력 처리 함수 호출
            }
        });
         userInput.focus(); // 페이지 로드 시 입력창에 커서 두기 (DOMContentLoaded 안으로 이동)
         console.log("User input found and keypress listener attached."); // 콘솔 로그 추가
    } else {
         console.error("Error: 입력창 요소를 찾을 수 없습니다! index.html의 id='user-input' 확인!"); // 입력창 못 찾았을 때 에러 로그
         // alert("Error: 입력창을 찾을 수 없어요! index.html의 id='user-input'을 확인해주세요!"); // 혹시 몰라 사용자에게도 알림
    }


    // viewHistoryButton 요소가 제대로 찾아졌는지 확인하는 코드 추가
    if (viewHistoryButton) {
        viewHistoryButton.addEventListener('click', () => {
            showHistoryList(); // 기록 목록 화면 보여주는 함수 호출
        });
        console.log("View history button found and event listener attached."); // 콘솔 로그 추가
    } else {
         console.error("Error: '대화 기록 보기' 버튼 요소를 찾을 수 없습니다! index.html의 id='view-history-button' 확인!"); // 버튼 못 찾았을 때 에러 로그
    }

    // deleteSelectedButton 요소가 제대로 찾아졌는지 확인하는 코드 추가
    if (deleteSelectedButton) {
        deleteSelectedButton.addEventListener('click', () => {
            deleteSelectedHistories(); // 선택 삭제 함수 호출
        });
        console.log("Delete selected button found and event listener attached."); // 콘솔 로그 추가
    } else {
        console.error("Error: '선택 삭제' 버튼 요소를 찾을 수 없습니다! index.html의 id='delete-selected-button' 확인!"); // 버튼 못 찾았을 때 에러 로그
    }

    if (backToChatButton) { // 채팅으로 돌아가기 버튼 찾았는지 확인
        backToChatButton.addEventListener('click', () => {
            // Logic to return to chat is inside the function itself
            showMainChatArea(); // 주 대화 영역으로 전환 함수 호출
        });
        console.log("Back to chat button found and event listener attached."); // 콘솔 로그 추가
    } else {
        console.error("Error: '채팅으로 돌아가기' 버튼 요소를 찾을 수 없습니다! index.html의 id='back-to-chat-button' 확인!"); // 버튼 못 찾았을 때 에러 로그
    }
     console.log("All event listeners attempted to be attached."); // 콘솔 로그 추가
    // =======================================================


    // 초기 로드 시 모든 대화 기록 불러오기 및 설정
    loadAllHistories(); // 모든 기록 불러오기
    if (allChatHistories.length > 0) {
         // 저장된 기록이 있으면 마지막 대화를 현재 대화로 설정
        // ID가 있는 유효한 마지막 대화 찾기 (혹시 모를 오류 방지)
        const lastValidChat = allChatHistories.findLast(chat => chat && chat.id && Array.isArray(chat.messages));
        if (lastValidChat) {
             currentChatId = lastValidChat.id;
             renderChatMessages(currentChatId); // 마지막 대화 내용을 화면에 표시
             console.log(`Loaded last chat history with ID: ${currentChatId}`); // 콘솔 로그 추가
        } else {
             // 유효한 기록이 없으면 새 대화 시작
             allChatHistories = []; // 혹시 이상한 기록이 로드됐으면 비우기
             startNewChat();
             console.log("No valid chat history found. Starting a new chat."); // 콘솔 로그 추가
        }

    } else {
         // 저장된 기록이 없으면 새 대화 시작
        startNewChat();
        console.log("No chat history found. Starting a new chat."); // 콘솔 로그 추가
    }
    // userInput.focus(); // DOMContentLoaded 안에서 userInput을 찾은 후에 호출하도록 위로 이동
});


// 새 대화를 시작하는 함수
function startNewChat() {
    currentChatId = `chat-${Date.now()}`; // 현재 시간을 기반으로 고유 ID 생성
    allChatHistories.push({ id: currentChatId, messages: [] }); // 새로운 대화 객체를 목록에 추가
    saveAllHistories(); // 변경사항 저장
    renderChatMessages(currentChatId); // 새 대화 화면을 비우고 초기 메시지 표시
     // 새 대화 시작 시 초기 메시지 추가 (화면에만 표시, 기록에는 저장 안 함)
     // addMessageToChat 함수는 이제 기록 저장 로직을 포함하지 않음. 기록 저장은 processUserInput에서 addMessageToCurrentChatHistory 호출 후 saveAllHistories로 일괄 처리.
     // 초기 메시지는 화면에만! (새로고침하면 다시 나옴)
     // chatBox가 로드된 후에 사용 가능하므로 DOMContentLoaded 안에서 호출되거나, 아니면 chatBox 사용 전에 null 체크 필요
     if (chatBox) { // chatBox 요소가 있는지 확인
         chatBox.innerHTML = ''; // 혹시 남아있는 초기 메시지 제거
         const initialMessage = document.createElement('p');
         initialMessage.classList.add('ai-message');
         initialMessage.textContent = '뭐야 할말이라도 있는거야?';
         chatBox.appendChild(initialMessage);
         chatBox.scrollTop = chatBox.scrollHeight; // 스크롤 맨 아래로
         console.log("New chat started with initial message."); // 콘솔 로그 추가
     } else {
         console.error("Error: Chat box element not found when starting new chat!");
     }
}


// 입력 처리 및 API 통신을 담당하는 함수 (DOMContentLoaded 안에서 호출됨)
async function processUserInput() {

    // === 하루키! 이 alert로 버튼 눌림 확인! ===
    // 이 팝업창이 뜨면 버튼 클릭 감지 및 processUserInput 함수 실행은 성공한 거야!
    alert('버튼이 눌렸어! processUserInput 함수 실행!');
    // ========================================

    // userInput, sendButton 요소가 있는지 다시 한번 확인 (안정성 향상)
    if (!userInput || !sendButton) {
        console.error("Error: Input elements not available in processUserInput!");
        // alert("Error: 입력 요소에 문제가 있어요!"); // 필요시 알림
        return;
    }


    const question = userInput.value.trim(); // 사용자가 입력한 질문 가져오기 (앞뒤 공백 제거)

    // 질문이 비어있으면 아무것도 안 해
    if (question === '') {
        return;
    }

     // 현재 대화에 사용자 메시지 추가 및 화면 표시
    addMessageToCurrentChatHistory('user', question); // 기록에 추가
    addMessageToChat('user', question); // 화면에 표시

    // 입력창 비우기
    userInput.value = '';
    userInput.disabled = true; // 답변 올 때까지 입력 비활성화
    sendButton.disabled = true; // 답변 올 때까지 버튼 비활성화

    // 로딩 인디케이터 추가 (선택 사항: CSS로 예쁘게 꾸밀 수 있어요!)
    // const loadingIndicator = document.createElement('p');
    // loadingIndicator.textContent = 'AI 비서가 생각 중...';
    // loadingIndicator.classList.add('ai-message', 'loading-indicator'); // AI 메시지 스타일 + 로딩 스타일
    // chatBox.appendChild(loadingIndicator);
    // chatBox.scrollTop = chatBox.scrollHeight; // 스크롤 맨 아래로


    // AI 비서에게 질문 보내고 답변 받기 (핵심!)
    try {
        // Render 서버 API로 요청 보내기
        const response = await fetch(API_ENDPOINT, {
            method: 'POST', // 데이터를 보낼 때는 보통 POST 방식!
            headers: {
                'Content-Type': 'application/json' // 보내는 데이터 형식이 JSON이라고 알려주기
            },
            body: JSON.stringify({ message: question }) // 질문을 JSON 형식으로 만들어서 보내기. 하루키 서버가 { message: "질문 내용" } 이런 형식을 기대한다고 가정!
        });

        // 로딩 인디케이터 제거 (선택 사항)
        // if (loadingIndicator && chatBox.contains(loadingIndicator)) {
        //    chatBox.removeChild(loadingIndicator);
        // }


        // 응답이 성공했는지 확인
        if (!response.ok) {
            // 서버에서 에러 메시지가 있다면 가져오기
            const errorText = await response.text();
            // === 서버 오류 메시지 츤데레 말투! ===
            // 에러 메시지 자체는 콘솔에 더 자세히 찍고, 사용자에게는 츤데레 메시지만 보여줌.
            console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            throw new Error('엣, 서버가 말을 안 듣네. 답답하구만!'); // 츤데레 메시지만 throw
        }

        // 서버에서 온 응답 데이터를 JSON 형식으로 받기
        const data = await response.json();
        // 하루키 서버에서 'answer'라는 키로 답변을 줄 거라고 가정!
        // 하루키 서버 응답 형식이 다르면 아래 'data.answer' 부분을 바꿔줘야 해요!
        const aiResponse = data.answer;

        if (aiResponse) { // 답변 내용이 있을 때만 표시
             // AI 비서의 답변을 대화창에 표시하고 기록 저장
             addMessageToCurrentChatHistory('ai', aiResponse); // 기록에 추가
             addMessageToChat('ai', aiResponse); // 화면에 표시
        } else {
            // === 서버 응답 형식 오류 메시지 츤데레 말투! ===
             addMessageToChat('ai', '뭐야 이 이상한 답장은?! 제대로 된 걸 보내라고!'); // 화면에 표시
              addMessageToCurrentChatHistory('ai', '뭐야 이 이상한 답장은?! 제대로 된 걸 보내라고!'); // 기록에 추가

        }

    } catch (error) {
        // 만약 에러가 나면 콘솔에 찍고 대화창에도 에러 메시지 표시
        console.error('API 통신 중 에러 발생:', error);

        // 로딩 인디케이터 제거 (선택 사항)
        // if (loadingIndicator && chatBox.contains(loadingIndicator)) {
        //    chatBox.removeChild(loadingIndicator);
        // }

        // === 에러 발생 시 최종 출력 메시지 츤데레 말투! ===
        const errorMessage = '죄송해요, 답변을 가져오는데 문제가 발생했어요. (Console 확인)'; // 콘솔 확인 메시지 포함
        addMessageToChat('ai', errorMessage); // 화면에 표시
         addMessageToCurrentChatHistory('ai', errorMessage); // 기록에 추가

    } finally {
        // 모든 처리가 끝나면 입력창과 버튼 다시 활성화
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus(); // 입력창에 커서 두기
        saveAllHistories(); // 모든 변경사항 저장
        console.log("Process input finished. Elements enabled."); // 콘솔 로그 추가
    }
}

// 현재 활성 대화 기록에 메시지를 추가하는 함수
function addMessageToCurrentChatHistory(sender, text) {
    // 현재 대화 찾기
    const currentChat = allChatHistories.find(chat => chat.id === currentChatId);
    if (currentChat) {
        // 메시지 객체를 현재 대화의 messages 배열에 추가
        currentChat.messages.push({ sender: sender, text: text });
        console.log(`Message added to history ${currentChatId}: ${text}`); // 콘솔 로그 추가
    } else {
         // 만약 currentChatId가 유효하지 않다면 새 대화 시작 (오류 방지)
         console.warn("Current chat ID not found. Starting a new chat.");
         startNewChat(); // 새 대화 시작 시 currentChatId 업데이트됨
         // 새롭게 생성된 currentChat에 메시지 다시 추가 시도
         const newChat = allChatHistories.find(chat => chat.id === currentChatId);
         if(newChat) {
              newChat.messages.push({ sender: sender, text: text });
               console.log(`Message added to newly started chat ${currentChatId}: ${text}`); // 콘솔 로그 추가
         } else {
              console.error("Error: Failed to start new chat and add message to history."); // 심각한 오류
         }
    }
}


// 대화창에 메시지를 추가하고 스크롤을 내리는 함수
// sender: 'user' or 'ai', message: 내용
function addMessageToChat(sender, message) {
     // chatBox 요소가 있는지 확인 (DOMContentLoaded 전에 호출될 경우 대비)
     if (!chatBox) {
          console.error("Error: Chat box element not found when adding message!");
          return;
     }

    const messageElement = document.createElement('p'); // <p> 태그 만들기

    if (sender === 'user') {
        messageElement.classList.add('user-message'); // 사용자 메시지 클래스 추가
        messageElement.textContent = message; // 메시지 내용 설정
    } else { // sender === 'ai'
         messageElement.classList.add('ai-message'); // AI 메시지 클래스 추가
         messageElement.textContent = message; // 메시지 내용 설정
    }

    chatBox.appendChild(messageElement); // 대화창에 추가하기

    // 스크롤을 항상 맨 아래로 내려서 최신 메시지가 보이게
    chatBox.scrollTop = chatBox.scrollHeight;
    console.log(`Message added to chat box: ${message}`); // 콘솔 로그 추가
}


// 모든 대화 기록을 localStorage에서 불러와서 allChatHistories 배열에 저장하는 함수
function loadAllHistories() {
    const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (historyJson) {
        try {
            // JSON 문자열을 JavaScript 객체 배열로 변환
            allChatHistories = JSON.parse(historyJson);
            // 만약 빈 배열이 로드되었거나 형식이 이상하면 초기화
            if (!Array.isArray(allChatHistories)) {
                allChatHistories = [];
                 console.warn("Loaded history is not an array. Initialized as empty."); // 콘솔 로그 추가
            }
            // 혹시 모를 빈 메시지 배열 또는 유효하지 않은 chat 객체 제거 및 유효성 검사 강화
            allChatHistories = allChatHistories.filter(chat =>
                 chat && typeof chat.id === 'string' && Array.isArray(chat.messages)
            );
             console.log(`Loaded ${allChatHistories.length} chat histories.`); // 콘솔 로그 추가

        } catch (e) {
            console.error("Failed to parse chat history list from localStorage:", e);
            allChatHistories = []; // 에러 발생 시 초기화
             // 파싱 실패 시 localStorage 기록 삭제 (잘못된 형식일 경우)
            localStorage.removeItem(HISTORY_STORAGE_KEY);
             console.log("LocalStorage history cleared due to parse error."); // 콘솔 로그 추가
        }
    } else {
        allChatHistories = []; // 저장된 기록이 없으면 빈 배열로 시작
        console.log("No history found in localStorage. Starting empty."); // 콘솔 로그 추가
    }
}

// 현재 allChatHistories 배열의 모든 대화 기록을 localStorage에 저장하는 함수
function saveAllHistories() {
    try {
        // allChatHistories 배열을 JSON 문자열로 변환하여 localStorage에 저장
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(allChatHistories));
        console.log("Chat histories saved to localStorage."); // 콘솔 로그 추가
    } catch (e) {
         console.error("Failed to save chat history list to localStorage:", e);
         // localStorage 저장 공간 부족 등의 에러 처리 필요 시 추가
    }
}


// 특정 대화의 메시지들을 화면의 chatBox에 렌더링하는 함수
function renderChatMessages(chatId) {
     // chatBox 요소가 있는지 확인 (DOMContentLoaded 전에 호출될 경우 대비)
     if (!chatBox) {
          console.error("Error: Chat box element not found when rendering messages!");
          return;
     }

    // chatBox 내용 비우기
    chatBox.innerHTML = '';

    // 해당 ID를 가진 대화 찾기
    const chatToRender = allChatHistories.find(chat => chat.id === chatId);

    if (chatToRender && chatToRender.messages && chatToRender.messages.length > 0) { // messages 배열 유효성 확인
        // 해당 대화의 메시지들을 순서대로 화면에 추가
        chatToRender.messages.forEach(msg => {
            // addMessageToChat 함수를 사용하여 메시지 추가 (기록 저장은 addMessageToCurrentChatHistory에서 이미 함)
            addMessageToChat(msg.sender, msg.text);
        });
        console.log(`Rendered chat messages for ID: ${chatId}`); // 콘솔 로그 추가
    } else {
         // 해당 대화가 비어있거나 찾을 수 없으면 초기 메시지 표시
        const initialMessage = document.createElement('p');
        initialMessage.classList.add('ai-message');
        initialMessage.textContent = '뭐야 할말이라도 있는거야?';
        chatBox.appendChild(initialMessage);
        console.log(`Rendered initial message for chat ID: ${chatId} (chat not found or empty).`); // 콘솔 로그 추가
    }
     // 스크롤을 항상 맨 아래로 내려서 최신 메시지가 보이게
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 대화 기록 목록 화면을 보여주는 함수
function showHistoryList() {
    // 기록 관련 요소들이 있는지 확인 (DOMContentLoaded 전에 호출될 경우 대비)
    if (!mainChatArea || !historyArea || !historyList) {
         console.error("Error: History list elements not found!");
         // alert("Error: 기록 목록을 표시할 수 없어요! 요소 누락!"); // 필요시 알림
         return;
    }

    // 주 대화 영역 숨기고 기록 목록 영역 보여주기
    mainChatArea.classList.add('hidden');
    historyArea.classList.remove('hidden');
    console.log("Switched to history list view."); // 콘솔 로그 추가


    // 기록 목록 ul 비우기
    historyList.innerHTML = '';

    // 저장된 모든 대화 기록을 기반으로 목록 생성
    if (allChatHistories.length > 0) {
        // 최신 대화가 위에 오도록 역순으로 정렬 (선택 사항) - 원본 배열 복사 후 정렬
        const reversedHistories = [...allChatHistories].reverse();

        reversedHistories.forEach(chat => {
             // 메시지가 하나도 없는 대화는 목록에 표시하지 않음
             if (!chat.messages || chat.messages.length === 0) {
                 return;
             }

            // 목록 아이템 (li) 생성
            const listItem = document.createElement('li');
            listItem.dataset.chatId = chat.id; // data-chat-id 속성에 대화 ID 저장 (삭제/보기 시 사용)

            // 체크박스 생성
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('history-checkbox');

            // 대화 내용 미리보기 (첫 사용자 메시지나 첫 메시지 내용 사용)
            const chatPreview = document.createElement('span');
            const firstUserMessage = chat.messages.find(msg => msg.sender === 'user' && msg.text.trim() !== ''); // 첫 사용자 메시지 찾기
            const firstMessage = chat.messages.length > 0 ? chat.messages[0] : null; // 첫 메시지
            const previewText = firstUserMessage ?
                                firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '') :
                                (firstMessage ? firstMessage.text.substring(0, 50) + (firstMessage.text.length > 50 ? '...' : '') : '새 대화'); // 첫 사용자 메시지 없으면 첫 메시지, 그것도 없으면 '새 대화'

             // 시간 정보도 추가하면 좋음 (chat 객체에 timestamp 속성을 저장했다고 가정)
             // const date = chat.timestamp ? new Date(chat.timestamp).toLocaleString() : '시간 정보 없음';
             // chatPreview.textContent = `${date} - ${previewText}`;

            chatPreview.textContent = previewText; // 일단 첫 메시지 내용만 표시


            // 목록 아이템에 체크박스와 미리보기 추가
            listItem.appendChild(checkbox);
            listItem.appendChild(chatPreview);

             // 목록 아이템 클릭 시 해당 대화 내용을 보여주게 이벤트 리스너 추가 (체크박스 클릭 제외)
             // 이벤트 버블링을 이용해서 li 전체에 리스너 달고, target이 체크박스면 무시
            listItem.addEventListener('click', (event) => {
                 // 만약 클릭된 요소가 체크박스 자신이면 함수 실행 안 함
                 if (event.target.classList.contains('history-checkbox')) {
                     return;
                 }
                 // li 요소에 저장된 data-chat-id 가져와서 해당 대화 렌더링
                 const clickedChatId = listItem.dataset.chatId;
                 if (clickedChatId) {
                    currentChatId = clickedChatId; // 현재 대화 ID 변경
                    renderChatMessages(clickedChatId); // 해당 대화 내용 렌더링
                    showMainChatArea(); // 주 대화 영역으로 돌아가기
                 }
            });


            // 목록에 추가
            historyList.appendChild(listItem);
        });
        console.log(`Rendered ${allChatHistories.length} history items.`); // 콘솔 로그 추가
    } else {
        // 기록이 없을 때 메시지 표시
        const noHistoryItem = document.createElement('li');
        noHistoryItem.textContent = '대화 기록이 없습니다.';
        historyList.appendChild(noHistoryItem);
        console.log("No history items to render."); // 콘솔 로그 추가
    }
     // 목록 화면 보여준 후 스크롤 맨 위로
     historyList.scrollTop = 0;
}

// 주 대화 영역을 보여주는 함수
function showMainChatArea() {
     // 영역 관련 요소들이 있는지 확인 (DOMContentLoaded 전에 호출될 경우 대비)
    if (!mainChatArea || !historyArea || !userInput) {
         console.error("Error: Main chat area elements not found!");
          // alert("Error: 채팅 화면으로 돌아갈 수 없어요! 요소 누락!"); // 필요시 알림
         return;
    }

    historyArea.classList.add('hidden');
    mainChatArea.classList.remove('hidden');
     userInput.focus(); // 입력창에 커서 두기
     console.log("Switched to main chat area view."); // 콘솔 로그 추가
}


// '선택 삭제' 버튼 클릭 시 선택된 대화 기록 삭제 함수 (DOMContentLoaded 안에서 이벤트 리스너 연결됨)
function deleteSelectedHistories() {
     // 기록 목록 관련 요소들이 있는지 확인 (DOMContentLoaded 전에 호출될 경우 대비)
     if (!historyList || !deleteSelectedButton) { // deleteSelectedButton도 확인
          console.error("Error: History list or delete button element not found for deletion!");
          return;
     }
    // 선택된 체크박스들 찾기
    const selectedCheckboxes = historyList.querySelectorAll('.history-checkbox:checked');

    if (selectedCheckboxes.length === 0) {
        // === 삭제할 거 없을 때 츤데레 메시지 ===
        alert('흥, 뭘 삭제하겠다는 거야? 선택이나 하라고!');
        return;
    }

    // 사용자에게 진짜 삭제할 건지 확인 (츤데레 말투 적용)
    const confirmDelete = confirm(`정말로 선택된 대화 기록 ${selectedCheckboxes.length}개를 모두 삭제하시겠습니까? 엣, 진짜 지울 거야?`); // 확인 메시지도 츤데레로?!

    if (confirmDelete) {
        // 선택된 대화 ID 목록 만들기
        const idsToDelete = [];
        selectedCheckboxes.forEach(checkbox => {
            const listItem = checkbox.closest('li'); // 체크박스가 속한 li 요소 찾기
            if (listItem && listItem.dataset.chatId) {
                idsToDelete.push(listItem.dataset.chatId); // data-chat-id 값 가져오기
            }
        });

        // allChatHistories 배열에서 선택된 ID의 대화들 제거
        const initialCount = allChatHistories.length;
        allChatHistories = allChatHistories.filter(chat => !idsToDelete.includes(chat.id));
        const deletedCount = initialCount - allChatHistories.length;

        saveAllHistories(); // 변경사항 저장
        console.log(`Deleted ${deletedCount} chat histories.`); // 콘솔 로그 추가

        // 현재 보고 있던 대화가 삭제되었으면 currentChatId를 null로 설정
        if (currentChatId && idsToDelete.includes(currentChatId)) { // currentChatId가 null이 아닐 때만 검사
             currentChatId = null; // 현재 대화 ID 초기화
             // startNewChat() 함수는 showMainChatArea로 돌아갈 때 호출되거나 기록이 없을 때 호출됨.
             console.log("Current chat history was deleted. currentChatId set to null."); // 콘솔 로그 추가
        }

        // 기록 목록 화면 새로고침
        showHistoryList();

        // 삭제 완료 알림 (츤데레 말투 적용)
         alert(`${deletedCount}개의 대화 기록을 삭제했어. ...딱히 네 기록이 궁금했던 건 아니야.`); // 삭제 완료 메시지도 츤데레로!

    }
}

// 초기 메시지 처리는 loadAllHistories와 startNewChat 함수에서 이미 처리됨.
// DOMContentLoaded에서 별도의 초기 메시지 클래스 추가 코드는 필요 없음.