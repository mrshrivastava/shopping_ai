'use client'
import React from 'react'

export default function LoadingSpinner(){ 
  return (
    <div className="flex items-center justify-center p-10">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin" />
    </div>
  )
}
