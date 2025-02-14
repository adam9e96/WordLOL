document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/api/v1/dashboard');
        const data = await response.json();

        // 통계 업데이트
        document.getElementById('totalWords').textContent = data.totalWords;
        document.getElementById('todayWords').textContent = data.todayStudiedWords;
        document.getElementById('streak').textContent = data.currentStreak;
        document.getElementById('correctRate').textContent = `${(data.correctRate * 100).toFixed(1)}%`;

        // 최근 단어 목록 업데이트
        const recentWordsBody = document.getElementById('recentWords');
        recentWordsBody.innerHTML = data.recentWords.map(word => `
            <tr>
                <td>${word.vocabulary}</td>
                <td>${word.meaning}</td>
                <td>${word.hint || '-'}</td>
                <td>${word.createAt || ''}</td>
        </tr>
        `).join('');

    } catch (error) {
        console.error('대시보드 데이터 로딩 중 오류 발생:', error);
        // 에러 메시지 표시
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
});