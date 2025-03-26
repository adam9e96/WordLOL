/**
 * WordBookStudyApp - 단어장 학습 애플리케이션
 */
class WordBookStudyApp {
    /**
     * 생성자
     * 애플리케이션 상태 및 매니저 초기화
     */
    constructor() {
        // 단어장 ID 가져오기
        this.wordBookId = window.wordBookId || this.extractWordBookIdFromURL();

        // 상태 초기화
        this.state = {
            currentWords: [],       // 현재 학습할 단어 목록
            currentIndex: 0,        // 현재 학습 중인 단어 인덱스
            isProcessing: false,    // 정답 확인 중복 방지
            showingHint: false,     // 힌트 표시 여부
            speaking: false,        // TTS 재생 중인지 여부
            voices: [],             // 사용 가능한 음성 목록
            API_BASE_URL: '/api/v1/wordbooks', // API 기본 URL
            wordBookId: this.wordBookId,    // 단어장 ID
            animations: {},         // 애니메이션 객체 저장
            uiLoaded: false         // UI 로드 상태
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
            contentContainer: document.querySelector('.content-container') || document.querySelector('.study-container'),
            checkButton: document.querySelector('.btn-check-answer') || document.getElementById('checkAnswerBtn'),
            controlButtons: document.querySelectorAll('.control-section .btn-surface') || document.querySelectorAll('.control-section button')
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
        if (typeof anime !== 'undefined') {
            console.log('anime.js가 로드되었습니다. 고급 애니메이션을 사용합니다.');
            // 초기 UI 로드 애니메이션 바로 시작 (깜빡임 방지)
            this.animationManager.preloadUI();
        } else {
            console.warn('anime.js가 로드되지 않았습니다. 기본 애니메이션만 사용합니다.');
        }

        // 음성 합성 초기화
        this.speechManager.init();

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 단어 데이터 로드
        try {
            await this.studyManager.loadWords();
            console.log("단어 로드 완료");

            // UI 로드 상태 업데이트
            this.state.uiLoaded = true;
            this.animationManager.revealUI();
        } catch (error) {
            console.error("단어 로드 실패:", error);
            this.animationManager.revealUIWithError();
        }

        console.log("단어장 학습 애플리케이션 초기화 완료");
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 엔터 키로 정답 확인
        if (this.elements.answer) {
            this.elements.answer.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.studyManager.checkAnswer();
                }
            });
        }

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
            if (event.key === 'Escape' && this.elements.answer) {
                this.elements.answer.blur();
            }
        });

        // 발음 듣기 버튼
        if (this.elements.speakButton) {
            this.elements.speakButton.addEventListener('click', () => {
                if (this.state.currentWords.length > 0) {
                    const word = this.state.currentWords[this.state.currentIndex];
                    this.speechManager.speak(word.vocabulary);
                }
            });
        }

        // 정답 확인 버튼
        if (this.elements.checkButton) {
            this.elements.checkButton.addEventListener('click', () => {
                this.studyManager.checkAnswer();
            });
        }

        // 컨트롤 버튼 이벤트 (이전, 힌트, 다음)
        if (this.elements.controlButtons && this.elements.controlButtons.length >= 3) {
            // 이전 버튼 (첫 번째 버튼 또는 버튼 클래스명에 arrow-left 아이콘이 있는 버튼)
            const prevButton = Array.from(this.elements.controlButtons).find(btn =>
                btn.querySelector('i.bi-arrow-left')
            ) || this.elements.controlButtons[0];

            if (prevButton) {
                prevButton.addEventListener('click', () => {
                    this.studyManager.previousWord();
                });
            }

            // 힌트 버튼 (두 번째 또는 버튼 클래스명에 hint 포함된 버튼)
            const hintButton = Array.from(this.elements.controlButtons).find(btn =>
                btn.classList.contains('btn-hint') ||
                btn.querySelector('i.bi-lightbulb')
            ) || this.elements.controlButtons[1];

            if (hintButton) {
                hintButton.addEventListener('click', () => {
                    this.studyManager.showHint();
                });
            }

            // 다음 단어 버튼 (마지막 버튼 또는 버튼 클래스명에 next가 포함된 버튼)
            const nextButton = Array.from(this.elements.controlButtons).find(btn =>
                btn.classList.contains('next-word-button') ||
                btn.id === 'nextRandomWord' ||
                btn.querySelector('i.bi-arrow-right')
            ) || this.elements.controlButtons[2];

            if (nextButton) {
                nextButton.addEventListener('click', () => {
                    this.studyManager.nextWord();
                });
            }
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
        if (!this.elements.message) return;

        this.elements.message.textContent = text;

        if (duration > 0) {
            setTimeout(() => {
                if (this.elements.message) {
                    this.elements.message.textContent = '';
                }
            }, duration);
        }
    }

    /**
     * 카드 초기화
     */
    resetCard() {
        // CSS 클래스를 먼저 제거하여 카드 뒤집기 상태 초기화
        if (this.elements.card) {
            this.elements.card.classList.remove('flip');
        }

        // 애니메이션 객체가 있다면 정리
        if (this.animeAvailable && this.state.animations.flip) {
            this.state.animations.flip.pause();
            this.state.animations.flip = null;
        }

        // 내용 초기화는 약간 지연시켜 애니메이션과 동기화
        setTimeout(() => {
            if (this.elements.meaning) {
                this.elements.meaning.textContent = '';
            }
            if (this.elements.answer) {
                this.elements.answer.value = '';
            }
            if (this.elements.message) {
                this.elements.message.textContent = '';
            }
        }, 300); // 카드가 다시 뒤집히는 시간의 절반 정도로 설정
    }

    /**
     * 단어 표시 업데이트
     * @param {Object} word - 단어 객체
     */
    updateWordDisplay(word) {
        if (!word) return;

        if (this.elements.vocabulary) {
            this.elements.vocabulary.textContent = word.vocabulary;
        }

        if (this.elements.difficulty) {
            this.elements.difficulty.innerHTML = this.getDifficultyStars(word.difficulty);
        }

        this.resetCard();
    }

    /**
     * 진행 상태 업데이트
     */
    updateProgress() {
        if (this.elements.progress) {
            this.elements.progress.textContent = `${this.state.currentIndex + 1} / ${this.state.currentWords.length}`;
        }
    }

    /**
     * 정답 표시
     * @param {string} meaning - 단어 의미
     */
    showCorrectAnswer(meaning) {
        if (this.elements.meaning) {
            this.elements.meaning.textContent = meaning;
        }

        if (this.elements.card) {
            this.elements.card.classList.add('flip');
        }
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
        if (this.synth && this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.state.voices = this.synth.getVoices();
            };
        }

        if (this.synth) {
            this.state.voices = this.synth.getVoices();
        }
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
        if (!this.synth || this.state.speaking || !text) return;

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
        if (this.elements.speakButton) {
            this.elements.speakButton.classList.add('speaking-animation');
        }
    }

    /**
     * 음성 재생 종료 핸들러
     */
    handleSpeechEnd() {
        this.state.speaking = false;
        if (this.elements.speakButton) {
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

        try {
            const response = await fetch(`${this.state.API_BASE_URL}/${this.state.wordBookId}/study`);

            if (!response.ok) {
                throw new Error(`단어를 불러오는데 실패했습니다 (${response.status})`);
            }

            return response.json();
        } catch (error) {
            console.error('API 호출 중 오류:', error);
            throw new Error('서버에서 단어를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
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

            return this.state.currentWords;
        } catch (error) {
            console.error('단어 로드 에러:', error);
            this.uiManager.showMessage(error.message || '단어를 불러오는데 실패했습니다');

            // 오류 상태 표시
            if (this.elements.vocabulary) {
                this.elements.vocabulary.innerHTML = `<i class="bi bi-exclamation-triangle"></i> 오류 발생`;
            }

            this.animationManager.animateError();
            throw error;
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

        // 입력 필드 포커스
        setTimeout(() => {
            if (this.elements.answer) {
                this.elements.answer.focus();
            }
        }, 300);
    }

    /**
     * 정답 확인
     */
    checkAnswer() {
        if (this.state.isProcessing) {
            console.log("처리 중입니다. 잠시만 기다려주세요.");
            return;
        }

        if (!this.elements.answer) return;

        const userAnswer = this.elements.answer.value.trim();
        if (!userAnswer) {
            this.uiManager.showMessage('답을 입력해주세요.');
            this.animationManager.animateInputError();
            return;
        }

        this.state.isProcessing = true;

        if (!this.state.currentWords || this.state.currentWords.length === 0) {
            this.state.isProcessing = false;
            return;
        }

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
        const currentStreak = parseInt(this.elements.perfectRun ? this.elements.perfectRun.textContent : '0') + 1;
        if (this.elements.perfectRun) {
            this.elements.perfectRun.textContent = currentStreak.toString();
        }

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
        if (this.elements.repeatMode && this.elements.repeatMode.checked) {
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
        if (this.elements.perfectRun) {
            this.elements.perfectRun.textContent = '0';
        }

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
        if (!correctMeaning || !userAnswer) return false;

        return correctMeaning.toLowerCase().split(',')
            .map(meaning => meaning.trim())
            .includes(userAnswer.toLowerCase().trim());
    }

    /**
     * 이전 단어로 이동
     */
    previousWord() {
        console.log("이전 단어 메서드 호출됨");
        if (this.state.isProcessing) {
            console.log("처리 중, 작업 취소");
            return;
        }

        if (this.state.currentIndex > 0) {
            this.state.currentIndex--;
            console.log(`이전 단어로 이동: 인덱스 ${this.state.currentIndex}`);
            this.animationManager.animateCardTransition(() => {
                this.showCurrentWord();
            });
        } else {
            console.log("첫 번째 단어에 도달, 이동 불가");
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
        } else if (this.elements.repeatMode && this.elements.repeatMode.checked) {
            this.shuffleWords();
            this.state.currentIndex = 0;
            this.animationManager.animateCardTransition(() => {
                this.showCurrentWord();
            });
        } else {
            const lastButton = this.elements.controlButtons.length - 1;
            this.animationManager.animateBounce(this.elements.controlButtons[lastButton >= 0 ? lastButton : 0]);
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
     * 페이지 UI 사전 로드
     * 미리 불투명도와 위치를 설정하여 로딩 후 깜빡임 방지
     */
    preloadUI() {
        if (!this.animeAvailable) return;

        // 주요 컨테이너를 숨김 상태로 시작
        if (this.elements.contentContainer) {
            anime.set(this.elements.contentContainer, {
                opacity: 0
            });
        }

        // 카드 숨김
        if (this.elements.card) {
            anime.set(this.elements.card, {
                opacity: 0,
                scale: 0.9
            });
        }

        // 상태 섹션 숨김
        if (document.querySelector('.status-section')) {
            anime.set('.status-section', {
                opacity: 0,
                translateY: -10
            });
        }

        // 입력 섹션과 컨트롤 섹션 숨김
        if (document.querySelector('.input-section')) {
            anime.set('.input-section, .control-section', {
                opacity: 0,
                translateY: 10
            });
        }
    }

    /**
     * UI 요소들을 한 번에 표시하여 깜빡임 방지
     */
    revealUI() {
        if (!this.animeAvailable) return;

        // 모든 UI 요소 한 번에 표시 애니메이션
        anime.timeline({
            easing: 'easeOutQuad',
            duration: 600
        })
            .add({
                targets: this.elements.contentContainer,
                opacity: 1,
                delay: 100
            })
            .add({
                targets: '.status-section',
                opacity: 1,
                translateY: 0,
                duration: 500
            }, '-=400')
            .add({
                targets: this.elements.card,
                opacity: 1,
                scale: 1,
                duration: 600
            }, '-=400')
            .add({
                targets: '.input-section, .control-section, .message-section',
                opacity: 1,
                translateY: 0,
                delay: anime.stagger(100),
                duration: 500
            }, '-=400');
    }

    /**
     * 오류 메시지와 함께 UI 표시
     */
    revealUIWithError() {
        if (!this.animeAvailable) return;

        // 기본 UI 표시와 함께 오류 강조
        this.revealUI();

        // 오류 메시지 강조
        if (this.elements.message) {
            anime({
                targets: this.elements.message,
                backgroundColor: [
                    'rgba(255,0,0,0.2)',
                    'rgba(255,0,0,0.05)'
                ],
                duration: 2000,
                easing: 'easeOutQuad'
            });
        }
    }

    /**
     * 애니메이션 초기화
     */
    initAnimations() {
        if (!this.animeAvailable) return;

        // 이미 페이지 로드 시 preloadUI 호출로 대체
    }

    /**
     * 콘텐츠 로드 애니메이션
     */
    animateContentLoad() {
        if (!this.animeAvailable || this.state.uiLoaded) return;

        // UI가 이미 로드되어 있다면 추가 애니메이션 생략
        this.revealUI();
    }

    /**
     * 새 단어 애니메이션
     */
    animateNewWord() {
        if (!this.animeAvailable) return;

        anime.timeline({
            easing: 'easeOutCubic'
        })
            .add({
                targets: this.elements.vocabulary,
                opacity: [0, 1],
                translateY: [10, 0],
                duration: 600
            })
            .add({
                targets: this.elements.difficulty ? this.elements.difficulty.querySelectorAll('i') : [],
                opacity: [0, 1],
                scale: [0.5, 1],
                delay: anime.stagger(100),
                duration: 600,
                offset: '-=400'
            });
    }

    /**
     * 정답 애니메이션
     * @param {number} streakCount - 연속 정답 수
     */
    animateCorrectAnswer(streakCount) {
        if (!this.animeAvailable) {
            // anime.js가 없을 경우 단순히 클래스 추가로 카드 플립
            if (this.elements.card) {
                this.elements.card.classList.add('flip');
            }
            return;
        }

        // 카드 플립 애니메이션
        if (this.elements.card) {
            // 기존 애니메이션이 있으면 중지
            if (this.state.animations.flip) {
                this.state.animations.flip.pause();
            }

            // 클래스 기반 플립을 사용하고 애니메이션은 보조 효과로만 활용
            this.elements.card.classList.add('flip');

            // 부드러운 플립 효과 추가
            this.state.animations.flip = anime({
                targets: this.elements.card,
                scale: [0.98, 1],
                duration: 800,
                easing: 'easeOutElastic(1, 0.7)'
            });
        }

        // 연속 정답 카운트 애니메이션
        if (this.elements.perfectRun) {
            anime({
                targets: this.elements.perfectRun,
                scale: [1, 1.5, 1],
                translateY: [0, -15, 0],
                color: [
                    'var(--on-surface, #1D1B20)',
                    '#FFD700',
                    'var(--on-surface, #1D1B20)'
                ],
                duration: 1200,
                easing: 'easeInOutElastic(1, 0.6)'
            });
        }

        // 입력 필드 애니메이션
        if (this.elements.answer) {
            anime({
                targets: this.elements.answer,
                backgroundColor: [
                    {value: 'rgba(var(--success-rgb, 20, 151, 103), 0.3)', duration: 300},
                    {value: 'rgba(var(--success-rgb, 20, 151, 103), 0)', duration: 500}
                ],
                borderColor: [
                    {value: 'var(--success, #149767)', duration: 300},
                    {value: 'var(--outline-variant)', duration: 500}
                ],
                duration: 800,
                easing: 'easeOutQuad'
            });
        }

        // 메시지 섹션 애니메이션
        if (this.elements.message) {
            anime({
                targets: this.elements.message,
                backgroundColor: [
                    {value: 'rgba(var(--success-rgb, 20, 151, 103), 0.2)', duration: 300},
                    {value: 'transparent', duration: 800}
                ],
                scale: [1, 1.05, 1],
                duration: 1200,
                easing: 'easeOutElastic(1, 0.5)'
            });
        }
    }

    /**
     * 오답 애니메이션
     * @param {Function} callback - 애니메이션 완료 후 콜백
     */
    animateIncorrectAnswer(callback) {
        if (!this.animeAvailable) {
            if (this.elements.card) {
                this.elements.card.classList.add('shake');
                setTimeout(() => {
                    this.elements.card.classList.remove('shake');
                    if (callback) callback();
                }, 500);
            } else {
                if (callback) callback();
            }
            return;
        }

        // 카드 흔들림 애니메이션
        if (this.elements.card) {
            anime({
                targets: this.elements.card,
                translateX: [
                    {value: -10, duration: 100, easing: 'easeInOutQuad'},
                    {value: 10, duration: 100, easing: 'easeInOutQuad'},
                    {value: -8, duration: 100, easing: 'easeInOutQuad'},
                    {value: 8, duration: 100, easing: 'easeInOutQuad'},
                    {value: -5, duration: 100, easing: 'easeInOutQuad'},
                    {value: 0, duration: 100, easing: 'easeInOutQuad'}
                ],
                duration: 600,
                complete: callback
            });
        } else {
            if (callback) callback();
        }

        // 입력 필드 애니메이션
        if (this.elements.answer) {
            anime({
                targets: this.elements.answer,
                backgroundColor: [
                    {value: 'rgba(var(--error-rgb, 179, 38, 30), 0.3)', duration: 300},
                    {value: 'rgba(var(--error-rgb, 179, 38, 30), 0)', duration: 500}
                ],
                borderColor: [
                    {value: 'var(--error, #B3261E)', duration: 300},
                    {value: 'var(--outline-variant)', duration: 500}
                ],
                duration: 800,
                easing: 'easeOutQuad'
            });
        }

        // 메시지 섹션 애니메이션
        if (this.elements.message) {
            anime({
                targets: this.elements.message,
                backgroundColor: [
                    {value: 'rgba(var(--error-rgb, 179, 38, 30), 0.2)', duration: 300},
                    {value: 'transparent', duration: 800}
                ],
                scale: [1, 1.05, 1],
                duration: 1000,
                easing: 'easeOutElastic(1, 0.5)'
            });
        }
    }

    /**
     * 카드 전환 애니메이션
     * @param {Function} callback - 전환 완료 후 콜백
     */
    animateCardTransition(callback) {
        if (!this.animeAvailable || !this.elements.card) {
            if (callback) callback();
            return;
        }

        anime.timeline({
            easing: 'easeOutExpo'
        })
            .add({
                targets: this.elements.card,
                opacity: [1, 0],
                translateX: [0, -30],
                scale: [1, 0.97],
                duration: 300,
                easing: 'easeInQuad',
                complete: callback
            })
            .add({
                targets: this.elements.card,
                opacity: [0, 1],
                translateX: [30, 0],
                scale: [0.97, 1],
                duration: 600,
                easing: 'easeOutElastic(1, 0.5)'
            });
    }

    /**
     * 입력 오류 애니메이션
     */
    animateInputError() {
        if (!this.animeAvailable || !this.elements.answer) return;

        anime({
            targets: this.elements.answer,
            translateX: [0, -5, 5, -5, 5, 0],
            duration: 400,
            easing: 'easeInOutSine',
            borderColor: [
                {value: 'var(--error, #B3261E)', duration: 200},
                {value: 'var(--outline-variant)', duration: 200}
            ]
        });
    }

    /**
     * 힌트 표시 애니메이션
     */
    animateHintReveal() {
        if (!this.animeAvailable) return;

        if (this.elements.message) {
            anime.timeline({
                easing: 'easeOutQuad'
            })
                .add({
                    targets: this.elements.message,
                    backgroundColor: [
                        'transparent',
                        'rgba(var(--primary-rgb, 103, 80, 164), 0.15)',
                        'rgba(var(--primary-rgb, 103, 80, 164), 0.05)'
                    ],
                    scale: [1, 1.05, 1],
                    duration: 1000,
                    easing: 'easeOutElastic(1, 0.5)'
                });
        }

        // 힌트 버튼 강조
        const hintButton = Array.from(this.elements.controlButtons || []).find(btn =>
            btn.classList.contains('btn-hint') ||
            btn.querySelector('i.bi-lightbulb')
        );

        if (hintButton) {
            anime({
                targets: hintButton,
                scale: [1, 1.15, 1],
                backgroundColor: [
                    'var(--surface-container)',
                    'var(--primary-container)',
                    'var(--surface-container)'
                ],
                color: [
                    'var(--on-surface-variant)',
                    'var(--on-primary-container)',
                    'var(--on-surface-variant)'
                ],
                duration: 1200,
                easing: 'easeOutElastic(1, 0.5)'
            });
        }
    }

    /**
     * 힌트 없음 애니메이션
     */
    animateNoHint() {
        if (!this.animeAvailable) return;

        // 힌트 버튼 강조
        const hintButton = Array.from(this.elements.controlButtons || []).find(btn =>
            btn.classList.contains('btn-hint') ||
            btn.querySelector('i.bi-lightbulb')
        );

        if (hintButton) {
            anime({
                targets: hintButton,
                rotate: [0, -5, 5, -3, 3, 0],
                duration: 500,
                easing: 'easeInOutSine',
                backgroundColor: [
                    'var(--surface-container)',
                    'var(--error-container)',
                    'var(--surface-container)'
                ],
                color: [
                    'var(--on-surface-variant)',
                    'var(--on-error-container)',
                    'var(--on-surface-variant)'
                ],
            });
        }
    }

    /**
     * 바운스 애니메이션
     * @param {HTMLElement} element - 애니메이션 적용할 요소
     */
    animateBounce(element) {
        if (!this.animeAvailable || !element) return;

        anime({
            targets: element,
            scale: [1, 0.9, 1.05, 1],
            rotate: [0, -1, 1, 0],
            duration: 600,
            easing: 'easeInOutSine'
        });
    }

    /**
     * 오류 애니메이션
     */
    animateError() {
        if (!this.animeAvailable) return;

        if (this.elements.vocabulary) {
            anime({
                targets: this.elements.vocabulary,
                color: ['#e74c3c', 'var(--on-primary-container)'],
                duration: 1000,
                direction: 'alternate',
                loop: 2,
                easing: 'easeInOutSine'
            });
        }
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

        anime.timeline({
            easing: 'easeOutExpo'
        })
            .add({
                targets: this.elements.contentContainer,
                opacity: [1, 0],
                translateY: [0, -20],
                duration: 800,
                complete: callback
            })
            .add({
                targets: this.elements.perfectRun,
                scale: [1, 2, 1],
                color: [
                    'var(--on-surface, #1D1B20)',
                    '#FFD700',
                    'var(--on-surface, #1D1B20)'
                ],
                duration: 1200,
                offset: '-=800'
            });
    }
}

// 앱 인스턴스 생성 및 초기화
document.addEventListener('DOMContentLoaded', () => {
    const app = new WordBookStudyApp();
    app.initialize();
});

