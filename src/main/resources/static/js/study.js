let currentWord = null;
const API_BASE_URL = '/api/v1/words';

function getDifficultyStars(level) {
    return '<i class="bi bi-star-fill"></i>'.repeat(level);
}


async function loadNewWord() {
    document.getElementById('vocabulary').textContent = "로딩 중...";
    try {
        const response = await fetch(`${API_BASE_URL}/random`);
        if (!response.ok) throw new Error('Failed to load word');

        currentWord = await response.json();

        // 단어 표시
        document.getElementById('vocabulary').textContent = currentWord.vocabulary;
        // 난이도 표시 - innerHTML 사용
        document.getElementById('difficulty').innerHTML = getDifficultyStars(currentWord.difficulty);

        // 초기화
        document.getElementById('card').classList.remove('flip');
        document.getElementById('answer').value = '';
        document.getElementById('message').textContent = '';
        document.getElementById('meaning').textContent = '';
    } catch (error) {
        document.getElementById('message').textContent = '단어를 불러오는데 실패했습니다.';
    }
}


async function checkAnswer() {
    const userAnswer = document.getElementById('answer').value;

    if (!userAnswer.trim()) {
        document.getElementById('message').textContent = '답을 입력해주세요.';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/check`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                answer: userAnswer,
                wordId: currentWord.id
            })
        });

        const result = await response.json();
        document.getElementById('message').textContent = result.message;
        document.getElementById('perfectRun').textContent = result.perfectRun;

        if (result.correct) {
            document.getElementById('meaning').textContent = userAnswer;
            document.getElementById('card').classList.add('flip');
            setTimeout(loadNewWord, 1500);
        }
    } catch (error) {
        document.getElementById('message').textContent = '정답 확인 중 오류가 발생했습니다.';
    }
}

let showingHint = false;

async function showHint() {
    if (!currentWord) return;

    if (showingHint) {
        document.getElementById('message').textContent = '';
        showingHint = false;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${currentWord.id}/hint`);
        const data = await response.json();
        document.getElementById('message').textContent = `힌트: ${data.hint}`;
        showingHint = true;
    } catch (error) {
        document.getElementById('message').textContent = '힌트를 불러오는데 실패했습니다.';
    }
}

function submitAnswer() {
    if (!currentWord) return;
    checkAnswer();
}

// 엔터 키 이벤트
document.getElementById('answer').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        submitAnswer();
    }
});

// 초기 로드
loadNewWord();