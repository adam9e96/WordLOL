// 현재 단어를 저장할 변수
let currentWord = null;

// 랜덤 단어 호출
async function loadNewWord() {
    try {
        // 비동기 HTTP 요청
        const response = await fetch('http://localhost:8080/api/v1/words/random');
        // console.log('loadNewWord Response:', response); // Response 객체 확인

        currentWord = await response.json(); // 여기서 currentWord에 단어 정보가 저장됨 이후 다른 함수에서도 사용
        // console.log('currentWord:', currentWord);

        // 단어만 표시하고 나머지는 초기화
        document.getElementById('englishWord').textContent = currentWord.vocabulary;
        document.getElementById('card').classList.remove('flip');
        document.getElementById('answer').value = '';
        document.getElementById('message').textContent = '';
        document.getElementById('koreanWord').textContent = '';
    } catch (error) {
        console.error('Error loading word:', error);
        document.getElementById('message').textContent = '단어 로딩 중 오류가 발생했습니다. ' +
            'api/v1/words/random 엔드포인트가 정상 작동하는지 확인해주세요.';
    }
}

// 정답을 확인하는 함수
async function checkAnswer() {
    // answer input 요소에서 사용자가 입력한 값을 가져옴
    const userAnswer = document.getElementById('answer').value;

    // console.log('userAnswer:', userAnswer);
    // 사용자가 입력한 값이 없으면 메시지를 표시하고 함수 종료
    if (!userAnswer) {
        document.getElementById('message').textContent = '답을 입력해주세요.';
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/v1/words/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                answer: userAnswer,
                wordId: currentWord.id,
            })
        });
        if (response.status !== 200) {
            document.getElementById('message').textContent = '오류가 발생했습니다.';
            return;
        }
        // 정답 확인 결과를 받아옴
        const result = await response.json();
        console.log('result:', result);
        document.getElementById('message').textContent = result.message;
        document.getElementById('perfectRun').textContent = result.perfectRun;

        if (result.correct) {
            // 정답을 맞추면 1.5초 후 새로운 단어를 로딩
            document.getElementById('koreanWord').textContent = userAnswer;
            // 카드를 뒤집는 애니메이션
            document.getElementById('card').classList.add('flip');
            setTimeout(() => loadNewWord(), 1000);
        }
    } catch (error) {
        console.error('정답을 찾을 수 없음', error);
        document.getElementById('message').textContent = '오류가 발생했습니다.';
    }
}

let visible_hint = false;

async function showHint() {

    if (visible_hint) {
        document.getElementById('message').textContent = '';
        visible_hint = false;
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/v1/words/${currentWord.id}/hint`);
        const data = await response.json();

        document.getElementById('message').textContent = `힌트: ${data.hint}`;
        visible_hint = true;
    } catch (error) {
        console.error('힌트 제공 오류 :', error);
        document.getElementById('message').textContent = '힌트 로딩 중 오류가 발생했습니다.';
        visible_hint = true;
    }
}

// 정답 확인 버튼에 이벤트 리스너 추가
// 엔터 키를 눌렀을 때도 정답 확인 함수가 실행되도록 함
document.getElementById('answer').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        checkAnswer().then(() => {
            console.log('정답 확인');
        });
    }
});

// 입력창 포커스 상태 추적
let isInputFocused = false;

// 입력창 포커스 이벤트
document.getElementById('answer').addEventListener('focus', () => {
    isInputFocused = true;
});

document.getElementById('answer').addEventListener('blur', () => {
    isInputFocused = false;
});

// 글로벌 키보드 이벤트 수정
document.addEventListener('keypress', function (event) {
    if (!isInputFocused && (event.key === 'h' || event.key === 'H')) {
        showHint().then(() =>
            console.log('힌트 표시')
        );
    }
});


function toggleAnswer() {
    if (!currentWord) return;
    checkAnswer().then(r => console.log('정답 확인'));
}


// 초기 단어 로딩
loadNewWord().then(() => {
    console.log('단어 로딩 함수 실행');
});