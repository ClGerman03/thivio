'use client';

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
  PolarRadiusAxis
} from 'recharts';

// Chart color theme - minimalist dark aesthetic
const chartColors = {
  primary: '#27272a', // Zinc 800 - main dark color
  secondary: '#52525b', // Zinc 600 - secondary accent
  background: 'rgba(63, 63, 70, 0.12)', // Lighter background for better contrast
  text: '#18181b', // Zinc 900 - very dark text
  lightText: '#71717a', // Zinc 500 - lighter text for secondary elements
  grid: 'rgba(212, 212, 216, 0.5)', // Subtle grid lines
  highlight: '#404040', // Gray 700 - for highlights
};

interface SkillData {
  skill: string;
  value: number;
}

interface SkillsRadarChartProps {
  skills: SkillData[];
  overallScore?: number;
}

/**
 * Radar chart component that visualizes debate skills
 */
export default function SkillsRadarChart({ skills, overallScore }: SkillsRadarChartProps) {
  // Calculate the average score if none is provided
  const calculatedScore = overallScore || (
    skills[0]?.value 
      ? Math.round(skills.reduce((acc, curr) => acc + curr.value, 0) / skills.length) 
      : 0
  );
  
  // Find highest and lowest skill values for visual emphasis
  const maxSkill = skills.length > 0 ? Math.max(...skills.map(s => s.value)) : 0;
  const minSkill = skills.length > 0 ? Math.min(...skills.map(s => s.value)) : 0;
  
  // Get top skills (those within 10 points of the maximum)
  const topSkills = skills
    .filter(s => s.value >= maxSkill - 10)
    .map(s => s.skill)
    .join(', ');
    
  return (
    <div className="bg-white dark:bg-gray-800/30 rounded-lg shadow-sm overflow-hidden">
      {/* Score display at the top with minimal styling */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700/30">
        <div>
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-300">Skills Profile</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Top: {topSkills || 'None'}
          </p>
        </div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800/60 mr-2">
            <span className="text-xl font-medium text-gray-800 dark:text-gray-200">{calculatedScore}</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">/100</span>
        </div>
      </div>
      
      {/* Radar chart with minimal styling */}
      <div className="h-56 w-full px-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart 
            outerRadius="68%" 
            data={skills}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <PolarGrid 
              stroke={chartColors.grid} 
              strokeDasharray="2 4" 
              gridType="circle"
            />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ 
                fill: chartColors.lightText, 
                fontSize: 10,
                fontWeight: 500 
              }}
              strokeOpacity={0}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tickCount={3} 
              tick={false} 
              axisLine={false}
              stroke={chartColors.grid}
              opacity={0.4}
            />
            <Tooltip 
              formatter={(value) => [`${value}/100`, '']}
              contentStyle={{ 
                backgroundColor: '#fafafa', 
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                fontSize: '11px',
                border: 'none',
                padding: '4px 8px',
                color: chartColors.text
              }} 
              itemStyle={{
                color: chartColors.text,
                padding: '2px 0',
                fontWeight: 500
              }}
              cursor={false}
            />
            <Radar 
              name="Skills" 
              dataKey="value" 
              stroke={chartColors.primary} 
              fill={chartColors.background} 
              fillOpacity={0.75}
              strokeWidth={1.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Bottom legend with skill distribution indicators */}
      <div className="px-4 pt-0 pb-3 flex justify-between border-t border-gray-50 dark:border-gray-800/30 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mr-1"></span> Min: {minSkill}
        </div>
        <div className="flex items-center">
          <span className="mr-1">Avg: {calculatedScore}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 bg-gray-700 dark:bg-gray-300 rounded-full mr-1"></span> Max: {maxSkill}
        </div>
      </div>
    </div>
  );
}
