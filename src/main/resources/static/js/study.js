/* ====================================================
   Study Application JavaScript
   ==================================================== */
// 전역 변수
let currentWord = null; // 현재 단어 객체 저장
let isProcessing = false; // 정답 처리 중 중복 방지를 위한 플래그
const API_BASE_URL = '/api/v1/words'; // API 기본 URL
let showingHint = false; // 힌트 표시 여부

// DOM 요소
const messageEl = document.getElementById('message');


// TTS (Text-to-Speech) 관련 변수
let speaking = false;
const synth = window.speechSynthesis;
let voices = [];

// TTS에 사용할 음성 목록을 불러옴
function loadVoices() {
    voices = synth.getVoices();
}

// 음성 목록이 변경될 때 호출되는 이벤트 핸들러 등록
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * 현재 단어를 음성으로 재생하는 함수
 */
function speakWord() {
    if (speaking || !currentWord) return; // 이미 재생 중이거나 단어가 없으면 종료

    const word = currentWord.vocabulary;
    const speakButton = document.querySelector('.btn-speak');

    //  음성 객체 생성
    const utterance = new SpeechSynthesisUtterance(word);

    // 영어 음성 선택 (미국 / 영국 우선))
    const englishVoice = voices.find(voice =>
        voice.lang.includes('en') &&
        (voice.lang.includes('US') || voice.lang.includes('GB'))
    ) || voices.find(voice => voice.lang.includes('en'));

    // 만약 영어 음성이 존재하면 설정
    if (englishVoice) {
        utterance.voice = englishVoice;
    }

    // 음성 설정
    // 발음 속도, 음높이 설정
    utterance.rate = 1; // 발음 속도 (0.1 ~ 10)
    utterance.pitch = 1;

    // 발음 시작 시 UI 업데이트
    utterance.onstart = () => {
        speaking = true;
        speakButton.classList.add('speaking-animation');
    };

    // 발음 종료 호 UI 복구
    utterance.onend = () => {
        speaking = false;
        speakButton.classList.remove('speaking-animation');
    };

    // 발음 오류 처리
    utterance.onerror = (event) => {
        console.error('TTS 에러 발생:', event);
        speaking = false;
        speakButton.classList.remove('speaking-animation');

        // 오류 메시지 표시
        messageEl.textContent = 'TTS 재생 중 오류가 발생했습니다.';
        // document.getElementById('message').textContent = 'TTS 재생 중 오류가 발생했습니다.';
        setTimeout(() => {
            messageEl.textContent = '';
            // document.getElementById('message').textContent = '';
        }, 2000);
    };


    // 단어 재생 시작
    synth.speak(utterance);
} // speakWord() 함수 끝

/**
 * 난이도에 따른 별 아이콘을 반환하는 함수
 * @param {number} level - 난이도 레벨
 */
function getDifficultyStars(level) {
    return '<i class="bi bi-star-fill"></i>'.repeat(level);
}

/**
 * 새로운 단어를 API에서 불러와 UI를 업데이트하는 함수
 */
async function loadNewWord() {
    isProcessing = false; // 상태 초기화

    try {
        const response = await fetch(`${API_BASE_URL}/random`);
        if (!response.ok) {
            console.error('단어 로드 에러:', response);
            messageEl.textContent = '단어를 불러오는데 실패했습니다.';
            // document.getElementById('message').textContent = '단어를 불러오는데 실패했습니다.';
            return;
        }

        currentWord = await response.json();

        // 단어 표시
        const vocabularyEl = document.getElementById('vocabulary');
        const difficultyEl = document.getElementById('difficulty');
        const cardEl = document.getElementById('card');
        const answerEl = document.getElementById('answer');
        const messageEl = document.getElementById('message');
        const meaningEl = document.getElementById('meaning');
        const speakButton = document.querySelector('.btn-speak');
        speakButton.style.display = 'block'; // 기본적으로 보이도록 수정

        // UI 업데이트: 단어, 난이도, 카드 상태, 입력값 초기화
        vocabularyEl.textContent = currentWord.vocabulary;
        difficultyEl.innerHTML = getDifficultyStars(currentWord.difficulty);
        cardEl.classList.remove('flip');
        answerEl.value = '';
        messageEl.textContent = '';
        meaningEl.textContent = '';

    } catch (error) {
        console.error('단어 로드 에러:', error);
        messageEl.textContent = '단어를 불러오는데 실패했습니다.';
        // document.getElementById('message').textContent = '단어를 불러오는데 실패했습니다.';
    }
}// loadNewWord() 함수 끝

/**
 * 사용자의 답안을 API에 제출하여 확인하는 함수
 */
async function checkAnswer() {
    if (isProcessing) return; // 중복 제출 방지

    const userAnswer = document.getElementById('answer').value.trim();
    const card = document.getElementById('card');
    const messageEl = document.getElementById('message');
    const meaningEl = document.getElementById('meaning');
    const vocabularyEl = document.getElementById('vocabulary');

    if (!userAnswer) {
        messageEl.textContent = '답을 입력해주세요.';
        return;
    }

    isProcessing = true;

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
        messageEl.textContent = result.message;
        document.getElementById('perfectRun').textContent = result.perfectRun;

        if (result.correct) {
            // 정답인 경우: 단어의 의미 표시 후 카드 플립 애니메이션 실행
            meaningEl.textContent = currentWord.meaning;
            card.classList.add('flip');

            // 1.5초 후 다음 단어로 전환
            setTimeout(() => {
                loadNewWord();
            }, 1500);
        } else {
            // 오답인 경우: 카드 흔들림 애니메이션 실행
            card.classList.add('shake');
            setTimeout(() => {
                card.classList.remove('shake');
                isProcessing = false;
            }, 500);
        }
    } catch (error) {
        messageEl.textContent = '정답 확인 중 오류가 발생했습니다.';
        isProcessing = false;
    }
}

/**
 * 현재 단어의 힌트를 표시하거나 숨기는 함수
 */
async function showHint() {
    if (!currentWord) return;

    if (showingHint) {
        messageEl.textContent = '';
        // document.getElementById('message').textContent = '';
        showingHint = false;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${currentWord.id}/hint`);
        const data = await response.json();
        messageEl.textContent = `힌트: ${data.hint}`;
        // document.getElementById('message').textContent = `힌트: ${data.hint}`;
        showingHint = true;
    } catch (error) {
        messageEl.textContent = '힌트를 불러오는데 실패했습니다.';
        // document.getElementById('message').textContent = '힌트를 불러오는데 실패했습니다.';
    }
}

/**
 * 답안을 제출하는 함수 (enter 키 및 버튼 클릭 시 호출)
 */
function submitAnswer() {
    if (!currentWord) return;
    checkAnswer();
}

// 엔터 키 입력 시 답안 제출 이벤트 등록
document.getElementById('answer').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        submitAnswer();
    }
});

// 'p' 키 입력 시 단어 발음 재생 (TTS) 이벤트 등록
document.addEventListener('keydown', function (event) {
    if (event.key === 'p' || event.key === 'P') {
        speakWord();
    }
});

// 초기 로드
loadNewWord();