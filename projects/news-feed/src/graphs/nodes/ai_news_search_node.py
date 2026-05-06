# -*- coding: utf-8 -*-
"""
AI新闻搜索节点
"""
import logging
from typing import List, Dict
from langchain_core.runnables import RunnableConfig
from langgraph.runtime import Runtime
from coze_coding_utils.runtime_ctx.context import Context
from coze_coding_dev_sdk import SearchClient
from coze_coding_utils.runtime_ctx.context import new_context

from graphs.state import EmptyInput, AINewsSearchOutput

logger = logging.getLogger(__name__)


def ai_news_search_node(
    state: EmptyInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> AINewsSearchOutput:
    """
    title: AI新闻搜索
    desc: 搜索最新的AI行业新闻
    integrations: web-search
    """
    ctx = runtime.context
    logger.info("开始搜索AI行业新闻")
    
    try:
        search_ctx = new_context(method="search.ai_news")
        client = SearchClient(ctx=search_ctx)
        
        response = client.web_search_with_summary(
            query="AI人工智能 行业动态 最新资讯",
            count=10
        )
        
        news_list: List[Dict] = []
        if response.web_items:
            for item in response.web_items:
                news_list.append({
                    "title": item.title or "",
                    "url": item.url or "",
                    "snippet": item.snippet or "",
                    "site_name": item.site_name or "",
                    "publish_time": item.publish_time or ""
                })
        
        logger.info(f"AI新闻搜索完成，共获取 {len(news_list)} 条")
        if news_list:
            logger.info(f"第一条新闻: {news_list[0].get('title', 'N/A')}")
        
        return AINewsSearchOutput(ai_news=news_list)
    except Exception as e:
        logger.error(f"AI新闻搜索失败: {e}")
        return AINewsSearchOutput(ai_news=[])
