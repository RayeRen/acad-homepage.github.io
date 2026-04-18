#!/usr/bin/env python3
"""
手动更新Google Scholar引用数据的脚本
使用方法: python3 update_citations.py
"""

import sys
import os
import json
from datetime import datetime

# 将Google Scholar爬虫目录添加到路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'google_scholar_crawler'))

try:
    from scholarly import scholarly
except ImportError:
    print("❌ 缺少scholarly库，请先安装：pip3 install scholarly==1.5.1")
    sys.exit(1)

def update_citations():
    """更新Google Scholar引用数据"""
    print("🔍 开始获取Google Scholar数据...")
    
    # 从环境变量或配置文件获取Google Scholar ID
    google_scholar_id = os.environ.get('GOOGLE_SCHOLAR_ID', 'o23sDqkAAAAJ')
    
    try:
        # 获取作者信息
        print(f"📊 正在获取作者 {google_scholar_id} 的数据...")
        author = scholarly.search_author_id(google_scholar_id)
        scholarly.fill(author, sections=['basics', 'indices', 'counts', 'publications'])
        
        # 准备数据
        name = author['name']
        author['updated'] = str(datetime.now())
        author['publications'] = {v['author_pub_id']: v for v in author['publications']}
        
        # 确保输出目录存在
        os.makedirs('google-scholar-stats', exist_ok=True)
        
        # 保存主数据文件
        with open('google-scholar-stats/gs_data.json', 'w', encoding='utf-8') as outfile:
            json.dump(author, outfile, ensure_ascii=False, indent=2)
        
        # 保存shields.io格式的数据
        shieldio_data = {
            "schemaVersion": 1,
            "label": "citations",
            "message": f"{author['citedby']}",
        }
        with open('google-scholar-stats/gs_data_shieldsio.json', 'w', encoding='utf-8') as outfile:
            json.dump(shieldio_data, outfile, ensure_ascii=False)
        
        # 显示结果
        print(f"✅ 更新完成！")
        print(f"📈 总引用数: {author['citedby']}")
        print(f"📝 论文数量: {len(author['publications'])}")
        print(f"🔢 h指数: {author['hindex']}")
        print(f"🔢 i10指数: {author['i10index']}")
        
        # 显示各论文引用数
        print(f"\n📚 各论文引用数:")
        for pub_id, pub in author['publications'].items():
            title = pub['bib']['title'][:50] + "..." if len(pub['bib']['title']) > 50 else pub['bib']['title']
            citations = pub.get('num_citations', 0)
            print(f"   • {title}: {citations}")
        
        print(f"\n💾 数据已保存到 google-scholar-stats/ 目录")
        
    except Exception as e:
        print(f"❌ 获取数据时出错: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Google Scholar 引用数据更新工具")
    print("=" * 50)
    
    if update_citations():
        print("\n🎉 引用数据更新成功！")
        print("💡 提示：如果您正在使用GitHub Pages，请提交并推送这些更改。")
    else:
        print("\n😞 更新失败，请检查错误信息。")
        sys.exit(1) 