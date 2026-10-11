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
import { BlogHouseAd, shouldShowHouseAds, countWords, splitMarkdownBlocks } from '@/components/blog/blog-house-ad';
import type { BlogModule } from '@/types/blog';
import { buildBlogSchemas } from '@/lib/blog-jsonld';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import Image from 'next/image';
import { SiteHeader } from '@/components/site-header';
import { absoluteUrl, getSiteUrl } from '@/lib/seo';
import Link from 'next/link';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getBlogPost(slug: string, recordView = true) {
  const post = await db.query.blogPosts.findFirst({
    where: and(
      eq(blogPosts.app_id, 'balikin_id'),
      eq(blogPosts.slug, slug),
      eq(blogPosts.isPublished, true),
      isNull(blogPosts.deletedAt)
    ),
  });

  if (!post) return null;

  // Get comments for this post
  const comments = await db.query.blogComments.findMany({
    where: and(
      eq(blogComments.app_id, 'balikin_id'),
      eq(blogComments.postId, post.id),
    ),
  });
  const normalizedComments = comments.map((comment) => ({
    ...comment,
    parentId: comment.parentId ?? undefined,
    createdAt: comment.createdAt?.toISOString() ?? '',
  }));

  // Record page view for analytics
  if (recordView) {
    try {
      await db.insert(blogPostsAnalytics).values({
        app_id: 'balikin_id',
        postId: post.id,
        viewType: 'page_view',
        ipAddress: null, // Server-side, no IP available
      });
    } catch (error) {
      // Ignore analytics errors
      console.error('Failed to record page view:', error);
    }
  }

  return { post, comments: normalizedComments };
}

function generateJSONLD(post: any, modules: BlogModule[], slug: string): string {
  return JSON.stringify(buildBlogSchemas(post, modules, slug));
}

function splitTravelArticle(markdown: string, marker: RegExp): string[] {
  const blocks = markdown.split(/\n{2,}/);
  const markerIndex = blocks.findIndex((block) => marker.test(block));
  let splitIndex = markerIndex >= 0 ? markerIndex + 1 : -1;

  // If the expected passage changes, use the first complete section boundary.
  if (splitIndex < 0) {
    const headings = blocks
      .map((block, index) => (/^#{1,3}\s+/.test(block.trim()) ? index : -1))
      .filter((index) => index >= 0);
    if (headings.length > 1) splitIndex = headings[1];
    else if (blocks.length > 1) splitIndex = 1;
  }

  if (splitIndex <= 0 || splitIndex >= blocks.length) return [markdown];
  return [blocks.slice(0, splitIndex).join('\n\n'), blocks.slice(splitIndex).join('\n\n')];
}

function rewriteTravelPricingLinks(markdown: string, href: string): string {
  return markdown.replace(
    /\[(?:katalog produk|pricing)\]\(\/pricing(?:\s+"[^"]*")?\)/gi,
    `[lihat tag QR untuk koper](${href})`,
  );
}

function rewriteTravelCheckoutLinks(markdown: string, href: string): string {
  return markdown.replace(
    /\[checkout\]\(\/stickers\/checkout(?:\?[^)]*)?\)/gi,
    `[lihat tag QR untuk traveling](${href})`,
  );
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
          questions={module.questions.map(({ question, options }) => ({ question, options }))}
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

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const data = await getBlogPost(slug);

  if (!data || !data.post) {
    notFound();
  }

  const { post, comments } = data;
  const modules = post.modules as BlogModule[];
  const isTravelPillar = slug === 'panduan-keamanan-koper-saat-traveling';
  const isTravelSupporting = slug === 'tips-liburan-tenang-lindungi-koper-dan-paspor-tips-traveling-aman';
  const isTravelCampaignArticle = isTravelPillar || isTravelSupporting;
  const getQueryValue = (key: string) => {
    const value = query[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const campaignUrl = (placement: 'mid_cta' | 'end_cta' | 'legacy_link') => {
    const params = new URLSearchParams();
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'fbclid', 'gclid']) {
      const value = getQueryValue(key);
      if (value) params.set(key, value);
    }
    params.set('utm_source', params.get('utm_source') || 'blog');
    params.set('utm_medium', params.get('utm_medium') || (isTravelPillar ? 'pillar_article' : 'supporting_article'));
    params.set('utm_campaign', params.get('utm_campaign') || 'koper_traveling');
    params.set('utm_content', `${isTravelSupporting ? 'tips_liburan_tenang' : 'panduan_keamanan_koper'}_${placement}`);
    return `/koper-traveling?${params.toString()}`;
  };
  const articleContent = isTravelPillar
    ? rewriteTravelPricingLinks(post.content, campaignUrl('legacy_link'))
    : isTravelSupporting
      ? rewriteTravelCheckoutLinks(post.content, campaignUrl('legacy_link'))
      : post.content;

  // House-ad otomatis semua artikel (M1): <500 kata = akhir saja,
  // 500-1500 = atas+tengah+akhir, >1500 = atas+2 tengah+akhir.
  // Opt-out per-artikel: tambah modul `{ type: 'no_ads' }`.
  const showAds = !isTravelCampaignArticle && shouldShowHouseAds(modules as Array<{ type?: string }>);
  const visibleModules = isTravelCampaignArticle
    ? modules.filter((module) => module.type !== 'ad_baris')
    : modules;
  const wordCount = countWords(post.content);
  const isShort = wordCount < 500;
  const isLong = wordCount >= 1500;
  const contentParts: string[] = isTravelCampaignArticle
    ? splitTravelArticle(
        articleContent,
        isTravelPillar ? /identitas yang jelas pada koper/i : /penemu dapat memindai QR code tersebut/i,
      )
    : showAds && !isShort
      ? splitMarkdownBlocks(post.content, isLong ? 3 : 2)
      : [post.content];

  const markdownComponents = {
    h1: ({ node, ...props }: any) => <h1 className="blog-markdown-heading blog-markdown-h1" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="blog-markdown-heading blog-markdown-h2" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="blog-markdown-heading blog-markdown-h3" {...props} />,
    p: ({ node, ...props }: any) => <p className="blog-markdown-paragraph" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="blog-markdown-list blog-markdown-list-unordered" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="blog-markdown-list blog-markdown-list-ordered" {...props} />,
    li: ({ node, ...props }: any) => <li className="blog-markdown-item" {...props} />,
    a: ({ node, ...props }: any) => <a className="blog-markdown-link" {...props} />,
    blockquote: ({ node, ...props }: any) => <blockquote className="blog-markdown-quote" {...props} />,
    pre: ({ node, ...props }: any) => <pre className="blog-markdown-code" {...props} />,
  };

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

            {/* House-ad atas (artikel >=500 kata) */}
            {showAds && !isShort && <BlogHouseAd variant="top" />}

            {/* Markdown Content — disisipi house-ad tengah */}
            {contentParts.length === 1 ? (
              <div className="blog-markdown prose prose-lg max-w-none mb-8">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                  components={markdownComponents}
                >
                  {contentParts[0]}
                </ReactMarkdown>
              </div>
            ) : (
              <>
                <div className="blog-markdown prose prose-lg max-w-none mb-8">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={markdownComponents}
                  >
                    {contentParts[0]}
                  </ReactMarkdown>
                </div>
                {isTravelCampaignArticle && contentParts.length > 1 && <TravelCampaignCTA href={campaignUrl('mid_cta')} />}
                {showAds && <BlogHouseAd variant="mid" />}
                <div className="blog-markdown prose prose-lg max-w-none mb-8">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={markdownComponents}
                  >
                    {contentParts[1]}
                  </ReactMarkdown>
                </div>
                {contentParts[2] && (
                  <>
                    {showAds && <BlogHouseAd variant="mid" />}
                    <div className="blog-markdown prose prose-lg max-w-none mb-8">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        components={markdownComponents}
                      >
                        {contentParts[2]}
                      </ReactMarkdown>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Dynamic Modules (termasuk ad_baris manual bila ada) */}
            {visibleModules.map((module) => renderModule(module, post.id))}

            {/* House-ad akhir (semua artikel, kecuali opt-out) */}
            {showAds && <BlogHouseAd variant="end" />}
            {isTravelCampaignArticle && <TravelCampaignCTA href={campaignUrl('end_cta')} />}

            {/* Social Sharing */}
            <BlogSocialSharing
              url={absoluteUrl(`/blog/${post.slug}`)}
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

function TravelCampaignCTA({ href }: { href: string }) {
  return (
    <aside className="my-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Identitas digital untuk koper Anda</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Berikan koper jalur identitas dan kontak yang jelas.</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-slate-700 dark:text-slate-300">Saat dipindai, QR membuka halaman tag Balikin dan menampilkan opsi kontak yang tersedia. Tag ini bukan GPS dan tidak mencegah pencurian.</p>
      <Link href={href} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
        Kenali tag QR untuk traveling
      </Link>
    </aside>
  );
}

export async function generateMetadata({ params }: BlogPageProps) {
  const { slug } = await params;
  const data = await getBlogPost(slug, false);

  if (!data?.post) {
    return {};
  }

  const { post } = data;
  const baseUrl = getSiteUrl();

  // Generate OG image URL
  const ogImageUrl = new URL(`${baseUrl}/api/blog/og-image`);
  ogImageUrl.searchParams.set('title', post.title);
  if (post.summary) ogImageUrl.searchParams.set('summary', post.summary);
  if (post.authorName) ogImageUrl.searchParams.set('author', post.authorName);
  if (post.coverImage) ogImageUrl.searchParams.set('cover', post.coverImage);
  const socialImage = post.coverImage ? absoluteUrl(post.coverImage) : ogImageUrl.toString();

  return {
    title: post.title,
    description: post.metaDescription || post.summary,
    keywords: post.metaKeywords || post.focusKeyword,
    alternates: {
      canonical: absoluteUrl(`/blog/${post.slug}`),
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
