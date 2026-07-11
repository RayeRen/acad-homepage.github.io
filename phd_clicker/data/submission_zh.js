// 中文论文发表数据 (ES Module)
export const SUBMISSION_DATA_ZH = {
    tiers: [
        {
            id: 'tier_1',
            name: '野鸡期刊水会',
            description: '只要交版面费就能发的期刊，学术垃圾场。',
            baseCost: 2500,
            kFactor: 5000,
            baseRate: 0.60,
            maxBaseChance: 0.95,
            rebuttalSwing: 0.05,
            questionConfig: { total: 1, funny: 1, tech: 0 },
            rewardCitations: 50,
            rewardMultiplier: 1,
            targets: [
                'IJCSWI (Intl. Journal of Ctrl+C & Ctrl+V)',
                'JPTP (Pay-To-Publish Daily)',
                'Proc. of Fake IEEE',
                'Journal of Nowhere'
            ]
        },
        {
            id: 'tier_2',
            name: '普通会议 (CCF-C/B)',
            description: '虽然是在夏威夷开会，但大家真的是去交流学术的（确信）。',
            baseCost: 50000,
            kFactor: 150000,
            baseRate: 0.30,
            maxBaseChance: 0.85,
            rebuttalSwing: 0.10,
            questionConfig: { total: 2, funny: 1, tech: 1 },
            rewardCitations: 800,
            rewardMultiplier: 5,
            targets: ['ICASSP', 'COLING', 'BMVC', 'WACV', 'INTERSPEECH']
        },
        {
            id: 'tier_3',
            name: '顶会',
            description: '炼丹师的修罗场。Reviewer #2 正在磨刀...',
            baseCost: 1000000,
            kFactor: 5000000,
            baseRate: 0.10,
            maxBaseChance: 0.75,
            rebuttalSwing: 0.15,
            questionConfig: { total: 3, funny: 2, tech: 1 },
            rewardCitations: 15000,
            rewardMultiplier: 20,
            targets: ['NeurIPS', 'ICML', 'CVPR', 'ICLR']
        }
    ],
    flavorText: {
        accepted: [
            'Reviewer 表示虽然没看懂，但感觉很厉害。Accept!',
            '你的论文被接收了！虽然大部分功劳归功于随机种子 42。',
            'Oral Presentation! 你的 PPT 做得比实验好多了。',
            '恭喜！你离毕业又近了一步（0.01%）。',
            '审稿人被你的图表配色折服了。Accept!'
        ],
        rejected: [
            'Reviewer #2 觉得你的模型没有引用 1998 年的论文。',
            '审稿人认为你的 Related Work 写得像营销号文章。',
            '拒稿理由：\"缺乏 Novelty\"（翻译：我没看懂）。',
            'Area Chair 说你的格式不对，建议回去重修 Word。',
            '审稿人向你提了 40 个问题，并质疑了你的心理问题。',
            '虽然被拒了，但审稿人祝你身体健康。'
        ]
    },
    questionPool: {
        funny: [
            { q: 'Reviewer #2 指出你的 Related Work 漏掉了重要文献，暗示你引用他的文章？', options: ['据理力争说不相关', '加上他的文章并猛夸一顿', '直接撤稿'], correct: 1, comment: '正确！学术人情世故拿捏了。' },
            { q: '实验结果比 Baseline 差了 0.5%，距离截稿还剩 1 小时？', options: ['诚实报告结果', '疯狂调随机种子直到变好', '声称这是为了 Trade-off'], correct: 1, comment: '正确！Seed 42 是一切的答案。' },
            { q: '审稿人问：为什么没有在 ImageNet 上跑实验？（其实是你没算力）', options: ['没卡，穷', '这是 Low-resource 场景的研究', 'ImageNet 已经过时了'], correct: 1, comment: '正确！将\"贫穷\"包装成\"特定场景优化\"是必备技能。' },
            { q: 'Rebuttal 期间，审稿人提出了一个需要跑两周实验的新要求，但 Rebuttal 只有三天？', options: ['通宵跑实验', '承认做不了', '感谢建议，我们将作为未来工作 (Future Work)'], correct: 2, comment: '正确！Future Work = 永远不做的 Work。' },
            { q: '导师让你把他儿子的名字挂在二作，但是你记得他儿子刚过 3 岁生日？', options: ['拒绝，维护学术诚信', '当然可以，那不就是我弟吗', '把他挂在一作'], correct: 1, comment: '正确！毕竟是他发的工资（虽然不多）。' },
            { q: '发现代码里有个 Bug，但是修复了这个 Bug 之后准确率反而下降了？', options: ['修复 Bug 并重写论文', '假装这个 Bug 是 Feature', '保留 Bug，为了\"复现性\"'], correct: 1, comment: '正确！这叫\"基于 Bug 的对抗训练\"。' },
            { q: '审稿人质疑你的英语表达？', options: ['我是 Native Speaker', '这是 ChatGPT 写的，去找 OpenAI', '这段是我导师写的'], correct: 1, comment: '正确！甩锅给 AI 是新时代的生存法则。' },
            { q: 'Reviewer #2 给了 Strong Reject，理由是"这篇论文让我想起了我前任的研究"？', options: ['请求更换审稿人', '在 Rebuttal 中表示同情他的感情经历', '引用他前任的论文并疯狂吹捧'], correct: 2, comment: '正确！学术圈的 NTR 剧情需要用引用来化解。' },
            { q: 'Reviewer 说你的方法"缺乏理论支撑"，但你的方法就是从他的论文里抄的？', options: ['指出这是他自己的方法', '假装不知道，补充理论分析', '怀疑他没读过自己的论文'], correct: 1, comment: '正确！永远不要让审稿人意识到自己的愚蠢。' },
            { q: '三个 Reviewer 给的分数分别是 8、3、3，Area Chair 该怎么判？', options: ['取平均分，Accept', '听多数人的，Reject', '让三个人吵架，看谁赢'], correct: 2, comment: '正确！这就是学术民主的魅力。' },
            { q: 'Reviewer 要求你和 20 个 Baseline 比较，但你的 GPU 只够跑 3 个？', options: ['找同学借卡', '只跑能赢的 Baseline', '表示其他方法"无法复现"'], correct: 2, comment: '正确！"无法复现"是万能挡箭牌。' },
            { q: 'Reviewer 说"实验不够充分"，但已经跑了 200 个实验了？', options: ['把 200 个实验全放进去', '问他到底要多少个', '再跑 200 个，反正不花他的电费'], correct: 0, comment: '正确！用 Appendix 的厚度征服他。' },
            { q: 'Reviewer 的评语只有一句话："Not good enough."？', options: ['要求详细解释', '回复 "Your review is not good enough either."', '默默接受命运'], correct: 0, comment: '正确！虽然他大概率不会回复你。' },
            { q: 'Reviewer 说你的 Related Work 写得太长了，另一个说太短了？', options: ['取中间长度', '分别满足两个人的要求', '在 Rebuttal 里让他们互相吵'], correct: 1, comment: '正确！薛定谔的 Related Work，同时存在于太长和太短的叠加态。' },
            { q: 'Reviewer 问"为什么不用 GPT-4 做实验"，但 API 调用费要 $10,000？', options: ['说预算有限', '说这超出了本文的研究范围', '反问他能不能报销'], correct: 1, comment: '正确！"超出研究范围"可以拒绝一切不合理要求。' },
            { q: '发现 Reviewer 就是你投稿的这个领域的竞争对手？', options: ['请求回避', '在论文里多引用他', '接受命运，准备改投'], correct: 1, comment: '正确！用引用贿赂是学术圈的潜规则。' },
            { q: 'Reviewer 说你的论文"写得像本科生作业"？', options: ['我就是本科生', '用 GPT-4 重写一遍', '回复说"感谢夸奖，我导师也这么说"'], correct: 1, comment: '正确！AI 写作水平已经超越大部分研究生了。' },
            { q: 'Reviewer 在评审意见里夹带私货，要求你引用 8 篇他自己的论文？', options: ['全部引用', '引用其中最相关的 2 篇', '举报他学术不端'], correct: 1, comment: '正确！象征性引用一下，维持表面和平。' },
            { q: 'Reviewer 说"实验结果不 convincing"，但没说哪里不 able to convince 他？', options: ['猜测并补充实验', '请他具体指出问题', '加粗所有数字让它们看起来更自信'], correct: 1, comment: '正确！虽然他可能自己也不知道。' },
            { q: 'Reviewer 的评审意见是从另一篇论文复制粘贴的，连论文标题都没改？', options: ['截图举报', '假装没看到', '回复说"您可能发错了"'], correct: 0, comment: '正确！这种摆烂行为必须举报。' },
            { q: 'Rebuttal 期间 Reviewer 突然消失不回复了？', options: ['疯狂 @ 他', '给 AC 写信投诉', '祈祷他是因为太忙而不是不想理你'], correct: 1, comment: '正确！AC 是你最后的希望。' },
            { q: 'Reviewer 说你的创新点"早在 1990 年就有人做过了"，但没给引用？', options: ['自己去查 1990 年的论文', '要求他提供引用', '回复说 1990 年还没有深度学习'], correct: 1, comment: '正确！没有引用的指控都是耍流氓。' },

            // ========== 导师相关 ==========
            { q: '导师让你把他的名字放在一作，但你已经肝了一整年？', options: ['据理力争', '默默接受', '在致谢里疯狂内涵'], correct: 1, comment: '正确！毕业证还在他手里呢。' },
            { q: '导师说"这个方向很有前景"，但上周他说的是另一个方向？', options: ['做新方向', '继续做旧方向', '两个都做，累死自己'], correct: 2, comment: '正确！这就是博士生的日常。' },
            { q: '导师周五晚上 11 点发消息说"我们聊聊"？', options: ['秒回', '假装没看到', '周一再回复说刚看到'], correct: 0, comment: '正确！"我们聊聊"的恐惧支配着每个研究生。' },
            { q: '导师把你写的代码拿去给师弟用，师弟发了一作？', options: ['要求加名字', '质问导师', '默默在心里记下这笔账'], correct: 2, comment: '正确！君子报仇，毕业之后。' },
            { q: '导师让你帮他儿子辅导高考数学？', options: ['拒绝', '答应', '答应但收费'], correct: 1, comment: '正确！这也是科研训练的一部分（确信）。' },
            { q: '导师看了你的论文初稿，评价是"还行"？', options: ['开心，马上投稿', '焦虑，"还行"是什么意思', '追问具体修改意见'], correct: 2, comment: '正确！"还行"是薛定谔的评价。' },
            { q: '导师在组会上当众批评你的工作"毫无价值"？', options: ['当场反驳', '沉默接受', '会后私下沟通'], correct: 2, comment: '正确！给导师留面子，也给自己留退路。' },
            { q: '导师答应帮你写推荐信，但 deadline 当天还没写？', options: ['疯狂催促', '自己写好让他签名', '再等等，相信导师'], correct: 1, comment: '正确！学术圈公开的秘密。' },
            { q: '导师说"你的进度有点慢"，但你每天工作 12 小时？', options: ['解释自己的工作量', '更加努力', '怀疑人生'], correct: 2, comment: '正确！PhD = Permanent head Damage。' },
            { q: '导师问你"有没有考虑过延毕"？', options: ['坚决拒绝', '委婉表示经济压力', '反问"有没有考虑过给我加工资"'], correct: 1, comment: '正确！用贫穷击退延毕的威胁。' },

            // ========== 实验相关 ==========
            { q: '模型效果突然变好了 10%，但你不知道改了什么？', options: ['仔细检查代码', '不管了，赶紧写论文', '归功于"神秘的超参数调整"'], correct: 1, comment: '正确！能跑就行，别问为什么。' },
            { q: '实验跑了三天三夜，快出结果时服务器断电了？', options: ['崩溃大哭', '检查有没有存 checkpoint', '怀疑是竞争对手搞的鬼'], correct: 1, comment: '正确！checkpoint 是科研人的生命线。' },
            { q: '你的方法在 MNIST 上效果很好，但换到真实数据就崩了？', options: ['声称这是"概念验证"', '在论文里只报告 MNIST 结果', '回去调参'], correct: 0, comment: '正确！MNIST 是一切的起点，也可以是终点。' },
            { q: '实验结果和理论预期完全相反？', options: ['修改理论适应结果', '重新做实验', '发现"反直觉"的新现象'], correct: 2, comment: '正确！"反直觉"听起来比"做错了"高级多了。' },
            { q: '跑实验时发现 GPU 被师兄的挖矿程序占了？', options: ['偷偷杀掉他的进程', '和他协商', '举报给导师'], correct: 1, comment: '正确！和平共处，共享算力。' },
            { q: '换了随机种子之后，结果从 SOTA 变成了倒数第一？', options: ['只报告最好的种子', '报告多个种子的平均值', '在论文里说"我们使用种子 42"'], correct: 1, comment: '正确！虽然大家都只报告最好的那个。' },
            { q: 'Baseline 代码跑出来的结果比论文报告的好了 5%？', options: ['联系作者确认', '用你跑出来的更高结果', '假装没看到，用论文数据'], correct: 0, comment: '正确！科研诚信从核实数据开始。' },
            { q: '实验需要标注 10000 条数据，但只有你一个人？', options: ['雇本科生', '用 GPT-4 自动标注', '减少数据量并声称这是"低资源场景"'], correct: 2, comment: '正确！将困境转化为研究方向是核心能力。' },
            { q: '你的模型训练时 Loss 一直是 0.6931（ln2）？', options: ['模型没在学习，检查代码', '这是一个很稳定的 Loss', '增加训练轮数'], correct: 0, comment: '正确！这通常意味着模型在随机猜（二分类）。' },
            { q: '论文中的消融实验证明你提出的每个模块都没用？', options: ['诚实报告', '调整实验设置直到有用', '声称这些模块有"协同效应"'], correct: 2, comment: '正确！1+1>2，这就是深度学习的魔法。' },

            // ========== 投稿相关 ==========
            { q: 'Deadline 还剩 2 小时，但论文还差一个 Section 没写？', options: ['通宵写完', '先交一版占坑', '放弃，等下一个会议'], correct: 1, comment: '正确！先上车后补票是学术圈的传统。' },
            { q: '发现投稿的会议是假的（野鸡会议）？', options: ['撤稿', '既然交了钱就去参加', '写进简历里反正没人查'], correct: 0, comment: '正确！野鸡会议会毁掉你的学术声誉。' },
            { q: '同一篇论文连续被三个会议拒稿？', options: ['大改后继续投', '换个标题继续投', '怀疑是不是自己不适合做科研'], correct: 0, comment: '正确！屡败屡战是科研的常态。' },
            { q: '论文被接收了但要交 $2000 注册费，导师说没钱？', options: ['自己掏钱', '放弃参会只要论文收录', '申请学生志愿者免注册费'], correct: 2, comment: '正确！用劳动换取参会资格，经典操作。' },
            { q: 'Camera Ready 版本发现了一个错别字？', options: ['祈祷没人发现', '联系出版方修改', '发一个 arXiv 修正版'], correct: 2, comment: '正确！arXiv 是后悔药。' },
            { q: '论文刚投出去就发现有人抢发了几乎一样的工作？', options: ['撤稿', '在 Related Work 里加上那篇论文', '假装没看到'], correct: 1, comment: '正确！并声称你们的方法有"本质区别"。' },
            { q: '投稿系统在 Deadline 前 10 分钟崩了？', options: ['疯狂刷新', '发邮件给组委会', '在 Twitter 上抱怨'], correct: 1, comment: '正确！保留证据，争取延期。' },
            { q: '你的论文被分配给了一个完全不相关领域的 Reviewer？', options: ['请求重新分配', '写一份给外行看的 Rebuttal', '接受命运'], correct: 1, comment: '正确！学会向任何人解释你的研究。' },
            { q: '投稿时发现忘记把致谢里导师的名字加进去？', options: ['赶紧补上', '算了，反正是匿名审稿', '祈祷导师不会看 Camera Ready'], correct: 0, comment: '正确！导师的名字比实验结果更重要。' },
            { q: '论文从顶会被拒后，改投了一个 Workshop，结果拿了 Best Paper？', options: ['开心', '觉得讽刺', '两种情绪同时存在'], correct: 2, comment: '正确！学术人生就是这么魔幻。' },

            // ========== 日常痛苦 ==========
            { q: '读了 100 篇论文后发现自己的 idea 早就有人做过了？', options: ['放弃这个方向', '找不同点继续做', '假装没看到那些论文'], correct: 1, comment: '正确！微创新也是创新。' },
            { q: '周末被导师叫去实验室"聊一下"结果聊到凌晨？', options: ['要加班费', '默默接受', '下次关机'], correct: 1, comment: '正确！科研没有周末这个概念。' },
            { q: '毕业答辩时外审老师问了一个你完全不知道的问题？', options: ['诚实说不知道', '即兴发挥瞎扯', '把问题引到你熟悉的方向'], correct: 2, comment: '正确！答辩的艺术在于控制话题。' },
            { q: '发现自己的论文被别人抄袭了？', options: ['开心，说明有影响力', '举报抄袭', '联系对方要求加引用'], correct: 1, comment: '正确！维护学术诚信人人有责。' },
            { q: '同届的同学都发了 3 篇顶会，你还是 0？', options: ['焦虑', '质疑人生选择', '告诉自己"质量比数量重要"'], correct: 2, comment: '正确！自我安慰是生存的必备技能。' },
            { q: '连续一周实验没有任何进展？', options: ['继续死磕', '换个方向', '出去散步冷静一下'], correct: 2, comment: '正确！有时候灵感在实验室外面。' },
            { q: '论文里的图是用 PPT 画的，Reviewer 说"图太丑"？', options: ['学习用 TikZ', '学习用 Matplotlib', '外包给会画图的同学'], correct: 1, comment: '正确！Python 画图是每个研究生的必修课。' },
            { q: '半夜两点收到导师邮件"睡了吗？有空看一下这个"？', options: ['秒回', '假装睡了明天回', '回复"没睡，马上看"'], correct: 2, comment: '正确！卷是相互的。' },
            { q: '发现自己论文的 GitHub star 比引用还多？', options: ['开心，代码有人用', '难过，paper 没人引', '去 Issues 里找灵感'], correct: 2, comment: '正确！用户反馈比审稿意见有用多了。' },
            { q: '写论文写到凌晨 3 点，发现第一段和最后一段完全矛盾？', options: ['重写第一段', '重写最后一段', '睡觉，明天再说'], correct: 2, comment: '正确！疲劳写作是科研事故的主要原因。' },

            // ========== 学术圈现象 ==========
            { q: '参加学术会议时发现 talks 全程在念 slides？', options: ['玩手机', '假装认真听', '去走廊 social'], correct: 2, comment: '正确！会议的价值在于社交而不是报告。' },
            { q: '收到不认识的教授邮件说"看了你的论文很感兴趣"？', options: ['开心回复', '查一下是不是钓鱼邮件', '怀疑他想让你审稿'], correct: 1, comment: '正确！太热情的邮件往往有问题。' },
            { q: '有人在 Twitter 上说你的论文是"灌水"？', options: ['正面回应', '拉黑', '检查一下他是不是 Reviewer #2'], correct: 2, comment: '正确！真相往往令人沮丧。' },
            { q: '导师让你写一篇综述但没说给不给一作？', options: ['先问清楚', '先写了再说', '等综述写完再讨价还价'], correct: 0, comment: '正确！谈判要趁早。' },
            { q: '学术会议的 Banquet 上不认识任何人？', options: ['找个角落吃东西', '硬着头皮 social', '假装在回邮件'], correct: 1, comment: '正确！走出舒适区是成长的必经之路。' },
            { q: '被邀请审稿但完全不懂这个领域？', options: ['婉拒', '接受并努力学习', '接受然后给个保守的分数'], correct: 0, comment: '正确！负责任的审稿从拒绝开始。' },
            { q: '合作者三个月没回邮件？', options: ['继续等', '电话轰炸', '把他从作者列表里删掉'], correct: 1, comment: '正确！虽然电话可能也不接。' },
            { q: '有人问你能不能帮忙"polish"一下论文英语？', options: ['答应', '推荐 Grammarly', '报价收费'], correct: 2, comment: '正确！专业服务应该有偿。' },
            { q: '发现 arXiv 上有篇论文和你正在做的工作一模一样？', options: ['加速完成赶紧发', '改变研究方向', '联系作者看能不能合作'], correct: 2, comment: '正确！化敌为友是上策。' },
            { q: '有人在你的论文下面 comment 说发现了 bug？', options: ['感谢并修复', '找借口解释', '假装没看到'], correct: 0, comment: '正确！公开透明是学术的基本准则。' },

            // ========== 更多讽刺场景 ==========
            { q: 'Reviewer 说"这篇论文的主要贡献是什么？"但 Abstract 第一句就写了？', options: ['复制粘贴 Abstract 给他', '换一种方式解释', '怀疑他有没有读论文'], correct: 1, comment: '正确！也许换个说法他就懂了（大概）。' },
            { q: '论文标题起名叫 "XXX is All You Need"，Reviewer 说太标题党？', options: ['改成更学术的名字', '坚持，这是致敬经典', '改成 "XXX May Be What You Need"'], correct: 0, comment: '正确！标题党时代已经过去了。' },
            { q: '实验表格里的加粗数字其实是 95% 置信区间内的？', options: ['标注置信区间', '加粗就完事了', '做更多实验确保显著性'], correct: 2, comment: '正确！显著性检验是科学的底线。' },
            { q: '被要求 open source 代码，但代码写得像意大利面？', options: ['重构后再开源', '直接开源附带"仅供参考"', '声称"公司政策不允许"'], correct: 0, comment: '正确！代码质量也是学术声誉的一部分。' },
            { q: '参加 Poster Session 但没有人来看你的 poster？', options: ['主动拉人', '站在那里玩手机', '去看别人的 poster'], correct: 0, comment: '正确！学会推销自己的研究。' },
            { q: '导师说"这个 idea 是我想的"但你记得是在组会上你提出的？', options: ['纠正他', '默默接受', '以后录音'], correct: 1, comment: '正确！记忆是不可靠的，尤其是导师的记忆。' },
            { q: '写 Related Work 时发现这个领域的论文全是自己实验室的？', options: ['全部引用', '只引用最相关的', '怀疑自己是不是在做小众方向'], correct: 1, comment: '正确！虽然这也说明实验室很强。' },
        ],
        technical: [
            { q: '训练 Loss 变成 NaN (Not a Number)，最可能的原因是？', options: ['学习率 (LR) 太大了', '显卡没插好', '数据集太小'], correct: 0, comment: '正确！梯度爆炸了，调低 LR 试试。' },
            { q: '为了防止过拟合 (Overfitting)，通常使用什么方法？', options: ['增加模型深度', 'Dropout / 正则化', '减少 Batch Size'], correct: 1, comment: '正确！让模型\"遗忘\"一些东西。' },
            { q: 'Transformer 架构的核心是什么？', options: ['CNN', 'Attention', 'RNN'], correct: 1, comment: '正确！Attention is all you need.' },
            { q: '在 PyTorch 中，反向传播的命令是？', options: ['loss.backward()', 'loss.go_back()', 'please.optimize()'], correct: 0, comment: '正确！这是你每天要敲无数遍的代码。' },
            { q: "GPT 中的 'P' 代表什么？", options: ['Pre-trained (预训练)', 'Professional (专业)', 'Python'], correct: 0, comment: '正确！Generative Pre-trained Transformer.' },
            { q: 'BatchNorm 在训练和推理时的行为有什么不同？', options: ['完全一样', '训练用 batch 统计，推理用移动平均', '推理时不使用 BatchNorm'], correct: 1, comment: '正确！这就是为什么要调用 model.eval()。' },
            { q: 'ReLU 激活函数的主要缺点是什么？', options: ['计算太慢', '可能导致神经元"死亡"', '梯度太大'], correct: 1, comment: '正确！Dead ReLU Problem，负区间梯度为 0。' },
            { q: 'Adam 优化器结合了哪两种优化方法？', options: ['SGD 和 Momentum', 'Momentum 和 RMSprop', 'SGD 和 AdaGrad'], correct: 1, comment: '正确！Adam = Adaptive Moment Estimation。' },
            { q: '什么是梯度消失问题？', options: ['梯度变得非常小导致无法训练', '梯度被删除了', '梯度变成负数'], correct: 0, comment: '正确！深层网络中反向传播时梯度会指数级衰减。' },
            { q: 'Dropout 的作用是什么？', options: ['加速训练', '防止过拟合', '增加模型参数'], correct: 1, comment: '正确！通过随机丢弃神经元实现正则化。' },
            { q: 'Softmax 函数的输出有什么特点？', options: ['输出都是 0 或 1', '输出和为 1', '输出都大于 1'], correct: 1, comment: '正确！Softmax 将 logits 转换为概率分布。' },
            { q: 'L1 正则化和 L2 正则化的主要区别是什么？', options: ['L1 会产生稀疏解', 'L2 会产生稀疏解', '没有区别'], correct: 0, comment: '正确！L1 倾向于将不重要的权重变为 0。' },
            { q: 'Xavier 初始化的目的是什么？', options: ['让权重变成 0', '保持各层方差稳定', '加速收敛'], correct: 1, comment: '正确！避免信号在前向传播中逐渐消失或爆炸。' },
            { q: 'Cross Entropy Loss 相比 MSE Loss 更适合分类任务的原因？', options: ['计算更快', '梯度更稳定，收敛更快', '结果更准确'], correct: 1, comment: '正确！CE Loss 的梯度不会因为接近正确答案而消失。' },
            { q: '什么是 Learning Rate Warmup？', options: ['让 GPU 预热', '训练初期使用较小的学习率', '训练后期提高学习率'], correct: 1, comment: '正确！让模型在参数不稳定时小步慢走。' },

            // ========== NLP / Transformer 相关 ==========
            { q: 'Transformer 中的 Self-Attention 复杂度是多少？', options: ['O(n)', 'O(n²)', 'O(n³)'], correct: 1, comment: '正确！这就是长序列处理的瓶颈。' },
            { q: 'BERT 使用的是哪种 Attention 机制？', options: ['Causal (单向)', 'Bidirectional (双向)', 'Linear'], correct: 1, comment: '正确！BERT 可以看到上下文的所有信息。' },
            { q: 'GPT 系列模型的训练目标是什么？', options: ['Masked Language Modeling', 'Next Token Prediction', 'Sentence Classification'], correct: 1, comment: '正确！自回归地预测下一个 token。' },
            { q: 'Tokenization 中的 BPE 是什么意思？', options: ['Byte Pair Encoding', 'Basic Processing Element', 'Batch Processing Engine'], correct: 0, comment: '正确！一种基于频率合并字符对的分词方法。' },
            { q: 'Position Embedding 的作用是什么？', options: ['让模型知道词的位置信息', '让模型更快', '减少参数量'], correct: 0, comment: '正确！Transformer 本身没有位置感知能力。' },
            { q: 'Layer Normalization 和 Batch Normalization 的主要区别是什么？', options: ['LN 在特征维度归一化', 'BN 在特征维度归一化', '没有区别'], correct: 0, comment: '正确！LN 对单个样本归一化，不依赖 batch 统计。' },
            { q: 'Multi-Head Attention 的作用是什么？', options: ['减少计算量', '让模型关注不同的表示子空间', '替代 FFN'], correct: 1, comment: '正确！不同的 head 可以学习不同类型的关系。' },
            { q: 'Prompt Engineering 是指什么？', options: ['设计模型架构', '设计输入提示词', '设计训练数据'], correct: 1, comment: '正确！用对问法让 LLM 给出更好的答案。' },
            { q: 'LoRA 的核心思想是什么？', options: ['重新训练整个模型', '只训练低秩分解矩阵', '冻结所有参数'], correct: 1, comment: '正确！用少量参数近似全量微调的效果。' },
            { q: 'RLHF 中的 H 代表什么？', options: ['Hybrid', 'Human', 'High-quality'], correct: 1, comment: '正确！Reinforcement Learning from Human Feedback。' },

            // ========== CV 相关 ==========
            { q: 'CNN 中 Pooling 层的主要作用是什么？', options: ['增加参数', '降采样减少计算量', '增加非线性'], correct: 1, comment: '正确！同时提供一定的平移不变性。' },
            { q: 'ResNet 解决了什么问题？', options: ['过拟合', '梯度消失/爆炸', '计算太慢'], correct: 1, comment: '正确！残差连接让梯度可以直接流过。' },
            { q: '1×1 卷积的作用是什么？', options: ['什么都不做', '改变通道数', '增加感受野'], correct: 1, comment: '正确！可以用来降维或升维。' },
            { q: 'Data Augmentation 的目的是什么？', options: ['增加训练数据多样性', '减少训练时间', '增加模型参数'], correct: 0, comment: '正确！通过变换增加数据多样性防止过拟合。' },
            { q: 'Transfer Learning 中，Fine-tuning 时通常会？', options: ['随机初始化所有参数', '冻结所有参数', '冻结浅层，微调深层'], correct: 2, comment: '正确！浅层特征更通用，深层特征更任务相关。' },
            { q: 'Vision Transformer (ViT) 如何处理图像输入？', options: ['直接输入像素', '切成 patch 后线性投影', '使用 CNN 提取特征'], correct: 1, comment: '正确！An image is worth 16x16 words。' },
            { q: 'FPN (Feature Pyramid Network) 的作用是什么？', options: ['融合多尺度特征', '减少参数量', '加速训练'], correct: 0, comment: '正确！用于检测不同大小的目标。' },
            { q: 'YOLO 的名字是什么意思？', options: ['You Only Look Once', 'Your Observation Learning Object', 'Yearly Optimization for Learning Objects'], correct: 0, comment: '正确！一次前向传播完成检测。' },
            { q: 'IoU (Intersection over Union) 用于衡量什么？', options: ['分类准确率', '检测框的重合程度', '训练速度'], correct: 1, comment: '正确！目标检测中的核心评估指标。' },
            { q: 'Diffusion Model 的采样过程是？', options: ['从噪声逐步去噪', '从图像逐步加噪', '随机生成'], correct: 0, comment: '正确！学习逆扩散过程。' },

            // ========== 训练技巧 ==========
            { q: '模型在训练集上表现好但验证集上差，这是什么问题？', options: ['欠拟合', '过拟合', '学习率太大'], correct: 1, comment: '正确！模型"背答案"而不是学规律。' },
            { q: 'Gradient Clipping 的作用是什么？', options: ['加速训练', '防止梯度爆炸', '增加梯度'], correct: 1, comment: '正确！限制梯度的最大值。' },
            { q: 'Mixed Precision Training (FP16) 的好处是什么？', options: ['提高精度', '减少显存占用和加速', '增加稳定性'], correct: 1, comment: '正确！但要注意数值稳定性问题。' },
            { q: '什么是 Cosine Annealing 学习率调度？', options: ['学习率线性下降', '学习率按余弦曲线变化', '学习率保持不变'], correct: 1, comment: '正确！平滑地降低学习率，可能有周期性重启。' },
            { q: 'Early Stopping 的判断依据通常是什么？', options: ['训练 loss', '验证 loss', '测试 accuracy'], correct: 1, comment: '正确！当验证性能不再提升时停止。' },
            { q: 'Gradient Accumulation 可以解决什么问题？', options: ['显存不够用', '训练太慢', '过拟合'], correct: 0, comment: '正确！模拟更大的 batch size。' },
            { q: 'Label Smoothing 的作用是什么？', options: ['让标签更平滑', '正则化防止过拟合', '加速收敛'], correct: 1, comment: '正确！防止模型过于自信。' },
            { q: 'Ensemble Learning 为什么通常能提高性能？', options: ['增加参数量', '减少方差和偏差', '加速训练'], correct: 1, comment: '正确！多个模型的错误可能互相抵消。' },
            { q: 'Knowledge Distillation 中，Teacher Model 和 Student Model 的关系是？', options: ['Student 比 Teacher 大', 'Teacher 比 Student 大', '一样大'], correct: 1, comment: '正确！用大模型教小模型。' },
            { q: 'Test Time Augmentation (TTA) 是什么？', options: ['测试时对输入做增强并聚合结果', '测试时增加模型参数', '测试时重新训练'], correct: 0, comment: '正确！用多个增强版本的预测结果投票。' },
        ]
    }
};












