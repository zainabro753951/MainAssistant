import React from 'react'
import { PropagateLoader } from 'react-spinners'

const ThemeReloader = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <PropagateLoader color="#3f3eed" size={20} />
    </div>
  )
}

export default ThemeReloader
