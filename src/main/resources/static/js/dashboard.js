document.addEventListener('DOMContentLoaded', async function () {
    console.group('대시보드 로딩');
    console.time('대시보드 로딩 시간');

    try {
        console.log('대시보드 로딩');

        // 로딩 상태를 명시적으로 시작
        window.showLoading(true);

        const [dashboardResponse, wordBooksResponse] = await Promise.all([
            fetch('/api/v1/dashboard'),
            fetch('/api/v1/wordbooks')
        ]);

        if (!dashboardResponse.ok || !wordBooksResponse.ok) {
            console.error('응답 상태:', {
                dashboard: dashboardResponse.status,
                wordBooks: wordBooksResponse.status
            });
            throw new Error('API 응답 오류');
        }

        const dashboardData = await dashboardResponse.json();
        const wordBooksData = await wordBooksResponse.json();

        console.log('대시보드 데이터:', dashboardData);
        console.log('단어장 데이터:', wordBooksData);

        updateStatistics(dashboardData);
        updateRecentWords(dashboardData.recentWords);
        updateCategoryStats(wordBooksData);

        console.log('대시보드 로딩 완료');
    } catch (error) {
        console.error('데이터 로딩 중 오류:', error);
        showError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
        // 명시적으로 로딩 상태 종료
        setTimeout(() => {
            window.showLoading(false);
        }, 0);

        console.timeEnd('대시보드 로딩 시간');
        console.groupEnd();
    }
});

function updateStatistics(data) {
    document.getElementById('totalWords').textContent = data.totalWords.toLocaleString();
    document.getElementById('todayWords').textContent = data.todayStudiedWords.toLocaleString();
    document.getElementById('streak').textContent = data.currentStreak.toLocaleString();
    document.getElementById('correctRate').textContent = `${(data.correctRate * 100).toFixed(1)}%`;
}

function updateRecentWords(words) {
    const recentWordsBody = document.getElementById('recentWords');

    if (words.length === 0) {
        recentWordsBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">최근 추가된 단어가 없습니다.</td>
            </tr>
        `;
        return;
    }

    recentWordsBody.innerHTML = words.map(word => `
        <tr>
            <td class="fw-medium">${word.vocabulary}</td>
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

    if (Object.keys(categoryStats).length === 0) {
        categoryStatsElement.innerHTML = `
            <div class="category-item">
                <span>등록된 단어장이 없습니다.</span>
            </div>
        `;
        return;
    }

    categoryStatsElement.innerHTML = Object.entries(categoryStats).map(([category, count]) => `
        <div class="category-item">
            <div class="category-label">
                <span class="category-badge bg-${getCategoryColor(category)}">${getCategoryDisplayName(category)}</span>
            </div>
            <span class="category-count">${count}</span>
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

function showError(message) {
    // 간단한 오류 알림 구현
    console.error(message);
    const dashboardContainer = document.querySelector('.dashboard-container');

    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger';
    errorAlert.role = 'alert';
    errorAlert.textContent = message;

    dashboardContainer.prepend(errorAlert);

    // 5초 후 알림 제거
    setTimeout(() => {
        errorAlert.remove();
    }, 5000);
}