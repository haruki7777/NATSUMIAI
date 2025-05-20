// HTML 요소들을 JavaScript에서 사용할 수 있게 가져오기!
const userInput = document.getElementById('user-input'); // 입력창
const sendButton = document.getElementById('send-button'); // 보내기 버튼
const chatBox = document.getElementById('chat-box'); // 대화 내용 보여줄 공간

// 하루키 Render 서버의 API 주소! >>> 이 부분을 꼭 하루키 서버 주소로 바꿔줘! <<<
const API_ENDPOINT = 'https://natsumi-mi-shu.onrender.com/natsumi'; // 예: 'https://하루키-ai-비서.render.com/chat'

// '보내기' 버튼을 클릭했을 때 작동하는 함수
sendButton.addEventListener('click', async () => {
    const question = userInput.value; // 사용자가 입력한 질문 가져오기

    // 질문이 비어있으면 아무것도 안 해
    if (question.trim() === '') {
        return;
    }

    // 사용자의 질문을 대화창에 표시
    appendMessage('나', question);

    // 입력창 비우기
    userInput.value = '';

    // AI 비서에게 질문 보내고 답변 받기 (핵심!)
    try {
        // Render 서버 API로 요청 보내기
        const response = await fetch(API_ENDPOINT, {
            method: 'POST', // 데이터를 보낼 때는 보통 POST 방식!
            headers: {
                'Content-Type': 'application/json' // 보내는 데이터 형식이 JSON이라고 알려주기
            },
            body: JSON.stringify({ message: question }) // 질문을 JSON 형식으로 만들어서 보내기
        });

        // 응답이 성공했는지 확인
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 서버에서 온 응답 데이터를 JSON 형식으로 받기
        const data = await response.json();
        const aiResponse = data.answer; // 하루키 서버에서 'answer'라는 키로 답변을 줄 거라고 가정!
                                         // 하루키 서버 응답 형식이 다르면 이 부분을 바꿔줘야 해!

        // AI 비서의 답변을 대화창에 표시
        appendMessage('AI 비서', aiResponse);

    } catch (error) {
        // 만약 에러가 나면 콘솔에 찍고 대화창에도 에러 메시지 표시
        console.error('API 통신 중 에러 발생:', error);
        appendMessage('AI 비서', '죄송해요, 답변을 가져오는데 문제가 발생했어요.');
    }
});

// 대화창에 메시지를 추가하는 함수
function appendMessage(sender, message) {
    const messageElement = document.createElement('p'); // <p> 태그 만들기
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`; // '누구:' 메시지 형식으로 내용 넣기
    chatBox.appendChild(messageElement); // 대화창에 추가하기

    // 스크롤을 항상 맨 아래로 내려서 최신 메시지가 보이게
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 사용자가 Enter 키를 눌렀을 때도 '보내기' 버튼 클릭처럼 작동하게
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Enter 키 기본 동작 (줄바꿈) 막기
        sendButton.click(); // 버튼 클릭 함수 호출
    }
});
