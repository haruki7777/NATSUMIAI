console.log('1. script.js 로딩 완료!');

document.addEventListener('DOMContentLoaded', () => {
    console.log('2. DOMContentLoaded 실행!');

    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    const newChatButton = document.getElementById('new-chat-button'); // 새 채팅 버튼
    const viewHistoryButton = document.getElementById('view-history-button'); // 대화 기록 보기 버튼

    // 대화 기록 영역과 메인 채팅 영역 가져오기
    const historyArea = document.getElementById('history-area');
    const mainChatArea = document.getElementById('main-chat-area');

    // 기록 화면에서 보이는 버튼들도 가져오자!
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

    // 로딩 인디케이터 추가/제거 함수
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
             // ⭐️ 응답 코드가 200번대가 아니면 에러 처리 추가
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`서버 에러: ${res.status} - ${errorData.reply || res.statusText}`);
            }
            const data = await res.json();
            return data.reply || '응답이 없네... 멍청아!';
        } catch (err) {
            console.error('서버 통신 에러:', err);
            // ⭐️ 에러 메시지를 좀 더 친절하게 표시
            return `서버 통신 에러: ${err.message || err}`;
        }
    }

    // 새 채팅 시작 함수
    function startNewChat() {
        console.log('새 채팅 시작 버튼 클릭!'); // 클릭 로그 확인!
        chatBox.innerHTML = ''; // 대화창 비우기
        // 대화 기록 영역 숨기고 메인 채팅 영역 보이기
        historyArea.classList.add('hidden');
        mainChatArea.classList.remove('hidden');

        // 대화 기록 관련 버튼들도 숨기기 (만약 보이던 상태였다면)
        // ⭐️ 여기서 hidden 클래스 토글이 아니라 확실하게 add!
        deleteSelectedButton.classList.add('hidden');
        backToChatButton.classList.add('hidden');

        // 초기 AI 메시지 추가
         addMessageToChat('ai', '새 채팅 시작! 뭐 물어볼래?');

        console.log('새 채팅 시작 완료!');
    }

    // 대화 기록 보기 함수
    function viewHistory() {
        console.log('대화 기록 보기 버튼 클릭!'); // 클릭 로그 확인!
        // 메인 채팅 영역 숨기고 대화 기록 영역 보이기
        mainChatArea.classList.add('hidden');
        historyArea.classList.remove('hidden');

        // 대화 기록 관련 버튼들 보이기
        // ⭐️ 여기서 hidden 클래스 토글이 아니라 확실하게 remove!
        deleteSelectedButton.classList.remove('hidden');
        backToChatButton.classList.remove('hidden');


        // ⭐️ 여기에 실제 대화 기록 불러와서 historyList에 채워넣는 코드 추가해야 해!
        // 예시:
        // const history = loadChatHistory(); // 저장된 기록 불러오는 함수 (따로 만들어야 함)
        // historyList.innerHTML = ''; // 목록 비우고
        // history.forEach(item => {
        //     const li = document.createElement('li');
        //     // 체크박스 input 요소 직접 생성
        //     const checkbox = document.createElement('input');
        //     checkbox.type = 'checkbox';
        //     // 체크박스에 고유한 id나 data-id 속성을 부여해서 어떤 기록인지 알 수 있게 하면 좋아!
        //     // checkbox.dataset.historyId = item.id;

        //     const span = document.createElement('span');
        //     span.textContent = item.summary; // 기록 요약 표시 (item.summary 대신 item.timestamp나 item.firstMessage 같은 걸 써도 좋아!)

        //     li.appendChild(checkbox);
        //     li.appendChild(span);

        //     li.addEventListener('click', (event) => {
        //         // li 클릭 시 체크박스가 아닌 부분을 클릭했으면 해당 기록 로드 (따로 만들어야 함)
        //         if (event.target !== checkbox) {
        //              console.log('기록 선택됨:', item);
        //              // loadChat(item.id); // 해당 기록을 불러와 채팅창에 표시하는 함수 호출
        //         }
        //     });
        //     historyList.appendChild(li);
        // });

        // ⭐️ 지금은 임시로 몇 개 기록을 넣어보자!
         historyList.innerHTML = ''; // 목록 비우고
         const dummyHistory = [
             { id: 1, summary: '2023-10-26 나츠미와 첫 대화' },
             { id: 2, summary: '2023-10-27 Gemini API 변경 문제 해결' },
             { id: 3, summary: '2023-10-28 웹사이트 CSS 디자인 수정' },
         ];
         dummyHistory.forEach(item => {
             const li = document.createElement('li');
             const checkbox = document.createElement('input');
             checkbox.type = 'checkbox';
             checkbox.dataset.historyId = item.id; // 데이터 속성으로 ID 저장
             const span = document.createElement('span');
             span.textContent = item.summary;

             li.appendChild(checkbox);
             li.appendChild(span);

             // 목록 아이템 클릭 시 (체크박스 제외)
             li.addEventListener('click', (event) => {
                 // 이벤트 버블링 막기 (체크박스 클릭 시 li 클릭 이벤트 막기)
                 if (event.target.type !== 'checkbox') {
                     console.log('기록 선택됨 (클릭):', item);
                     // 여기에 해당 기록 불러오는 로직 추가
                 }
             });

             // 체크박스 클릭 시 (이벤트 버블링으로 li 클릭 막을 필요 없음)
              checkbox.addEventListener('click', (event) => {
                 console.log('체크박스 클릭됨:', item.id, '상태:', event.target.checked);
                 // 여기서 선택된 기록 ID를 어딘가에 저장해서 '선택 삭제' 버튼이 활용하게 해야 함
             });


             historyList.appendChild(li);
         });


        console.log('대화 기록 보기 완료!');
    }

    // 채팅 화면으로 돌아가기 함수
    function backToChat() {
        console.log('채팅으로 돌아가기 버튼 클릭!'); // 클릭 로그 확인!
        // 대화 기록 영역 숨기고 메인 채팅 영역 보이기
        historyArea.classList.add('hidden');
        mainChatArea.classList.remove('hidden');

        // 대화 기록 관련 버튼들도 숨기기
        // ⭐️ 여기서 hidden 클래스 토글이 아니라 확실하게 add!
        deleteSelectedButton.classList.add('hidden');
        backToChatButton.classList.add('hidden');

         // 돌아왔을 때 채팅창 스크롤 맨 아래로
         chatBox.scrollTop = chatBox.scrollHeight;


        console.log('채팅으로 돌아가기 완료!');
    }

    // ⭐️ 선택 삭제 버튼 기능 (나중에 구현해야 함)
     function handleDeleteSelected() {
         console.log('선택 삭제 버튼 클릭!'); // 클릭 로그 확인!
         const selectedCheckboxes = historyList.querySelectorAll('input[type="checkbox"]:checked');
         const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.historyId);

         if (selectedIds.length === 0) {
             alert('삭제할 기록을 선택해주세요!');
             return;
         }

         console.log('선택된 기록 ID:', selectedIds);
         // ⭐️ 여기에 선택된 ID들을 서버로 보내서 삭제하는 로직 추가!
         // deleteChatHistory(selectedIds);

         // 삭제 후 목록 새로고침 (임시로 다시 그림)
         viewHistory(); // 대화 기록 다시 불러와서 표시 (삭제 로직 구현 후 수정 필요)

         alert(`${selectedIds.length}개의 기록을 삭제했습니다!`); // 임시 알림
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
         console.log('sendButton 이벤트 리스너 연결됨!');
    } else {
         console.error('Error: sendButton 요소를 찾을 수 없습니다!');
    }

    if (userInput) {
        userInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Enter 키 기본 동작(새 줄) 막기
                handleSend();
            }
        });
         console.log('userInput keydown 이벤트 리스너 연결됨!');
    } else {
         console.error('Error: userInput 요소를 찾을 수 없습니다!');
    }


    // ⭐️ 메뉴 버튼 이벤트 리스너 연결! (script.js에서는 토글 기능 삭제했었지!)
    if (newChatButton) {
        newChatButton.addEventListener('click', startNewChat); // 새 채팅 버튼에 연결
         console.log('newChatButton 이벤트 리스너 연결됨!');
    } else {
         console.error('Error: newChatButton 요소를 찾을 수 없습니다!');
    }

    if (viewHistoryButton) {
        viewHistoryButton.addEventListener('click', viewHistory); // 대화 기록 보기 버튼에 연결
         console.log('viewHistoryButton 이벤트 리스너 연결됨!');
    } else {
         console.error('Error: viewHistoryButton 요소를 찾을 수 없습니다!');
    }

    if (backToChatButton) {
        backToChatButton.addEventListener('click', backToChat); // 채팅으로 돌아가기 버튼에 연결
         console.log('backToChatButton 이벤트 리스너 연결됨!');
    } else {
         console.error('Error: backToChatButton 요소를 찾을 수 없습니다!');
    }

    // ⭐️ 선택 삭제 버튼 기능 연결!
     if (deleteSelectedButton) {
         deleteSelectedButton.addEventListener('click', handleDeleteSelected);
         console.log('deleteSelectedButton 이벤트 리스너 연결됨!');
     } else {
         console.error('Error: deleteSelectedButton 요소를 찾을 수 없습니다!');
     }


    // ⭐️ 페이지 로드 시 메인 채팅 화면만 보이도록 초기 설정
    // ⭐️ HTML에서 hidden 클래스로 이미 숨겨져 있을테니, mainChatArea만 보이게 하면 돼!
    mainChatArea.classList.remove('hidden'); // 메인 채팅 영역 보이게
    // historyArea.classList.add('hidden'); // HTML에 hidden 클래스 있는지 확인!

    // ⭐️ 대화 기록 관련 버튼들도 초기에는 숨겨두자
    // ⭐️ HTML에서 hidden 클래스 있는지 확인!
    deleteSelectedButton.classList.add('hidden');
    backToChatButton.classList.add('hidden');


    // 초기 AI 메시지 추가
    // ⭐️ 이미 HTML에 초기 메시지가 있다면 추가하지 않도록 조건문 추가
    if (chatBox.children.length === 0 || (chatBox.children.length === 1 && chatBox.firstElementChild.classList.contains('loading-indicator'))) {
         addMessageToChat('ai', '뭐야, 할 말이라도 있는 거야?');
    }


    console.log('3. 이벤트 리스너 전부 연결 완료!');
     console.log('초기 화면 설정 완료: 메인 채팅 영역 보임, 대화 기록 영역 숨김');
});