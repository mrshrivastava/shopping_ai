'use client'
import React, { useState } from 'react'
import Link from 'next/link';

const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResults([])
    try {
      let response
      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        response = await fetch(`${baseURL}/search`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setResults(data.matches || data.results?.matches || []);
      } else if (query.trim()) {
        response = await fetch(
          `${baseURL}/search?query=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setResults(data.results || []);
      } else {
        alert('Please enter a query or upload an image.')
        setLoading(false)
        return
      }
    } catch (err) {
      console.error('Search error:', err)
      alert('Failed to search. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Search Products</h2>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or brand..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-3 py-2 rounded-lg flex-1"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((item, i) => {
            const prod = item.product || item
            return (
                <Link
                    key={i}
                    href={`/product/${encodeURIComponent(prod.id)}`}
                    className="block bg-white rounded-lg p-3 shadow-sm"
                >
                <div
                    key={prod.id || i}
                    className="bg-white shadow rounded-lg overflow-hidden">
                    <img
                    src={prod.featured_image}
                    alt={prod.title || 'Product'}
                    className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                    <p className="text-sm font-semibold truncate">
                        {prod.title || 'Untitled'}
                    </p>
                    <p className="text-xs text-gray-500">{prod.brand_name}</p>
                    </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  )
}
