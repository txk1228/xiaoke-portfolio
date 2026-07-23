# Adaptive Compliance Policy（开源）训练复现

作品集入口页。工作区仓库：

**https://github.com/txk1228/ACP-repo**

## 做什么

- 复现 / 跑通开源 Adaptive Compliance Policy（及相关 Diffusion Policy）训练流程  
- 梳理链路：多模态观测 → 策略网络 → 位姿 / 虚拟目标 / 刚度设定 → 底层柔顺控制  
- 分析向自研多自由度臂迁移时的维度与传感器缺口  

## 技术栈

PyTorch · 模仿学习 / Diffusion Policy · 训练排障（OOM、断点续训等）

## 诚实边界

- 以官方或开源数据训练为主，用于理解方法与接口  
- **未进行真机部署**  
- AI 辅助可用于读代码与排错；训练目标与结果解读自行确认  

## 相关论文

[Adaptive Compliance Policy (arXiv:2410.09309)](https://arxiv.org/abs/2410.09309)
