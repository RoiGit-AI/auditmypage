export default function StructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AuditMyPage',
    url: 'https://auditmypage.com',
    description: 'AI-powered SEO audit and privacy policy generator for websites',
    applicationCategory: 'WebApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Person',
      name: 'Jordan Rivers',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
