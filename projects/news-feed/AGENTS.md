# AI与自动驾驶新闻推送工作流

## 项目概述
- **名称**: 科技行业新闻日报推送
- **功能**: 每天自动抓取AI行业与自动驾驶行业新闻，通过大语言模型提取关键内容，通过飞书消息推送给用户

### 节点清单
| 节点名 | 文件位置 | 类型 | 功能描述 | 配置文件 |
|-------|---------|------|---------|---------|
| ai_news_search | `nodes/ai_news_search_node.py` | task | 搜索AI行业最新新闻 | - |
| auto_drive_news_search | `nodes/auto_drive_news_search_node.py` | task | 搜索自动驾驶行业最新新闻 | - |
| ai_key_extract | `nodes/ai_key_extract_node.py` | agent | 从AI新闻中提取3条关键内容 | - |
| auto_drive_key_extract | `nodes/auto_drive_key_extract_node.py` | agent | 从自动驾驶新闻中提取3条关键内容 | - |
| news_combine | `nodes/news_combine_node.py` | task | 整合关键新闻成飞书消息格式 | - |
| message_send | `nodes/message_send_node.py` | task | 通过飞书机器人发送消息 | - |

**类型说明**: task(task节点) / agent(大模型) / condition(条件分支) / looparray(列表循环) / loopcond(条件循环)

## 工作流架构
```
                    ┌─────────────────────┐
                    │   ai_news_search    │
                    │  (AI新闻搜索)        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   ai_key_extract    │
                    │ (AI关键内容提取)     │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌───────────────┐
│auto_drive_news│    │news_combine     │    │ message_send  │
│_search        │    │ (新闻整合)      │───▶│ (飞书推送)    │
│(自动驾驶搜索)  │───▶│                 │    │               │
└───────┬───────┘    └─────────────────┘    └───────────────┘
        │                       ▲
        ▼                       │
┌───────────────┐               │
│auto_drive_key │               │
│_extract       │───────────────┘
│(自动驾驶提取) │
└───────────────┘
```

## 技能使用
- 节点`ai_news_search`、`auto_drive_news_search`使用web-search技能进行新闻搜索
- 节点`ai_key_extract`、`auto_drive_key_extract`使用大语言模型进行内容提取
- 节点`message_send`使用飞书消息集成发送推送

## 配置说明
- 工作流入口: `src/graphs/graph.py` 中的 `main_graph`
- 状态定义: `src/graphs/state.py`
- 飞书消息发送需要配置集成凭证 `integration-feishu-message`
