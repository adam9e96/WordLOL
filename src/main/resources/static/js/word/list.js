class WordListApp {
    constructor() {
        this.state = {
            currentPage: 0,
            pageSize: 20,
            isProcessing: false,
            API_BASE_URL: '/api/v1/words',
            isInitialLoad: true
        };

        // DOM 요소 캐싱
        this.elements = {
            pagination: document.getElementById('pagination'),
            wordList: document.getElementById('wordList'),
            wordListContainer: document.querySelector('.word-list-table-container'),
            editModal: document.getElementById('editModal'),
            editForm: {
                id: document.getElementById('editId'),
                vocabulary: document.getElementById('editVocabulary'),
                meaning: document.getElementById('editMeaning'),
                hint: document.getElementById('editHint'),
                difficulty: document.getElementById('editDifficulty')
            },
            addWordButton: document.getElementById('AddWordButton'),
            saveEditButton: document.getElementById('saveEdit')
        };

        // URL 에서 페이지 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        this.state.currentPage = pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;

        // 매니저 초기화
        this.uiManager = new UIManager(this.elements);
        this.apiService = new ApiService(this.state.API_BASE_URL);
        this.paginationManager = new PaginationManager(this.state);
        this.animationManager = new AnimationManager();
        this.wordManager = new WordManager(
            this.state,
            this.elements,
            this.apiService,
            this.uiManager,
            this.paginationManager,
            this.animationManager
        );
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 페이지네이션 클릭 이벤트
        this.elements.pagination.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button?.dataset.page) return;

            e.preventDefault();
            const page = parseInt(button.dataset.page);

            if (!isNaN(page) && page !== this.state.currentPage) {
                // 현재 페이지와 다른 경우에만 로드
                this.animationManager.animatePageTransition(
                    this.elements.wordListContainer,
                    () => this.wordManager.loadWords(page)
                );
            }
        });

        // 테이블 클릭 이벤트 (수정/삭제)
        this.elements.wordList.addEventListener('click', async (e) => {
            if (this.state.isProcessing) return;

            // 클릭된 요소가 버튼인지 확인
            const button = e.target.closest('button');
            if (!button) return;

            // 버튼에 데이터 ID가 있는지 확인
            const id = button.dataset.id;
            if (!id) return;

            try {
                this.state.isProcessing = true;
                if (button.classList.contains('edit-btn')) {
                    const row = button.closest('tr');
                    this.animationManager.pulseElement(row, async () => {
                        await this.wordManager.editWord(id);
                    });
                } else if (button.classList.contains('delete-btn')) {
                    const row = button.closest('tr');
                    this.animationManager.pulseElement(row, async () => {
                        await this.wordManager.deleteWord(id);
                    });
                }
            } finally {
                this.state.isProcessing = false;
            }
        });

        // 모달 저장 버튼 클릭 이벤트
        if (this.elements.saveEditButton) {
            this.elements.saveEditButton.addEventListener('click', () => {
                this.wordManager.handleEditSave();
            });
        }

        // 브라우저 히스토리 변경 이벤트
        window.addEventListener('popstate', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const pageParam = urlParams.get('page');
            const newPage = pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;

            if (newPage !== this.state.currentPage) {
                this.state.currentPage = newPage;
                this.animationManager.animatePageTransition(
                    this.elements.wordListContainer,
                    () => this.wordManager.loadWords(this.state.currentPage)
                );
            }
        });

        // 단어 추가 버튼 클릭 이벤트
        if (this.elements.addWordButton) {
            this.elements.addWordButton.addEventListener('click', () => {
                this.animationManager.animateButtonClick(this.elements.addWordButton, () => {
                    location.href = '/word/register';
                });
            });
        }

        // 모달이 완전히 닫히면 백드롭 제거 및 상태 초기화
        if (this.elements.editModal) {
            this.elements.editModal.addEventListener('hidden.bs.modal', () => {
                this.uiManager.cleanupModal();
                this.state.isProcessing = false;
            });
        }
    }

    // 앱 초기화
    async initialize() {
        // 페이지 로드 애니메이션
        this.animationManager.animatePageLoad(() => {
            // 이벤트 리스너 설정
            this.setupEventListeners();

            // 초기 데이터 로드
            this.wordManager.loadWords(this.state.currentPage)
                .catch(error => {
                    console.error('단어 목록 로드 실패:', error);
                })
                .finally(() => {
                    this.state.isInitialLoad = false;
                });
        });
    }
}

// 애니메이션 관리 클래스
class AnimationManager {
    constructor() {
        this.isAnimeAvailable = typeof anime !== 'undefined';
    }

    // 애니메이션 가능 여부 확인
    canAnimate() {
        return this.isAnimeAvailable && typeof anime === 'function';
    }

    // 페이지 초기 로드 애니메이션
    animatePageLoad(callback) {
        if (!this.canAnimate()) {
            callback();
            return;
        }

        // 페이지 로드 효과
        anime.timeline({
            easing: 'easeOutExpo'
        })
            .add({
                targets: '.word-list-header',
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                begin: callback
            })
            .add({
                targets: '.word-list-table-container',
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 800,
                offset: '-=600'
            })
            .add({
                targets: '.word-list-pagination',
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 600,
                offset: '-=700'
            });
    }

    // 단어 행 요소 애니메이션
    animateWordRows(rows) {
        if (!this.canAnimate() || !rows.length) return;

        anime({
            targets: rows,
            opacity: [0, 1],
            translateY: [15, 0],
            delay: anime.stagger(50),
            duration: 600,
            easing: 'easeOutQuad'
        });
    }

    // 페이지 전환 애니메이션
    animatePageTransition(container, callback) {
        if (!this.canAnimate()) {
            callback();
            return;
        }

        anime.timeline({
            easing: 'easeInOutQuad'
        })
            .add({
                targets: container,
                opacity: [1, 0],
                translateY: [0, 10],
                duration: 300,
                complete: () => {
                    callback();
                }
            })
            .add({
                targets: container,
                opacity: [0, 1],
                translateY: [10, 0],
                duration: 500,
                delay: 100
            });
    }

    // 버튼 클릭 애니메이션
    animateButtonClick(button, callback) {
        if (!this.canAnimate()) {
            callback();
            return;
        }

        anime({
            targets: button,
            scale: [1, 0.95, 1],
            duration: 300,
            easing: 'easeInOutQuad',
            complete: callback
        });
    }

    // 모달 표시 애니메이션
    animateModalShow(modal) {
        if (!this.canAnimate() || !modal) return;

        const modalDialog = modal.querySelector('.modal-dialog');
        if (!modalDialog) return;

        anime({
            targets: modalDialog,
            opacity: [0, 1],
            translateY: [-20, 0],
            duration: 400,
            easing: 'easeOutQuad'
        });
    }

    // 특정 요소 펄스 애니메이션
    pulseElement(element, callback) {
        if (!this.canAnimate()) {
            callback();
            return;
        }

        anime({
            targets: element,
            scale: [1, 1.03, 1],
            boxShadow: [
                '0 0 0 rgba(103, 80, 164, 0)',
                '0 0 15px rgba(103, 80, 164, 0.5)',
                '0 0 0 rgba(103, 80, 164, 0)'
            ],
            duration: 400,
            easing: 'easeInOutQuad',
            complete: callback
        });
    }

    // 항목 삭제 애니메이션
    animateRowRemoval(row, callback) {
        if (!this.canAnimate() || !row) {
            if (callback) callback();
            return;
        }

        anime({
            targets: row,
            translateX: [0, 20],
            opacity: [1, 0],
            height: [row.offsetHeight, 0],
            marginTop: [null, 0],
            marginBottom: [null, 0],
            paddingTop: [null, 0],
            paddingBottom: [null, 0],
            duration: 500,
            easing: 'easeOutQuad',
            complete: () => {
                row.remove();
                if (callback) callback();
            }
        });
    }
}

// UI 관리 클래스
class UIManager {
    /**
     * UIManager 생성자
     * @param {Object} elements - UI 요소들의 참조
     */
    constructor(elements) {
        /** @type {Object} DOM 요소 참조 */
        this.elements = elements;
        /** @type {bootstrap.Modal|null} 모달 인스턴스 */
        this.modalInstance = null;
    }


    // 모달 정리
    cleanupModal() {
        // 백드롭 요소들 제거
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.remove();
        });

        // body 스타일 초기화
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    // 난이도 배지 HTML 생성
    getDifficultyBadge(level) {
        const badges = {
            1: ['success', '매우 쉬움'],
            2: ['info', '쉬움'],
            3: ['warning', '보통'],
            4: ['danger', '어려움'],
            5: ['dark', '매우 어려움']
        };
        const [colorClass, label] = badges[level] || ['secondary', '알 수 없음'];
        return `<span class="badge bg-${colorClass}">${label}</span>`;
    }

    // 날짜 포맷팅
    formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return '-';
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }


    // 단어 행 HTML 생성
    createWordRow(word, index) {
        const row = document.createElement('tr');
        row.style.opacity = '0';  // 초기 상태는 투명하게 설정
        row.innerHTML = `
            <td>${word.id}</td>
            <td class="fw-medium">${word.vocabulary}</td>
            <td>${word.meaning}</td>
            <td>${word.hint || '-'}</td>
            <td>${this.getDifficultyBadge(word.difficulty)}</td>
            <td>${word.author || '관리자'}</td>
            <td>${this.formatDateTime(word.createdAt)}</td>
            <td>
                <button class="btn btn-action btn-outline-primary btn-sm me-1 edit-btn js-edit-btn" data-id="${word.id}">
                <i class="bi bi-pencil-square"></i>
            </button>
                <button class="btn btn-action btn-outline-danger btn-sm delete-btn js-delete-btn" data-id="${word.id}">
                <i class="bi bi-trash"></i>
            </button>
           </td>
        `;
        return row;
    }

    // 단어 목록 업데이트
    updateWordList(words, animationManager) {
        this.elements.wordList.innerHTML = '';
        const rows = [];

        words.forEach((word, index) => {
            const row = this.createWordRow(word, index);
            this.elements.wordList.appendChild(row);
            rows.push(row);
        });

        // 행 애니메이션 적용
        if (animationManager) {
            animationManager.animateWordRows(rows);
        }
    }

    // 페이지네이션 업데이트
    updatePagination(paginationHTML) {
        this.elements.pagination.innerHTML = paginationHTML;
    }

    // 모달 표시
    showEditModal(word, animationManager) {
        // 기존 모달 인스턴스 제거
        if (this.modalInstance) {
            this.modalInstance.dispose();
            this.cleanupModal();
        }

        // 폼 값 설정
        this.elements.editForm.id.value = word.id || '';
        this.elements.editForm.vocabulary.value = word.vocabulary || '';
        this.elements.editForm.meaning.value = word.meaning || '';
        this.elements.editForm.hint.value = word.hint || '';
        this.elements.editForm.difficulty.value = word.difficulty || '3';

        // z-index 값을 명시적으로 설정하여 사이드바보다 높게 하기
        this.elements.editModal.style.zIndex = '2000';
        // 새 모달 인스턴스 생성 및 표시
        this.modalInstance = new bootstrap.Modal(this.elements.editModal);
        this.modalInstance.show();

        // 모달 애니메이션
        if (animationManager) {
            this.elements.editModal.addEventListener('shown.bs.modal', () => {
                animationManager.animateModalShow(this.elements.editModal);
                this.elements.editForm.vocabulary.focus();
            }, {once: true});
        } else {
            // 애니메이션 없이 포커스만 설정
            this.elements.editModal.addEventListener('shown.bs.modal', () => {
                this.elements.editForm.vocabulary.focus();
            }, {once: true});
        }
    }
}

// API 서비스 클래스
class ApiService {
    /**
     * ApiService 생성자
     * @param {string} baseUrl - API 베이스 URL
     */
    constructor(baseUrl) {
        /** @type {string} API 베이스 URL */
        this.baseUrl = baseUrl;
    }


    // 단어 목록 조회
    async fetchWords(page, size = 20) {
        const response = await fetch(`${this.baseUrl}/list?page=${page}&size=${size}`);
        if (!response.ok) throw new Error('단어 목록을 불러오는데 실패했습니다.');
        return response.json();
    }

    // 단어 상세 조회
    async fetchWord(id) {
        const response = await fetch(`${this.baseUrl}/${id}`);
        if (!response.ok) throw new Error('단어 정보를 불러오는데 실패했습니다.');
        return response.json();
    }

    // 단어 수정
    async updateWord(id, data) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || '단어 수정에 실패했습니다.');
        }

        return response;
    }

    // 단어 삭제
    async deleteWord(id) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('단어 삭제에 실패했습니다.');
        return response;
    }

    /**
     * 단어 중복 여부를 확인합니다
     * @param {string} vocabulary - 중복 확인할 단어
     * @param {string|null} currentId - 현재 수정 중인 단어 ID (있는 경우)
     * @returns {Promise<{exists: boolean}>} 중복 여부 결과 객체
     */
    async checkVocabularyDuplicate(vocabulary, currentId = null) {
        const response = await fetch(`${this.baseUrl}/check-duplicate?vocabulary=${encodeURIComponent(vocabulary)}${currentId ? `&excludeId=${currentId}` : ''}`);
        if (!response.ok) {
            throw new Error('중복 검사 중 오류가 발생했습니다.');
        }
        return response.json();
    }
}

// 페이지네이션 관리 클래스
class PaginationManager {
    /**
     * PaginationManager 생성자
     * @param {Object} state - 애플리케이션 상태 객체
     */
    constructor(state) {
        /** @type {Object} 애플리케이션 상태 객체 */
        this.state = state;
    }

    /**
     * 페이지 번호에 따라 URL 을 업데이트합니다
     * @param {number} page - 페이지 번호
     */
    updateUrl(page) {
        const url = new URL(window.location);
        url.searchParams.set('page', (page + 1).toString());
        window.history.pushState({}, '', url);
    }

    // 페이지네이션 버튼 HTML 생성
    generatePaginationButtons(totalPages) {
        const startPage = Math.max(0, this.state.currentPage - 2);
        const endPage = Math.min(totalPages - 1, this.state.currentPage + 2);

        const buttons = [
            this.createNavigationButton(0, 'bi-chevron-double-left', '첫 페이지', this.state.currentPage === 0),
            this.createNavigationButton(this.state.currentPage - 1, 'bi-chevron-left', '이전 페이지', this.state.currentPage === 0),
            ...this.createNumberButtons(startPage, endPage),
            this.createNavigationButton(this.state.currentPage + 1, 'bi-chevron-right', '다음 페이지', this.state.currentPage >= totalPages - 1),
            this.createNavigationButton(totalPages - 1, 'bi-chevron-double-right', '마지막 페이지', this.state.currentPage >= totalPages - 1)
        ];

        return buttons.join('');
    }

    // 네비게이션 버튼 HTML 생성
    createNavigationButton(page, icon, title, disabled) {
        return `
            <li class="page-item ${disabled ? 'disabled' : ''}">
                <button class="page-link" 
                        data-page="${page}" 
                        title="${title}"
                        ${disabled ? 'disabled' : ''}>
                    <i class="bi ${icon}"></i>
                </button>
            </li>`;
    }

    // 페이지 번호 버튼 HTML 생성
    createNumberButtons(startPage, endPage) {
        return Array.from(
            {length: endPage - startPage + 1},
            (_, i) => {
                const page = startPage + i;
                return `
                    <li class="page-item ${page === this.state.currentPage ? 'active' : ''}">
                        <button class="page-link" 
                                data-page="${page}"
                                title="${page + 1} 페이지">
                            ${page + 1}
                        </button>
                    </li>`;
            }
        );
    }
}

// 단어 관리 클래스
class WordManager {
    /**
     * WordManager 생성자
     * @param {Object} state - 애플리케이션 상태
     * @param {Object} elements - DOM 요소 참조
     * @param {ApiService} apiService - API 서비스 인스턴스
     * @param {UIManager} uiManager - UI 관리자 인스턴스
     * @param {PaginationManager} paginationManager - 페이지네이션 관리자 인스턴스
     * @param {AnimationManager} animationManager - 애니메이션 관리자 인스턴스
     */
    constructor(state, elements, apiService, uiManager, paginationManager, animationManager) {
        /** @type {Object} 애플리케이션 상태 객체 */
        this.state = state;
        /** @type {Object} DOM 요소 참조 */
        this.elements = elements;
        /** @type {ApiService} API 서비스 인스턴스 */
        this.apiService = apiService;
        /** @type {UIManager} UI 관리자 인스턴스 */
        this.uiManager = uiManager;
        /** @type {PaginationManager} 페이지네이션 관리자 인스턴스 */
        this.paginationManager = paginationManager;
        /** @type {AnimationManager} 애니메이션 관리자 인스턴스 */
        this.animationManager = animationManager;
    }


    /**
     * 단어 목록을 로드하고 UI를 업데이트합니다
     * @param {number} page - 로드할 페이지 번호
     * @returns {Promise<Object>} 단어 데이터를 포함한 응답 객체
     */
    async loadWords(page) {
        try {
            this.paginationManager.updateUrl(page);
            const data = await this.apiService.fetchWords(page, this.state.pageSize);
            this.state.currentPage = page;

            // 애니메이션 적용 여부 결정
            if (this.state.isInitialLoad) {
                this.uiManager.updateWordList(data.content, this.animationManager);
            } else {
                this.uiManager.updateWordList(data.content, this.animationManager);
            }

            this.uiManager.updatePagination(this.paginationManager.generatePaginationButtons(data.totalPages));

            return data;
        } catch (error) {
            console.error('Error:', error);
            window.showErrorToast('단어 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 단어 편집
    async editWord(id) {
        try {
            const word = await this.apiService.fetchWord(id);
            this.uiManager.showEditModal(word, this.animationManager);
        } catch (error) {
            console.error('Error:', error);
            window.showErrorToast('단어 정보를 불러오는데 실패했습니다.');
        }
    }

    // 단어 삭제
    async deleteWord(id) {
        if (!confirm('정말로 이 단어를 삭제하시겠습니까?')) return;

        try {
            const row = document.querySelector(`button[data-id="${id}"]`)?.closest('tr');

            // 삭제 API 호출
            await this.apiService.deleteWord(id);

            // 애니메이션과 함께 행 제거
            if (row && this.animationManager.canAnimate()) {
                this.animationManager.animateRowRemoval(row, () => {
                    window.showSuccessToast('단어가 삭제되었습니다.');
                    this.loadWords(this.state.currentPage);
                });
            } else {
                // 애니메이션 없이 처리
                window.showSuccessToast('단어가 삭제되었습니다.');
                await this.loadWords(this.state.currentPage);
            }
        } catch (error) {
            console.error('Error:', error);
            window.showErrorToast('단어 삭제에 실패했습니다.');
        }
    }

    // 단어 수정 저장
    async handleEditSave() {
        if (this.state.isProcessing) return;
        this.state.isProcessing = true;

        try {
            const id = this.elements.editForm.id.value;
            const data = {
                vocabulary: this.elements.editForm.vocabulary.value.trim(),
                meaning: this.elements.editForm.meaning.value.trim(),
                hint: this.elements.editForm.hint.value.trim(),
                difficulty: parseInt(this.elements.editForm.difficulty.value)
            };

            // 입력값 검증
            if (!data.vocabulary || !data.meaning) {
                window.showErrorToast('단어와 의미는 필수 입력값입니다.');
                this.state.isProcessing = false;
                return;
            }

            // 중복 검사
            /** @type {{exists: boolean}} 단어 중복 검사 결과 */
            const duplicateCheck = await this.apiService.checkVocabularyDuplicate(data.vocabulary, id);
            if (duplicateCheck.exists) {
                window.showErrorToast(`${data.vocabulary}는 이미 존재하는 단어입니다.`);
                this.state.isProcessing = false;
                return;
            }

            await this.apiService.updateWord(id, data);

            // 모달 닫기
            if (this.uiManager.modalInstance) {
                this.uiManager.modalInstance.hide();
            }

            window.showSuccessToast('단어가 수정되었습니다.');

            // 부드러운 목록 새로고침
            this.animationManager.animatePageTransition(
                this.elements.wordListContainer,
                () => this.loadWords(this.state.currentPage)
            );

        } catch (error) {
            console.error('Error:', error);
            window.showErrorToast('단어 수정에 실패했습니다.');
        } finally {
            this.state.isProcessing = false;
        }
    }
}

// 앱 인스턴스 생성 및 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 앱 초기화
    const app = new WordListApp();
    app.initialize();
});