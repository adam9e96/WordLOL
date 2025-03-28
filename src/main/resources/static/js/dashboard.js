import {formatDateTime, getDifficultyBadge} from './utils/formatting-utils.js';
document.addEventListener('DOMContentLoaded', async function () {
    console.group('대시보드 로딩');
    console.time('대시보드 로딩 시간');

    try {
        console.log('대시보드 데이터 가져오는 중...');

        // 로딩 상태를 명시적으로 시작
        window.showLoading(true);

        // 두 API 요청을 병렬로 실행
        const [dashboardResponse, wordBooksResponse] = await Promise.all([
            fetch('/api/v1/dashboard'),
            fetch('/api/v1/wordbooks')
        ]);

        // 응답 오류 체크
        if (!dashboardResponse.ok || !wordBooksResponse.ok) {
            console.error('API 응답 오류:', {
                dashboard: dashboardResponse.status,
                wordBooks: wordBooksResponse.status
            });
            throw new Error('서버에서 데이터를 가져오는 중 오류가 발생했습니다.');
        }

        // JSON 응답 파싱
        const dashboardData = await dashboardResponse.json();
        const wordBooksData = await wordBooksResponse.json();

        console.log('대시보드 데이터 로드 완료:', dashboardData);
        console.log('단어장 데이터 로드 완료:', wordBooksData);

        // UI 업데이트
        updateStatistics(dashboardData);
        updateRecentWords(dashboardData.recentWords);
        updateCategoryStats(wordBooksData);

        // 애니메이션 효과 적용
        animateEntrance();

        console.log('대시보드 UI 업데이트 완료');
    } catch (error) {
        console.error('데이터 로딩 중 오류:', error);
        showError(error.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
        // 로딩 상태 종료
        setTimeout(() => {
            window.showLoading(false);
        }, 300);

        console.timeEnd('대시보드 로딩 시간');
        console.groupEnd();
    }
});

/**
 * 통계 섹션 업데이트
 * @param {Object} data - 대시보드 데이터
 */
function updateStatistics(data) {
    // 데이터 유효성 검사
    if (!data) return;

    // 숫자 형식 지정 (천 단위 구분자 포함)
    const formatNumber = (num) => num.toLocaleString('ko-KR');

    // 각 통계 항목 업데이트
    document.getElementById('totalWords').textContent = formatNumber(data.totalWords);
    document.getElementById('todayWords').textContent = formatNumber(data.todayStudiedWords);
    document.getElementById('streak').textContent = formatNumber(data.currentStreak);

    // 정답률 형식 지정 (소수점 한 자리까지)
    const correctRatePercent = (data.correctRate * 100).toFixed(1);
    document.getElementById('correctRate').textContent = `${correctRatePercent}%`;
}

/**
 * 최근 추가된 단어 섹션 업데이트
 * @param {Array} words - 최근 추가된 단어 배열
 */
function updateRecentWords(words) {
    const recentWordsBody = document.getElementById('recentWords');

    // 데이터 없음 처리
    if (!words || words.length === 0) {
        recentWordsBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">
                    <div class="empty-state">
                        <i class="bi bi-hourglass"></i>
                        <p>최근 추가된 단어가 없습니다.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // 최근 단어 목록 생성
    recentWordsBody.innerHTML = words.map((word, index) => `
        <tr>
            <td class="fw-medium">${word.vocabulary || '-'}</td>
            <td>${word.meaning || '-'}</td>
            <td>${formatDateTime(word.createdAt)}</td>
        </tr>
    `).join('');
}

/**
 * 카테고리별 통계 업데이트
 * @param {Array} wordBooks - 단어장 목록
 */
function updateCategoryStats(wordBooks) {
    const categoryStatsElement = document.getElementById('categoryStats');

    // 데이터 없음 처리
    if (!wordBooks || wordBooks.length === 0) {
        categoryStatsElement.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-folder"></i>
                <p>등록된 단어장이 없습니다.</p>
            </div>
        `;
        return;
    }

    // 카테고리별 단어장 수 집계
    const categoryStats = wordBooks.reduce((acc, book) => {
        acc[book.category] = (acc[book.category] || 0) + 1;
        return acc;
    }, {});

    // 카테고리별 항목 생성
    categoryStatsElement.innerHTML = Object.entries(categoryStats)
        .sort((a, b) => b[1] - a[1]) // 단어장 수 기준 내림차순 정렬
        .map(([category, count]) => `
            <div class="category-item">
                <div class="category-label">
                    <span class="category-badge bg-${getCategoryColor(category)}">${getCategoryDisplayName(category)}</span>
                </div>
                <span class="category-count">${count}</span>
            </div>
        `).join('');
}

/**
 * 카테고리에 따른 색상 클래스 반환
 * @param {string} category - 카테고리 코드
 * @returns {string} 부트스트랩 색상 클래스
 */
function getCategoryColor(category) {
    const colors = {
        'TOEIC': 'primary',
        'TOEFL': 'success',
        'CSAT': 'warning',
        'CUSTOM': 'info'
    };
    return colors[category] || 'secondary';
}

/**
 * 카테고리 코드에 따른 표시 이름 반환
 * @param {string} category - 카테고리 코드
 * @returns {string} 사용자에게 표시할 카테고리 이름
 */
function getCategoryDisplayName(category) {
    const names = {
        'TOEIC': '토익',
        'TOEFL': '토플',
        'CSAT': '수능',
        'CUSTOM': '사용자 정의'
    };
    return names[category] || category;
}


/**
 * 에러 메시지 표시
 * @param {string} message - 에러 메시지
 */
function showError(message) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    // 기존 에러 알림 제거
    const existingError = document.querySelector('.alert-danger');
    if (existingError) {
        existingError.remove();
    }

    // 새 에러 알림 생성
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger';
    errorAlert.role = 'alert';
    errorAlert.innerHTML = `
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        ${message}
    `;

    // 대시보드 컨테이너 맨 위에 추가
    dashboardContainer.prepend(errorAlert);

    // 5초 후 알림 자동 제거
    setTimeout(() => {
        errorAlert.style.opacity = '0';
        errorAlert.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            errorAlert.remove();
        }, 500);
    }, 5000);
}

/**
 * 요소 진입 애니메이션 적용
 */
function animateEntrance() {
    // 통계 카드에 애니메이션 추가
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }, index * 100);
    });

    // 정보 카드에 애니메이션 추가
    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach((card, index) => {
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }, 400 + index * 150);
    });
}