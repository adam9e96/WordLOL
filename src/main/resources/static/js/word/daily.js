import apiService from '../utils/api-service.js';

class DailyWordsApp {
    constructor() {

        this.elements = {
            loading: document.getElementById('loading'), // 로딩 스피너 요소
            wordCards: document.getElementById('word-cards'), // 단어 카드 컨테이너 요소
            container: document.querySelector('.word-cards-wrapper') // 단어 카드 래퍼 요소
        };

        // 애니메이션 상태 관리
        this.animations = {}; // 애니메이션 상태를 저장할 객체

        this.uiManager = new UIManager(this.elements);
        this.animationManager = new AnimationManager(this.elements, this.animations);
    }

    initialize() {
        // anime.js 로드 확인
        if (typeof anime === 'undefined') {
            console.error('anime.js가 로드되지 않았습니다. 스크립트를 추가해주세요.');
            // anime.js가 로드되지 않은 경우의 처리
        } else {
            console.log('anime.js가 로드되었습니다. 애니메이션 모드로 실행합니다.');
            this.animationManager.init();
        }

        // 오늘의 단어 로드
        this.loadDailyWords();

        // 윈도우 크기 변경 시 애니메이션 재조정
        window.addEventListener('resize', () => {
            if (this.animations.cards) {
                this.animations.cards.restart();
            }
        });
    }

    /**
     * 오늘의 단어 로드
     */
    async loadDailyWords() {
        try {
            this.uiManager.showLoading(); // 로딩 상태 표시
            this.animationManager.animateLoading(); // 로딩 애니메이션 실행
            const words = await apiService.fetchDailyWords();

            if (words.length === 0) {
                window.showErrorToast('단어를 찾을 수 없습니다.');
                return;
            }

            this.uiManager.renderWords(words); // 단어 카드 렌더링

            // 애니메이션 적용
            this.animationManager.animateWordCards(); // 단어 카드 애니메이션
            this.animationManager.setupCardHoverEffects(); // 카드 호버 효과 설정
            this.animationManager.animateStars(); // 별 애니메이션
        } catch (error) {
            console.error('단어 로딩 실패:', error); // 단어 로딩 실패 시 콘솔에 오류 출력
            window.showErrorToast('단어를 불러오는 중 오류가 발생했습니다.');
        } finally {
            this.uiManager.hideLoading();
        }
    }
}


/**
 * UI 관리 클래스
 * 이 클래스는 UI 요소의 상태를 관리하고, 로딩 상태, 오류 메시지, 단어 카드 렌더링 등의 기능을 제공합니다.
 */
class UIManager {
    constructor(elements) {
        this.elements = elements;
    }

    /**
     * 로딩 상태 표시
     * 1. 로딩 스피너를 표시하고,
     * 2. 단어 카드 컨테이너를 비우며,
     * 3. 오류 메시지를 숨김니다.
     */
    showLoading() {
        this.elements.loading.classList.remove('d-none');
        this.elements.wordCards.innerHTML = '';
    }

    /**
     * 로딩 상태 숨김
     * 로딩 스피너를 숨깁니다.
     */
    hideLoading() {
        this.elements.loading.classList.add('d-none');
    }

    /**
     * 난이도에 따른 별표 HTML 반환
     * @param {number} level - 난이도 레벨
     * @returns {string} - 별표 HTML
     * 난이도 레벨에 따라 별표 아이콘을 반복하여 반환합니다.
     */
    getDifficultyStars(level) {
        return '<i class="bi bi-star-fill"></i>'.repeat(level);
    }

    /**
     * 단어 카드 HTML 생성
     * @param {Object} word - 단어 객체
     * @param {number} index - 인덱스
     * @returns {string} - 카드 HTML
     * 단어 객체와 인덱스를 받아 단어 카드의 HTML 을 생성하여 반환합니다.
     * @todo 카드 클릭 시 단어 상세 페이지로 이동하는 기능 추가
     * @todo data-index 이해하기
     */
    createWordCard(word, index) {
        console.log(`Word: ${word}, Index: ${index}`);
        return `
        <div class="word-card" data-index="${index}">
          <div class="card-content">
            <div class="vocabulary">${word.vocabulary}</div>
            <div class="meaning">${word.meaning}</div>
            <div class="difficulty">${this.getDifficultyStars(word.difficulty)}</div>
          </div>
        </div>
      `;
    }

    /**
     * 단어 카드 렌더링
     * @param {Array} words - 단어 배열
     * 단어 배열을 받아 각 단어에 대해 단어 카드를 생성하고, 이를 단어 카드 컨테이너에 렌더링합니다.
     */
    renderWords(words) {
        this.elements.wordCards.innerHTML = words
            .map((word, index) => {
                console.log(`인덱스 별 단어 카드 렌더링 : ${index}:`, word); // 디버깅용 콘솔 출력
                return this.createWordCard(word, index);
            }).join('');
    }
}

/**
 * 애니메이션 관리 클래스
 */
class AnimationManager {
    /**
     * 생성자
     * @param {Object} elements - DOM 요소
     * @param {Object} animations - 애니메이션 상태 객체
     */
    constructor(elements, animations) {
        this.elements = elements;
        this.animations = animations;
    }


    init() {
        if (this.elements.container) {
            // 컨테이너의 초기 상태를 설정
            anime.set(this.elements.container, {
                opacity: 0, // 불투명도 0
                translateY: 30 // Y 축으로 30 픽셀 이동
            });

            // 페이드 인 애니메이션
            anime({
                targets: this.elements.container,
                opacity: 1, // 불투명도 1 (요쇼가 완전히 보이도록 설정)
                translateY: 0, // Y 축 위치를 0으로 설정하여 요소가 원래 위치로 이동
                duration: 800, // 애니메이션 지속 시간
                easing: 'easeOutCubic' // 애니메이션의 속도 변화를 조절하는 이징 함수
            });
        }
    }

    /**
     * 단어 카드 애니메이션
     */
    animateWordCards() {
        // 각 카드에 애니메이션 적용
        const cards = document.querySelectorAll('.word-card');
        if (cards.length === 0) return;

        // 초기 상태 설정
        anime.set(cards, {
            opacity: 0, // 투명도 0으로 설정
            translateY: 40, // Y 축으로 40px 이동
            scale: 0.9 // 크기를 0.9배로 축소
        });

        // 등장 애니메이션
        this.animations.cards = anime({
            targets: cards, // 애니메이션 대상
            opacity: [0, 1], // 투명도를 0에서 1로 변경
            translateY: [40, 0], // Y축 이동을 40px 에서 0으로 변경
            scale: [0.9, 1], // 크기를 0.9배에서 1배로 변경
            delay: anime.stagger(150),  // 카드마다 150ms 간격으로 애니메이션
            duration: 800, // 애니메이션 지속 시간 (ms)
            easing: 'easeOutElastic(1, 0.5)' // 애니메이션 가속도 함수
        });
    }

    /**
     * 카드 호버 효과 설정
     */
    setupCardHoverEffects() {
        const cards = document.querySelectorAll('.word-card');

        cards.forEach(card => {
            // 요소에 필요한 CSS 설정 추가
            card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

            // 호버 시 들어올리기 효과
            card.addEventListener('mouseenter', function () {
                anime({
                    targets: this, // 애니메이션 대상
                    scale: 1.05, // 크기를 1.05배로 확대
                    boxShadow: '0 10px 20px rgba(0,0,0,0.15)', // 그림자 효과
                    translateY: -10, // Y 축으로 -10px 이동
                    duration: 300, // 애니메이션 지속 시간 (ms)
                    easing: 'easeOutCubic' // 애니메이션 가속도 함수
                });

                // 카드 내 요소들 강조 효과
                const vocabulary = this.querySelector('.vocabulary');
                const meaning = this.querySelector('.meaning');

                if (vocabulary) {
                    anime({
                        targets: vocabulary, // 애니메이션 대상
                        scale: 1.05, // 크기를 1.05배로 확대
                        color: '#1976D2', // 텍스트 색상 변경
                        duration: 300, // 애니메이션 지속 시간 (ms)
                        easing: 'easeOutQuad' // 애니메이션 가속도 함수
                    });
                }

                if (meaning) {
                    anime({
                        targets: meaning, // 애니메이션 대상
                        scale: 1.02, // 크기를 1.02배로 확대
                        duration: 300, // 애니메이션 지속 시간 (ms)
                        easing: 'easeOutQuad' // 애니��이션 가속도 함수
                    });
                }
            });

            // 마우스 나갈 때 원래 상태로 복원
            card.addEventListener('mouseleave', function () {
                anime({
                    targets: this, // 애니메이션 대상
                    scale: 1, // 크기를 원래 크기로 복원
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', // 그림자 효과 복원
                    translateY: 0, // Y축 이동을 원래 상태로 복원
                    duration: 400, // 애니메이션 지속 시간 (ms)
                    easing: 'easeOutElastic(1, 0.5)' // 애니메이션 가속도 함수
                });

                // 카드 내 요소들 원래 상태로
                const vocabulary = this.querySelector('.vocabulary');
                const meaning = this.querySelector('.meaning');

                if (vocabulary) {
                    anime({
                        targets: vocabulary, // 애니메이션 대상
                        scale: 1, // 크기를 원래 크기로 복원
                        color: '#e74c3c', // 텍스트 색상 복원
                        duration: 300, // 애니메이션 지속 시간 (ms)
                        easing: 'easeOutQuad' // 애니메이션 가속도 함수
                    });
                }

                if (meaning) {
                    anime({
                        targets: meaning, // 애니메이션 대상
                        scale: 1, // 크기를 원래 크기로 복원
                        duration: 300, // 애니메이션 지속 시간 (ms)
                        easing: 'easeOutQuad' // 애니메이션 가속도 함수
                    });
                }
            });
        });
    }

    /**
     * 별 깜빡임 애니메이션
     */
    animateStars() {
        const stars = document.querySelectorAll('.difficulty i');

        anime({
            targets: stars, // 애니메이션 대상
            opacity: [0.4, 1], // 투명도를 0.4에서 1로 변경
            scale: [1, 1.2, 1], // 크기를 1배에서 1.2배로 확대 후 다시 1배로 축소
            color: ['#FFD700', '#FFA500', '#FFD700'], // 색상을 골드 → 오렌지 → 골드로 변경
            delay: anime.stagger(100), // 각 요소마다 100ms 간격으로 애니메이션
            duration: 2000, // 애니메이션 지속 시간 (ms)
            loop: true, // 애니메이션 반복
            direction: 'alternate', // 애니메이션 방향을 번갈아가며 실행
            easing: 'easeInOutSine' // 애니메이션 가속도 함수
        });
    }

    /**
     * 로딩 애니메이션
     */
    animateLoading() {
        const spinner = document.querySelector('.spinner');
        if (!spinner) return;

        anime({
            targets: spinner, // 애니메이션 대상
            rotate: '1turn', // 1회전
            duration: 1000, // 애니메이션 지속 시간 (ms)
            loop: true, // 애니메이션 반복
            easing: 'linear' // 애니메이션 가속도 함수
        });
    }
}

// 앱 인스턴스 생성 및 초기화
document.addEventListener('DOMContentLoaded', () => {
    const app = new DailyWordsApp();
    app.initialize();
});