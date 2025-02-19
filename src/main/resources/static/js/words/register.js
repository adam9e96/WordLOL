document.addEventListener('DOMContentLoaded', function () {
    // 초기 행 3개 추가
    for (let i = 0; i < 3; i++) {
        addRow();
    }
});

function addRow() {
    const wordRows = document.getElementById('wordRows');
    const rowDiv = document.createElement('div');
    rowDiv.className = 'word-row';

    rowDiv.innerHTML = `
        <input type="text" class="form-control vocabulary" placeholder="영단어" required>
        <input type="text" class="form-control meaning" placeholder="의미" required>
        <input type="text" class="form-control hint" placeholder="힌트">
        <select class="form-select difficulty" required>
            <option value="1">level 1 (매우 쉬움)</option>
            <option value="2">level 2 (쉬움)</option>
            <option value="3" selected>level 3 (보통)</option>
            <option value="4">level 4 (어려움)</option>
            <option value="5">level 5 (매우 어려움)</option>
        </select>
        <i class="bi bi-x-lg remove-row" onclick="removeRow(this)"></i>
    `;

    wordRows.appendChild(rowDiv);
}


function removeRow(element) {
    const row = element.closest('.word-row');
    if (document.getElementsByClassName('word-row').length > 1) {
        row.remove();
    } else {
        showToast('최소 1개의 행이 필요합니다.', 'danger');
    }
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    const bsToast = new bootstrap.Toast(toast);

    toast.querySelector('.toast-body').textContent = message;
    toast.classList.remove('bg-success', 'bg-danger');
    toast.classList.add(`bg-${type}`);

    bsToast.show();
}

async function saveWords() {
    const rows = document.getElementsByClassName('word-row');
    const words = [];

    // 각 행의 데이터 검증
    for (let row of rows) {
        const vocabulary = row.querySelector('.vocabulary').value.trim();
        const meaning = row.querySelector('.meaning').value.trim();
        const hint = row.querySelector('.hint').value.trim();
        const difficulty = row.querySelector('.difficulty').value;

        // 필수 필드 검증
        if (!vocabulary || !meaning) {
            showToast('모든 필수 항목을 입력해주세요.', 'danger');
            return;
        }

        words.push({
            vocabulary: vocabulary,
            meaning: meaning,
            hint: hint,
            difficulty: parseInt(difficulty)
        });
    }

    try {
        const response = await fetch('/api/v1/words/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(words)
        });

        const result = await response.json();

        if (response.ok) {
            showToast(`${result.count}개의 단어가 저장되었습니다.`, 'success');
            setTimeout(() => {
                window.location.href = '/word/study';
            }, 2000);
        } else {
            showToast('저장 중 오류가 발생했습니다.', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('저장 중 오류가 발생했습니다.', 'danger');
    }
}