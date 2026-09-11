import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section className="hero container">
        <span className="hero-badge">网页版 · 无需下载 · 打开即用</span>
        <h1>
          对着麦克风练<span className="hl">工作汇报</span>，<br />
          把每一次汇报练成你的加分项
        </h1>
        <p className="sub">
          述职报告、项目汇报、面试答辩、周报总结……实时转写你说的话，标出「嗯、那个、然后」等填充词，
          套用 STAR / PREP / 金字塔框架，AI 教练帮你把话讲清楚、讲出结构。
        </p>
        <div className="hero-actions">
          <Link href="/practice" className="btn btn-primary">免费开始练习 →</Link>
          <a href="#how" className="btn btn-ghost">看看怎么用</a>
        </div>
        <p className="hero-note">无需注册 · 每天 5 次免费练习 · 中文优先</p>
      </section>

      <section className="section" id="features">
        <div className="container">
          <div className="section-head">
            <h2>解决「不敢说、说不好」的三件事</h2>
            <p>写得出≠说得出。多数人卡在：上台紧张、逻辑混乱、口头禅满天飞。</p>
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
              <p>自动标红「嗯、呃、那个、然后、就是」，统计语速，找出你说话的口头禅。</p>
            </div>
            <div className="card">
              <div className="emoji">🧭</div>
              <h3>结构化框架</h3>
              <p>内置 STAR / PREP / 金字塔原理，照着框架练，结论先行、逻辑递进，不再东一句西一句。</p>
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
              <p>看填充词统计和语速，看 AI 教练的结构点评，针对性地改，再练一遍形成肌肉记忆。</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>适合这些场景</h2>
            <p>只要需要「当众把话说清楚」，都值得提前练一遍。</p>
          </div>
          <div className="grid-2">
            <div className="card">
              <h3>📋 工作汇报 / 述职</h3>
              <p>周报、月报、转正述职、年终总结——结论先行、数据说话，让领导 30 秒抓住重点。</p>
            </div>
            <div className="card">
              <h3>💼 面试 / 答辩</h3>
              <p>自我介绍、项目经历、晋升答辩——用 STAR 把经历讲成有结果的故事。</p>
            </div>
            <div className="card">
              <h3>🎤 演讲 / 路演</h3>
              <p>产品介绍、方案宣讲、公开演讲——克服紧张，练出干净流畅的表达。</p>
            </div>
            <div className="card">
              <h3>🗣️ 表达焦虑</h3>
              <p>私下低门槛反复练习，把「心砰砰跳」练成「胸有成竹」。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ textAlign: 'center', paddingTop: 20 }}>
        <div className="container">
          <h2 style={{ fontSize: 26, marginBottom: 8 }}>现在就开始练一次</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
            把下一次要说的汇报，先在这里练顺了再上台。
          </p>
          <Link href="/practice" className="btn btn-primary">免费开始练习 →</Link>
        </div>
      </section>
    </main>
  );
}
