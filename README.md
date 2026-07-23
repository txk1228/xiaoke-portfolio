# 仝小可 / Jessie
**控制科学与工程硕士 | 机器人力控与动力学方向**
> 预设性能控制 / 容错控制 / 动力学参数辨识 / 柔顺交互控制

📍 东北大学 · 控制科学与工程（研二）  
📧 邮箱：3238074253@qq.com  
🔗 GitHub：[txk1228](https://github.com/txk1228)  
📑 IEEE Xplore：[作者主页](https://ieeexplore.ieee.org/author/358665586003614)

---

## 关于我
专注于机器人系统的高精度控制与动力学建模，具备**扎实的控制理论功底**与**工程落地能力**：
- 科研方向：预设性能控制、容错控制，以第一作者发表 IEEE TIE（SCI 顶刊）论文 1 篇，EI 会议论文 2 篇；
- 工程实践：独立完成 7 自由度机械臂静力学/动力学参数辨识全流程仿真，复现并分析自适应柔顺控制策略，熟悉基于模型的力控前馈与补偿方案；
- 工具链：熟练使用 Python/C++、Pinocchio、MATLAB/Simulink、ROS，掌握动力学建模、系统辨识、鲁棒估计算法的实现与调试。

---

## 🛠 技术栈
| 分类 | 核心内容 |
| :--- | :--- |
| **核心控制算法** | 预设性能控制 / 容错控制 / 阻抗-导纳控制 / 计算力矩控制 / PID / LQR / MPC |
| **机器人建模与辨识** | 牛顿-欧拉动力学 / 拉格朗日建模 / 基参数辨识 / 重力与摩擦补偿 / Pinocchio / URDF |
| **工程实现工具** | Python / C++ / Eigen / MATLAB/Simulink / ROS / Git / cvxpy优化求解 |
| **拓展能力** | PyTorch深度学习基础 / 扩散策略与模仿学习 / 自动化工作流搭建 |

---

## 📂 核心作品集
按岗位匹配度与硬核程度排序，优先展示机器人与控制方向成果。

### 一、科研成果（理论功底）

| # | Paper | Venue |
| :---: | :--- | :--- |
| 1 | X. K. Tong, J. X. Zhang and T. Y. Chai, **"Fault-Tolerant Prescribed Performance Control of Block-Triangular Systems with Sensor Faults"** | *IEEE Transactions on Industrial Electronics* (SCI), **Published**, 2026 |
| 2 | X. K. Tong, J. X. Zhang, **"Funnel Control of Euler-Lagrange Systems With Independent Control Gains"** | IAI, EI |
| 3 | X. K. Tong, J. X. Zhang, **"Low-Complexity Prescribed Performance Control of Jet Engine Compressors With Actuator Failures"** | ICAIS & ISAS, EI |

> 依托非线性控制理论积累，聚焦机器人系统的高精度、高鲁棒性控制问题，支撑工程端的力控与辨识算法设计。

---

### 二、机器人控制工程（核心项目）
#### 1. 7自由度机械臂静力学/动力学参数辨识仿真
**仓库**：[arm-param-identification](https://github.com/txk1228/arm-param-identification)  
**标签**：动力学建模 / 系统辨识 / 鲁棒估计 / Pinocchio

**项目背景**：
基于模型的高精度力控高度依赖准确的动力学参数，针对URDF标称参数与实际存在偏差、测量数据含噪声与异常点的问题，搭建了一套完整的鲁棒参数辨识仿真框架。

**核心工作**：
- 基于牛顿-欧拉递推（RNEA）构造重力与动力学回归矩阵，采用带列主元QR分解提取基参数，消除参数冗余，参数维度压缩40%；
- 实现三种辨识求解策略：普通最小二乘（OLS）、Huber加权迭代重加权最小二乘（IRLS）、双层鲁棒白化加权最小二乘（Robust-WLS）；
- 设计傅里叶级数激励轨迹，保证参数充分激励；加入伪惯量矩阵正定性半定规划（SDP）约束，确保辨识结果物理可实现；
- 支持高斯噪声、异方差噪声、异常点注入，全面验证算法鲁棒性。

**量化成果**：
- 在0.05N·m高斯白噪声+5%极端异常点的工况下，扭矩预测RMS误差<0.01N·m；
- 硬阈值异常点剔除准确率达98%以上，Huber加权有效降低离群点对辨识结果的干扰。

> 项目成果可直接对接计算力矩控制、重力补偿、零力拖动等力控场景，为高精度柔顺交互提供模型基础。

#### 2. Adaptive Compliance Policy 训练复现与迁移分析
**仓库**：[ACP-repo](https://github.com/txk1228/ACP-repo)  
**标签**：柔顺控制 / 扩散策略 / 学习型力控

**项目背景**：
探索传统基于模型的力控与学习型柔顺控制的结合边界，复现基于扩散策略的自适应柔顺控制方案，分析其在接触操控任务中的优劣势与迁移条件。

**核心工作**：
- 基于官方接触操控数据集，复现Diffusion Policy到ACP的完整训练链路，梳理「观测输入→策略输出→位姿/刚度设定→底层柔顺控制」的全流程；
- 对比学习型柔顺控制与传统阻抗/导纳控制的适用场景，总结策略迁移到新任务的核心约束条件。

**核心结论**：
学习型策略在非结构化接触场景中具备自适应优势，但稳态精度与可解释性弱于基于模型的力控方案，二者结合是未来落地方向。

---

### 三、工程工具与拓展项目
#### 1. 科技资讯智能推送系统
- 基于LangGraph+APScheduler实现科技资讯自动抓取、大模型摘要、定时飞书推送，覆盖AI、自动驾驶领域；
- 低代码工作流版本支持多渠道分发，提升信息获取效率。

#### 2. 前端与工具类项目
- LeetCode Hot100 刷题打卡工具：纯前端实现，支持进度追踪与本地持久化
- 在线电子黑板：Canvas实现画笔、橡皮、撤销、导出功能

---

## 📦 仓库索引
| 仓库名称 | 角色 | 核心技术 | 状态 |
| :--- | :--- | :--- | :--- |
| xiaoke-portfolio | 本作品集主页 | GitHub Pages | ✅ 已完成 |
| arm-param-identification | 机械臂参数辨识仿真 | Pinocchio / 系统辨识 / Python | ✅ 已完成 |
| ACP-repo | 自适应柔顺策略复现 | Diffusion Policy / 力控 | ✅ 已完成 |
| daily-news-bot | 资讯推送工具 | Python / 大模型 / 飞书 | ✅ 已完成 |

---

## 📬 联系方式
- 邮箱：3238074253@qq.com
- GitHub：[txk1228](https://github.com/txk1228)
