import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section className="hero container">
        <span className="hero-badge">✦ 网页版 · 无需下载 · 打开即用</span>
        <h1>
          对着麦克风练<span className="grad">工作汇报</span>，<br />
          把每一次汇报练成你的加分项
        </h1>
        <p className="sub">
          述职报告、项目汇报、面试答辩、周报总结……实时转写你说的话，标出「嗯、那个、然后」等口头禅，
          套用 STAR / PREP / 金字塔框架，AI 教练帮你把话讲清楚、讲出结构。
        </p>
        <div className="hero-actions">
          <Link href="/practice" className="btn btn-primary btn-lg">🎤 免费开始练习 →</Link>
          <a href="#how" className="btn btn-ghost btn-lg">看看怎么用</a>
        </div>
        <p className="hero-note">无需注册 · 每天 5 次免费练习 · 中文优先 · 数据不上传服务器</p>
        <div className="hero-meta">
          <span className="m">🎙️ <b>实时转写</b> 边说边出字</span>
          <span className="m">🔍 <b>填充词检测</b> 揪出口头禅</span>
          <span className="m">🧭 <b>3 大框架</b> STAR / PREP / 金字塔</span>
          <span className="m">🤖 <b>AI 教练</b> 逐条点评</span>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <div className="section-head">
            <h2>解决「不敢说、说不好」的六件事</h2>
            <p>写得出 ≠ 说得出。多数人卡在：上台紧张、逻辑混乱、口头禅满天飞。</p>
          </div>
          <div className="grid-3">
            <div className="card">
              <div className="emoji">🎙️</div>
              <h3>实时转写</h3>
              <p>打开浏览器麦克风开口练，你的话实时变成文字，说错、卡壳一眼可见。</p>
            </div>
            <div className="card">
              <div className="emoji">🔍</div>
              <h3>填充词检测</h3>
              <p>自动标红「嗯、呃、那个、然后、就是」，统计语速，揪出你的口头禅。</p>
            </div>
            <div className="card">
              <div className="emoji">🧭</div>
              <h3>结构化框架</h3>
              <p>内置 STAR / PREP / 金字塔原理，照着框架练，结论先行、逻辑递进。</p>
            </div>
            <div className="card">
              <div className="emoji">🤖</div>
              <h3>AI 教练点评</h3>
              <p>从结构、用词、表达三个维度逐条点评，给一条最该改的具体建议。</p>
            </div>
            <div className="card">
              <div className="emoji">🗂️</div>
              <h3>六大职场场景</h3>
              <p>周报、项目汇报、述职、面试、答辩、路演，练你真正要上场的那一种。</p>
            </div>
            <div className="card">
              <div className="emoji">📈</div>
              <h3>多维评分雷达</h3>
              <p>结构逻辑、表达流畅、词汇精准、语速节奏四维打分，进步看得见。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="container">
          <div className="section-head">
            <h2>三步开始练</h2>
            <p>不需要下载、不需要露脸，一个人在家就能练。</p>
          </div>
          <ol className="steps">
            <li>
              <h4>选一个场景和框架</h4>
              <p>述职汇报用 STAR，陈述观点用 PREP，向领导汇报用金字塔原理——先搭骨架再开口。</p>
            </li>
            <li>
              <h4>对着麦克风说一遍</h4>
              <p>像真实汇报一样开口说。工具实时转写，帮你记录每一句话、每一个停顿。</p>
            </li>
            <li>
              <h4>看反馈、改一遍、再说一遍</h4>
              <p>看四维雷达和 AI 点评，针对性地改，再练一遍形成肌肉记忆。</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section" id="frameworks">
        <div className="container">
          <div className="section-head">
            <h2>三种表达框架，套上即专业</h2>
            <p>结构不是束缚，是让你在紧张时也不丢逻辑的脚手架。</p>
          </div>
          <div className="fw-grid">
            <div className="fw-card">
              <span className="tag">STAR 法则</span>
              <h4>讲经历、讲成果</h4>
              <p className="d">面试、述职、项目汇报的万能框架</p>
              <ol>
                <li><b>S</b> 情境 — 背景是什么</li>
                <li><b>T</b> 任务 — 你的目标</li>
                <li><b>A</b> 行动 — 你做了什么</li>
                <li><b>R</b> 结果 — 量化成果</li>
              </ol>
            </div>
            <div className="fw-card">
              <span className="tag">PREP 表达法</span>
              <h4>快速陈述观点</h4>
              <p className="d">会议发言、临时被点名的救场框架</p>
              <ol>
                <li><b>P</b> 观点 — 先亮结论</li>
                <li><b>R</b> 理由 — 为什么</li>
                <li><b>E</b> 例证 — 例子/数据</li>
                <li><b>P</b> 重申 — 一句话收束</li>
              </ol>
            </div>
            <div className="fw-card">
              <span className="tag">金字塔原理</span>
              <h4>麦肯锡式汇报</h4>
              <p className="d">向领导汇报、写总结的结构化方法</p>
              <ol>
                <li><b>结论先行</b> — 第一句给结论</li>
                <li><b>归类分组</b> — 要点按 MECE</li>
                <li><b>逻辑递进</b> — 时间/结构/程度排序</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="scenarios">
        <div className="container">
          <div className="section-head">
            <h2>覆盖你真正要上场的场景</h2>
            <p>练最贴近真实的那一种，练到即用到。</p>
          </div>
          <div className="scn-wrap">
            <span className="scn-pill">📋 周报汇报</span>
            <span className="scn-pill">📊 项目汇报</span>
            <span className="scn-pill">📈 述职汇报</span>
            <span className="scn-pill">💼 面试</span>
            <span className="scn-pill">🎓 答辩</span>
            <span className="scn-pill">🚀 路演 / 宣讲</span>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container">
          <div className="section-head">
            <h2>常见问题</h2>
          </div>
          <div className="faq">
            <details className="faq-item">
              <summary>需要下载或注册吗？</summary>
              <p>不用。打开网页即可练，免费额度每天 5 次，无需注册、无需下载。</p>
            </details>
            <details className="faq-item">
              <summary>我的语音会被上传吗？</summary>
              <p>不会。语音识别走你浏览器自带的 Web Speech API（Chrome/Edge），文字只在本地分析；只有「AI 深度点评」会把文字发给我们自己的服务（不存储）。</p>
            </details>
            <details className="faq-item">
              <summary>支持哪些浏览器？</summary>
              <p>语音识别推荐 Chrome / Edge（中文效果好）。Firefox / Safari 暂不支持实时语音，可用「粘贴文字分析」功能。</p>
            </details>
            <details className="faq-item">
              <summary>和 AI 写作工具有什么区别？</summary>
              <p>写作工具只帮你「写」，这个工具帮你「开口说」——实时转写 + 口头禅检测 + 结构反馈，练的是你上台的真实表现。</p>
            </details>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <h2>现在就把下一次汇报练顺</h2>
            <p>对着麦克风练一遍，比在心里默念十遍都有用。</p>
            <Link href="/practice" className="btn btn-primary btn-lg">🎤 免费开始练习 →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
