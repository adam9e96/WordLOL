let currentCategory = 'ALL';

async function loadWordBooks() {
    try {
        const url = currentCategory === 'ALL'
            ? '/api/v1/wordbooks'
            : `/api/v1/wordbooks/category?category=${currentCategory}`;

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
            <div class="col-md-4 mb-4">
                <div class="card wordbook-card">
                    <span class="badge bg-${getCategoryColor(book.category)} category-badge">
                        ${getCategoryDisplayName(book.category)}
                    </span>
                    <div class="card-body">
                        <h5 class="card-title">${book.name}</h5>
                        <p class="card-text">${book.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">단어 수: ${book.wordCount}</small>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-primary"
                                        onclick="location.href='/word/wordbook/study/${book.id}'">
                                    <i class="bi bi-play-fill"></i> 학습
                                </button>
                                <button class="btn btn-sm btn-outline-secondary"
                                        onclick="location.href='/word/wordbook/edit/${book.id}'">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger"
                                        onclick="confirmDelete(${book.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading wordbooks:', error);
        alert('단어장 목록을 불러오는 중 오류가 발생했습니다.');
    }
}

function getCategoryColor(category) {
    const colors = {
        'TOEIC': 'primary',
        'TOEFL': 'success',
        'CSAT': 'warning',
        'CUSTOM': 'info'
    };
    return colors[category] || 'secondary';
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
        const response = await fetch(`/api/v1/wordbooks/${deleteWordBookId}`, {
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