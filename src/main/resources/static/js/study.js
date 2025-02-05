// 현재 단어를 저장할 변수
let currentWord = null;
const API_BASE_URL = 'http://localhost:8080/api/v1/words';
const ERROR_MESSAGES = {
    NO_ANSWER: '답을 입력해주세요.',
    API_ERROR: '서버 통신 중 오류가 발생했습니다.',
    // ... 기타 메시지들
};

// 랜덤 단어 호출
async function loadNewWord() {
    // 로딩 시작 시 UI 표시
    document.getElementById('vocabulary').textContent = "로딩 중...";
    try {
        // 비동기 HTTP 요청
        const response = await fetch(`${API_BASE_URL}/random`);

        if (!response.ok) {
            document.getElementById('message').textContent = `HTTP 에러! status : ${response.status}`;
            return;
        }
        currentWord = await response.json(); // 여기서 currentWord에 단어 정보가 저장됨 이후 다른 함수에서도 사용
        console.log('currentWord:', currentWord);

        // 단어만 표시하고 나머지는 초기화
        document.getElementById('vocabulary').textContent = currentWord.vocabulary;
        document.getElementById('card').classList.remove('flip');
        document.getElementById('answer').value = '';
        document.getElementById('message').textContent = '';
        document.getElementById('meaning').textContent = '';
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

    // 사용자가 입력한 값이 없으면 메시지를 표시하고 함수 종료
    if (!userAnswer) {
        document.getElementById('message').textContent = `${ERROR_MESSAGES.NO_ANSWER}`;
        return;
    }

    // 정답 확인 API 요청
    try {
        const response = await fetch(`${API_BASE_URL}/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                answer: userAnswer,
                wordId: currentWord.id,
            })
        });
        if (!response.ok) { // status 가 200-299 범위가 아닐 때
            document.getElementById('message').textContent = response.status + '정답 확인 중 오류가 발생했습니다 ' +
                'api/v1/words/check 엔드포인트가 정상 작동하는지 확인해주세요.';
            return;
        }
        // 정답 확인 결과를 받아옴
        const result = await response.json();
        console.log('result:', result);

        document.getElementById('message').textContent = result.message;
        document.getElementById('perfectRun').textContent = result.perfectRun;

        if (result.correct) {
            // 정답을 맞추면 1.5초 후 새로운 단어를 로딩
            document.getElementById('meaning').textContent = userAnswer;
            // 카드를 뒤집는 애니메이션
            document.getElementById('card').classList.add('flip');
            setTimeout(() => loadNewWord(), 1500);
        }

    } catch (error) {
        console.error('정답을 찾을 수 없음', error);
        document.getElementById('message').textContent = '정답 확인 중 오류가 발생했습니다.'
            + 'api/v1/words/check 엔드포인트가 정상 작동하는지 확인해주세요.';
    }
}


let visible_hint = false;

async function showHint() {

    // hint 가 표시되고 있으면 끄기
    if (visible_hint) {
        document.getElementById('message').textContent = '';
        visible_hint = false;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${currentWord.id}/hint`);

        if (!response.ok) {
            document.getElementById('message').textContent = `HTTP 에러! status : ${response.status}`;
            return;
        }
        console.log('result:', response);
        const data = await response.json();

        document.getElementById('message').textContent = `힌트: ${data.hint}`;
        visible_hint = true;
    } catch (error) {
        console.error('힌트 제공 오류 :', error);
        document.getElementById('message').textContent = '힌트 로딩 중 오류가 발생했습니다.' +
            'api/v1/words/{id}/hint 엔드포인트가 정상작동 하는지 확인해주세요.';
        visible_hint = true;
    }
}

// 정답 확인 버튼에 이벤트 리스너 추가
// 엔터 키를 눌렀을 때도 정답 확인 함수가 실행되도록 함
document.getElementById('answer').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        // 정답 확인 함수 실행
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
// 입력창이 눌려있지 않은 상태에서  h or H 버튼 클릭시 힌트보기함수 실행
document.addEventListener('keypress', function (event) {
    if (!isInputFocused && (event.key === 'h' || event.key === 'H')) {
        showHint().then(() =>
            console.log('힌트 표시')
        );
    }
});

// 정답확인 버튼을 눌렀을 때 호출되는 함수
// 현재 표시된 단어가 없으면 종료
function submitAnswer() {
    if (!currentWord) return;
    checkAnswer().then(() => console.log('정답 확인'));
}


// 초기 단어 로딩
loadNewWord().then(() => {
    console.log('단어 로딩 함수 실행');
});