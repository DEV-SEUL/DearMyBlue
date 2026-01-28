## 페어틀 메이커 💚💜

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 주요 기능

- **4개 카드 레이아웃**: 의상 A - 캐릭터 A - 캐릭터 B - 의상 B
- **이미지 크롭**: 업로드한 이미지를 원하는 비율로 자르기
- **실시간 편집**: 모든 텍스트 필드 즉시 수정 가능
- **컬러 팔레트**: 각 캐릭터별 3가지 색상 지정
- **특징 리스트**: 동적으로 추가/삭제 가능한 특징 항목
- **PNG 저장**: 전체 프로필을 고해상도 이미지로 저장
- **반응형**: 모바일, 태블릿, 데스크톱 모두 지원

## 사용 예시

- 커미션 레퍼런스 시트
- 소설/만화 캐릭터 프로필
- TRPG 캐릭터 시트

## 파일 구조

```
notion-profile-maker/
├── index.html      # 메인 HTML 파일
├── style.css       # 스타일시트
├── script.js       # JavaScript 기능
└── README.md       # 문서
```

### 사용 방법

#### 1️⃣ 페어명 입력

- 상단 "Untitled Pair" 클릭하여 페어명 입력

#### 2️⃣ 의상 이미지 추가

- **메인 이미지**: 큰 박스 클릭 → 이미지 업로드 → 크롭
- **표정 이미지**: 😊 박스 클릭하여 추가
- **SD 이미지**: 🐰 박스 클릭하여 추가

#### 3️⃣ 캐릭터 정보 입력

- **이름**: "Character A/B" 클릭하여 수정
- **키워드**: "키워드1 / 키워드2 / 키워드3" 형식으로 입력
- **신장/체중**: "000cm / 00kg" 형식으로 입력
- **캐릭터 이미지**: 이미지 박스 클릭하여 업로드

#### 4️⃣ 특징 리스트 작성

- 기본 항목 클릭하여 수정
- 호버 시 나타나는 `+` 버튼으로 항목 추가
- `-` 버튼으로 항목 삭제

#### 5️⃣ 컬러 팔레트 설정

- 각 컬러 도트 클릭
- 컬러 피커에서 원하는 색상 선택

#### 6️⃣ PNG로 저장

- 상단 "Export PNG" 버튼 클릭
- 자동으로 다운로드

### 이미지 비율

- **의상 이미지**: 2:3 비율 (직사각형)
- **캐릭터 이미지**: 1:1 비율 (정사각형)
- **표정/SD**: 1:1 비율 (정사각형)

### 최적 이미지 크기

- 의상: 500px × 750px 이상
- 캐릭터: 600px × 600px 이상
- 표정/SD: 300px × 300px 이상

### 키보드 단축키

- `Enter`: 새 줄 추가 (contenteditable)
- `Backspace`: 내용 삭제
- `Tab`: 다음 필드로 이동

## 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, CSS Variables, Animations
- **Vanilla JavaScript**: ES6+
- **외부 라이브러리**:
  - [Cropper.js](https://fengyuanchen.github.io/cropperjs/) - 이미지 크롭
  - [html2canvas](https://html2canvas.hertzen.com/) - 스크린샷 캡처
  - [GmarketSans](https://webfontworld.github.io/gmarket/) - 폰트

## 브라우저 호환성

| Browser | Version |
| ------- | ------- |
| Chrome  | ✅ 90+  |
| Firefox | ✅ 88+  |
| Safari  | ✅ 14+  |
| Edge    | ✅ 90+  |

## 업데이트 내역

### v2.0.0 (2025-01-28)

- 컴포넌트 분리 (HTML/CSS/JS)
- 코드 최적화 및 주석 추가
- 반응형 디자인 개선

## 👤

- **GitHub**: [@devseul]

## 🙏

- [Cropper.js](https://github.com/fengyuanchen/cropperjs)
- [html2canvas](https://github.com/niklasvh/html2canvas)
- [GmarketSans](https://corp.gmarket.com/fonts)

## 💬

버그 리포트, 기능 제안, 질문은 [Issues](seulcoc7@gmail.com)에 남겨주세요!

---

⭐ 이 프로젝트가 마음에 드셨다면 Star를 눌러주세요!

