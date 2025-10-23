'use client'
import React from 'react'

export default function DotOverlay({ detections, imgWidth, imgHeight, displayWidth, displayHeight, onDotPress }) {
  if(!detections) {console.log("not detected");return null};
  return (
    <div style={{ position:'absolute', left:0, top:0, width: displayWidth, height: displayHeight }}>
      {detections.map((d, i)=> {
        const scaleX = displayWidth / (imgWidth || displayWidth);
        const scaleY = displayHeight / (imgHeight || displayHeight);
        const left = (d.x - d.width/2) * scaleX;
        const top = (d.y - d.height/2) * scaleY;
        return (
          <button className='Dotttt' key={d.detection_id || d.id || i}
            onClick={()=> onDotPress(d)}
            style={{
              position:'absolute',
              left,
              top,
              width:d.width * scaleX,
              height:d.height * scaleY,
              borderRadius:9,
              border:'2px solid white',
              boxShadow:'0 2px 6px rgba(0,0,0,0.2)'
            }}
            aria-label={'detection-'+i}
          ></button>
        )
      })}
    </div>
  )
}
