let currentCategory = 'ALL';
const API_BASE_URL = '/api/v1/wordbooks';

async function loadWordBooks() {
    try {
// 현재
        const url = currentCategory === 'ALL'
            ? `${API_BASE_URL}`                                  // /api/v1/wordbooks
            : `${API_BASE_URL}/category?category=${currentCategory}` // /api/v1/wordbooks/category?category=TOEIC


        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const wordBooks = await response.json();
        console.log(wordBooks);

        const wordBookList = document.getElementById('wordBookList');
        if (wordBooks.length === 0) {
            wordBookList.innerHTML = '<div class="col-12"><p class="text-center">단어장이 없습니다.</p></div>';
            return;
        }

        wordBookList.innerHTML = wordBooks.map(book => `
    <div class="wordbook-card">
        <div class="category-chip">
            <i class="bi ${getCategoryIcon(book.category)}"></i>
            ${getCategoryDisplayName(book.category)}
        </div>
        <h3 class="card-title">${book.name}</h3>
        <p class="card-text">${book.description}</p>
        <div class="card-footer">
            <div class="word-count">
                <i class="bi bi-book"></i>
                <span>단어 ${book.wordCount}개</span>
            </div>
            <div class="card-actions">
                <button class="card-btn btn-study" 
                        onclick="location.href='/word/wordbook/${book.id}/study'"
                        title="학습 시작">
                    <i class="bi bi-play-fill"></i>
                    <span>학습</span>
                </button>
                <button class="card-btn btn-edit"
                        onclick="location.href='/word/wordbook/${book.id}/edit'"
                        title="단어장 수정">
                    <i class="bi bi-pencil"></i>
                    <span>수정</span>
                </button>
                <button class="card-btn btn-delete"
                        onclick="confirmDelete(${book.id})"
                        title="단어장 삭제">
                    <i class="bi bi-trash"></i>
                    <span>삭제</span>
                </button>
            </div>
        </div>
    </div>
`).join('');

    } catch (error) {
        console.error('Error loading wordbooks:', error);
        alert('단어장 목록을 불러오는 중 오류가 발생했습니다.');
    }
}

// 카테고리별 아이콘 매핑 함수 추가
function getCategoryIcon(category) {
    const icons = {
        'TOEIC': 'bi-journal-text',
        'TOEFL': 'bi-journal-medical',
        'CSAT': 'bi-journal-check',
        'CUSTOM': 'bi-journal-plus'
    };
    return icons[category] || 'bi-journal';
}



function filterByCategory(category) {
    currentCategory = category;

    // 버튼 활성화 상태 업데이트
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === getCategoryDisplayName(category)) {
            btn.classList.add('active');
        }
    });

    loadWordBooks();
}

function getCategoryDisplayName(category) {
    const categoryMap = {
        'ALL': '전체',
        'TOEIC': '토익',
        'TOEFL': '토플',
        'CSAT': '수능',
        'CUSTOM': '사용자 정의'
    };
    return categoryMap[category] || category;
}

let deleteWordBookId = null;
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

function confirmDelete(id) {
    deleteWordBookId = id;
    deleteModal.show();
}

document.getElementById('confirmDelete').addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/${deleteWordBookId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            deleteModal.hide();
            loadWordBooks();
        } else {
            alert('단어장 삭제 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('Error deleting wordbook:', error);
        alert('단어장 삭제 중 오류가 발생했습니다.');
    }
});

// 초기 로드
loadWordBooks();