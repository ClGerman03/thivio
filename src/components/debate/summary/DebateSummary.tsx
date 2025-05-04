'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SummarySection from './SummarySection';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  BarChart, 
  XAxis, 
  YAxis, 
  Bar, 
  Tooltip,
  Cell
} from 'recharts';

type DebateSummaryProps = {
  debateConfig: {
    topic: string;
    debateType: string;
    userRole: string;
  };
  onFinish: () => void;
};

export default function DebateSummary({ debateConfig, onFinish }: DebateSummaryProps) {
  const router = useRouter();

  const handleFinish = () => {
    // Call the original onFinish callback if needed
    if (onFinish) {
      onFinish();
    }
    
    // Navigate to dashboard
    router.push('/dashboard');
  };
  
  // In a real scenario, this data would come from API or context
  const sampleData = {
    strengths: "Clear structure with effective use of examples. Excellent refutation skills when addressing economic points.",
    weaknesses: "Occasional repetition of key points and excessive time spent on introductions.",
    highlights: "The analogy about educational systems was particularly effective and provided a memorable closing argument.",
    score: 85,
    recommendations: "Consider preparing more statistical data to support your arguments and practice more concise responses."
  };

  // Data for radar chart
  const performanceData = [
    { area: 'Clarity', value: 80 },
    { area: 'Structure', value: 85 },
    { area: 'Argumentation', value: 90 },
    { area: 'Response', value: 75 },
    { area: 'Conciseness', value: 60 },
    { area: 'Resources', value: 70 },
  ];

  // Data for bar chart
  const categoryData = [
    { name: 'Content', value: 85, color: '#333333' },
    { name: 'Structure', value: 75, color: '#555555' },
    { name: 'Style', value: 90, color: '#777777' },
    { name: 'Refutation', value: 80, color: '#999999' }
  ];

  return (
    <div className="w-full max-w-4xl py-6 px-4 mx-auto">
      <header className="mb-10 border-b border-gray-100 dark:border-gray-800 pb-4">
        <h1 className="text-2xl font-light text-gray-800 dark:text-white mb-1 text-center">
          Debate Analysis
        </h1>
        <h2 className="text-md text-gray-500 dark:text-gray-400 font-light text-center">
          {debateConfig.topic}
        </h2>
      </header>

      <div className="space-y-12">
        {/* Score section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-gray-700 dark:border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-light text-gray-800 dark:text-white">
                  {sampleData.score}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 px-3 py-1 text-xs text-gray-500 dark:text-gray-400 rounded-full">
              Score
            </div>
          </div>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 max-w-md">
            This score reflects your overall performance in the debate about {debateConfig.topic}, 
            where you participated as <span className="text-gray-800 dark:text-gray-200">{debateConfig.userRole}</span>.
          </p>
        </div>

        {/* Charts section */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Radar chart */}
          <div className="w-full md:w-1/2 h-64 md:h-72">
            <h3 className="text-sm font-medium text-center text-gray-800 dark:text-gray-300 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
              Skills Profile
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="70%" data={performanceData}>
                <PolarGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="area" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#333333"
                  fill="#333333"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Bar chart */}
          <div className="w-full md:w-1/2 h-64 md:h-72">
            <h3 className="text-sm font-medium text-center text-gray-800 dark:text-gray-300 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
              Main Categories
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={categoryData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  width={80}
                />
                <Tooltip 
                  formatter={(value) => [`${value} points`, '']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]} 
                  barSize={12}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Text sections - single column */}
        <div className="space-y-2">
          <SummarySection 
            title="Strengths" 
            content={sampleData.strengths}
          />
          
          <SummarySection 
            title="Areas for Improvement" 
            content={sampleData.weaknesses}
          />
          
          <SummarySection 
            title="Highlights" 
            content={sampleData.highlights}
          />
          
          <SummarySection 
            title="Recommendations" 
            content={sampleData.recommendations}
          />
        </div>
      </div>

      {/* Button to finish */}
      <div className="mt-12 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-light"
          onClick={handleFinish}
        >
          Back to Dashboard
        </motion.button>
      </div>
    </div>
  );
}
