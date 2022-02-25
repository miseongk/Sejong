#  Sejong Mentor•Mentee Matching Application: Mentors👩🏻‍🏫

This is the backend repository of Mentors.

(Frontend repository 👉 https://github.com/byhhh2/MentoringApp )

## 개발 기술

    - Node.js
    - Express
    - MySQL
    
## 주요 기능
### 1. 로그인
- 세종대학교 대양휴머니티칼리지 크롤링 로그인
- 세종대학교 학생임을 인증
### 2. 게시글
- 멘토, 멘티 게시글 불러오기
- 게시글 검색 (필터링)
- 게시글 등록, 수정, 삭제
### 3. 채팅
- 게시글을 작성한 사람과 실시간 채팅
### 4. 멘토링 매칭 및 멘토링 일지 작성
- 채팅 후 멘토링 신청서 작성
- 멘토링 매칭
- 매칭 후 멘토링 일지 작성
- 멘토링 기록 불러오기, 등록, 수정, 삭제
### 5. 평가하기
- 맨토링 기간이 지난 후 상대방 평가
- 평가를 바탕으로 상대방 멘토링 온도에 반영
### 6. 프로필
- 프로필 소개, 멘토링 온도
- 멘토 혜택으로 멘토 역할 3번 진행하면 100포인트 충전
- 내 게시글 열람

## Dependencies

    - express
    - jsonwebtoken
    - mysql2
    - body-parser
    - selenium-webdriver
    - chromedriver
    - cheerio
    - socket.io
    - cors
    - moment

## Environment Variables

    - API_PORT
    - API_HOST
    - DB_HOST
    - DB_USER
    - DB_USER
    - DB_PASSWORD
    - SECRET_KEY : Secret key used for JWT
