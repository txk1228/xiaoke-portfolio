# -*- coding: utf-8 -*-
"""
AI与自动驾驶新闻推送工作流 - 主图编排
"""
from langgraph.graph import StateGraph, END
from graphs.state import (
    GlobalState,
    GraphInput,
    GraphOutput
)
from graphs.nodes.ai_news_search_node import ai_news_search_node
from graphs.nodes.auto_drive_news_search_node import auto_drive_news_search_node
from graphs.nodes.ai_key_extract_node import ai_key_extract_node
from graphs.nodes.auto_drive_key_extract_node import auto_drive_key_extract_node
from graphs.nodes.news_combine_node import news_combine_node
from graphs.nodes.message_send_node import message_send_node


def create_news_workflow():
    """创建新闻推送工作流"""
    
    # 创建状态图
    builder = StateGraph(
        GlobalState,
        input_schema=GraphInput,
        output_schema=GraphOutput
    )
    
    # 添加节点
    builder.add_node("ai_news_search", ai_news_search_node)
    builder.add_node("auto_drive_news_search", auto_drive_news_search_node)
    builder.add_node("ai_key_extract", ai_key_extract_node)
    builder.add_node("auto_drive_key_extract", auto_drive_key_extract_node)
    builder.add_node("news_combine", news_combine_node)
    builder.add_node("message_send", message_send_node)
    
    # 设置入口点 - 两个并行搜索
    builder.set_entry_point("ai_news_search")
    builder.set_entry_point("auto_drive_news_search")
    
    # AI新闻分支: 搜索 -> 提取
    builder.add_edge("ai_news_search", "ai_key_extract")
    
    # 自动驾驶新闻分支: 搜索 -> 提取
    builder.add_edge("auto_drive_news_search", "auto_drive_key_extract")
    
    # 汇聚: 两个提取完成后 -> 整合
    builder.add_edge(
        ["ai_key_extract", "auto_drive_key_extract"],
        "news_combine"
    )
    
    # 整合 -> 发送 -> 结束
    builder.add_edge("news_combine", "message_send")
    builder.add_edge("message_send", END)
    
    # 编译工作流
    return builder.compile()


# 全局工作流实例
main_graph = create_news_workflow()
