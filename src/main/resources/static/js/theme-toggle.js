/**
 * 다크 모드 관리 클래스
 * 다크 모드 상태를 관리하고 테마를 전환하는 기능을 제공합니다.
 */
class ThemeManager {
    /**
     * 생성자
     * 상태 및 요소 초기화
     */
    constructor() {
        // 로컬 스토리지 키
        this.STORAGE_KEY = 'wordlol-theme-preference';

        // DOM 요소
        this.themeToggle = document.getElementById('theme-toggle');

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 초기 테마 설정
        this.initTheme();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 테마 토글 버튼 클릭 이벤트
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        } else {
            console.warn('테마 토글 버튼을 찾을 수 없습니다.');
        }

        // 시스템 테마 변경 감지
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.hasUserPreference()) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    /**
     * 초기 테마 설정
     * 저장된 사용자 설정이 있으면 해당 설정을, 없으면 시스템 설정을 사용
     */
    initTheme() {
        // 저장된 사용자 설정 확인
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);

        if (savedTheme) {
            // 사용자 설정 적용
            this.setTheme(savedTheme);
        } else {
            // 시스템 설정 적용
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }
    }

    /**
     * 테마 전환
     * 현재 테마를 반대로 전환
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        this.setTheme(newTheme);
        this.saveThemePreference(newTheme);

        // 전환 효과 애니메이션
        this.animateThemeTransition();
    }

    /**
     * 테마 설정
     * @param {string} theme - 'dark' 또는 'light'
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // 토글 버튼 상태 업데이트
        if (this.themeToggle) {
            this.themeToggle.setAttribute('aria-label', `${theme === 'dark' ? '라이트' : '다크'} 모드로 전환`);
        }

        // 이벤트 발생
        this.dispatchThemeChangeEvent(theme);
    }

    /**
     * 테마 설정 저장
     * @param {string} theme - 저장할 테마 ('dark' 또는 'light')
     */
    saveThemePreference(theme) {
        localStorage.setItem(this.STORAGE_KEY, theme);
    }

    /**
     * 사용자 설정 존재 여부 확인
     * @returns {boolean} 사용자 설정 존재 여부
     */
    hasUserPreference() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }

    /**
     * 테마 변경 이벤트 발생
     * @param {string} theme - 변경된 테마
     */
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themechange', {
            detail: { theme }
        });
        document.dispatchEvent(event);
    }

    /**
     * 테마 전환 애니메이션
     */
    animateThemeTransition() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.2)';
        overlay.style.zIndex = '9999';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';

        document.body.appendChild(overlay);

        // 트랜지션 시작
        setTimeout(() => {
            overlay.style.opacity = '0.2';
        }, 10);

        // 트랜지션 종료 후 제거
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }, 300);
    }
}

// DOM이 로드된 후 ThemeManager 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});