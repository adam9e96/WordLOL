let currentWords = [];
let currentIndex = 0;
let history = [];
let showingHint = false;
const API_BASE_URL = '/api/v1/wordbooks';

function getDifficultyStars(level) {
    return '<i class="bi bi-star-fill"></i>'.repeat(level);
}

async function loadWords() {
    try {
        const response = await fetch(`${API_BASE_URL}/${wordBookId}/study`);
        if (!response.ok) {
            throw new Error('단어를 불러오는데 실패했습니다');
        }
        currentWords = await response.json();
        if (currentWords.length === 0) {
            throw new Error('학습할 단어가 없습니다');
        }
        shuffleWords();
        showCurrentWord();
        updateProgress();
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.card-body').innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${error.message}
            </div>
        `;
    }
}

function shuffleWords() {
    for (let i = currentWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentWords[i], currentWords[j]] = [currentWords[j], currentWords[i]];
    }
}

function showCurrentWord() {
    if (currentWords.length === 0) return;

    const word = currentWords[currentIndex];
    document.getElementById('vocabulary').textContent = word.vocabulary;
    document.getElementById('difficulty').innerHTML = getDifficultyStars(word.difficulty);
    document.getElementById('meaning').textContent = '';
    document.getElementById('answer').value = '';
    document.getElementById('message').textContent = '';
    document.getElementById('card').classList.remove('flip');
    updateProgress();
}

function updateProgress() {
    document.getElementById('progress').textContent =
        `${currentIndex + 1} / ${currentWords.length}`;
}

async function showHint() {
    if (showingHint) {
        document.getElementById('message').textContent = '';
        showingHint = false;
        return;
    }

    const word = currentWords[currentIndex];
    if (word.hint) {
        document.getElementById('message').textContent = `힌트: ${word.hint}`;
        showingHint = true;
    } else {
        document.getElementById('message').textContent = '힌트가 없습니다.';
        setTimeout(() => {
            document.getElementById('message').textContent = '';
        }, 1500);
    }
}

async function checkAnswer() {
    const userAnswer = document.getElementById('answer').value.trim();
    if (!userAnswer) {
        document.getElementById('message').textContent = '답을 입력해주세요.';
        return;
    }

    const word = currentWords[currentIndex];
    const isCorrect = word.meaning.toLowerCase().split(',').map(m => m.trim())
        .includes(userAnswer.toLowerCase());

    if (isCorrect) {
        document.getElementById('message').textContent = '정답입니다!';
        document.getElementById('meaning').textContent = word.meaning;
        document.getElementById('card').classList.add('flip');
        document.getElementById('perfectRun').textContent =
            (parseInt(document.getElementById('perfectRun').textContent) + 1).toString();

        // 잠시 후 다음 단어로
        setTimeout(() => {
            if (currentIndex === currentWords.length - 1) {
                if (document.getElementById('repeatMode').checked) {
                    shuffleWords();
                    currentIndex = 0;
                    showCurrentWord();
                } else {
                    alert('모든 단어를 학습했습니다! 메인 페이지로 이동합니다.');
                    window.location.href = '/word/dashboard';
                }
            } else {
                nextWord();
            }
        }, 1500);
    } else {
        document.getElementById('message').textContent = '틀렸습니다. 다시 시도해보세요.';
        document.getElementById('perfectRun').textContent = '0';
    }
}

function previousWord() {
    if (currentIndex > 0) {
        currentIndex--;
        showCurrentWord();
    }
}

function nextWord() {
    if (currentIndex < currentWords.length - 1) {
        currentIndex++;
        showCurrentWord();
    } else if (document.getElementById('repeatMode').checked) {
        shuffleWords();
        currentIndex = 0;
        showCurrentWord();
    } else {
        alert('모든 단어를 학습했습니다! 메인 페이지로 이동합니다.');
        window.location.href = '/word/dashboard';
    }
}

// 엔터 키 이벤트
document.getElementById('answer').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

// 초기 로드
document.addEventListener('DOMContentLoaded', () => {
    loadWords().catch(error => {
        console.error('초기 로드 실패:', error);
    });
});