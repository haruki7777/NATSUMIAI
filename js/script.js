// === JavaScript 파일 로딩 시작을 알리는 alert ===
alert('1. script.js 파일 로딩 시작!');

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

alert('2. 변수 선언 및 API 주소 설정 완료!'); // === 변수 설정 완료 alert ===


// 페이지 로드 시 모든 HTML 요소들이 준비되면 실행될 함수
document.addEventListener('DOMContentLoaded', () => {
    // === DOMContentLoaded 실행 시작을 알리는 alert ===
    alert('3. DOMContentLoaded 실행 시작!');

    // === HTML 요소들을 찾아서 변수에 할당하는 코드 ===
    // 이 코드들이 HTML이 다 로드된 후에 실행되도록 DOMContentLoaded 안으로 옮겼어요!
    userInput = document.getElementById('user-input');
    sendButton = document.getElementById('send-button');
    chatBox = document.getElementById('chat-box');

    // viewHistoryButton, deleteSelectedButton, backToChatButton는 이제 fixed-menu 안에 있음
    viewHistoryButton = document.getElementById('view-history-button'); // 고정 메뉴 안의 버튼
    deleteSelectedButton = document.getElementById('delete-selected-button'); // 고정 메뉴 안의 버튼
    backToChatButton = document.getElementById('back-to-chat-button'); // 고정 메뉴 안의 버튼

    historyArea = document.getElementById('history-area'); // 기록 목록 영역
    mainChatArea = document.getElementById('main-chat-area'); // 주 대화 영역
    historyList = document.getElementById('history-list'); // 기록 목록 ul 태그
    fixedMenu = document.getElementById('fixed-menu'); // 고정 메뉴 영역 자체 찾기!

    // === 추가된 요소 찾기 ===
    menuToggleButton = document.getElementById('menu-toggle-button'); // 점 세 개 버튼 찾기!
    newChatButton = document.getElementById('new-chat-button'); // 새 채팅 버튼 찾기!
    // ======================


    // === 요소들을 찾았는지 확인하는 alert (있다면 뜰 것임) ===
    // 이 alert들은 요소가 제대로 찾아졌는지 확인하는 중요한 단서가 됩니다.
    if (sendButton) { alert("4. Send button found!"); console.log("4. Send button found!"); } else { alert("4. Send button NOT found! Check index.html"); console.error("4. Send button NOT found! Check index.html"); }
    if (userInput) { alert("5. User input found!"); console.log("5. User input found!"); } else { alert("5. User input NOT found! Check index.html"); console.error("5. User input NOT found! Check index.html"); }
    if (chatBox) { alert("6. Chat box found!"); console.log("6. Chat box found!"); } else { alert("6. Chat box NOT found! Check index.html"); console.error("6. Chat box NOT found! Check index.html"); }
    if (viewHistoryButton) { alert("7. View history button found!"); console.log("7. View history button found!"); } else { alert("7. View history button NOT found! Check index.html"); console.error("7. View history button NOT found! Check index.html"); }
    if (deleteSelectedButton) { alert("8. Delete selected button found!"); console.log("8. Delete selected button found!"); } else { alert("8. Delete selected button NOT found! Check index.html"); console.error("8. Delete selected button NOT found! Check index.html"); } // 고정 메뉴 안에서 찾았는지 확인
    if (backToChatButton) { alert("9. Back to chat button found!"); console.log("9. Back to chat button found!"); } else { alert("9. Back to chat button NOT found! Check index.html"); console.error("9. Back to chat button NOT found! Check index.html"); } // 고정 메뉴 안에서 찾았는지 확인

    if (historyArea) { alert("10. History area found!"); console.log("10. History area found!"); } else { alert("10. History area NOT found! Check index.html"); console.error("10. History area NOT found! Check index.html"); }
     if (mainChatArea) { alert("11. Main chat area found!"); console.log("11. Main chat area found!"); } else { alert("11. Main chat area NOT found! Check index.html"); console.error("11. Main chat area NOT found! Check index.html"); }
     if (historyList) { alert("12. History list found!"); console.log("12. History list found!"); } else { alert("12. History list NOT found! Check index.html"); console.error("12. History list NOT found! Check index.html"); }
     if (fixedMenu) { alert("13. Fixed menu area found!"); console.log("13. Fixed menu area found!"); } else { alert("13. Fixed menu area NOT found! Check index.html"); console.error("13. Fixed menu area NOT found! Check index.html"); }

     // === 추가된 요소 찾기 확인 ===
     // 하루키! 이 두 개가 안 찾아지면 점 세 개 메뉴랑 새 채팅 버튼 기능이 안 돼!
     if (menuToggleButton) { alert("14. Menu toggle button found!"); console.log("14. Menu toggle button found!"); } else { alert("14. Menu toggle button NOT found! Check index.html - id='menu-toggle-button'"); console.error("14. Menu toggle button NOT found! Check index.html - id='menu-toggle-button'"); }
     if (newChatButton) { alert("15. New chat button found!"); console.log("15. New chat button found!"); } else { alert("15. New chat button NOT found! Check index.html - id='new-chat-button'"); console.error("15. New chat button NOT found! Check index.html - id='new-chat-button'"); }
     // ==========================


    // === 버튼 클릭 이벤트 리스너들을 연결하는 코드 ===
    // 이제 HTML 요소들이 다 로드된 후에 연결됨!
    // sendButton 요소가 제대로 찾아졌는지 확인 후 이벤트 리스너 연결
    if (sendButton) {
        sendButton.addEventListener('click', async () => {
            await processUserInput(); // 입력 처리 함수 호출
        });
        console.log("Send button event listener attached."); // 콘솔 로그 추가
        alert('16. Send button event listener attached!'); // === 이벤트 리스너 연결 alert ===
    } else {
         console.error("Error: '보내기' 버튼 요소를 찾을 수 없습니다! index.html의 id='send-button' 확인!"); // 버튼 못 찾았을 때 에러 로그
    }


    // userInput 요소가 제대로 찾아졌는지 확인 후 이벤트 리스너 연결
    if (userInput) {
         userInput.addEventListener('keypress', async (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Enter 키 기본 동작 (줄바꿈) 막기
                await processUserInput(); // 입력 처리 함수 호출
            }
        });
         console.log("User input keypress listener attached."); // 콘솔 로그 추가
         alert('17. User input keypress listener attached!'); // === 이벤트 리스너 연결 alert ===
    } else {
         console.error("Error: 입력창 요소를 찾을 수 없습니다! index.html의 id='user-input' 확인!"); // 입력창 못 찾았을 때 에러 로그
    }


    // viewHistoryButton 요소가 제대로 찾아졌는지 확인 후 이벤트 리스너 연결 (고정 메뉴)
    if (viewHistoryButton) {
        viewHistoryButton.addEventListener('click', () => {
            showHistoryList(); // 기록 목록 화면 보여주는 함수 호출
        });
        console.log("18. View history button event listener attached."); // 콘솔 로그 추가
        alert('18. View history button event listener attached!'); // === 이벤트 리스너 연결 alert ===
    } else {
         console.error("Error: '대화 기록 보기' 버튼 요소를 찾을 수 없습니다! index.html의 id='view-history-button' 확인!"); // 버튼 못 찾았을 때 에러 로그
    }

    // deleteSelectedButton 요소가 제대로 찾아졌는지 확인 후 이벤트 리스너 연결 (고정 메뉴)
    if (deleteSelectedButton && historyList) { // 기록 목록 요소도 필요하므로 확인
        deleteSelectedButton.addEventListener('click', () => {
            deleteSelectedHistories(); // 선택 삭제 함수 호출
        });
        console.log("19. Delete selected button event listener attached."); // 콘솔 로그 추가
        alert('19. Delete selected button event listener attached!'); // === 이벤트 리스너 연결 alert ===
    } else {
        console.error("Error: '선택 삭제' 버튼 요소 또는 historyList를 찾을 수 없습니다! index.html 확인!"); // 버튼 못 찾았을 때 에러 로그
    }

    // backToChatButton 요소가 제대로 찾아졌는지 확인 후 이벤트 리스너 연결 (고정 메뉴)
    if (backToChatButton && mainChatArea && historyArea && userInput) { // 관련 요소들 확인
        backToChatButton.addEventListener('click', () => {
            showMainChatArea(); // 주 대화 영역으로 전환 함수 호출
        });
        console.log("20. Back to chat button event listener attached."); // 콘솔 로그 추가
        alert('20. Back to chat button event listener attached!'); // === 이벤트 리스너 연결 alert ===
    } else {
        console.error("Error: '채팅으로 돌아가기' 버튼 요소 또는 관련 영역 요소를 찾을 수 없습니다! index.html 확인!"); // 버튼 못 찾았을 때 에러 로그
    }

    // === 추가된 이벤트 리스너 연결 ===
    // menuToggleButton 요소가 제대로 찾아졌는지 확인 후 이벤트 리스너 연결 (점 세 개 메뉴 토글)
    if (menuToggleButton && fixedMenu) { // 메뉴 토글 버튼과 fixedMenu 모두 확인
        menuToggleButton.addEventListener('click', () => {
            fixedMenu.classList.toggle('hidden'); // 클릭할 때마다 hidden 클래스 추가/제거!
            console.log("21. Menu toggled."); // 콘솔 로그 추가
            alert('21. 메뉴 토글 버튼 클릭!'); // === 메뉴 토글 alert ===
        });
        console.log("22. Menu toggle button event listener attached."); // 콘솔 로그 추가
        alert('22. Menu toggle button event listener attached!'); // === 메뉴 토글 리스너 alert ===
    } else {
         console.error("Error: Menu toggle button or fixed menu element not found for toggle function!"); // 버튼 못 찾았을 때 에러 로그
    }

    // newChatButton 요소가 제대로 찾아졌는지 확인 후 이벤트 리스너 연결 (새 채팅 시작)
    if (newChatButton && mainChatArea && historyArea) { // 새 채팅 버튼과 영역 요소들 모두 확인
        newChatButton.addEventListener('click', () => {
            startNewChat(); // 새 대화 시작 함수 호출!
            showMainChatArea(); // 주 대화 영역으로 전환!
            console.log("23. New chat button clicked. Starting new chat and showing main area."); // 콘솔 로그 추가
            alert('23. 새 채팅 버튼 클릭!'); // === 새 채팅 버튼 alert ===
             // 메뉴가 열려있었다면 닫아주는게 자연스러움
             if (fixedMenu && !fixedMenu.classList.contains('hidden')) {
                  fixedMenu.classList.add('hidden');
                   console.log("Closed menu after starting new chat.");
             }
        });
        console.log("24. New chat button event listener attached."); // 콘솔 로그 추가
        alert('24. New chat button event listener attached!'); // === 새 채팅 버튼 리스너 alert ===
    } else {
        console.error("Error: New chat button or area elements not found for new chat function!"); // 버튼 못 찾았을 때 에러 로그
    }
     // ==============================


     console.log("25. All event listeners attempted to be attached."); // 콘솔 로그 추가
     alert('25. 모든 이벤트 리스너 연결 시도 완료!'); // === 모든 리스너 연결 시도 완료 alert ===
    // =======================================================

    // === DOMContentLoaded에서 초기 설정 시작을 알리는 alert ===
    alert('26. DOMContentLoaded 초기 설정 시작!');


    // 초기 로드 시 모든 대화 기록 불러오기 및 설정
    loadAllHistories(); // 모든 기록 불러오기
    if (allChatHistories.length > 0) {
         // 저장된 기록이 있으면 마지막 대화를 현재 대화로 설정
        // ID가 있는 유효한 마지막 대화 찾기 (혹시 모를 오류 방지)
        const lastValidChat = allChatHistories.findLast(chat => chat && chat.id && Array.isArray(chat.messages));
        if (lastValidChat) {
             currentChatId = lastValidChat.id;
             renderChatMessages(currentChatId); // 마지막 대화 내용을 화면에 표시
             console.log(`27. Loaded last chat history with ID: ${currentChatId}`); // 콘솔 로그 추가
             alert('27. 마지막 대화 기록 로드 및 렌더링!'); // === 기록 로드 alert ===
        } else {
             // 유효한 기록이 없으면 새 대화 시작
             allChatHistories = []; // 혹시 이상한 기록이 로드됐으면 비우기
             startNewChat(); // 이 안에서 renderChatMessages 호출됨
             console.log("27. No valid chat history found. Starting a new chat."); // 콘솔 로그 추가
             // startNewChat 안에서 alert 뜰 것임.
        }

    } else {
         // 저장된 기록이 없으면 새 대화 시작
        startNewChat(); // 이 안에서 renderChatMessages 호출됨
        console.log("27. No chat history found. Starting a new chat."); // 콘솔 로그 추가
        // startNewChat 안에서 alert 뜰 것임.
    }

    // === 초기 버튼 가시성 설정 (메인 채팅 화면이니까 기록 관련 버튼은 숨김) ===
     // 메뉴 관련 요소들이 모두 찾아진 후에 실행되어야 함
     // 새 채팅 버튼은 채팅 화면에 항상 보이도록 설정 (필요시 style.css에서 조절)
     if (viewHistoryButton && deleteSelectedButton && backToChatButton && newChatButton) {
        // fixedMenu 자체는 index.html에서 hidden 클래스로 숨겨두거나, CSS에서 초기 설정
        // 여기서는 메뉴가 나타났을 때 보여줄 버튼들의 가시성을 설정
        // 초기에는 채팅 화면이므로 '대화 기록 보기', '새 채팅 시작' 버튼만 보이고 나머지는 숨김
        viewHistoryButton.classList.remove('hidden'); // 기록 보기 버튼 보임 (채팅 화면용)
        newChatButton.classList.remove('hidden'); // 새 채팅 시작 버튼 보임 (채팅 화면용)

        deleteSelectedButton.classList.add('hidden'); // 선택 삭제 버튼 숨김 (기록 화면용)
        backToChatButton.classList.add('hidden'); // 채팅으로 돌아가기 버튼 숨김 (기록 화면용)

        alert('28. 초기 메뉴 버튼 가시성 설정 완료!'); // === 초기 가시성 설정 alert ===
     } else {
          console.error("Error: Menu buttons not found for initial visibility setting!"); // 요소 못 찾았을 때 에러
          alert('28. 초기 메뉴 버튼 가시성 설정 실패! 요소 누락!'); // === 초기 가시성 설정 실패 alert ===
     }


    // 입력창에 커서 두기 (요소 찾은 후)
    if (userInput) {
         userInput.focus();
         alert('29. 입력창에 커서 두기!'); // === 커서 포커스 alert ===
    }


    // === DOMContentLoaded 실행 완료를 알리는 alert ===
    alert('30. DOMContentLoaded 실행 완료! 이제 버튼 눌러봐!');
});


// 새 대화를 시작하는 함수
function startNewChat() {
    // === startNewChat 함수 실행 시작을 알리는 alert ===
    alert('startNewChat 함수 실행 시작!');

    currentChatId = `chat-${Date.now()}`; // 현재 시간을 기반으로 고유 ID 생성
    // 새 대화 객체를 만들고 빈 메시지 배열로 초기화
    const newChat = { id: currentChatId, messages: [] };
    allChatHistories.push(newChat); // 새로운 대화 객체를 목록에 추가
    saveAllHistories(); // 변경사항 저장 (새로운 빈 대화 추가)

    // 새 대화 화면을 비우고 초기 메시지 표시
     // chatBox가 로드된 후에 사용 가능하므로 DOMContentLoaded 안에서 호출되거나, 아니면 chatBox 사용 전에 null 체크 필요
     if (chatBox) { // chatBox 요소가 있는지 확인
         chatBox.innerHTML = ''; // 이전 대화 내용 비우기
         const initialMessage = document.createElement('p');
         initialMessage.classList.add('ai-message');
         initialMessage.textContent = '뭐야 할말이라도 있는거야?'; // 츤데레 초기 메시지
         chatBox.appendChild(initialMessage);
         chatBox.scrollTop = chatBox.scrollHeight; // 스크롤 맨 아래로
         console.log("New chat started with ID:", currentChatId); // 콘솔 로그 추가
         alert('startNewChat: 새 대화 시작 및 초기 메시지 렌더링!'); // === startNewChat 상세 alert ===
     } else {
         console.error("Error: Chat box element not found when starting new chat!");
         alert('startNewChat Error: 채팅창 요소를 찾을 수 없어요!'); // === startNewChat 에러 alert ===
     }

     alert('startNewChat 함수 실행 완료!'); // === startNewChat 함수 실행 완료 alert ===
}


// 입력 처리 및 API 통신을 담당하는 함수 (DOMContentLoaded 안에서 호출됨)
async function processUserInput() {

    // === 하루키! 이 alert로 버튼 눌림 확인! ===
    // 이 팝업창이 뜨면 버튼 클릭 감지 및 processUserInput 함수 실행은 성공한 거야!
    alert('processUserInput 함수 실행 시작!');
    // ========================================

    // userInput, sendButton 요소가 있는지 다시 한번 확인 (안정성 향상)
    if (!userInput || !sendButton || !chatBox) { // chatBox도 확인
        console.error("Error: Input/Chat elements not available in processUserInput!");
        alert("Error: 입력 요소에 문제가 있어요! (processUserInput)"); // 필요시 알림
        return;
    }

    alert('processUserInput: 입력 요소 확인 완료!'); // === 요소 확인 alert ===


    const question = userInput.value.trim(); // 사용자가 입력한 질문 가져오기 (앞뒤 공백 제거)

    // 질문이 비어있으면 아무것도 안 해
    if (question === '') {
        alert('processUserInput: 질문이 비어있음. 중단!'); // === 질문 비어있음 alert ===
        return;
    }

     alert('processUserInput: 질문 내용 확인 완료!'); // === 질문 내용 확인 alert ===

     // 현재 대화에 사용자 메시지 추가 및 화면 표시
    addMessageToCurrentChatHistory('user', question); // 기록에 추가
    addMessageToChat('user', question); // 화면에 표시

    alert('processUserInput: 사용자 메시지 추가 및 화면 표시 완료!'); // === 사용자 메시지 표시 alert ===


    // 입력창 비우기
    userInput.value = '';
    // 💡 API 응답 올 때까지 입력창과 버튼 비활성화! (이게 '버튼 안눌리는것' 이야기하는 거면 정상이야!)
    userInput.disabled = true;
    sendButton.disabled = true;

    alert('processUserInput: 입력창 비우고 비활성화 완료!'); // === 입력창 처리 alert ===


    // 로딩 인디케이터 추가 (선택 사항: CSS로 예쁘게 꾸밀 수 있어요!)
    const loadingIndicator = document.createElement('p');
    loadingIndicator.textContent = 'AI 비서가 생각 중...'; // 로딩 메시지
    loadingIndicator.classList.add('ai-message', 'loading-indicator'); // AI 메시지 스타일 + 로딩 스타일 (CSS 필요)
    chatBox.appendChild(loadingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight; // 스크롤 맨 아래로


    // AI 비서에게 질문 보내고 답변 받기 (핵심!)
    try {
        // Render 서버 API로 요청 보내기
        console.log(`Sending request to API: ${API_ENDPOINT}`); // 콘솔 로그 추가
        alert('processUserInput: API 요청 보내기 시도!'); // === API 요청 시작 alert ===
        const response = await fetch(API_ENDPOINT, {
            method: 'POST', // 데이터를 보낼 때는 보통 POST 방식!
            headers: {
                'Content-Type': 'application/json' // 보내는 데이터 형식이 JSON이라고 알려주기
            },
            body: JSON.stringify({ message: question }) // 질문을 JSON 형식으로 만들어서 보내기. 하루키 서버가 { message: "질문 내용" } 이런 형식을 기대한다고 가정!
        });
         console.log("API response received."); // 콘솔 로그 추가
         alert('processUserInput: API 응답 받음!'); // === API 응답 받음 alert ===


        // 로딩 인디케이터 제거
        if (loadingIndicator && chatBox.contains(loadingIndicator)) {
           chatBox.removeChild(loadingIndicator);
        }


        // 응답이 성공했는지 확인 (HTTP 상태 코드 200-299 범위)
        if (!response.ok) {
            // 서버에서 에러 메시지가 있다면 가져오기
            const errorText = await response.text();
            // === 서버 오류 메시지 츤데레 말투! ===
            // 에러 메시지 자체는 콘솔에 더 자세히 찍고, 사용자에게는 츤데레 메시지만 보여줌.
            console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            alert(`processUserInput: HTTP 오류! 상태: ${response.status}`); // === HTTP 오류 상태 alert ===
            // 💡 여기서는 서버에서 보낸 에러 응답을 사용자에게 보여주는 게 좋을 수도 있어!
            // 예: 만약 서버에서 {"reply": "사용량 초과 에러 메시지"} 이런 형태로 보냈다면...
            try {
                 const errorJson = JSON.parse(errorText);
                 if (errorJson && errorJson.reply) {
                      throw new Error(errorJson.reply); // 서버에서 보낸 reply 메시지로 에러 발생!
                 } else {
                     throw new Error('엣, 서버가 말을 안 듣네. 답답하구만!'); // 기본 츤데레 에러
                 }
            } catch (e) {
                 // JSON 파싱 에러나 reply 필드 없을 경우
                 throw new Error('엣, 서버가 말을 안 듣네. 답답하구만!'); // 기본 츤데레 에러
            }
        }

        // 서버에서 온 응답 데이터를 JSON 형식으로 받기
        const data = await response.json();
         console.log("API response data:", data); // 콘솔 로그 추가
         alert('processUserInput: API 응답 데이터 받음!'); // === API 데이터 받음 alert ===

        // === 💡 여기!!! data.answer 를 data.reply 로 수정했어! ===
        // 하루키 서버에서 'reply'라는 키로 답변을 줄 거라고 가정! (app.py 코드 확인!)
        const aiResponse = data.reply;
        // ====================================================


        if (aiResponse && aiResponse.trim() !== '') { // 답변 내용이 있고 비어있지 않을 때만 표시
             // AI 비서의 답변을 대화창에 표시하고 기록 저장
             addMessageToCurrentChatHistory('ai', aiResponse); // 기록에 추가
             addMessageToChat('ai', aiResponse); // 화면에 표시
             console.log("AI response added to chat."); // 콘솔 로그 추가
             alert('processUserInput: AI 답변 화면 표시 및 기록!'); // === AI 답변 표시 alert ===
        } else {
            // === 서버 응답 형식 오류 또는 빈 답변 메시지 츤데레 말투! ===
             const errorAiMessage = '뭐야 이 이상한 답장은?! 제대로 된 걸 보내라고! (혹은 빈 응답?)'; // 화면에 표시할 에러 메시지
             addMessageToChat('ai', errorAiMessage); // 화면에 표시
             addMessageToCurrentChatHistory('ai', errorAiMessage); // 기록에 추가
             console.warn("API response data did not contain a valid 'reply' field or it was empty."); // 콘솔 로그 추가 (answer -> reply로 수정!)
             alert('processUserInput: API 응답에 답변(reply) 필드가 없거나 비어있어요!'); // === 답변 필드 오류 alert === (answer -> reply로 수정!)

        }

    } catch (error) {
        // 만약 에러가 나면 콘솔에 찍고 대화창에도 에러 메시지 표시
        console.error('API 통신 중 에러 발생:', error);

        // 로딩 인디케이터 제거
        if (loadingIndicator && chatBox.contains(loadingIndicator)) {
           chatBox.removeChild(loadingIndicator);
        }

        // === 에러 발생 시 최종 출력 메시지 츤데레 말투! ===
        const errorMessage = error.message || '죄송해요, 답변을 가져오는데 문제가 발생했어요. (Console 확인)'; // throw한 에러 메시지 사용
        addMessageToChat('ai', errorMessage); // 화면에 표시
         addMessageToCurrentChatHistory('ai', errorMessage); // 기록에 추가
        console.error("Error message added to chat."); // 콘솔 로그 추가
         alert(`processUserInput: API 통신 중 Catch 에러 발생: ${errorMessage}`); // === Catch 에러 alert ===

    } finally {
        // 모든 처리가 끝나면 입력창과 버튼 다시 활성화
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus(); // 입력창에 커서 두기
        saveAllHistories(); // 모든 변경사항 저장
        console.log("Process input finished. Elements enabled."); // 콘솔 로그 추가
         alert('processUserInput 함수 실행 완료!'); // === 함수 실행 완료 alert ===
    }
}

// 현재 활성 대화 기록에 메시지를 추가하는 함수
function addMessageToCurrentChatHistory(sender, text) {
    // currentChatId가 유효한지 확인
    if (!currentChatId) {
        console.error("Error: currentChatId is not set when trying to add message to history!");
        return;
    }

    // 현재 대화 찾기
    const currentChat = allChatHistories.find(chat => chat.id === currentChatId);

    if (currentChat) {
        // 메시지 객체를 현재 대화의 messages 배열에 추가
        currentChat.messages.push({ sender: sender, text: text });
        console.log(`Message added to history ${currentChatId}: ${text}`); // 콘솔 로그 추가
    } else {
         console.error(`Error: Current chat object not found in allChatHistories for ID: ${currentChatId}`);
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
                 chat && typeof chat.id === 'string' && Array.isArray(chat.messages) && chat.messages.length > 0 // 메시지가 하나라도 있는 유효한 대화만 로드
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
        // allChatHistories 배열에서 메시지가 하나도 없는 대화는 제외하고 저장 (선택 사항)
        const historiesToSave = allChatHistories.filter(chat => chat.messages.length > 0);
        // allChatHistories 배열을 JSON 문자열로 변환하여 localStorage에 저장
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historiesToSave));
        console.log(`Chat histories saved to localStorage. Count: ${historiesToSave.length}`); // 콘솔 로그 추가
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

    // 해당 대화가 비어있거나 찾을 수 없으면 초기 메시지 표시
    if (!chatToRender || !chatToRender.messages || chatToRender.messages.length === 0) { // messages 배열 유효성 및 길이 확인
         const initialMessage = document.createElement('p');
         initialMessage.classList.add('ai-message');
         initialMessage.textContent = '뭐야 할말이라도 있는거야?'; // 츤데레 초기 메시지
         chatBox.appendChild(initialMessage);
         console.log(`Rendered initial message for chat ID: ${chatId} (chat not found or empty).`); // 콘솔 로그 추가
    } else {
        // 해당 대화의 메시지들을 순서대로 화면에 추가
        chatToRender.messages.forEach(msg => {
            // addMessageToChat 함수를 사용하여 메시지 추가 (기록 저장은 addMessageToCurrentChatHistory에서 이미 함)
            addMessageToChat(msg.sender, msg.text);
        });
        console.log(`Rendered ${chatToRender.messages.length} messages for chat ID: ${chatId}`); // 콘솔 로그 추가
    }
     // 스크롤을 항상 맨 아래로 내려서 최신 메시지가 보이게
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 대화 기록 목록 화면을 보여주는 함수
function showHistoryList() {
    // 기록 관련 요소들이 있는지 확인 (DOMContentLoaded 전에 호출될 경우 대비)
    // 하루키! 이 요소들이 index.html에 제대로 있는지, ID가 맞는지 확인해줘!
    if (!mainChatArea || !historyArea || !historyList || !viewHistoryButton || !deleteSelectedButton || !backToChatButton || !newChatButton || !fixedMenu || !menuToggleButton) { // 메뉴 버튼들도 확인
         console.error("Error: History list or menu elements not found!");
         alert("Error: 기록 목록을 표시할 수 없어요! 요소 누락!"); // 필요시 알림
         return;
    }

    // 주 대화 영역 숨기고 기록 목록 영역 보여주기
    mainChatArea.classList.add('hidden');
    historyArea.classList.remove('hidden');
    console.log("Switched to history list view."); // 콘솔 로그 추가

    // === 메뉴 버튼 가시성 전환 (기록 화면일 때) ===
    viewHistoryButton.classList.add('hidden'); // 기록 보기 버튼 숨김
    newChatButton.classList.add('hidden'); // 새 채팅 버튼 숨김 (기록 화면에선 필요 없음)

    deleteSelectedButton.classList.remove('hidden'); // 선택 삭제 버튼 보임
    backToChatButton.classList.remove('hidden'); // 채팅으로 돌아가기 버튼 보임

    // 메뉴가 열려있었다면 닫아주는게 자연스러움
     if (fixedMenu && !fixedMenu.classList.contains('hidden')) { // fixedMenu가 있는지 확인
          fixedMenu.classList.add('hidden');
           console.log("Closed menu when switching to history view.");
     }
    console.log("Menu buttons toggled for history view."); // 콘솔 로그 추가


    // 기록 목록 ul 비우기
    historyList.innerHTML = '';

    // 저장된 모든 대화 기록을 기반으로 목록 생성
    if (allChatHistories.length > 0) {
        // 최신 대화가 위에 오도록 역순으로 정렬 (원본 배열 복사 후 정렬)
        // 주의: 이 정렬은 화면 표시에만 영향을 줌. localStorage 저장 순서는 그대로 유지됨.
        const reversedHistories = [...allChatHistories].reverse();

        reversedHistories.forEach(chat => {
             // 메시지가 하나도 없는 대화는 목록에 표시하지 않음 (loadAllHistories에서 이미 필터링했겠지만, 혹시 몰라서 다시 확인)
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
                                (firstMessage ? firstMessage.text.substring(0, 50) + (firstMessage.text.length > 50 ? '...' : '') : '내용 없음'); // 첫 사용자 메시지 없으면 첫 메시지, 그것도 없으면 '내용 없음'

             // 시간 정보도 추가하면 좋음 (chat 객체에 timestamp 속성을 저장했다고 가정 - 현재 코드에는 없음)
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
        console.log(`Rendered ${reversedHistories.length} history items.`); // 콘솔 로그 추가
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
    // 하루키! 이 요소들이 index.html에 제대로 있는지, ID가 맞는지 확인해줘!
    if (!mainChatArea || !historyArea || !userInput || !viewHistoryButton || !deleteSelectedButton || !backToChatButton || !newChatButton || !fixedMenu || !menuToggleButton) { // 메뉴 버튼들도 확인
         console.error("Error: Main chat area or menu elements not found!");
          alert("Error: 채팅 화면으로 돌아갈 수 없어요! 요소 누락!"); // 필요시 알림
         return;
    }

    historyArea.classList.add('hidden');
    mainChatArea.classList.remove('hidden');
     userInput.focus(); // 입력창에 커서 두기
     console.log("Switched to main chat area view."); // 콘솔 로그 추가

    // === 메뉴 버튼 가시성 전환 (채팅 화면일 때) ===
    viewHistoryButton.classList.remove('hidden'); // 기록 보기 버튼 보임
    newChatButton.classList.remove('hidden'); // 새 채팅 버튼 보임

    deleteSelectedButton.classList.add('hidden'); // 선택 삭제 버튼 숨김
    backToChatButton.classList.add('hidden'); // 채팅으로 돌아가기 버튼 숨김

     // 메뉴가 열려있었다면 닫아주는게 자연스러움
     if (fixedMenu && !fixedMenu.classList.contains('hidden')) { // fixedMenu가 있는지 확인
          fixedMenu.classList.add('hidden');
           console.log("Closed menu when switching to main chat view.");
     }
    console.log("Menu buttons toggled for main chat view."); // 콘솔 로그 추가
}


// '선택 삭제' 버튼 클릭 시 선택된 대화 기록 삭제 함수 (DOMContentLoaded 안에서 이벤트 리스너 연결됨)
function deleteSelectedHistories() {
     // 기록 목록 관련 요소들이 있는지 확인 (DOMContentLoaded 전에 호출될 경우 대비)
     if (!historyList || !deleteSelectedButton) { // deleteSelectedButton도 확인
          console.error("Error: History list or delete button element not found for deletion!");
          alert("Error: 삭제 기능을 사용할 수 없어요! 요소 누락!"); // 필요시 알림
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
        // loadAllHistories나 DOMContentLoaded에서 currentChatId가 null이면 startNewChat 호출 로직 있음.
        if (currentChatId && idsToDelete.includes(currentChatId)) { // currentChatId가 null이 아닐 때만 검사
             console.log("Current chat history was deleted.");
             currentChatId = null; // 현재 대화 ID 초기화
             console.log("currentChatId set to null as current history was deleted."); // 콘솔 로그 추가
        }

        // 삭제 후 목록 화면 새로고침
        showHistoryList(); // 삭제 후 목록 화면 다시 보여줌

        // 삭제 완료 알림 (츤데레 말투 적용)
         alert(`${deletedCount}개의 대화 기록을 삭제했어. ...딱히 네 기록이 궁금했던 건 아니야.`); // 삭제 완료 메시지도 츤데레로!

    }
}

// 초기 메시지 처리는 loadAllHistories와 startNewChat 함수에서 이미 처리됨.
// DOMContentLoaded에서 별도의 초기 메시지 클래스 추가 코드는 필요 없음.

// 로딩 인디케이터 스타일을 위한 CSS 클래스 추가 (style.css에 추가해주세요)
/*
.ai-message.loading-indicator {
    font-style: italic;
    color: #888; // 회색 등 로딩 중 느낌 주는 색상
}
*/

// 숨김 처리를 위한 CSS 클래스 추가 (style.css에 추가해주세요)
/*
.hidden {
    display: none !important; // !important 사용 시 다른 스타일보다 우선 적용됨
}
*/