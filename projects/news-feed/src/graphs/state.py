# -*- coding: utf-8 -*-
"""
AI与自动驾驶新闻推送工作流 - 状态定义
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class GlobalState(BaseModel):
    """全局状态定义"""
    # 搜索结果
    ai_news: List[dict] = Field(default_factory=list, description="AI行业新闻列表")
    auto_drive_news: List[dict] = Field(default_factory=list, description="自动驾驶行业新闻列表")
    
    # 提取后的关键内容
    ai_key_news: List[dict] = Field(default_factory=list, description="AI行业关键新闻（3条）")
    auto_drive_key_news: List[dict] = Field(default_factory=list, description="自动驾驶关键新闻（3条）")
    
    # 发送状态
    send_success: bool = Field(default=False, description="消息发送是否成功")
    send_message: str = Field(default="", description="发送结果消息")
    message_content: str = Field(default="", description="整合后的消息内容")


class GraphInput(BaseModel):
    """工作流输入"""
    pass


class GraphOutput(BaseModel):
    """工作流输出"""
    ai_key_news: List[dict] = Field(..., description="AI行业关键新闻")
    auto_drive_key_news: List[dict] = Field(..., description="自动驾驶关键新闻")
    send_success: bool = Field(..., description="是否发送成功")


class EmptyInput(BaseModel):
    """空输入（用于入口节点）"""
    pass


class AINewsSearchOutput(BaseModel):
    """AI新闻搜索节点输出"""
    ai_news: List[dict] = Field(..., description="AI新闻列表")


class AutoDriveSearchOutput(BaseModel):
    """自动驾驶新闻搜索节点输出"""
    auto_drive_news: List[dict] = Field(..., description="自动驾驶新闻列表")


class AIKeyExtractInput(BaseModel):
    """AI关键内容提取节点输入"""
    ai_news: List[dict] = Field(..., description="AI新闻列表")


class AIKeyExtractOutput(BaseModel):
    """AI关键内容提取节点输出"""
    ai_key_news: List[dict] = Field(..., description="AI关键新闻")


class AutoDriveKeyExtractInput(BaseModel):
    """自动驾驶关键内容提取节点输入"""
    auto_drive_news: List[dict] = Field(..., description="自动驾驶新闻列表")


class AutoDriveKeyExtractOutput(BaseModel):
    """自动驾驶关键内容提取节点输出"""
    auto_drive_key_news: List[dict] = Field(..., description="自动驾驶关键新闻")


class NewsCombineInput(BaseModel):
    """新闻整合节点输入"""
    ai_key_news: List[dict] = Field(..., description="AI关键新闻")
    auto_drive_key_news: List[dict] = Field(..., description="自动驾驶关键新闻")


class NewsCombineOutput(BaseModel):
    """新闻整合节点输出"""
    message_content: str = Field(..., description="整合后的消息内容")


class MessageSendInput(BaseModel):
    """消息发送节点输入"""
    message_content: str = Field(..., description="消息内容")


class MessageSendOutput(BaseModel):
    """消息发送节点输出"""
    send_success: bool = Field(..., description="是否发送成功")
    send_message: str = Field(..., description="发送结果消息")
