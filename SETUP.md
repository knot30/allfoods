# 다른 PC에서 allfoods 작업하기 (USB 불필요)

코드는 **GitHub**(`knot30/allfoods`), 비밀키는 **Vercel**에서 받아온다. USB 없이 클라우드만으로 끝.

## 처음 1회 세팅 (새 PC)

### 0. 미리 설치 (한 번만)
- [Node.js](https://nodejs.org) LTS (20+)
- [Git](https://git-scm.com)
- Claude Code: `npm i -g @anthropic-ai/claude-code`

### 1. 코드 받기
```powershell
cd C:\Users\<내계정>
git clone https://github.com/knot30/allfoods
cd allfoods
```

### 2. 비밀키 받기 (Vercel에서 자동) — USB 대신 이걸로
```powershell
npx vercel login        # 한 번만. 브라우저로 로그인
npx vercel link         # allfoods 프로젝트 선택 (Y → 본인 계정 → allfoods)
npx vercel env pull .env.local   # 키들을 .env.local 로 자동 생성
```
→ 나라장터·AI·Supabase 키가 담긴 `.env.local`이 만들어진다. (GitHub엔 안 올라감)

### 3. 설치 & 실행
```powershell
npm install        # 처음 1회
npm run dev        # http://localhost:3000
claude             # AI로 작업 이어가기
```

## 매번 (두 PC 사이 동기화)

USB도 복사도 필요 없다. **Git만:**
- **시작 전**: `git pull`
- **끝나면**: `git add -A && git commit -m "..." && git push`

→ 어느 PC에서 시작하든 `git pull` 한 번이면 최신. `.env.local`은 한 번 받으면 계속 쓴다(키 바뀔 때만 `npx vercel env pull .env.local` 다시).

## 정리
| | 어디에 | 동기화 방법 |
|---|---|---|
| 코드 | GitHub | `git pull` / `git push` |
| 비밀키 | Vercel | `npx vercel env pull .env.local` (1회) |
| 배포 | Vercel (자동) | `git push` 하면 자동 배포 |

USB(`E:\allfoods\.env.local`)는 백업/오프라인용으로만 남겨둬도 된다.
