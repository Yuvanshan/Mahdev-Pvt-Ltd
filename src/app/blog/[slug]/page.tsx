'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, User, ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BlogDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        const snap = await getDoc(doc(db, 'blogs', slug));
        if (snap.exists()) {
          setBlog(snap.data());
        }
      } catch (err) {
        console.error("Failed to query blog article", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-dark flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-10 h-10 border-2 border-gold-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Querying article context...</span>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-navy-dark flex flex-col items-center justify-center gap-6 text-white px-6">
        <h3 className="font-display font-black text-2xl text-red-500 uppercase tracking-wider">Article Not Found</h3>
        <p className="text-xs text-gray-400 font-sans max-w-sm text-center">The article reference `{slug}` was not found in our database.</p>
        <button
          onClick={() => router.push('/blog')}
          className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white font-sans font-bold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO BLOGS
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-32 pb-24 text-white text-left">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => router.push('/blog')}
            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-bold text-gray-300 flex items-center gap-2 mb-8 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-gold-accent" /> BACK TO DIRECTORY
          </button>

          {/* Banner Image */}
          <div className="relative h-[250px] sm:h-[450px] w-full rounded-3xl overflow-hidden border border-white/10 mb-8 shadow-2xl">
            <Image 
              src={blog.image || '/images/sws_robot_decor_1783346269673.jpg'} 
              alt={blog.title} 
              fill 
              className="object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/10 to-transparent" />
          </div>

          {/* Article Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 font-sans">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gold-accent" /> {blog.date}</span>
            <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-gold-accent" /> {blog.author}</span>
            <span className="px-2.5 py-0.5 rounded bg-white/5 text-[10px] text-gold-soft font-bold uppercase tracking-wider">{blog.category}</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight mb-8">
            {blog.title}
          </h1>

          {/* Article Body */}
          <article className="font-sans text-sm sm:text-base text-gray-300 leading-relaxed space-y-6 border-t border-white/5 pt-8">
            <p className="whitespace-pre-wrap">{blog.content}</p>
            
            <p className="text-xs text-gray-500 italic mt-12">
              Note: This is a certified corporate article published by the executive board office of Mahdev Pvt Ltd. For inquiries on logistics, software specifications, or event coordination details derived from this article, kindly file a message via our contacts form or WhatsApp lines.
            </p>
          </article>
        </div>
      </main>

      <Footer />
    </>
  );
}
