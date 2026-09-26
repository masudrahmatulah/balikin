import { notFound } from 'next/navigation';
import { db } from '@/db';
import { blogPosts, blogComments, blogPostsAnalytics } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { and, isNull } from 'drizzle-orm';
import { Calendar, User, Shield } from 'lucide-react';
import { BlogQuizModule } from '@/components/blog/quiz-module';
import { BlogCommentSection } from '@/components/blog/comment-section';
import { BlogPollModule } from '@/components/blog/poll-module';
import { BlogCrowdsourcedMap } from '@/components/blog/crowdsourced-map';
import { BlogSetupGallery } from '@/components/blog/setup-gallery';
import { BlogSocialSharing } from '@/components/blog/social-sharing';
import { BlogRelatedPosts } from '@/components/blog/related-posts';
import { BlogModule } from '@/types/blog';
import { buildBlogSchemas } from '@/lib/blog-jsonld';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import Image from 'next/image';
import { SiteHeader } from '@/components/site-header';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string, recordView = true) {
  const post = await db.query.blogPosts.findFirst({
    where: and(
      eq(blogPosts.slug, slug),
      eq(blogPosts.isPublished, true),
      isNull(blogPosts.deletedAt)
    ),
  });

  if (!post) return null;

  // Get comments for this post
  const comments = await db.query.blogComments.findMany({
    where: eq(blogComments.postId, post.id),
  });

  // Record page view for analytics
  if (recordView) {
    try {
      await db.insert(blogPostsAnalytics).values({
        postId: post.id,
        viewType: 'page_view',
        ipAddress: null, // Server-side, no IP available
      });
    } catch (error) {
      // Ignore analytics errors
      console.error('Failed to record page view:', error);
    }
  }

  return { post, comments };
}

function generateJSONLD(post: any, modules: BlogModule[], slug: string): string {
  return JSON.stringify(buildBlogSchemas(post, modules, slug));
}

function renderModule(module: BlogModule, postId: string) {
  switch (module.type) {
    case 'quiz_giveaway':
      return (
        <BlogQuizModule
          key={module.quizId}
          quizId={module.quizId}
          rewardText={module.rewardText}
          minScoreToWin={module.minScoreToWin}
          questions={module.questions}
          postId={postId}
        />
      );

    case 'faq':
      if ('data' in module) {
        return (
          <div key="faq" className="bg-muted/40 p-6 rounded-xl my-8">
            <h3 className="text-lg font-bold mb-4">Pertanyaan Umum</h3>
            <div className="space-y-4">
              {module.data.map((faq, idx) => (
                <div key={idx}>
                  <h4 className="font-semibold text-sm">{faq.question}</h4>
                  <p className="text-muted-foreground text-sm mt-1">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return null;

    case 'instant_poll':
      return (
        <BlogPollModule
          key={module.pollId}
          pollId={module.pollId}
          question={module.question}
          options={module.options}
          postId={postId}
        />
      );

    case 'gallery':
      if ('images' in module) {
        return (
          <div key="gallery" className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
            {module.images.map((img, idx) => (
              <img key={idx} src={img} alt={`Gallery ${idx}`} className="rounded-lg" />
            ))}
          </div>
        );
      }
      return null;

    case 'crowdsourced_map':
      return (
        <BlogCrowdsourcedMap
          key={module.mapRegionId}
          mapRegionId={module.mapRegionId}
          postId={postId}
        />
      );

    case 'setup_showoff':
      return (
        <BlogSetupGallery
          key={module.galleryId}
          galleryId={module.galleryId}
          postId={postId}
          incentiveDiscount={module.incentiveDiscount}
        />
      );

    case 'ad_baris':
      return (
        <a
          key={`ad-${module.link}`}
          href={module.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block my-8 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              {module.badge && (
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded mb-2">
                  {module.badge}
                </span>
              )}
              <p className="font-medium text-foreground">{module.text}</p>
            </div>
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </a>
      );

    default:
      return null;
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const data = await getBlogPost(slug);

  if (!data || !data.post) {
    notFound();
  }

  const { post, comments } = data;
  const modules = post.modules as BlogModule[];

  const jsonLd = generateJSONLD(post, modules, slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <article className="min-h-screen bg-background">
        <SiteHeader />
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold mb-6">{post.title}</h1>
              <p className="text-lg opacity-90 mb-6">{post.summary}</p>

              <div className="flex flex-wrap gap-4 text-sm opacity-80">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.authorName}</span>
                </div>
                {post.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
                {post.reviewedBy && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Ditinjau oleh {post.reviewedBy}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {post.coverImage && (
              <div className="relative w-full aspect-video rounded-xl mb-8 overflow-hidden">
                <Image
                  src={post.coverImage}
                   alt={post.coverImageAlt || post.focusKeyword || post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                  priority
                  className="object-cover"
                />
              </div>
            )}

            {/* Markdown Content */}
            <div className="blog-markdown prose prose-lg max-w-none mb-8">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{
                  h1: ({ node, ...props }) => <h1 className="blog-markdown-heading blog-markdown-h1" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="blog-markdown-heading blog-markdown-h2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="blog-markdown-heading blog-markdown-h3" {...props} />,
                  p: ({ node, ...props }) => <p className="blog-markdown-paragraph" {...props} />,
                  ul: ({ node, ...props }) => <ul className="blog-markdown-list blog-markdown-list-unordered" {...props} />,
                  ol: ({ node, ...props }) => <ol className="blog-markdown-list blog-markdown-list-ordered" {...props} />,
                  li: ({ node, ...props }) => <li className="blog-markdown-item" {...props} />,
                  a: ({ node, ...props }) => <a className="blog-markdown-link" {...props} />,
                  blockquote: ({ node, ...props }) => <blockquote className="blog-markdown-quote" {...props} />,
                  pre: ({ node, ...props }) => <pre className="blog-markdown-code" {...props} />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Dynamic Modules */}
            {modules.map((module) => renderModule(module, post.id))}

            {/* Social Sharing */}
            <BlogSocialSharing
              url={`${process.env.NEXT_PUBLIC_APP_URL || 'https://balikin.online'}/blog/${post.slug}`}
              title={post.title}
              summary={post.summary}
            />

            {/* Related Posts */}
            <BlogRelatedPosts postId={post.id} currentSlug={post.slug} />

            {/* Comments Section */}
            <BlogCommentSection postId={post.id} initialComments={comments} />
          </div>
        </div>
      </article>
    </>
  );
}

export async function generateMetadata({ params }: BlogPageProps) {
  const { slug } = await params;
  const data = await getBlogPost(slug, false);

  if (!data?.post) {
    return {};
  }

  const { post } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://balikin.online';

  // Generate OG image URL
  const ogImageUrl = new URL(`${baseUrl}/api/blog/og-image`);
  ogImageUrl.searchParams.set('title', post.title);
  if (post.summary) ogImageUrl.searchParams.set('summary', post.summary);
  if (post.authorName) ogImageUrl.searchParams.set('author', post.authorName);
  if (post.coverImage) ogImageUrl.searchParams.set('cover', post.coverImage);
  const socialImage = post.coverImage || ogImageUrl.toString();

  return {
    title: post.title,
    description: post.metaDescription || post.summary,
    keywords: post.metaKeywords || post.focusKeyword,
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.summary,
      images: [{
        url: socialImage,
        width: 1200,
        height: 630,
        alt: post.coverImageAlt || post.focusKeyword || post.title,
      }],
      type: 'article',
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.authorName],
      siteName: 'BALIKIN',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription || post.summary,
      images: [socialImage],
    },
  };
}
