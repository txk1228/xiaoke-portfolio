# -*- coding: utf-8 -*-
"""
关键新闻提取节点 - 使用LLM从新闻列表中提取关键内容
"""
import json
import logging
from typing import List, Dict
from langchain_core.runnables import RunnableConfig
from langgraph.runtime import Runtime
from langchain_core.messages import SystemMessage, HumanMessage
from coze_coding_utils.runtime_ctx.context import Context
from coze_coding_dev_sdk import LLMClient
from coze_coding_utils.runtime_ctx.context import new_context

from graphs.state import AIKeyExtractInput, AIKeyExtractOutput

logger = logging.getLogger(__name__)


def ai_key_extract_node(
    state: AIKeyExtractInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> AIKeyExtractOutput:
    """
    title: AI关键新闻提取
    desc: 使用大语言模型从AI新闻列表中提取最关键的3条新闻
    integrations: 大语言模型
    """
    ctx = runtime.context
    news_list = state.ai_news
    logger.info(f"开始提取AI行业关键新闻，共 {len(news_list)} 条")
    if not news_list:
        logger.warning("AI新闻列表为空，跳过提取")
        return AIKeyExtractOutput(ai_key_news=[])
    
    try:
        # 构建输入提示
        news_text = ""
        for idx, news in enumerate(news_list, 1):
            news_text += f"\n{idx}. {news.get('title', '')}"
            news_text += f"\n   来源: {news.get('site_name', '')}"
            news_text += f"\n   摘要: {news.get('snippet', '')}"
            news_text += f"\n   链接: {news.get('url', '')}\n"
        
        prompt = f"""你是一个专业的新闻编辑。请从以下AI行业新闻列表中，提取最关键的3条新闻。

要求：
1. 选择最具影响力、最值得关注的新闻
2. 为每条新闻提供一个50字以内的精炼摘要
3. 输出格式为JSON数组

输出格式：
[
    {{
        "title": "新闻标题",
        "summary": "精炼摘要（50字以内）",
        "url": "新闻链接",
        "source": "来源网站"
    }},
    ...共3条
]

新闻列表：
{news_text}

请直接输出JSON，不要有其他内容："""
        
        llm_ctx = new_context(method="invoke.ai_key_extract")
        client = LLMClient(ctx=llm_ctx)
        
        messages = [
            SystemMessage(content="你是一个专业的新闻编辑，擅长从大量信息中提取最有价值的内容。"),
            HumanMessage(content=prompt)
        ]
        
        response = client.invoke(
            messages=messages,
            model="deepseek-v3-2-251201",
            temperature=0.3,
            max_completion_tokens=2048
        )
        
        # 解析LLM响应
        content = response.content
        if isinstance(content, list):
            content = " ".join(str(item) for item in content)
        elif not isinstance(content, str):
            content = str(content)
        
        # 提取JSON
        try:
            key_news = json.loads(content)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                key_news = json.loads(json_match.group(0))
            else:
                logger.warning("无法解析LLM响应为JSON")
                key_news = []
        
        if not isinstance(key_news, list):
            key_news = []
        
        key_news = key_news[:3]
        
        logger.info(f"AI关键新闻提取完成，共 {len(key_news)} 条")
        
        return AIKeyExtractOutput(ai_key_news=key_news)
    except Exception as e:
        logger.error(f"AI关键新闻提取失败: {e}")
        return AIKeyExtractOutput(ai_key_news=[])
