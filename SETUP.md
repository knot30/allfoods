# 다른 PC에서 allfoods 작업하기

코드는 GitHub(`knot30/allfoods`)에 있고, **비밀키(`.env.local`)만 USB로 옮기면** 된다.

## 처음 1회 세팅 (새 PC)

### 0. 미리 설치 (한 번만)
- [Node.js](https://nodejs.org) LTS (20 이상)
- [Git](https://git-scm.com)
- (AI로 계속 작업하려면) Claude Code: `npm i -g @anthropic-ai/claude-code`

### 1. 코드 받기
```powershell
cd C:\Users\<내계정>      # 작업할 위치
git clone https://github.com/knot30/allfoods
cd allfoods
```

### 2. 비밀키 넣기 (USB → 프로젝트)
USB(`E:\allfoods\.env.local`)의 **`.env.local` 파일을 방금 클론한 `allfoods` 폴더 안에 복사**한다.
(이 파일엔 나라장터·AI·Supabase 키가 들어있다. 절대 GitHub에 올리지 말 것 — 이미 .gitignore 처리됨.)

### 3. 패키지 설치 & 실행
```powershell
npm install        # 처음 1회 (인터넷 필요, 1~2분)
npm run dev        # http://localhost:3000
```

AI로 작업하려면 폴더에서:
```powershell
claude
```

## 두 PC 사이 동기화 (중요)

USB로 코드를 왔다갔다 복사하면 **버전이 꼬인다.** 대신 **Git으로 동기화**한다:

- **작업 시작 전**: `git pull`  (다른 PC에서 한 작업 받아오기)
- **작업 끝나면**: `git add -A && git commit -m "..." && git push`

→ 어느 PC에서 시작하든 `git pull` 한 번이면 최신 상태. USB는 `.env.local` 한 번 옮길 때만.

## 키가 바뀌면
`.env.local` 내용이 바뀌면(키 재발급 등) 그 파일만 USB로 다시 옮기면 된다.
Vercel 배포 환경변수는 별도(이미 등록됨)라 영향 없다.
