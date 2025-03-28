import apiService from '../utils/api-service.js';
import {formatDateTime, getDifficultyBadge} from '../utils/formatting-utils.js';
import modalService from "../utils/modal-service.js";

class WordListApp {
    constructor() {
        this.state = {
            currentPage: 0,
            pageSize: 20,
            isProcessing: false,
            isInitialLoad: true
        };

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

        this.uiManager = new UIManager(this.elements);
        this.paginationManager = new PaginationManager(this.state);
        this.wordManager = new WordManager(
            this.state,
            this.elements,
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

            if (!isNaN(page) && page !== this.state.currentPage) {
                // 현재 페이지와 다른 경우에만 로드
                this.wordManager.loadWords(page);
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
                    await this.wordManager.editWord(id);
                } else if (button.classList.contains('delete-btn')) {
                    await this.wordManager.deleteWord(id);
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
                this.wordManager.loadWords(this.state.currentPage);
            }
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

    async initialize() {
        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 초기 데이터 로드
        this.wordManager.loadWords(this.state.currentPage)
            .catch(error => {
                console.error('단어 목록 로드 실패:', error);
                window.showErrorToast('단어 목록을 불러오는데 실패했습니다.');
            })
            .finally(() => {
                this.state.isInitialLoad = false;
            });
    }
}

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

    // 단어 행 HTML 생성
    createWordRow(word, index) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${word.id}</td>
            <td class="fw-medium">${word.vocabulary}</td>
            <td>${word.meaning}</td>
            <td>${word.hint || '-'}</td>
            <td>${getDifficultyBadge(word.difficulty)}</td>
            <td>${word.author || '관리자'}</td>
            <td>${formatDateTime(word.createdAt)}</td>
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

        if (words.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="8" class="text-center py-4">검색 결과가 없습니다.</td>';
            this.elements.wordList.appendChild(emptyRow);
            return;
        }

        words.forEach((word, index) => {
            const row = this.createWordRow(word, index);
            this.elements.wordList.appendChild(row);
        });
    }

    // 페이지네이션 업데이트
    updatePagination(paginationHTML) {
        this.elements.pagination.innerHTML = paginationHTML;
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
     * @param {UIManager} uiManager - UI 관리자 인스턴스
     * @param {PaginationManager} paginationManager - 페이지네이션 관리자 인스턴스
     */
    constructor(state, elements, uiManager, paginationManager) {
        /** @type {Object} 애플리케이션 상태 객체 */
        this.state = state;
        /** @type {Object} DOM 요소 참조 */
        this.elements = elements;
        /** @type {UIManager} UI 관리자 인스턴스 */
        this.uiManager = uiManager;
        /** @type {PaginationManager} 페이지네이션 관리자 인스턴스 */
        this.paginationManager = paginationManager;
    }

    /**
     * 단어 목록을 로드하고 UI를 업데이트합니다
     * @param {number} page - 로드할 페이지 번호
     * @returns {Promise<Object>} 단어 데이터를 포함한 응답 객체
     */
    async loadWords(page) {
        try {
            this.paginationManager.updateUrl(page);
            const data = await apiService.fetchWords(page, this.state.pageSize);
            this.state.currentPage = page;

            this.uiManager.updateWordList(data.content);
            this.uiManager.updatePagination(this.paginationManager.generatePaginationButtons(data.totalPages));

            return data;
        } catch (error) {
            console.error('단어 목록 로드 오류:', error);
            window.showErrorToast('단어 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    async editWord(id) {
        try {
            const word = await apiService.fetchWord(id);
            // this.uiManager.showEditModal(word);
            // 모달 서비스를 사용하여 수정 모달 생성
            modalService.createEditModal(word, (formData) => {

                this.handleEditSave(formData);

            });
        } catch (error) {
            console.error('단어 조회 오류:', error);
            window.showErrorToast('단어 정보를 불러오는데 실패했습니다.');
        }
    }

    async deleteWord(id) {
        // 모달 서비스를 사용하여 삭제 확인 모달 생성
        modalService.createDeleteConfirmModal(id, async (wordId) => {
            try {
                // 삭제 API 호출
                await apiService.deleteWord(wordId);

                // 성공 메시지 표시
                window.showSuccessToast('단어가 삭제되었습니다.');

                // 모달 닫기
                modalService.closeAllModals();

                // 목록 새로고침
                await this.loadWords(this.state.currentPage);
            } catch (error) {
                console.error('단어 삭제 오류:', error);
                window.showErrorToast('단어 삭제에 실패했습니다.');
            }
        });
    }

    // 단어 수정 저장
    async handleEditSave(formData) {
        if (this.state.isProcessing) {
            return;
        }

        this.state.isProcessing = true;

        try {
            // 모달 서비스에서 전달한 폼 데이터 사용
            const id = formData ? formData.id : this.elements.editForm.id.value;
            const data = formData ? {
                vocabulary: formData.vocabulary,
                meaning: formData.meaning,
                hint: formData.hint,
                difficulty: formData.difficulty
            } : {
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

            await apiService.updateWord(id, data);

            window.showSuccessToast('단어가 수정되었습니다.');

            if (formData && modalService.closeModal) {
                modalService.closeAllModals();
            }

            // 목록 새로고침
            await this.loadWords(this.state.currentPage);
        } catch (error) {
            console.error('단어 수정 오류:', error);
            window.showErrorToast('단어 수정에 실패했습니다.');
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