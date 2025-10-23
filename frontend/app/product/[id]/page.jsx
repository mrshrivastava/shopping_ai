'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import API from '@lib/api';

export default function ProductPage(){
  const params = useParams();
  const id = params.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ fetchPost(); }, [id]);
  async function fetchPost(){
    try{ 
      setLoading(true); 
      console.log("Fetching product with id:", id);
      const res = await API.get(`/products/${id}`); 
      console.log(res);
      const data = res.data.product || res.data; 
      setProduct(data); 
      console.log(product)
    }
    catch(e){ 
      console.error(e) 
    }
    finally{ 
      setLoading(false)  
    }
  }
  return (
  <div className="max-w-6xl mx-auto px-6 py-12">
    {loading ? (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg animate-pulse">Loading product...</p>
      </div>
    ) : !product ? (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Product not found 😢</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left: Product Image */}
        <div className="w-full">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={product.featured_image}
              alt={product.title || "Product Image"}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {product.title || "Untitled Product"}
            </h1>
            <p className="text-gray-500 text-lg">
              Brand:{" "}
              <span className="font-semibold text-gray-800">
                {product.brand_name || "Unknown"}
              </span>
            </p>
          </div>

          <p className="text-3xl font-semibold text-green-600">
            ₹{product.lowest_price ? product.lowest_price.toLocaleString() : "—"}
          </p>

          <p className="text-gray-700 leading-relaxed">
            {product.description ||
              "This product is a high-quality item designed with premium materials and attention to detail. More information will be available soon."}
          </p>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Product ID:{" "}
              <span className="text-gray-700 font-medium">{product.sku_id}</span>
            </p>
            {/* <p className="text-sm text-gray-400 mt-1">
              Details will be populated from the similar-products response.
            </p> */}
          </div>

          <div className="pt-6">
            <button className="bg-blue-800 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold shadow transition">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

}
