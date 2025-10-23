'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image';

export default function ProductCard({ item }) {
  return (
    <Link href={`/post/${item.id}`} className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
      
        <div className="h-56 bg-gray-100 flex items-center justify-center">
          <Image src={item.image_url} alt={item.title||item.caption||'Post'} width={400} height={400} className="object-cover h-full w-full" />
        </div>
        {/* <div className="p-3">
          <h3 className="font-semibold text-sm truncate">{item.title || item.caption || 'Untitled'}</h3>
          <p className="text-xs text-gray-500">{item.user_handle || item.user_name || ''}</p>
        </div> */}
      
    </Link>
  )
}
