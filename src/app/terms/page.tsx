import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="relative z-10" style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px' }}>
      <Link href="/" style={{ fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
        ← Back to Nirapod
      </Link>

      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
        Terms of Service
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 40 }}>Last updated: June 2026</p>

      {[
        {
          title: '1. Nature of the platform',
          body: 'Nirapod is a community-powered reporting platform. All reports are user-submitted. Nirapod does not independently verify every claim and cannot guarantee the accuracy of all reports.',
        },
        {
          title: '2. Report accuracy',
          body: 'Users submitting reports confirm that their reports are truthful and based on their real personal experience. Submitting false, misleading, or defamatory reports is strictly prohibited and may result in account suspension.',
        },
        {
          title: '3. Dispute and takedown process',
          body: 'Any business or individual who believes a report about them is false or defamatory may contact us at nirapod@gmail.com with evidence. We will review and remove reports that cannot be substantiated within 7 working days.',
        },
        {
          title: '4. Limitation of liability',
          body: 'Nirapod is not liable for any financial losses or damages arising from reliance on information on this platform. Always conduct your own due diligence before making purchasing decisions.',
        },
        {
          title: '5. User data',
          body: 'We collect mobile numbers for authentication only. We do not sell user data to third parties. Proof screenshots are stored securely and are only accessible to the reporter and Nirapod admins.',
        },
        {
          title: '6. Governing law',
          body: 'These terms are governed by the laws of Bangladesh. Any disputes shall be subject to the jurisdiction of Bangladeshi courts.',
        },
      ].map(s => (
        <div key={s.title} style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>
            {s.title}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.8 }}>
            {s.body}
          </p>
        </div>
      ))}
    </div>
  )
}