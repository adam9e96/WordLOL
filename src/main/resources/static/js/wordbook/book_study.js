import animationService from '../utils/animation-service.js';
import apiService from '../utils/api-service.js';

class WordBookStudyApp {
    constructor() {
        // 단어장 ID 설정
        this.state = {
            currentWords: [],       // 현재 학습할 단어 목록
            currentIndex: 0,        // 현재 학습 중인 단어 인덱스
            isProcessing: false,    // 정답 확인 중복 방지
            showingHint: false,     // 힌트 표시 여부
            speaking: false,        // TTS 재생 중인지 여부
            wordBookId: window.wordBookId || this.extractWordBookIdFromURL(),
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
        this.studyManager = new StudyManager(this.state, this.elements, this.uiManager);
        this.speechManager = new SpeechManager(this.state, this.elements);
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
            window.showErrorToast("단어장 ID가 필요합니다.", {title: "오류"});

            setTimeout(() => {
                window.location.href = "/wordbook/list";
            }, 1500);
            return;
        }

        console.log(`단어장 ID: ${this.state.wordBookId} 학습 시작`);

        // 로딩 상태 표시
        window.showLoading(true);

        // 초기 UI 애니메이션
        animationService.fadeIn(this.elements.contentContainer, {
            duration: 600,
            delay: 100
        });

        // 음성 합성 초기화
        this.speechManager.init();

        // 이벤트 리스너 설정
        this.setupEventListeners();

        try {
            // 단어 데이터 로드
            await this.studyManager.loadWords();
            console.log("단어 로드 완료");

            // UI 로드 상태 업데이트
            this.state.uiLoaded = true;

            // 애니메이션 적용
            animationService.fadeIn('.status-section', {
                delay: 200,
                duration: 500
            });

            animationService.fadeIn(['.input-section', '.control-section', '.message-section'], {
                delay: anime.stagger(100),
                duration: 500
            });
        } catch (error) {
            console.error("단어 로드 실패:", error);
        } finally {
            window.showLoading(false);
            console.log("단어장 학습 애플리케이션 초기화 완료");
        }
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
            if (event.key.toLowerCase() === 'p' && this.state.currentWords.length > 0) {
                const word = this.state.currentWords[this.state.currentIndex];
                this.speechManager.speak(word.vocabulary);
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

            // 버튼에 리플 효과 추가
            animationService.ripple(this.elements.speakButton, {
                color: 'rgba(255, 255, 255, 0.5)'
            });
        }

        // 정답 확인 버튼
        if (this.elements.checkButton) {
            this.elements.checkButton.addEventListener('click', () => {
                this.studyManager.checkAnswer();
            });

            // 버튼에 리플 효과 추가
            animationService.ripple(this.elements.checkButton, {
                color: 'rgba(255, 255, 255, 0.3)'
            });
        }

        // 컨트롤 버튼 이벤트 (이전, 힌트, 다음)
        this.setupControlButtons();
    }

    /**
     * 컨트롤 버튼 설정
     */
    setupControlButtons() {
        if (!this.elements.controlButtons || this.elements.controlButtons.length < 3) return;

        // 이전 버튼 (첫 번째 버튼 또는 화살표 왼쪽 아이콘이 있는 버튼)
        const prevButton = Array.from(this.elements.controlButtons).find(btn =>
            btn.querySelector('i.bi-arrow-left')
        ) || this.elements.controlButtons[0];

        if (prevButton) {
            prevButton.addEventListener('click', () => this.studyManager.previousWord());
            animationService.ripple(prevButton);
        }

        // 힌트 버튼 (두 번째 또는 힌트 아이콘이 있는 버튼)
        const hintButton = Array.from(this.elements.controlButtons).find(btn =>
            btn.classList.contains('btn-hint') ||
            btn.querySelector('i.bi-lightbulb')
        ) || this.elements.controlButtons[1];

        if (hintButton) {
            hintButton.addEventListener('click', () => this.studyManager.showHint());
            animationService.ripple(hintButton);
        }

        // 다음 단어 버튼 (마지막 또는 화살표 오른쪽 아이콘이 있는 버튼)
        const nextButton = Array.from(this.elements.controlButtons).find(btn =>
            btn.classList.contains('next-word-button') ||
            btn.id === 'nextRandomWord' ||
            btn.querySelector('i.bi-arrow-right')
        ) || this.elements.controlButtons[2];

        if (nextButton) {
            nextButton.addEventListener('click', () => this.studyManager.nextWord());
            animationService.ripple(nextButton);
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
 * StudyManager - 학습 로직 관리 클래스
 */
class StudyManager {
    /**
     * 생성자
     * @param {Object} state - 애플리케이션 상태
     * @param {Object} elements - DOM 요소 참조
     * @param {UIManager} uiManager - UI 관리자
     */
    constructor(state, elements, uiManager) {
        this.state = state;
        this.elements = elements;
        this.uiManager = uiManager;
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
            // API 서비스를 통해 단어 데이터 로드
            this.state.currentWords = await apiService.fetchWordBookStudyData(this.state.wordBookId);

            if (!this.state.currentWords || this.state.currentWords.length === 0) {
                throw new Error('학습할 단어가 없습니다.');
            }

            this.shuffleWords();
            this.state.currentIndex = 0;
            this.showCurrentWord();
            this.uiManager.showMessage('');

            return this.state.currentWords;
        } catch (error) {
            console.error('단어 로드 에러:', error);

            // 토스트 서비스를 통한 에러 메시지 표시
            window.showErrorToast('단어를 불러오는데 실패했습니다.', {
                title: '로드 오류'
            });

            this.uiManager.showMessage(error.message || '단어를 불러오는데 실패했습니다.');

            // 오류 상태 표시
            if (this.elements.vocabulary) {
                this.elements.vocabulary.innerHTML = `<i class="bi bi-exclamation-triangle"></i> 오류 발생`;
            }

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

        // 완전히 초기화를 먼저 수행
        this.uiManager.resetCard();

        // 약간의 지연 후 UI 업데이트
        setTimeout(() => {
            this.uiManager.updateWordDisplay(word);
            this.uiManager.updateProgress();

            // 애니메이션 서비스 활용
            animationService.fadeIn(this.elements.vocabulary, {distance: 10});

            // 입력 필드 포커스
            if (this.elements.answer) {
                this.elements.answer.value = '';
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
            animationService.shake(this.elements.answer);
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

        // 토스트 메시지 표시
        window.showSuccessToast('정답입니다!', {title: '정답'});

        // 연속 정답 카운트 증가
        const currentStreak = parseInt(this.elements.perfectRun ? this.elements.perfectRun.textContent : '0') + 1;
        if (this.elements.perfectRun) {
            this.elements.perfectRun.textContent = currentStreak.toString();

            // 애니메이션 서비스 활용
            animationService.pulse(this.elements.perfectRun, {scale: 1.5});
        }

        // 애니메이션 서비스 활용 - 정답 효과
        if (this.elements.answer) {
            animationService.colorChange(this.elements.answer, 'backgroundColor',
                'rgba(var(--success-rgb, 20, 151, 103), 0.3)',
                'rgba(var(--success-rgb, 20, 151, 103), 0)',
                {duration: 800}
            );
        }

        // 다음 단어로 전환 타이머
        setTimeout(() => {
            // 여기에 카드 초기화 로직 추가
            this.uiManager.resetCard();

            // 약간의 지연 후 다음 단어 처리
            setTimeout(() => {
                if (this.state.currentIndex === this.state.currentWords.length - 1) {
                    this.handleLastWord();
                } else {
                    this.nextWord();
                }
                this.state.isProcessing = false;
            }, 300);
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
            window.showInfoToast('모든 단어를 학습했습니다. 다시 시작합니다.', {title: '학습 완료'});
        } else {
            // 애니메이션 서비스 활용
            animationService.fadeOut(this.elements.contentContainer, {
                duration: 800,
                complete: () => {
                    window.showSuccessToast('모든 단어 학습이 완료되었습니다!', {title: '학습 완료'});
                    setTimeout(() => {
                        window.location.href = '/word/dashboard';
                    }, 1000);
                }
            });
        }
    }

    /**
     * 오답 처리
     */
    handleIncorrectAnswer() {
        this.uiManager.showMessage('틀렸습니다. 다시 시도해보세요.');
        window.showErrorToast('틀렸습니다. 다시 시도해보세요.', {title: '오답'});

        if (this.elements.perfectRun) {
            this.elements.perfectRun.textContent = '0';
        }

        // 애니메이션 서비스 활용
        animationService.shake(this.elements.card);

        if (this.elements.answer) {
            animationService.colorChange(this.elements.answer, 'backgroundColor',
                'rgba(var(--error-rgb, 179, 38, 30), 0.3)',
                'rgba(var(--error-rgb, 179, 38, 30), 0)',
                {duration: 800}
            );
        }

        this.state.isProcessing = false;
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

// StudyManager 클래스의 nextWord 메서드 수정
    nextWord() {
        if (this.state.isProcessing) return;

        // 카드 뒤집기 상태 초기화
        if (this.elements.card) {
            this.elements.card.classList.remove('flip');
        }

        if (this.state.currentIndex < this.state.currentWords.length - 1) {
            this.state.currentIndex++;

            // 애니메이션 서비스 활용
            animationService.slideOut(this.elements.card, 'left', {
                duration: 300,
                complete: () => {
                    this.showCurrentWord();
                    animationService.slideIn(this.elements.card, 'right', {duration: 300});
                }
            });
        } else if (this.elements.repeatMode && this.elements.repeatMode.checked) {
            this.shuffleWords();
            this.state.currentIndex = 0;

            // 애니메이션 서비스 활용
            animationService.slideOut(this.elements.card, 'left', {
                duration: 300,
                complete: () => {
                    this.showCurrentWord();
                    animationService.slideIn(this.elements.card, 'right', {duration: 300});
                }
            });
        } else {
            // 마지막 단어일 경우 바운스 애니메이션
            const lastButton = this.elements.controlButtons.length - 1;
            animationService.pulse(this.elements.controlButtons[lastButton >= 0 ? lastButton : 0], {scale: 0.9});
        }
    }

// previousWord 메서드도 같은 방식으로 수정
    previousWord() {
        if (this.state.isProcessing) return;

        // 카드 뒤집기 상태 초기화
        if (this.elements.card) {
            this.elements.card.classList.remove('flip');
        }

        if (this.state.currentIndex > 0) {
            this.state.currentIndex--;

            // 애니메이션 서비스 활용
            animationService.slideOut(this.elements.card, 'right', {
                duration: 300,
                complete: () => {
                    this.showCurrentWord();
                    animationService.slideIn(this.elements.card, 'left', {duration: 300});
                }
            });
        } else {
            // 첫 번째 단어일 경우 바운스 애니메이션
            animationService.pulse(this.elements.controlButtons[0], {scale: 0.9});
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

            // 토스트 메시지로 힌트 표시
            window.showInfoToast(`힌트: ${word.hint}`, {title: '힌트'});

            this.state.showingHint = true;

            // 애니메이션 서비스 활용
            if (this.elements.message) {
                animationService.pulse(this.elements.message, {scale: 1.05});
            }

            // 힌트 버튼 애니메이션
            const hintButton = Array.from(this.elements.controlButtons).find(btn =>
                btn.querySelector('i.bi-lightbulb')
            ) || this.elements.controlButtons[1];

            if (hintButton) {
                animationService.pulse(hintButton, {scale: 1.1});
            }
        } else {
            this.uiManager.showMessage('힌트가 없습니다.', 1500);
            window.showInfoToast('힌트가 없습니다.', {title: '힌트 없음'});

            // 힌트 버튼 애니메이션
            const hintButton = Array.from(this.elements.controlButtons).find(btn =>
                btn.querySelector('i.bi-lightbulb')
            ) || this.elements.controlButtons[1];

            if (hintButton) {
                animationService.shake(hintButton, {intensity: 3});
            }
        }
    }
}

/**
 * SpeechManager - TTS 음성 합성 관리 클래스
 */
class SpeechManager {
    /**
     * 생성자
     * @param {Object} state - 애플리케이션 상태
     * @param {Object} elements - DOM 요소 참조
     */
    constructor(state, elements) {
        this.state = state;
        this.elements = elements;
        this.synth = window.speechSynthesis;
        this.voices = [];
    }

    /**
     * 음성 합성 시스템 초기화
     */
    init() {
        if (this.synth && this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
            };
        }

        if (this.synth) {
            this.voices = this.synth.getVoices();
        }
    }

    /**
     * 영어 음성 찾기
     * @returns {SpeechSynthesisVoice} 영어 음성
     */
    getEnglishVoice() {
        return this.voices.find(voice =>
            voice.lang.includes('en') &&
            (voice.lang.includes('US') || voice.lang.includes('GB'))
        ) || this.voices.find(voice => voice.lang.includes('en'));
    }

    /**
     * 텍스트를 음성으로 변환
     * @param {string} text - 발음할 텍스트
     */
    speak(text) {
        if (this.state.speaking || !text || !this.synth) return;

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
        window.showErrorToast('발음 재생 중 오류가 발생했습니다.', {title: 'TTS 오류'});
    }
}

// 문서가 로드되면 앱 인스턴스 생성 및 초기화
document.addEventListener('DOMContentLoaded', () => {
    const app = new WordBookStudyApp();
    app.initialize();
});