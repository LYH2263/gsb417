import os
import requests
import re
from dotenv import load_dotenv
import json

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# 修正模型名称：Groq 的正确模型名是 llama-3.3-70b-versatile 或 llama3-8b-8192
MODEL_NAME = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")

def _simulated_rewrite(text: str) -> str:
    """
    降级方案：模拟人工改写功能
    通过同义词替换和句式调整模拟学术改写，用于 API 调用失败时的兜底。
    """
    # 学术同义词映射
    synonyms = {
        "However": "Nevertheless",
        "Therefore": "Consequently",
        "Furthermore": "Moreover",
        "Thus": "Hence",
        "Because": "Since",
        "Important": "Critical",
        "Significant": "Substantial",
        "Necessary": "Essential",
        "Show": "Demonstrate",
        "Use": "Utilize",
        "Improve": "Enhance",
        "Result": "Outcome",
        "Method": "Approach",
        "Data": "Information",
        "Small": "Marginal",
        "Large": "Extensive",
        "Find": "Discover",
        "Change": "Modify",
        "Start": "Initiate",
    }
    
    # 1. 常见短语替换
    phrases = {
        r"\bIn order to\b": "To",
        r"\bIt is important to note that\b": "Notably,",
        r"\bThe results show that\b": "The findings demonstrate that",
        r"\bDue to the fact that\b": "Because",
    }
    
    result = text
    for pattern, replacement in phrases.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    # 2. 单词逐个替换
    words = result.split()
    rewritten_words = []
    
    for word in words:
        # 分离前缀、核心词、后缀标点
        match = re.match(r"^([^\w]*)([\w'-]+)([^\w]*)$", word)
        if match:
            prefix, clean_word, suffix = match.groups()
            
            replacement = None
            if clean_word in synonyms:
                replacement = synonyms[clean_word]
            elif clean_word.capitalize() in synonyms:
                replacement = synonyms[clean_word.capitalize()]
            elif clean_word.lower() in synonyms:
                replacement = synonyms[clean_word.lower()]
                
            if replacement:
                # 保持大小写
                if clean_word.istitle():
                    replacement = replacement.capitalize()
                elif clean_word.isupper():
                    replacement = replacement.upper()
                else:
                    replacement = replacement.lower()
                rewritten_words.append(f"{prefix}{replacement}{suffix}")
            else:
                rewritten_words.append(word)
        else:
            rewritten_words.append(word)
            
    return " ".join(rewritten_words)

def rewrite_text(text: str, level: str = "medium"):
    """
    Rewrites academic text using Groq API while preserving technical terms and structure.
    Levels: low, medium, high
    """
    
    if not GROQ_API_KEY:
        print("⚠️ 未配置 GROQ_API_KEY，切换到降级方案（模拟改写）")
        return _simulated_rewrite(text)
    
    prompts = {
        "low": "Perform slight synonym replacement and minor sentence restructuring to improve flow while maintaining the original tone.",
        "medium": "Restructure sentences and vary vocabulary significantly. Use diverse sentence lengths and improve transitional flow to sound more like a seasoned human academic writer.",
        "high": "Deeply transform the narrative structure. Combine or split sentences, use sophisticated academic vocabulary, and introduce human-like 'burstiness' (varying complexity). Ensure the meaning is identical but the linguistic fingerprint is entirely different."
    }
    
    instruction = prompts.get(level, prompts["medium"])
    
    system_prompt = f"""You are a professional academic editor specialized in reducing AIGC (AI-Generated Content) detection rates while maintaining extreme academic rigors.
    
    Your Task: {instruction}
    
    STRICT CONSTRAINTS:
    1. DO NOT change any technical terms, domain-specific vocabulary, or proper nouns.
    2. DO NOT change any mathematical formulas, LaTeX expressions, or chemical symbols.
    3. DO NOT change any citations (e.g., [12], (Author, 2023)) or references.
    4. DO NOT change experimental data, numbers, or specific results.
    5. Maintain the original meaning and logical structure of the argument.
    6. Improve the 'human-like' qualities: use varied sentence lengths, appropriate transitional phrases, and a natural academic style.
    
    OUTPUT: Provide ONLY the rewritten text, no explanations, no preamble, and no 'Here is the rewritten text' message."""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text}
        ],
        "temperature": 0.7 if level == "low" else (0.85 if level == "medium" else 1.0),
        "max_tokens": 2000
    }

    try:
        print(f"🔄 正在调用 Groq API，模型: {MODEL_NAME}")
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=20)
        
        if response.status_code != 200:
            print(f"❌ Groq API 错误 ({response.status_code})，切换到降级方案")
            return _simulated_rewrite(text)
        
        result = response.json()
        rewritten = result['choices'][0]['message']['content'].strip()
        print(f"✅ Groq API 改写成功")
        return rewritten
        
    except Exception as e:
        print(f"❌ Groq API 调用失败: {str(e)}，启动降级方案")
        return _simulated_rewrite(text)
