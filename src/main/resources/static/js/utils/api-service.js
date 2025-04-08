/**
 * @class ApiService
 * @description 애플리케이션의 API 통신을 담당하는 통합 서비스 클래스
 */
class ApiService {
    /**
     * API 엔드포인트 정의
     * @static
     * @readonly
     */
    static API_ENDPOINTS = {
        // 단어 관련 엔드포인트
        WORDS: '/api/v1/words',
        WORD_BOOKS: '/api/v1/wordbooks',

        // 인증 관련 엔드포인트
        AUTH_ME: '/api/v1/auth/me',
        AUTH_STATUS: '/api/v1/auth/status',
        LOGOUT: '/api/v1/auth/logout',
        OAUTH_LOGIN: '/oauth2/authorization/google'
    };

    constructor() {
        // 진행 중인 요청 수 관리
        this.pendingRequests = 0;

        // 인증 상태 초기 확인
        this.checkAuthStatus();
    }

    /**
     * 요청 중 오류 처리
     * @param {Error} error - 발생한 오류
     * @param {string} endpoint - 요청 엔드포인트나 정보
     */
    handleError(error, endpoint) {
        console.error(`API 오류 (${endpoint}):`, error);
    }

    /**
     * 로딩 상태 시작
     */
    startLoading() {
        this.pendingRequests++;

        if (this.pendingRequests === 1) {
            // 다음 이벤트 루프에서 로딩 UI 표시
            setTimeout(() => {
                if (window.showLoading && this.pendingRequests > 0) {
                    window.showLoading(true);
                }
            }, 0);
        }
    }

    /**
     * 로딩 상태 종료
     */
    endLoading() {
        this.pendingRequests = Math.max(0, this.pendingRequests - 1);

        if (this.pendingRequests === 0) {
            // 다음 이벤트 루프에서 로딩 UI 숨김
            setTimeout(() => {
                if (window.showLoading) {
                    window.showLoading(false);
                }
            }, 0);
        }
    }


    // ===========================
    /**
     * 인증 필요 이벤트 발생
     * 사용자에게 로그인이 필요하다는 알림을 표시합니다.
     */
    notifyAuthRequired() {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('auth_redirect_uri', currentPath);

        const event = new CustomEvent('auth-required', {
            detail: {returnUrl: currentPath}
        });
        document.dispatchEvent(event);

        // 인증 모달이 있으면 표시
        if (window.showAuthModal) {
            window.showAuthModal();
        }
    }

    /**
     * 현재 사용자의 인증 상태를 확인합니다.
     * @returns {Promise<boolean>} 인증 여부 (true: 인증됨, false: 인증되지 않음)
     */
    async checkAuthStatus() {
        try {
            this.startLoading();
            const response = await fetch(ApiService.API_ENDPOINTS.AUTH_STATUS, {
                credentials: 'include'
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            const isAuthenticated = data.authenticated === true;

            // 인증 상태 변경 이벤트 발송
            document.dispatchEvent(new CustomEvent('auth-state-changed', {
                detail: {isAuthenticated}
            }));

            // 사용자 정보가 있으면 이벤트 발송
            if (isAuthenticated && data.userInfo) {
                document.dispatchEvent(new CustomEvent('user-info-updated', {
                    detail: data.userInfo
                }));
            }

            return isAuthenticated;
        } catch (error) {
            console.error('인증 상태 확인 중 오류:', error);

            // 인증 안됨 이벤트 발송
            document.dispatchEvent(new CustomEvent('auth-state-changed', {
                detail: {isAuthenticated: false}
            }));

            return false;
        } finally {
            this.endLoading();
        }
    }

    /**
     * 사용자 정보를 로드합니다.
     * @returns {Promise<Object|null>} 사용자 정보 객체 또는 null
     */
    async loadUserInfo() {
        try {
            this.startLoading();
            const response = await fetch(ApiService.API_ENDPOINTS.AUTH_ME, {
                credentials: 'include'
            });

            if (!response.ok) {
                console.error('사용자 정보 로드 실패:', response.status);
                return null;
            }

            const userInfo = await response.json();

            // 사용자 정보 업데이트 이벤트 발송
            document.dispatchEvent(new CustomEvent('user-info-updated', {
                detail: userInfo
            }));

            return userInfo;
        } catch (error) {
            console.error('사용자 정보 로드 오류:', error);
            return null;
        } finally {
            this.endLoading();
        }
    }

    /**
     * Google OAuth 로그인 프로세스를 시작합니다
     * @param {string} [redirectUri] - 로그인 성공 후 리다이렉트할 앱 내 경로
     */
    handleGoogleLogin(redirectUri) {
        // 로그인 성공 후 리다이렉트할 URL 설정
        const loginUrl = new URL(ApiService.API_ENDPOINTS.OAUTH_LOGIN, window.location.origin);

        if (redirectUri) {
            // 세션 스토리지에 리다이렉트 경로 저장
            sessionStorage.setItem('auth_redirect_uri', redirectUri);
        }

        // Google OAuth 로그인 페이지로 리다이렉트
        window.location.href = loginUrl.toString();
    }

    /**
     * 로그아웃 요청을 서버에 전송합니다.
     * @param {boolean} [redirect=true] - 로그아웃 후 리다이렉트 여부
     * @param {string} [redirectUrl='/'] - 리다이렉트할 URL
     */
    async handleLogout(redirect = true, redirectUrl = '/') {
        try {
            this.startLoading();
            await fetch(ApiService.API_ENDPOINTS.LOGOUT, {
                method: 'POST',
                credentials: 'include'
            });

            // 인증 상태 변경 이벤트 발송
            document.dispatchEvent(new CustomEvent('auth-state-changed', {
                detail: {isAuthenticated: false}
            }));

            if (redirect) {
                window.location.href = redirectUrl;
            }
        } catch (error) {
            console.error('로그아웃 중 오류:', error);

            // 인증 상태 변경 이벤트 발송
            document.dispatchEvent(new CustomEvent('auth-state-changed', {
                detail: {isAuthenticated: false}
            }));

            if (redirect) {
                window.location.href = redirectUrl;
            }
        } finally {
            this.endLoading();
        }
    }

    // ==================== 단어 관련 API 메서드 ====================

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
            const response = await fetch(ApiService.API_ENDPOINTS.WORDS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(wordData),
                credentials: 'include'
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
            const url = `${ApiService.API_ENDPOINTS.WORDS}/check-duplicate?vocabulary=${encodeURIComponent(vocabulary)}`;
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
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORDS}/list?page=${page}&size=${size}`, {
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
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORDS}/${id}`, {
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
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORDS}/${id}`, {
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
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORDS}/${id}`, {
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
     * @returns {Promise<Object>} 랜덤 단어 정보
     */
    async randomWord() {
        this.startLoading();

        try {
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORDS}/random`, {
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
     * 단어 정답 확인
     * @param {number} wordId - 단어 ID
     * @param {string} answer - 사용자 입력 정답
     * @returns {Promise<Object>} 정답 확인 결과
     */
    async checkAnswer(wordId, answer) {
        try {
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORDS}/check`, {
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

    /**
     * 단어 힌트 조회
     * @param {number} id - 단어 ID
     * @returns {Promise<Object>} 단어 힌트 정보
     */
    async fetchHint(id) {
        try {
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORDS}/${id}/hint`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('힌트를 불러오는데 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'fetchHint');
            throw error;
        }
    }


    /**
     * 오늘의 단어 목록 조회
     * @returns {Promise<Array>} 오늘의 단어 목록
     */
    async fetchDailyWords() {
        try {
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORDS}/daily`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('오늘의 단어를 불러오는데 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, 'fetchDailyWords');
            throw error;
        }
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
            const url = new URL(`${ApiService.API_ENDPOINTS.WORDS}/search`, window.location.origin);
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

            const response = await fetch(`${ApiService.API_ENDPOINTS.WORD_BOOKS}`, {
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

            let url = `${ApiService.API_ENDPOINTS.WORD_BOOKS}/?page=${page}&size=${size}`;
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
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORD_BOOKS}/${wordBookId}`, {
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
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORD_BOOKS}/${wordBookId}/words`, {
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
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORD_BOOKS}/${wordBookId}`, {
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
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORD_BOOKS}`, {
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
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORD_BOOKS}/category?category=${category}`, {
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
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORD_BOOKS}/${wordBookId}/study`, {
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
            const response = await fetch(`${ApiService.API_ENDPOINTS.WORD_BOOKS}/${wordBookId}`, {
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
window.AuthService = apiService; // 인증 관련 호출을 ApiService로 리다이렉트
window.ApiClient = apiService;   // 클라이언트 관련 호출을 ApiService로 리다이렉트