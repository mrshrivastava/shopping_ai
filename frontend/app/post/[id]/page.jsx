'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
// import API from '../../lib/api';
import API from '@lib/api';
import LoadingSpinner from '@components/LoadingSpinner';
import DotOverlay from '@components/DotOverlay';
import Link from 'next/link';
import Image from 'next/image';

export default function PostDetail(){
  const params = useParams();
  const id = params.id;
  const [post, setPost] = useState(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [similar, setSimilar] = useState([]);
  const [selected, setSelected] = useState(null);
  const imgRef = useRef(null);
  const[showSimilar,setShowSimilar]=useState(false);

  useEffect(()=>{ fetchPost(); }, [id]);

  async function fetchPost(){
    try{ 
      setLoading(true); 
      const res = await API.get(`/posts/${id}`); 
      const data = res.data.post || res.data; 
      setPost(data); 
      setDetections(res.data.detections) 
      console.log(post)
    }
    catch(e){ 
      console.error(e) 
    }
    finally{ 
      setLoading(false)  
    }
  }

  async function onDotPress(dot){ 
    setSelected(dot); 
    try{ 
      const dotId = parseInt(dot.id, 10);
      const res = await API.get(`/posts/${id}/similar`, { params: { dotId: dot.detection_id || dot.id }});
      setSimilar(res.data.matches || []); 
      setShowSimilar(true);
    }catch(e){
      console.error(e) 
    } 
  }

  if(loading) return <LoadingSpinner />;
  if(!post) return <div>Post not found</div>;

  const imgW = post.image_width || post.image_height ? post.image_width : 1000;
  const imgH = post.image_height || post.image_width ? post.image_height : 667;
  const displayW = Math.min(900,  window.innerWidth - 40);
  const displayH = Math.round(displayW * (imgH/imgW));

  return (
    <div>
      {loading ? <LoadingSpinner/> : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden relative" style={{ width: displayW }}>

            <Image
              src={post.image_url}
              alt="Instagram image"
              width={imgW} height={imgH} className="object-cover h-full w-full"
            />
            <DotOverlay className="dotClass" detections={detections} imgWidth={imgW} imgHeight={imgH} displayWidth={displayW} displayHeight={displayH} onDotPress={onDotPress} />
          </div>

          <div className="mt-6">

            {!showSimilar ? <></> : (
              similar === null ? <><h3 className="text-lg font-semibold mb-3">Couldn't find similar products. No worries, we got you with our fresh collections</h3></> : (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Similar products</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {similar.map((s, i) => {
                      const prod = s.product || s;
                      return (
                        <Link
                          key={i}
                          href={`/product/${encodeURIComponent(prod.id)}`}
                          className="block bg-white rounded-lg p-3 shadow-sm"
                        >
                          <Image
                            src={prod.featured_image}
                            alt="image"
                            className="h-40 w-full object-cover mb-2"
                            width={200}
                            height={200}
                          />
                          <div className="text-sm font-medium">{prod.title}</div>
                          <div className="text-xs text-gray-500">{prod.brand_name}</div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        </>
    )}
    </div>
  )
}
