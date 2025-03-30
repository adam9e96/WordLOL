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
                this.handleError(new Error(errorData.message || '단어 등록에 실패했습니다.'), 'registerWord');
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

    /**
     * 단어 목록 조회
     * @param {number} page - 페이지 번호
     * @param {number} size - 페이지 크기
     * @returns {Promise<Object>} 페이징된 단어 목록
     */
    async fetchWords(page = 0, size = 20) {
        this.startLoading();

        try {
            const response = await fetch(`${this.wordsApiUrl}/list?page=${page}&size=${size}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('단어 목록을 불러오는데 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'fetchWords');
            throw error;
        } finally {
            this.endLoading();
        }
    }

    /**
     * 단어 상세 조회
     * @param {number} id - 단어 ID
     * @returns {Promise<Object>} 단어 상세 정보
     */
    async fetchWord(id) {
        this.startLoading();

        try {
            const response = await fetch(`${this.wordsApiUrl}/${id}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('단어 정보를 불러오는데 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'fetchWord');
            throw error;
        } finally {
            this.endLoading();
        }
    }

    /**
     * 단어 수정
     * @param {number} id - 단어 ID
     * @param {Object} data - 수정할 단어 데이터
     * @returns {Promise<Object>} 수정된 단어 정보
     */
    async updateWord(id, data) {
        this.startLoading();

        try {
            const response = await fetch(`${this.wordsApiUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || '단어 수정에 실패했습니다.');
            }
            return response;
        } catch (error) {
            this.handleError(error, 'updateWord');
            throw error;
        } finally {
            this.endLoading();
        }
    }

    /**
     * 단어 삭제
     * @param {number} id - 단어 ID
     * @returns {Promise<Response>} 삭제 결과
     */
    async deleteWord(id) {
        this.startLoading();

        try {
            const response = await fetch(`${this.wordsApiUrl}/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || '단어 삭제에 실패했습니다.');

            }

            return response;
        } catch (error) {
            this.handleError(error, 'deleteWord');
            throw error;
        } finally {
            this.endLoading();
        }
    }

    /**
     * 랜덤 단어 조회
     * @returns {Promise<any>} 랜덤 단어 정보
     */
    async randomWord() {
        this.startLoading();

        try {
            const response = await fetch(`${this.wordsApiUrl}/random`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('랜덤 단어를 불러오는데 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'randomWord');
            throw error;
        } finally {
            this.endLoading();
        }
    }

    /**
     *
     * @param id
     * @param answer
     * @returns {Promise<any>}
     */
    async checkAnswer(wordId, answer) {

        try {
            const response = await fetch(`${this.wordsApiUrl}/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({answer, wordId}),
                credentials: 'include'
            });
            return response.json();
        } catch (error) {
            this.handleError(error, 'checkAnswer');
            throw error;
        }
    }

    async fetchHint(id) {
        const response = await fetch(`${this.wordsApiUrl}/${id}/hint`, {
            credentials: 'include'
        });
        console.log(response.json());
        return response.json();
    }

    async fetchDailyWords() {
        const response = await fetch(`${this.wordsApiUrl}/daily`, {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('오늘의 단어를 불러오는데 실패했습니다.');
        }
        return response.json();
    }

    /**
     * 단어 검색
     * @param {string} keyword - 검색 키워드
     * @param {number} page - 페이지 번호
     * @param {number} size - 페이지 크기
     * @returns {Promise<Object>} 검색 결과
     */
    async searchWords(keyword, page = 0, size = 20) {
        this.startLoading();

        try {
            const url = new URL(`${this.wordsApiUrl}/search`, window.location.origin);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('size', size.toString());

            if (keyword) {
                url.searchParams.append('keyword', keyword);
            }

            console.log(`검색 API 호출: ${url.toString()}`);

            const response = await fetch(url, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('검색 결과를 불러오는데 실패했습니다.');
            }

            const data = await response.json();
            console.log('검색 결과:', data);
            return data;

        } catch (error) {
            this.handleError(error, 'searchWords');
            throw error;
        } finally {
            this.endLoading();
        }
    }
}

// 전역 인스턴스 생성
const apiService = new ApiService();

// 전역 객체에 등록
// window.ApiService = apiService;

// ES 모듈 내보내기
export default apiService;