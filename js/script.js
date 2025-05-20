// HTML 요소들을 JavaScript에서 사용할 수 있게 가져오기!
const userInput = document.getElementById('user-input'); // 입력창
const sendButton = document.getElementById('send-button'); // 보내기 버튼
const chatBox = document.getElementById('chat-box'); // 대화 내용 보여줄 공간
const clearHistoryButton = document.getElementById('clear-history-button'); // 기록 삭제 버튼

// 하루키 Render 서버의 API 주소! >>> 이 부분을 꼭 하루키 서버 주소로 바꿔주세요! <<<
const API_ENDPOINT = 'https://natsumi-mi-shu.onrender.com/natsumi'; // <<-- 여기에 하루키 서버 주소 넣기!

// 대화 기록을 localStorage에 저장할 때 사용할 키 이름
const HISTORY_STORAGE_KEY = 'haruki-ai-chat-history';

// 페이지 로드 시 저장된 대화 기록 불러오기
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
    userInput.focus(); // 페이지 로드 시 입력창에 커서 두기
});

// '보내기' 버튼을 클릭했을 때 작동하는 함수
sendButton.addEventListener('click', async () => {
    await processUserInput(); // 입력 처리 함수 호출
});

// 사용자가 Enter 키를 눌렀을 때도 '보내기' 버튼 클릭처럼 작동하게
userInput.addEventListener('keypress', async (event) => {
    // event.key === 'Enter' 대신 event.keyCode === 13 또는 event.which === 13 사용도 가능
    if (event.key === 'Enter') {
        event.preventDefault(); // Enter 키 기본 동작 (줄바꿈) 막기
        await processUserInput(); // 입력 처리 함수 호출
    }
});

// 입력 처리 및 API 통신을 담당하는 함수
async function processUserInput() {
    const question = userInput.value.trim(); // 사용자가 입력한 질문 가져오기 (앞뒤 공백 제거)

    // 질문이 비어있으면 아무것도 안 해
    if (question === '') {
        return;
    }

    // 사용자의 질문을 대화창에 표시하고 기록 저장
    addMessageToChat('user', question);
    saveChatHistory(); // 메시지 추가 후 기록 저장

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
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        // 서버에서 온 응답 데이터를 JSON 형식으로 받기
        const data = await response.json();
        // 하루키 서버에서 'answer'라는 키로 답변을 줄 거라고 가정!
        // 하루키 서버 응답 형식이 다르면 아래 'data.answer' 부분을 바꿔줘야 해요!
        const aiResponse = data.answer;

        if (aiResponse) { // 답변 내용이 있을 때만 표시
             // AI 비서의 답변을 대화창에 표시하고 기록 저장
            addMessageToChat('ai', aiResponse);
            saveChatHistory(); // 메시지 추가 후 기록 저장
        } else {
            // 서버 응답에 answer 키가 없거나 비어있을 때
             addMessageToChat('ai', '죄송해요, 답변 형식에 문제가 있어요.');
             saveChatHistory(); // 에러 메시지도 기록에 저장
        }

    } catch (error) {
        // 만약 에러가 나면 콘솔에 찍고 대화창에도 에러 메시지 표시
        console.error('API 통신 중 에러 발생:', error);

        // 로딩 인디케이터 제거 (선택 사항)
        // if (loadingIndicator && chatBox.contains(loadingIndicator)) {
        //    chatBox.removeChild(loadingIndicator);
        // }

        addMessageToChat('ai', '죄송해요, 답변을 가져오는데 문제가 발생했어요.');
        saveChatHistory(); // 에러 메시지도 기록에 저장
    } finally {
        // 모든 처리가 끝나면 입력창과 버튼 다시 활성화
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus(); // 입력창에 커서 두기
    }
}


// 대화 기록을 localStorage에서 불러와서 화면에 표시하는 함수
function loadChatHistory() {
    const history = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (history) {
        try {
            const messages = JSON.parse(history);
            // 기존 초기 메시지는 제거 (선택 사항: HTML에 처음부터 넣어둔 메시지)
            const initialMessage = chatBox.querySelector('.ai-message');
             if (initialMessage && initialMessage.textContent.includes('안녕하세요!')) { // 초기 메시지 내용으로 구분
                initialMessage.remove();
            }

             // 저장된 메시지들을 화면에 추가
            messages.forEach(msg => {
                addMessageToChat(msg.sender, msg.text);
            });
        } catch (e) {
            console.error("Failed to parse chat history from localStorage:", e);
            // 파싱 실패 시 기록 삭제 (잘못된 형식일 경우)
            localStorage.removeItem(HISTORY_STORAGE_KEY);
        }

    }
     // 스크롤을 항상 맨 아래로 내려서 최신 메시지가 보이게
     chatBox.scrollTop = chatBox.scrollHeight;
}

// 현재 대화창의 메시지들을 가져와서 localStorage에 저장하는 함수
function saveChatHistory() {
    const messages = [];
    // 대화창의 모든 <p> 태그(메시지) 가져오기
    chatBox.querySelectorAll('p').forEach(p => {
        // 로딩 인디케이터는 저장하지 않음 (선택 사항)
        // if (p.classList.contains('loading-indicator')) {
        //     return;
        // }

        let sender = 'ai'; // 기본적으로 AI 메시지로 가정
        if (p.classList.contains('user-message')) {
            sender = 'user'; // 사용자 메시지면 sender를 'user'로
        }
        // 메시지 내용을 가져오기 (텍스트만)
        const text = p.textContent; // innerText도 가능

        messages.push({ sender: sender, text: text });
    });
    // JSON 문자열로 변환하여 localStorage에 저장
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(messages));
}


// 대화창에 메시지를 추가하고 스크롤을 내리는 함수
// sender: 'user' or 'ai', message: 내용
function addMessageToChat(sender, message) {
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
}


// '대화 기록 삭제' 버튼 클릭 시 작동하는 함수
clearHistoryButton.addEventListener('click', () => {
    // 사용자에게 진짜 삭제할 건지 확인
    const confirmDelete = confirm('정말로 대화 기록을 모두 삭제하시겠습니까?');

    if (confirmDelete) {
        // localStorage에서 기록 삭제
        localStorage.removeItem(HISTORY_STORAGE_KEY);

        // 대화창 내용 모두 비우기
        chatBox.innerHTML = '';

        // 삭제 후 초기 메시지 다시 표시 (선택 사항)
        const initialMessage = document.createElement('p');
        initialMessage.classList.add('ai-message');
        initialMessage.textContent = '안녕하세요! 새로운 대화를 시작해볼까요?';
        chatBox.appendChild(initialMessage);

        // 삭제 완료 알림 (선택 사항)
        // alert('대화 기록이 삭제되었습니다.');

        // 스크롤 맨 위로
        chatBox.scrollTop = 0;
         userInput.focus(); // 입력창에 커서 두기
    }
});

// 초기 메시지에 클래스 추가 (HTML에서 직접 클래스를 붙여도 돼요!)
// 페이지 로드 후 초기 메시지가 이미 있다면 AI 메시지 클래스 추가
document.addEventListener('DOMContentLoaded', () => {
     const initialMessageElement = chatBox.querySelector('p');
    // 첫 번째 p 태그가 이미 있고, user-message 클래스가 없으면 AI 메시지로 간주
    if (initialMessageElement && !initialMessageElement.classList.contains('user-message') && !initialMessageElement.classList.contains('ai-message')) {
        initialMessageElement.classList.add('ai-message');
    }
});