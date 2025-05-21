console.log('1. script.js 로딩 완료!');

document.addEventListener('DOMContentLoaded', () => {
    console.log('2. DOMContentLoaded 실행!');

    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    // ⭐️ 메뉴 토글 버튼은 이제 필요 없어!
    // const menuToggleButton = document.getElementById('menu-toggle-button');

    const newChatButton = document.getElementById('new-chat-button'); // 새 채팅 버튼 (이건 고정 메뉴에 그대로)
    const viewHistoryButton = document.getElementById('view-history-button'); // ⭐️ 대화 기록 보기 버튼 추가!

    // ⭐️ 대화 기록 영역과 메인 채팅 영역 가져오기
    const historyArea = document.getElementById('history-area');
    const mainChatArea = document.getElementById('main-chat-area');

    // ⭐️ 대화 기록 관련 요소들도 가져오자!
    const historyList = document.getElementById('history-list');
    // ⭐️ 기록 화면에서 보이는 버튼들도 가져오기
    const deleteSelectedButton = document.getElementById('delete-selected-button');
    const backToChatButton = document.getElementById('back-to-chat-button');


    // 메시지 추가 함수
    function addMessageToChat(sender, message) {
        const p = document.createElement('p');
        p.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        p.textContent = message;
        chatBox.appendChild(p);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // ⭐️ 로딩 인디케이터 추가/제거 함수 (깔끔하게 분리!)
    function showLoadingIndicator() {
        const loadingP = document.createElement('p');
        loadingP.classList.add('ai-message', 'loading-indicator'); // CSS에서 로딩 스타일 적용!
        loadingP.textContent = '... AI가 생각중...';
        chatBox.appendChild(loadingP);
        chatBox.scrollTop = chatBox.scrollHeight;
        return loadingP; // 나중에 제거하기 위해 요소 반환
    }

    function removeLoadingIndicator(indicatorElement) {
        if (indicatorElement) {
            indicatorElement.remove();
        }
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

    // ⭐️ 새 채팅 시작 함수
    function startNewChat() {
        chatBox.innerHTML = ''; // 대화창 비우기
        // ⭐️ 대화 기록 영역 숨기고 메인 채팅 영역 보이기
        historyArea.classList.add('hidden');
        mainChatArea.classList.remove('hidden');

        // ⭐️ 대화 기록 관련 버튼들도 숨기기 (만약 보이던 상태였다면)
        deleteSelectedButton.classList.add('hidden');
        backToChatButton.classList.add('hidden');

        // 처음 메시지 다시 추가
        addMessageToChat('ai', '새 채팅 시작! 뭐 물어볼래?');
        console.log('새 채팅 시작!');
    }

    // ⭐️ 대화 기록 보기 함수
    function viewHistory() {
        // ⭐️ 메인 채팅 영역 숨기고 대화 기록 영역 보이기
        mainChatArea.classList.add('hidden');
        historyArea.classList.remove('hidden');

        // ⭐️ 대화 기록 관련 버튼들 보이기
        deleteSelectedButton.classList.remove('hidden');
        backToChatButton.classList.remove('hidden');

        // ⭐️ 여기에 실제 대화 기록 불러와서 historyList에 채워넣는 코드 추가해야 해!
        // 예시:
        // const history = loadChatHistory(); // 저장된 기록 불러오는 함수 (따로 만들어야 함)
        // historyList.innerHTML = ''; // 목록 비우고
        // history.forEach(item => {
        //     const li = document.createElement('li');
        //     li.innerHTML = `<input type="checkbox"> <span>${item.summary}</span>`; // 기록 요약 표시
        //     li.addEventListener('click', () => {
        //         // 기록 선택 시 해당 대화 로드하는 기능 추가 (따로 만들어야 함)
        //         console.log('기록 선택됨:', item);
        //     });
        //     historyList.appendChild(li);
        // });

        console.log('대화 기록 보기!');
    }

    // ⭐️ 채팅 화면으로 돌아가기 함수
    function backToChat() {
        // ⭐️ 대화 기록 영역 숨기고 메인 채팅 영역 보이기
        historyArea.classList.add('hidden');
        mainChatArea.classList.remove('hidden');

        // ⭐️ 대화 기록 관련 버튼들도 숨기기
        deleteSelectedButton.classList.add('hidden');
        backToChatButton.classList.add('hidden');

        console.log('채팅으로 돌아가기!');
    }


    // 보내기 버튼 클릭 또는 Enter 누를 때 실행
    async function handleSend() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessageToChat('user', message);
        userInput.value = '';

        const loadingIndicator = showLoadingIndicator(); // 로딩 표시

        const aiReply = await sendMessageToServer(message);

        removeLoadingIndicator(loadingIndicator); // 로딩 제거

        addMessageToChat('ai', aiReply);

        // ⭐️ 메시지를 보낼 때마다 대화 기록에 저장하는 기능도 나중에 추가해야 해!
        // saveMessageToHistory('user', message);
        // saveMessageToHistory('ai', aiReply);
    }

    // 이벤트 리스너 연결
    if (sendButton) {
        sendButton.addEventListener('click', handleSend);
    }
    if (userInput) {
        userInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Enter 키 기본 동작(새 줄) 막기
                handleSend();
            }
        });
    }

    // ⭐️ 메뉴 버튼 이벤트 리스너 연결
    // menuToggleButton은 이제 필요 없어!
    if (newChatButton) {
        newChatButton.addEventListener('click', startNewChat); // 새 채팅 버튼에 연결
    }
    if (viewHistoryButton) {
        viewHistoryButton.addEventListener('click', viewHistory); // 대화 기록 보기 버튼에 연결
    }
    if (backToChatButton) {
        backToChatButton.addEventListener('click', backToChat); // 채팅으로 돌아가기 버튼에 연결
    }
    // ⭐️ 선택 삭제 버튼 기능도 나중에 추가해야 해!
    // if (deleteSelectedButton) {
    //     deleteSelectedButton.addEventListener('click', handleDeleteSelected);
    // }


    // ⭐️ 페이지 로드 시 메인 채팅 화면만 보이도록 초기 설정
    mainChatArea.classList.remove('hidden'); // 메인 채팅 영역 보이게
    historyArea.classList.add('hidden'); // 대화 기록 영역 숨김

    // ⭐️ 대화 기록 관련 버튼들도 초기에는 숨겨두자
    deleteSelectedButton.classList.add('hidden');
    backToChatButton.classList.add('hidden');

    // 초기 AI 메시지 추가
    if (chatBox.children.length === 0) { // 대화창이 비어있을 때만 초기 메시지 추가
         addMessageToChat('ai', '뭐야, 할 말이라도 있는 거야?');
    }


    console.log('3. 이벤트 리스너 전부 연결 완료!');
});
