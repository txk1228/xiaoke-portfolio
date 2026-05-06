# -*- coding: utf-8 -*-
"""
飞书消息发送节点
"""
import logging
import json
import requests
from langchain_core.runnables import RunnableConfig
from langgraph.runtime import Runtime
from coze_coding_utils.runtime_ctx.context import Context
from coze_workload_identity import Client

from graphs.state import MessageSendInput, MessageSendOutput

logger = logging.getLogger(__name__)


def get_webhook_url() -> str:
    """获取飞书webhook地址"""
    client = Client()
    credential = client.get_integration_credential("integration-feishu-message")
    credential_data = json.loads(credential)
    return credential_data.get("webhook_url", "")


def message_send_node(
    state: MessageSendInput,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> MessageSendOutput:
    """
    title: 飞书消息发送
    desc: 通过飞书机器人将整合好的新闻推送给用户
    integrations: 飞书消息
    """
    ctx = runtime.context
    logger.info("开始发送飞书消息")
    
    message_content = state.message_content
    
    if not message_content:
        logger.warning("消息内容为空，跳过发送")
        return MessageSendOutput(
            send_success=False,
            send_message="消息内容为空"
        )
    
    try:
        webhook_url = get_webhook_url()
        if not webhook_url:
            logger.error("获取飞书webhook失败")
            return MessageSendOutput(
                send_success=False,
                send_message="获取飞书webhook失败"
            )
        
        # 构建富文本消息
        payload = {
            "msg_type": "post",
            "content": {
                "post": {
                    "zh_cn": {
                        "title": "📰 科技行业日报",
                        "content": [
                            [
                                {"tag": "text", "text": message_content}
                            ]
                        ]
                    }
                }
            }
        }
        
        response = requests.post(webhook_url, json=payload, timeout=10)
        result = response.json()
        
        if response.status_code == 200 and result.get("code") == 0:
            logger.info("飞书消息发送成功")
            return MessageSendOutput(
                send_success=True,
                send_message="消息发送成功"
            )
        else:
            error_msg = result.get("msg", "发送失败")
            logger.error(f"飞书消息发送失败: {error_msg}")
            return MessageSendOutput(
                send_success=False,
                send_message=f"发送失败: {error_msg}"
            )
    except Exception as e:
        logger.error(f"飞书消息发送异常: {e}")
        return MessageSendOutput(
            send_success=False,
            send_message=f"发送异常: {str(e)}"
        )
