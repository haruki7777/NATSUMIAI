const menuBtn = document.getElementById('menuBtn');
const menuList = document.getElementById('menuList');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const backToChatBtn = document.getElementById('backToChatBtn');
const toggleMenuBtn = document.getElementById('toggleMenuBtn');
const newChatBtn = document.getElementById('newChatBtn');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const responseDiv = document.getElementById('response');

let chatHistory = [];
let inChatMode = true; // true면 채팅 모드, false면 새대화 모드(초기화된 상태)

// 메뉴 점세개 눌렀을 때 토글
menuBtn.addEventListener('click', () => {
  menuList.classList.toggle('hidden');
});

// 메뉴 내 기록 보여주기
function renderHistory() {
  historyList.innerHTML = '';

  if (chatHistory.length === 0) {
    historyList.innerHTML = '<p style="color:#ccc; font-size:0.9rem; text-align:center;">기록이 없습니다</p>';
    return;
  }

  chatHistory.forEach((item, index) => {
    const div = document.createElement('div');
    div.classList.add('history-item');
    div.title = item; // 전체 내용 툴팁으로 보여줌

    // 대화 내용 텍스트 (길면 말줄임표 처리)
    const span = document.createElement('span');
    span.textContent = item.length > 20 ? item.slice(0, 20) + '...' : item;
    div.appendChild(span);

    // 삭제 버튼
    const delBtn = document.createElement('button');
    delBtn.classList.add('delete-btn');
    delBtn.textContent = '×';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // 클릭 이벤트가 div로 안 넘어가게
      chatHistory.splice(index, 1);
      renderHistory();
    });
    div.appendChild(delBtn);

    // 클릭하면 해당 기록으로 질문창에 복사
    div.addEventListener('click', () => {
      userInput.value = item;
      menuList.classList.add('hidden');
    });

    historyList.appendChild(div);
  });
}

// 기록 전체 삭제
clearHistoryBtn.addEventListener('click', () => {
  if (confirm('기록 전체를 삭제할까?')) {
    chatHistory = [];
    renderHistory();
  }
});

// 채팅으로 돌아가기 버튼 클릭
backToChatBtn.addEventListener('click', () => {
  if (!inChatMode) {
    inChatMode = true;
    responseDiv.textContent = '';
    userInput.disabled = false;
    sendBtn.disabled = false;
    menuList.classList.add('hidden');
  }
});

// 새 대화 버튼 클릭
newChatBtn.addEventListener('click', () => {
  if (confirm('새 대화를 시작할까? 기존 기록은 유지돼~')) {
    inChatMode = false;
    responseDiv.textContent = '새 대화 중... 아무거나 물어봐~';
    userInput.value = '';
    userInput.disabled = false;
    sendBtn.disabled = false;
  }
});

// 메뉴 닫기 버튼 클릭
toggleMenuBtn.addEventListener('click', () => {
  menuList.classList.add('hidden');
});

// 보내기 버튼 클릭
sendBtn.addEventListener('click', () => {
  if (!inChatMode) {
    alert('채팅 모드에서만 대화를 보낼 수 있어! 새 대화 버튼 눌러서 다시 돌아와.');
    return;
  }

  const input = userInput.value.trim();

  if (!input) {
    responseDiv.textContent = '뭐라도 입력해야 말이지...';
    return;
  }

  responseDiv.textContent = '잠깐만 기다려봐, 지금 처리 중이야...';

  setTimeout(() => {
    // 가상의 답변 생성 (원래는 AI API 연동하는 자리)
    const answer = `너가 물어본 건 "${input}" 야. 근데 난 아직 AI가 아니니까 그냥 흉내 내는 중~ㅋㅋ`;

    // 기록에 저장
    chatHistory.push(input);
    renderHistory();

    responseDiv.textContent = answer;
    userInput.value = '';
  }, 1000);
});

// 처음 페이지 로드 시 기록 렌더링
renderHistory();