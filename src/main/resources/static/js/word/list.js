// 단어 목록 페이지 애플리케이션
class WordListApp {
    // 생성자
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
            addWordButton: document.getElementById('AddWordButton'),
            saveEditButton: document.getElementById('saveEdit')
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
    }

    // 이벤트 리스너 설정
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

        // 모달 저장 버튼 클릭 이벤트 - 한 번만 등록되도록 수정
        if (this.elements.saveEditButton) {
            this.elements.saveEditButton.addEventListener('click', () => {
                this.wordManager.handleEditSave();
            });
        }

        // 브라우저 히스토리 변경 이벤트
        window.addEventListener('popstate', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const pageParam = urlParams.get('page');
            this.state.currentPage = pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;
            this.wordManager.loadWords(this.state.currentPage);
        });

        // 단어 추가 버튼 클릭 이벤트
        if (this.elements.addWordButton) {
            this.elements.addWordButton.addEventListener('click', () => {
                location.href = '/word/register';
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
        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 초기 데이터 로드
        try {
            await this.wordManager.loadWords(this.state.currentPage);
        } catch (error) {
            console.error('단어 목록 로드 실패:', error);
        }
    }
}

// UI 관리 클래스
class UIManager {
    constructor(elements) {
        this.elements = elements;
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

    // 토스트 메시지 표시
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

    // 단어 행 HTML 생성
    createWordRow(word, index) {
        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.05}s`;
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

    // 단어 목록 업데이트
    updateWordList(words) {
        this.elements.wordList.innerHTML = '';
        words.forEach((word, index) => {
            this.elements.wordList.appendChild(this.createWordRow(word, index));
        });
    }

    // 페이지네이션 업데이트
    updatePagination(paginationHTML) {
        this.elements.pagination.innerHTML = paginationHTML;
    }

    // 모달 백드롭이나 중복 백드롭으로 인한 문제 해결
    showEditModal(word) {
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

        // 새 모달 인스턴스 생성 및 표시
        this.modalInstance = new bootstrap.Modal(this.elements.editModal);
        this.modalInstance.show();

        // 모달이 보여진 후 입력 필드에 포커스
        this.elements.editModal.addEventListener('shown.bs.modal', () => {
            this.elements.editForm.vocabulary.focus();
        }, {once: true});
    }
}

// API 서비스 클래스
class ApiService {
    constructor(baseUrl) {
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

    // 단어 중복 확인
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
    constructor(state) {
        this.state = state;
    }

    // URL 업데이트
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
    constructor(state, elements, apiService, uiManager, paginationManager) {
        this.state = state;
        this.elements = elements;
        this.apiService = apiService;
        this.uiManager = uiManager;
        this.paginationManager = paginationManager;
    }

    // 단어 목록 로드
    async loadWords(page) {
        try {
            this.paginationManager.updateUrl(page);
            const data = await this.apiService.fetchWords(page, this.state.pageSize);
            this.state.currentPage = page;

            this.uiManager.updateWordList(data.content);
            this.uiManager.updatePagination(this.paginationManager.generatePaginationButtons(data.totalPages));
        } catch (error) {
            console.error('Error:', error);
            this.uiManager.showToast(error.message, false);
        }
    }

    // 단어 편집
    async editWord(id) {
        try {
            const word = await this.apiService.fetchWord(id);
            this.uiManager.showEditModal(word);
        } catch (error) {
            console.error('Error:', error);
            this.uiManager.showToast(error.message, false);
        }
    }

    // 단어 삭제
    async deleteWord(id) {
        if (!confirm('정말로 이 단어를 삭제하시겠습니까?')) return;

        try {
            await this.apiService.deleteWord(id);
            this.uiManager.showToast('단어가 삭제되었습니다.', true);
            await this.loadWords(this.state.currentPage);
        } catch (error) {
            console.error('Error:', error);
            this.uiManager.showToast(error.message, false);
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

            // 모달 닫기
            if (this.uiManager.modalInstance) {
                this.uiManager.modalInstance.hide();
            }

            this.uiManager.showToast('단어가 수정되었습니다.', true);

            // 목록 새로고침
            setTimeout(() => {
                this.loadWords(this.state.currentPage);
            }, 300);

        } catch (error) {
            console.error('Error:', error);
            this.uiManager.showToast(error.message, false);
        } finally {
            this.state.isProcessing = false;
        }
    }
}

// 앱 인스턴스 생성 및 초기화
document.addEventListener('DOMContentLoaded', () => {
    const app = new WordListApp();
    app.initialize();
});