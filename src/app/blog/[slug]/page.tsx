import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { blogPosts } from '@/data/blogPosts';


interface Props {
    params: {
        slug: string;
    };
}

// Generate static params for all posts - great for SEO!
export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

export function generateMetadata({ params }: Props) {
    const post = blogPosts.find((p) => p.slug === params.slug);
    if (!post) return;

    return {
        title: `${post.title} | NFR Blog`,
        description: post.excerpt,
        openGraph: {
            images: [post.image],
        },
    };
}

export default function BlogPost({ params }: Props) {
    const post = blogPosts.find((p) => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">


            <main className="flex-grow">
                {/* Article Header */}
                <header className="pt-24 pb-12 px-4 bg-gray-50 border-b border-gray-100">
                    <div className="container mx-auto max-w-4xl text-center">
                        <div className="flex items-center justify-center space-x-2 mb-6">
                            {post.tags.map(tag => (
                                <span key={tag} className="text-amber-600 font-bold uppercase tracking-wider text-xs bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-center space-x-6 text-gray-500 text-sm md:text-base border-t border-gray-200 pt-8 inline-flex px-8">
                            <span className="font-medium text-gray-900">{post.author}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>{post.date}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>{post.readTime}</span>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                <div className="w-full h-[50vh] min-h-[400px] relative">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Content */}
                <article className="container mx-auto max-w-3xl px-4 py-16">
                    <div
                        className="prose prose-lg md:prose-xl prose-amber mx-auto text-gray-700
                prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tight
                prose-p:leading-relaxed prose-img:rounded-xl prose-img:shadow-lg
                prose-li:marker:text-amber-500"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>

                {/* Author / CTA Box */}
                <section className="bg-amber-50 py-16 px-4 mt-8 border-t border-amber-100">
                    <div className="container mx-auto max-w-3xl bg-white rounded-2xl shadow-sm border border-amber-100 p-8 md:p-12 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Enjoyed this read?</h3>
                        <p className="text-gray-600 mb-8 text-lg">Join the NeighbourFriendly community and start earning from your idle items today.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/add-item" className="bg-amber-600 text-white font-bold py-3 px-8 rounded-full hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20">
                                List an Item
                            </Link>
                            <Link href="/items" className="bg-white text-gray-700 border-2 border-gray-200 font-bold py-3 px-8 rounded-full hover:bg-gray-50 transition-colors">
                                Browse Rentals
                            </Link>
                        </div>
                    </div>
                </section>
            </main>


        </div>
    );
}
