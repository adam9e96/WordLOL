// 전역 변수 선언
let currentPage = 0;
const pageSize = 20;

document.addEventListener('DOMContentLoaded', function () {
    // URL에서 현재 페이지 파라미터 읽기
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    currentPage = pageParam ? parseInt(pageParam) : 0;
    console.log(currentPage);

    // 초기 로드
    loadWords(currentPage).then(() => console.log("단어 로딩"));
});

// 전역 함수로 선언하여 onclick에서 접근 가능하도록 함
window.loadWords = async function (page) {
    try {
        // URL 업데이트
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState({}, '', url);

        const response = await fetch(`/api/v1/words/list?page=${page}&size=${pageSize}`);
        if (!response.ok) {
            throw new Error('단어 목록을 불러오는데 실패했습니다.s');
        }

        const data = await response.json();
        currentPage = page; // 현재 페이지 업데이트

        // 테이블 내용 업데이트
        const wordList = document.getElementById('wordList');
        wordList.innerHTML = data.content.map(word => `
            <tr>
                <td>${word.id}</td>
                <td class="fw-medium">${word.vocabulary}</td>
                <td>${word.meaning}</td>
                <td>${word.hint || '-'}</td>
                <td>${getDifficultyBadge(word.difficulty)}</td>
                <td>${formatDateTime(word.createdAt)}</td>
                <td>
                    <button class="btn btn-action btn-outline-primary btn-sm me-1" onclick="editWord(${word.id})">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-action btn-outline-danger btn-sm" onclick="deleteWord(${word.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // 페이지네이션 업데이트
        updatePagination(data);
    } catch (error) {
        console.error('Error:', error);
        showError('단어 목록을 불러오는데 실패했습니다.');
    }
};

// 페이지네이션 UI 업데이트
function updatePagination(pageData) {
    const pagination = document.getElementById('pagination');
    const totalPages = pageData.totalPages;

    let paginationHtml = '';

    // 첫 페이지로 이동
    paginationHtml += `
        <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="loadWords(0)">
                <i class="bi bi-chevron-double-left"></i>
            </a>
        </li>
    `;

    // 이전 페이지로 이동
    paginationHtml += `
        <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="loadWords(${currentPage - 1})">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>
    `;

    // 페이지 번호들
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="loadWords(${i})">${i + 1}</a>
            </li>
        `;
    }

    // 다음 페이지로 이동
    paginationHtml += `
        <li class="page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="loadWords(${currentPage + 1})">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `;

    // 마지막 페이지로 이동
    paginationHtml += `
        <li class="page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="loadWords(${totalPages - 1})">
                <i class="bi bi-chevron-double-right"></i>
            </a>
        </li>
    `;

    pagination.innerHTML = paginationHtml;
}

// 난이도 뱃지 생성 함수
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

// 날짜 포맷팅 함수
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

// 에러 메시지 표시 함수
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.row'));
}

// 단어 수정 함수
window.editWord = async function (id) {
    try {
        const response = await fetch(`/api/v1/words/${id}`);
        if (!response.ok) throw new Error('단어 정보를 불러오는데 실패했습니다.');

        const word = await response.json();

        document.getElementById('editId').value = word.id;
        document.getElementById('editVocabulary').value = word.vocabulary;
        document.getElementById('editMeaning').value = word.meaning;
        document.getElementById('editHint').value = word.hint || '';
        document.getElementById('editDifficulty').value = word.difficulty;

        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();
    } catch (error) {
        console.error('Error:', error);
        showError('단어 정보를 불러오는데 실패했습니다.');
    }
};

// 단어 삭제 함수
window.deleteWord = async function (id) {
    if (!confirm('정말로 이 단어를 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`/api/v1/words/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('단어 삭제에 실패했습니다.');

        // 현재 페이지 다시 로드
        loadWords(currentPage);
    } catch (error) {
        console.error('Error:', error);
        showError('단어 삭제에 실패했습니다.');
    }
};

// 브라우저 뒤로가기/앞으로가기 처리
window.addEventListener('popstate', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    currentPage = pageParam ? parseInt(pageParam) : 0;
    loadWords(currentPage);
});

// 수정 저장 버튼 이벤트 리스너
//
document.getElementById('saveEdit')?.addEventListener('click', async function () {
    const id = document.getElementById('editId').value;
    console.log('id버튼 눌림', id.value);
    const data = {
        vocabulary: document.getElementById('editVocabulary').value,
        meaning: document.getElementById('editMeaning').value,
        hint: document.getElementById('editHint').value,
        difficulty: parseInt(document.getElementById('editDifficulty').value)
    };

    try {
        const response = await fetch(`/api/v1/words/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('단어 수정에 실패했습니다.');

        const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        editModal.hide();

        // 현재 페이지 다시 로드
        loadWords(currentPage);
    } catch (error) {
        console.error('Error:', error);
        showError('단어 수정에 실패했습니다.');
    }
});