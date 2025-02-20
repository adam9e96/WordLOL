/** @type {number} 현재 페이지 번호 */
let currentPage = 0;

/** @type {number} 페이지당 표시할 단어 수 */
const size = 20;

/** @type {boolean} 작업 진행 중 플래그 */
let isProcessing = false;


const API_BASE_URL = '/api/v1/words'; // API 기본 URL

// 초기화
document.addEventListener('DOMContentLoaded', function () {
    // URL 에서 현재 페이지 파라미터 읽기
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    // URL의 페이지 번호는 1-based이므로 0-based로 변환
    currentPage = pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;


    // 초기 데이터 로드
    loadWords(currentPage).then(() => console.log('단어 목록 로드 완료'));
    // 이벤트 리스너 설정 - 한 번만 실행
    setupInitialEventListeners();
});

// 초기 이벤트 리스너 설정 (한 번만 실행되어야 하는 것들)
function setupInitialEventListeners() {
    // 페이지네이션 클릭 이벤트
    document.getElementById('pagination').addEventListener('click', handlePaginationClick);

    // 테이블 클릭 이벤트 (수정/삭제 버튼)
    document.getElementById('wordList').addEventListener('click', handleTableClick);

    // 수정 저장 버튼 이벤트
    document.getElementById('saveEdit')?.addEventListener('click', handleEditSave);

    // 브라우저 네비게이션 이벤트
    window.addEventListener('popstate', handlePopState);
}

// 페이지네이션 클릭 핸들러
function handlePaginationClick(e) {
    const button = e.target.closest('button');
    if (!button?.dataset.page) return;

    e.preventDefault();
    const page = parseInt(button.dataset.page);
    if (!isNaN(page)) {
        loadWords(page);
    }
}

// 테이블 클릭 핸들러
async function handleTableClick(e) {
    if (isProcessing) return;

    const button = e.target.closest('button');
    if (!button) return;

    const id = button.dataset.id;
    if (!id) return;

    try {
        isProcessing = true;

        if (button.classList.contains('edit-btn')) {
            await editWord(id);
        } else if (button.classList.contains('delete-btn')) {
            await deleteWord(id);
        }
    } finally {
        isProcessing = false;
    }
}

/**
 * URL 상태 업데이트
 * @param {number} page - 페이지 번호 (0-based)
 */
function updateUrl(page) {
    const url = new URL(window.location);
    // URL에는 사용자가 보는 페이지 번호(1-based)를 사용
    url.searchParams.set('page', (page + 1).toString());
    window.history.pushState({}, '', url);
}

/**
 * 단어 목록 로드 및 표시
 */
async function loadWords(page) {
    try {
        // URL 업데이트
        updateUrl(page);  // URL 업데이트는 별도 함수로 분리

        // API 호출은 0-based 페이지 번호 사용
        const response = await fetch(`${API_BASE_URL}/list?page=${page}&size=${size}`);
        if (!response.ok) throw new Error('단어 목록을 불러오는데 실패했습니다.');

        const data = await response.json();
        currentPage = page;

        updateWordList(data.content);
        updatePagination(data.totalPages);
    } catch (error) {
        console.error('Error:', error);
        showError('단어 목록을 불러오는데 실패했습니다.');
    }
}

/**
 * 단어 목록 테이블 업데이트
 */
function updateWordList(words) {
    const wordList = document.getElementById('wordList');
    wordList.innerHTML = ''; // 기존 내용 클리어

    // 각 행을 개별적으로 추가하여 애니메이션 적용
    words.forEach((word, index) => {
        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.05}s`; // 각 행마다 지연 시간 추가
        row.innerHTML = `
            <td>${word.id}</td>
            <td class="fw-medium">${word.vocabulary}</td>
            <td>${word.meaning}</td>
            <td>${word.hint || '-'}</td>
            <td>${getDifficultyBadge(word.difficulty)}</td>
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
        wordList.appendChild(row);
    });
}

/**
 * 페이지네이션 UI 업데이트
 */
function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    const buttons = [
        {
            page: 0,
            icon: 'bi-chevron-double-left',
            disabled: currentPage === 0,
            title: '첫 페이지'
        },
        {
            page: currentPage - 1,
            icon: 'bi-chevron-left',
            disabled: currentPage === 0,
            title: '이전 페이지'
        },
        ...Array.from({length: endPage - startPage + 1}, (_, i) => ({
            page: startPage + i,
            text: startPage + i + 1,
            active: startPage + i === currentPage,
            title: `${startPage + i + 1} 페이지`
        })),
        {
            page: currentPage + 1,
            icon: 'bi-chevron-right',
            disabled: currentPage >= totalPages - 1,
            title: '다음 페이지'
        },
        {
            page: totalPages - 1,
            icon: 'bi-chevron-double-right',
            disabled: currentPage >= totalPages - 1,
            title: '마지막 페이지'
        }
    ];

    pagination.innerHTML = buttons.map(btn => {
        if (btn.icon) {
            return `
                <li class="page-item ${btn.disabled ? 'disabled' : ''}">
                    <button class="page-link" 
                            data-page="${btn.page}" 
                            title="${btn.title}"
                            ${btn.disabled ? 'disabled' : ''}>
                        <i class="bi ${btn.icon}"></i>
                    </button>
                </li>`;
        }
        return `
            <li class="page-item ${btn.active ? 'active' : ''}">
                <button class="page-link" 
                        data-page="${btn.page}"
                        title="${btn.title}">
                    ${btn.text}
                </button>
            </li>`;
    }).join('');
}

/**
 * 단어 수정
 */
async function editWord(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) throw new Error('단어 정보를 불러오는데 실패했습니다.');

        const word = await response.json();
        showEditModal(word);
    } catch (error) {
        console.error('Error:', error);
        showError('단어 정보를 불러오는데 실패했습니다.');
    }
}

/**
 * 단어 삭제
 */
async function deleteWord(id) {
    if (!confirm('정말로 이 단어를 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('단어 삭제에 실패했습니다.');

        showToast('단어가 삭제되었습니다.', true);
        await loadWords(currentPage);
    } catch (error) {
        console.error('Error:', error);
        showError('단어 삭제에 실패했습니다.');
    }
}

/**
 * 수정 모달 표시
 */
function showEditModal(word) {
    const modalEl = document.getElementById('editModal');

    // 기존 모달 제거
    const existingModal = bootstrap.Modal.getInstance(modalEl);
    if (existingModal) {
        existingModal.dispose();
    }

    // 모달 데이터 설정
    document.getElementById('editId').value = word.id;
    document.getElementById('editVocabulary').value = word.vocabulary;
    document.getElementById('editMeaning').value = word.meaning;
    document.getElementById('editHint').value = word.hint || '';
    document.getElementById('editDifficulty').value = word.difficulty;

    // 새 모달 생성 및 표시
    const modal = new bootstrap.Modal(modalEl, {
        backdrop: 'static',
        keyboard: false
    });
    modal.show();
}

/**
 * 수정 저장 처리
 */
async function handleEditSave() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        const id = document.getElementById('editId').value;
        const data = {
            vocabulary: document.getElementById('editVocabulary').value,
            meaning: document.getElementById('editMeaning').value,
            hint: document.getElementById('editHint').value,
            difficulty: parseInt(document.getElementById('editDifficulty').value)
        };

        const response = await fetch(`/api/v1/words/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('단어 수정에 실패했습니다.');

        const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        editModal.hide();

        showToast('단어가 수정되었습니다.', true);
        await loadWords(currentPage);
    } catch (error) {
        console.error('Error:', error);
        showError('단어 수정에 실패했습니다.');
    } finally {
        isProcessing = false;
    }
}

// 유틸리티 함수들
function getDifficultyBadge(level) {
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

function formatDateTime(dateTimeStr) {
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

function showError(message) {
    showToast(message, 'danger');
}


function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toast');
    const toastBody = toast.querySelector('.toast-body');

    // 기존 토스트 제거
    const existingToast = bootstrap.Toast.getInstance(toast);
    if (existingToast) {
        existingToast.dispose();
    }

    toast.className = `toast align-items-center text-white bg-${isSuccess ? 'success' : 'danger'}`;
    toastBody.textContent = message;

    const bsToast = new bootstrap.Toast(toast, {
        delay: 2000,
        autohide: true
    });
    bsToast.show();
}

/**
 * 브라우저 히스토리 이벤트 핸들러
 */
function handlePopState() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    // URL 의 페이지 번호는 1-based 이므로 0-based 로 변환
    currentPage = pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;
    loadWords(currentPage);
}
