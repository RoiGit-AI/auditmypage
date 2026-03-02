import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — AuditMyPage',
  description: 'SEO tips, web development best practices, and compliance guides.',
}

const posts = [
  {
    slug: '16-seo-checks-every-website-needs',
    title: '16 SEO Checks Every Website Needs Before Launch',
    description: 'A complete checklist of SEO essentials that most developers forget.',
    date: '2026-03-02',
  },
]

export default function BlogPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold">Blog</h1>
      <p className="mt-2 text-gray-400">
        SEO tips, web development best practices, and compliance guides.
      </p>

      <div className="mt-12 space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-gray-800 pb-8">
            <Link
              href={`/blog/${post.slug}`}
              className="block group"
            >
              <h2 className="text-2xl font-semibold group-hover:text-blue-400 transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-gray-400">{post.description}</p>
              <time className="mt-2 text-sm text-gray-500 block">{post.date}</time>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
