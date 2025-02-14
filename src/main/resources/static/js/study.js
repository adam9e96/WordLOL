let currentWord = null;
const API_BASE_URL = '/api/v1/words';
// TTS 설정
let speaking = false;
const synth = window.speechSynthesis;
let voices = [];

// 음성 목록 로드
function loadVoices() {
    voices = synth.getVoices();
}

// voices changed 이벤트 리스너 추가
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

// 단어 발음 재생 함수
function speakWord() {
    if (speaking || !currentWord) return;

    const word = currentWord.vocabulary;
    const speakButton = document.querySelector('.btn-speak');

    // 음성 생성
    const utterance = new SpeechSynthesisUtterance(word);

    // 영어 음성 찾기 (가능한 경우 미국/영국 영어 선호)
    const englishVoice = voices.find(voice =>
        voice.lang.includes('en') &&
        (voice.lang.includes('US') || voice.lang.includes('GB'))
    ) || voices.find(voice => voice.lang.includes('en'));

    if (englishVoice) {
        utterance.voice = englishVoice;
    }

    // 음성 설정
    utterance.rate = 0.9;  // 약간 천천히
    utterance.pitch = 1;

    // 이벤트 핸들러
    // 발음 시작
    utterance.onstart = () => {
        speaking = true;
        speakButton.classList.remove('hide');
    };

// 발음 종료
    utterance.onend = () => {
        speaking = false;
        speakButton.classList.add('hide');
    };
    // 발음 오류
    utterance.onerror = (event) => {
        console.error('TTS Error:', event);
        speaking = false;
        speakButton.classList.add('hide');  // speaking을 hide로 수정
        document.getElementById('message').textContent = 'TTS 재생 중 오류가 발생했습니다.';
        setTimeout(() => {
            document.getElementById('message').textContent = '';
        }, 2000);
    };

    // 발음 재생
    synth.speak(utterance);
}

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

// 키보드 단축키 추가 ('p' 키를 누르면 발음 재생)
document.addEventListener('keydown', function (event) {
    if (event.key === 'p' || event.key === 'P') {
        speakWord();
    }
});

// 초기 로드
loadNewWord();