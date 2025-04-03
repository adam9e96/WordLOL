import apiService from '../utils/api-service.js';

/**
 * 애플리케이션 상태 관리 클래스
 * 전역 상태를 관리하는 싱글톤 클래스
 */
class StudyManager {
    constructor() {
        this.currentWord = null;       // 현재 학습 중인 단어
        this.isProcessing = false;     // 정답 확인 중복 방지
        this.showingHint = false;      // 힌트 표시 여부
        this.speaking = false;         // TTS 재생 중인지 여부
        this.voices = [];              // 사용 가능한 음성 목록
        this.animations = {};          // 애니메이션 객체 저장
        this.typingAnimation = null;   // 타이핑 애니메이션 객체
    }

    /**
     * 싱글톤 인스턴스 생성
     * @returns {StudyManager}
     */
    static getInstance() {
        if (!StudyManager.instance) {
            StudyManager.instance = new StudyManager();
        }
        return StudyManager.instance;
    }

    /**
     * 상태 초기화
     */
    reset() {
        this.isProcessing = false;
        this.showingHint = false;
    }
}

/**
 * DOM 요소 관리 클래스
 * 자주 사용되는 DOM 요소에 대한 참조를 캐싱하고 관리
 */
class DOMElements {
    constructor() {
        this.message = document.getElementById('message'); // 메시지 표시 영역
        this.card = document.getElementById('card'); // 카드 요소
        this.vocabulary = document.getElementById('vocabulary'); // 단어 표시 영역
        this.difficulty = document.getElementById('difficulty'); // 난이도 표시 영역
        this.answer = document.getElementById('answer'); // 정답 입력 필드
        this.meaning = document.getElementById('meaning'); // 뜻 표시 영역
        this.perfectRun = document.getElementById('perfectRun'); // 연속 정답 수 표시 영역
        this.speakButton = document.querySelector('.btn-speak'); // 발음 듣기 버튼
        this.messageSection = document.querySelector('.message-section'); // 메시지 섹션
        this.checkAnswerBtn = document.getElementById('checkAnswerBtn'); // 정답 확인 버튼
        this.hintButton = document.querySelector('.btn-hint'); // 힌트 버튼
        this.nextButton = document.getElementById('nextRandomWord'); // 다음 단어 버튼
        this.studyContainer = document.querySelector('.study-container'); // 학습 컨테이너
    }

    // 싱글톤 인스턴스 획득
    static getInstance() {
        if (!DOMElements.instance) {
            DOMElements.instance = new DOMElements();
        }
        return DOMElements.instance;
    }
}

/**
 * 애니메이션 관리 클래스
 * UI 애니메이션 효과를 관리
 */
class AnimationController {
    /** @type {DOMElements} */
    elements;
    /** @type {StudyManager} */
    state;
    /** @type {boolean} */
    isAnimeAvailable;

    constructor() {
        this.state = StudyManager.getInstance();
        this.elements = DOMElements.getInstance();
        this.isAnimeAvailable = typeof anime !== 'undefined';
    }


    /**
     * 애니메이션 시스템 초기화
     */
    init() {
        this.playLoadAnimation();
        this.setupCardAnimations();
        this.setupButtonEffects();
        this.setupTypingEffects();
    }

    /**
     * 페이지 로드 애니메이션
     * 학습 컨테이너의 초기 위치와 투명도를 설정
     */
    playLoadAnimation() {
        if (!this.isAnimeAvailable) {
            return;
        }

        anime.set(this.elements.studyContainer, {
            opacity: 0,
            translateY: 20
        });

        this.state.animations.pageLoad = anime({
            targets: this.elements.studyContainer,
            opacity: 1,
            translateY: 0,
            duration: 800,
            easing: 'easeOutCubic'
        });
    }

    /**
     * 카드 관련 애니메이션 설정
     */
    setupCardAnimations() {
        // 카드 초기 위치와 회전 설정
        if (!this.isAnimeAvailable) {
            return;
        }

        /**
         *
         */
        anime.set(this.elements.card, {
            scale: 1,
            rotateY: 0
        });
    }

    /**
     * 카드 뒤집기 애니메이션
     */
    flipCard() {
        // 애니메이션이 지원되지 않는 경우 CSS 클래스를 사용하여 카드 뒤집기
        if (!this.isAnimeAvailable) {
            this.elements.card.classList.add('flip');
            return;
        }

        // 애니메이션이 지원되는 경우 anime.js를 사용하여 카드 뒤집기
        if (this.state.animations.flip) {
            this.state.animations.flip.pause(); // 이전 애니메이션 정지
        }

        // 카드 뒤집기 애니메이션 설정
        this.state.animations.flip = anime({
            targets: this.elements.card,
            rotateY: '180deg',
            duration: 800,
            easing: 'easeInOutQuad'
        });
    }

    /**
     * 카드 초기화 애니메이션
     */
    resetCard() {
        // isAnimeAvailable 가 false 인 경우 카드 초기화
        if (!this.isAnimeAvailable) {
            this.elements.card.classList.remove('flip');
            this.elements.meaning.textContent = '';
            this.elements.answer.value = '';
            this.elements.message.textContent = '';
            return;
        }

        // isAnimeAvailable 가 true 인 경우 anime.js를 사용하여 카드 초기화
        if (this.state.animations.flip) {
            this.state.animations.flip.pause(); // flip 애니메이션이 존재하면 중지
        }

        // 카드 초기화 애니메이션 설정
        this.state.animations.flip = anime({
            targets: this.elements.card,
            rotateY: 0,
            duration: 700,
            easing: 'easeInOutQuad'
        });

        // 카드 초기화 후 350ms 후에 카드 내용 초기화
        setTimeout(() => {
            this.elements.meaning.textContent = '';
            this.elements.answer.value = '';
            this.elements.message.textContent = '';
        }, 350);
    }

    /**
     * 오답 시 카드 흔들림 애니메이션
     */
    shakeCard() {
        // 애니메이션이 지원되지 않는 경우 CSS 클래스를 사용하여 카드 흔들림
        if (!this.isAnimeAvailable) {
            this.elements.card.classList.add('shake');
            setTimeout(() => {
                this.elements.card.classList.remove('shake');
                this.state.isProcessing = false;
            }, 500);
            return;
        }

        // 애니메이션이 지원되는 경우 anime.js를 사용하여 카드 흔들림
        if (this.state.animations.shake) {
            this.state.animations.shake.pause();
        }

        this.state.animations.shake = anime({
            targets: this.elements.card,
            translateX: [
                {value: -10, duration: 100, easing: 'easeInOutQuad'},
                {value: 10, duration: 100, easing: 'easeInOutQuad'},
                {value: -10, duration: 100, easing: 'easeInOutQuad'},
                {value: 10, duration: 100, easing: 'easeInOutQuad'},
                {value: 0, duration: 100, easing: 'easeInOutQuad'}
            ],
            duration: 500,
            complete: () => {
                this.state.isProcessing = false;
            }
        });
    }

    /**
     * 새 단어 로드 애니메이션
     * @param {Object} word - 단어 객체
     */
    newWordAnimation(word) {
        // 애니메이션이 지원되지 않는 경우 단어와 난이도 업데이트
        if (!this.isAnimeAvailable) {
            this.elements.vocabulary.textContent = word.vocabulary;
            this.elements.difficulty.innerHTML = this.getDifficultyStars(word.difficulty);
            return;
        }

        // 애니메이션이 지원되는 경우 anime.js를 사용하여 단어와 난이도 업데이트
        anime({
            targets: this.elements.vocabulary,
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 600,
            easing: 'easeOutCubic',
            begin: () => {
                this.elements.vocabulary.textContent = word.vocabulary;
                this.elements.difficulty.innerHTML = this.getDifficultyStars(word.difficulty);
            }
        });
    }

    /**
     * 버튼 효과 설정
     */
    setupButtonEffects() {
        // anime.js 가 로드되지 않으면 함수 종료
        if (!this.isAnimeAvailable) {
            return;
        }

        // 대상 버튼 설정: 애니메이션 효과를 적용할 버튼 요소들을 배열로 정의
        const buttons = [
            this.elements.checkAnswerBtn,
            this.elements.hintButton,
            this.elements.nextButton
        ];

        buttons.forEach(button => {
            if (!button) {
                return;
            }

            // 마우스 진입 이벤트
            button.addEventListener('mouseenter', function () {
                anime({
                    targets: this,
                    scale: 1.05,
                    duration: 100,
                    easing: 'easeOutQuad'
                });
            });

            // 마우스 이탈 이벤트
            button.addEventListener('mouseleave', function () {
                anime({
                    targets: this,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            });

            // 마우스 누름 이벤트
            button.addEventListener('mousedown', function () {
                anime({
                    targets: this,
                    scale: 0.95,
                    duration: 100,
                    easing: 'easeOutQuad'
                });
            });

            // 마우스 뗌 이벤트
            button.addEventListener('mouseup', function () {
                anime({
                    targets: this,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutElastic'
                });
            });
        });

        // 발음 듣기 버튼에 대한 애니메이션 효과 설정
        if (this.elements.speakButton) {
            // 마우스 진입 이벤트
            this.elements.speakButton.addEventListener('mouseenter', function () {
                anime({
                    targets: this,
                    scale: 1.1,
                    duration: 200,
                    easing: 'easeOutElastic'
                });
            });

            // 마우스 이탈 이벤트
            this.elements.speakButton.addEventListener('mouseleave', function () {
                anime({
                    targets: this,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            });
        }
    }

    /**
     * 텍스트 타이핑 효과 설정
     * 사용자가 답변을 입력할때, 시각적 효과를 설정
     */
    setupTypingEffects() {
        // 답변 입력 필드가 존재하지 않으면 함수 종료
        if (!this.elements.answer) {
            return;
        }

        // 타이핑 관련 애니메이션을 위한 CSS 스타일을 동적으로 생성하여 문서의 <head> 태그에 추가\
        // .typing-cursor: 깜빡이는 커서 스타일 정의
        // @keyframes blink: 커서 깜빡임 애니메이션 정의
        // .answer-typing: 입력 필드가 포커스를 받았을 때 적용되는 강조 스타일
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

        // 답변 입력 필드에 포커스 이벤트 리스너 추가
        this.elements.answer.addEventListener('focus', () => {
            this.elements.answer.classList.add('answer-typing');

            // anime.js 를 사용하여 입력필드의 테두리와 금림자를 변화하는 애니메이션 추가
            if (this.isAnimeAvailable && this.elements.answer.parentElement) {
                this.state.typingAnimation = anime({
                    targets: this.elements.answer,
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
            }
        });

        // 답변 입력 필드에 포커스 해제(blur) 이벤트 처리
        this.elements.answer.addEventListener('blur', () => {
            this.elements.answer.classList.remove('answer-typing');

            if (this.isAnimeAvailable && this.state.typingAnimation) {
                this.state.typingAnimation.pause();

                anime({
                    targets: this.elements.answer,
                    boxShadow: '0 0 0 0 transparent',
                    borderColor: 'var(--outline-variant)',
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        });

        // 입력 이벤트 처리
        this.elements.answer.addEventListener('input', () => {
            if (!this.isAnimeAvailable) {
                return;
            }

            // 미세한 확대/축소 애니메이션
            anime({
                targets: this.elements.answer,
                scale: [1, 1.01, 1],
                duration: 100,
                easing: 'easeInOutQuad'
            });

            // 입력된 텍스트 길이에 따라 색상 변경
            if (this.elements.answer.value.length > 0) {
                const intensity = Math.min(this.elements.answer.value.length * 20, 100);
                this.elements.answer.style.color = `hsl(220, ${intensity}%, 40%)`;
            } else {
                this.elements.answer.style.color = '';
            }
        });
    }

    /**
     * 메시지 표시 애니메이션
     * @param {string} text - 표시할 메시지
     */
    showMessage(text) {
        this.elements.message.textContent = text;

        if (!this.isAnimeAvailable || !text || !this.elements.messageSection) {
            return;
        }

        if (this.state.animations.message) {
            this.state.animations.message.pause();
        }

        this.state.animations.message = anime({
            targets: this.elements.messageSection,
            backgroundColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)'],
            duration: 1500,
            easing: 'easeInOutQuad'
        });
    }

    /**
     * 연속 정답 애니메이션
     * @param {number} count - 연속 정답 수
     */
    streakAnimation(count) {
        if (!this.elements.perfectRun) {
            return;
        }

        this.elements.perfectRun.textContent = count.toString();

        if (!this.isAnimeAvailable) {
            return;
        }

        anime({
            targets: this.elements.perfectRun,
            scale: [1, 1.3, 1],
            translateY: [0, -10, 0],
            color: [
                'var(--on-surface, #1D1B20)',
                '#FFD700',
                'var(--on-surface, #1D1B20)'
            ],
            duration: 1000,
            easing: 'easeInOutQuad'
        });
    }

    /**
     * 정답 입력 애니메이션
     */
    playAnswerAnimation() {
        if (!this.isAnimeAvailable || !this.elements.answer) {
            return;
        }

        anime({
            targets: this.elements.answer,
            scale: [1, 1.05, 1],
            backgroundColor: [
                {value: 'rgba(var(--primary-rgb, 103, 80, 164), 0.1)', duration: 300},
                {value: 'rgba(var(--primary-rgb, 103, 80, 164), 0)', duration: 300}
            ],
            duration: 600,
            easing: 'easeInOutQuad'
        });
    }

    /**
     * 정답 효과 애니메이션
     */
    playCorrectAnimation() {
        if (!this.isAnimeAvailable || !this.elements.answer) {
            return;
        }

        anime({
            targets: this.elements.answer,
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
    }

    /**
     * 오답 효과 애니메이션
     */
    playIncorrectAnimation() {
        if (!this.isAnimeAvailable || !this.elements.answer) {
            return;
        }

        anime({
            targets: this.elements.answer,
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

    /**
     * 난이도 별 표시
     * @param {number} level - 난이도 레벨
     * @returns {string} 난이도에 따른 별 HTML
     */
    getDifficultyStars(level) {
        return '<i class="bi bi-star-fill"></i>'.repeat(level);
    }
}

/**
 * 음성 합성(TTS) 관리 클래스
 * 텍스트를 음성으로 변환하는 기능 제공
 */
class SpeechController {
    /** @type {StudyManager} */
    state;
    /** @type {DOMElements} */
    elements;
    /** @type {SpeechSynthesis} */
    synth;
    /** @type {AnimationController} */
    animation;

    constructor() {
        this.state = StudyManager.getInstance();
        this.elements = DOMElements.getInstance();
        this.synth = window.speechSynthesis;
        this.animation = new AnimationController();
    }

    /**
     * TTS 시스템 초기화
     */
    init() {
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.state.voices = this.synth.getVoices();
            };
        }

        this.state.voices = this.synth.getVoices();
    }

    /**
     * 영어 음성 가져오기
     * @returns {SpeechSynthesisVoice} 영어 음성
     */
    getEnglishVoice() {
        return this.state.voices.find(voice =>
            voice.lang.includes('en') &&
            (voice.lang.includes('US') || voice.lang.includes('GB'))
        ) || this.state.voices.find(voice => voice.lang.includes('en'));
    }

    /**
     * 텍스트를 음성으로 변환
     * @param {string} text - 음성으로 변환할 텍스트
     */
    speak(text) {
        if (this.state.speaking || !text) {
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const englishVoice = this.getEnglishVoice();

        if (englishVoice) utterance.voice = englishVoice;

        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onstart = () => this.handleSpeechStart();
        utterance.onend = () => this.handleSpeechEnd();
        utterance.onerror = (event) => this.handleSpeechError(event);

        this.synth.speak(utterance);
    }

    /**
     * 음성 재생 시작 핸들러
     */
    handleSpeechStart() {
        this.state.speaking = true;

        if (!this.elements.speakButton) {
            return;
        }

        if (typeof anime !== 'undefined') {
            this.state.animations.speak = anime({
                targets: this.elements.speakButton,
                scale: [1, 1.1, 1, 1.1, 1],
                backgroundColor: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)'],
                loop: true,
                duration: 1000,
                easing: 'easeInOutQuad'
            });
        } else {
            this.elements.speakButton.classList.add('speaking-animation');
        }
    }

    /**
     * 음성 재생 종료 핸들러
     */
    handleSpeechEnd() {
        this.state.speaking = false;

        if (!this.elements.speakButton) {
            return;
        }

        if (typeof anime !== 'undefined' && this.state.animations.speak) {
            this.state.animations.speak.pause();

            anime({
                targets: this.elements.speakButton,
                scale: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                duration: 300,
                easing: 'easeOutQuad'
            });
        } else {
            this.elements.speakButton.classList.remove('speaking-animation');
        }
    }

    /**
     * 음성 재생 오류 핸들러
     * @param {Event} event - 오류 이벤트
     */
    handleSpeechError(event) {
        console.error('TTS 에러 발생:', event);
        this.handleSpeechEnd();

        const ui = new UIController();
        ui.showMessage('TTS 재생 중 오류가 발생했습니다.');
    }
}

/**
 * UI 컨트롤러 클래스
 * 사용자 인터페이스 업데이트를 담당
 */
class UIController {

    /** @type {DOMElements} */
    elements;
    /** @type {StudyManager} */
    state;
    /** @type {AnimationController} */
    animation;

    constructor() {
        this.state = StudyManager.getInstance();
        this.elements = DOMElements.getInstance();
        this.animation = new AnimationController();
    }

    /**
     * 메시지 표시
     * @param {string} text - 표시할 메시지
     * @param {number} duration - 메시지 표시 지속 시간 (0: 계속 표시)
     */
    showMessage(text, duration = 0) {
        this.animation.showMessage(text);

        if (duration > 0) {
            setTimeout(() => {
                this.animation.showMessage('');
            }, duration);
        }
    }

    /**
     * 카드 초기화
     */
    resetCard() {
        this.animation.resetCard();
    }

    /**
     * 단어 표시 업데이트
     * @param {Object} word - 단어 객체
     */
    updateWordDisplay(word) {
        this.animation.newWordAnimation(word);

        if (this.elements.speakButton) {
            this.elements.speakButton.style.display = 'block';
        }

        this.resetCard();
    }

    /**
     * 정답 표시
     * @param {string} meaning - 단어의 의미
     */
    showCorrectAnswer(meaning) {
        this.elements.meaning.textContent = meaning;
        this.animation.flipCard();
        this.animation.playCorrectAnimation();
    }

    /**
     * 오답 표시
     */
    showIncorrectAnswer() {
        this.animation.shakeCard();
        this.animation.playIncorrectAnimation();
    }
}

/**
 * 학습 관리 클래스
 * 단어 학습 로직을 담당
 */
class StudyController {
    /** @type {StudyManager} */
    state;
    /** @type {DOMElements} */
    elements;
    /** @type {UIController} */
    ui;
    /** @type {ApiService} */
    api;
    /** @type {AnimationController} */
    animation;

    constructor() {
        this.state = StudyManager.getInstance();
        this.elements = DOMElements.getInstance();
        this.animation = new AnimationController();
        this.ui = new UIController();
    }


    async loadNewWord() {
        this.ui.resetCard();
        this.state.isProcessing = false;

        try {
            this.state.currentWord = await apiService.randomWord();
            this.ui.updateWordDisplay(this.state.currentWord);

            // 새 단어가 로드되면 자동으로 입력 필드에 포커스
            if (this.elements.answer) {
                setTimeout(() => {
                    this.elements.answer.focus();
                }, 500);
            }
        } catch (error) {
            console.error('단어 로드 에러:', error);
            this.ui.showMessage(error.message);
        }
    }

    async checkAnswer() {
        if (this.state.isProcessing) return;

        const userAnswer = this.elements.answer.value.trim();
        if (!userAnswer) {
            this.ui.showMessage('답을 입력해주세요.');
            return;
        }

        // 정답 확인 중복 방지 및 애니메이션 시작
        this.state.isProcessing = true;
        this.animation.playAnswerAnimation();

        try {
            const result = await apiService.checkAnswer(this.state.currentWord.id, userAnswer);
            this.ui.showMessage(result.message);
            this.animation.streakAnimation(result.perfectRun);

            if (result.correct) {
                this.handleCorrectAnswer();
            } else {
                this.ui.showIncorrectAnswer();
                this.elements.perfectRun.textContent = '0';
            }
        } catch (error) {
            console.error('정답 확인 중 오류:', error);
            this.ui.showMessage('정답 확인 중 오류가 발생했습니다.');
            this.state.isProcessing = false;
        }
    }

    handleCorrectAnswer() {
        this.ui.showCorrectAnswer(this.state.currentWord.meaning);
        setTimeout(() => this.loadNewWord(), 1500);
    }

    async showHint() {
        if (!this.state.currentWord) return;

        if (this.state.showingHint) {
            this.ui.showMessage('');
            this.state.showingHint = false;
            return;
        }

        try {
            const data = await apiService.fetchHint(this.state.currentWord.id);
            console.log(`힌트: ${data.hint}`);
            this.ui.showMessage(`힌트: ${data.hint}`);
            this.state.showingHint = true;
        } catch (error) {
            console.error('힌트 로드 중 오류:', error);
            this.ui.showMessage('힌트를 불러오는데 실패했습니다.');
        }
    }

}

/**
 * 이벤트 핸들러 클래스
 * 사용자 이벤트를 처리
 */
class EventHandler {
    /** @type {StudyManager} */
    state;
    /** @type {DOMElements} */
    elements;
    /** @type {StudyController} */
    study;
    /** @type {SpeechController} */
    speech;

    constructor() {
        this.state = StudyManager.getInstance();
        this.elements = DOMElements.getInstance();
        this.study = new StudyController();
        this.speech = new SpeechController();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 엔터키 입력 이벤트
        if (this.elements.answer) {
            this.elements.answer.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') this.study.checkAnswer();
            });
        }

        // 'p' 키 누를 때 발음 듣기
        document.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'p') {
                this.speech.speak(this.state.currentWord?.vocabulary);
            }
        });

        // TTS 버튼 클릭 이벤트
        if (this.elements.speakButton) {
            this.elements.speakButton.addEventListener('click', () => {
                this.speech.speak(this.state.currentWord?.vocabulary);
            });
        }

        // 힌트 버튼 클릭 이벤트
        if (this.elements.hintButton) {
            this.elements.hintButton.addEventListener('click', () => {
                this.study.showHint();
            });
        }

        // 정답 확인 버튼 클릭 이벤트
        if (this.elements.checkAnswerBtn) {
            this.elements.checkAnswerBtn.addEventListener('click', () => {
                this.study.checkAnswer();
            });
        }

        // 다음 단어 버튼 클릭 이벤트
        if (this.elements.nextButton) {
            this.elements.nextButton.addEventListener('click', () => {
                this.study.loadNewWord();
            });
        }

        // ESC 키 입력 시 입력 포커스 해제
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.elements.answer) {
                this.elements.answer.blur();
            }
        });
    }
}

class WordStudyApp {
    constructor() {
        this.state = StudyManager.getInstance();
        this.animation = new AnimationController();
        this.speech = new SpeechController();
        this.study = new StudyController();
        this.eventHandler = new EventHandler();
    }

    init() {

        // anime.js 로드 확인
        if (typeof anime === 'undefined') {
            console.warn('anime.js가 로드되지 않아 기본 애니메이션만 사용합니다.');
        } else {
            console.log('anime.js가 로드되었습니다. 고급 애니메이션을 사용합니다.');
            this.animation.init();
        }

        // 음성 합성 초기화
        this.speech.init();

        // 이벤트 리스너 설정
        this.eventHandler.setupEventListeners();

        // 첫 단어 로드
        this.study.loadNewWord();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new WordStudyApp();
    app.init();
});