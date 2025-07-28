#!/usr/bin/env python3
"""
Icon Generator for ChatGPT Memory Toolkit
從 SVG 生成不同尺寸的 PNG 圖標
"""

import os
import sys
from pathlib import Path

# 添加專案根目錄到 Python 路徑
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

try:
    from PIL import Image, ImageDraw, ImageFont
    import cairosvg
    HAS_CAIRO = True
except ImportError:
    HAS_CAIRO = False
    print("警告: 缺少 cairosvg 或 PIL，將使用備用方案生成圖標")

def create_brain_icon_with_pil(size):
    """使用 PIL 創建大腦圖標"""
    # 創建圖像
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 計算比例
    scale = size / 128
    center = size // 2
    
    # 主背景圓圈
    radius = int(58 * scale)
    draw.ellipse(
        [center - radius, center - radius, center + radius, center + radius],
        fill=(16, 163, 127, 240)  # #10a37f with opacity
    )
    
    # 大腦形狀（簡化版）
    brain_y = int(45 * scale)
    brain_width = int(28 * scale)
    brain_height = int(20 * scale)
    
    # 左腦半球
    left_brain_center = (center - int(14 * scale), brain_y)
    draw.ellipse([
        left_brain_center[0] - brain_width//2,
        left_brain_center[1] - brain_height//2,
        left_brain_center[0] + brain_width//2,
        left_brain_center[1] + brain_height//2
    ], fill=(255, 255, 255, 220), outline=(255, 255, 255, 255))
    
    # 右腦半球
    right_brain_center = (center + int(14 * scale), brain_y)
    draw.ellipse([
        right_brain_center[0] - brain_width//2,
        right_brain_center[1] - brain_height//2,
        right_brain_center[0] + brain_width//2,
        right_brain_center[1] + brain_height//2
    ], fill=(255, 255, 255, 220), outline=(255, 255, 255, 255))
    
    # 記憶節點
    node_positions = [
        (int(38 * scale), int(58 * scale), int(3.5 * scale)),
        (int(90 * scale), int(58 * scale), int(3.5 * scale)),
        (int(48 * scale), int(78 * scale), int(2.5 * scale)),
        (int(80 * scale), int(78 * scale), int(2.5 * scale)),
        (int(64 * scale), int(68 * scale), int(2 * scale))
    ]
    
    for x, y, r in node_positions:
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, 200))
    
    # 下載箭頭
    arrow_center = (center, int(95 * scale))
    arrow_width = int(4 * scale)
    arrow_height = int(16 * scale)
    
    # 箭頭豎線
    draw.rectangle([
        arrow_center[0] - arrow_width//2,
        arrow_center[1] - arrow_height//2,
        arrow_center[0] + arrow_width//2,
        arrow_center[1] + arrow_height//2
    ], fill=(255, 255, 255, 255))
    
    # 箭頭尖端
    arrow_tip_size = int(8 * scale)
    arrow_tip_points = [
        (arrow_center[0] - arrow_tip_size, arrow_center[1] - int(2 * scale)),
        (arrow_center[0], arrow_center[1] + int(6 * scale)),
        (arrow_center[0] + arrow_tip_size, arrow_center[1] - int(2 * scale))
    ]
    draw.polygon(arrow_tip_points, fill=(255, 255, 255, 255))
    
    # 文件指示器
    file_center = (center, int(108 * scale))
    file_width = int(16 * scale)
    file_height = int(6 * scale)
    
    draw.rectangle([
        file_center[0] - file_width//2,
        file_center[1] - file_height//2,
        file_center[0] + file_width//2,
        file_center[1] + file_height//2
    ], fill=(255, 255, 255, 200), outline=(16, 163, 127, 255))
    
    # 添加文件線條
    line_width = int(10 * scale)
    line_y1 = file_center[1] - int(1 * scale)
    line_y2 = file_center[1] + int(1 * scale)
    
    draw.rectangle([
        file_center[0] - line_width//2,
        line_y1 - 1,
        file_center[0] + line_width//2,
        line_y1 + 1
    ], fill=(16, 163, 127, 255))
    
    draw.rectangle([
        file_center[0] - line_width//2,
        line_y2 - 1,
        file_center[0] + line_width//3,
        line_y2 + 1
    ], fill=(16, 163, 127, 255))
    
    return img

def convert_svg_to_png(svg_path, output_path, size):
    """將 SVG 轉換為 PNG"""
    if HAS_CAIRO:
        try:
            # 使用 cairosvg 轉換
            cairosvg.svg2png(
                url=str(svg_path),
                write_to=str(output_path),
                output_width=size,
                output_height=size
            )
            return True
        except Exception as e:
            print(f"cairosvg 轉換失敗: {e}")
            return False
    return False

def generate_icons():
    """生成所有尺寸的圖標"""
    project_root = Path(__file__).parent.parent
    svg_path = project_root / "assets" / "icons" / "brain-memory.svg"
    icons_dir = project_root / "assets" / "icons"
    
    # 確保圖標目錄存在
    icons_dir.mkdir(parents=True, exist_ok=True)
    
    sizes = [16, 32, 48, 128]
    success_count = 0
    
    for size in sizes:
        output_path = icons_dir / f"icon{size}.png"
        
        print(f"生成 {size}x{size} 圖標...")
        
        # 首先嘗試 SVG 轉換
        if svg_path.exists() and convert_svg_to_png(svg_path, output_path, size):
            print(f"✅ 使用 SVG 成功生成 {output_path}")
            success_count += 1
        else:
            # 備用方案：使用 PIL 生成
            try:
                img = create_brain_icon_with_pil(size)
                img.save(output_path, 'PNG')
                print(f"✅ 使用 PIL 成功生成 {output_path}")
                success_count += 1
            except Exception as e:
                print(f"❌ 生成 {size}x{size} 圖標失敗: {e}")
    
    print(f"\n圖標生成完成！成功生成 {success_count}/{len(sizes)} 個圖標")
    
    if success_count < len(sizes):
        print("\n建議安裝依賴來獲得更好的圖標品質:")
        print("pip install Pillow cairosvg")

def main():
    print("ChatGPT Memory Toolkit - 圖標生成器")
    print("=" * 50)
    
    # 檢查依賴
    missing_deps = []
    try:
        import PIL
    except ImportError:
        missing_deps.append("Pillow")
    
    try:
        import cairosvg
    except ImportError:
        missing_deps.append("cairosvg")
    
    if missing_deps:
        print(f"警告: 缺少依賴 {', '.join(missing_deps)}")
        print("建議執行: pip install " + " ".join(missing_deps))
        print()
    
    generate_icons()

if __name__ == "__main__":
    main()