const toast = new bootstrap.Toast(document.getElementById('toast'));
const wordBookId = document.getElementById('wordBookId').value;
const API_BASE_URL = '/api/v1/wordbooks';
const API_BASE_URL_WORD = '/api/v1/words';

function showToast(message, type = 'success') {
    const toastElement = document.getElementById('toast');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;
    toastElement.classList.remove('bg-success', 'bg-danger');
    toastElement.classList.add(`bg-${type}`);
    toast.show();
}

// 단어장 데이터 로드
async function loadWordBook(wordBookId) {
    try {
        // 1. 단어장 기본 정보 조회
        const wordBookResponse = await fetch(`${API_BASE_URL}/${wordBookId}`);
        if (!wordBookResponse.ok) {
            throw new Error('단어장을 찾을 수 없습니다.');
        }
        const wordBook = await wordBookResponse.json();

        // 2. 단어장의 단어 목록 조회
        const wordsResponse = await fetch(`${API_BASE_URL}/${wordBookId}/words`);
        if (!wordsResponse.ok) {
            throw new Error(`단어 목록을 불러올 수 없습니다. (${wordsResponse.status})`);
        }
        const words = await wordsResponse.json();
        console.log('Loaded words:', words); // 디버깅용 로그 추가

        // UI 업데이트
        document.getElementById('name').value = wordBook.name;
        document.getElementById('description').value = wordBook.description;
        document.getElementById('category').value = wordBook.category;
        document.getElementById('createdAt').value = formatDateTime(wordBook.createdAt);
        document.getElementById('updatedAt').value = formatDateTime(wordBook.updatedAt);

        // 단어 목록 표시
        const wordList = document.getElementById('wordList');
        wordList.innerHTML = '';
        words.forEach(word => addWordRow(word));
    } catch (error) {
        console.error('Error:', error);
        showToast('단어장 로딩 중 오류가 발생했습니다.', 'danger');
    }
}

function addWordRow(word = null) {
    const wordList = document.getElementById('wordList');
    const row = document.createElement('div');
    row.className = 'word-row';

    row.innerHTML = `
        <input type="hidden" class="word-id" value="${word ? word.id : ''}">
        <input type="text" class="form-control vocabulary"
               value="${word ? word.vocabulary : ''}"
               placeholder="영단어" required>
        <input type="text" class="form-control meaning"
               value="${word ? word.meaning : ''}"
               placeholder="의미" required>
        <input type="text" class="form-control hint"
               value="${word ? word.hint || '' : ''}"
               placeholder="힌트">
        <select class="form-select difficulty">
            <option value="1" ${word && word.difficulty === 1 ? 'selected' : ''}>Level 1</option>
            <option value="2" ${word && word.difficulty === 2 ? 'selected' : ''}>Level 2</option>
            <option value="3" ${word && word.difficulty === 3 ? 'selected' : ''}>Level 3</option>
            <option value="4" ${word && word.difficulty === 4 ? 'selected' : ''}>Level 4</option>
            <option value="5" ${word && word.difficulty === 5 ? 'selected' : ''}>Level 5</option>
        </select>
        <button type="button" class="btn-remove" onclick="this.closest('.word-row').remove()">
            <i class="bi bi-trash"></i>
        </button>
    `;

    wordList.appendChild(row);
}

// 폼 제출 처리
document.getElementById('wordBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!e.target.checkValidity()) {
        e.stopPropagation();
        e.target.classList.add('was-validated');
        showToast('필수 항목을 모두 입력해주세요.', 'danger');
        return;
    }

    const wordRows = document.querySelectorAll('.word-row');
    const words = Array.from(wordRows).map(row => ({
        id: row.querySelector('.word-id').value || null,
        vocabulary: row.querySelector('.vocabulary').value.trim(),
        meaning: row.querySelector('.meaning').value.trim(),
        hint: row.querySelector('.hint').value.trim(),
        difficulty: parseInt(row.querySelector('.difficulty').value)
    }));

    const wordBookData = {
        name: document.getElementById('name').value.trim(),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value,
        words: words
    };

    try {
        const response = await fetch(`${API_BASE_URL}/${wordBookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(wordBookData)
        });

        if (response.ok) {
            showToast('단어장이 성공적으로 수정되었습니다.');
            setTimeout(() => {
                window.location.href = '/wordbook/list';
            }, 1500);
        } else {
            const error = await response.json();
            showToast(error.message || '단어장 수정 중 오류가 발생했습니다.', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('서버와의 통신 중 오류가 발생했습니다.', 'danger');
    }
});

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 초기 데이터 로드
loadWordBook(wordBookId);