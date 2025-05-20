console.log('1. script.js 로딩 완료!');

document.addEventListener('DOMContentLoaded', () => {
    console.log('2. DOMContentLoaded 실행!');

    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const menuToggleButton = document.getElementById('menu-toggle-button');
    const newChatButton = document.getElementById('new-chat-button');

    // 메시지 추가 함수
    function addMessageToChat(sender, message) {
        const p = document.createElement('p');
        p.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        p.textContent = message;
        chatBox.appendChild(p);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // 서버에 메시지 보내고 AI 응답 받기
    async function sendMessageToServer(message) {
        try {
            const res = await fetch('https://natsumi-mi-shu.onrender.com/natsumi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });
            const data = await res.json();
            return data.reply || '응답이 없네... 멍청아!';
        } catch (err) {
            console.error('서버 통신 에러:', err);
            return '서버 에러! 나중에 다시 시도해라!';
        }
    }

    // 보내기 버튼 클릭 또는 Enter 누를 때 실행
    async function handleSend() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessageToChat('user', message);
        userInput.value = '';

        // 로딩 표시
        const loadingP = document.createElement('p');
        loadingP.classList.add('ai-message');
        loadingP.textContent = '... AI가 생각중...';
        chatBox.appendChild(loadingP);
        chatBox.scrollTop = chatBox.scrollHeight;

        const aiReply = await sendMessageToServer(message);
        loadingP.remove();

        addMessageToChat('ai', aiReply);
    }

    // 이벤트 리스너 연결
    if (sendButton) {
        sendButton.addEventListener('click', handleSend);
    }
    if (userInput) {
        userInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                handleSend();
            }
        });
    }
    if (menuToggleButton) {
        menuToggleButton.addEventListener('click', () => {
            const menu = document.getElementById('fixed-menu');
            if (menu) menu.classList.toggle('hidden');
        });
    }
    if (newChatButton) {
        newChatButton.addEventListener('click', () => {
            chatBox.innerHTML = '';
            addMessageToChat('ai', '새 채팅 시작! 뭐 물어볼래?');
        });
    }

    console.log('3. 이벤트 리스너 전부 연결 완료!');
});