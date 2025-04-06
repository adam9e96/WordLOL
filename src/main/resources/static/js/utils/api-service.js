class ApiService {
    constructor() {
        this.wordsApiUrl = '/api/v1/words';
        this.wordBooksApiUrl = '/api/v1/wordbooks';
    }

    /**
     * 요청 중 오류 처리
     * @param {Error} error - 발생한 오류
     * @param {string} endpoint - 요청 엔드포인트
     */
    handleError(error, endpoint) {
        console.error(`API 오류 (${endpoint}):`, error);
    }

    startLoading() {
        if (window.showLoading) {
            window.showLoading(true);
        }
    }

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
     * @param wordId 단어 ID
     * @param answer 사용자 입력 정답
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
        if (!response.ok) {
            throw new Error('힌트를 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        console.log('힌트 데이터:', data);
        return data;
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


    //** 단어장 관련 메서드 */

    /**
     * 단어장 생성
     * @param {Object} wordBookData - 단어장 데이터
     * @param {string} wordBookData.name - 단어장 이름
     * @param {string} wordBookData.description - 단어장 설명
     * @param {string} wordBookData.category - 단어장 카테고리
     * @param {Array<Object>} wordBookData.words - 단어 목록
     * @returns {Promise<Object>} 생성된 단어장 정보
     */
    async createWordBook(wordBookData) {
        this.startLoading();

        try {
            const response = await fetch(this.wordBooksApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wordBookData),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '단어장 생성에 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'createWordBook');
            throw error;
        } finally {
            this.endLoading();
        }
    }

    /**
     * 단어장 목록 조회
     * @param {Object} [options={}] - 조회 옵션
     * @param {number} [options.page=0] - 페이지 번호
     * @param {number} [options.size=10] - 페이지 크기
     * @param {string} [options.category] - 카테고리 필터
     * @returns {Promise<Object>} 페이징된 단어장 목록
     */
    async fetchWordBooks(options = {}) {
        this.startLoading();

        try {
            const {page = 0, size = 10, category} = options;

            let url = `${this.wordBooksApiUrl}/?page=${page}&size=${size}`;
            if (category) {
                url += `&category=${encodeURIComponent(category)}`;
            }

            const response = await fetch(url, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('단어장 목록을 불러오는데 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'fetchWordBooks');
            throw error;
        } finally {
            this.endLoading();
        }
    }

    /**
     * 단어장 상세 조회
     * @param {number} wordBookId - 단어장 ID
     * @returns {Promise<Object>} 단어장 상세 정보
     */
    async fetchWordBook(wordBookId) {
        this.startLoading();

        try {
            const response = await fetch(`${this.wordBooksApiUrl}/${wordBookId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('단어장 정보를 불러오는데 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'fetchWordBook');
            throw error;
        } finally {
            this.endLoading();
        }
    }

    /**
     * 단어장의 단어 목록 조회
     * @param {number} wordBookId - 단어장 ID
     * @returns {Promise<Array>} 단어 목록
     */
    async fetchWordBookWords(wordBookId) {
        this.startLoading();

        try {
            const response = await fetch(`${this.wordBooksApiUrl}/${wordBookId}/words`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('단어장의 단어 목록을 불러오는데 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'fetchWordBookWords');
            throw error;
        } finally {
            this.endLoading();
        }
    }

    /**
     * 단어장 삭제
     * @param {number} wordBookId - 단어장 ID
     * @returns {Promise<Response>} 삭제 결과
     */
    async deleteWordBook(wordBookId) {
        this.startLoading();

        try {
            const response = await fetch(`${this.wordBooksApiUrl}/${wordBookId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || '단어장 삭제에 실패했습니다.');
            }

            return response;
        } catch (error) {
            this.handleError(error, 'deleteWordBook');
            throw error;
        } finally {
            this.endLoading();
        }
    }
    /**
     * 모든 단어장 목록 조회 - 단어장 목록 페이지용
     * @returns {Promise<Array>} 단어장 목록
     */
    async getAllWordBooks() {
        this.startLoading();

        try {
            const response = await fetch(this.wordBooksApiUrl, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('단어장 목록을 불러오는데 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'getAllWordBooks');
            throw error;
        } finally {
            this.endLoading();
        }
    }

    /**
     * 카테고리별 단어장 목록 조회
     * @param {string} category - 카테고리 코드 (TOEIC, TOEFL, CSAT, CUSTOM)
     * @returns {Promise<Array>} 단어장 목록
     */
    async getWordBooksByCategory(category) {
        this.startLoading();

        try {
            const response = await fetch(`${this.wordBooksApiUrl}/category?category=${category}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`${getCategoryDisplayName(category)} 카테고리의 단어장을 불러오는데 실패했습니다.`);
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'getWordBooksByCategory');
            throw error;
        } finally {
            this.endLoading();
        }
    }


    /**
     * 단어장 학습 데이터 조회
     * @param {number} wordBookId - 단어장 ID
     * @returns {Promise<Array>} 학습 데이터
     */
    async fetchWordBookStudyData(wordBookId) {
        this.startLoading();

        try {
            const response = await fetch(`${this.wordBooksApiUrl}/${wordBookId}/study`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('단어장 학습 데이터를 불러오는데 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'fetchWordBookStudyData');
            throw error;
        } finally {
            this.endLoading();
        }
    }

    /**
     * 단어장 수정
     * @param {number} wordBookId - 단어장 ID
     * @param {Object} wordBookData - 수정할 단어장 데이터
     * @returns {Promise<Object>} 수정된 단어장 정보
     */
    async updateWordBook(wordBookId, wordBookData) {
        this.startLoading();

        try {
            const response = await fetch(`${this.wordBooksApiUrl}/${wordBookId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wordBookData),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('단어장 수정에 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'updateWordBook');
            throw error;
        } finally {
            this.endLoading();
        }
    }
}


/**
 * 카테고리 표시 이름 가져오기
 * @param {string} category - 카테고리 코드
 * @returns {string} 카테고리 표시 이름
 */
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

const apiService = new ApiService();

export default apiService;