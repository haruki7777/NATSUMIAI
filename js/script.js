console.log('1. script.js 로딩 시작!');

document.addEventListener('DOMContentLoaded', () => {
    console.log('2. DOMContentLoaded 실행!');

    // ⭐️ 필요한 DOM 요소들을 모두 가져옵니다.
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    const newChatButton = document.getElementById('new-chat-button'); // 새 채팅 버튼
    const viewHistoryButton = document.getElementById('view-history-button'); // 대화 기록 보기 버튼

    // 대화 기록 영역과 메인 채팅 영역
    const historyArea = document.getElementById('history-area');
    const mainChatArea = document.getElementById('main-chat-area');

    // 기록 화면에서 보이는 버튼들
    const deleteSelectedButton = document.getElementById('delete-selected-button');
    const backToChatButton = document.getElementById('back-to-chat-button');

    // ⭐️ 요소들이 제대로 가져와졌는지 확인하는 콘솔 로그를 추가합니다.
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


    // 메시지 추가 함수
    function addMessageToChat(sender, message) {
        const p = document.createElement('p');
        p.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        p.textContent = message;
        chatBox.appendChild(p);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // 로딩 인디케이터 추가/제거 함수
    function showLoadingIndicator() {
        const loadingP = document.createElement('p');
        loadingP.classList.add('ai-message', 'loading-indicator');
        loadingP.textContent = '... AI가 생각중...';
        chatBox.appendChild(loadingP);
        chatBox.scrollTop = chatBox.scrollHeight;
        return loadingP;
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
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`서버 에러: ${res.status} - ${errorData.reply || res.statusText}`);
            }
            const data = await res.json();
            return data.reply || '응답이 없네... 멍청아!';
        } catch (err) {
            console.error('서버 통신 에러:', err);
            return `서버 통신 에러: ${err.message || err}`;
        }
    }

    // 새 채팅 시작 함수
    function startNewChat() {
        console.log('새 채팅 시작 버튼 클릭 감지!'); // 클릭 로그
        chatBox.innerHTML = '';
        historyArea.classList.add('hidden');
        mainChatArea.classList.remove('hidden');
        deleteSelectedButton.classList.add('hidden');
        backToChatButton.classList.add('hidden');
        addMessageToChat('ai', '새 채팅 시작! 뭐 물어볼래?');
        console.log('새 채팅 시작 기능 실행 완료.');
    }

    // 대화 기록 보기 함수
    function viewHistory() {
        console.log('대화 기록 보기 버튼 클릭 감지!'); // 클릭 로그
        mainChatArea.classList.add('hidden');
        historyArea.classList.remove('hidden');
        deleteSelectedButton.classList.remove('hidden');
        backToChatButton.classList.remove('hidden');

        // ⭐️ 대화 기록 불러와서 표시하는 임시 코드 (실제 구현 필요)
         historyList.innerHTML = '';
         const dummyHistory = [
             { id: 1, summary: '2023-10-26 나츠미와 첫 대화' },
             { id: 2, summary: '2023-10-27 Gemini API 변경 문제 해결' },
             { id: 3, summary: '2023-10-28 웹사이트 CSS 디자인 수정' },
         ];
         dummyHistory.forEach(item => {
             const li = document.createElement('li');
             const checkbox = document.createElement('input');
             checkbox.type = 'checkbox';
             checkbox.dataset.historyId = item.id;
             const span = document.createElement('span');
             span.textContent = item.summary;

             li.appendChild(checkbox);
             li.appendChild(span);

             // 목록 아이템 클릭 시 (체크박스 제외)
             li.addEventListener('click', (event) => {
                 if (event.target.type !== 'checkbox') {
                     console.log('기록 선택됨 (클릭):', item);
                     // 여기에 해당 기록 불러오는 로직 추가
                 }
             });

             // 체크박스 클릭 시
              checkbox.addEventListener('click', (event) => {
                 console.log('체크박스 클릭됨:', item.id, '상태:', event.target.checked);
             });

             historyList.appendChild(li);
         });
        console.log('대화 기록 보기 기능 실행 완료.');
    }

    // 채팅 화면으로 돌아가기 함수
    function backToChat() {
        console.log('채팅으로 돌아가기 버튼 클릭 감지!'); // 클릭 로그
        historyArea.classList.add('hidden');
        mainChatArea.classList.remove('hidden');
        deleteSelectedButton.classList.add('hidden');
        backToChatButton.classList.add('hidden');
        chatBox.scrollTop = chatBox.scrollHeight;
        console.log('채팅으로 돌아가기 기능 실행 완료.');
    }

    // 선택 삭제 버튼 기능 (실제 구현 필요)
     function handleDeleteSelected() {
         console.log('선택 삭제 버튼 클릭 감지!'); // 클릭 로그
         const selectedCheckboxes = historyList.querySelectorAll('input[type="checkbox"]:checked');
         const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.historyId);

         if (selectedIds.length === 0) {
             alert('삭제할 기록을 선택해주세요!');
             console.warn('삭제할 기록이 선택되지 않음.');
             return;
         }

         console.log('선택된 기록 ID:', selectedIds);
         // 여기에 선택된 ID들을 서버로 보내서 삭제하는 로직 추가!

         // 삭제 후 목록 새로고침 (임시)
         viewHistory();

         alert(`${selectedIds.length}개의 기록을 삭제했습니다!`);
         console.log('선택 삭제 기능 실행 완료.');
     }


    // 보내기 버튼 클릭 또는 Enter 누를 때 실행
    async function handleSend() {
        console.log('보내기 버튼/Enter 키 입력 감지!'); // 입력 로그
        const message = userInput.value.trim();
        if (!message) {
            console.warn('입력 메시지가 비어있습니다.');
            return;
        }

        addMessageToChat('user', message);
        userInput.value = '';
        console.log('사용자 메시지 추가됨.');

        const loadingIndicator = showLoadingIndicator(); // 로딩 표시
        console.log('로딩 인디케이터 표시됨.');

        const aiReply = await sendMessageToServer(message);
        console.log('AI 응답 수신:', aiReply);

        removeLoadingIndicator(loadingIndicator); // 로딩 제거
        console.log('로딩 인디케이터 제거됨.');

        addMessageToChat('ai', aiReply);
        console.log('AI 메시지 추가됨.');

        // 메시지 저장 기능 나중에 추가
    }

    // ⭐️ 이벤트 리스너 연결 부분을 더 확실하게!
    // 각 버튼 요소가 null이 아닌지 다시 한번 확인하고 연결합니다.
    if (sendButton) {
        sendButton.addEventListener('click', handleSend);
        console.log('sendButton 이벤트 리스너 연결 완료.');
    } else {
        console.error('Error: ID가 send-button인 요소를 찾을 수 없습니다.');
    }

    if (userInput) {
        userInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { // Shift + Enter는 새 줄로 인식하도록 !e.shiftKey 추가
                e.preventDefault();
                handleSend();
            }
        });
        console.log('userInput keydown 이벤트 리스너 연결 완료.');
    } else {
        console.error('Error: ID가 user-input인 요소를 찾을 수 없습니다.');
    }

    if (newChatButton) {
        newChatButton.addEventListener('click', startNewChat);
        console.log('newChatButton 이벤트 리스너 연결 완료.');
    } else {
        console.error('Error: ID가 new-chat-button인 요소를 찾을 수 없습니다.');
    }

    if (viewHistoryButton) {
        viewHistoryButton.addEventListener('click', viewHistory);
        console.log('viewHistoryButton 이벤트 리스너 연결 완료.');
    } else {
        console.error('Error: ID가 view-history-button인 요소를 찾을 수 없습니다.');
    }

    if (backToChatButton) {
        backToChatButton.addEventListener('click', backToChat);
        console.log('backToChatButton 이벤트 리스너 연결 완료.');
    } else {
        console.error('Error: ID가 back-to-chat-button인 요소를 찾을 수 없습니다.');
    }

     if (deleteSelectedButton) {
         deleteSelectedButton.addEventListener('click', handleDeleteSelected);
         console.log('deleteSelectedButton 이벤트 리스너 연결 완료.');
     } else {
         console.error('Error: ID가 delete-selected-button인 요소를 찾을 수 없습니다.');
     }


    // ⭐️ 페이지 로드 시 초기 화면 설정
    // HTML에서 hidden 클래스로 초기 상태를 제어하는 것이 좋지만, JavaScript에서도 한번 더 확인합니다.
    if (mainChatArea && historyArea) {
        mainChatArea.classList.remove('hidden'); // 메인 채팅 영역 보이게
        historyArea.classList.add('hidden'); // 대화 기록 영역 숨김
        console.log('초기 화면 설정: 메인 채팅 영역 보임, 대화 기록 영역 숨김.');
    } else {
         console.error('Error: mainChatArea 또는 historyArea 요소를 찾을 수 없습니다.');
    }

    // ⭐️ 대화 기록 관련 버튼들도 초기에는 숨겨두자
    if (deleteSelectedButton) deleteSelectedButton.classList.add('hidden');
    if (backToChatButton) backToChatButton.classList.add('hidden');
    console.log('초기 기록 관련 버튼 숨김.');


    // 초기 AI 메시지 추가 (대화창이 비어있을 때만)
    if (chatBox && (chatBox.children.length === 0 || (chatBox.children.length === 1 && chatBox.firstElementChild.classList.contains('loading-indicator')))) {
         addMessageToChat('ai', '뭐야, 할 말이라도 있는 거야?');
         console.log('초기 AI 메시지 추가됨.');
    } else if (!chatBox) {
         console.error('Error: chatBox 요소를 찾을 수 없습니다. 초기 메시지를 추가할 수 없습니다.');
    } else {
        console.log('대화창에 이미 메시지가 있어 초기 AI 메시지를 추가하지 않습니다.');
    }


    console.log('3. DOMContentLoaded 실행 완료!');
});

console.log('4. script.js 로딩 완료 (DOMContentLoaded 외부).');