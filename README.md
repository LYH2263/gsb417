# PaperWise AI - 学术论文 AIGC 检测与人性化改写工具

<div align="center">

![PaperWise AI](https://img.shields.io/badge/PaperWise-AI%20Tool-6366f1?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi)

专业的学术论文 AI 内容检测与人性化改写工具，模仿 xyzscience.com 核心功能。

</div>

---

## ✨ 核心特性

- 🔍 **深度 AIGC 检测**：基于 DistilBERT 模型，分段检测 AI 生成概率
- ✍️ **三级人性化改写**：调用 Llama 3.3 引擎，支持轻微/中度/深度改写
- 🔒 **学术术语锁定**：严格保护 LaTeX 公式、引用格式及专业名词
- 📊 **并排对比预览**：直观展示原文与改写文的差异
- 🔄 **自动迭代优化**：改写后自动再检测，循环优化直至达标
- 📁 **多格式支持**：支持 PDF、Word (DOCX)、TXT 文件上传
- 🎯 **额度管理**：每日使用次数实时追踪
- 🛡️ **高可靠降级机制**：当 Groq API 失败或未配置时，自动切换至「模拟改写」兜底，确保服务永不宕机

---

## 🚀 快速开始

### ⚠️ 重要提示

**首次运行时，系统会自动下载 AI 检测模型（约 268MB），请保持网络畅通。**

根据你的网络环境和需求，选择以下两种部署方式之一：

---

## 方式一：本地运行（推荐，速度快）

### 📋 前置要求
- Python 3.9+
- Node.js 18+
- Groq API Key（免费申请：[console.groq.com](https://console.groq.com/)）

### 1️⃣ 后端部署

```bash
# 进入后端目录
cd backend

# 安装 Python 依赖
pip3 install -r requirements.txt

# 安装 AI 模型依赖（首次需要，约 268MB）
pip3 install torch --index-url https://download.pytorch.org/whl/cpu
pip3 install transformers

# 配置 API Key（请替换为你自己的 Groq Key）
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
echo "MODEL_NAME=llama-3.3-70b-versatile" >> .env

# 启动后端服务
python3 app/main.py
```

**首次启动时会自动下载模型文件（约 3-5 分钟），请耐心等待。**

成功启动后会显示：
```
✅ AI 检测模型加载成功: distilbert-base-uncased
INFO:     Uvicorn running on http://0.0.0.0:8417
```

### 2️⃣ 前端部署

打开**新的终端窗口**：

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动前端服务
npm run dev
```

成功后访问：**http://localhost:5417**

---

## 方式二：Docker 部署（适合生产环境）

### ⚠️ Docker 注意事项

由于需要下载 AI 模型（268MB）和 PyTorch（150MB），Docker 首次构建可能需要 **10-20 分钟**。

**如果网络较慢或 Docker 构建超时，强烈建议使用「方式一：本地运行」。**

### 📦 Docker 部署步骤

```bash
# 1. 设置环境变量（请替换为你自己的 Groq Key）
export GROQ_API_KEY=your_groq_api_key_here

# 2. 构建并启动（首次较慢，请耐心等待）
docker-compose up --build

# 3. 访问应用
# 前端: http://localhost:5417
# 后端: http://localhost:8417
```

### 🔧 Docker 优化建议

如果遇到超时问题，可以尝试：

1. **使用国内镜像源**（修改 `backend/Dockerfile`）：
```dockerfile
RUN pip install --index-url https://pypi.tuna.tsinghua.edu.cn/simple torch
```

2. **增加 Docker 超时时间**：
```bash
export DOCKER_CLIENT_TIMEOUT=300
export COMPOSE_HTTP_TIMEOUT=300
docker-compose up --build
```

3. **分步构建**（先构建后端，再启动）：
```bash
cd backend
docker build -t paperwise-backend .
cd ..
docker-compose up
```

---

## 📝 端口说明

为了防止与其他项目冲突，本项目所有端口均以 **417** 结尾：

| 服务 | 端口 | 访问地址 |
|------|------|----------|
| 前端 | 5417 | http://localhost:5417 |
| 后端 | 8417 | http://localhost:8417 |
| API 文档 | 8417 | http://localhost:8417/docs |

---

## 🎯 使用指南

### 1. AI 检测
- 粘贴或上传学术论文片段
- 点击「仅检测 AI 率」
- 查看整体 AI 概率和分段详情

### 2. 人性化改写
- 输入需要改写的文本
- 选择改写强度（轻微/中度/深度）
- 点击「一键人性化改写」
- 查看原文与改写文对比
- 导出改写结果（TXT 格式）

### 3. 额度管理
- 每日免费额度：10 次
- 每次检测或改写消耗 1 次
- 额度实时显示在右上角

---

## 🛠️ 容错与降级测试 (Fault Tolerance)

本项目已实现完善的 API 容错机制。当核心改写引擎（Groq）由于欠费、封禁、网络波动或未配置 API Key 而无法访问时，系统会自动启动降级模式。

### 1. 模拟改写机制
系统内置了基于学术词汇映射和正则变换的 `_simulated_rewrite` 引擎，可以在完全不联网的情况下对文章进行初步的同义词替换和句式调整。

### 2. 如何测试降级功能
1. 打开 `backend/.env` 文件。
2. 将 `GROQ_API_KEY` 设置为空字符串或乱码，或者直接注释掉。
3. 在前端点击「一键人性化改写」。
4. 观察后端控制台日志，会显示：`⚠️ 未配置 GROQ_API_KEY，切换到降级方案（模拟改写）`。
5. 改写依然会瞬间完成，且能看到词汇变化（如同义词替换）。

### 3. 如何禁用重型 AI 模型（解决 Pending 建议）
如果你的电脑内存不足或网络不通导致启动时加载 AI 检测模型一直转圈（Pending），可以在 `.env` 中添加：
```env
DISABLE_AI_DETECTION=true
```
开启后，后端将跳过模型下载和加载，AI 检测率将返回固定值，但改写功能完全正常且秒开。

---

## 📂 项目结构

```
417/
├── backend/                # FastAPI 后端
│   ├── app/
│   │   ├── main.py        # API 路由
│   │   ├── detector.py    # AI 检测逻辑
│   │   ├── rewriter.py    # LLM 改写逻辑
│   │   └── parser.py      # 文件解析
│   ├── requirements.txt   # Python 依赖
│   ├── Dockerfile         # Docker 配置
│   └── .env              # 环境变量（需手动创建）
├── frontend/              # React 前端
│   ├── src/
│   │   ├── App.jsx       # 主应用
│   │   └── index.css     # 样式
│   └── package.json      # Node 依赖
├── DEPLOYMENT.md         # 详细部署指南
├── GUIDE.md             # 测试用例
└── README.md            # 本文件
```

---

## 🐛 常见问题

### Q1: 后端启动时卡在 "model.safetensors: 0%" 怎么办？

**原因**：首次运行需要从 Hugging Face 下载模型（268MB）。

**解决方案**：
1. 耐心等待 3-5 分钟（取决于网络速度）
2. 如果超过 10 分钟仍未完成，按 `Ctrl+C` 停止
3. 使用国内镜像加速（代码已自动配置 `hf-mirror.com`）
4. 或手动下载模型后放置到缓存目录

### Q2: 改写功能报错 "400 Bad Request"？

**原因**：Groq API Key 配置错误或模型名称不正确。

**解决方案**：
1. 检查 `backend/.env` 文件中的 `GROQ_API_KEY` 是否正确
2. 确认模型名称为 `llama-3.3-70b-versatile`
3. 重启后端服务

### Q3: Docker 构建超时怎么办？

**解决方案**：
1. **推荐**：改用「方式一：本地运行」
2. 增加 Docker 超时时间（见上方 Docker 优化建议）
3. 使用国内 PyPI 镜像源

### Q4: 页面没有样式？
**原因**：Tailwind CSS v4 需要专用插件。
**解决方案**：
```bash
cd frontend
npm install @tailwindcss/vite
npm run dev
```

### Q5: 报错 "address already in use"？
**原因**：之前的 Docker 容器或 Python 进程未退出。
**解决方案**：
```bash
# 如果是用 Docker 启动的
docker-compose down

# 如果是手动运行的
lsof -i :8417  # 查看占用 8417 端口的 PID
kill -9 <PID>  # 强制关闭该进程
```

---

## 🔧 高级配置

### 切换到更小的模型（加快启动速度）

编辑 `backend/app/detector.py`，将模型改为：
```python
model_name = "distilbert-base-uncased"  # 当前使用，66MB
# 或
model_name = "roberta-base-openai-detector"  # 更高精度，500MB
```

### 使用本地 LLM（无需 API Key）

安装 Ollama 后，修改 `backend/app/rewriter.py`：
```python
import ollama
response = ollama.chat(model='llama3', messages=[...])
```

---

## 📊 性能指标

| 指标 | 数值 |
|------|------|
| 模型大小 | 268MB (DistilBERT) |
| 首次启动时间 | 3-5 分钟（下载模型） |
| 后续启动时间 | < 10 秒 |
| 检测速度 | < 2 秒/1000 字 |
| 改写速度 | 3-8 秒/1000 字（取决于 Groq API） |

---

## 📄 许可证

MIT License - 自由使用，保留署名。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📮 联系方式

- 项目地址：[GitHub](https://github.com/yourusername/paperwise-ai)
- 问题反馈：[Issues](https://github.com/yourusername/paperwise-ai/issues)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star！**

Made with ❤️ for Academic Integrity

</div>
