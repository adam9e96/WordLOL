/**
 * @file api-service.js
 * @description 단어 등록을 위한 간단한 API 서비스 모듈
 */

/**
 * API 서비스 클래스
 * 단어 등록 관련 API 기능을 제공합니다.
 */
class ApiService {
    constructor() {
        this.baseUrl = ''; // 기본 URL (현재 도메인)
        this.wordsApiUrl = '/api/v1/words';
    }

    /**
     * 요청 중 오류 처리
     * @param {Error} error - 발생한 오류
     * @param {string} endpoint - 요청 엔드포인트
     */
    handleError(error, endpoint) {
        console.error(`API 오류 (${endpoint}):`, error);
        if (window.showErrorToast) {
            window.showErrorToast(error.message || '요청 처리 중 오류가 발생했습니다.');
        }
    }

    /**
     * 로딩 표시 시작
     */
    startLoading() {
        if (window.showLoading) {
            window.showLoading(true);
        }
    }

    /**
     * 로딩 표시 종료
     */
    endLoading() {
        if (window.showLoading) {
            window.showLoading(false);
        }
    }

    /**
     * 단어 등록 메서드
     * @param {Object} wordData - 등록할 단어 데이터
     * @param {string} wordData.vocabulary - 영단어
     * @param {string} wordData.meaning - 의미
     * @param {string} wordData.hint - 힌트 (선택사항)
     * @param {number} wordData.difficulty - 난이도 (1-5)
     * @returns {Promise<Object>} 등록된 단어 정보
     */
    async registerWord(wordData) {
        this.startLoading();

        try {
            const response = await fetch(this.wordsApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(wordData),
                credentials: 'include' // 쿠키 포함
            });

            // 응답 처리
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '단어 등록에 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'registerWord');
            throw error;
        } finally {
            this.endLoading();
        }
    }

    /**
     * 단어 중복 확인
     * @param {string} vocabulary - 중복 확인할 단어
     * @returns {Promise<{exists: boolean}>} 중복 여부
     */
    async checkWordDuplicate(vocabulary) {
        try {
            const url = `${this.wordsApiUrl}/check-duplicate?vocabulary=${encodeURIComponent(vocabulary)}`;
            const response = await fetch(url, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('중복 확인 중 오류가 발생했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'checkWordDuplicate');
            throw error;
        }
    }
}

// 전역 인스턴스 생성
const apiService = new ApiService();

// 전역 객체에 등록
window.ApiService = apiService;

// ES 모듈 내보내기
export default apiService;