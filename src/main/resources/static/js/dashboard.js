document.addEventListener('DOMContentLoaded', async function () {
    // 로딩 상태 표시
    showLoading();

    try {
        // 대시보드 데이터와 단어장 데이터 병렬로 가져오기
        const [dashboardResponse, wordBooksResponse] = await Promise.all([
            fetch('/api/v1/dashboard'),
            fetch('/api/v1/wordbooks')
        ]);

        const dashboardData = await dashboardResponse.json();
        const wordBooksData = await wordBooksResponse.json();

        // 통계 카드 업데이트
        updateStatistics(dashboardData);

        // 최근 단어 목록 업데이트
        updateRecentWords(dashboardData.recentWords);

        // 카테고리별 통계 업데이트
        updateCategoryStats(wordBooksData);

        // 단어장 요약 업데이트
        updateWordBooksSummary(wordBooksData);

    } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
        showError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
        hideLoading();
    }
});

function updateStatistics(data) {
    document.getElementById('totalWords').textContent = data.totalWords;
    document.getElementById('todayWords').textContent = data.todayStudiedWords;
    document.getElementById('streak').textContent = data.currentStreak;
    document.getElementById('correctRate').textContent = `${(data.correctRate * 100).toFixed(1)}%`;
}

function updateRecentWords(words) {
    const recentWordsBody = document.getElementById('recentWords');
    recentWordsBody.innerHTML = words.map(word => `
        <tr>
            <td>${word.vocabulary}</td>
            <td>${word.meaning}</td>
            <td>${formatDateTime(word.createdAt)}</td>
        </tr>
    `).join('');
}

function updateCategoryStats(wordBooks) {
    const categoryStats = wordBooks.reduce((acc, book) => {
        acc[book.category] = (acc[book.category] || 0) + 1;
        return acc;
    }, {});

    const categoryStatsElement = document.getElementById('categoryStats');
    categoryStatsElement.innerHTML = Object.entries(categoryStats).map(([category, count]) => `
        <div class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <span class="badge bg-${getCategoryColor(category)} me-2">${getCategoryDisplayName(category)}</span>
            </div>
            <span class="badge bg-primary rounded-pill">${count}</span>
        </div>
    `).join('');
}

function updateWordBooksSummary(wordBooks) {
    const wordBooksSummary = document.getElementById('wordBooksSummary');
    wordBooksSummary.innerHTML = wordBooks.map(book => `
        <div class="col-md-4">
            <div class="card h-100 border">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="card-title mb-0">${book.name}</h6>
                        <span class="badge bg-${getCategoryColor(book.category)}">
                            ${getCategoryDisplayName(book.category)}
                        </span>
                    </div>
                    <p class="card-text small text-muted mb-2">${book.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">단어 수: ${book.wordCount}</small>
                        <a href="/word/${book.id}/study" class="btn btn-sm btn-outline-primary">
                            학습하기
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
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

function getCategoryDisplayName(category) {
    const names = {
        'TOEIC': '토익',
        'TOEFL': '토플',
        'CSAT': '수능',
        'CUSTOM': '사용자 정의'
    };
    return names[category] || category;
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

function showLoading() {
    // 로딩 표시 로직
}

function hideLoading() {
    // 로딩 숨김 로직
}

function showError(message) {
    // 에러 메시지 표시 로직
}