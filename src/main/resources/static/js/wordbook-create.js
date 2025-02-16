const toast = new bootstrap.Toast(document.getElementById('toast'));

function showToast(message, type = 'success') {
    const toastElement = document.getElementById('toast');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;
    toastElement.classList.remove('bg-success', 'bg-danger');
    toastElement.classList.add(`bg-${type}`);
    toast.show();
}

function addWordRow() {
    const wordList = document.getElementById('wordList');
    const row = document.createElement('div');
    row.className = 'word-row';

    row.innerHTML = `
        <input type="text" class="form-control vocabulary" placeholder="영단어" required>
        <input type="text" class="form-control meaning" placeholder="의미" required>
        <input type="text" class="form-control hint" placeholder="힌트">
        <select class="form-select difficulty" required>
            <option value="1">1 (매우 쉬움)</option>
            <option value="2">2 (쉬움)</option>
            <option value="3" selected>3 (보통)</option>
            <option value="4">4 (어려움)</option>
            <option value="5">5 (매우 어려움)</option>
        </select>
        <i class="bi bi-x-lg remove-row" onclick="removeWordRow(this)"></i>
    `;

    wordList.appendChild(row);
}


function addWordRows(count) {
    for (let i = 0; i < count; i++) {
        addWordRow();
    }
}

function removeWordRow(element) {
    const row = element.closest('.word-row');
    if (document.querySelectorAll('.word-row').length > 1) {
        row.remove();
    } else {
        showToast('최소 1개의 단어가 필요합니다.', 'danger');
    }
}

document.getElementById('wordBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // 폼 유효성 검사
    if (!e.target.checkValidity()) {
        e.stopPropagation();
        e.target.classList.add('was-validated');
        showToast('필수 항목을 모두 입력해주세요.', 'danger');
        return;
    }

    const wordRows = document.querySelectorAll('.word-row');
    const words = Array.from(wordRows).map(row => ({
        vocabulary: row.querySelector('.vocabulary').value.trim(),
        meaning: row.querySelector('.meaning').value.trim(),
        hint: row.querySelector('.hint').value.trim(),
        difficulty: parseInt(row.querySelector('.difficulty').value)
    }));

    const WordBookRequest = {
        name: document.getElementById('name').value.trim(),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value,
        words: words
    };

    try {
        const response = await fetch('/api/v1/wordbooks/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(WordBookRequest)
        });

        if (response.ok) {
            showToast('단어장이 성공적으로 생성되었습니다.');
            setTimeout(() => {
                window.location.href = '/word/wordbook-list';
            }, 1500);
        } else {
            const error = await response.json();
            showToast(error.message || '단어장 생성 중 오류가 발생했습니다.', 'danger');
        }
    } catch (error) {
        console.error('Error creating wordbook:', error);
        showToast('서버와의 통신 중 오류가 발생했습니다.', 'danger');
    }
});

// 초기에 2개의 빈 행 추가
window.addEventListener('DOMContentLoaded', () => {
    addWordRows(2);
});
