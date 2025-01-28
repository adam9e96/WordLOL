document.addEventListener('DOMContentLoaded', function () {
    const wordList = document.getElementById('wordList');
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));

    // 단어 목록 로드
    async function loadWords() {
        const response = await fetch('/api/v1/words/list');
        const words = await response.json();

        wordList.innerHTML = words.map(word => `
            <tr>
                <td>${word.id}</td>
                <td>${word.vocabulary}</td>
                <td>${word.meaning}</td>
                <td>${word.hint || ''}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editWord(${word.id})">수정</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteWord(${word.id})">삭제</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * 단어 삭제 함수
     * @param id 삭제할 id
     * @returns {Promise<void>}
     */
    window.deleteWord = async function (id) {
        if (confirm('정말 삭제하시겠습니까?')) {
            await fetch(`/api/v1/words/${id}`, {
                method: 'DELETE'
            });
            await loadWords();
        }
    }

    // 단어 수정 모달 표시
    window.editWord = async function (id) {
        const response = await fetch(`/api/v1/words/${id}`);
        const word = await response.json();

        document.getElementById('editId').value = word.id;
        document.getElementById('editVocabulary').value = word.vocabulary;
        document.getElementById('editMeaning').value = word.meaning;
        document.getElementById('editHint').value = word.hint || '';

        editModal.show();
    }

    // 수정 저장
    document.getElementById('saveEdit').addEventListener('click', async function () {
        const id = document.getElementById('editId').value;
        const data = {
            vocabulary: document.getElementById('editVocabulary').value,
            meaning: document.getElementById('editMeaning').value,
            hint: document.getElementById('editHint').value
        };

        await fetch(`/api/v1/words/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        editModal.hide();
        await loadWords();
    });

    // 초기 로드
    loadWords();
});