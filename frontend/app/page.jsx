// 'use client'
// import React, { useEffect, useState } from 'react';
// import API from '../lib/api';
// import ProductCard from '../components/ProductCard';
// import LoadingSpinner from '../components/LoadingSpinner';

// export default function HomePage(){
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [query, setQuery] = useState('');

//   useEffect(()=>{ fetchPosts(); }, []);

//   async function fetchPosts(){
//     try{
//       setLoading(true);
//       const res = await API.get('/posts');
//       const data = res.data;
//       console.log('Fetched posts:', data);
//       const list = Array.isArray(data) ? data : (data.posts || []);
//       // const filtered = list.filter(p => p.detections && p.detections.length > 0);
//       setPosts(list);
//     }catch(e){ console.error(e) }finally{ setLoading(false) }
//   }

//   const filteredPosts = posts.filter(p => {
//     if(!query) return true;
//     const q = query.toLowerCase();
//     return (p.title||p.caption||'').toLowerCase().includes(q) ||
//            (p.user_handle||'').toLowerCase().includes(q);
//   });

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold">Discover</h2>
//       </div>

//       {loading ? <LoadingSpinner /> : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {filteredPosts.map(p=> <ProductCard key={p.id} item={p} />)}
//         </div>
//       )}
//     </div>
//   )
// }


'use client'
import React, { useEffect, useState, useRef, useCallback} from 'react';
import API from '../lib/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductGrid() {
  const [posts, setPosts] = useState([])              // all loaded products
  const [page, setPage] = useState(1)                 // current page number
  const [loading, setLoading] = useState(true)        // initial loading spinner
  const [loadingMore, setLoadingMore] = useState(false) // scroll loader
  const [hasMore, setHasMore] = useState(true)        // track if more products exist

  const observer = useRef(null)

  // Fetch products (paginated)
  const fetchProducts = async (pageNumber = 1) => {
    try {
      const res = await fetch(`http://localhost:5000/posts?page=${pageNumber}`)
      const data = await res.json()
      if (!data || data.length === 0) {
        setHasMore(false)
        return
      }
      setPosts(prev => [...prev, ...data.posts])
    } catch (err) {
      console.error('❌ Error fetching products:', err)
    }
  }

  // Load initial products
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true)
      await fetchProducts(1)
      setLoading(false)
    }
    loadInitial()
  }, [])

  // IntersectionObserver: load more when last card is visible
  const lastPostRef = useCallback(node => {
    if (loadingMore) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setLoadingMore(true)
        setPage(prev => prev + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [loadingMore, hasMore])

  // Fetch next page when page state changes
  useEffect(() => {
    if (page === 1) return
    const loadMore = async () => {
      await fetchProducts(page)
      setLoadingMore(false)
    }
    loadMore()
  }, [page])

  return (
    <div className="p-6">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Discover</h2>      
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((p, i) => {
              if (i === posts.length - 1) {
                // Attach observer to the last product card
                return <div ref={lastPostRef} key={p.id}><ProductCard item={p} /></div>
              }
              return <ProductCard key={p.id} item={p} />
            })}
          </div>

          {loadingMore && (
            <div className="flex justify-center mt-6">
              <LoadingSpinner />
            </div>
          )}

          {!hasMore && (
            <p className="text-center text-gray-500 mt-6">No more products</p>
          )}
        </>
      )}
    </div>
  )
}
