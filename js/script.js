// === script.js 시작 ===
console.log('🔧 script.js 로딩 완료! 준비됐어?');

document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 DOMContentLoaded! HTML 다 불러왔어~');

    // 버튼 ID 목록과 각각의 메시지
    const buttons = [
        {
            id: 'send-button',
            name: '보내기 버튼',
            message: '보내기 버튼 눌림!',
            log: '📤 Send button clicked!'
        },
        {
            id: 'menu-toggle-button',
            name: '메뉴 버튼',
            message: '메뉴 버튼 눌림!',
            log: '📋 Menu button clicked!'
        },
        {
            id: 'new-chat-button',
            name: '새 채팅 버튼',
            message: '새 채팅 버튼 눌림!',
            log: '🆕 New chat button clicked!'
        }
    ];

    buttons.forEach(button => {
        const el = document.getElementById(button.id);
        if (el) {
            console.log(`✅ ${button.name} (${button.id}) 찾았어!`);

            el.addEventListener('click', () => {
                console.log(button.log);
                alert(button.message);
            });

            console.log(`🎯 ${button.name}에 이벤트 리스너 연결 완료!`);
        } else {
            console.warn(`⚠️ ${button.name} (${button.id}) 못 찾았어. index.html 확인해봐!`);
        }
    });

    console.log('✨ 모든 버튼 리스너 연결 시도 완료!');
});