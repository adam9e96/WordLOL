document.addEventListener('DOMContentLoaded', function () {
    const wordList = document.getElementById('wordList');
    const pagination = document.getElementById('pagination');
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    let currentPage = 0;

    // 단어 목록 로드
    async function loadWords(page = 0) {
        try {
            const response = await fetch(`/api/v1/words/list?page=${page}&size=100`);
            const pageData = await response.json();

            // 테이블 내용 업데이트
            wordList.innerHTML = pageData.content.map(word => `
                <tr>
                    <td>${word.id}</td>
                    <td class="fw-medium">${word.vocabulary}</td>
                    <td>${word.meaning}</td>
                    <td>${word.hint || '-'}</td>
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
            updatePagination(pageData);
        } catch (error) {
            console.error('Error loading words:', error);
        }
    }

    // 페이지네이션 UI 업데이트
    function updatePagination(pageData) {
        const totalPages = pageData.totalPages;
        currentPage = pageData.number;

        let paginationHtml = '';

        // 처음 페이지로 가기
        paginationHtml += `
            <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadWords(0)">
                    <i class="bi bi-chevron-double-left"></i>
                </a>
            </li>
        `;

        // 이전 페이지로 가기
        paginationHtml += `
            <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadWords(${currentPage - 1})">
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
                    <a class="page-link" href="#" onclick="loadWords(${i})">${i + 1}</a>
                </li>
            `;
        }

        // 다음 페이지로 가기
        paginationHtml += `
            <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadWords(${currentPage + 1})">
                    <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        `;

        // 마지막 페이지로 가기
        paginationHtml += `
            <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadWords(${totalPages - 1})">
                    <i class="bi bi-chevron-double-right"></i>
                </a>
            </li>
        `;

        pagination.innerHTML = paginationHtml;
    }

    // 단어 삭제
    window.deleteWord = async function(id) {
        if (confirm('정말로 이 단어를 삭제하시겠습니까?')) {
            try {
                await fetch(`/api/v1/words/${id}`, {method: 'DELETE'});
                loadWords(currentPage);
            } catch (error) {
                console.error('Error deleting word:', error);
                alert('단어 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    // 단어 수정 모달 표시
    window.editWord = async function(id) {
        try {
            const response = await fetch(`/api/v1/words/${id}`);
            const word = await response.json();

            document.getElementById('editId').value = word.id;
            document.getElementById('editVocabulary').value = word.vocabulary;
            document.getElementById('editMeaning').value = word.meaning;
            document.getElementById('editHint').value = word.hint || '';

            editModal.show();
        } catch (error) {
            console.error('Error loading word details:', error);
            alert('단어 정보를 불러오는 중 오류가 발생했습니다.');
        }
    };

    // 수정 저장
    document.getElementById('saveEdit').addEventListener('click', async function() {
        try {
            const id = document.getElementById('editId').value;
            const data = {
                vocabulary: document.getElementById('editVocabulary').value,
                meaning: document.getElementById('editMeaning').value,
                hint: document.getElementById('editHint').value
            };

            const response = await fetch(`/api/v1/words/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                editModal.hide();
                loadWords(currentPage);
            } else {
                alert('단어 수정 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Error updating word:', error);
            alert('단어 수정 중 오류가 발생했습니다.');
        }
    });

    // 페이징 함수를 전역으로 노출
    window.loadWords = loadWords;

    // 초기 로드
    loadWords();
});