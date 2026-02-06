<project_specification>

<project_name>KakaoBook - AI 기반 지식 노트북 & 비주얼 콘텐츠 생성 플랫폼</project_name>

<!-- ============================================================
     참조 스크린샷 (NotebookLM 원본 UI)
     ============================================================

     프로젝트 디렉토리에 포함된 NotebookLM 레퍼런스 스크린샷:

     1. 스크린샷 2026-02-06 10.29.46.png
        - 홈 화면: 노트북 그리드 레이아웃
        - 카드형 노트북 목록 (이모지 아이콘 + 제목 + 날짜 + 소스 수)
        - 상단 탭: 전체 / 내 노트북 / 공유 검색함
        - 우측 상단: 설정, 그리드/리스트 뷰 토글, 새로 만들기 버튼

     2. 스크린샷 2026-02-06 10.30.29.png
        - 노트북 내부: 3패널 레이아웃
        - 좌측 "출처" 패널: 소스 추가, 검색, Fast Research 토글, 소스 목록 (체크박스)
        - 중앙 "채팅" 패널: AI 요약 카드, 추천 질문, 채팅 입력창
        - 우측 "스튜디오" 패널: AI 오디오 오버뷰, 동영상 개요, 마인드맵, 보고서,
          플래시카드, 퀴즈, 인포그래픽, 슬라이드 자료, 데이터 표 + 생성된 콘텐츠 목록

     3. 스크린샷 2026-02-06 10.30.42.png
        - "인포그래픽 맞춤설정" 모달
        - 언어 선택 드롭다운 (한국어)
        - 방향 선택: 가로 / 세로 / 정사각형
        - 세부정보 수준: 간결하게 / 표준 / 상세 (AI)
        - 프롬프트 입력 텍스트영역
        - "생성" 버튼

     4. 스크린샷 2026-02-06 10.30.52.png
        - "슬라이드 자료 맞춤설정" 모달
        - 형식 선택: 자세한 자료 (✓) / 발표자 슬라이드
        - 언어 선택 드롭다운 (한국어)
        - 깊이: 짧게 / 기본값 (✓)
        - 프롬프트 입력 텍스트영역
        - "생성" 버튼

     5. 스크린샷 2026-02-06 10.31.05.png
        - "소스 추가" 모달
        - 상단: 웹 검색 바 + Fast Research 토글
        - 파일 드롭 영역: "PDF, 이미지, 문서, 오디오 등"
        - 하단 버튼: 파일 업로드 / 웹사이트 / Drive / 복사된 텍스트
        - 소스 카운터: 1/300
     ============================================================ -->

<overview>
KakaoBook은 Google NotebookLM을 모델로 한 AI 기반 지식 관리 및 비주얼 콘텐츠 생성 플랫폼입니다. 사용자가 다양한 소스(PDF, 웹페이지, YouTube, Google Docs, 텍스트, 이미지, 오디오)를 업로드하면, AI가 이를 분석하여 요약, Q&A 채팅, 인포그래픽, 슬라이드, 마인드맵, 보고서 등 다양한 형태의 콘텐츠를 자동 생성합니다.

핵심 차별화 기능은 Google Nano Banana Pro (Gemini 3 Pro Image) API를 활용한 고품질 인포그래픽 및 슬라이드 이미지 생성입니다. 사용자는 업로드한 소스를 기반으로 프롬프트를 입력하여 자유롭게 인포그래픽과 슬라이드를 생성하고, 생성된 결과물을 편집 및 재생성할 수 있습니다. Nano Banana Pro의 뛰어난 텍스트 렌더링 능력을 활용하여 다국어 텍스트가 포함된 고퀄리티 비주얼 콘텐츠를 제공합니다.

CRITICAL: 인증은 Supabase Auth를 통한 Google OAuth 2.0만 지원합니다. 모든 데이터는 Supabase PostgreSQL에 저장되며, 파일 업로드는 Supabase Storage를 사용합니다. AI 기능은 Google Gemini API (채팅/요약)와 Nano Banana Pro API (이미지 생성)를 백엔드 API Route를 통해 호출합니다. 클라이언트에서 직접 AI API를 호출하지 않습니다.
</overview>

<technology_stack>
  <frontend_application>
    <framework>Next.js 15.1 (App Router) + TypeScript 5.7</framework>
    <build_tool>Turbopack (Next.js 내장)</build_tool>
    <styling>Tailwind CSS v4.0 + shadcn/ui (latest)</styling>
    <routing>Next.js App Router (file-based routing)</routing>
    <state_management>Zustand v5.0 for client state, TanStack Query v5.62 for server state</state_management>
    <forms>React Hook Form v7.54 + Zod v3.24 for validation</forms>
  </frontend_application>

  <data_layer>
    <database>Supabase PostgreSQL (managed)</database>
    <orm>Supabase JS Client v2.49 + generated TypeScript types</orm>
    <file_storage>Supabase Storage for user-uploaded files (PDF, images, audio)</file_storage>
    <realtime>Supabase Realtime for notebook sharing updates</realtime>
    <vector_search>Supabase pgvector extension for source content embeddings</vector_search>
    <note>CRITICAL: 모든 RLS(Row Level Security) 정책을 통해 사용자별 데이터 격리 보장</note>
  </data_layer>

  <backend>
    <runtime>Next.js API Routes (Edge Runtime where applicable)</runtime>
    <auth>Supabase Auth with Google OAuth 2.0 provider</auth>
    <ai_apis>
      - Google Gemini API (gemini-2.5-flash) for chat, summarization, content generation
      - Google Nano Banana Pro API (gemini-3-pro-image-preview) for infographic and slide image generation
    </ai_apis>
    <api_style>REST API Routes under /api/* with streaming support for AI responses</api_style>
  </backend>

  <build_output>
    <build_command>npm run build</build_command>
    <output_directory>.next/</output_directory>
    <deployment>Vercel (recommended) or any Node.js hosting</deployment>
    <note>Environment variables required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY</note>
  </build_output>

  <libraries>
    <supabase>@supabase/supabase-js v2.49 + @supabase/ssr v0.6 for auth and database</supabase>
    <ai>@google/genai v1.3 for Gemini and Nano Banana Pro API calls</ai>
    <markdown>react-markdown v9.0 + remark-gfm v4.0 for AI response rendering</markdown>
    <pdf>pdf-parse v1.1.1 for PDF text extraction</pdf>
    <dnd>@dnd-kit/core v6.3 for drag-and-drop source reordering</dnd>
    <icons>lucide-react v0.469 for iconography</icons>
    <toast>sonner v1.7 for toast notifications</toast>
    <resizable>react-resizable-panels v2.1 for panel resizing</resizable>
    <file_upload>react-dropzone v14.3 for file drag-and-drop upload</file_upload>
    <syntax>shiki v1.29 for code syntax highlighting in chat</syntax>
    <date>date-fns v4.1 for date formatting</date>
  </libraries>
</technology_stack>

<prerequisites>
  <environment_setup>
    - Node.js >= 20.x LTS
    - npm >= 10.x
    - Supabase CLI v2.x (for local development and migrations)
    - Supabase 프로젝트 (PostgreSQL + Auth + Storage + Realtime)
    - Google Cloud Console 프로젝트 (OAuth 2.0 credentials + Gemini API key)
    - Google AI Studio API key (Nano Banana Pro 접근용)
  </environment_setup>

  <build_configuration>
    - next.config.ts: images.remotePatterns에 Supabase Storage 도메인 추가
    - Supabase: Google OAuth provider 활성화, redirect URL 설정
    - Supabase Storage: sources 버킷 생성 (10MB 파일 제한, allowed MIME types 설정)
    - Supabase Database: pgvector extension 활성화, RLS 정책 설정
    - Environment variables: .env.local 파일에 모든 키 설정
  </build_configuration>
</prerequisites>

<core_data_entities>
  <user>
    - id: uuid (Supabase Auth user ID, PK)
    - email: string (Google OAuth에서 가져옴)
    - display_name: string (Google 프로필 이름)
    - avatar_url: string (Google 프로필 이미지 URL)
    - created_at: timestamptz (default now())
    - updated_at: timestamptz (default now())
    Indexes: [email]
  </user>

  <notebook>
    - id: uuid (PK, default gen_random_uuid())
    - user_id: uuid (FK → user.id, required)
    - title: string (required, max 200 characters, default "제목 없는 노트북")
    - emoji: string (노트북 아이콘 이모지, default "📓")
    - description: text (optional, AI 생성 요약)
    - is_shared: boolean (default false)
    - share_token: string (unique, nullable, 공유 링크용)
    - source_count: integer (default 0, denormalized counter)
    - created_at: timestamptz (default now())
    - updated_at: timestamptz (default now())
    Indexes: [user_id+created_at DESC], [share_token]
    RLS: user_id = auth.uid() OR (is_shared = true AND share_token matches)
  </notebook>

  <source>
    - id: uuid (PK, default gen_random_uuid())
    - notebook_id: uuid (FK → notebook.id, required, ON DELETE CASCADE)
    - user_id: uuid (FK → user.id, required)
    - type: enum (pdf, text, url, youtube, google_doc, google_slide, google_sheet, image, audio)
    - title: string (required, max 300 characters)
    - original_url: text (nullable, 원본 URL)
    - file_path: text (nullable, Supabase Storage 경로)
    - file_size: integer (nullable, bytes)
    - mime_type: string (nullable)
    - extracted_text: text (추출된 텍스트 전문)
    - summary: text (nullable, AI 생성 요약)
    - embedding: vector(1536) (pgvector, 콘텐츠 임베딩)
    - metadata: jsonb (소스별 추가 메타데이터: page_count, duration, author 등)
    - sort_order: integer (default 0, 수동 정렬용)
    - is_enabled: boolean (default true, 채팅 시 소스 활성/비활성)
    - processing_status: enum (pending, processing, completed, failed)
    - created_at: timestamptz (default now())
    - updated_at: timestamptz (default now())
    Indexes: [notebook_id+sort_order], [notebook_id+is_enabled], [user_id], embedding (ivfflat)
    RLS: user_id = auth.uid()
  </source>

  <chat_message>
    - id: uuid (PK, default gen_random_uuid())
    - notebook_id: uuid (FK → notebook.id, required, ON DELETE CASCADE)
    - user_id: uuid (FK → user.id, required)
    - role: enum (user, assistant)
    - content: text (required, 메시지 내용)
    - citations: jsonb[] (소스 인용 정보 배열: [{source_id, text_snippet, page_number}])
    - model: string (nullable, 사용된 AI 모델명)
    - tokens_used: integer (nullable)
    - created_at: timestamptz (default now())
    Indexes: [notebook_id+created_at ASC]
    RLS: user_id = auth.uid()
  </chat_message>

  <studio_output>
    - id: uuid (PK, default gen_random_uuid())
    - notebook_id: uuid (FK → notebook.id, required, ON DELETE CASCADE)
    - user_id: uuid (FK → user.id, required)
    - type: enum (audio_overview, video_overview, mind_map, report, flashcard, quiz, infographic, slide_deck, data_table)
    - title: string (required, max 300 characters)
    - content: jsonb (타입별 구조화된 콘텐츠 데이터)
    - image_urls: text[] (Nano Banana 생성 이미지 URL 배열, Supabase Storage)
    - settings: jsonb (생성 시 사용된 설정: language, orientation, detail_level, prompt 등)
    - generation_status: enum (pending, generating, completed, failed)
    - error_message: text (nullable, 실패 시 에러 메시지)
    - source_ids: uuid[] (생성에 사용된 소스 ID 배열)
    - created_at: timestamptz (default now())
    - updated_at: timestamptz (default now())
    Indexes: [notebook_id+type+created_at DESC], [user_id]
    RLS: user_id = auth.uid()
  </studio_output>

  <note>
    - id: uuid (PK, default gen_random_uuid())
    - notebook_id: uuid (FK → notebook.id, required, ON DELETE CASCADE)
    - user_id: uuid (FK → user.id, required)
    - content: text (required, 메모 내용)
    - pinned: boolean (default false)
    - created_at: timestamptz (default now())
    - updated_at: timestamptz (default now())
    Indexes: [notebook_id+pinned DESC+created_at DESC]
    RLS: user_id = auth.uid()
  </note>
</core_data_entities>

<pages_and_interfaces>
  <global_layout>
    <description>
      앱은 두 가지 주요 레이아웃으로 구성됩니다:
      1. 홈 레이아웃: 상단 네비게이션 + 노트북 그리드
      2. 노트북 레이아웃: 상단 헤더 + 3패널 (출처 | 채팅 | 스튜디오)
    </description>

    <top_navigation_home>
      - 높이: 56px
      - 배경: #FFFFFF, 하단 보더: 1px solid #E5E7EB
      - 좌측: 로고 아이콘 (28px) + "KakaoBook" 텍스트 (font-size: 18px, font-weight: 700, color: #1F2937)
      - 중앙: 탭 네비게이션 ("전체" | "내 노트북" | "공유 검색함") - 활성 탭: color #6D28D9, border-bottom 2px solid #6D28D9
      - 우측: 검색 아이콘 (20px) + 그리드/리스트 뷰 토글 + "최신 활동순" 정렬 드롭다운 + "새로 만들기" 버튼 (bg: #6D28D9, text: white, rounded-lg, px-4 py-2) + 사용자 아바타 (32px circle)
    </top_navigation_home>

    <top_navigation_notebook>
      - 높이: 48px
      - 배경: #FFFFFF, 하단 보더: 1px solid #E5E7EB
      - 좌측: KakaoBook 로고 아이콘 (클릭 시 홈으로) + 노트북 제목 (editable, font-size: 15px, font-weight: 600)
      - 중앙-우측: "+ 노트북 만들기" 버튼 (bg: #6D28D9, text: white) + "분석" 버튼 + "공유" 버튼 + "설정" 아이콘 + "PRO" 배지 (선택적) + 사용자 아바타
    </top_navigation_notebook>
  </global_layout>

  <!-- ===== 1. 로그인 페이지 ===== -->
  <login_page>
    <route>/login</route>
    <layout>
      - 전체 화면 중앙 정렬 레이아웃
      - 배경: 그라디언트 #F9FAFB → #EDE9FE (상단→하단)
      - 로그인 카드: max-width 400px, bg: #FFFFFF, rounded-2xl, shadow-lg, padding 48px
    </layout>
    <content>
      - KakaoBook 로고 + 이름 (중앙 정렬, 48px 로고)
      - 서비스 설명 텍스트: "AI 기반 지식 노트북" (font-size: 14px, color: #6B7280, margin-top: 8px)
      - Google 로그인 버튼: width 100%, height 48px, border 1px solid #D1D5DB, rounded-lg, Google 로고 + "Google로 계속하기" 텍스트
        - hover: bg #F9FAFB, border-color #9CA3AF
        - active: bg #F3F4F6
      - 하단 약관 텍스트: font-size 12px, color #9CA3AF, "계속 진행하면 서비스 약관 및 개인정보처리방침에 동의하게 됩니다."
    </content>
    <behavior>
      - Google 로그인 버튼 클릭 → Supabase Auth signInWithOAuth({ provider: 'google' })
      - 로그인 성공 → /callback 라우트에서 세션 교환 → 홈(/)으로 redirect
      - 이미 로그인 상태 → 자동으로 홈(/)으로 redirect
    </behavior>
  </login_page>

  <!-- ===== 2. 홈 페이지 (노트북 목록) ===== -->
  <home_page>
    <route>/</route>
    <layout>
      - 상단 네비게이션 (top_navigation_home)
      - 메인 콘텐츠: max-width 1280px, mx-auto, padding 24px
      - "최근 노트북" 헤더: font-size 20px, font-weight: 600, color: #1F2937, margin-bottom 24px
    </layout>

    <notebook_grid>
      - 그리드: grid-template-columns repeat(auto-fill, minmax(220px, 1fr)), gap 16px
      - "새 노트 만들기" 카드 (첫 번째 위치):
        - border: 2px dashed #D1D5DB, rounded-xl, height 160px
        - 중앙: "+" 아이콘 (40px, color #9CA3AF) + "새 노트 만들기" 텍스트 (14px, color #6B7280)
        - hover: border-color #6D28D9, bg #FAF5FF
      - 노트북 카드:
        - bg: #F0FDF4 (연한 초록) 또는 #FEF3C7 (연한 노랑) 또는 #EDE9FE (연한 보라) - 노트북별 랜덤 배경
        - rounded-xl, height 160px, padding 16px, cursor pointer
        - 상단: 이모지 아이콘 (32px)
        - 중단: 제목 (font-size: 14px, font-weight: 600, color: #1F2937, max 2줄, text-overflow ellipsis)
        - 하단: 날짜 (font-size: 12px, color: #9CA3AF) + "소스 N개" (font-size: 12px, color: #9CA3AF)
        - hover: shadow-md, transform translateY(-2px), transition 200ms ease
        - 우측 상단: 더보기 메뉴 (⋮) → 이름 변경 / 삭제 / 공유
    </notebook_grid>

    <list_view>
      - 테이블 형식: 이모지 + 제목 | 소스 수 | 마지막 수정일
      - 행 높이: 48px, hover bg: #F9FAFB
      - 클릭: 노트북 열기
    </list_view>

    <empty_state>
      - 중앙 정렬, margin-top 120px
      - 일러스트 아이콘: 빈 노트북 이미지 (120px)
      - "노트북을 만들어 시작하세요" (font-size: 18px, font-weight: 600, color: #374151)
      - "소스를 추가하고 AI와 함께 학습하세요" (font-size: 14px, color: #9CA3AF, margin-top: 8px)
      - "새 노트북 만들기" 버튼 (bg: #6D28D9, text: white, mt: 24px)
    </empty_state>
  </home_page>

  <!-- ===== 3. 노트북 상세 페이지 (3패널 레이아웃) ===== -->
  <notebook_detail_page>
    <route>/notebook/[id]</route>
    <layout>
      - 상단 네비게이션 (top_navigation_notebook)
      - 본문: 3패널 리사이저블 레이아웃 (react-resizable-panels 사용)
        - 좌측 패널 (출처): 기본 width 240px, min 200px, max 400px, collapsible
        - 중앙 패널 (채팅): flex-1, min 400px
        - 우측 패널 (스튜디오): 기본 width 280px, min 240px, max 420px, collapsible
      - 패널 구분선: 1px solid #E5E7EB, hover 시 2px solid #6D28D9 (리사이즈 가능 표시)
    </layout>

    <!-- === 3-1. 출처 패널 (좌측) === -->
    <sources_panel>
      <header>
        - "출처" 텍스트 (font-size: 14px, font-weight: 600) + 패널 접기 아이콘 (우측)
        - "+ 소스 추가" 버튼: width 100%, height 36px, border 1px dashed #D1D5DB, rounded-lg, font-size 13px
          - hover: border-color #6D28D9, color #6D28D9
      </header>

      <search>
        - 검색 입력: height 32px, rounded-md, border 1px solid #E5E7EB, placeholder "웹에서 새 소스를 검색하세요"
        - 아래: 필터 칩 (🌐 웹 토글 + "Fast Research" 토글 드롭다운)
      </search>

      <source_list>
        - "모든 소스 선택" 체크박스 (font-size: 13px)
        - 소스 아이템:
          - height: 36px, padding 8px 12px
          - 좌측: 아이콘 (타입별: 📄 PDF, 🔗 URL, 🎥 YouTube, 📝 텍스트, 🖼️ 이미지, 🎵 오디오)
          - 중앙: 제목 (font-size: 13px, text-overflow ellipsis, max 1줄)
          - 우측: 활성화 체크박스 (checked = 초록 ✓)
          - hover: bg #F9FAFB
          - processing 상태: 좌측에 스피너 애니메이션 (16px)
          - failed 상태: 빨간색 경고 아이콘
        - 소스 클릭: 중앙 패널에서 소스 상세 내용 표시 (채팅 대체)
        - 드래그&드롭: 소스 순서 변경 가능 (@dnd-kit)
      </source_list>

      <empty_state>
        - "소스를 추가하여 시작하세요" (font-size: 13px, color: #9CA3AF, text-align center, padding 24px)
      </empty_state>
    </sources_panel>

    <!-- === 3-2. 채팅 패널 (중앙) === -->
    <chat_panel>
      <header>
        - "채팅" 텍스트 (font-size: 14px, font-weight: 600)
        - 우측: 필터/정렬 아이콘 + 더보기 메뉴 (⋮)
      </header>

      <initial_state>
        AI가 자동 생성한 노트북 요약 카드:
        - ⚠️ 경고 아이콘 (AI 생성 콘텐츠 면책)
        - 노트북 제목 (font-size: 22px, font-weight: 700)
        - "소스 N개" 배지 (font-size: 12px, color: #6B7280)
        - AI 요약 텍스트 (font-size: 14px, line-height: 1.6, color: #374151)
        - 액션 버튼 행: "메모에 저장" + 복사 + 좋아요 + 싫어요
        - 추천 질문 목록 (2-4개): 라운드 칩 스타일, bg: #F3F4F6, hover bg: #EDE9FE
      </initial_state>

      <chat_messages>
        - 사용자 메시지: 우측 정렬, bg: #EDE9FE, rounded-2xl rounded-br-md, padding 12px 16px, max-width 80%
        - AI 응답: 좌측 정렬, bg: transparent, padding 12px 0, max-width 90%
          - Markdown 렌더링 (react-markdown)
          - 인용 표시: 상단 첨자 [1] 형태, color: #6D28D9, 클릭 시 소스 하이라이트
          - 코드 블록: syntax highlighting (shiki), rounded-lg, bg: #1F2937
          - 하단 액션: "메모에 저장" + 복사 + 좋아요 + 싫어요
        - 스트리밍 응답: 타이핑 애니메이션 (cursor blink, 토큰 단위 스트리밍)
        - 로딩 상태: 3개 점 bounce 애니메이션
      </chat_messages>

      <chat_input>
        - 하단 고정, padding 16px
        - 입력 필드: width 100%, min-height 44px, max-height 200px, auto-resize
          - border: 1px solid #E5E7EB, rounded-2xl, padding 12px 48px 12px 16px
          - placeholder: "입력을 시작하세요..."
          - focus: border-color #6D28D9, ring 2px #6D28D9/20%
        - 우측 내부: 전송 버튼 (→ 아이콘, 36px circle, bg: #6D28D9 when has text, bg: #E5E7EB when empty)
        - 좌측 하단: "소스 N개" 배지 (현재 활성화된 소스 수 표시)
        - Enter: 전송, Shift+Enter: 줄바꿈
      </chat_input>
    </chat_panel>

    <!-- === 3-3. 스튜디오 패널 (우측) === -->
    <studio_panel>
      <header>
        - "스튜디오" 텍스트 (font-size: 14px, font-weight: 600)
        - 우측: 패널 접기 아이콘
      </header>

      <output_tiles>
        4x2 그리드 + 1행 추가 (총 9개 타일), gap 8px:

        Row 1:
        - "AI 오디오 오버뷰" (아이콘: 🎧, bg: #DBEAFE, size: 120x56px)
        - "동영상 개요" (아이콘: 🎬, bg: #DBEAFE, size: 120x56px)

        Row 2:
        - "마인드맵" (아이콘: 💜, bg: #F3E8FF, size: 120x56px)
        - "보고서" (아이콘: 📄, bg: #F3E8FF, size: 120x56px)

        Row 3:
        - "플래시카드" (아이콘: 🟢, bg: #DCFCE7, size: 120x56px)
        - "퀴즈" (아이콘: 🟣, bg: #DCFCE7, size: 120x56px)

        Row 4:
        - "인포그래픽" (아이콘: 📊, bg: #FEF3C7, size: 120x56px) ← 메인 기능
        - "슬라이드 자료" (아이콘: 🖼️, bg: #FEF3C7, size: 120x56px) ← 메인 기능

        Row 5:
        - "데이터 표" (아이콘: 📋, bg: #E0F2FE, size: full-width x 56px)

        각 타일:
        - rounded-lg, padding 8px 12px, cursor pointer
        - 좌측: 아이콘 (20px) + 텍스트 (font-size: 12px, font-weight: 500)
        - 우측: 편집(✏️) 아이콘 버튼 (hover 시 표시)
        - hover: opacity 0.8, shadow-sm
        - 클릭: 해당 타입의 맞춤설정 모달 열기
      </output_tiles>

      <generated_content_list>
        - 구분선 (1px solid #E5E7EB, margin 16px 0)
        - 생성된 콘텐츠 아이템:
          - height: auto, padding 12px
          - 좌측: 타입 아이콘 (16px)
          - 중앙: 제목 (font-size: 13px, font-weight: 500) + 메타 정보 (소스 N개, N분 전)
          - 우측: 더보기 메뉴 (⋮) → 열기 / 재생성 / 삭제
          - 클릭: 생성된 콘텐츠 뷰어 열기 (중앙 패널 또는 모달)
          - generating 상태: 프로그레스 바 + "생성 중..." 텍스트
      </generated_content_list>

      <bottom_action>
        - 하단 고정: "📝 메모 추가" 버튼 (width 100%, height 40px, bg: #F9FAFB, border 1px solid #E5E7EB, rounded-lg)
      </bottom_action>
    </studio_panel>
  </notebook_detail_page>

  <!-- ===== 4. 소스 추가 모달 ===== -->
  <source_add_modal>
    <trigger>출처 패널의 "+ 소스 추가" 버튼 클릭</trigger>
    <layout>
      - 중앙 모달, max-width 560px, max-height 480px
      - bg: #FFFFFF, rounded-2xl, shadow-2xl
      - 오버레이: bg rgba(0,0,0,0.4), backdrop-blur 4px
      - 진입 애니메이션: scale(0.95) → scale(1), opacity 0→1, duration 200ms ease-out
    </layout>
    <content>
      <header>
        - "웹사이트를 활용해 AI 오디오 및 동영상 오버뷰 만들기" (font-size: 16px, font-weight: 600, text-align center)
        - 우측 상단: X 닫기 버튼
      </header>

      <web_search>
        - 검색 입력: height 40px, rounded-lg, border 1px solid #E5E7EB
        - placeholder: "웹에서 새 소스를 검색하세요"
        - 아래: 🌐 웹 토글 + "Fast Research" 드롭다운
        - 우측: → 검색 버튼
      </web_search>

      <file_drop_zone>
        - height 120px, border 2px dashed #D1D5DB, rounded-xl, bg: #F9FAFB
        - 중앙: "또는 파일 드롭" (font-size: 15px, font-weight: 500)
        - 아래: "PDF, 이미지, 문서, 오디오 등" (font-size: 13px, color: #9CA3AF)
        - 드래그 오버: border-color #6D28D9, bg #FAF5FF
        - 파일 제한: 최대 10MB, 허용 MIME: application/pdf, text/*, image/*, audio/*
      </file_drop_zone>

      <source_type_buttons>
        하단 4개 버튼 (가로 배치, gap 8px):
        - "📁 파일 업로드" → 파일 선택 다이얼로그
        - "🌐 웹사이트" → URL 입력 인라인 필드
        - "📂 Drive" → Google Drive 파일 선택 (future, 비활성)
        - "📋 복사된 텍스트" → 텍스트 입력 모달
        각 버튼: height 36px, border 1px solid #E5E7EB, rounded-lg, font-size 13px
        hover: bg #F9FAFB
      </source_type_buttons>

      <footer>
        - 우측 하단: 소스 카운터 "N/300" (font-size: 12px, color: #9CA3AF)
      </footer>
    </content>
  </source_add_modal>

  <!-- ===== 5. 인포그래픽 맞춤설정 모달 ===== -->
  <infographic_settings_modal>
    <trigger>스튜디오 패널의 "인포그래픽" 타일 클릭</trigger>
    <layout>
      - 중앙 모달, max-width 520px
      - bg: #FFFFFF, rounded-2xl, shadow-2xl
      - 헤더: "📊 인포그래픽 맞춤설정" (font-size: 16px, font-weight: 600) + X 닫기
    </layout>
    <content>
      <language_select>
        - 라벨: "언어 선택" (font-size: 13px, font-weight: 500, color: #374151)
        - 드롭다운: height 36px, 기본값 "한국어"
        - 옵션: 한국어, English, 日本語, 中文, Español, Français, Deutsch
      </language_select>

      <orientation_select>
        - 라벨: "방향 선택" (font-size: 13px, font-weight: 500)
        - 3개 토글 버튼 (가로 배치):
          - "가로" (선택 시: bg #F3F4F6, border 1px solid #374151)
          - "세로"
          - "정사각형"
        - 기본 선택: "가로"
        - 비선택: bg transparent, border 1px solid #E5E7EB
      </orientation_select>

      <detail_level>
        - 라벨: "세부정보 수준" (font-size: 13px, font-weight: 500)
        - 3개 토글 버튼:
          - "간결하게"
          - "표준" (기본 선택)
          - "상세 (AI)" - AI 배지 포함
      </detail_level>

      <prompt_input>
        - 라벨: "만들려는 인포그래픽에 대한 설명" (font-size: 13px, font-weight: 500)
        - 텍스트영역: height 80px, resize vertical, rounded-lg, border 1px solid #E5E7EB
        - placeholder: '스타일, 색상 또는 강조할 부분 안내: "파란색 색상 테마를 사용하고 3가지 주요 통계를 강조해 줘."'
        - focus: border-color #6D28D9
      </prompt_input>

      <submit_button>
        - "생성" 버튼: width auto, height 40px, bg: #6D28D9, text: white, rounded-lg, px 24px
        - 우측 하단 배치
        - hover: bg #5B21B6
        - loading: 스피너 + "생성 중..." 텍스트
        - disabled (소스 없을 때): bg #E5E7EB, cursor not-allowed
      </submit_button>
    </content>
  </infographic_settings_modal>

  <!-- ===== 6. 슬라이드 맞춤설정 모달 ===== -->
  <slide_settings_modal>
    <trigger>스튜디오 패널의 "슬라이드 자료" 타일 클릭</trigger>
    <layout>
      - 중앙 모달, max-width 560px
      - bg: #FFFFFF, rounded-2xl, shadow-2xl
      - 헤더: "🖼️ 슬라이드 자료 맞춤설정" (font-size: 16px, font-weight: 600) + X 닫기
    </layout>
    <content>
      <format_select>
        - 라벨: "형식" (font-size: 13px, font-weight: 500)
        - 2개 카드 선택 (가로 배치, gap 12px):
          1. "자세한 자료" 카드:
            - width 50%, padding 16px, border 1px solid #E5E7EB, rounded-xl
            - 선택 시: border 2px solid #6D28D9, bg #FAF5FF, ✓ 체크 아이콘
            - 설명: "전체 텍스트의 세부정보가 가득한 포괄적인 자료로, 이메일로 보내거나 단독으로 읽기에 적합합니다."
          2. "발표자 슬라이드" 카드:
            - 동일 스타일
            - 설명: "발표하는 동안 도움이 될 핵심 내용을 담은 간결하고 시각적인 슬라이드입니다."
      </format_select>

      <language_select>
        - 인포그래픽과 동일한 언어 선택 드롭다운
      </language_select>

      <depth_select>
        - 라벨: "깊이" (font-size: 13px, font-weight: 500)
        - 2개 토글 버튼:
          - "짧게"
          - "기본값" (기본 선택, ✓ 체크)
      </depth_select>

      <prompt_input>
        - 라벨: "만들려는 슬라이드 자료에 대한 설명"
        - 텍스트영역: 인포그래픽과 동일
        - placeholder: '간략한 개요를 추가하거나 청중, 스타일, 강조할 점에 대한 가이드 제공: "단계별 안내에 초점을 둔 대담하고 재미있는 스타일의 초보자용 자료를 만들어 줘."'
      </prompt_input>

      <submit_button>
        - "생성" 버튼: 인포그래픽과 동일 스타일
      </submit_button>
    </content>
  </slide_settings_modal>

  <!-- ===== 7. 콘텐츠 뷰어 (인포그래픽/슬라이드 결과) ===== -->
  <content_viewer>
    <trigger>스튜디오 패널의 생성된 콘텐츠 아이템 클릭</trigger>
    <layout>
      - 중앙 패널 전체를 대체하거나, 풀스크린 모달
      - 상단 바: 제목 + "← 채팅으로 돌아가기" + 다운로드 + 재생성 + 공유 버튼
    </layout>

    <infographic_viewer>
      - 생성된 인포그래픽 이미지 (Nano Banana Pro 생성)
      - 이미지 중앙 표시, object-fit contain
      - 줌 컨트롤: +/- 버튼, 스크롤 줌
      - 하단 액션 바:
        - "다운로드" (PNG/JPG 선택 가능)
        - "재생성" → 설정 모달 재오픈 (이전 설정 유지)
        - "편집 프롬프트" → 추가 지시사항 입력 후 수정 생성
        - "공유" → 공유 링크 복사
    </infographic_viewer>

    <slide_viewer>
      - 슬라이드 캐러셀 뷰
      - 좌/우 화살표로 슬라이드 이동
      - 하단: 슬라이드 인디케이터 (점 형태)
      - 썸네일 스트립 (하단, 수평 스크롤)
      - 각 슬라이드: Nano Banana Pro로 생성된 이미지
      - 액션: 다운로드 (전체 ZIP / 개별 PNG) + 재생성 + 편집 프롬프트
    </slide_viewer>
  </content_viewer>

  <!-- ===== 8. 설정 페이지 ===== -->
  <settings_page>
    <route>/settings</route>
    <layout>
      - 단순 레이아웃, max-width 640px, mx-auto, padding 32px
    </layout>
    <sections>
      - 프로필: 아바타 + 이름 + 이메일 (읽기 전용, Google에서 가져옴)
      - 사용량: 노트북 수, 소스 수, 생성된 콘텐츠 수 통계
      - 계정: 로그아웃 버튼, 계정 삭제 (확인 모달 포함)
    </sections>
  </settings_page>

  <keyboard_shortcuts_reference>
    - Ctrl/Cmd + K: 글로벌 검색 (노트북, 소스 검색)
    - Ctrl/Cmd + N: 새 노트북 만들기
    - Ctrl/Cmd + Enter: 채팅 메시지 전송
    - Ctrl/Cmd + Shift + S: 스튜디오 패널 토글
    - Ctrl/Cmd + Shift + L: 출처 패널 토글
    - Esc: 모달 닫기 / 뷰어 종료
    - ←/→: 슬라이드 뷰어에서 이전/다음
  </keyboard_shortcuts_reference>
</pages_and_interfaces>

<core_functionality>
  <authentication>
    - Google OAuth 2.0 로그인 (Supabase Auth)
    - 세션 관리: Supabase SSR 미들웨어로 쿠키 기반 세션 유지
    - 보호된 라우트: 미인증 사용자는 /login으로 redirect
    - 콜백 처리: /auth/callback 라우트에서 code ↔ session 교환
    - 자동 사용자 프로필 생성: 첫 로그인 시 user 테이블에 프로필 upsert (trigger 또는 API)
    - 로그아웃: Supabase Auth signOut() + 쿠키 클리어 + /login redirect
  </authentication>

  <notebook_management>
    - 노트북 CRUD:
      - 생성: 제목 입력 모달 (또는 기본 "제목 없는 노트북") + 이모지 선택
      - 읽기: 카드 그리드 (홈) + 상세 3패널 뷰 (노트북 페이지)
      - 수정: 제목 인라인 편집, 이모지 변경
      - 삭제: 확인 모달 → 연관 소스, 채팅, 스튜디오 출력물 모두 CASCADE 삭제
    - 정렬: 최신 활동순 (기본), 제목순, 생성일순
    - 공유: share_token 생성 → 읽기 전용 링크 공유
  </notebook_management>

  <source_management>
    - 소스 추가:
      - 파일 업로드: 드래그&드롭 또는 파일 선택 → Supabase Storage 업로드 → 텍스트 추출 (서버사이드)
      - URL: fetch + HTML→text 변환 (서버사이드)
      - YouTube: URL → transcript 추출 (YouTube API 또는 captions)
      - 복사 텍스트: 직접 입력
    - 텍스트 추출 파이프라인:
      1. 파일 업로드 → processing_status: "pending"
      2. API Route에서 비동기 처리 → "processing"
      3. 텍스트 추출 완료 → extracted_text 저장 + embedding 생성 → "completed"
      4. 실패 시 → "failed" + error_message
    - 소스 최대 300개/노트북
    - 소스 활성/비활성 토글: 채팅 시 참조할 소스 선택
    - 소스 삭제: 개별 삭제 (확인 필요)
    - 소스 순서 변경: 드래그&드롭
  </source_management>

  <ai_chat>
    - 소스 기반 AI 채팅:
      1. 사용자 메시지 + 활성화된 소스의 extracted_text (또는 embedding 기반 관련 청크)
      2. Gemini API (gemini-2.5-flash) 호출 (서버사이드 API Route)
      3. 스트리밍 응답 (ReadableStream)
      4. 인용(citation) 포함: 소스 ID + 텍스트 스니펫
    - 추천 질문: 소스 분석 기반 자동 생성 (노트북 첫 진입 시)
    - 채팅 히스토리: notebook_id별 저장, 스크롤 페이지네이션
    - 메모 저장: AI 응답을 노트로 저장
    - Fast Research 모드: 여러 소스를 교차 분석하는 심층 리서치 응답
  </ai_chat>

  <infographic_generation>
    CRITICAL: 메인 기능 - Nano Banana Pro API를 활용한 인포그래픽 생성

    워크플로우:
    1. 스튜디오 패널 → "인포그래픽" 클릭 → 맞춤설정 모달 오픈
    2. 설정: 언어 / 방향(가로|세로|정사각형) / 세부정보 수준 / 프롬프트 입력
    3. "생성" 클릭 → API Route 호출:
       a. 활성화된 소스의 핵심 내용 추출 (Gemini 요약)
       b. 소스 내용 + 사용자 프롬프트 + 설정 조합하여 Nano Banana Pro 프롬프트 생성
       c. Nano Banana Pro API 호출 (gemini-3-pro-image-preview):
          - aspectRatio: 방향에 따라 "16:9" (가로) / "9:16" (세로) / "1:1" (정사각형)
          - responseModalities: ["IMAGE"]
          - 프롬프트: "Create a professional infographic about [topic]. Include: [key data points]. Style: [user prompt]. Language: [language]. Detail level: [level]."
       d. 생성된 이미지 → base64 디코딩 → Supabase Storage 업로드
       e. studio_output 레코드 생성 (image_urls, settings 저장)
    4. 생성 완료 → 스튜디오 패널 목록에 표시 + 뷰어 오픈

    편집/재생성:
    - "편집 프롬프트": 기존 이미지 + 추가 지시사항 → Nano Banana Pro 이미지 편집 API
    - "재생성": 동일 설정으로 새 이미지 생성
    - 다운로드: PNG/JPG 형식
  </infographic_generation>

  <slide_generation>
    CRITICAL: 메인 기능 - Nano Banana Pro API를 활용한 슬라이드 생성

    워크플로우:
    1. 스튜디오 패널 → "슬라이드 자료" 클릭 → 맞춤설정 모달 오픈
    2. 설정: 형식(자세한 자료|발표자 슬라이드) / 언어 / 깊이(짧게|기본값) / 프롬프트 입력
    3. "생성" 클릭 → API Route 호출:
       a. 소스 내용 분석 → Gemini로 슬라이드 구조(아웃라인) 생성:
          - 자세한 자료: 6-12장, 텍스트 중심, 세부 설명 포함
          - 발표자 슬라이드: 4-8장, 비주얼 중심, 핵심 키워드
       b. 각 슬라이드별 Nano Banana Pro API 호출:
          - aspectRatio: "16:9"
          - 슬라이드별 프롬프트: "Create slide [N] of [total] for a presentation about [topic]. Title: [slide_title]. Content: [key_points]. Style: professional presentation slide. Language: [language]."
       c. 생성된 이미지들 → Supabase Storage 업로드
       d. studio_output 레코드 생성 (image_urls 배열, content에 슬라이드 구조 JSON)
    4. 생성 완료 → 캐러셀 뷰어 오픈

    편집/재생성:
    - 개별 슬라이드 재생성: 특정 슬라이드만 프롬프트 수정 후 재생성
    - 전체 재생성: 아웃라인부터 다시 생성
    - 다운로드: 개별 PNG 또는 전체 ZIP
  </slide_generation>

  <other_studio_outputs>
    MVP 이후 확장 가능한 스튜디오 기능들 (초기에는 인포그래픽/슬라이드만 완전 구현):

    - 보고서: Gemini로 소스 기반 구조화된 보고서 생성 (Markdown)
    - 마인드맵: 소스 키워드/주제 기반 마인드맵 JSON 생성 → 프론트엔드 렌더링
    - 플래시카드: 소스 기반 Q&A 카드 생성
    - 퀴즈: 소스 기반 객관식 문제 생성
    - 데이터 표: 소스에서 구조화된 데이터 추출 → 테이블 형태

    CRITICAL: MVP 단계에서는 인포그래픽과 슬라이드가 완전 구현 대상. 나머지는 UI 타일은 표시하되, 클릭 시 "곧 출시 예정" 토스트 메시지를 표시합니다.
  </other_studio_outputs>

  <data_persistence>
    - 모든 데이터는 Supabase PostgreSQL에 저장
    - 파일은 Supabase Storage에 저장 (sources 버킷)
    - 생성된 이미지는 Supabase Storage에 저장 (outputs 버킷)
    - RLS 정책으로 사용자별 데이터 격리
    - Soft delete 없음 - 삭제 시 물리 삭제 (CASCADE)
  </data_persistence>
</core_functionality>

<aesthetic_guidelines>
  <design_fusion>
    Google NotebookLM의 클린하고 모던한 디자인 언어를 기반으로, 보라색(#6D28D9) 브랜드 컬러를 활용한 전문적이면서도 친근한 인터페이스. 넉넉한 여백, 라운드된 모서리, 부드러운 파스텔 배경색을 활용하여 정보 밀도가 높으면서도 시각적 피로가 적은 디자인을 추구합니다.
  </design_fusion>

  <color_palette>
    <primary_colors>
      - Brand Primary: #6D28D9 - 메인 CTA 버튼, 활성 탭, 포커스 링
      - Brand Primary Hover: #5B21B6 - 버튼 hover
      - Brand Primary Light: #EDE9FE - 사용자 채팅 버블, 선택된 아이템 배경
      - Brand Primary Faint: #FAF5FF - hover 배경, 강조 영역
    </primary_colors>

    <background_colors>
      - Page Background: #FFFFFF - 메인 배경
      - Secondary Background: #F9FAFB - 모달 내부, 빈 영역
      - Card Mint: #F0FDF4 - 노트북 카드 배경 (민트)
      - Card Amber: #FEF3C7 - 노트북 카드 배경 (앰버)
      - Card Lavender: #EDE9FE - 노트북 카드 배경 (라벤더)
      - Card Sky: #DBEAFE - 스튜디오 타일 배경 (스카이)
      - Card Emerald: #DCFCE7 - 스튜디오 타일 배경 (에메랄드)
      - Card Rose: #F3E8FF - 스튜디오 타일 배경 (로즈)
    </background_colors>

    <text_colors>
      - Text Primary: #1F2937 - 제목, 본문
      - Text Secondary: #374151 - AI 응답 본문
      - Text Tertiary: #6B7280 - 부가 설명, 메타 정보
      - Text Muted: #9CA3AF - placeholder, 날짜, 카운터
      - Text Link: #6D28D9 - 인용 링크, 인터랙티브 텍스트
    </text_colors>

    <status_colors>
      - Success: #059669 - 완료, 활성 체크
      - Warning: #D97706 - 경고, 주의
      - Error: #DC2626 - 에러, 실패
      - Info: #2563EB - 정보, 안내
      - Processing: #6D28D9 - 생성 중 프로그레스
    </status_colors>

    <border_colors>
      - Border Default: #E5E7EB - 일반 보더
      - Border Hover: #9CA3AF - hover 시 보더
      - Border Focus: #6D28D9 - focus 시 보더
      - Border Dashed: #D1D5DB - dashed 보더 (추가 버튼, 드롭존)
    </border_colors>
  </color_palette>

  <typography>
    <font_families>
      - Primary: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
      - Mono: "JetBrains Mono", "Fira Code", monospace (코드 블록용)
    </font_families>

    <font_sizes>
      - Display: 22px / weight 700 / 노트북 요약 제목
      - Heading 1: 20px / weight 600 / 페이지 헤더 ("최근 노트북")
      - Heading 2: 18px / weight 600 / 빈 상태 제목
      - Heading 3: 16px / weight 600 / 모달 헤더
      - Body Large: 15px / weight 400 / 노트북 제목 (헤더)
      - Body: 14px / weight 400 / 일반 본문, AI 응답
      - Body Small: 13px / weight 400-500 / 소스 아이템, 라벨, 버튼 텍스트
      - Caption: 12px / weight 400 / 날짜, 카운터, 메타 정보
      - Micro: 11px / weight 400 / 배지 텍스트
    </font_sizes>

    <line_heights>
      - Tight: 1.25 (제목)
      - Normal: 1.5 (본문)
      - Relaxed: 1.6 (AI 응답)
      - Loose: 1.75 (긴 텍스트 단락)
    </line_heights>
  </typography>

  <spacing>
    - Base unit: 4px
    - Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
    - 패널 내부 padding: 16px
    - 카드 padding: 16px
    - 모달 padding: 24px (모바일) / 32px (데스크톱)
    - 섹션 간 gap: 24px
    - 아이템 간 gap: 8-12px
    - 버튼 내부: px 16px, py 8px (기본) / px 24px, py 10px (대형)
  </spacing>

  <borders_and_shadows>
    <borders>
      - Default: 1px solid #E5E7EB
      - Focus Ring: 2px solid #6D28D9, offset 2px, with 4px #6D28D9/20% shadow
      - Dashed: 2px dashed #D1D5DB
      - Radius Small: 6px (버튼, 입력, 배지)
      - Radius Medium: 8px (카드, 드롭다운)
      - Radius Large: 12px (노트북 카드)
      - Radius XL: 16px (모달)
      - Radius Full: 9999px (아바타, 원형 버튼)
    </borders>
    <shadows>
      - Card: 0 1px 3px rgba(0,0,0,0.1)
      - Card Hover: 0 4px 12px rgba(0,0,0,0.1)
      - Dropdown: 0 4px 16px rgba(0,0,0,0.12)
      - Modal: 0 8px 32px rgba(0,0,0,0.16)
      - Toast: 0 4px 12px rgba(0,0,0,0.15)
    </shadows>
  </borders_and_shadows>

  <component_styling>
    <buttons>
      - Primary: bg #6D28D9, text white, rounded-lg, font-weight 500
        - hover: bg #5B21B6
        - active: bg #4C1D95
        - disabled: bg #E5E7EB, text #9CA3AF
      - Secondary: bg transparent, border 1px solid #E5E7EB, text #374151, rounded-lg
        - hover: bg #F9FAFB, border-color #9CA3AF
      - Ghost: bg transparent, text #6B7280
        - hover: bg #F9FAFB
      - Danger: bg #DC2626, text white
        - hover: bg #B91C1C
    </buttons>
    <inputs>
      - height: 36-44px, rounded-lg, border 1px solid #E5E7EB, padding 8px 12px
      - focus: border-color #6D28D9, ring 2px #6D28D9/20%
      - error: border-color #DC2626
      - placeholder: color #9CA3AF
    </inputs>
    <cards>
      - bg: white (또는 파스텔 배경색), rounded-xl, border 1px solid #E5E7EB (선택적)
      - hover: shadow-md, translateY(-2px)
      - transition: all 200ms ease
    </cards>
    <modals>
      - bg: white, rounded-2xl, shadow-2xl
      - overlay: bg rgba(0,0,0,0.4), backdrop-blur 4px
      - 진입: scale(0.95)→1, opacity 0→1, 200ms ease-out
      - 퇴장: scale(1)→0.95, opacity 1→0, 150ms ease-in
    </modals>
    <badges>
      - height: 20px, rounded-full, px 8px, font-size 11px, font-weight 500
      - 색상: 각 상태별 배경/텍스트 색상 조합
    </badges>
    <toggle_buttons>
      - 그룹: inline-flex, border 1px solid #E5E7EB, rounded-lg, overflow hidden
      - 비선택: bg transparent, text #6B7280
      - 선택: bg #F3F4F6, border 1px solid #374151, text #1F2937, font-weight 500
    </toggle_buttons>
  </component_styling>

  <animations>
    <micro_interactions>
      - 버튼 hover: background-color 150ms ease
      - 카드 hover: transform + shadow 200ms ease
      - 체크박스 토글: scale(0.95) → scale(1), 150ms ease
      - 아이콘 버튼 hover: opacity 0→1, 150ms
    </micro_interactions>
    <page_transitions>
      - 페이지 간 이동: opacity fade 200ms
      - 패널 collapse/expand: width 250ms ease-in-out
    </page_transitions>
    <loading_states>
      - AI 응답 스트리밍: cursor blink 530ms ease-in-out infinite
      - 소스 처리 중: spinner rotate 1s linear infinite (16px)
      - 인포그래픽/슬라이드 생성: progress bar indeterminate shimmer 2s ease-in-out infinite
      - 스켈레톤 로딩: shimmer gradient animation 1.5s ease infinite
    </loading_states>
    <modal_transitions>
      - 진입: scale(0.95) + opacity(0) → scale(1) + opacity(1), 200ms ease-out
      - 퇴장: scale(1) + opacity(1) → scale(0.95) + opacity(0), 150ms ease-in
      - 오버레이: opacity(0) → opacity(1), 200ms
    </modal_transitions>
  </animations>

  <icons>
    - Library: lucide-react
    - Default size: 20px (UI 아이콘), 16px (인라인 아이콘), 28px (로고)
    - Stroke width: 1.5px (기본), 2px (강조)
    - Color: inherit (텍스트 컬러 따름)
    - 이모지: 노트북 아이콘용 (시스템 기본 이모지)
  </icons>

  <accessibility>
    - WCAG 2.1 AA 준수 대상
    - 최소 명암비: 4.5:1 (일반 텍스트), 3:1 (대형 텍스트, UI 컴포넌트)
    - 포커스 표시: 모든 인터랙티브 요소에 visible focus ring
    - 키보드 탐색: Tab 순서 보장, Enter/Space로 활성화
    - aria-label: 아이콘 전용 버튼에 필수 적용
    - 스크린 리더: AI 응답 업데이트 시 aria-live="polite"
    - 모션 감소: prefers-reduced-motion 미디어 쿼리 대응
  </accessibility>
</aesthetic_guidelines>

<advanced_functionality>
  <ai_prompt_engineering>
    인포그래픽 생성 프롬프트 템플릿:
    ```
    Create a professional {detail_level} infographic in {language}.
    Topic: {extracted_topic_from_sources}
    Key data points:
    {bullet_points_from_sources}

    Layout: {orientation} orientation
    Style instructions: {user_prompt}

    Requirements:
    - All text must be in {language}
    - Use clean, modern design with clear visual hierarchy
    - Include relevant icons and data visualizations
    - Ensure all text is legible and properly rendered
    ```

    슬라이드 생성 프롬프트 템플릿:
    ```
    Create slide {n} of {total} for a {format_type} presentation.
    Language: {language}
    Overall topic: {topic}

    This slide:
    - Title: {slide_title}
    - Key points: {slide_content}

    Style: Professional presentation slide with {depth} detail level.
    Additional instructions: {user_prompt}

    Requirements:
    - 16:9 aspect ratio
    - All text in {language}
    - Consistent visual style across all slides
    - Clear, readable typography
    ```
  </ai_prompt_engineering>

  <source_processing_pipeline>
    서버사이드 소스 처리 파이프라인 (API Route + background job):

    1. PDF 처리:
       - pdf-parse로 텍스트 추출
       - 페이지 수, 메타데이터 추출
       - 대용량 PDF: 청크 분할 (max 50,000 characters per chunk)

    2. URL 처리:
       - Server-side fetch + HTML 파싱
       - 주요 콘텐츠 추출 (메타 태그, <article>, <main>)
       - 이미지, 스크립트 제거

    3. YouTube 처리:
       - YouTube Data API v3로 자막/트랜스크립트 추출
       - 자막 없는 영상: 오류 메시지 표시
       - 메타데이터: 제목, 설명, 길이

    4. 텍스트 처리:
       - 직접 저장 (최소 처리)
       - 최대 500,000 characters

    5. 공통 후처리:
       - Gemini로 요약 생성 (summary 필드)
       - 임베딩 생성 (embedding 필드, text-embedding-004 모델)
       - processing_status 업데이트
  </source_processing_pipeline>

  <notebook_sharing>
    - "공유" 버튼 클릭 → share_token 생성 (crypto.randomUUID())
    - 공유 URL: /shared/[share_token]
    - 공유 페이지: 읽기 전용 3패널 뷰 (채팅 비활성, 소스/스튜디오 출력물만 조회)
    - 공유 취소: share_token = null, is_shared = false
  </notebook_sharing>

  <error_handling>
    - AI API 실패: 재시도 (최대 3회, exponential backoff) + 사용자 에러 메시지
    - 파일 업로드 실패: 토스트 알림 + 재시도 버튼
    - 인포그래픽/슬라이드 생성 실패: generation_status = "failed", error_message 표시, 재생성 옵션
    - 네트워크 오류: 오프라인 감지 → 배너 알림
    - Rate limiting: 429 응답 시 대기 시간 표시
  </error_handling>

  <performance_optimization>
    - 소스 임베딩 기반 관련 청크 검색 (RAG): 전체 소스 텍스트 대신 관련 부분만 AI에 전달
    - 이미지 최적화: Next.js Image 컴포넌트로 Supabase Storage 이미지 최적화 서빙
    - 채팅 히스토리: 커서 기반 페이지네이션 (최신 50개씩)
    - 노트북 목록: 무한 스크롤 (페이지당 20개)
    - 스튜디오 이미지: lazy loading + blur placeholder
  </performance_optimization>
</advanced_functionality>

<final_integration_test>
  <test_scenario_1>
    <description>신규 사용자 온보딩 및 첫 노트북 생성</description>
    <steps>
      1. /login 페이지 접속 → "Google로 계속하기" 버튼 표시 확인
      2. Google 로그인 완료 → 홈(/)으로 redirect 확인
      3. 사용자 아바타와 이름이 네비게이션에 표시 확인
      4. 빈 상태 메시지 표시 확인 ("노트북을 만들어 시작하세요")
      5. "새 노트북 만들기" 버튼 클릭 → 노트북 생성 확인
      6. 노트북 상세 페이지 (/notebook/[id])로 이동 확인
      7. 3패널 레이아웃 표시 확인 (출처 / 채팅 / 스튜디오)
      8. 출처 패널 빈 상태 확인 ("소스를 추가하여 시작하세요")
    </steps>
  </test_scenario_1>

  <test_scenario_2>
    <description>소스 추가 및 AI 채팅</description>
    <steps>
      1. "+ 소스 추가" 클릭 → 소스 추가 모달 오픈 확인
      2. PDF 파일 드래그&드롭 → 업로드 진행 확인
      3. 소스 목록에 processing 상태 (스피너) 표시 확인
      4. 처리 완료 → completed 상태 (✓ 체크) 표시 확인
      5. "복사된 텍스트" 버튼 → 텍스트 입력 → 소스 추가 확인
      6. 채팅 패널에 AI 요약 카드 표시 확인
      7. 추천 질문 클릭 → AI 응답 스트리밍 확인
      8. AI 응답에 인용([1]) 표시 확인
      9. 인용 클릭 → 소스 패널에서 해당 소스 하이라이트 확인
      10. "메모에 저장" 클릭 → 저장 확인 토스트
    </steps>
  </test_scenario_2>

  <test_scenario_3>
    <description>인포그래픽 생성 전체 플로우</description>
    <steps>
      1. 노트북에 소스 2개 이상 추가된 상태 확인
      2. 스튜디오 패널 → "인포그래픽" 타일 클릭
      3. 인포그래픽 맞춤설정 모달 오픈 확인
      4. 언어: 한국어 / 방향: 가로 / 세부정보: 표준 선택
      5. 프롬프트 입력: "파란색 테마로 핵심 통계를 강조해 줘"
      6. "생성" 클릭 → 모달 닫힘, 스튜디오 목록에 "생성 중..." 표시
      7. 생성 완료 → 스튜디오 목록에 인포그래픽 아이템 표시
      8. 아이템 클릭 → 인포그래픽 뷰어 오픈 확인
      9. 인포그래픽 이미지에 한국어 텍스트 포함 확인
      10. "다운로드" 클릭 → PNG 파일 다운로드 확인
      11. "편집 프롬프트" 클릭 → 추가 지시사항 입력 → 수정된 이미지 생성 확인
    </steps>
  </test_scenario_3>

  <test_scenario_4>
    <description>슬라이드 생성 및 캐러셀 뷰</description>
    <steps>
      1. 스튜디오 패널 → "슬라이드 자료" 타일 클릭
      2. 슬라이드 맞춤설정 모달 오픈 확인
      3. 형식: "발표자 슬라이드" 선택, 깊이: "기본값"
      4. 프롬프트 입력 후 "생성" 클릭
      5. 생성 완료 → 슬라이드 뷰어 오픈
      6. 캐러셀에서 좌/우 화살표로 슬라이드 탐색 확인
      7. 하단 썸네일 스트립 표시 확인
      8. 각 슬라이드에 일관된 디자인 스타일 확인
      9. "전체 다운로드" → ZIP 파일 다운로드 확인
      10. 개별 슬라이드 재생성 기능 동작 확인
    </steps>
  </test_scenario_4>

  <test_scenario_5>
    <description>패널 리사이즈 및 키보드 단축키</description>
    <steps>
      1. 출처-채팅 패널 구분선 드래그 → 출처 패널 리사이즈 확인
      2. 채팅-스튜디오 패널 구분선 드래그 → 스튜디오 패널 리사이즈 확인
      3. Ctrl+Shift+L → 출처 패널 collapse/expand 확인
      4. Ctrl+Shift+S → 스튜디오 패널 collapse/expand 확인
      5. 채팅 입력에서 Enter → 메시지 전송 확인
      6. 채팅 입력에서 Shift+Enter → 줄바꿈 확인
      7. Ctrl+K → 글로벌 검색 오픈 확인
      8. 슬라이드 뷰어에서 ←/→ → 이전/다음 슬라이드 확인
      9. Esc → 모달/뷰어 닫기 확인
    </steps>
  </test_scenario_5>

  <test_scenario_6>
    <description>노트북 공유 및 접근 제어</description>
    <steps>
      1. 노트북 상단 "공유" 버튼 클릭
      2. 공유 링크 생성 확인 (/shared/[token])
      3. 로그아웃 상태에서 공유 링크 접속
      4. 읽기 전용 3패널 뷰 표시 확인
      5. 채팅 입력 비활성화 확인
      6. 소스 목록 조회 가능 확인
      7. 스튜디오 생성 콘텐츠 조회 가능 확인
      8. 원본 소유자 계정에서 공유 취소
      9. 공유 링크 재접속 → 404 또는 접근 거부 확인
    </steps>
  </test_scenario_6>

  <test_scenario_7>
    <description>에러 핸들링 및 엣지 케이스</description>
    <steps>
      1. 10MB 초과 파일 업로드 시도 → 에러 메시지 확인
      2. 잘못된 URL 소스 추가 → 처리 실패 표시 확인
      3. 소스 0개 상태에서 인포그래픽 생성 시도 → disabled 상태 확인
      4. 인포그래픽 생성 중 네트워크 오류 → "failed" 상태 + 재생성 옵션 확인
      5. 자막 없는 YouTube URL 추가 → 에러 메시지 확인
      6. 300개 소스 도달 시 추가 불가 메시지 확인
      7. 다른 사용자의 노트북 URL 직접 접근 → 403 확인
      8. 로그인 세션 만료 → /login redirect 확인
    </steps>
  </test_scenario_7>
</final_integration_test>

<success_criteria>
  <functionality>
    - Google OAuth 로그인/로그아웃이 정상 동작한다
    - PDF, URL, YouTube, 텍스트 소스 추가 및 텍스트 추출이 정상 동작한다
    - 소스 기반 AI 채팅이 스트리밍으로 동작하며 인용이 정확히 표시된다
    - Nano Banana Pro로 인포그래픽을 3가지 방향(가로/세로/정사각형) × 3가지 세부 수준으로 생성할 수 있다
    - Nano Banana Pro로 슬라이드를 2가지 형식(자세한 자료/발표자) × 2가지 깊이로 생성할 수 있다
    - 생성된 인포그래픽/슬라이드를 편집 프롬프트로 수정 재생성할 수 있다
    - 생성된 콘텐츠를 PNG/JPG/ZIP으로 다운로드할 수 있다
    - 노트북 공유 링크가 읽기 전용으로 정상 동작한다
    - RLS 정책이 사용자별 데이터를 완전히 격리한다
  </functionality>

  <user_experience>
    - 홈 페이지 초기 로드: 1.5초 이내 (LCP)
    - 노트북 상세 페이지 진입: 2초 이내
    - AI 채팅 첫 토큰 응답: 1초 이내 (TTFB)
    - 인포그래픽 생성: 15초 이내
    - 슬라이드 생성 (5장): 60초 이내
    - 소스 추가 → 처리 완료: PDF 10MB 기준 30초 이내
    - 패널 리사이즈: 지연 없이 부드럽게 동작 (60fps)
    - 모달 열기/닫기 애니메이션: 200ms 이내
  </user_experience>

  <technical_quality>
    - TypeScript strict mode, 빌드 에러 0개
    - Supabase RLS 정책 100% 적용 (모든 테이블)
    - API Route에서 모든 AI API 호출 (클라이언트 직접 호출 0건)
    - 환경 변수로 모든 시크릿 관리 (하드코딩 0건)
    - 에러 바운더리: 모든 주요 컴포넌트에 적용
    - Lighthouse Performance 점수: 90+
  </technical_quality>

  <visual_design>
    - 디자인 시스템 일관성: 정의된 컬러 팔레트, 타이포그래피, 스페이싱만 사용
    - 반응형: 최소 1024px 데스크톱 지원 (모바일은 MVP 이후)
    - 접근성: WCAG 2.1 AA 명암비 준수
    - 모든 모달에 애니메이션 적용
    - 로딩 상태: 모든 비동기 작업에 시각적 피드백 제공
  </visual_design>

  <build>
    - npm run build 성공
    - Vercel 배포 가능
    - 환경 변수 4개만으로 동작: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY
  </build>
</success_criteria>

<build_output>
  <build_command>npm run build</build_command>
  <output_directory>.next/</output_directory>
  <deployment>
    - Vercel (recommended): vercel CLI 또는 GitHub 연동 자동 배포
    - 대안: Docker 컨테이너 (Node.js 20 base image)
    - Supabase: 클라우드 인스턴스 (supabase.com)
  </deployment>
  <environment_variables>
    NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
    SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
    GEMINI_API_KEY=[google-ai-studio-api-key]
  </environment_variables>
</build_output>

<key_implementation_notes>
  <critical_paths>
    1. Supabase Auth + Google OAuth 연동: 인증이 모든 기능의 기반
    2. 소스 텍스트 추출 파이프라인: AI 기능의 품질을 결정
    3. Nano Banana Pro API 통합: 프롬프트 엔지니어링이 결과물 품질을 결정
    4. RLS 정책: 보안의 핵심, 초기부터 설정 필수
  </critical_paths>

  <recommended_implementation_order>
    Phase 1: 기반 설정 (1-2일)
    1. Next.js 프로젝트 초기화 (App Router, TypeScript, Tailwind, shadcn/ui)
    2. Supabase 프로젝트 설정 (DB 스키마, RLS 정책, Storage 버킷)
    3. Supabase Auth + Google OAuth 설정 + 미들웨어
    4. 로그인/콜백 페이지 구현
    5. 글로벌 레이아웃 (네비게이션, 사용자 메뉴)

    Phase 2: 노트북 & 소스 (2-3일)
    6. 홈 페이지 (노트북 그리드/리스트 뷰, CRUD)
    7. 노트북 상세 페이지 (3패널 리사이저블 레이아웃)
    8. 출처 패널 UI (소스 목록, 체크박스, 드래그&드롭)
    9. 소스 추가 모달 (파일 업로드, URL, 텍스트 입력)
    10. 소스 처리 API Route (PDF 텍스트 추출, URL 크롤링)

    Phase 3: AI 채팅 (2일)
    11. Gemini API 연동 (API Route, 스트리밍)
    12. 채팅 패널 UI (메시지 목록, 스트리밍 표시, 인용)
    13. 추천 질문 생성
    14. 채팅 히스토리 저장 및 로드

    Phase 4: 인포그래픽 & 슬라이드 - 메인 기능 (3-4일)
    15. 스튜디오 패널 UI (타일 그리드, 생성 콘텐츠 목록)
    16. 인포그래픽 맞춤설정 모달 UI
    17. Nano Banana Pro API 연동 (인포그래픽 생성 API Route)
    18. 인포그래픽 뷰어 (이미지 표시, 줌, 다운로드)
    19. 슬라이드 맞춤설정 모달 UI
    20. 슬라이드 생성 API Route (아웃라인 생성 → 개별 슬라이드 이미지 생성)
    21. 슬라이드 캐러셀 뷰어 (탐색, 썸네일)
    22. 편집 프롬프트 / 재생성 기능

    Phase 5: 마무리 (1-2일)
    23. 노트북 공유 기능
    24. 설정 페이지
    25. 키보드 단축키
    26. 에러 핸들링 및 빈 상태
    27. 성능 최적화 (이미지 최적화, 페이지네이션)
    28. Vercel 배포 설정
  </recommended_implementation_order>

  <database_schema>
    ```sql
    -- Enable extensions
    CREATE EXTENSION IF NOT EXISTS "pgvector";
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Users table (synced from Supabase Auth)
    CREATE TABLE public.users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Notebooks
    CREATE TABLE public.notebooks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT '제목 없는 노트북',
      emoji TEXT DEFAULT '📓',
      description TEXT,
      is_shared BOOLEAN DEFAULT false,
      share_token TEXT UNIQUE,
      source_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX idx_notebooks_user_created ON public.notebooks(user_id, created_at DESC);
    CREATE INDEX idx_notebooks_share_token ON public.notebooks(share_token) WHERE share_token IS NOT NULL;

    -- Sources
    CREATE TYPE source_type AS ENUM ('pdf', 'text', 'url', 'youtube', 'google_doc', 'google_slide', 'google_sheet', 'image', 'audio');
    CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');

    CREATE TABLE public.sources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      type source_type NOT NULL,
      title TEXT NOT NULL,
      original_url TEXT,
      file_path TEXT,
      file_size INTEGER,
      mime_type TEXT,
      extracted_text TEXT,
      summary TEXT,
      embedding vector(1536),
      metadata JSONB DEFAULT '{}',
      sort_order INTEGER DEFAULT 0,
      is_enabled BOOLEAN DEFAULT true,
      processing_status processing_status DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX idx_sources_notebook_order ON public.sources(notebook_id, sort_order);
    CREATE INDEX idx_sources_notebook_enabled ON public.sources(notebook_id, is_enabled);
    CREATE INDEX idx_sources_embedding ON public.sources USING ivfflat (embedding vector_cosine_ops);

    -- Chat Messages
    CREATE TABLE public.chat_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      citations JSONB DEFAULT '[]',
      model TEXT,
      tokens_used INTEGER,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX idx_chat_notebook_created ON public.chat_messages(notebook_id, created_at ASC);

    -- Studio Outputs
    CREATE TYPE studio_output_type AS ENUM ('audio_overview', 'video_overview', 'mind_map', 'report', 'flashcard', 'quiz', 'infographic', 'slide_deck', 'data_table');
    CREATE TYPE generation_status AS ENUM ('pending', 'generating', 'completed', 'failed');

    CREATE TABLE public.studio_outputs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      type studio_output_type NOT NULL,
      title TEXT NOT NULL,
      content JSONB DEFAULT '{}',
      image_urls TEXT[] DEFAULT '{}',
      settings JSONB DEFAULT '{}',
      generation_status generation_status DEFAULT 'pending',
      error_message TEXT,
      source_ids UUID[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX idx_studio_notebook_type ON public.studio_outputs(notebook_id, type, created_at DESC);

    -- Notes
    CREATE TABLE public.notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      pinned BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX idx_notes_notebook ON public.notes(notebook_id, pinned DESC, created_at DESC);

    -- RLS Policies
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.studio_outputs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

    -- Users: own profile only
    CREATE POLICY users_select ON public.users FOR SELECT USING (auth.uid() = id);
    CREATE POLICY users_update ON public.users FOR UPDATE USING (auth.uid() = id);

    -- Notebooks: own notebooks + shared notebooks
    CREATE POLICY notebooks_select ON public.notebooks FOR SELECT USING (
      user_id = auth.uid() OR (is_shared = true AND share_token IS NOT NULL)
    );
    CREATE POLICY notebooks_insert ON public.notebooks FOR INSERT WITH CHECK (user_id = auth.uid());
    CREATE POLICY notebooks_update ON public.notebooks FOR UPDATE USING (user_id = auth.uid());
    CREATE POLICY notebooks_delete ON public.notebooks FOR DELETE USING (user_id = auth.uid());

    -- Sources: own sources only (shared access via notebook policy)
    CREATE POLICY sources_select ON public.sources FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY sources_insert ON public.sources FOR INSERT WITH CHECK (user_id = auth.uid());
    CREATE POLICY sources_update ON public.sources FOR UPDATE USING (user_id = auth.uid());
    CREATE POLICY sources_delete ON public.sources FOR DELETE USING (user_id = auth.uid());

    -- Chat Messages: own messages
    CREATE POLICY chat_select ON public.chat_messages FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY chat_insert ON public.chat_messages FOR INSERT WITH CHECK (user_id = auth.uid());

    -- Studio Outputs: own outputs
    CREATE POLICY studio_select ON public.studio_outputs FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY studio_insert ON public.studio_outputs FOR INSERT WITH CHECK (user_id = auth.uid());
    CREATE POLICY studio_update ON public.studio_outputs FOR UPDATE USING (user_id = auth.uid());
    CREATE POLICY studio_delete ON public.studio_outputs FOR DELETE USING (user_id = auth.uid());

    -- Notes: own notes
    CREATE POLICY notes_select ON public.notes FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY notes_insert ON public.notes FOR INSERT WITH CHECK (user_id = auth.uid());
    CREATE POLICY notes_update ON public.notes FOR UPDATE USING (user_id = auth.uid());
    CREATE POLICY notes_delete ON public.notes FOR DELETE USING (user_id = auth.uid());

    -- Trigger: auto-update updated_at
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER notebooks_updated_at BEFORE UPDATE ON public.notebooks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    CREATE TRIGGER sources_updated_at BEFORE UPDATE ON public.sources FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    CREATE TRIGGER studio_outputs_updated_at BEFORE UPDATE ON public.studio_outputs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    CREATE TRIGGER notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    -- Trigger: auto-create user profile on auth signup
    CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.users (id, email, display_name, avatar_url)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();

    -- Trigger: update source_count on notebooks
    CREATE OR REPLACE FUNCTION update_source_count()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        UPDATE public.notebooks SET source_count = source_count + 1 WHERE id = NEW.notebook_id;
      ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.notebooks SET source_count = source_count - 1 WHERE id = OLD.notebook_id;
      END IF;
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER sources_count_trigger
      AFTER INSERT OR DELETE ON public.sources
      FOR EACH ROW EXECUTE FUNCTION update_source_count();
    ```
  </database_schema>

  <performance_considerations>
    - Nano Banana Pro API 호출은 비용이 높으므로, 슬라이드 생성 시 병렬 호출 대신 순차 호출 (rate limit 고려)
    - 소스 텍스트 추출은 무거운 작업이므로 API Route에서 비동기 처리 + 상태 폴링
    - pgvector 인덱스: ivfflat 타입, probes=10으로 설정하여 검색 속도와 정확도 균형
    - 이미지 저장: Supabase Storage + CDN 캐싱 활용
    - AI 응답 스트리밍: Edge Runtime + ReadableStream으로 TTFB 최소화
    - 대형 노트북 (소스 100개+): 가상화 리스트 또는 페이지네이션 적용
  </performance_considerations>

  <testing_strategy>
    - Unit: 유틸리티 함수, 프롬프트 빌더 함수 (Vitest)
    - Integration: API Route 테스트 (Supabase mock)
    - E2E: 핵심 플로우 (Playwright) - 로그인, 소스 추가, 채팅, 인포그래픽 생성
    - Visual: Storybook으로 주요 컴포넌트 카탈로그
  </testing_strategy>

  <project_structure>
    ```
    kakaobook/
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── auth/callback/route.ts
    │   ├── (main)/
    │   │   ├── layout.tsx              # 메인 레이아웃 (네비게이션)
    │   │   ├── page.tsx                # 홈 (노트북 목록)
    │   │   ├── notebook/[id]/page.tsx  # 노트북 상세 (3패널)
    │   │   └── settings/page.tsx       # 설정
    │   ├── shared/[token]/page.tsx     # 공유 노트북
    │   ├── api/
    │   │   ├── chat/route.ts           # AI 채팅 (스트리밍)
    │   │   ├── sources/
    │   │   │   ├── process/route.ts    # 소스 텍스트 추출
    │   │   │   └── upload/route.ts     # 파일 업로드
    │   │   └── studio/
    │   │       ├── infographic/route.ts  # 인포그래픽 생성
    │   │       └── slides/route.ts       # 슬라이드 생성
    │   ├── layout.tsx                  # 루트 레이아웃
    │   └── globals.css
    ├── components/
    │   ├── ui/                         # shadcn/ui 컴포넌트
    │   ├── auth/                       # 로그인 관련
    │   ├── notebook/                   # 노트북 카드, 그리드
    │   ├── sources/                    # 소스 패널, 모달
    │   ├── chat/                       # 채팅 패널, 메시지
    │   ├── studio/                     # 스튜디오 패널, 타일, 모달, 뷰어
    │   └── shared/                     # 공통 (레이아웃, 네비게이션)
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts               # 브라우저 클라이언트
    │   │   ├── server.ts               # 서버 클라이언트
    │   │   ├── middleware.ts            # Auth 미들웨어
    │   │   └── types.ts                # 생성된 DB 타입
    │   ├── ai/
    │   │   ├── gemini.ts               # Gemini API 유틸
    │   │   ├── nano-banana.ts          # Nano Banana Pro API 유틸
    │   │   └── prompts.ts              # 프롬프트 템플릿
    │   └── utils/
    │       ├── source-processor.ts     # 소스 처리 유틸
    │       └── helpers.ts              # 공통 헬퍼
    ├── stores/
    │   ├── notebook-store.ts           # 노트북 상태
    │   └── ui-store.ts                 # UI 상태 (패널 토글 등)
    ├── hooks/
    │   ├── use-notebook.ts
    │   ├── use-sources.ts
    │   ├── use-chat.ts
    │   └── use-studio.ts
    ├── middleware.ts                    # Next.js 미들웨어 (Auth 보호)
    ├── supabase/
    │   └── migrations/                 # DB 마이그레이션 SQL
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── next.config.ts
    ```
  </project_structure>
</key_implementation_notes>

</project_specification>
