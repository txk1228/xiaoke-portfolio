# -*- coding: utf-8 -*-
"""
新闻整合节点 - 将AI和自动驾驶的关键新闻整合成一条消息
"""
import logging
from datetime import datetime
from pydantic import BaseModel, Field
from langchain_core.runnables import RunnableConfig
from langgraph.runtime import Runtime
from coze_coding_utils.runtime_ctx.context import Context

from graphs.state import NewsCombineInput, NewsCombineOutput

logger = logging.getLogger(__name__)


def news_combine_node(
    state: NewsCombineInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> NewsCombineOutput:
    """
    title: 新闻整合
    desc: 将AI和自动驾驶的关键新闻整合成飞书消息格式
    integrations: 无
    """
    ctx = runtime.context
    logger.info("开始整合新闻内容")
    
    ai_key_news = state.ai_key_news
    auto_drive_key_news = state.auto_drive_key_news
    
    today = datetime.now().strftime("%Y年%m月%d日")
    
    # 构建消息内容
    message_parts = []
    
    # 标题
    message_parts.append(f"📰 【{today} 科技行业日报】\n")
    message_parts.append("=" * 40)
    
    # AI行业新闻
    message_parts.append("\n🤖 AI人工智能行业\n")
    message_parts.append("-" * 40)
    
    if ai_key_news:
        for idx, news in enumerate(ai_key_news, 1):
            title = news.get("title", "无标题")
            summary = news.get("summary", "")
            url = news.get("url", "")
            source = news.get("source", "")
            
            message_parts.append(f"\n{idx}. {title}")
            if summary:
                message_parts.append(f"\n   📝 {summary}")
            if source:
                message_parts.append(f"\n   📍 来源: {source}")
            if url:
                message_parts.append(f"\n   🔗 {url}")
            message_parts.append("\n")
    else:
        message_parts.append("\n   暂无AI行业关键新闻\n")
    
    # 自动驾驶新闻
    message_parts.append("\n🚗 自动驾驶行业\n")
    message_parts.append("-" * 40)
    
    if auto_drive_key_news:
        for idx, news in enumerate(auto_drive_key_news, 1):
            title = news.get("title", "无标题")
            summary = news.get("summary", "")
            url = news.get("url", "")
            source = news.get("source", "")
            
            message_parts.append(f"\n{idx}. {title}")
            if summary:
                message_parts.append(f"\n   📝 {summary}")
            if source:
                message_parts.append(f"\n   📍 来源: {source}")
            if url:
                message_parts.append(f"\n   🔗 {url}")
            message_parts.append("\n")
    else:
        message_parts.append("\n   暂无自动驾驶行业关键新闻\n")
    
    # 结尾
    message_parts.append("\n" + "=" * 40)
    message_parts.append("\n💡 以上是今日科技行业精选资讯")
    
    message_content = "".join(message_parts)
    
    logger.info("新闻整合完成")
    
    return NewsCombineOutput(message_content=message_content)
