// 상태 관리
const State = {
    currentPage: 0,
    pageSize: 20,
    isProcessing: false,
    API_BASE_URL: '/api/v1/words'
};

// DOM 요소 캐싱
const Elements = {
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
    toast: document.getElementById('toast')
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
    },

    updateWordList(words) {
        Elements.wordList.innerHTML = '';
        words.forEach((word, index) => {
            Elements.wordList.appendChild(this.createWordRow(word, index));
        });
    },

    updatePagination(totalPages) {
        const paginationButtons = PaginationManager.generatePaginationButtons(totalPages);
        Elements.pagination.innerHTML = paginationButtons;
    },

    showEditModal(word) {
        console.log("수정 모달 ID:", word.id);
        const existingModal = bootstrap.Modal.getInstance(Elements.editModal);
        if (existingModal) {
            existingModal.dispose();
        }

        // 폼 초기화
        const form = document.getElementById('editForm');
        form.reset();

        // 데이터 설정
        Object.entries(word).forEach(([key, value]) => {
            if (Elements.editForm[key]) {
                Elements.editForm[key].value = value || '';
            }
        });

        const modal = new bootstrap.Modal(Elements.editModal, {
            backdrop: 'static',
            keyboard: false
        });

        // 모달이 닫힐 때 처리
        Elements.editModal.addEventListener('hidden.bs.modal', () => {
            form.reset();
            State.isProcessing = false;
        }, {once: true});

        modal.show();
    }


};

// API 서비스
const ApiService = {
    async fetchWords(page) {
        const response = await fetch(`${State.API_BASE_URL}/list?page=${page}&size=${State.pageSize}`);
        if (!response.ok) throw new Error('단어 목록을 불러오는데 실패했습니다.');
        return response.json();
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

        // 204 No Content 응답인 경우 처리
        if (response.status === 204) {
            return null;
        }

        // JSON 응답이 있는 경우 처리
        return response.json().catch(() => null);
    },

    async deleteWord(id) {
        const response = await fetch(`${State.API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('단어 삭제에 실패했습니다.');
        return response;
    },

    async checkVocabularyDuplicate(vocabulary, currentId = null) {
        const response = await fetch(`${State.API_BASE_URL}/check-duplicate?vocabulary=${encodeURIComponent(vocabulary)}${currentId ? `&excludeId=${currentId}` : ''}`);
        if (!response.ok) {
            throw new Error('중복 검사 중 오류가 발생했습니다.');
        }
        return response.json();
    }
};

// 페이지네이션 관리
const PaginationManager = {
    updateUrl(page) {
        const url = new URL(window.location);
        url.searchParams.set('page', (page + 1).toString());
        window.history.pushState({}, '', url);
    },

    generatePaginationButtons(totalPages) {
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

// 단어 관리
const WordManager = {
    async loadWords(page) {
        try {
            PaginationManager.updateUrl(page);
            const data = await ApiService.fetchWords(page);
            State.currentPage = page;

            UIManager.updateWordList(data.content);
            UIManager.updatePagination(data.totalPages);
        } catch (error) {
            console.error('Error:', error);
            UIManager.showToast(error.message, false);
        }
    },

    async editWord(id) {
        try {
            const word = await ApiService.fetchWord(id);
            UIManager.showEditModal(word);
        } catch (error) {
            console.error('Error:', error);
            UIManager.showToast(error.message, false);
        }
    },

    async deleteWord(id) {
        if (!confirm('정말로 이 단어를 삭제하시겠습니까?')) return;

        try {
            await ApiService.deleteWord(id);
            UIManager.showToast('단어가 삭제되었습니다.', true);
            await this.loadWords(State.currentPage);
        } catch (error) {
            console.error('Error:', error);
            UIManager.showToast(error.message, false);
        }
    },

    async handleEditSave() {
        if (State.isProcessing) return;
        State.isProcessing = true;

        const modal = bootstrap.Modal.getInstance(Elements.editModal);

        try {
            const id = Elements.editForm.id.value;
            const data = {
                vocabulary: Elements.editForm.vocabulary.value.trim(),
                meaning: Elements.editForm.meaning.value.trim(),
                hint: Elements.editForm.hint.value.trim(),
                difficulty: parseInt(Elements.editForm.difficulty.value)
            };

            // 입력값 검증
            if (!data.vocabulary || !data.meaning) {
                UIManager.showToast('단어와 의미는 필수 입력값입니다.', false);
                return;
            }

            // 중복 검사
            const duplicateCheck = await ApiService.checkVocabularyDuplicate(data.vocabulary, id);
            if (duplicateCheck.exists) {
                UIManager.showToast(`'${data.vocabulary}'는 이미 존재하는 단어입니다.`, false);
                return;
            }

            await ApiService.updateWord(id, data);

            // 모달 닫기 (성공한 경우에만)
            modal?.hide();
            UIManager.showToast('단어가 수정되었습니다.', true);

            // 약간의 지연 후 목록 새로고침
            setTimeout(() => {
                this.loadWords(State.currentPage);
            }, 100);

        } catch (error) {
            console.error('Error:', error);
            UIManager.showToast(error.message, false);
        } finally {
            State.isProcessing = false;
        }
    }

};

// 이벤트 핸들러
const EventHandlers = {
    handlePaginationClick(e) {
        const button = e.target.closest('button');
        if (!button?.dataset.page) return;

        e.preventDefault();
        const page = parseInt(button.dataset.page);
        if (!isNaN(page)) {
            WordManager.loadWords(page);
        }
    },

    async handleTableClick(e) {
        if (State.isProcessing) return;

        const button = e.target.closest('button');
        if (!button) return;

        const id = button.dataset.id;
        if (!id) return;

        try {
            State.isProcessing = true;
            if (button.classList.contains('edit-btn')) {
                await WordManager.editWord(id);
            } else if (button.classList.contains('delete-btn')) {
                await WordManager.deleteWord(id);
            }
        } finally {
            State.isProcessing = false;
        }
    },

    handlePopState() {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        State.currentPage = pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;
        WordManager.loadWords(State.currentPage);
    }
};

// 초기화
function initialize() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    State.currentPage = pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;

    // 이벤트 리스너 설정
    Elements.pagination.addEventListener('click', EventHandlers.handlePaginationClick);
    Elements.wordList.addEventListener('click', EventHandlers.handleTableClick);
    document.getElementById('saveEdit')?.addEventListener('click', () => WordManager.handleEditSave());
    window.addEventListener('popstate', EventHandlers.handlePopState)
    document.getElementById('AddWordButton')?.addEventListener('click', () => location.href = '/word/register');

    // 초기 데이터 로드
    WordManager.loadWords(State.currentPage)
        .then(() => console.log('단어 목록 로드 완료'));
}

// 앱 시작
document.addEventListener('DOMContentLoaded', initialize);