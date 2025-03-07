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
            wordBooks: []
        };

        // API 엔드포인트
        this.API_BASE_URL = '/api/v1/wordbooks';

        // DOM 요소 캐싱
        this.elements = {
            wordBookList: document.getElementById('wordBookList'),
            filterChips: document.querySelectorAll('.filter-chip'),
            deleteModal: new bootstrap.Modal(document.getElementById('deleteModal')),
            confirmDeleteBtn: document.getElementById('confirmDelete')
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
                    this.filterByCategory(category);
                }
            });
        });

        // 삭제 확인 버튼 이벤트
        this.elements.confirmDeleteBtn.addEventListener('click', () => {
            this.deleteWordBook(this.state.deleteWordBookId);
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
                this.loadWordBooks();
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
        location.href = url;
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
                <button class="btn btn-primary" onclick="wordBookListManager.navigateTo('/wordbook/create')">
                    <i class="bi bi-plus-lg"></i>
                    새 단어장 만들기
                </button>
            </div>
        `;
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
                <button class="btn btn-primary" onclick="wordBookListManager.loadWordBooks()">
                    <i class="bi bi-arrow-clockwise"></i>
                    다시 시도
                </button>
            </div>
        `;
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