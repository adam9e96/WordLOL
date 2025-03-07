// 상태 관리 객체
const State = {
    currentWord: null, // 현재 학습 중인 단어
    isProcessing: false, // 정답 확인 중복 방지
    showingHint: false, // 힌트 표시 여부
    speaking: false, // TTS 재생 중인지 여부
    voices: [], // 사용 가능한 음성 목록
    API_BASE_URL: '/api/v1/words', // API 기본 URL
    animations: {}, // 애니메이션 객체 저장
    typingAnimation: null // 타이핑 애니메이션 객체
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
    speakButton: document.querySelector('.btn-speak'),
    messageSection: document.querySelector('.message-section'),
    primaryButton: document.querySelector('.btn-primary'),
    hintButton: document.querySelector('.btn-hint'),
    nextButton: document.querySelector('#nextRandomWord'),
    studyContainer: document.querySelector('.study-container')
};

// 애니메이션 관리
const AnimationManager = {
    init() {
        // 페이지 로드 애니메이션
        this.playLoadAnimation();

        // 카드 애니메이션 설정
        this.setupCardAnimations();

        // 버튼 효과 설정
        this.setupButtonEffects();

        // 텍스트 입력 이벤트 리스너 설정
        this.setupTypingEffects();
    },

    // 페이지 로드 애니메이션
    playLoadAnimation() {
        // 컨테이너 초기 설정
        anime.set(Elements.studyContainer, {
            opacity: 0,
            translateY: 20
        });

        // 페이드 인 애니메이션
        State.animations.pageLoad = anime({
            targets: Elements.studyContainer,
            opacity: 1,
            translateY: 0,
            duration: 800,
            easing: 'easeOutCubic'
        });
    },

    // 카드 관련 애니메이션 설정
    setupCardAnimations() {
        // 카드 초기 설정
        anime.set(Elements.card, {
            scale: 1,
            rotateY: 0
        });
    },

    // 카드 플립 애니메이션 (정답 확인시)
    flipCard() {
        if (State.animations.flip) {
            State.animations.flip.pause();
        }

        // 카드 뒤집기 애니메이션
        State.animations.flip = anime({
            targets: Elements.card,
            rotateY: '180deg',
            duration: 800,
            easing: 'easeInOutQuad'
        });
    },

    // 카드 리셋 애니메이션
    resetCard() {
        if (State.animations.flip) {
            State.animations.flip.pause();
        }

        // 카드 되돌리기
        State.animations.flip = anime({
            targets: Elements.card,
            rotateY: 0,
            duration: 700,
            easing: 'easeInOutQuad'
        });

        // 내용 지우기는 애니메이션 중간에
        setTimeout(() => {
            Elements.meaning.textContent = '';
            Elements.answer.value = '';
            Elements.message.textContent = '';
        }, 350);
    },

    // 오답 애니메이션 (흔들림 효과)
    shakeCard() {
        if (State.animations.shake) {
            State.animations.shake.pause();
        }

        // 흔들림 효과
        State.animations.shake = anime({
            targets: Elements.card,
            translateX: [
                {value: -10, duration: 100, easing: 'easeInOutQuad'},
                {value: 10, duration: 100, easing: 'easeInOutQuad'},
                {value: -10, duration: 100, easing: 'easeInOutQuad'},
                {value: 10, duration: 100, easing: 'easeInOutQuad'},
                {value: 0, duration: 100, easing: 'easeInOutQuad'}
            ],
            duration: 500,
            complete: function () {
                State.isProcessing = false;
            }
        });
    },

    // 새 단어 로드 애니메이션
    newWordAnimation(word) {
        // 새 단어 도착 애니메이션
        anime({
            targets: Elements.vocabulary,
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 600,
            easing: 'easeOutCubic',
            begin: function () {
                Elements.vocabulary.textContent = word.vocabulary;
                Elements.difficulty.innerHTML = UIManager.getDifficultyStars(word.difficulty);
            }
        });
    },

    // 버튼 효과 설정
    setupButtonEffects() {
        // 버튼 요소들 배열
        const buttons = [
            Elements.primaryButton,
            Elements.hintButton,
            Elements.nextButton
        ];

        // 버튼 호버 효과
        buttons.forEach(button => {
            if (!button) return; // 버튼이 없으면 스킵

            button.addEventListener('mouseenter', function () {
                anime({
                    targets: this,
                    scale: 1.05,
                    duration: 100,
                    easing: 'easeOutQuad'
                });
            });

            button.addEventListener('mouseleave', function () {
                anime({
                    targets: this,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            });

            button.addEventListener('mousedown', function () {
                anime({
                    targets: this,
                    scale: 0.95,
                    duration: 100,
                    easing: 'easeOutQuad'
                });
            });

            button.addEventListener('mouseup', function () {
                anime({
                    targets: this,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutElastic'
                });
            });
        });

        // 발음 버튼 효과
        if (Elements.speakButton) {
            Elements.speakButton.addEventListener('mouseenter', function () {
                anime({
                    targets: this,
                    scale: 1.1,
                    duration: 200,
                    easing: 'easeOutElastic'
                });
            });

            Elements.speakButton.addEventListener('mouseleave', function () {
                anime({
                    targets: this,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            });
        }
    },

    // 텍스트 타이핑 효과 설정
    setupTypingEffects() {
        if (!Elements.answer) return;

        // 커서 깜박임 효과를 위한 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .typing-cursor {
                display: inline-block;
                width: 2px;
                height: 1.2em;
                background-color: currentColor;
                margin-left: 2px;
                animation: blink 1s step-end infinite;
            }
            
            @keyframes blink {
                from, to { opacity: 1; }
                50% { opacity: 0; }
            }
            
            .answer-typing {
                border-color: var(--primary) !important;
                box-shadow: 0 0 0 2px var(--primary-container) !important;
            }
        `;
        document.head.appendChild(style);

        // 텍스트 입력 이벤트 핸들러
        Elements.answer.addEventListener('focus', () => {
            // 입력 필드에 타이핑 스타일 추가
            Elements.answer.classList.add('answer-typing');

            // 타이핑 효과 시작
            if (Elements.answer.parentElement) {
                const typingAnimation = anime({
                    targets: Elements.answer,
                    boxShadow: [
                        {value: '0 0 0 2px var(--primary-container)', duration: 500},
                        {value: '0 0 0 3px var(--primary-container)', duration: 500}
                    ],
                    borderColor: [
                        {value: 'var(--primary)', duration: 500},
                        {value: 'var(--primary-darker, var(--primary))', duration: 500}
                    ],
                    easing: 'easeInOutSine',
                    duration: 1000,
                    loop: true,
                    direction: 'alternate'
                });

                State.typingAnimation = typingAnimation;
            }
        });

        // 포커스 아웃시 애니메이션 중지
        Elements.answer.addEventListener('blur', () => {
            Elements.answer.classList.remove('answer-typing');
            if (State.typingAnimation) {
                State.typingAnimation.pause();

                // 원래 스타일로 복원
                anime({
                    targets: Elements.answer,
                    boxShadow: '0 0 0 0 transparent',
                    borderColor: 'var(--outline-variant)',
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        });

        // 타이핑 중 효과
        Elements.answer.addEventListener('input', () => {
            // 입력 중 효과 - 간단한 스케일 효과
            anime({
                targets: Elements.answer,
                scale: [1, 1.01, 1],
                duration: 100,
                easing: 'easeInOutQuad'
            });

            // 입력된 텍스트 길이에 따라 글자색 변경 (선택 사항)
            if (Elements.answer.value.length > 0) {
                const intensity = Math.min(Elements.answer.value.length * 20, 100);
                Elements.answer.style.color = `hsl(220, ${intensity}%, 40%)`;
            } else {
                Elements.answer.style.color = '';
            }
        });
    },

    // 메시지 표시 애니메이션
    showMessage(text) {
        // 이전 애니메이션 중단
        if (State.animations.message) {
            State.animations.message.pause();
        }

        // 메시지 섹션 애니메이션
        Elements.message.textContent = text;

        if (text && Elements.messageSection) {
            State.animations.message = anime({
                targets: Elements.messageSection,
                backgroundColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)'],
                duration: 1500,
                easing: 'easeInOutQuad'
            });
        }
    },

    // 연속 정답 효과
    streakAnimation(count) {
        if (!Elements.perfectRun) return;

        anime({
            targets: Elements.perfectRun,
            scale: [1, 1.3, 1],
            translateY: [0, -10, 0],
            color: [
                'var(--on-surface, #1D1B20)',  // 기본 텍스트 색상으로 시작
                '#FFD700',                     // 애니메이션 중 골드 색상
                'var(--on-surface, #1D1B20)'   // 다시 기본 텍스트 색상으로 돌아옴
            ],
            duration: 1000,
            easing: 'easeInOutQuad',
            begin: function () {
                Elements.perfectRun.textContent = count;
            }
        });
    },

    // 정답 입력 애니메이션
    playAnswerAnimation() {
        if (!Elements.answer) return;

        // 정답 확인 시 입력창 효과
        anime({
            targets: Elements.answer,
            scale: [1, 1.05, 1],
            backgroundColor: [
                {value: 'rgba(var(--primary-rgb, 103, 80, 164), 0.1)', duration: 300},
                {value: 'rgba(var(--primary-rgb, 103, 80, 164), 0)', duration: 300}
            ],
            duration: 600,
            easing: 'easeInOutQuad'
        });
    },

    // 정답 효과
    playCorrectAnimation() {
        if (!Elements.answer) return;

        // 정답일 때 입력창 효과
        anime({
            targets: Elements.answer,
            backgroundColor: [
                {value: 'rgba(var(--success-rgb, 20, 151, 103), 0.2)', duration: 300},
                {value: 'rgba(var(--success-rgb, 20, 151, 103), 0)', duration: 300}
            ],
            borderColor: [
                {value: 'var(--success, #149767)', duration: 300},
                {value: 'var(--outline-variant)', duration: 300}
            ],
            duration: 600,
            easing: 'easeInOutQuad'
        });
    },

    // 오답 효과
    playIncorrectAnimation() {
        if (!Elements.answer) return;

        // 오답일 때 입력창 효과
        anime({
            targets: Elements.answer,
            backgroundColor: [
                {value: 'rgba(var(--error-rgb, 179, 38, 30), 0.2)', duration: 300},
                {value: 'rgba(var(--error-rgb, 179, 38, 30), 0)', duration: 300}
            ],
            borderColor: [
                {value: 'var(--error, #B3261E)', duration: 300},
                {value: 'var(--outline-variant)', duration: 300}
            ],
            duration: 600,
            easing: 'easeInOutQuad'
        });
    }
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

        if (!Elements.speakButton) return;

        // 스피킹 애니메이션
        State.animations.speak = anime({
            targets: Elements.speakButton,
            scale: [1, 1.1, 1, 1.1, 1],
            backgroundColor: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)'],
            loop: true,
            duration: 1000,
            easing: 'easeInOutQuad'
        });
    },

    handleSpeechEnd() {
        State.speaking = false;
        if (State.animations.speak) {
            State.animations.speak.pause();

            if (Elements.speakButton) {
                // 원래 상태로 되돌리기
                anime({
                    targets: Elements.speakButton,
                    scale: 1,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        }
    },

    handleSpeechError(event) {
        console.error('TTS 에러 발생:', event);
        this.handleSpeechEnd();
        UIManager.showMessage('TTS 재생 중 오류가 발생했습니다.');
    }
};

// UI 관리
const UIManager = {
    getDifficultyStars(level) {
        return '<i class="bi bi-star-fill"></i>'.repeat(level);
    },

    showMessage(text, duration = 0) {
        if (AnimationManager) {
            AnimationManager.showMessage(text);
        } else {
            Elements.message.textContent = text;
        }

        if (duration > 0) {
            setTimeout(() => {
                if (AnimationManager) {
                    AnimationManager.showMessage('');
                } else {
                    Elements.message.textContent = '';
                }
            }, duration);
        }
    },

    resetCard() {
        if (AnimationManager) {
            AnimationManager.resetCard();
        } else {
            Elements.card.classList.remove('flip');
            Elements.meaning.textContent = '';
            Elements.answer.value = '';
            Elements.message.textContent = '';
        }
    },

    updateWordDisplay(word) {
        if (AnimationManager) {
            AnimationManager.newWordAnimation(word);
        } else {
            Elements.vocabulary.textContent = word.vocabulary;
            Elements.difficulty.innerHTML = this.getDifficultyStars(word.difficulty);
        }

        if (Elements.speakButton) {
            Elements.speakButton.style.display = 'block';
        }

        this.resetCard();
    },

    showCorrectAnswer(meaning) {
        Elements.meaning.textContent = meaning;

        if (AnimationManager) {
            AnimationManager.flipCard();
            AnimationManager.playCorrectAnimation();
        } else {
            Elements.card.classList.add('flip');
        }
    },

    showIncorrectAnswer() {
        if (AnimationManager) {
            AnimationManager.shakeCard();
            AnimationManager.playIncorrectAnimation();
        } else {
            Elements.card.classList.add('shake');
            setTimeout(() => {
                Elements.card.classList.remove('shake');
                State.isProcessing = false;
            }, 500);
        }
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

            // 새 단어가 로드되면 자동으로 입력 필드에 포커스
            if (Elements.answer) {
                setTimeout(() => {
                    Elements.answer.focus();
                }, 500);
            }
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

        // 정답 확인 애니메이션
        if (AnimationManager) {
            AnimationManager.playAnswerAnimation();
        }

        try {
            const result = await ApiService.checkAnswer(State.currentWord.id, userAnswer);
            UIManager.showMessage(result.message);

            // 연속 정답 업데이트
            if (AnimationManager) {
                AnimationManager.streakAnimation(result.perfectRun);
            } else {
                Elements.perfectRun.textContent = result.perfectRun;
            }

            if (result.correct) {
                this.handleCorrectAnswer();
            } else {
                UIManager.showIncorrectAnswer();
                Elements.perfectRun.textContent = '0';
            }
        } catch (error) {
            UIManager.showMessage('정답 확인 중 오류가 발생했습니다.');
            State.isProcessing = false;
        }
    },

    handleCorrectAnswer() {
        UIManager.showCorrectAnswer(State.currentWord.meaning);

        // 성공 애니메이션 후 다음 단어 로드
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
    if (Elements.answer) {
        Elements.answer.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') StudyManager.checkAnswer();
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'p') {
            SpeechManager.speak(State.currentWord?.vocabulary);
        }
    });

    // TTS 버튼 클릭 이벤트
    if (Elements.speakButton) {
        Elements.speakButton.addEventListener('click', () => {
            SpeechManager.speak(State.currentWord?.vocabulary);
        });
    }

    // 힌트 버튼 클릭 이벤트
    if (Elements.hintButton) {
        Elements.hintButton.addEventListener('click', () => {
            StudyManager.showHint();
        });
    }

    // 정답 확인 버튼 클릭 이벤트
    if (Elements.primaryButton) {
        Elements.primaryButton.addEventListener('click', () => {
            StudyManager.checkAnswer();
        });
    }

    // 다음 단어 버튼 클릭 이벤트
    if (Elements.nextButton) {
        Elements.nextButton.addEventListener('click', () => {
            StudyManager.loadNewWord();
        });
    }

    // ESC 키 입력 시 입력 포커스 해제
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && Elements.answer) {
            Elements.answer.blur();
        }
    });
}

// 초기화
function initialize() {
    // anime.js 로드 확인
    if (typeof anime === 'undefined') {
        console.error('anime.js가 로드되지 않았습니다. 스크립트를 추가해주세요.');
        // 기존 코드로 폴백
        console.log('기본 애니메이션 모드로 실행합니다.');
    } else {
        console.log('anime.js가 로드되었습니다. 고급 애니메이션 모드로 실행합니다.');
        SpeechManager.init();
        AnimationManager.init();
    }

    setupEventListeners();
    StudyManager.loadNewWord();
}

// 앱 시작
document.addEventListener('DOMContentLoaded', initialize);