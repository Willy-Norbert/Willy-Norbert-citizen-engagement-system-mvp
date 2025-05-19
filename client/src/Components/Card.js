
import React from 'react'

const Card = ({title, description, borderColor, icon: Icon}) => {
  return (
    <div className="dashboard-card relative overflow-hidden p-6 rounded-lg shadow-md bg-white transition-all duration-300 hover:shadow-lg border-t-4 hover:transform hover:scale-102" style={{borderColor: borderColor}}>
      <div className="flex items-center mb-4">
        {Icon && <Icon className="mr-3" style={{color: borderColor}} size={24} />}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <p className="text-3xl font-semibold">{description}</p>
      <div className="absolute bottom-0 left-0 w-full h-1" style={{backgroundColor: borderColor}}></div>
    </div>
  )
}

export default Card
