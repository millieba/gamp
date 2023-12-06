import React from 'react';

interface StatBoxProps {
  title: string;
  description: string;
}

const StatBox: React.FC<StatBoxProps> = ({ title, description }) => {

    const gradientColor = 'bg-gradient-to-tr from-gray-700 to-slate-900';
    return (
        <div className={`p-8 m-2 rounded-lg shadow-md ${gradientColor}`}>
            <h1 className="text-2xl font-bold mb-4 pr-4 text-white">{title}</h1>
            <p className="text-white pr-4">{description}</p>
        </div>
  );
}

export default StatBox;
