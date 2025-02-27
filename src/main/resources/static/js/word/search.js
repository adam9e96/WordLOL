// 상태 관리
const State = {
    currentPage: initialPage || 0,
    pageSize: 20,
    keyword: initialKeyword || '',
    isProcessing: false,
    API_BASE_URL: '/api/v1/words'
};

// DOM 요소 캐싱
const Elements = {
    pagination: document.getElementById('pagination'),
    wordList: document.getElementById('wordList'),
    toast: document.getElementById('toast'),
    resultCount: document.getElementById('resultCount')
};

// UI 관리
const UIManager = {
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
    },

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
    },

    showToast(message, isSuccess = true) {
        const toastBody = Elements.toast.querySelector('.toast-body');
        const existingToast = bootstrap.Toast.getInstance(Elements.toast);

        if (existingToast) {
            existingToast.dispose();
        }

        Elements.toast.className = `toast align-items-center text-white bg-${isSuccess ? 'success' : 'danger'}`;
        toastBody.textContent = message;

        new bootstrap.Toast(Elements.toast, {
            delay: 2000,
            autohide: true
        }).show();
    },

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
    },

    updateWordList(words, totalElements) {
        Elements.wordList.innerHTML = '';

        if (words.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7" class="text-center py-4">검색 결과가 없습니다.</td>';
            Elements.wordList.appendChild(emptyRow);

            if (Elements.resultCount) {
                Elements.resultCount.textContent = '0';
            }
            return;
        }

        words.forEach((word, index) => {
            Elements.wordList.appendChild(this.createWordRow(word, index));
        });

        if (Elements.resultCount) {
            Elements.resultCount.textContent = totalElements;
        }
    },

    updatePagination(totalPages) {
        const paginationButtons = PaginationManager.generatePaginationButtons(totalPages);
        Elements.pagination.innerHTML = paginationButtons;
    }
};

// API 서비스
const ApiService = {
    async searchWords(page) {
        try {
            console.log(`검색 요청: keyword=${State.keyword}, page=${page}`);

            const url = new URL(`${State.API_BASE_URL}/search`, window.location.origin);
            url.searchParams.append('page', page);
            url.searchParams.append('size', State.pageSize);

            if (State.keyword) {
                url.searchParams.append('keyword', State.keyword);
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
    },

    async fetchWord(id) {
        const response = await fetch(`${State.API_BASE_URL}/${id}`);
        if (!response.ok) throw new Error('단어 정보를 불러오는데 실패했습니다.');
        return response.json();
    },

    async updateWord(id, data) {
        const response = await fetch(`${State.API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || '단어 수정에 실패했습니다.');
        }

        return response;
    },

    async deleteWord(id) {
        const response = await fetch(`${State.API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('단어 삭제에 실패했습니다.');
        return response;
    }
};

// 페이지네이션 관리
const PaginationManager = {
    updateUrl(page) {
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState({}, '', url);
    },

    generatePaginationButtons(totalPages) {
        if (totalPages <= 1) return '';

        const startPage = Math.max(0, State.currentPage - 2);
        const endPage = Math.min(totalPages - 1, State.currentPage + 2);

        const buttons = [
            this.createNavigationButton(0, 'bi-chevron-double-left', '첫 페이지', State.currentPage === 0),
            this.createNavigationButton(State.currentPage - 1, 'bi-chevron-left', '이전 페이지', State.currentPage === 0),
            ...this.createNumberButtons(startPage, endPage),
            this.createNavigationButton(State.currentPage + 1, 'bi-chevron-right', '다음 페이지', State.currentPage >= totalPages - 1),
            this.createNavigationButton(totalPages - 1, 'bi-chevron-double-right', '마지막 페이지', State.currentPage >= totalPages - 1)
        ];

        return buttons.join('');
    },

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
    },

    createNumberButtons(startPage, endPage) {
        return Array.from(
            {length: endPage - startPage + 1},
            (_, i) => {
                const page = startPage + i;
                return `
                    <li class="page-item ${page === State.currentPage ? 'active' : ''}">
                        <button class="page-link" 
                                data-page="${page}"
                                title="${page + 1} 페이지">
                            ${page + 1}
                        </button>
                    </li>`;
            }
        );
    }
};

// 단어 검색 관리
const SearchManager = {
    async loadSearchResults(page) {
        try {
            console.log('검색 결과 로드 시작: 페이지 ' + page);
            State.currentPage = page;
            PaginationManager.updateUrl(page);

            const data = await ApiService.searchWords(page);

            UIManager.updateWordList(data.content, data.totalElements);
            UIManager.updatePagination(data.totalPages);

            return data;
        } catch (error) {
            console.error('검색 결과 로드 오류:', error);
            UIManager.showToast(error.message, false);
            throw error;
        }
    }
};

// 단어 관리
const WordManager = {
    async editWord(id) {
        try {
            const word = await ApiService.fetchWord(id);
            showEditModal(word);
        } catch (error) {
            console.error('단어 조회 오류:', error);
            UIManager.showToast(error.message, false);
        }
    },

    async deleteWord(id) {
        if (!confirm('정말로 이 단어를 삭제하시겠습니까?')) return;

        try {
            await ApiService.deleteWord(id);
            UIManager.showToast('단어가 삭제되었습니다.', true);
            await SearchManager.loadSearchResults(State.currentPage);
        } catch (error) {
            console.error('단어 삭제 오류:', error);
            UIManager.showToast(error.message, false);
        }
    }
};

// 단어 수정 모달 표시 함수
function showEditModal(word) {
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
                    <button class="btn btn-text" data-bs-dismiss="modal" type="button">취소</button>
                    <button class="btn btn-primary" id="saveEdit" type="button">저장</button>
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
    document.getElementById('saveEdit').addEventListener('click', handleEditSave);
}

// 단어 수정 저장 처리 함수
async function handleEditSave() {
    const id = document.getElementById('editId').value;
    const data = {
        vocabulary: document.getElementById('editVocabulary').value.trim(),
        meaning: document.getElementById('editMeaning').value.trim(),
        hint: document.getElementById('editHint').value.trim(),
        difficulty: parseInt(document.getElementById('editDifficulty').value)
    };

    try {
        await ApiService.updateWord(id, data);
        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
        UIManager.showToast('단어가 수정되었습니다.', true);
        await SearchManager.loadSearchResults(State.currentPage);
    } catch (error) {
        console.error('단어 수정 오류:', error);
        UIManager.showToast(error.message, false);
    }
}

// 이벤트 핸들러
const EventHandlers = {
    handlePaginationClick(e) {
        const button = e.target.closest('button');
        if (!button?.dataset.page) return;

        e.preventDefault();
        const page = parseInt(button.dataset.page);
        if (!isNaN(page)) {
            SearchManager.loadSearchResults(page);
        }
    },

    handleTableClick(e) {
        if (State.isProcessing) return;

        const button = e.target.closest('button');
        if (!button) return;

        const id = button.dataset.id;
        if (!id) return;

        try {
            State.isProcessing = true;
            if (button.classList.contains('edit-btn')) {
                WordManager.editWord(id);
            } else if (button.classList.contains('delete-btn')) {
                WordManager.deleteWord(id);
            }
        } finally {
            State.isProcessing = false;
        }
    },

    handlePopState() {
        const url = new URL(window.location);
        State.currentPage = parseInt(url.searchParams.get('page') || '0');
        State.keyword = url.searchParams.get('keyword') || '';

        SearchManager.loadSearchResults(State.currentPage);
    }
};

// 초기화
function initialize() {
    console.log('검색 페이지 초기화 시작');

    // 이벤트 리스너 설정
    Elements.pagination.addEventListener('click', EventHandlers.handlePaginationClick);
    Elements.wordList.addEventListener('click', EventHandlers.handleTableClick);
    window.addEventListener('popstate', EventHandlers.handlePopState);

    // 초기 검색 결과 로드
    SearchManager.loadSearchResults(State.currentPage)
        .then(() => console.log('검색 결과 로드 완료'))
        .catch(error => console.error('검색 결과 로드 실패:', error));
}

// 앱 시작
document.addEventListener('DOMContentLoaded', function () {
    console.log('검색 페이지 로드됨');
    console.log('검색 키워드:', State.keyword);
    console.log('초기 페이지:', State.currentPage);
    initialize();
});