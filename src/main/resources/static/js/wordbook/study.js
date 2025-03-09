/**
 * WordBookStudyApp - 단어장 학습 애플리케이션
 * 클래스 기반 구조로 구현된 단어장 학습 애플리케이션
 */
class WordBookStudyApp {
    /**
     * 생성자
     * 애플리케이션 상태 및 매니저 초기화
     */
    constructor() {

        const wordBookId = this.extractWordBookIdFromURL();
        // 상태 초기화
        this.state = {
            currentWords: [],       // 현재 학습할 단어 목록
            currentIndex: 0,        // 현재 학습 중인 단어 인덱스
            isProcessing: false,    // 정답 확인 중복 방지
            showingHint: false,     // 힌트 표시 여부
            speaking: false,        // TTS 재생 중인지 여부
            voices: [],             // 사용 가능한 음성 목록
            API_BASE_URL: '/api/v1/wordbooks', // API 기본 URL
            wordBookId: wordBookId || null,    // URL에서 받은 단어장 ID
            animations: {}          // 애니메이션 객체 저장
        };

        // DOM 요소 캐싱
        this.elements = {
            card: document.getElementById('card'),
            vocabulary: document.getElementById('vocabulary'),
            meaning: document.getElementById('meaning'),
            difficulty: document.getElementById('difficulty'),
            answer: document.getElementById('answer'),
            message: document.getElementById('message'),
            perfectRun: document.getElementById('perfectRun'),
            progress: document.getElementById('progress'),
            repeatMode: document.getElementById('repeatMode'),
            speakButton: document.querySelector('.btn-speak'),
            contentContainer: document.querySelector('.content-container'),
            controlButtons: document.querySelectorAll('.control-section .btn-surface'),
            checkButton: document.querySelector('.input-group .btn-add_word')
        };

        // 매니저 초기화
        this.uiManager = new UIManager(this.elements, this.state);
        this.speechManager = new SpeechManager(this.elements, this.state);
        this.apiService = new ApiService(this.state);
        this.studyManager = new StudyManager(this.elements, this.state, this.uiManager, this.apiService);
        this.animationManager = new AnimationManager(this.elements, this.state);
    }

    /**
     * URL에서 단어장 ID 추출
     * 형식: /wordbook/{id}/study
     * @returns {number|null} 추출된 단어장 ID 또는 null
     */
    extractWordBookIdFromURL() {
        const path = window.location.pathname;
        const match = path.match(/\/wordbook\/(\d+)\/study/);

        if (match && match[1]) {
            console.log(`URL에서 단어장 ID 추출: ${match[1]}`);
            return parseInt(match[1]);
        }

        console.warn('URL에서 단어장 ID를 추출할 수 없습니다.');
        return null;
    }

    /**
     * 애플리케이션 초기화
     */
    async initialize() {
        console.log("단어장 학습 애플리케이션 초기화 중...");

        // 단어장 ID 확인
        if (!this.state.wordBookId) {
            console.error("단어장 ID가 없습니다. 학습을 시작할 수 없습니다.");
            alert("단어장 ID가 필요합니다. 단어장 목록 페이지로 이동합니다.");
            window.location.href = "/wordbook/list";
            return;
        }

        console.log(`단어장 ID: ${this.state.wordBookId} 학습 시작`);

        // anime.js 로드 확인
        if (typeof anime === 'undefined') {
            console.warn('anime.js가 로드되지 않았습니다. 기본 애니메이션만 사용합니다.');
        } else {
            console.log('anime.js가 로드되었습니다. 고급 애니메이션을 사용합니다.');
            this.animationManager.initAnimations();
        }

        // 음성 합성 초기화
        this.speechManager.init();

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 단어 데이터 로드
        try {
            await this.studyManager.loadWords();
            console.log("단어 로드 완료");
        } catch (error) {
            console.error("단어 로드 실패:", error);
        }

        console.log("단어장 학습 애플리케이션 초기화 완료");
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 엔터 키로 정답 확인
        this.elements.answer.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.studyManager.checkAnswer();
            }
        });

        // P 키로 발음 듣기
        document.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'p') {
                if (this.state.currentWords.length > 0) {
                    const word = this.state.currentWords[this.state.currentIndex];
                    this.speechManager.speak(word.vocabulary);
                }
            }
        });

        // ESC 키로 입력 필드 포커스 해제
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.elements.answer.blur();
            }
        });

        // 발음 듣기 버튼
        this.elements.speakButton.addEventListener('click', () => {
            if (this.state.currentWords.length > 0) {
                const word = this.state.currentWords[this.state.currentIndex];
                this.speechManager.speak(word.vocabulary);
            }
        });

        // 정답 확인 버튼
        if (this.elements.checkButton) {
            this.elements.checkButton.addEventListener('click', () => {
                this.studyManager.checkAnswer();
            });
        }

        // 이전, 힌트, 다음 버튼
        if (this.elements.controlButtons.length === 3) {
            // 이전 단어 버튼
            this.elements.controlButtons[0].addEventListener('click', () => {
                this.studyManager.previousWord();
            });

            // 힌트 버튼
            this.elements.controlButtons[1].addEventListener('click', () => {
                this.studyManager.showHint();
            });

            // 다음 단어 버튼
            this.elements.controlButtons[2].addEventListener('click', () => {
                this.studyManager.nextWord();
            });
        }
    }


}

/**
 * UIManager - UI 업데이트 및 관리 클래스
 */
class UIManager {
    /**
     * 생성자
     * @param {Object} elements - DOM 요소 참조
     * @param {Object} state - 애플리케이션 상태
     */
    constructor(elements, state) {
        this.elements = elements;
        this.state = state;
    }

    /**
     * 메시지 표시
     * @param {string} text - 표시할 메시지 텍스트
     * @param {number} duration - 표시 기간 (0: 영구, 양수: 밀리초)
     */
    showMessage(text, duration = 0) {
        this.elements.message.textContent = text;

        if (duration > 0) {
            setTimeout(() => {
                this.elements.message.textContent = '';
            }, duration);
        }
    }

    /**
     * 카드 초기화
     */
    resetCard() {
        this.elements.card.classList.remove('flip');
        this.elements.meaning.textContent = '';
        this.elements.answer.value = '';
        this.elements.message.textContent = '';
    }

    /**
     * 단어 표시 업데이트
     * @param {Object} word - 단어 객체
     */
    updateWordDisplay(word) {
        this.elements.vocabulary.textContent = word.vocabulary;
        this.elements.difficulty.innerHTML = this.getDifficultyStars(word.difficulty);
        this.resetCard();
    }

    /**
     * 진행 상태 업데이트
     */
    updateProgress() {
        this.elements.progress.textContent = `${this.state.currentIndex + 1} / ${this.state.currentWords.length}`;
    }

    /**
     * 정답 표시
     * @param {string} meaning - 단어 의미
     */
    showCorrectAnswer(meaning) {
        this.elements.meaning.textContent = meaning;
        this.elements.card.classList.add('flip');
    }

    /**
     * 난이도 별표 HTML 생성
     * @param {number} level - 난이도 레벨
     * @returns {string} 별표 HTML
     */
    getDifficultyStars(level) {
        return '<i class="bi bi-star-fill"></i>'.repeat(level);
    }
}

/**
 * SpeechManager - TTS 음성 합성 관리 클래스
 */
class SpeechManager {
    /**
     * 생성자
     * @param {Object} elements - DOM 요소 참조
     * @param {Object} state - 애플리케이션 상태
     */
    constructor(elements, state) {
        this.elements = elements;
        this.state = state;
        this.synth = window.speechSynthesis;
    }

    /**
     * 음성 합성 시스템 초기화
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
     * 영어 음성 찾기
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
     * @param {string} text - 발음할 텍스트
     */
    speak(text) {
        if (this.state.speaking || !text) return;

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
        this.elements.speakButton.classList.add('speaking-animation');
    }

    /**
     * 음성 재생 종료 핸들러
     */
    handleSpeechEnd() {
        this.state.speaking = false;
        this.elements.speakButton.classList.remove('speaking-animation');
    }

    /**
     * 음성 재생 오류 핸들러
     * @param {Event} event - 오류 이벤트
     */
    handleSpeechError(event) {
        console.error('TTS 에러 발생:', event);
        this.handleSpeechEnd();

        const uiManager = new UIManager(this.elements, this.state);
        uiManager.showMessage('TTS 재생 중 오류가 발생했습니다.', 2000);
    }
}

/**
 * ApiService - API 통신 클래스
 */
class ApiService {
    /**
     * 생성자
     * @param {Object} state - 애플리케이션 상태
     */
    constructor(state) {
        this.state = state;
    }

    /**
     * 단어장의 단어 데이터 가져오기
     * @returns {Promise<Array>} 단어 데이터 배열
     */
    async fetchWords() {
        if (!this.state.wordBookId) {
            throw new Error('단어장 ID가 없습니다.');
        }

        const response = await fetch(`${this.state.API_BASE_URL}/${this.state.wordBookId}/study`);

        if (!response.ok) {
            throw new Error(`단어를 불러오는데 실패했습니다 (${response.status})`);
        }

        return response.json();
    }
}

/**
 * StudyManager - 학습 로직 관리 클래스
 */
class StudyManager {
    /**
     * 생성자
     * @param {Object} elements - DOM 요소 참조
     * @param {Object} state - 애플리케이션 상태
     * @param {UIManager} uiManager - UI 관리자
     * @param {ApiService} apiService - API 서비스
     */
    constructor(elements, state, uiManager, apiService) {
        this.elements = elements;
        this.state = state;
        this.uiManager = uiManager;
        this.apiService = apiService;
        this.animationManager = new AnimationManager(elements, state);
    }

    /**
     * 단어 목록 섞기 (Fisher-Yates 알고리즘)
     */
    shuffleWords() {
        for (let i = this.state.currentWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.state.currentWords[i], this.state.currentWords[j]] =
                [this.state.currentWords[j], this.state.currentWords[i]];
        }
    }

    /**
     * 단어 데이터 로드
     */
    async loadWords() {
        this.uiManager.showMessage('단어를 불러오는 중입니다...', 0);
        this.state.isProcessing = true;

        try {
            this.state.currentWords = await this.apiService.fetchWords();

            if (!this.state.currentWords || this.state.currentWords.length === 0) {
                throw new Error('학습할 단어가 없습니다');
            }

            this.shuffleWords();
            this.state.currentIndex = 0;
            this.showCurrentWord();
            this.uiManager.showMessage('');

            // 단어 로드 완료 애니메이션
            this.animationManager.animateContentLoad();
        } catch (error) {
            console.error('단어 로드 에러:', error);
            this.uiManager.showMessage(error.message || '단어를 불러오는데 실패했습니다');

            // 오류 상태 표시
            this.elements.vocabulary.innerHTML = `<i class="bi bi-exclamation-triangle"></i> 오류 발생`;
            this.animationManager.animateError();
        } finally {
            this.state.isProcessing = false;
        }
    }

    /**
     * 현재 단어 표시
     */
    showCurrentWord() {
        if (!this.state.currentWords || this.state.currentWords.length === 0) return;

        const word = this.state.currentWords[this.state.currentIndex];
        this.uiManager.updateWordDisplay(word);
        this.uiManager.updateProgress();

        // 애니메이션 추가
        this.animationManager.animateNewWord();
    }

    /**
     * 정답 확인
     */
    checkAnswer() {
        if (this.state.isProcessing) {
            console.log("처리 중입니다. 잠시만 기다려주세요.");
            return;
        }

        const userAnswer = this.elements.answer.value.trim();
        if (!userAnswer) {
            this.uiManager.showMessage('답을 입력해주세요.');
            this.animationManager.animateInputError();
            return;
        }

        this.state.isProcessing = true;
        const word = this.state.currentWords[this.state.currentIndex];
        const isCorrect = this.validateAnswer(word.meaning, userAnswer);

        if (isCorrect) {
            this.handleCorrectAnswer(word);
        } else {
            this.handleIncorrectAnswer();
        }
    }

    /**
     * 정답 처리
     * @param {Object} word - 현재 단어 객체
     */
    handleCorrectAnswer(word) {
        this.uiManager.showMessage('정답입니다!');
        this.uiManager.showCorrectAnswer(word.meaning);

        // 연속 정답 카운트 증가
        const currentStreak = parseInt(this.elements.perfectRun.textContent) + 1;
        this.elements.perfectRun.textContent = currentStreak.toString();

        // 정답 애니메이션
        this.animationManager.animateCorrectAnswer(currentStreak);

        // 다음 단어로 전환 타이머
        setTimeout(() => {
            if (this.state.currentIndex === this.state.currentWords.length - 1) {
                this.handleLastWord();
            } else {
                this.nextWord();
            }

            this.state.isProcessing = false;
        }, 1500);
    }

    /**
     * 마지막 단어 처리
     */
    handleLastWord() {
        if (this.elements.repeatMode.checked) {
            this.shuffleWords();
            this.state.currentIndex = 0;
            this.showCurrentWord();
            this.uiManager.showMessage('모든 단어를 학습했습니다. 다시 시작합니다.', 2000);
        } else {
            this.animationManager.animateStudyComplete(() => {
                alert('모든 단어를 학습했습니다! 메인 페이지로 이동합니다.');
                window.location.href = '/word/dashboard';
            });
        }
    }

    /**
     * 오답 처리
     */
    handleIncorrectAnswer() {
        this.uiManager.showMessage('틀렸습니다. 다시 시도해보세요.');
        this.elements.perfectRun.textContent = '0';

        // 오답 애니메이션
        this.animationManager.animateIncorrectAnswer(() => {
            this.state.isProcessing = false;
        });
    }

    /**
     * 정답 검증
     * @param {string} correctMeaning - 정답 의미
     * @param {string} userAnswer - 사용자 입력 답안
     * @returns {boolean} 정답 여부
     */
    validateAnswer(correctMeaning, userAnswer) {
        return correctMeaning.toLowerCase().split(',')
            .map(meaning => meaning.trim())
            .includes(userAnswer.toLowerCase().trim());
    }

    /**
     * 이전 단어로 이동
     */
    previousWord() {
        if (this.state.isProcessing) return;

        if (this.state.currentIndex > 0) {
            this.state.currentIndex--;
            this.animationManager.animateCardTransition(() => {
                this.showCurrentWord();
            });
        } else {
            this.animationManager.animateBounce(this.elements.controlButtons[0]);
        }
    }

    /**
     * 다음 단어로 이동
     */
    nextWord() {
        if (this.state.currentIndex < this.state.currentWords.length - 1) {
            this.state.currentIndex++;
            this.animationManager.animateCardTransition(() => {
                this.showCurrentWord();
            });
        } else if (this.elements.repeatMode.checked) {
            this.shuffleWords();
            this.state.currentIndex = 0;
            this.animationManager.animateCardTransition(() => {
                this.showCurrentWord();
            });
        } else {
            this.animationManager.animateBounce(this.elements.controlButtons[2]);
        }
    }

    /**
     * 힌트 표시
     */
    showHint() {
        if (this.state.isProcessing) return;
        if (!this.state.currentWords || this.state.currentWords.length === 0) return;

        if (this.state.showingHint) {
            this.uiManager.showMessage('');
            this.state.showingHint = false;
            return;
        }

        const word = this.state.currentWords[this.state.currentIndex];
        if (word.hint) {
            this.uiManager.showMessage(`힌트: ${word.hint}`);
            this.state.showingHint = true;
            this.animationManager.animateHintReveal();
        } else {
            this.uiManager.showMessage('힌트가 없습니다.', 1500);
            this.animationManager.animateNoHint();
        }
    }
}

/**
 * AnimationManager - 애니메이션 관리 클래스
 */
class AnimationManager {
    /**
     * 생성자
     * @param {Object} elements - DOM 요소 참조
     * @param {Object} state - 애플리케이션 상태
     */
    constructor(elements, state) {
        this.elements = elements;
        this.state = state;
        this.animeAvailable = typeof anime !== 'undefined';
    }

    /**
     * 애니메이션 초기화
     */
    initAnimations() {
        if (!this.animeAvailable) return;

        // 페이지 로드 애니메이션
        this.animateContentLoad();
    }

    /**
     * 콘텐츠 로드 애니메이션
     */
    animateContentLoad() {
        if (!this.animeAvailable) return;

        anime.set(this.elements.contentContainer, {
            opacity: 0,
            translateY: 20
        });

        anime({
            targets: this.elements.contentContainer,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            easing: 'easeOutCubic'
        });
    }

    /**
     * 새 단어 애니메이션
     */
    animateNewWord() {
        if (!this.animeAvailable) return;

        anime({
            targets: this.elements.vocabulary,
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 600,
            easing: 'easeOutCubic'
        });

        anime({
            targets: this.elements.difficulty,
            opacity: [0, 1],
            duration: 600,
            delay: 200,
            easing: 'easeOutCubic'
        });
    }

    /**
     * 정답 애니메이션
     * @param {number} streakCount - 연속 정답 수
     */
    animateCorrectAnswer(streakCount) {
        if (!this.animeAvailable) return;

        // 카드 플립 애니메이션
        this.state.animations.flip = anime({
            targets: this.elements.card,
            rotateY: '180deg',
            duration: 800,
            easing: 'easeInOutQuad'
        });

        // 연속 정답 카운트 애니메이션
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

        // 입력 필드 애니메이션
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
     * 오답 애니메이션
     * @param {Function} callback - 애니메이션 완료 후 콜백
     */
    animateIncorrectAnswer(callback) {
        if (!this.animeAvailable) {
            this.elements.card.classList.add('shake');
            setTimeout(() => {
                this.elements.card.classList.remove('shake');
                if (callback) callback();
            }, 500);
            return;
        }

        // 카드 흔들림 애니메이션
        anime({
            targets: this.elements.card,
            translateX: [
                {value: -10, duration: 100, easing: 'easeInOutQuad'},
                {value: 10, duration: 100, easing: 'easeInOutQuad'},
                {value: -10, duration: 100, easing: 'easeInOutQuad'},
                {value: 10, duration: 100, easing: 'easeInOutQuad'},
                {value: 0, duration: 100, easing: 'easeInOutQuad'}
            ],
            duration: 500,
            complete: callback
        });

        // 입력 필드 애니메이션
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
     * 카드 전환 애니메이션
     * @param {Function} callback - 전환 완료 후 콜백
     */
    animateCardTransition(callback) {
        if (!this.animeAvailable) {
            if (callback) callback();
            return;
        }

        anime({
            targets: this.elements.card,
            opacity: [1, 0],
            translateX: [0, -30],
            scale: [1, 0.97],
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                if (callback) callback();
                anime({
                    targets: this.elements.card,
                    opacity: [0, 1],
                    translateX: [30, 0],
                    scale: [0.97, 1],
                    duration: 400,
                    easing: 'easeOutQuad'
                });
            }
        });
    }

    /**
     * 입력 오류 애니메이션
     */
    animateInputError() {
        if (!this.animeAvailable) return;

        anime({
            targets: this.elements.answer,
            translateX: [0, -5, 5, -5, 5, 0],
            duration: 400,
            easing: 'easeInOutSine'
        });
    }

    /**
     * 힌트 표시 애니메이션
     */
    animateHintReveal() {
        if (!this.animeAvailable) return;

        anime({
            targets: this.elements.message,
            backgroundColor: ['transparent', 'rgba(var(--primary-rgb, 103, 80, 164), 0.1)', 'transparent'],
            duration: 1500,
            easing: 'easeInOutQuad'
        });
    }

    /**
     * 힌트 없음 애니메이션
     */
    animateNoHint() {
        if (!this.animeAvailable) return;

        anime({
            targets: this.elements.controlButtons[1],
            rotate: [0, -5, 5, -5, 0],
            duration: 500,
            easing: 'easeInOutSine'
        });
    }

    /**
     * 바운스 애니메이션
     * @param {HTMLElement} element - 애니메이션 적용할 요소
     */
    animateBounce(element) {
        if (!this.animeAvailable) return;

        anime({
            targets: element,
            scale: [1, 0.9, 1],
            duration: 400,
            easing: 'easeInOutSine'
        });
    }

    /**
     * 오류 애니메이션
     */
    animateError() {
        if (!this.animeAvailable) return;

        anime({
            targets: this.elements.vocabulary,
            color: ['#e74c3c', 'var(--on-primary-container)'],
            duration: 1000,
            direction: 'alternate',
            loop: 2,
            easing: 'easeInOutSine'
        });
    }

    /**
     * 학습 완료 애니메이션
     * @param {Function} callback - 애니메이션 완료 후 콜백
     */
    animateStudyComplete(callback) {
        if (!this.animeAvailable) {
            if (callback) callback();
            return;
        }

        anime({
            targets: this.elements.contentContainer,
            opacity: [1, 0],
            translateY: [0, -20],
            duration: 800,
            easing: 'easeOutQuad',
            complete: callback
        });
    }
}

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    const app = new WordBookStudyApp();
    app.initialize();
});