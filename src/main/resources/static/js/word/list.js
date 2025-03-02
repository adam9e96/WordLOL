/**
 * 단어 목록 페이지 애플리케이션
 */
class WordListApp {
    /**
     * 생성자
     */
    constructor() {
        // 상태 설정
        this.state = {
            currentPage: 0,
            pageSize: 20,
            isProcessing: false,
            API_BASE_URL: '/api/v1/words'
        };

        // DOM 요소 캐싱
        this.elements = {
            pagination: document.getElementById('pagination'),
            wordList: document.getElementById('wordList'),
            editModal: document.getElementById('editModal'),
            editForm: {
                id: document.getElementById('editId'),
                vocabulary: document.getElementById('editVocabulary'),
                meaning: document.getElementById('editMeaning'),
                hint: document.getElementById('editHint'),
                difficulty: document.getElementById('editDifficulty')
            },
            toast: document.getElementById('toast'),
            addWordButton: document.getElementById('AddWordButton')
        };

        // URL에서 페이지 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        this.state.currentPage = pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;

        // 매니저 초기화
        this.uiManager = new UIManager(this.elements);
        this.apiService = new ApiService(this.state.API_BASE_URL);
        this.paginationManager = new PaginationManager(this.state);
        this.wordManager = new WordManager(
            this.state,
            this.elements,
            this.apiService,
            this.uiManager,
            this.paginationManager
        );
        this.animationManager = new AnimationManager();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 페이지네이션 클릭 이벤트
        this.elements.pagination.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button?.dataset.page) return;

            e.preventDefault();
            const page = parseInt(button.dataset.page);
            if (!isNaN(page)) {
                this.wordManager.loadWords(page);
            }
        });

        // 테이블 클릭 이벤트 (수정/삭제)
        this.elements.wordList.addEventListener('click', async (e) => {
            if (this.state.isProcessing) return;

            const button = e.target.closest('button');
            if (!button) return;

            const id = button.dataset.id;
            if (!id) return;

            try {
                this.state.isProcessing = true;
                if (button.classList.contains('edit-btn')) {
                    await this.wordManager.editWord(id);
                } else if (button.classList.contains('delete-btn')) {
                    await this.wordManager.deleteWord(id);
                }
            } finally {
                this.state.isProcessing = false;
            }
        });

        // 모달 저장 버튼 클릭 이벤트
        document.getElementById('saveEdit')?.addEventListener('click', () => {
            this.wordManager.handleEditSave();
        });

        // 브라우저 히스토리 변경 이벤트
        window.addEventListener('popstate', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const pageParam = urlParams.get('page');
            this.state.currentPage = pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;
            this.wordManager.loadWords(this.state.currentPage);
        });

        // 단어 추가 버튼 클릭 이벤트
        this.elements.addWordButton?.addEventListener('click', () => {
            location.href = '/word/register';
        });
    }

    /**
     * 애플리케이션 초기화
     */
    async initialize() {
        // anime.js 로드 확인
        if (typeof anime !== 'undefined') {
            console.log('anime.js가 로드되었습니다. 애니메이션 모드로 실행합니다.');
        } else {
            console.log('anime.js가 로드되지 않았습니다. 기본 모드로 실행합니다.');
        }

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 초기 데이터 로드
        try {
            await this.wordManager.loadWords(this.state.currentPage);
            console.log('단어 목록 로드 완료');
        } catch (error) {
            console.error('단어 목록 로드 실패:', error);
        }
    }
}

/**
 * UI 관리 클래스
 */
class UIManager {
    /**
     * 생성자
     * @param {Object} elements - DOM 요소
     */
    constructor(elements) {
        this.elements = elements;
    }

    /**
     * 난이도 배지 HTML 생성
     * @param {number} level - 난이도 레벨
     * @returns {string} - 배지 HTML
     */
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

    /**
     * 날짜 포맷팅
     * @param {string} dateTimeStr - 날짜 문자열
     * @returns {string} - 포맷된 날짜
     */
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

    /**
     * 토스트 메시지 표시
     * @param {string} message - 메시지
     * @param {boolean} isSuccess - 성공 여부
     */
    showToast(message, isSuccess = true) {
        const toastBody = this.elements.toast.querySelector('.toast-body');
        const existingToast = bootstrap.Toast.getInstance(this.elements.toast);

        if (existingToast) {
            existingToast.dispose();
        }

        this.elements.toast.className = `toast align-items-center text-white bg-${isSuccess ? 'success' : 'danger'}`;
        toastBody.textContent = message;

        new bootstrap.Toast(this.elements.toast, {
            delay: 2000,
            autohide: true
        }).show();
    }

    /**
     * 단어 행 HTML 생성
     * @param {Object} word - 단어 객체
     * @param {number} index - 인덱스
     * @returns {HTMLElement} - 행 요소
     */
    createWordRow(word, index) {
        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.05}s`;
        row.classList.add('word-row');
        row.dataset.id = word.id;

        row.innerHTML = `
      <td>${word.id}</td>
      <td class="fw-medium">${word.vocabulary}</td>
      <td>${word.meaning}</td>
      <td>${word.hint || '-'}</td>
      <td>${this.getDifficultyBadge(word.difficulty)}</td>
      <td>${word.author || '관리자'}</td>
      <td>${this.formatDateTime(word.createdAt)}</td>
      <td>
        <button class="btn btn-action btn-outline-primary btn-sm me-1 edit-btn" data-id="${word.id}">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-action btn-outline-danger btn-sm delete-btn" data-id="${word.id}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
        return row;
    }

    /**
     * 단어 목록 업데이트
     * @param {Array} words - 단어 배열
     */
    updateWordList(words) {
        this.elements.wordList.innerHTML = '';
        const fragment = document.createDocumentFragment();

        words.forEach((word, index) => {
            fragment.appendChild(this.createWordRow(word, index));
        });

        this.elements.wordList.appendChild(fragment);
    }

    /**
     * 페이지네이션 업데이트
     * @param {string} paginationHTML - 페이지네이션 HTML
     */
    updatePagination(paginationHTML) {
        this.elements.pagination.innerHTML = paginationHTML;
    }

    /**
     * 수정 모달 표시
     * @param {Object} word - 단어 객체
     */
    showEditModal(word) {
        console.log("수정 모달 ID:", word.id);

        // 모달 폼 요소 참조
        const editId = document.getElementById('editId');
        const editVocabulary = document.getElementById('editVocabulary');
        const editMeaning = document.getElementById('editMeaning');
        const editHint = document.getElementById('editHint');
        const editDifficulty = document.getElementById('editDifficulty');

        // 기존 모달 인스턴스 제거
        const existingModal = bootstrap.Modal.getInstance(this.elements.editModal);
        if (existingModal) {
            existingModal.dispose();
        }

        // 폼 데이터 설정
        editId.value = word.id || '';
        editVocabulary.value = word.vocabulary || '';
        editMeaning.value = word.meaning || '';
        editHint.value = word.hint || '';
        editDifficulty.value = word.difficulty || 3;

        // 새 모달 인스턴스 생성 및 표시
        const modal = new bootstrap.Modal(this.elements.editModal);
        modal.show();

        // 모달이 완전히 표시된 후 입력 필드에 포커스
        this.elements.editModal.addEventListener('shown.bs.modal', () => {
            editVocabulary.focus();

            // 애니메이션이 로드되어 있으면 적용
            if (typeof anime !== 'undefined') {
                const animationManager = new AnimationManager();
                animationManager.animateModal();
            }
        }, {once: true});
    }
}


/**
 * API 서비스 클래스
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
     * 단어 목록 조회
     * @param {number} page - 페이지 번호
     * @param {number} size - 페이지 크기
     * @returns {Promise<Object>} - 응답 데이터
     */
    async fetchWords(page, size = 20) {
        const response = await fetch(`${this.baseUrl}/list?page=${page}&size=${size}`);
        if (!response.ok) throw new Error('단어 목록을 불러오는데 실패했습니다.');
        return response.json();
    }

    /**
     * 단어 상세 조회
     * @param {string} id - 단어 ID
     * @returns {Promise<Object>} - 단어 데이터
     */
    async fetchWord(id) {
        const response = await fetch(`${this.baseUrl}/${id}`);
        if (!response.ok) throw new Error('단어 정보를 불러오는데 실패했습니다.');
        return response.json();
    }

    /**
     * 단어 수정
     * @param {string} id - 단어 ID
     * @param {Object} data - 수정 데이터
     * @returns {Promise<Object|null>} - 응답 데이터
     */
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

        // 204 No Content 응답인 경우 처리
        if (response.status === 204) {
            return null;
        }

        // JSON 응답이 있는 경우 처리
        return response.json().catch(() => null);
    }

    /**
     * 단어 삭제
     * @param {string} id - 단어 ID
     * @returns {Promise<Response>} - 응답 객체
     */
    async deleteWord(id) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('단어 삭제에 실패했습니다.');
        return response;
    }

    /**
     * 단어 중복 확인
     * @param {string} vocabulary - 단어
     * @param {string|null} currentId - 현재 단어 ID
     * @returns {Promise<Object>} - 응답 데이터
     */
    async checkVocabularyDuplicate(vocabulary, currentId = null) {
        const response = await fetch(`${this.baseUrl}/check-duplicate?vocabulary=${encodeURIComponent(vocabulary)}${currentId ? `&excludeId=${currentId}` : ''}`);
        if (!response.ok) {
            throw new Error('중복 검사 중 오류가 발생했습니다.');
        }
        return response.json();
    }
}

/**
 * 페이지네이션 관리 클래스
 */
class PaginationManager {
    /**
     * 생성자
     * @param {Object} state - 앱 상태
     */
    constructor(state) {
        this.state = state;
    }

    /**
     * URL 업데이트
     * @param {number} page - 페이지 번호
     */
    updateUrl(page) {
        const url = new URL(window.location);
        url.searchParams.set('page', (page + 1).toString());
        window.history.pushState({}, '', url);
    }

    /**
     * 페이지네이션 버튼 HTML 생성
     * @param {number} totalPages - 전체 페이지 수
     * @returns {string} - 페이지네이션 HTML
     */
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

    /**
     * 네비게이션 버튼 HTML 생성
     * @param {number} page - 페이지 번호
     * @param {string} icon - 아이콘 클래스
     * @param {string} title - 버튼 타이틀
     * @param {boolean} disabled - 비활성화 여부
     * @returns {string} - 버튼 HTML
     */
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

    /**
     * 페이지 번호 버튼 HTML 생성
     * @param {number} startPage - 시작 페이지
     * @param {number} endPage - 끝 페이지
     * @returns {Array<string>} - 버튼 HTML 배열
     */
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

/**
 * 단어 관리 클래스
 */
class WordManager {
    /**
     * 생성자
     * @param {Object} state - 앱 상태
     * @param {Object} elements - DOM 요소
     * @param {ApiService} apiService - API 서비스
     * @param {UIManager} uiManager - UI 관리자
     * @param {PaginationManager} paginationManager - 페이지네이션 관리자
     */
    constructor(state, elements, apiService, uiManager, paginationManager) {
        this.state = state;
        this.elements = elements;
        this.apiService = apiService;
        this.uiManager = uiManager;
        this.paginationManager = paginationManager;
        this.animationManager = new AnimationManager();
    }

    /**
     * 단어 목록 로드
     * @param {number} page - 페이지 번호
     */
    async loadWords(page) {
        try {
            this.paginationManager.updateUrl(page);
            const data = await this.apiService.fetchWords(page, this.state.pageSize);
            this.state.currentPage = page;

            this.uiManager.updateWordList(data.content);
            this.uiManager.updatePagination(this.paginationManager.generatePaginationButtons(data.totalPages));

            // 애니메이션 적용
            if (typeof anime !== 'undefined') {
                this.animationManager.animateWordList();
            }
        } catch (error) {
            console.error('Error:', error);
            this.uiManager.showToast(error.message, false);
        }
    }

    /**
     * 단어 편집
     * @param {string} id - 단어 ID
     */
    async editWord(id) {
        try {
            const word = await this.apiService.fetchWord(id);
            this.uiManager.showEditModal(word);

            // 모달 애니메이션
            if (typeof anime !== 'undefined') {
                this.animationManager.animateModal();
            }
        } catch (error) {
            console.error('Error:', error);
            this.uiManager.showToast(error.message, false);
        }
    }

    /**
     * 단어 삭제
     * @param {string} id - 단어 ID
     */
    async deleteWord(id) {
        if (!confirm('정말로 이 단어를 삭제하시겠습니까?')) return;

        try {
            // 삭제 전 애니메이션
            if (typeof anime !== 'undefined') {
                await this.animationManager.animateDeleteRow(id);
            }

            // API 호출로 삭제
            await this.apiService.deleteWord(id);
            this.uiManager.showToast('단어가 삭제되었습니다.', true);
            await this.loadWords(this.state.currentPage);
        } catch (error) {
            console.error('Error:', error);
            this.uiManager.showToast(error.message, false);
        }
    }

    /**
     * 단어 수정 저장
     */
    async handleEditSave() {
        if (this.state.isProcessing) return;
        this.state.isProcessing = true;

        const modal = bootstrap.Modal.getInstance(this.elements.editModal);

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
                this.uiManager.showToast('단어와 의미는 필수 입력값입니다.', false);
                this.state.isProcessing = false;
                return;
            }

            // 중복 검사
            const duplicateCheck = await this.apiService.checkVocabularyDuplicate(data.vocabulary, id);
            if (duplicateCheck.exists) {
                this.uiManager.showToast(`'${data.vocabulary}'는 이미 존재하는 단어입니다.`, false);
                this.state.isProcessing = false;
                return;
            }

            await this.apiService.updateWord(id, data);

            // 저장 성공 애니메이션
            if (typeof anime !== 'undefined') {
                this.animationManager.animateFormSuccess();
            }

            // 모달 닫기 (성공한 경우에만)
            modal?.hide();
            this.uiManager.showToast('단어가 수정되었습니다.', true);

            // 약간의 지연 후 목록 새로고침
            setTimeout(() => {
                this.loadWords(this.state.currentPage);
            }, 300);

        } catch (error) {
            console.error('Error:', error);
            this.uiManager.showToast(error.message, false);

            // 저장 실패 애니메이션
            if (typeof anime !== 'undefined') {
                this.animationManager.animateFormError();
            }
        } finally {
            this.state.isProcessing = false;
        }
    }
}

/**
 * 애니메이션 관리 클래스
 */
class AnimationManager {
    /**
     * 생성자
     */
    constructor() {
        // 애니메이션 참조 상태
        this.animations = {};
    }

    /**
     * 단어 목록 애니메이션
     */
    animateWordList() {
        const rows = document.querySelectorAll('.word-row');
        if (rows.length === 0) return;

        // 초기 상태 설정
        anime.set(rows, {
            opacity: 0,
            translateY: 20
        });

        // 등장 애니메이션
        this.animations.rows = anime({
            targets: rows,
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(50),
            duration: 600,
            easing: 'easeOutCubic'
        });
    }

    /**
     * 단어 삭제 애니메이션
     * @param {string} id - 삭제할 단어 ID
     * @returns {Promise} - 애니메이션 완료 Promise
     */
    animateDeleteRow(id) {
        return new Promise((resolve) => {
            const row = document.querySelector(`.word-row[data-id="${id}"]`);
            if (!row) {
                resolve();
                return;
            }

            anime({
                targets: row,
                opacity: [1, 0],
                translateX: [0, 100],
                backgroundColor: ['rgba(255,255,255,0)', 'rgba(255,120,120,0.2)'],
                duration: 500,
                easing: 'easeOutQuad',
                complete: () => {
                    resolve();
                }
            });
        });
    }

    /**
     * 모달 애니메이션
     */
    animateModal() {
        const modal = document.querySelector('.modal-content');
        if (!modal) return;

        anime({
            targets: modal,
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 300,
            easing: 'easeOutCubic'
        });

        // 입력 필드 애니메이션
        const inputs = modal.querySelectorAll('input, select');
        anime({
            targets: inputs,
            opacity: [0, 1],
            translateY: [10, 0],
            delay: anime.stagger(50),
            duration: 400,
            easing: 'easeOutQuad'
        });
    }

    /**
     * 폼 저장 성공 애니메이션
     */
    animateFormSuccess() {
        const modal = document.querySelector('.modal-content');
        if (!modal) return;

        anime({
            targets: modal,
            backgroundColor: [
                'rgba(255,255,255,1)',
                'rgba(200,255,200,0.5)',
                'rgba(255,255,255,1)'
            ],
            duration: 1000,
            easing: 'easeOutExpo'
        });
    }

    /**
     * 폼 저장 실패 애니메이션
     */
    animateFormError() {
        const modal = document.querySelector('.modal-content');
        if (!modal) return;

        anime({
            targets: modal,
            translateX: [0, -10, 10, -10, 10, 0],
            duration: 500,
            easing: 'easeInOutQuad'
        });
    }

    /**
     * 페이지네이션 애니메이션
     */
    animatePagination() {
        const items = document.querySelectorAll('.page-item');
        if (items.length === 0) return;

        anime({
            targets: items,
            scale: [0.9, 1],
            opacity: [0, 1],
            delay: anime.stagger(50),
            duration: 400,
            easing: 'easeOutQuad'
        });
    }
}

// 앱 인스턴스 생성 및 초기화
document.addEventListener('DOMContentLoaded', () => {
    const app = new WordListApp();
    app.initialize();
});