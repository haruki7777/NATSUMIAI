// === JavaScript 파일 로딩 시작 ===
console.log('1. script.js 파일 로딩 시작!');

// HTML 요소들을 저장할 변수들을 먼저 선언 (DOMContentLoaded 안에서 할당할 것임)
let sendButton = null;
let menuToggleButton = null; // 점 세 개 버튼 변수 추가!
let newChatButton = null; // 새 채팅 버튼 변수 추가!


// 페이지 로드 시 모든 HTML 요소들이 준비되면 실행될 함수
document.addEventListener('DOMContentLoaded', () => {
    console.log('2. DOMContentLoaded 실행 시작!');

    // === HTML 요소들을 찾아서 변수에 할당하는 코드 ===
    // 보내기 버튼 찾기
    sendButton = document.getElementById('send-button');
    // 점 세 개 버튼 찾기 (id="menu-toggle-button")
    menuToggleButton = document.getElementById('menu-toggle-button');
    // 새 채팅 버튼 찾기 (id="new-chat-button")
    newChatButton = document.getElementById('new-chat-button');


    // === 요소들을 찾았는지 확인하는 로그 ===
    if (sendButton) { console.log("3. Send button found!"); } else { console.error("3. Send button NOT found! Check index.html"); }
    if (menuToggleButton) { console.log("4. Menu toggle button found!"); } else { console.error("4. Menu toggle button NOT found! Check index.html - id='menu-toggle-button'"); }
    if (newChatButton) { console.log("5. New chat button found!"); } else { console.error("5. New chat button NOT found! Check index.html - id='new-chat-button'"); }


    // === 버튼 클릭 이벤트 리스너들을 연결하는 코드 ===
    // 보내기 버튼 이벤트 리스너 연결
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            console.log("6. Send button clicked!"); // 클릭되면 이 로그가 찍혀야 해!
            alert('보내기 버튼 눌림!'); // 클릭되면 이 알림창이 떠야 해!
        });
        console.log("7. Send button event listener attached.");
    }

    // 점 세 개 메뉴 토글 버튼 이벤트 리스너 연결
    if (menuToggleButton) {
        menuToggleButton.addEventListener('click', () => {
            console.log("8. Menu toggle button clicked!"); // 클릭되면 이 로그가 찍혀야 해!
             alert('메뉴 버튼 눌림!'); // 클릭되면 이 알림창이 떠야 해!
        });
        console.log("9. Menu toggle button event listener attached.");
    }

    // 새 채팅 버튼 이벤트 리스너 연결
     if (newChatButton) {
        newChatButton.addEventListener('click', () => {
            console.log("10. New chat button clicked!"); // 클릭되면 이 로그가 찍혀야 해!
             alert('새 채팅 버튼 눌림!'); // 클릭되면 이 알림창이 떠야 해!
        });
        console.log("11. New chat button event listener attached.");
    }

     console.log("12. All event listeners attempted to be attached.");
     console.log('13. DOMContentLoaded 실행 완료!');
});

// 이 아래에 다른 모든 함수들 (processUserInput, startNewChat, addMessageToChat 등) 은 전부 주석 처리하거나 삭제!
// 핵심은 DOMContentLoaded 안의 코드만 실행되도록 만드는 거야.