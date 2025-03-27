/**
 * formatting-utils.js
 * 자주 사용되는 포맷팅 관련 유틸리티 함수 모음
 */

/**
 * 날짜/시간 포맷 변환
 * @param {string} dateTimeStr - ISO 형식 날짜/시간 문자열
 * @param {Object} options - 포맷팅 옵션
 * @param {string} options.locale - 로케일 (기본값: 'ko-KR')
 * @param {boolean} options.showTime - 시간 표시 여부 (기본값: true)
 * @returns {string} 포맷된 날짜/시간 문자열
 */
export function formatDateTime(dateTimeStr, options = {}) {
    if (!dateTimeStr) return '-';

    const {locale = 'ko-KR', showTime = true} = options;

    try {
        const date = new Date(dateTimeStr);

        // 유효한 날짜인지 확인
        if (isNaN(date.getTime())) {
            return '-';
        }

        const dateOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        };

        if (showTime) {
            dateOptions.hour = '2-digit';
            dateOptions.minute = '2-digit';
        }

        return date.toLocaleDateString(locale, dateOptions);
    } catch (e) {
        console.error('날짜 변환 오류:', e);
        return '-';
    }
}

/**
 * 숫자에 천 단위 구분자 추가
 * @param {number} num - 포맷팅할 숫자
 * @param {string} locale - 로케일 (기본값: 'ko-KR')
 * @returns {string} 포맷된 숫자 문자열
 */
export function formatNumber(num, locale = 'ko-KR') {
    if (num === undefined || num === null) return '0';

    try {
        return num.toLocaleString(locale);
    } catch (e) {
        console.error('숫자 변환 오류:', e);
        return num.toString();
    }
}

/**
 * 백분율 형식으로 변환
 * @param {number} value - 변환할 값 (0 ~ 1)
 * @param {number} digits - 소수점 자릿수 (기본값: 1)
 * @returns {string} 백분율 문자열
 */
export function formatPercent(value, digits = 1) {
    if (value === undefined || value === null) return '0%';

    try {
        return (value * 100).toFixed(digits) + '%';
    } catch (e) {
        console.error('백분율 변환 오류:', e);
        return value.toString() + '%';
    }
}

/**
 * 텍스트 길이 제한 및 말줄임표 추가
 * @param {string} text - 원본 텍스트
 * @param {number} maxLength - 최대 길이
 * @returns {string} 길이가 제한된 텍스트
 */
export function truncateText(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '...';
}

/**
 * 단어 난이도를 별표로 변환
 * @param {number} level - 난이도 레벨 (1-5)
 * @param {string} starIcon - 사용할 별 아이콘 (기본값: '★')
 * @returns {string} 별표 문자열
 */
export function getDifficultyStars(level, starIcon = '★') {
    if (!level || level < 1 || level > 5) {
        return starIcon;
    }

    return starIcon.repeat(level);
}

/**
 * HTML 별표 태그 생성
 * @param {number} level - 난이도 레벨 (1-5)
 * @param {Object} options - 옵션
 * @param {string} options.icon - 사용할 아이콘 클래스 (기본값: 'bi bi-star-fill')
 * @param {string} options.color - 별표 색상 (기본값: '#f1c40f')
 * @returns {string} HTML 별표 태그
 */
export function getDifficultyStarsHTML(level, options = {}) {
    const {icon = 'bi bi-star-fill', color = '#f1c40f'} = options;

    if (!level || level < 1 || level > 5) {
        return `<i class="${icon}" style="color: ${color}"></i>`;
    }

    return `<i class="${icon}" style="color: ${color}"></i>`.repeat(level);
}

/**
 * 난이도에 따른 배지 HTML 생성
 * @param {number} level - 난이도 레벨 (1-5)
 * @returns {string} 배지 HTML
 */
export function getDifficultyBadge(level) {
    const badges = {
        1: ['success', '매우 쉬움'],
        2: ['info', '쉬움'],
        3: ['warning', '보통'],
        4: ['danger', '어려움'],
        5: ['dark', '매우 어려움']
    };

    const [colorClass, label] = badges[level] || ['secondary', '알 수 없음'];
    return `<span class="badge bg-${colorClass}">${label}</span>`;
}

/**
 * 지정된 카테고리에 맞는 색상 클래스 반환
 * @param {string} category - 카테고리 코드
 * @returns {string} 색상 클래스명
 */
export function getCategoryColor(category) {
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
 * @returns {string} 표시 이름
 */
export function getCategoryDisplayName(category) {
    const names = {
        'TOEIC': '토익',
        'TOEFL': '토플',
        'CSAT': '수능',
        'CUSTOM': '사용자 정의'
    };

    return names[category] || category;
}

// 모듈로 내보내기
export default {
    formatDateTime,
    formatNumber,
    formatPercent,
    truncateText,
    getDifficultyStars,
    getDifficultyStarsHTML,
    getDifficultyBadge,
    getCategoryColor,
    getCategoryDisplayName
};