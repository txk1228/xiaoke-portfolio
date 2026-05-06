# -*- coding: utf-8 -*-
"""
nodes包初始化文件
"""
from graphs.nodes.ai_news_search_node import ai_news_search_node
from graphs.nodes.auto_drive_news_search_node import auto_drive_news_search_node
from graphs.nodes.ai_key_extract_node import ai_key_extract_node
from graphs.nodes.auto_drive_key_extract_node import auto_drive_key_extract_node
from graphs.nodes.news_combine_node import news_combine_node
from graphs.nodes.message_send_node import message_send_node

__all__ = [
    "ai_news_search_node",
    "auto_drive_news_search_node",
    "ai_key_extract_node",
    "auto_drive_key_extract_node",
    "news_combine_node",
    "message_send_node"
]
