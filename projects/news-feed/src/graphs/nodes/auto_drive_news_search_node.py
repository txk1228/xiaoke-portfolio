# -*- coding: utf-8 -*-
"""
自动驾驶新闻搜索节点
"""
import logging
from typing import List, Dict
from langchain_core.runnables import RunnableConfig
from langgraph.runtime import Runtime
from coze_coding_utils.runtime_ctx.context import Context
from coze_coding_dev_sdk import SearchClient
from coze_coding_utils.runtime_ctx.context import new_context

from graphs.state import EmptyInput, AutoDriveSearchOutput

logger = logging.getLogger(__name__)


def auto_drive_news_search_node(
    state: EmptyInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> AutoDriveSearchOutput:
    """
    title: 自动驾驶新闻搜索
    desc: 搜索最新的自动驾驶行业新闻
    integrations: web-search
    """
    ctx = runtime.context
    logger.info("开始搜索自动驾驶行业新闻")
    
    try:
        search_ctx = new_context(method="search.auto_drive_news")
        client = SearchClient(ctx=search_ctx)
        
        response = client.web_search_with_summary(
            query="自动驾驶 智能驾驶 最新动态",
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
        
        logger.info(f"自动驾驶新闻搜索完成，共获取 {len(news_list)} 条")
        
        return AutoDriveSearchOutput(auto_drive_news=news_list)
    except Exception as e:
        logger.error(f"自动驾驶新闻搜索失败: {e}")
        return AutoDriveSearchOutput(auto_drive_news=[])
