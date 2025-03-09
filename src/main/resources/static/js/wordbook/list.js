/**
 * 단어장 목록 관리 클래스
 * 단어장 목록을 조회, 필터링, 관리하는 기능을 제공합니다.
 */
class WordBookListManager {

    constructor() {
        // 상태 관리
        this.state = {
            currentCategory: 'ALL',
            isLoading: false,
            wordBooks: [],
            animations: {},
            isAnimeAvailable: typeof anime !== 'undefined'
        };

        // API 엔드포인트
        this.API_BASE_URL = '/api/v1/wordbooks';

        // DOM 요소 캐싱
        this.elements = {
            wordBookList: document.getElementById('wordBookList'),
            filterChips: document.querySelectorAll('.filter-chip'),
            deleteModal: new bootstrap.Modal(document.getElementById('deleteModal')),
            confirmDeleteBtn: document.getElementById('confirmDelete'),
            contentContainer: document.querySelector('.content-container'),
            topSection: document.querySelector('.top-section'),
            wordbooksSection: document.querySelector('.wordbooks-section')
        };
        // 페이지 가시성 변경 감지 - 브라우저 탭 전환, 앱 복귀 등
        this.setupVisibilityChangeDetection();

        // 브라우저 히스토리 이벤트 감지 - 뒤로가기, 앞으로가기
        this.setupHistoryChangeDetection();

        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    /**
     * 페이지 가시성 변경 감지 설정
     * 페이지가 다시 보일 때 데이터 새로고침
     */
    setupVisibilityChangeDetection() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('페이지 다시 표시됨, 데이터 갱신');
                this.loadWordBooks();
            }
        });
    }

    /**
     * 브라우저 히스토리 변경 감지 설정
     * 뒤로가기/앞으로가기로 돌아왔을 때 데이터 새로고침
     */
    setupHistoryChangeDetection() {
        window.addEventListener('pageshow', (event) => {
            // persisted가 true이면 페이지가 브라우저 캐시에서 복원된 것임
            if (event.persisted) {
                console.log('캐시에서 페이지 복원됨, 데이터 갱신');
                this.loadWordBooks();
            }
        });

        // 뒤로가기/앞으로가기를 감지하는 추가 방법
        window.addEventListener('popstate', () => {
            console.log('히스토리 탐색 감지됨 (뒤로/앞으로가기), 데이터 갱신');
            this.loadWordBooks();
        });
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 카테고리 필터 이벤트
        this.elements.filterChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                const category = e.currentTarget.getAttribute('data-category');
                if (category) {
                    this.animateFilterChange(() => {
                        this.filterByCategory(category);
                    });
                }
            });
        });

        // 삭제 확인 버튼 이벤트
        this.elements.confirmDeleteBtn.addEventListener('click', () => {
            this.deleteWordBook(this.state.deleteWordBookId);
        });

        // 스크롤 이벤트로 카드 나타나는 효과
        if (this.state.isAnimeAvailable) {
            window.addEventListener('scroll', this.handleScroll.bind(this));
        }
    }

    /**
     * 스크롤 이벤트 처리
     */
    handleScroll() {
        const cards = document.querySelectorAll('.wordbook-card');
        cards.forEach(card => {
            if (this.isElementInViewport(card) && !card.classList.contains('animated')) {
                card.classList.add('animated');
                anime({
                    targets: card,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    easing: 'easeOutCubic',
                    duration: 500,
                    delay: 100
                });
            }
        });
    }

    /**
     * 요소가 화면에 보이는지 확인
     * @param {HTMLElement} el - 확인할 요소
     * @returns {boolean} - 화면에 보이면 true
     */
    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0 &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
            rect.right >= 0
        );
    }

    /**
     * 필터 변경 애니메이션
     * @param {Function} callback - 애니메이션 완료 후 실행할 콜백 함수
     */
    animateFilterChange(callback) {
        if (!this.state.isAnimeAvailable) {
            callback();
            return;
        }

        anime({
            targets: this.elements.wordBookList,
            opacity: [1, 0],
            translateY: [0, 10],
            easing: 'easeOutQuad',
            duration: 300,
            complete: () => {
                callback();
                anime({
                    targets: this.elements.wordBookList,
                    opacity: [0, 1],
                    translateY: [10, 0],
                    easing: 'easeOutQuad',
                    duration: 500
                });
            }
        });
    }

    /**
     * 단어장 목록 로드
     * 현재 선택된 카테고리에 따라 단어장 목록을 가져옵니다.
     */
    async loadWordBooks() {
        try {
            this.state.isLoading = true;
            this.renderLoadingState();

            const url = this.state.currentCategory === 'ALL'
                ? `${this.API_BASE_URL}`
                : `${this.API_BASE_URL}/category?category=${this.state.currentCategory}`;

            const response = await fetch(url);
            if (!response.ok) {
                // 404 Not Found - 카테고리가 없는 경우 특별 처리
                if (response.status === 404) {
                    this.state.wordBooks = []; // 빈 배열로 설정
                    this.renderEmptyState(); // 빈 상태 화면 표시
                    this.state.isLoading = false;
                    return; // 함수 종료
                }

                // 다른 종류의 HTTP 에러
                throw new Error(`서버 오류: ${response.status}`);
            }

            // 정상 응답 처리
            this.state.wordBooks = await response.json();

            // 빈 배열 체크 - 카테고리는 존재하지만 단어장이 없는 경우
            if (this.state.wordBooks.length === 0) {
                this.renderEmptyState();
            } else {
                this.renderWordBookList();
            }
        } catch (error) {
            // 콘솔에 오류 기록 (log.error 대신 console.error 사용)
            console.error('단어장 목록 로딩 오류:', error.message);

            // 사용자 친화적인 오류 메시지 표시
            this.renderCustomErrorMessage(this.state.currentCategory);
        } finally {
            this.state.isLoading = false;
        }
    }

    // 새로운 메서드: 친화적인 오류 메시지 표시
    renderCustomErrorMessage(category) {
        const categoryName = this.getCategoryDisplayName(category);

        this.elements.wordBookList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">
                <i class="bi bi-journal-x"></i>
            </div>
            <h3 class="empty-state-title">${categoryName} 카테고리를 찾을 수 없습니다</h3>
            <p class="empty-state-message">선택하신 카테고리가 존재하지 않거나 접근할 수 없습니다. 다른 카테고리를 선택해주세요.</p>
            <button class="btn btn-add_word" onclick="wordBookListManager.filterByCategory('ALL')">
                <i class="bi bi-grid-fill"></i>
                전체 단어장 보기
            </button>
        </div>
    `;

        // 카드 애니메이션 적용
        if (this.state.isAnimeAvailable) {
            anime({
                targets: '.empty-state',
                opacity: [0, 1],
                translateY: [20, 0],
                easing: 'easeOutQuad',
                duration: 800
            });
        }
    }

    /**
     * 카테고리별 필터링
     * @param {string} category - 필터링할 카테고리
     */
    filterByCategory(category) {
        this.state.currentCategory = category;
        this.updateActiveFilterChip();
        this.loadWordBooks();
    }

    /**
     * 활성화된 필터 칩 업데이트
     */
    updateActiveFilterChip() {
        this.elements.filterChips.forEach(chip => {
            chip.classList.remove('active');
            const chipCategory = chip.getAttribute('data-category');
            if (chipCategory === this.state.currentCategory) {
                chip.classList.add('active');

                // 활성화된 필터 칩 애니메이션
                if (this.state.isAnimeAvailable) {
                    anime({
                        targets: chip,
                        scale: [1, 1.1, 1],
                        easing: 'easeOutElastic(1, .5)',
                        duration: 800
                    });
                }
            }
        });
    }

    /**
     * 단어장 삭제 확인 모달 표시
     * @param {number} id - 삭제할 단어장 ID
     */
    confirmDelete(id) {
        this.state.deleteWordBookId = id;
        this.elements.deleteModal.show();
    }

    /**
     * 단어장 삭제 처리
     * @param {number} id - 삭제할 단어장 ID
     */
    async deleteWordBook(id) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.elements.deleteModal.hide();
                this.showToast('단어장이 삭제되었습니다.', 'success');

                // 삭제 후 목록 다시 로드 (애니메이션과 함께)
                this.animateFilterChange(() => {
                    this.loadWordBooks();
                });
            } else {
                this.showToast('단어장 삭제 중 오류가 발생했습니다.', 'danger');
            }
        } catch (error) {
            console.error('단어장 삭제 오류:', error);
            this.showToast('서버 통신 중 오류가 발생했습니다.', 'danger');
        }
    }

    /**
     * 단어장 목록 렌더링
     */
    renderWordBookList() {
        if (this.state.wordBooks.length === 0) {
            this.renderEmptyState();
            return;
        }

        this.elements.wordBookList.innerHTML = this.state.wordBooks.map(book => this.createWordBookCard(book)).join('');

        // 단어장 카드 애니메이션
        if (this.state.isAnimeAvailable) {
            const cards = document.querySelectorAll('.wordbook-card');

            // 모든 카드를 초기에 보이지 않게 설정
            anime.set(cards, {
                opacity: 0,
                translateY: 20
            });

            // 그리드 레이아웃 계산 (몇 개의 카드가 한 행에 있는지 파악)
            const containerWidth = this.elements.wordBookList.clientWidth;
            const cardWidth = cards[0].offsetWidth;
            const gap = 16; // CSS gap 값과 동일하게 설정
            const cardsPerRow = Math.floor(containerWidth / (cardWidth + gap));

            // 각 카드를 행과 열에 따라 순차적으로 애니메이션 적용
            cards.forEach((card, index) => {
                const row = Math.floor(index / cardsPerRow);
                const col = index % cardsPerRow;

                // 행과 열에 따른 지연 시간 계산 (위에서 아래로, 왼쪽에서 오른쪽으로)
                const delay = (row * cardsPerRow + col) * 100;

                anime({
                    targets: card,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    easing: 'easeOutCubic',
                    duration: 800,
                    delay: delay
                });

                card.classList.add('animated');

                // 카드에 호버 이벤트 리스너 추가
                card.addEventListener('mouseenter', function () {
                    anime({
                        targets: this,
                        translateY: -8,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        easing: 'easeOutQuad',
                        duration: 300
                    });
                });

                card.addEventListener('mouseleave', function () {
                    anime({
                        targets: this,
                        translateY: 0,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        easing: 'easeOutQuad',
                        duration: 300
                    });
                });
            });
        }

        // 카드에 다크 테마 데이터 속성 추가
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            const cards = document.querySelectorAll('.wordbook-card');
            cards.forEach(card => {
                card.setAttribute('data-theme', 'dark');
            });
        }
    }

    /**
     * 단어장 카드 HTML 생성
     * @param {Object} book - 단어장 정보
     * @returns {string} - 단어장 카드 HTML
     */
    createWordBookCard(book) {
        return `
            <div class="wordbook-card">
                <div class="category-chip">
                    <i class="bi ${this.getCategoryIcon(book.category)}"></i>
                    ${this.getCategoryDisplayName(book.category)}
                </div>
                <div class="card-header-container">
                    <h3 class="card-name">${book.name}</h3>
                </div>
                <p class="card-description">${book.description}</p>
                <div class="card-footer">
                    <div class="word-count">
                        <i class="bi bi-book"></i>
                        <span>단어 ${book.wordCount}개</span>
                    </div>
                    <div class="control-section">
                        <button class="card-btn btn-view" 
                                onclick="wordBookListManager.navigateTo('/wordbook/${book.id}/view')"
                                title="상세 조회">
                            <i class="bi bi-eye"></i>
                            <span>조회</span>
                        </button>
                        <button class="card-btn btn-study" 
                                onclick="wordBookListManager.navigateTo('/wordbook/${book.id}/study')"
                                title="학습 시작">
                            <i class="bi bi-play-fill"></i>
                            <span>학습</span>
                        </button>
                        <button class="card-btn btn-edit"
                                onclick="wordBookListManager.navigateTo('/wordbook/${book.id}/edit')"
                                title="단어장 수정">
                            <i class="bi bi-pencil"></i>
                            <span>수정</span>
                        </button>
                        <button class="card-btn btn-delete"
                                onclick="wordBookListManager.confirmDelete(${book.id})"
                                title="단어장 삭제">
                            <i class="bi bi-trash"></i>
                            <span>삭제</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 페이지 이동
     * @param {string} url - 이동할 URL
     */
    navigateTo(url) {
        // 이동 전 애니메이션
        if (this.state.isAnimeAvailable) {
            anime({
                targets: this.elements.contentContainer,
                opacity: [1, 0],
                translateY: [0, -10],
                easing: 'easeOutQuad',
                duration: 300,
                complete: () => {
                    location.href = url;
                }
            });
        } else {
            location.href = url;
        }
    }

    /**
     * 로딩 상태 렌더링
     */
    renderLoadingState() {
        this.elements.wordBookList.innerHTML = `
            <div class="loading-state">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">로딩중...</span>
                </div>
                <p>단어장 목록을 불러오는 중입니다...</p>
            </div>
        `;

        // 로딩 스피너 애니메이션
        if (this.state.isAnimeAvailable) {
            this.state.animations.loading = anime({
                targets: '.loading-state .spinner-border',
                rotate: '1turn',
                easing: 'linear',
                duration: 1000,
                loop: true
            });
        }
    }

    /**
     * 빈 상태 렌더링
     */
    renderEmptyState() {
        this.elements.wordBookList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="bi bi-journal-x"></i>
                </div>
                <h3 class="empty-state-title">단어장이 없습니다</h3>
                <p class="empty-state-message">${this.state.currentCategory === 'ALL'
            ? '아직 등록된 단어장이 없습니다. 새 단어장을 만들어보세요!'
            : `'${this.getCategoryDisplayName(this.state.currentCategory)}' 카테고리에 해당하는 단어장이 없습니다.`}</p>
                <button class="btn btn-add_word" onclick="wordBookListManager.navigateTo('/wordbook/create')">
                    <i class="bi bi-plus-lg"></i>
                    새 단어장 만들기
                </button>
            </div>
        `;

        // 빈 상태 애니메이션
        if (this.state.isAnimeAvailable) {
            anime({
                targets: '.empty-state',
                opacity: [0, 1],
                translateY: [20, 0],
                easing: 'easeOutQuad',
                duration: 800
            });
        }
    }

    /**
     * 토스트 메시지 표시
     * @param {string} message - 표시할 메시지
     * @param {string} type - 메시지 타입 (success, danger, warning, info)
     */
    showToast(message, type = 'success') {
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        const toastElement = document.createElement('div');
        toastElement.className = `toast bg-${type} text-white`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');

        toastElement.innerHTML = `
            <div class="toast-header bg-${type} text-white">
                <i class="bi ${this.getToastIcon(type)} me-2"></i>
                <strong class="me-auto">${this.getToastTitle(type)}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;

        toastContainer.appendChild(toastElement);
        const toast = new bootstrap.Toast(toastElement, {autohide: true, delay: 3000});

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });

        toast.show();

        // 토스트 애니메이션
        if (this.state.isAnimeAvailable) {
            anime.set(toastElement, {
                opacity: 0,
                translateX: 50
            });

            anime({
                targets: toastElement,
                opacity: 1,
                translateX: 0,
                easing: 'easeOutElastic(1, .6)',
                duration: 800
            });
        }
    }

    /**
     * 토스트 컨테이너 생성
     * @returns {HTMLElement} - 생성된 토스트 컨테이너
     */
    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
        return container;
    }

    /**
     * 토스트 아이콘 가져오기
     * @param {string} type - 메시지 타입
     * @returns {string} - 아이콘 클래스
     */
    getToastIcon(type) {
        const icons = {
            'success': 'bi-check-circle',
            'danger': 'bi-exclamation-circle',
            'warning': 'bi-exclamation-triangle',
            'info': 'bi-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * 토스트 제목 가져오기
     * @param {string} type - 메시지 타입
     * @returns {string} - 제목
     */
    getToastTitle(type) {
        const titles = {
            'success': '성공',
            'danger': '오류',
            'warning': '경고',
            'info': '안내'
        };
        return titles[type] || titles.info;
    }

    /**
     * 카테고리 아이콘 가져오기
     * @param {string} category - 카테고리
     * @returns {string} - 아이콘 클래스
     */
    getCategoryIcon(category) {
        const icons = {
            'TOEIC': 'bi-journal-text',
            'TOEFL': 'bi-journal-medical',
            'CSAT': 'bi-journal-check',
            'CUSTOM': 'bi-journal-plus'
        };
        return icons[category] || 'bi-journal';
    }

    /**
     * 카테고리 표시 이름 가져오기
     * @param {string} category - 카테고리
     * @returns {string} - 표시 이름
     */
    getCategoryDisplayName(category) {
        const categoryMap = {
            'ALL': '전체',
            'TOEIC': '토익',
            'TOEFL': '토플',
            'CSAT': '수능',
            'CUSTOM': '사용자 정의'
        };
        return categoryMap[category] || category;
    }

    /**
     * 앱 초기화
     */
    init() {
        console.log('단어장 목록 관리자 초기화 중...');

        // 페이지 로드 애니메이션
        if (this.state.isAnimeAvailable) {
            // 초기 설정 - 보이지 않게
            anime.set([this.elements.topSection, this.elements.wordbooksSection], {
                opacity: 0,
                translateY: 20
            });

            // 순차적으로 나타나는 애니메이션
            anime.timeline({
                easing: 'easeOutQuad'
            })
                .add({
                    targets: this.elements.topSection,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 800
                })
                .add({
                    targets: this.elements.wordbooksSection,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 800
                }, '-=600');
        }

        // HTML에 data-category 속성 설정
        document.querySelectorAll('.filter-chip').forEach(chip => {
            const categoryText = chip.textContent.trim();
            // 텍스트에서 카테고리 추출
            for (const [key, value] of Object.entries(this.getCategoryMap())) {
                if (categoryText.includes(value)) {
                    chip.setAttribute('data-category', key);
                    break;
                }
            }
        });

        this.updateActiveFilterChip();
        this.loadWordBooks();
        console.log('단어장 목록 관리자 초기화 완료');
    }

    /**
     * 카테고리 맵 가져오기
     * @returns {Object} - 카테고리 맵
     */
    getCategoryMap() {
        return {
            'ALL': '전체',
            'TOEIC': '토익',
            'TOEFL': '토플',
            'CSAT': '수능',
            'CUSTOM': '사용자 정의'
        };
    }
}

// 인스턴스 생성 및 초기화
const wordBookListManager = new WordBookListManager();
document.addEventListener('DOMContentLoaded', () => wordBookListManager.init());