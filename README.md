# GGJ2026-Mask 黑雾微光

简短说明：
- 项目类型：Cocos Creator 游戏工程（Global Game Jam 2026 主题项目）
- 简短描述：《黑雾微光》游戏全部源代码。

---

**项目关键元信息**

- 项目名：GGJ2026-mask
- Cocos Creator 版本：3.8.8
- package.json 依赖：
  - `fairygui-cc`: ^1.2.2

---

**已知功能（摘自提交历史）**

- `BgMap` 组件：用于随机背景选择
- `AboutWindow`：关于窗口
- `MusicPlayer`：背景音乐管理
- 关卡管理与难度调整机制
- 心（生命）系统与子弹管理
- 雾效果与相关材质（fog effects）
- `GameStagePage` / `StartPage` 等 UI 页面与预制体


---

**项目结构（摘要）**

- assets/ — 资源与场景
- script/ — 游戏逻辑脚本（TypeScript）
- build/ — 构建输出（通常被忽略）
- 打包/ — 打包产物（通常被忽略）
- FGUIProject/ — FairyGUI 编辑内容
- doc/ — 文档与演示稿
- library/, temp/ 等为 Cocos 自动生成目录（已在 .gitignore 中忽略）

（请根据需要补充更详细的模块与重要文件位置）

---

**如何在本地打开与运行（开发者指南）**

1. 安装并打开 Cocos Creator 版本 3.8.8。
2. 在 Cocos Creator 中选择“打开项目”，指向本仓库根目录。
3. 编辑器内点击“预览”运行（选择 Web / 原生 平台）。

快速在浏览器里查看已构建的 Web 版本：
- 打开 `build/web-desktop/index.html` 或 `build/web-mobile/index.html`。

构建（概要）：
- 在编辑器内使用「构建发布」，选择目标平台（Web / Windows / Android / iOS），输出目录位于 `build/`。

注意：仓库中已存在 `build/`、`打包/` 等构建产物，但通常不应提交二进制/构建产物到 GitHub（这些路径已在 `.gitignore` 中）。

---

**依赖与开发工具**

- Node / npm（用于管理前端工具与插件，如需要）
- Cocos Creator 3.8.8
- 依赖：见 `package.json`。

如需安装额外 npm 包（若项目使用 npm 脚本）：

```bash
npm install
```

（如果没人使用 npm 脚本，可忽略）

---

**运行与构建问题排查（常见）**

- 若在打开项目时出现资源丢失或场景错误，尝试清理 `temp/` 与 `library/`（Cocos 会重新生成）。
- 若 TypeScript 编译出现问题，查看 `tsconfig.json` 与 `temp/tsconfig.cocos.json` 的配置。

---

**截图 / 演示**

- 游戏截图截图：

![游戏截图1](https://raw.githubusercontent.com/super999/GGJ2026-mask-art-resource/master/%E6%B8%B8%E6%88%8F%E6%88%AA%E5%9B%BE/%E6%88%AA%E5%9B%BE1.png)

![游戏截图2](https://raw.githubusercontent.com/super999/GGJ2026-mask-art-resource/master/%E6%B8%B8%E6%88%8F%E6%88%AA%E5%9B%BE/%E6%88%AA%E5%9B%BE2.png)

- 演示视频：

![视频封面](https://raw.githubusercontent.com/super999/GGJ2026-mask-art-resource/master/%E6%B8%B8%E6%88%8F%E6%88%AA%E5%9B%BE/%E5%90%AF%E5%8A%A8%E9%A1%B5%E9%9D%A2.png)
[【GGJ2026】黑雾微光 - 作品介绍](https://www.bilibili.com/video/BV1iU6bBCEh4)

---

**控件与玩法说明**

- 游戏目标：在黑暗迷雾里生存、躲子弹。只要撑到30秒结束。
- 操作方式（键盘 / 鼠标 / 触摸）：
    - 方向键 / WASD：移动
目标：
失败：被子弹击中，或血量耗尽。
- 得分与失败条件：

---

**贡献 & 开发者指南**

- 代码风格：TypeScript，遵循项目现有代码风格。
- 提交流程：fork -> 分支 -> PR -> 代码审查 -> 合并。
- 若要贡献：请先开启 Issue 说明你要做的更改。

---

**版权 / 署名 / 资源归属**

- 作者 ：本人，B站：独游AI匠

---

**许可证**

- 代码：MIT License
- 资源（图片 / 音频 / 其他创意素材）：Creative Commons Attribution 4.0 International (CC BY 4.0)

详见仓库根目录的 `LICENSE` 文件。

