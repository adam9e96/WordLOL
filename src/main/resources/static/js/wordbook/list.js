/**
 * 단어장 목록 관리 클래스
 * 단어장 목록을 조회, 필터링, 관리하는 기능을 제공합니다.
 */
class WordBookListManager {
    /**
     * 생성자
     * 상태와 DOM 요소를 초기화합니다.
     */
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

        // 이벤트 리스너 설정
        this.setupEventListeners();
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.state.wordBooks = await response.json();
            console.log('단어장 로드 완료:', this.state.wordBooks);

            this.renderWordBookList();
        } catch (error) {
            console.error('단어장 목록 로딩 오류:', error);
            this.renderErrorState(error.message);
        } finally {
            this.state.isLoading = false;
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
            anime.set(cards, {
                opacity: 0,
                translateY: 20
            });

            anime({
                targets: cards,
                opacity: [0, 1],
                translateY: [20, 0],
                easing: 'easeOutCubic',
                duration: 800,
                delay: anime.stagger(100)
            });

            // 카드 내부 요소 애니메이션
            cards.forEach(card => {
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
                    <h3 class="card-title">${book.name}</h3>
                </div>
                <p class="card-text">${book.description}</p>
                <div class="card-footer">
                    <div class="word-count">
                        <i class="bi bi-book"></i>
                        <span>단어 ${book.wordCount}개</span>
                    </div>
                    <div class="card-actions">
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
     * 오류 상태 렌더링
     * @param {string} errorMessage - 오류 메시지
     */
    renderErrorState(errorMessage) {
        this.elements.wordBookList.innerHTML = `
            <div class="error-state">
                <div class="error-state-icon">
                    <i class="bi bi-exclamation-circle"></i>
                </div>
                <h3 class="error-state-title">오류가 발생했습니다</h3>
                <p class="error-state-message">단어장 목록을 불러오는 중 문제가 발생했습니다.</p>
                <p class="error-details">${errorMessage}</p>
                <button class="btn btn-add_word" onclick="wordBookListManager.loadWordBooks()">
                    <i class="bi bi-arrow-clockwise"></i>
                    다시 시도
                </button>
            </div>
        `;

        // 오류 상태 애니메이션
        if (this.state.isAnimeAvailable) {
            anime({
                targets: '.error-state',
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