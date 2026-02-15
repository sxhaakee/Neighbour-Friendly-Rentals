import Link from 'next/link';
import Image from 'next/image';
import { blogPosts } from '@/data/blogPosts';


export const metadata = {
    title: 'NFR Blog | Turn Clutter into Cash in Bangalore',
    description: 'Tips, tricks, and stories about the rental economy in Bangalore. Learn how to earn passive income from your household items.',
};

export default function BlogIndex() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">


            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-20 px-4">
                    <div className="container mx-auto max-w-6xl text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                            The NFR Blog
                        </h1>
                        <p className="text-xl md:text-2xl text-amber-100 max-w-2xl mx-auto">
                            Stories from Bangalore's sharing economy. Learn how to earn, save, and connect.
                        </p>
                    </div>
                </section>

                {/* Blog Grid */}
                <section className="py-16 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogPosts.map((post) => (
                                <article key={post.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 flex flex-col h-full">
                                    <Link href={`/blog/${post.slug}`} className="block relative h-56 w-full overflow-hidden">
                                        <Image
                                            src={post.image}
                                            alt={post.title}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </Link>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                                            <span>{post.date}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{post.readTime}</span>
                                        </div>

                                        <Link href={`/blog/${post.slug}`} className="block group">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">
                                                {post.title}
                                            </h2>
                                        </Link>

                                        <p className="text-gray-600 mb-6 line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <div className="mt-auto">
                                            <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700">
                                                Read Article
                                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter / CTA */}
                <section className="bg-gray-900 text-white py-16 px-4">
                    <div className="container mx-auto max-w-4xl text-center">
                        <h2 className="text-3xl font-bold mb-4">Start earning from your idle items today</h2>
                        <p className="text-gray-400 mb-8 text-lg">Join 10,000+ Bangaloreans sharing and earning on NFR.</p>
                        <Link href="/add-item" className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 px-10 rounded-full text-lg transition-transform hover:-translate-y-1 inline-block shadow-lg shadow-amber-500/20">
                            List Your First Item
                        </Link>
                    </div>
                </section>
            </main>


        </div>
    );
}
