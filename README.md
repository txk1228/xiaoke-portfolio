# Jessie · 仝小可

东北大学 · 控制科学与工程（研二）  
方向：**机器人 / 力控与参数辨识 · 预设性能与容错控制**  
GitHub：[txk1228](https://github.com/txk1228)

---

## 关于我

- 科研：预设性能控制、容错控制；EI 论文 2 篇，**IEEE Transactions on Industrial Electronics (SCI)** 论文已接收  
- 工程：七自由度机械臂动力学 / 静力学参数辨识仿真（Pinocchio）；开源 Adaptive Compliance Policy 训练复现与迁移分析  
- 工具：Python / C++、控制系统仿真、Git；能用 AI 辅助加速工程落地，关键结论自行确认  

---

## 技术栈

| 类别 | 内容 |
| :--- | :--- |
| 控制与机器人 | PID / LQR / MPC / 预设性能控制 / 容错控制；动力学·静力学参数辨识；重力补偿与力矩前馈基础 |
| 建模与实现 | Pinocchio、URDF、MATLAB/Simulink；系统辨识；Python / C++ |
| 学习与工程 | PyTorch 训练排障、Diffusion / 模仿学习接口理解；自动化工作流（Coze / 飞书） |
| 前端与其他 | HTML/CSS/JS、微信小程序（拓展项目） |

---

## 作品集

> 排序依据：**岗位相关性（控制/机器人）→ 理论或算法深度 → 可验证产出（论文/仓库/可运行演示）**。  
> 同层内按「硬核程度」排列。

### A. 科研
https://ieeexplore.ieee.org/author/358665586003614
| 产出 | 说明 |
| :--- | :--- |
| **IEEE TIE（SCI）** | 块三角结构系统传感器故障下的容错预设性能控制 |
| **EI × 2** | 欧拉–拉格朗日系统漏斗控制；含执行器故障的压气机预设性能控制 |

论文与证明细节以正式出版物为准；本站侧重工程与开源作品展示。

---

### B. 机器人 / 控制算法（核心工程）

#### 1. 七自由度机械臂动力学 / 静力学参数辨识（仿真）

[仓库 →](https://github.com/txk1228/arm-param-identification) · [简介](./projects/arm-param-id/README.md)

- **内容**：\(τ=Yπ\) 回归建模；RNEA 数值重力回归 / JointTorqueRegressor；QR 基参数；OLS / Huber / 白化 WLS；傅里叶与 cosine 激励；轨迹碰撞回放  
- **价值**：直接服务重力补偿与力矩前馈，与力控 / 位控岗位强相关  
- **说明**：开源仓库为教学用 demo 臂仿真；不包含任何公司专有 URDF/CAD  

#### 2. Adaptive Compliance Policy（开源）训练复现与迁移分析

[仓库 →](https://github.com/txk1228/ACP-repo) · [简介](./projects/acp-repro/README.md)

- **内容**：官方接触操控数据上复现 Diffusion Policy / ACP 训练链路；梳理「观测 → 策略 → 位姿/刚度设定 → 底层柔顺控制」  
- **价值**：理解学习策略与传统力控接口的边界  
- **边界**：未做真机部署；用于学习与迁移条件分析  

---

### C. 工程自动化与智能体（工具链）

> `news-feed` 与 `consulting-agent` 同属「科技资讯自动抓取 + 摘要 + 飞书推送」族谱；下面按能力完整度列出。

#### 3. 科技日报咨询智能体

[详情 →](./projects/consulting-agent/README.md)

- Agent 模式检索 + 定时推送飞书；覆盖 AI / 自动驾驶资讯  
- 技术：Python · LangGraph · APScheduler · 大模型 · Coze  

#### 4. 科技行业资讯推送工作流

[详情 →](./projects/news-feed/README.md) · 相关仓库：[daily-news-bot](https://github.com/txk1228/daily-news-bot)

- 低代码 / 工作流编排实现定时抓取、摘要与多渠道推送  

#### 5. 体脂健康管家

[详情 →](./projects/tizhi-health/README.md)

- 截图识别录入、趋势分析与建议；Taro 小程序 + NestJS（拓展全栈能力）  

---

### D. 前端练习与工具站（展示用）

#### 6. LeetCode Hot100 刷题打卡

[源码](./projects/leetcode-tracker/) · [在线预览](https://txk1228.github.io/xiaoke-portfolio/projects/leetcode-tracker/)

- 纯前端进度追踪与本地持久化  

#### 7. 在线电子黑板

[源码](./projects/whiteboard/) · [在线预览](https://txk1228.github.io/xiaoke-portfolio/projects/whiteboard/)

- Canvas 画笔 / 橡皮 / 撤销 / 导出 PNG  

---

## 仓库索引

| 仓库 | 角色 |
| :--- | :--- |
| [xiaoke-portfolio](https://github.com/txk1228/xiaoke-portfolio) | 本作品集（GitHub Pages） |
| [arm-param-identification](https://github.com/txk1228/arm-param-identification) | 机械臂参数辨识仿真 |
| [ACP-repo](https://github.com/txk1228/ACP-repo) | ACP / Diffusion Policy 复现笔记与脚本 |
| [daily-news-bot](https://github.com/txk1228/daily-news-bot) | 资讯推送相关代码 |

---

## 联系方式

- 邮箱：3238074253@qq.com  
- GitHub：[txk1228](https://github.com/txk1228)  
