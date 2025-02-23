// 상태 관리 객체
const State = {
    currentWord: null, // 현재 학습 중인 단어
    isProcessing: false, // 정답 확인 중복 방지
    showingHint: false, // 힌트 표시 여부
    speaking: false, // TTS 재생 중인지 여부
    voices: [], // 사용 가능한 음성 목록
    API_BASE_URL: '/api/v1/words' // API 기본 URL
};

// DOM 엘리먼트 캐싱
const Elements = {
    message: document.getElementById('message'),
    card: document.getElementById('card'),
    vocabulary: document.getElementById('vocabulary'),
    difficulty: document.getElementById('difficulty'),
    answer: document.getElementById('answer'),
    meaning: document.getElementById('meaning'),
    perfectRun: document.getElementById('perfectRun'),
    speakButton: document.querySelector('.btn-speak')
};

// TTS(Text-to-Speech) 관리
const SpeechManager = {
    synth: window.speechSynthesis,

    init() {
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                State.voices = this.synth.getVoices();
            };
        }
    },

    getEnglishVoice() {
        return State.voices.find(voice =>
            voice.lang.includes('en') &&
            (voice.lang.includes('US') || voice.lang.includes('GB'))
        ) || State.voices.find(voice => voice.lang.includes('en'));
    },

    speak(text) {
        if (State.speaking || !text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        const englishVoice = this.getEnglishVoice();

        if (englishVoice) utterance.voice = englishVoice;

        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onstart = () => this.handleSpeechStart();
        utterance.onend = () => this.handleSpeechEnd();
        utterance.onerror = (event) => this.handleSpeechError(event);

        this.synth.speak(utterance);
    },

    handleSpeechStart() {
        State.speaking = true;
        Elements.speakButton.classList.add('speaking-animation');
    },

    handleSpeechEnd() {
        State.speaking = false;
        Elements.speakButton.classList.remove('speaking-animation');
    },

    handleSpeechError(event) {
        console.error('TTS 에러 발생:', event);
        this.handleSpeechEnd();
        UIManager.showMessage('TTS 재생 중 오류가 발생했습니다.', 2000);
    }
};

// UI 관리
const UIManager = {
    getDifficultyStars(level) {
        return '<i class="bi bi-star-fill"></i>'.repeat(level);
    },

    showMessage(text, duration = 0) {
        Elements.message.textContent = text;
        if (duration > 0) {
            setTimeout(() => {
                Elements.message.textContent = '';
            }, duration);
        }
    },

    resetCard() {
        Elements.card.classList.remove('flip');
        Elements.meaning.textContent = '';
        Elements.answer.value = '';
        Elements.message.textContent = '';
    },

    updateWordDisplay(word) {
        Elements.vocabulary.textContent = word.vocabulary;
        Elements.difficulty.innerHTML = this.getDifficultyStars(word.difficulty);
        Elements.speakButton.style.display = 'block';
        this.resetCard();
    },

    showCorrectAnswer(meaning) {
        Elements.meaning.textContent = meaning;
        Elements.card.classList.add('flip');
    },

    showIncorrectAnswer() {
        Elements.card.classList.add('shake');
        setTimeout(() => {
            Elements.card.classList.remove('shake');
            State.isProcessing = false;
        }, 500);
    }
};

// API 통신
const ApiService = {
    async fetchRandomWord() {
        const response = await fetch(`${State.API_BASE_URL}/random`);
        if (!response.ok) throw new Error('단어를 불러오는데 실패했습니다.');
        return response.json();
    },

    async checkAnswer(wordId, answer) {
        const response = await fetch(`${State.API_BASE_URL}/check`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({answer, wordId})
        });
        return response.json();
    },

    async fetchHint(wordId) {
        const response = await fetch(`${State.API_BASE_URL}/${wordId}/hint`);
        return response.json();
    }
};

// 학습 관리
const StudyManager = {
    async loadNewWord() {
        UIManager.resetCard();
        State.isProcessing = false;

        try {
            State.currentWord = await ApiService.fetchRandomWord();
            UIManager.updateWordDisplay(State.currentWord);
        } catch (error) {
            console.error('단어 로드 에러:', error);
            UIManager.showMessage(error.message);
        }
    },

    async checkAnswer() {
        if (State.isProcessing) return;

        const userAnswer = Elements.answer.value.trim();
        if (!userAnswer) {
            UIManager.showMessage('답을 입력해주세요.');
            return;
        }

        State.isProcessing = true;

        try {
            const result = await ApiService.checkAnswer(State.currentWord.id, userAnswer);
            UIManager.showMessage(result.message);
            Elements.perfectRun.textContent = result.perfectRun;

            if (result.correct) {
                this.handleCorrectAnswer();
            } else {
                UIManager.showIncorrectAnswer();
            }
        } catch (error) {
            UIManager.showMessage('정답 확인 중 오류가 발생했습니다.');
            State.isProcessing = false;
        }
    },

    handleCorrectAnswer() {
        UIManager.showCorrectAnswer(State.currentWord.meaning);
        setTimeout(() => this.loadNewWord(), 1500);
    },

    async showHint() {
        if (!State.currentWord) return;

        if (State.showingHint) {
            UIManager.showMessage('');
            State.showingHint = false;
            return;
        }

        try {
            const data = await ApiService.fetchHint(State.currentWord.id);
            UIManager.showMessage(`힌트: ${data.hint}`);
            State.showingHint = true;
        } catch (error) {
            UIManager.showMessage('힌트를 불러오는데 실패했습니다.');
        }
    }
};

// 이벤트 핸들러 설정
function setupEventListeners() {
    // 기존 이벤트 리스너
    Elements.answer.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') StudyManager.checkAnswer().then(() => console.log("checkAnswer"));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'p') {
            SpeechManager.speak(State.currentWord?.vocabulary);
        }
    });

    // TTS 버튼 클릭 이벤트 추가
    Elements.speakButton.addEventListener('click', () => {
        SpeechManager.speak(State.currentWord?.vocabulary);
    });

    // 힌트 버튼 클릭 이벤트 추가
    document.querySelector('.btn-hint').addEventListener('click', () => {
        StudyManager.showHint().then(() => console.log("showHint"));
    });

    // 정답 확인 버튼 클릭 이벤트 추가
    document.querySelector('.btn-primary').addEventListener('click', () => {
        StudyManager.checkAnswer().then(() => console.log("checkAnswer"));
    });
    document.querySelector('#nextRandomWord').addEventListener('click', () => {
        StudyManager.loadNewWord().then(() => console.log("loadNewWord"));
    })

    // ESC 키 입력 시 입력 포커스 해제
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            Elements.answer.blur();
        }
    });
}


// 초기화
function initialize() {
    SpeechManager.init();
    setupEventListeners();
    StudyManager.loadNewWord().then(() => console.log("loadNewWord"));
}

// 앱 시작
document.addEventListener('DOMContentLoaded', initialize);