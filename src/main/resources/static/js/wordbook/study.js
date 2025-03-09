// 상태 관리 객체
const State = {
    currentWords: [],       // 현재 학습할 단어 목록
    currentIndex: 0,        // 현재 학습 중인 단어 인덱스
    isProcessing: false,    // 정답 확인 중복 방지
    showingHint: false,     // 힌트 표시 여부
    speaking: false,        // TTS 재생 중인지 여부
    voices: [],             // 사용 가능한 음성 목록
    API_BASE_URL: '/api/v1/wordbooks' // API 기본 URL
};

// DOM 엘리먼트 캐싱
const Elements = {
    card: document.getElementById('card'),
    vocabulary: document.getElementById('vocabulary'),
    meaning: document.getElementById('meaning'),
    difficulty: document.getElementById('difficulty'),
    answer: document.getElementById('answer'),
    message: document.getElementById('message'),
    perfectRun: document.getElementById('perfectRun'),
    progress: document.getElementById('progress'),
    repeatMode: document.getElementById('repeatMode'),
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
        // 기본 voice 로드 시도
        State.voices = this.synth.getVoices();
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
        this.resetCard();
    },

    updateProgress() {
        Elements.progress.textContent = `${State.currentIndex + 1} / ${State.currentWords.length}`;
    },

    showCorrectAnswer(meaning) {
        Elements.meaning.textContent = meaning;
        Elements.card.classList.add('flip');
    },

    showIncorrectAnswer() {
        Elements.card.classList.add('shake');
        console.log("오답 애니메이션 시작, 500ms 후 상태 리셋 예정");

        setTimeout(() => {
            Elements.card.classList.remove('shake');
            // 여기서 중요: isProcessing 상태를 리셋
            State.isProcessing = false;
            console.log("오답 애니메이션 완료, 상태 리셋됨, isProcessing =", State.isProcessing);
        }, 500);
    }

};

// API 통신
const ApiService = {
    async fetchWords(wordBookId) {
        const response = await fetch(`${State.API_BASE_URL}/${wordBookId}/study`);
        if (!response.ok) {
            throw new Error('단어를 불러오는데 실패했습니다');
        }
        return response.json();
    }
};

// 학습 관리
const StudyManager = {
    shuffleWords() {
        // Fisher-Yates 알고리즘으로 배열 섞기
        for (let i = State.currentWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [State.currentWords[i], State.currentWords[j]] =
                [State.currentWords[j], State.currentWords[i]];
        }
    },

    async loadWords() {
        UIManager.showMessage('단어를 불러오는 중입니다...', 0);
        State.isProcessing = true;

        try {
            State.currentWords = await ApiService.fetchWords(wordBookId);

            if (State.currentWords.length === 0) {
                throw new Error('학습할 단어가 없습니다');
            }

            this.shuffleWords();
            State.currentIndex = 0;
            this.showCurrentWord();
            UIManager.showMessage('');
        } catch (error) {
            console.error('단어 로드 에러:', error);
            UIManager.showMessage(error.message);
            document.querySelector('.card-body').innerHTML = `
                <div class="alert alert-danger" role="alert">
                    ${error.message}
                </div>
            `;
        } finally {
            State.isProcessing = false;
        }
    },

    showCurrentWord() {
        if (State.currentWords.length === 0) return;

        const word = State.currentWords[State.currentIndex];
        UIManager.updateWordDisplay(word);
        UIManager.updateProgress();
    },

    checkAnswer() {
        if (State.isProcessing) {
            console.log("처리 중입니다. 잠시만 기다려주세요.");
            return;
        }

        const userAnswer = Elements.answer.value.trim();
        if (!userAnswer) {
            UIManager.showMessage('답을 입력해주세요.');
            return;
        }

        State.isProcessing = true;
        console.log("정답 확인 처리 시작");

        const word = State.currentWords[State.currentIndex];
        const isCorrect = this.validateAnswer(word.meaning, userAnswer);

        if (isCorrect) {
            UIManager.showMessage('정답입니다!');
            UIManager.showCorrectAnswer(word.meaning);

            // 연속 정답 카운트 증가
            Elements.perfectRun.textContent =
                (parseInt(Elements.perfectRun.textContent) + 1).toString();

            // 여기에 타이머 ID를 저장해서 필요하면 나중에 참조할 수 있게 함
            const timerId = setTimeout(() => {
                console.log("타이머 실행: 다음 단어로 이동 준비");

                if (State.currentIndex === State.currentWords.length - 1) {
                    if (Elements.repeatMode.checked) {
                        this.shuffleWords();
                        State.currentIndex = 0;
                        this.showCurrentWord();
                    } else {
                        alert('모든 단어를 학습했습니다! 메인 페이지로 이동합니다.');
                        window.location.href = '/word/dashboard';
                    }
                } else {
                    this.nextWord();
                }

                // 여기서 명시적으로 isProcessing 상태 리셋
                State.isProcessing = false;
                console.log("타이머 완료: 상태 리셋됨, isProcessing =", State.isProcessing);
            }, 1500);

            console.log("타이머 설정됨, ID:", timerId);

            // 안전장치: 만약 타이머가 어떤 이유로 실행되지 않을 경우를 대비해
            // 백업으로 조금 더 긴 시간 후에 강제로 상태를 리셋
            setTimeout(() => {
                if (State.isProcessing) {
                    console.log("백업 타이머: 상태가 아직 처리 중이므로 강제 리셋");
                    State.isProcessing = false;
                }
            }, 3000);

        } else {
            UIManager.showMessage('틀렸습니다. 다시 시도해보세요.');
            UIManager.showIncorrectAnswer();
            Elements.perfectRun.textContent = '0';

            // 오답일 경우 즉시 상태 리셋하지 않고
            // showIncorrectAnswer 에서 애니메이션 후 리셋하도록 함
            console.log("오답 처리: 애니메이션 후 상태 리셋 예정");
        }
    },

    validateAnswer(correctMeaning, userAnswer) {
        // 쉼표로 구분된 여러 정답 처리
        return correctMeaning.toLowerCase().split(',')
            .map(meaning => meaning.trim())
            .includes(userAnswer.toLowerCase().trim());
    },

    previousWord() {
        if (State.isProcessing) return;

        if (State.currentIndex > 0) {
            State.currentIndex--;
            this.showCurrentWord();
        }
    },

    nextWord() {
        // 이전에 이 함수에서도 isProcessing 상태를 확인했지만,
        // 이것이 정답 후 다음 단어로 넘어가는 데 방해가 될 수 있습니다.
        // 이 검사를 제거하거나 조건부로 수행해야 할 수 있습니다.

        console.log("다음 단어 진행 시도, 현재 상태:",
            "인덱스=", State.currentIndex,
            "전체 단어 수=", State.currentWords.length,
            "처리 중=", State.isProcessing);

        // 정답 확인 처리 중이 아닐 때만 체크하거나,
        // 아니면 이 검사를 제거할 수도 있습니다.
        // if (State.isProcessing) return;

        if (State.currentIndex < State.currentWords.length - 1) {
            State.currentIndex++;
            this.showCurrentWord();
            console.log("다음 단어로 이동 완료, 새 인덱스:", State.currentIndex);
        } else if (Elements.repeatMode.checked) {
            this.shuffleWords();
            State.currentIndex = 0;
            this.showCurrentWord();
            console.log("마지막 단어 도달, 단어 목록 섞기 완료");
        } else {
            alert('모든 단어를 학습했습니다! 메인 페이지로 이동합니다.');
            window.location.href = '/word/dashboard';
        }
    },


    showHint() {
        if (State.isProcessing) return;
        if (!State.currentWords.length) return;

        if (State.showingHint) {
            UIManager.showMessage('');
            State.showingHint = false;
            return;
        }

        const word = State.currentWords[State.currentIndex];
        if (word.hint) {
            UIManager.showMessage(`힌트: ${word.hint}`);
            State.showingHint = true;
        } else {
            UIManager.showMessage('힌트가 없습니다.', 1500);
        }
    }
};

// 이벤트 핸들러 설정
function setupEventListeners() {
    console.log("이벤트 리스너 설정 중...");

    // 엔터 키로 정답 확인
    Elements.answer.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            console.log("엔터 키 눌림, 정답 확인 호출");
            StudyManager.checkAnswer();
        }
    });

    // 'p' 키로 발음 듣기
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'p') {
            const word = State.currentWords[State.currentIndex];
            if (word) SpeechManager.speak(word.vocabulary);
        }
    });

    // 발음 듣기 버튼
    Elements.speakButton.addEventListener('click', () => {
        console.log("발음 듣기 버튼 클릭");
        const word = State.currentWords[State.currentIndex];
        if (word) SpeechManager.speak(word.vocabulary);
    });

    // 정답 확인 버튼
    const checkButton = document.querySelector('.input-group .btn-add_word');
    if (checkButton) {
        console.log("정답 확인 버튼 이벤트 설정");
        checkButton.addEventListener('click', () => {
            console.log("정답 확인 버튼 클릭");
            StudyManager.checkAnswer();
        });
    } else {
        console.error("정답 확인 버튼을 찾을 수 없습니다");
    }

    // 이전 단어, 힌트, 다음 단어 버튼 설정
    const controlButtons = document.querySelectorAll('.control-section .btn-surface');
    if (controlButtons.length === 3) {
        console.log("컨트롤 버튼 이벤트 설정 (총 " + controlButtons.length + "개)");
        // 이전 단어 버튼
        controlButtons[0].addEventListener('click', () => {
            console.log("이전 단어 버튼 클릭");
            StudyManager.previousWord();
        });

        // 힌트 버튼
        controlButtons[1].addEventListener('click', () => {
            console.log("힌트 버튼 클릭");
            StudyManager.showHint();
        });

        // 다음 단어 버튼
        controlButtons[2].addEventListener('click', () => {
            console.log("다음 단어 버튼 클릭");
            StudyManager.nextWord();
        });
    } else {
        console.error(`예상되는 컨트롤 버튼을 찾을 수 없습니다: ${controlButtons.length}개 발견됨`);
    }

    // ESC 키 입력 시 입력 포커스 해제
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            Elements.answer.blur();
        }
    });

    console.log("모든 이벤트 리스너 설정 완료");
}

// 초기화
function initialize() {
    console.log("애플리케이션 초기화 중...");
    SpeechManager.init();
    setupEventListeners();
    StudyManager.loadWords().then(() => {
        console.log("단어 로드 완료");
    }).catch(error => {
        console.error("단어 로드 실패:", error);
    });
    console.log("초기화 완료");
}

// 앱 시작
document.addEventListener('DOMContentLoaded', initialize);