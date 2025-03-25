class SearchApp {
    constructor() {
        this.state = {
            currentPage: initialPage || 0,
            pageSize: 20,
            keyword: initialKeyword || '',
            isProcessing: false,
            API_BASE_URL: '/api/v1/words'
        };
        this.elements = {
            pagination: document.getElementById('pagination'),
            wordList: document.getElementById('wordList'),
            resultCount: document.getElementById('resultCount')
        };
        this.uiManager = new UIManager(this.elements);
        this.apiService = new ApiService(this.state.API_BASE_URL);
        this.paginationManager = new PaginationManager(this.state, this.uiManager);
        this.wordManager = new WordManager(this.state, this.apiService, this.uiManager);
    }

    initialize() {
        console.log('검색 페이지 초기화 시작');
        console.log('검색 키워드:', this.state.keyword);
        console.log('초기 페이지:', this.state.currentPage);

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 초기 검색 결과 로드
        this.loadSearchResults(this.state.currentPage)
            .then(() => console.log('검색 결과 로드 완료'))
            .catch(error => console.error('검색 결과 로드 실패:', error));
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 페이지네이션 클릭 이벤트
        this.elements.pagination.addEventListener('click', (e) => this.handlePaginationClick(e));

        // 테이블 클릭 이벤트 (수정/삭제)
        this.elements.wordList.addEventListener('click', (e) => this.handleTableClick(e));

        // 브라우저 뒤로가기/앞으로가기 이벤트
        window.addEventListener('popstate', () => this.handlePopState());
    }

    /**
     * 페이지네이션 클릭 핸들러
     * @param {Event} e - 클릭 이벤트
     */
    handlePaginationClick(e) {
        const button = e.target.closest('button');
        if (!button?.dataset.page) return;

        e.preventDefault();
        const page = parseInt(button.dataset.page);
        if (!isNaN(page)) {
            this.loadSearchResults(page);
        }
    }

    /**
     * 테이블 클릭 핸들러 (수정/삭제 버튼)
     * @param {Event} e - 클릭 이벤트
     */
    handleTableClick(e) {
        if (this.state.isProcessing) return;

        const button = e.target.closest('button');
        if (!button) return;

        const id = button.dataset.id;
        if (!id) return;

        try {
            this.state.isProcessing = true;

            if (button.classList.contains('edit-btn')) {
                this.wordManager.editWord(id);
            } else if (button.classList.contains('delete-btn')) {
                this.wordManager.deleteWord(id)
                    .then(() => this.loadSearchResults(this.state.currentPage));
            }
        } finally {
            this.state.isProcessing = false;
        }
    }

    /**
     * 브라우저 history 변경 이벤트 핸들러
     */
    handlePopState() {
        const url = new URL(window.location);
        this.state.currentPage = parseInt(url.searchParams.get('page') || '0');
        this.state.keyword = url.searchParams.get('keyword') || '';

        this.loadSearchResults(this.state.currentPage);
    }

    /**
     * 검색 결과 로드
     * @param {number} page - 페이지 번호
     * @returns {Promise<Object>} 검색 결과 데이터
     */
    async loadSearchResults(page) {
        try {
            console.log('검색 결과 로드 시작: 페이지 ' + page);
            this.state.currentPage = page;
            this.paginationManager.updateUrl(page);

            const data = await this.apiService.searchWords(
                this.state.keyword,
                page,
                this.state.pageSize
            );

            this.uiManager.updateWordList(data.content, data.totalElements);
            this.uiManager.updatePagination(
                data.totalPages,
                this.paginationManager.generatePaginationButtons(data.totalPages)
            );

            return data;
        } catch (error) {
            console.error('검색 결과 로드 오류:', error);
            window.showErrorToast('검색 결과를 불러오는데 실패했습니다.');
            throw error;
        }
    }
}

/**
 * UI 관리 클래스
 * UI 요소 업데이트 및 관련 기능 제공
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
     * 난이도 배지 HTML 생성
     * @param {number} level - 난이도 레벨
     * @returns {string} 배지 HTML
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
     * 날짜 시간 포맷팅
     * @param {string} dateTimeStr - ISO 형식 날짜 문자열
     * @returns {string} 포맷팅된 날짜 문자열
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
     * 단어 행 요소 생성
     * @param {Object} word - 단어 객체
     * @param {number} index - 인덱스 (애니메이션 지연용)
     * @returns {HTMLElement} 생성된 행 요소
     */
    createWordRow(word, index) {
        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.05}s`;
        row.innerHTML = `
        <td>${word.id}</td>
        <td class="fw-medium">${word.vocabulary}</td>
        <td>${word.meaning}</td>
        <td>${word.hint || '-'}</td>
        <td>${this.getDifficultyBadge(word.difficulty)}</td>
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
     * @param {Array<Object>} words - 단어 객체 배열
     * @param {number} totalElements - 전체 항목 수
     */
    updateWordList(words, totalElements) {
        this.elements.wordList.innerHTML = '';

        if (words.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7" class="text-center py-4">검색 결과가 없습니다.</td>';
            this.elements.wordList.appendChild(emptyRow);

            if (this.elements.resultCount) {
                this.elements.resultCount.textContent = '0';
            }
            return;
        }

        words.forEach((word, index) => {
            this.elements.wordList.appendChild(this.createWordRow(word, index));
        });

        if (this.elements.resultCount) {
            this.elements.resultCount.textContent = totalElements;
        }
    }

    /**
     * 페이지네이션 업데이트
     * @param {number} totalPages - 전체 페이지 수
     * @param {string} paginationButtons - 페이지네이션 버튼 HTML
     */
    updatePagination(totalPages, paginationButtons) {
        this.elements.pagination.innerHTML = paginationButtons;
    }

    /**
     * 단어 수정 모달 표시
     * @param {Object} word - 단어 객체
     * @param {Function} saveCallback - 저장 콜백 함수
     */
    showEditModal(word, saveCallback) {
        // 기존 모달이 있으면 제거
        const existingModal = document.getElementById('editModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 모달 생성
        const modalHTML = `
        <div class="modal fade" id="editModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">단어 수정</h5>
                        <button class="btn-close" data-bs-dismiss="modal" type="button"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editForm">
                            <input id="editId" type="hidden" value="${word.id}">
                            <div class="form-group mb-3">
                                <label class="form-label" for="editVocabulary">영단어</label>
                                <input class="form-control" id="editVocabulary" required type="text" value="${word.vocabulary}">
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label" for="editMeaning">의미</label>
                                <input class="form-control" id="editMeaning" required type="text" value="${word.meaning}">
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label" for="editHint">힌트</label>
                                <input class="form-control" id="editHint" type="text" value="${word.hint || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="editDifficulty">난이도</label>
                                <select class="form-select" id="editDifficulty" required>
                                    <option value="1" ${word.difficulty === 1 ? 'selected' : ''}>매우 쉬움</option>
                                    <option value="2" ${word.difficulty === 2 ? 'selected' : ''}>쉬움</option>
                                    <option value="3" ${word.difficulty === 3 ? 'selected' : ''}>보통</option>
                                    <option value="4" ${word.difficulty === 4 ? 'selected' : ''}>어려움</option>
                                    <option value="5" ${word.difficulty === 5 ? 'selected' : ''}>매우 어려움</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-cancel" data-bs-dismiss="modal" type="button">취소</button>
                        <button class="btn btn-add_word" id="saveEdit" type="button">저장</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        // 모달을 body에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // 모달 인스턴스 생성 및 표시
        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();

        // 저장 버튼에 이벤트 리스너 추가
        document.getElementById('saveEdit').addEventListener('click', saveCallback);
    }
}

/**
 * API 서비스 클래스
 * 서버와의 통신 처리
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
     * 단어 검색 API 호출
     * @param {string} keyword - 검색 키워드
     * @param {number} page - 페이지 번호
     * @param {number} size - 페이지 크기
     * @returns {Promise<Object>} 검색 결과
     */
    async searchWords(keyword, page, size) {
        try {
            console.log(`검색 요청: keyword=${keyword}, page=${page}`);

            const url = new URL(`${this.baseUrl}/search`, window.location.origin);
            url.searchParams.append('page', page);
            url.searchParams.append('size', size);

            if (keyword) {
                url.searchParams.append('keyword', keyword);
            }

            console.log(`API 요청 URL: ${url.toString()}`);
            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API 오류 응답 (${response.status}): ${errorText}`);
                throw new Error('검색 결과를 불러오는데 실패했습니다.');
            }

            const data = await response.json();
            console.log('검색 결과:', data);
            return data;
        } catch (error) {
            console.error('API 호출 중 오류:', error);
            throw error;
        }
    }

    /**
     * 단어 상세 조회 API 호출
     * @param {number} id - 단어 ID
     * @returns {Promise<Object>} 단어 객체
     */
    async fetchWord(id) {
        const response = await fetch(`${this.baseUrl}/${id}`);
        if (!response.ok) throw new Error('단어 정보를 불러오는데 실패했습니다.');
        return response.json();
    }

    /**
     * 단어 수정 API 호출
     * @param {number} id - 단어 ID
     * @param {Object} data - 수정할 단어 데이터
     * @returns {Promise<Response>} API 응답
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

        return response;
    }

    /**
     * 단어 삭제 API 호출
     * @param {number} id - 단어 ID
     * @returns {Promise<Response>} API 응답
     */
    async deleteWord(id) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('단어 삭제에 실패했습니다.');
        return response;
    }
}

/**
 * 페이지네이션 관리 클래스
 */
class PaginationManager {
    /**
     * 생성자
     * @param {Object} state - 애플리케이션 상태
     * @param {UIManager} uiManager - UI 관리자
     */
    constructor(state, uiManager) {
        this.state = state;
        this.uiManager = uiManager;
    }

    /**
     * URL 업데이트
     * @param {number} page - 페이지 번호
     */
    updateUrl(page) {
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState({}, '', url);
    }

    /**
     * 페이지네이션 버튼 HTML 생성
     * @param {number} totalPages - 전체 페이지 수
     * @returns {string} 페이지네이션 버튼 HTML
     */
    generatePaginationButtons(totalPages) {
        if (totalPages <= 1) return '';

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
     * @param {string} title - 툴팁 제목
     * @param {boolean} disabled - 비활성화 여부
     * @returns {string} 버튼 HTML
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
     * @returns {Array<string>} 버튼 HTML 배열
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
     * @param {Object} state - 애플리케이션 상태
     * @param {ApiService} apiService - API 서비스
     * @param {UIManager} uiManager - UI 관리자
     */
    constructor(state, apiService, uiManager) {
        this.state = state;
        this.apiService = apiService;
        this.uiManager = uiManager;
    }

    /**
     * 단어 수정
     * @param {number} id - 단어 ID
     */
    async editWord(id) {
        try {
            const word = await this.apiService.fetchWord(id);
            this.uiManager.showEditModal(word, () => this.handleEditSave());
        } catch (error) {
            console.error('단어 조회 오류:', error);
            window.showErrorToast('단어 정보를 불러오는데 실패했습니다.');
            this.state.isProcessing = false;
        }
    }

    /**
     * 단어 삭제
     * @param {number} id - 단어 ID
     */
    async deleteWord(id) {
        if (!confirm('정말로 이 단어를 삭제하시겠습니까?')) {
            this.state.isProcessing = false;
            return;
        }

        try {
            await this.apiService.deleteWord(id);
            window.showSuccessToast('단어가 삭제되었습니다.');
            return true;
        } catch (error) {
            console.error('단어 삭제 오류:', error);
            window.showErrorToast('단어 삭제에 실패했습니다.');
            this.state.isProcessing = false;
            return false;
        }
    }

    /**
     * 단어 수정 저장 처리
     */
    async handleEditSave() {
        const id = document.getElementById('editId').value;
        const data = {
            vocabulary: document.getElementById('editVocabulary').value.trim(),
            meaning: document.getElementById('editMeaning').value.trim(),
            hint: document.getElementById('editHint').value.trim(),
            difficulty: parseInt(document.getElementById('editDifficulty').value)
        };

        try {
            await this.apiService.updateWord(id, data);
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            window.showSuccessToast('단어가 수정되었습니다.');

            // 검색 결과 다시 로드 이벤트 발생
            const customEvent = new CustomEvent('wordUpdated', {detail: {id}});
            document.dispatchEvent(customEvent);
        } catch (error) {
            console.error('단어 수정 오류:', error);
            window.showErrorToast('단어 수정에 실패했습니다.');
        } finally {
            this.state.isProcessing = false;
        }
    }
}


// 애플리케이션 인스턴스 생성 및 초기화
document.addEventListener('DOMContentLoaded', function () {
    const app = new SearchApp();
    app.initialize();

    // 단어 수정 완료 이벤트 리스너
    document.addEventListener('wordUpdated', () => {
        app.loadSearchResults(app.state.currentPage);
    });
});