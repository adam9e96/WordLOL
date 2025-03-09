/**
 * 단어장 상세 보기 애플리케이션
 * 단어장 정보와 단어 목록을 표시하고 관리하는 클래스 기반 JS 모듈
 */
class WordbookViewApp {
    /**
     * 생성자 - 애플리케이션 초기화
     */
    constructor() {
        // API 및 상태 정보
        this.API_BASE_URL = '/api/v1/wordbooks';
        this.state = {
            wordBookId: null,
            wordBook: null,
            words: [],
            filteredWords: [],
            isLoading: true,
            searchTerm: ''
        };

        // DOM 요소 캐싱
        this.elements = {
            container: document.querySelector('.content-container'),
            wordBookName: document.getElementById('wordbook-name'),
            categoryName: document.getElementById('category-name'),
            categoryBadge: document.getElementById('category-badge'),
            wordBookDescription: document.getElementById('wordbook-description'),
            wordCount: document.getElementById('word-count'),
            createdAt: document.getElementById('created-at'),
            updatedAt: document.getElementById('updated-at'),
            wordList: document.getElementById('word-list'),
            searchInput: document.getElementById('search-input'),
            studyBtn: document.getElementById('study-btn'),
            wordListSection: document.querySelector('.words-section')
        };

        // 매니저 초기화
        this.uiManager = new UIManager(this.elements);
        this.animationManager = new AnimationManager(this.elements);
        this.apiService = new ApiService(this.API_BASE_URL);

        // 초기화
        this.initialize();
    }

    /**
     * URL에서 단어장 ID 추출
     * @returns {string} 단어장 ID
     */
    getWordBookIdFromUrl() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.indexOf('wordbook') + 1];
    }

    /**
     * 애플리케이션 초기화
     */
    async initialize() {
        try {
            // URL에서 단어장 ID 추출
            this.state.wordBookId = this.getWordBookIdFromUrl();
            if (!this.state.wordBookId) {
                throw new Error('단어장 ID를 찾을 수 없습니다.');
            }

            // 이벤트 리스너 설정
            this.setupEventListeners();

            // 페이지 로드 애니메이션 시작
            this.animationManager.playPageLoadAnimation();

            // 데이터 로드
            await this.loadWordBookData();

        } catch (error) {
            console.error('초기화 중 오류 발생:', error);
            this.uiManager.showError('단어장 정보를 불러오는데 실패했습니다.');
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 검색 입력 이벤트
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e));

        // 학습 버튼 클릭 이벤트
        this.elements.studyBtn.addEventListener('click', () => {
            this.animationManager.animateButtonClick(this.elements.studyBtn, () => {
                location.href = `/wordbook/${this.state.wordBookId}/study`;
            });
        });

        // 목록으로 버튼 클릭 이벤트
        const backButton = document.querySelector('.btn-outline');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.animationManager.animateButtonClick(backButton, () => {
                    // history.back() 대신 직접 URL로 이동
                    window.location.href = '/wordbook/list';
                });
            });
        }
    }

    /**
     * 단어장 데이터 로드
     */
    async loadWordBookData() {
        try {
            // 병렬로 단어장 정보와 단어 목록 가져오기
            const [wordBook, words] = await Promise.all([
                this.apiService.fetchWordBook(this.state.wordBookId),
                this.apiService.fetchWords(this.state.wordBookId)
            ]);

            // 상태 업데이트
            this.state.wordBook = wordBook;
            this.state.words = words;
            this.state.filteredWords = [...words];
            this.state.isLoading = false;

            // UI 업데이트
            this.updateUI();
        } catch (error) {
            console.error('데이터 로드 오류:', error);
            this.uiManager.showError('단어장 정보를 불러오는데 실패했습니다.');
            this.state.isLoading = false;
        }
    }

    /**
     * UI 업데이트
     */
    updateUI() {
        // 단어장 정보와 단어 목록 업데이트
        this.uiManager.updateWordBookInfo(this.state.wordBook, this.state.words.length);
        this.uiManager.renderWordList(this.state.filteredWords);

        // 컨텐츠 로드 후 애니메이션
        this.animationManager.playContentLoadedAnimation();
    }

    /**
     * 검색 처리
     * @param {Event} event - 입력 이벤트
     */
    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase().trim();
        this.state.searchTerm = searchTerm;

        // 검색어가 없으면 모든 단어 표시
        if (!searchTerm) {
            this.state.filteredWords = [...this.state.words];
        } else {
            // 검색어로 필터링
            this.state.filteredWords = this.state.words.filter(word =>
                word.vocabulary.toLowerCase().includes(searchTerm) ||
                word.meaning.toLowerCase().includes(searchTerm) ||
                (word.hint && word.hint.toLowerCase().includes(searchTerm))
            );
        }

        // 검색 결과 렌더링 및 애니메이션
        this.animationManager.animateSearchResults(() => {
            this.uiManager.renderWordList(this.state.filteredWords, searchTerm);
        });
    }
}

/**
 * API 서비스 클래스
 * 서버와의 통신을 담당
 */
class ApiService {
    /**
     * 생성자
     * @param {string} baseUrl - API 기본 URL
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * 단어장 정보 가져오기
     * @param {string} id - 단어장 ID
     * @returns {Promise<Object>} 단어장 정보
     */
    async fetchWordBook(id) {
        const response = await fetch(`${this.baseUrl}/${id}`);
        if (!response.ok) {
            throw new Error(`단어장 정보를 가져오는데 실패했습니다 (${response.status})`);
        }
        return response.json();
    }

    /**
     * 단어 목록 가져오기
     * @param {string} id - 단어장 ID
     * @returns {Promise<Array>} 단어 목록
     */
    async fetchWords(id) {
        const response = await fetch(`${this.baseUrl}/${id}/words`);
        if (!response.ok) {
            throw new Error(`단어 목록을 가져오는데 실패했습니다 (${response.status})`);
        }
        return response.json();
    }
}

/**
 * UI 관리 클래스
 * 화면 표시와 관련된 기능을 담당
 */
class UIManager {
    /**
     * 생성자
     * @param {Object} elements - DOM 요소 참조
     */
    constructor(elements) {
        this.elements = elements;
    }

    /**
     * 단어장 정보 업데이트
     * @param {Object} wordBook - 단어장 정보
     * @param {number} wordCount - 단어 수
     */
    updateWordBookInfo(wordBook, wordCount) {
        this.elements.wordBookName.textContent = wordBook.name;
        this.elements.categoryName.textContent = this.getCategoryDisplayName(wordBook.category);
        this.elements.categoryBadge.className = `category-badge ${this.getCategoryClass(wordBook.category)}`;
        this.elements.wordBookDescription.textContent = wordBook.description;
        this.elements.wordCount.textContent = String(wordCount);
        this.elements.createdAt.textContent = this.formatDateTime(wordBook.createdAt);
        this.elements.updatedAt.textContent = this.formatDateTime(wordBook.updatedAt);
    }

    /**
     * 단어 목록 렌더링
     * @param {Array} words - 단어 목록
     */
    renderWordList(words) {
        if (words.length === 0) {
            // 검색어가 있는지 확인하여 다른 메시지 표시
            const searchTerm = document.getElementById('search-input').value.trim();

            if (searchTerm) {
                // 검색 결과가 없는 경우
                this.elements.wordList.innerHTML = `
                    <div class="empty-search-state">
                        <div class="empty-icon">
                            <i class="bi bi-search"></i>
                        </div>
                        <h3 class="empty-title">검색 결과가 없습니다</h3>
                        <p class="empty-message">"${searchTerm}"에 해당하는 단어를 찾을 수 없습니다.</p>
                        <button class="btn btn-outline" onclick="document.getElementById('search-input').value = ''; document.getElementById('search-input').dispatchEvent(new Event('input'));">
                            <i class="bi bi-arrow-counterclockwise"></i> 모든 단어 보기
                        </button>
                    </div>
                `;
            } else {
                // 단어가 없는 경우
                this.elements.wordList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="bi bi-journal-x"></i>
                        </div>
                        <h3 class="empty-title">단어가 없습니다</h3>
                        <p class="empty-message">이 단어장에 등록된 단어가 없습니다.</p>
                    </div>
                `;
            }
            return;
        }

        this.elements.wordList.innerHTML = words.map(word => `
            <div class="word-row">
                <div class="word-vocabulary" data-label="영단어">${word.vocabulary}</div>
                <div class="word-meaning" data-label="의미">${word.meaning}</div>
                <div class="word-hint" data-label="힌트">${word.hint || '-'}</div>
                <div class="word-difficulty" data-label="난이도">${this.getDifficultyStars(word.difficulty)}</div>
            </div>
        `).join('');
    }

    /**
     * 오류 표시
     * @param {string} message - 오류 메시지
     */
    showError(message) {
        this.elements.wordList.innerHTML = `
            <div class="error-message">
                <i class="bi bi-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * 카테고리 표시 이름 가져오기
     * @param {string} category - 카테고리 코드
     * @returns {string} 카테고리 표시 이름
     */
    getCategoryDisplayName(category) {
        const categoryMap = {
            'TOEIC': '토익',
            'TOEFL': '토플',
            'CSAT': '수능',
            'CUSTOM': '사용자 정의'
        };
        return categoryMap[category] || category;
    }

    /**
     * 카테고리 CSS 클래스 가져오기
     * @param {string} category - 카테고리 코드
     * @returns {string} CSS 클래스
     */
    getCategoryClass(category) {
        const classMap = {
            'TOEIC': 'category-toeic',
            'TOEFL': 'category-toefl',
            'CSAT': 'category-csat',
            'CUSTOM': 'category-custom'
        };
        return classMap[category] || '';
    }

    /**
     * 난이도 별표 가져오기
     * @param {number} level - 난이도
     * @returns {string} 별표 HTML
     */
    getDifficultyStars(level) {
        return '<i class="bi bi-star-fill"></i>'.repeat(level);
    }

    /**
     * 날짜 포맷팅
     * @param {string} dateTimeStr - 날짜 문자열
     * @returns {string} 포맷된 날짜
     */
    formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return '-';
        const date = new Date(dateTimeStr);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

/**
 * 애니메이션 관리 클래스
 * anime.js를 활용한 애니메이션 효과를 담당
 */
class AnimationManager {
    /**
     * 생성자
     * @param {Object} elements - DOM 요소 참조
     */
    constructor(elements) {
        this.elements = elements;
        this.animations = {};
        this.isAnimeAvailable = typeof anime !== 'undefined';
    }

    /**
     * 페이지 로드 애니메이션
     */
    playPageLoadAnimation() {
        if (!this.isAnimeAvailable) return;

        // 초기 상태 설정
        anime.set(this.elements.container, {
            opacity: 0,
            translateY: 20
        });

        // 페이드 인 애니메이션
        this.animations.pageLoad = anime({
            targets: this.elements.container,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            easing: 'easeOutCubic'
        });
    }

    /**
     * 콘텐츠 로드 완료 애니메이션
     */
    playContentLoadedAnimation() {
        if (!this.isAnimeAvailable) return;

        // 단어장 정보 섹션 애니메이션
        const infoSection = document.querySelector('.wordbook-info-section');
        anime({
            targets: infoSection,
            opacity: [0, 1],
            translateY: [15, 0],
            duration: 600,
            easing: 'easeOutQuad',
            delay: 100
        });

        // 단어 섹션 애니메이션
        anime({
            targets: this.elements.wordListSection,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            easing: 'easeOutQuad',
            delay: 300
        });

        // 단어 행 순차적 애니메이션
        setTimeout(() => {
            const wordRows = document.querySelectorAll('.word-row');
            anime({
                targets: wordRows,
                opacity: [0, 1],
                translateX: [10, 0],
                duration: 400,
                delay: anime.stagger(50),
                easing: 'easeOutQuad'
            });
        }, 500);
    }

    /**
     * 검색 결과 애니메이션
     * @param {Function} callback - 애니메이션 후 실행될 콜백
     */
    animateSearchResults(callback) {
        if (!this.isAnimeAvailable) {
            callback();
            return;
        }

        // 결과 페이드 아웃
        anime({
            targets: this.elements.wordList,
            opacity: [1, 0],
            translateY: [0, -10],
            duration: 200,
            easing: 'easeOutQuad',
            complete: () => {
                // 콜백 실행
                callback();

                // 새 결과 페이드 인
                const wordRows = document.querySelectorAll('.word-row');
                anime({
                    targets: this.elements.wordList,
                    opacity: [0, 1],
                    translateY: [10, 0],
                    duration: 300,
                    easing: 'easeOutQuad'
                });

                // 새 단어 행 순차적 애니메이션
                anime({
                    targets: wordRows,
                    opacity: [0, 1],
                    translateX: [10, 0],
                    duration: 400,
                    delay: anime.stagger(30),
                    easing: 'easeOutQuad'
                });
            }
        });
    }

    /**
     * 버튼 클릭 애니메이션
     * @param {HTMLElement} button - 버튼 요소
     * @param {Function} callback - 클릭 후 콜백
     */
    animateButtonClick(button, callback) {
        if (!this.isAnimeAvailable) {
            callback();
            return;
        }

        anime({
            targets: button,
            scale: [1, 0.95, 1],
            duration: 400,
            easing: 'easeInOutBack',
            complete: callback
        });
    }
}

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    window.wordBookViewApp = new WordbookViewApp();
});