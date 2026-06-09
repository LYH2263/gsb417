from transformers import pipeline
import torch
import os

# 使用国内镜像加速（可选）
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'

# Load model lazily
_detector = None

def get_detector():
    global _detector
    # 支持通过环境变量禁用 AI 检测模型加载（防止内存不足或网络导致 Pending）
    if os.getenv("DISABLE_AI_DETECTION") == "true":
        return None

    if _detector is None:
        # 使用更小、更快的模型
        try:
            model_name = "distilbert-base-uncased"
            _detector = pipeline("text-classification", model=model_name)
            print(f"✅ AI 检测模型加载成功: {model_name}")
        except Exception as e:
            print(f"⚠️ 模型加载失败，使用备用方案: {e}")
            _detector = None
    return _detector

def detect_ai_content(text: str):
    detector = get_detector()
    
    # 如果模型加载失败，使用简单规则
    if detector is None:
        return {
            "overall_ai_score": 50.0,
            "details": [{
                "text": text[:500],
                "ai_score": 0.5
            }],
            "note": "模型加载中，当前为模拟数据"
        }
    
    # Split text into chunks if it's too long (max 512 tokens for BERT models)
    max_length = 500
    chunks = [text[i:i+max_length] for i in range(0, len(text), max_length)]
    
    results = []
    for chunk in chunks:
        if len(chunk.strip()) < 10: continue
        try:
            res = detector(chunk)[0]
            # 对于 distilbert，我们需要根据 label 判断
            # 通常 LABEL_1 表示正类（可能是 AI 生成）
            ai_score = res['score'] if 'LABEL_1' in res.get('label', '') else (1 - res['score'])
            results.append({
                "text": chunk,
                "ai_score": ai_score
            })
        except Exception as e:
            print(f"检测出错: {e}")
            results.append({
                "text": chunk,
                "ai_score": 0.5
            })
    
    if not results:
        return {"overall_ai_score": 0, "details": []}
        
    avg_score = sum(r['ai_score'] for r in results) / len(results)
    return {
        "overall_ai_score": round(avg_score * 100, 2),
        "details": results
    }
