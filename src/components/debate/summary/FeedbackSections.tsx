'use client';

import SummarySection from './SummarySection';
import HighlightBox from './HighlightBox';

interface FeedbackData {
  strengths: string;
  weaknesses: string;
  highlights: string;
  recommendations: string;
}

interface FeedbackSectionsProps {
  data: FeedbackData;
}

// Icon component for the highlights section
const StarIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-3.5 w-3.5" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
    />
  </svg>
);

/**
 * Component to display all feedback sections from debate analysis
 * Organizes content into clearly separated sections:
 * 1. Text feedback (strengths, weaknesses, recommendations)
 * 2. Highlighted key moments
 */
export default function FeedbackSections({ data }: FeedbackSectionsProps) {
  return (
    <div className="flex flex-col space-y-8">
      {/* SECTION 1: Regular text feedback */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-6">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-4">
          Performance Feedback
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <SummarySection 
              title="Strengths" 
              content={data.strengths} 
            />
            
            <SummarySection 
              title="Areas for Improvement" 
              content={data.weaknesses} 
            />
          </div>
          
          {/* Right column */}
          <div>
            <SummarySection 
              title="Recommendations" 
              content={data.recommendations} 
            />
          </div>
        </div>
      </div>
      
      {/* SECTION 2: Highlighted key moments */}
      <div>
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-4">
          Debate Highlights
        </h3>
        
        <HighlightBox
          title="Standout Contributions"
          content={data.highlights}
          icon={<StarIcon />}
        />
      </div>
    </div>
  );
}
