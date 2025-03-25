function addWordRow() {
    const row = document.createElement('div');
    row.className = 'word-row';

    row.innerHTML = `
        <div class="col" data-label="영단어">
            <input type="text" class="form-control vocabulary" 
                   placeholder="영단어" required
                   pattern="^[a-zA-Z\\s-]+$">
            <div class="invalid-feedback">올바른 영단어를 입력해주세요.</div>
        </div>
        <div class="col" data-label="의미">
            <input type="text" class="form-control meaning" 
                   placeholder="의미" required>
            <div class="invalid-feedback">의미를 입력해주세요.</div>
        </div>
        <div class="col" data-label="힌트">
            <input type="text" class="form-control hint" 
                   placeholder="힌트">
            <div class="invalid-feedback" style="visibility: hidden;">힌트 오류</div>
                   
        </div>
        <div class="col" data-label="난이도">
            <select class="form-select difficulty" required>
                <option value="1">⭐ 매우 쉬움</option>
                <option value="2">⭐⭐ 쉬움</option>
                <option value="3" selected>⭐⭐⭐ 보통</option>
                <option value="4">⭐⭐⭐⭐ 어려움</option>
                <option value="5">⭐⭐⭐⭐⭐ 매우 어려움</option>
            </select>
            <div class="invalid-feedback" style="visibility: hidden;">난이도 오류</div>
        </div>
        <div class="col-action">
            <button type="button" class="btn-remove" onclick="removeRow(this)" title="행 삭제">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    document.getElementById('wordList').appendChild(row);
}


function addWordRows(count) {
    for (let i = 0; i < count; i++) {
        addWordRow();
    }
}

function removeRow(element) {
    const row = element.closest('.word-row');
    if (document.querySelectorAll('.word-row').length > 1) {
        row.remove();
    } else {
        window.showErrorToast('최소 1개의 단어가 필요합니다.');
    }
}

document.getElementById('wordBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // 폼 유효성 검사
    if (!e.target.checkValidity()) {
        e.stopPropagation();
        e.target.classList.add('was-validated');
        window.showErrorToast('필수 항목을 모두 입력해주세요.');
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
        const response = await fetch('/api/v1/wordbooks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(WordBookRequest)
        });

        if (response.ok) {
            window.showSuccessToast('단어장이 성공적으로 생성되었습니다.');
            setTimeout(() => {
                window.location.href = '/wordbook/list';
            }, 1500);
        } else {
            window.showErrorToast('단어장 생성 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('Error creating wordbook:', error);
        window.showErrorToast('서버와의 통신 중 오류가 발생했습니다.');
    }
});

// 초기에 2개의 빈 행 추가
window.addEventListener('DOMContentLoaded', () => {
    addWordRows(2);
});
