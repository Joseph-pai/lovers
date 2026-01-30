# 來了嗎 V2.0

一個專為情侶設計的生理週期追蹤與情緒記錄應用程式。

## 功能特色

- 📅 **週期追蹤**：記錄生理週期、症狀和情緒
- 💭 **情緒紀錄**：每日情緒和健康狀態記錄
- 💑 **伴侶共享**：與伴侶分享週期資訊和訊息
- 🤖 **AI 諮詢**：智能健康諮詢服務
- 💝 **傾心吐意**：伴侶間的私密訊息交流
- 📊 **訂閱管理**：高級功能訂閱服務

## 技術架構

- **前端框架**：React 19 + Vite 7
- **樣式方案**：Tailwind CSS 4
- **動畫效果**：Framer Motion
- **後端服務**：Supabase
- **身份驗證**：Firebase Authentication
- **圖標庫**：Lucide React

## 本地開發

### 環境要求

- Node.js 18 或更高版本
- npm 或 yarn

### 安裝步驟

1. 克隆專案
```bash
git clone <your-repository-url>
cd lover-v2
```

2. 安裝依賴
```bash
npm install
```

3. 配置環境變數

複製 `.env.example` 為 `.env` 並填入實際的配置值：

```bash
cp .env.example .env
```

編輯 `.env` 文件，填入以下資訊：

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

4. 啟動開發伺服器
```bash
npm run dev
```

應用程式將在 `http://localhost:5173` 運行。

### 建置生產版本

```bash
npm run build
```

建置完成後，生產文件將位於 `dist/` 目錄。

## Netlify 部署

### 方法一：通過 Netlify UI 部署

1. 將專案推送到 GitHub
2. 登入 [Netlify](https://www.netlify.com/)
3. 點擊 "Add new site" > "Import an existing project"
4. 選擇你的 GitHub 倉庫
5. 配置建置設定（已在 `netlify.toml` 中預設）：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 在 "Environment variables" 中添加所有環境變數
7. 點擊 "Deploy site"

### 方法二：通過 Netlify CLI 部署

```bash
# 安裝 Netlify CLI
npm install -g netlify-cli

# 登入 Netlify
netlify login

# 初始化專案
netlify init

# 部署
netlify deploy --prod
```

### 環境變數設定

在 Netlify 控制台中設定以下環境變數：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 專案結構

```
lover-v2/
├── public/              # 靜態資源
├── src/
│   ├── components/      # 可重用組件
│   ├── context/         # React Context
│   ├── hooks/           # 自定義 Hooks
│   ├── pages/           # 頁面組件
│   ├── services/        # API 服務
│   ├── App.jsx          # 主應用組件
│   ├── main.jsx         # 應用入口
│   └── index.css        # 全局樣式
├── .env.example         # 環境變數範例
├── .gitignore           # Git 忽略文件
├── netlify.toml         # Netlify 配置
├── package.json         # 專案依賴
├── vite.config.js       # Vite 配置
└── README.md            # 專案說明
```

## 授權

Private - All Rights Reserved
