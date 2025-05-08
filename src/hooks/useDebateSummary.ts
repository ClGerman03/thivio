'use client';

import { useCallback } from 'react';

interface Intervention {
  speaker: 'user' | 'ai';
  position: string;
  content: string;
  topic: string;
  turn: number;
}

interface DebateSkill {
  skill: string;
  value: number;
}

interface DebateSummaryData {
  score: number;
  strengths: string;
  weaknesses: string;
  highlights: string;
  recommendations: string;
  skills: DebateSkill[];
}

interface DebateConfig {
  topic?: string;
  topics?: string[];
  positions: Record<string, string>;
  debateFormat?: string;
}

/**
 * Custom hook for generating debate summaries based on interventions
 * 
 * @param interventions List of all debate interventions
 * @param debateConfig Debate configuration
 * @returns Object with function to generate summary
 */
export function useDebateSummary(
  interventions: Intervention[],
  debateConfig: DebateConfig
) {
  /**
 * Generate a structured summary of the debate based on recorded interventions
 * @returns Promise with a structured debate summary data object
 */
const generateSummary = useCallback(async (): Promise<DebateSummaryData> => {
  // Simulate API call delay - in a real implementation this would call Gemini API
  return new Promise<DebateSummaryData>((resolve) => {
    setTimeout(() => {
      // If no interventions, return default summary
      if (interventions.length === 0) {
        resolve({
          score: 0,
          strengths: 'No debate data available for analysis.',
          weaknesses: 'No debate data available for analysis.',
          highlights: 'No debate data available for analysis.',
          recommendations: 'Start a debate to get AI-powered feedback.',
          skills: [
            { skill: 'Content', value: 0 },
            { skill: 'Structure', value: 0 },
            { skill: 'Style', value: 0 },
            { skill: 'Arguments', value: 0 },
            { skill: 'Response', value: 0 },
            { skill: 'Clarity', value: 0 }
          ]
        });
        return;
      }
      
      // Get all unique topics from interventions
      const topics = [...new Set(interventions.map(i => i.topic))];
      
      // Count interventions by speaker to analyze participation
      const userInterventions = interventions.filter(i => i.speaker === 'user');
      const aiInterventions = interventions.filter(i => i.speaker === 'ai');
      
      // Calculate average content length as a proxy for detail level
      const userAvgLength = userInterventions.reduce((acc, i) => acc + i.content.length, 0) / userInterventions.length || 0;
      
      // Base score calculation - this would be more sophisticated with Gemini
      const baseScore = Math.min(Math.round(55 + (userInterventions.length * 5) + (userAvgLength / 50)), 95);
      
      // Generate insights based on debate data
      // In a real implementation, these would come from Gemini's analysis
      let topStrengths = 'Clear structure with effective examples. ';
      if (userInterventions.length > 2) {
        topStrengths += 'Good participation throughout the debate. ';
      }
      if (userAvgLength > 150) {
        topStrengths += 'Detailed and thorough responses provided.';
      }
      
      let topWeaknesses = 'Some points could be supported with more evidence. ';
      if (userInterventions.length < aiInterventions.length) {
        topWeaknesses += 'Participation could be more consistent. ';
      }
      if (userAvgLength < 100) {
        topWeaknesses += 'Responses could be more detailed in some areas.';
      }
      
      // Generate skills assessment
      // In a real implementation, these scores would be calculated by Gemini
      const contentScore = Math.min(Math.round(60 + (userAvgLength / 20)), 95);
      const structureScore = Math.min(Math.round(70 + (topics.length * 5)), 95);
      const argumentsScore = Math.min(Math.round(65 + (userInterventions.length * 3)), 95);
      const responseScore = Math.min(75 + (interventions.length % 10), 90);
      
      // Create the structured summary data
      const summaryData: DebateSummaryData = {
        score: baseScore,
        strengths: topStrengths,
        weaknesses: topWeaknesses,
        highlights: `You debated on ${topics.length} topic(s) with ${userInterventions.length} contributions. Your strongest points were made on the topic of ${topics[0] || 'the main subject'}.`,
        recommendations: `Consider reinforcing arguments with data. Focus on responding to counterpoints more directly. ${userInterventions.length < 3 ? 'Aim for more participation in future debates.' : 'Good level of engagement shown.'}`,
        skills: [
          { skill: 'Content', value: contentScore },
          { skill: 'Structure', value: structureScore },
          { skill: 'Style', value: Math.round(65 + Math.random() * 20) },
          { skill: 'Arguments', value: argumentsScore },
          { skill: 'Response', value: responseScore },
          { skill: 'Clarity', value: Math.round(70 + Math.random() * 15) }
        ]
      };
      
      resolve(summaryData);
    }, 1500); // Simulate processing delay
  });
}, [interventions]);
  
  /**
 * Generate a text-only summary for simpler use cases
 * @returns Promise with a string summary
 */
const generateTextSummary = useCallback(async (): Promise<string> => {
  const summaryData = await generateSummary();
  
  // Format the summary data as text
  const topicText = debateConfig.topics ? 
    `Topics: ${debateConfig.topics.join(', ')}` : 
    `Topic: ${debateConfig.topic || 'N/A'}`;
  
  let summary = `Debate Summary - Score: ${summaryData.score}/100\n\n`;
  summary += `${topicText}\n`;
  summary += `Format: ${debateConfig.debateFormat || 'Standard'}\n\n`;
  summary += `Strengths:\n${summaryData.strengths}\n\n`;
  summary += `Areas for Improvement:\n${summaryData.weaknesses}\n\n`;
  summary += `Highlights:\n${summaryData.highlights}\n\n`;
  summary += `Recommendations:\n${summaryData.recommendations}`;
  
  return summary;
}, [generateSummary, debateConfig]);

return { generateSummary, generateTextSummary };
}
