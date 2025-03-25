/**
 * 사이드바 메뉴 관리 클래스
 * 사이드바를 기본적으로 열린 상태로 표시하고,
 * 햄버거 버튼 클릭 시 확장/축소 토글 기능 제공
 */
class SidebarManager {
    constructor() {
        // DOM 요소
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.sidebarClose = document.getElementById('sidebar-close');
        this.overlay = document.getElementById('sidebar-overlay');

        // 상태 관리 변수
        this.isCollapsed = false; // 기본적으로 확장 상태
        this.isMobile = window.innerWidth < 992; // 모바일 여부 확인

        // 로컬 스토리지 키
        this.STORAGE_KEY = 'wordlol-sidebar-state';

        // 요소가 모두 존재하는지 확인
        if (!this.sidebar || !this.sidebarToggle || !this.sidebarClose || !this.overlay) {
            console.warn('사이드바 관련 요소를 찾을 수 없습니다.');
            return;
        }

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 초기 상태 설정
        this.initSidebarState();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 햄버거 버튼 클릭 시 사이드바 토글
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());

        // 닫기 버튼 클릭 시 사이드바 닫기 (모바일에서만 동작)
        this.sidebarClose.addEventListener('click', () => {
            if (this.isMobile) {
                this.closeSidebar();
            } else {
                this.toggleCollapse();
            }
        });

        // 오버레이 클릭 시 사이드바 닫기 (모바일에서만 표시됨)
        this.overlay.addEventListener('click', () => this.closeSidebar());

        // Esc 키 누를 때 사이드바 닫기 (모바일에서만)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobile && this.sidebar.classList.contains('open')) {
                this.closeSidebar();
            }
        });

        // 창 크기 변경 시 반응형 처리
        window.addEventListener('resize', () => this.handleResize());

        // 현재 페이지 경로에 맞는 메뉴 활성화
        this.activateCurrentPageLink();
    }

    /**
     * 초기 사이드바 상태 설정
     */
    initSidebarState() {
        // 저장된 상태 가져오기
        const savedState = localStorage.getItem(this.STORAGE_KEY);

        if (savedState) {
            const { isCollapsed } = JSON.parse(savedState);

            // 모바일에서는 기본적으로 닫힌 상태로 시작
            if (this.isMobile) {
                this.sidebar.classList.remove('open');
                this.sidebar.classList.add('closed');
                document.body.classList.remove('sidebar-open');
            } else {
                // 데스크톱에서는 저장된 상태 적용
                this.isCollapsed = isCollapsed;

                if (this.isCollapsed) {
                    this.sidebar.classList.add('collapsed');
                    document.body.classList.add('sidebar-collapsed');
                } else {
                    this.sidebar.classList.remove('collapsed');
                    document.body.classList.remove('sidebar-collapsed');
                    document.body.classList.add('sidebar-open');
                }
            }
        } else {
            // 기본 상태: 모바일에서는 닫힘, 데스크톱에서는 열림
            if (this.isMobile) {
                this.sidebar.classList.remove('open');
                this.sidebar.classList.add('closed');
                document.body.classList.remove('sidebar-open');
            } else {
                // 데스크톱에서는 확장된 상태로 시작
                this.sidebar.classList.remove('collapsed', 'closed');
                document.body.classList.add('sidebar-open');
                document.body.classList.remove('sidebar-collapsed');
            }
        }

        // UI 업데이트
        this.updateUI();
    }

    /**
     * 사이드바 토글 (모바일과 데스크톱에서 다르게 동작)
     */
    toggleSidebar() {
        if (this.isMobile) {
            // 모바일에서는 열기/닫기 토글
            if (this.sidebar.classList.contains('open')) {
                this.closeSidebar();
            } else {
                this.openSidebar();
            }
        } else {
            // 데스크톱에서는 확장/축소 토글
            this.toggleCollapse();
        }
    }

    /**
     * 사이드바 열기 (주로 모바일에서 사용)
     */
    openSidebar() {
        this.sidebar.classList.add('open');
        this.sidebar.classList.remove('closed');
        this.overlay.classList.add('open');
        document.body.classList.add('sidebar-open');
        this.saveState();
    }

    /**
     * 사이드바 닫기 (주로 모바일에서 사용)
     */
    closeSidebar() {
        this.sidebar.classList.remove('open');
        this.sidebar.classList.add('closed');
        this.overlay.classList.remove('open');
        document.body.classList.remove('sidebar-open');
        this.saveState();
    }

    /**
     * 사이드바 확장/축소 토글 (데스크톱에서 사용)
     */
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;

        if (this.isCollapsed) {
            this.sidebar.classList.add('collapsed');
            document.body.classList.add('sidebar-collapsed');
            document.body.classList.remove('sidebar-open');
        } else {
            this.sidebar.classList.remove('collapsed');
            document.body.classList.remove('sidebar-collapsed');
            document.body.classList.add('sidebar-open');
        }

        this.saveState();
    }

    /**
     * UI 상태 업데이트
     */
    updateUI() {
        // 모바일 상태에서는 별도 처리
        if (this.isMobile) {
            if (this.sidebar.classList.contains('open')) {
                this.overlay.classList.add('open');
            } else {
                this.overlay.classList.remove('open');
            }
        } else {
            // 데스크탑에서는 오버레이 항상 숨김
            this.overlay.classList.remove('open');

            // 사이드바 확장/축소 상태에 따른 UI 업데이트
            if (this.isCollapsed) {
                this.sidebar.classList.add('collapsed');
                document.body.classList.add('sidebar-collapsed');
                document.body.classList.remove('sidebar-open');
            } else {
                this.sidebar.classList.remove('collapsed');
                document.body.classList.remove('sidebar-collapsed');
                document.body.classList.add('sidebar-open');
            }
        }
    }

    /**
     * 상태 저장
     */
    saveState() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
            isCollapsed: this.isCollapsed
        }));
    }

    /**
     * 화면 크기 변경 시 처리
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 992;

        // 모바일에서 데스크톱으로 전환 시
        if (wasMobile && !this.isMobile) {
            this.sidebar.classList.remove('closed');
            this.overlay.classList.remove('open');

            // 저장된 상태 기반으로 사이드바 설정
            if (this.isCollapsed) {
                this.sidebar.classList.add('collapsed');
                document.body.classList.add('sidebar-collapsed');
                document.body.classList.remove('sidebar-open');
            } else {
                this.sidebar.classList.remove('collapsed');
                document.body.classList.remove('sidebar-collapsed');
                document.body.classList.add('sidebar-open');
            }
        }

        // 데스크톱에서 모바일로 전환 시
        if (!wasMobile && this.isMobile) {
            this.sidebar.classList.add('closed');
            this.sidebar.classList.remove('open', 'collapsed');
            document.body.classList.remove('sidebar-open', 'sidebar-collapsed');
        }
    }

    /**
     * 현재 페이지에 해당하는 링크 활성화
     */
    activateCurrentPageLink() {
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll('.sidebar-link');

        links.forEach(link => {
            const href = link.getAttribute('href');

            // 정확히 일치하거나 하위 경로인 경우 활성화
            if (currentPath === href ||
                (href !== '/' && currentPath.startsWith(href))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});