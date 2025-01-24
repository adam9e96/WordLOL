영어-한국어 단어 학습 웹 애플리케이션

주요 기능:

- 랜덤 영단어 제시
- 사용자 답안 확인
- 연속 정답 점수(streak) 추적
- 초성 힌트 제공
- 카드 뒤집기 애니메이션

아키텍처:

1. Backend (Spring Boot)

- WordDto: 단어 정보 모델
- WordResponse: 답안 체크 응답 모델
- WordRestController: REST API 엔드포인트 제공
- WordViewController: 웹 페이지 라우팅

2. Frontend (HTML/JS)

- 플립 카드 UI
- fetch API로 백엔드 통신
- 키보드 Enter 입력 지원

추후 개선

1. 단어 데이터 DB 저장
2. 사용자별 streak 관리
3. CORS 설정 구체화
4. 에러 처리 강화
5. 단어 중복 출제 방지