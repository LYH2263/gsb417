# Backend Dockerfile - Optimized for size
FROM python:3.9-slim

WORKDIR /app

# 安装基础编译环境
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 第一步：专门安装 CPU 版本的 Torch (体积大幅缩小)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# 第二步：安装 transformers 及其轻量级依赖
RUN pip install --no-cache-dir transformers

# 第三步：安装其余业务依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 第四步：预下载 AI 模型 (避免运行时下载导致 Pending)
RUN python3 -c "from transformers import pipeline; pipeline('text-classification', model='distilbert-base-uncased')"

COPY . .

EXPOSE 8417

CMD ["python", "app/main.py"]
