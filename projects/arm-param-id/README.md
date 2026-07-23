# 七自由度机械臂动力学 / 静力学参数辨识（仿真）

作品集入口页。完整代码与文档见独立仓库：

**https://github.com/txk1228/arm-param-identification**

## 做什么

面向 7-DoF 机械臂，在仿真中完成：

1. **静力学辨识**：重力 + 库仑摩擦 → 重力补偿  
2. **动力学辨识**：惯性 + 科氏/离心 + 重力 + 摩擦 → 力矩前馈  
3. **鲁棒估计**：列主元 QR 基参数；OLS / Huber-IRLS / 白化 WLS  
4. **激励与验证**：傅里叶 / cosine 轨迹；离群力矩仿真；轨迹碰撞回放  

## 技术栈

Pinocchio · NumPy / SciPy · matplotlib · Trimesh（可视化）

## 快速体验

```bash
git clone https://github.com/txk1228/arm-param-identification.git
cd arm-param-identification
# 按仓库 README 配置 Pinocchio 环境后：
./scripts/run_demo.sh
```

## 说明

- 公开仓库使用教学用几何体 URDF，**不含**任何公司专有模型或网格。  
- 力矩由 URDF 真值参数合成并加噪声，指标为仿真结果，不可直接当作真机精度。  
