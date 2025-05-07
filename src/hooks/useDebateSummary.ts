'use client';

import { useCallback } from 'react';

interface Intervention {
  speaker: 'user' | 'ai';
  position: string;
  content: string;
  topic: string;
  turn: number;
}

interface DebateConfig {
  topic: string;
  positions: Record<string, string>;
}

/**
 * Custom hook for generating debate summaries based on interventions
 * 
 * @param interventions List of all debate interventions
 * @param debateConfig Debate configuration
 * @param opponentName Name of the AI opponent
 * @returns Object with function to generate summary
 */
export function useDebateSummary(
  interventions: Intervention[],
  debateConfig: DebateConfig,
  opponentName: string
) {
  /**
   * Generate a structured summary of the debate based on recorded interventions
   */
  const generateSummary = useCallback(async (): Promise<string> => {
    // Simulate API call delay
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        // If no interventions, return informative message
        if (interventions.length === 0) {
          resolve('There are no interventions in this debate yet.');
          return;
        }
        
        // Create a structured summary
        const topics = [...new Set(interventions.map(i => i.topic))];
        let summary = `Debate Summary: "${debateConfig.topic}"
\n`;
        summary += `Participants: User (${debateConfig.positions.user || 'For'}) vs ${opponentName} (${debateConfig.positions.ai || 'Against'})
\n`;
        
        // Summary by topics
        topics.forEach(topic => {
          const topicInterventions = interventions.filter(i => i.topic === topic);
          if (topicInterventions.length > 0) {
            summary += `\nTopic: ${topic}\n`;
            summary += '-------------------\n';
            
            // Group by turns
            const turns = [...new Set(topicInterventions.map(i => i.turn))];
            turns.forEach(turn => {
              const turnInterventions = topicInterventions.filter(i => i.turn === turn);
              summary += `\nTurn ${turn + 1}:\n`;
              
              turnInterventions.forEach(intervention => {
                const speakerName = intervention.speaker === 'user' ? 'User' : opponentName;
                // Truncate long content
                const contentPreview = intervention.content.length > 100 
                  ? `${intervention.content.substring(0, 100)}...` 
                  : intervention.content;
                summary += `- ${speakerName}: ${contentPreview}\n`;
              });
            });
          }
        });
        
        // Add conclusion
        summary += '\n\nGeneral Observations:\n';
        summary += `- This debate covered ${topics.length} topic(s)\n`;
        summary += `- Total interventions: ${interventions.length}\n`;
        summary += `- Predominant position: [Would be determined with deeper analysis]`;
        
        resolve(summary);
      }, 1500); // Simulate processing delay
    });
  }, [interventions, debateConfig, opponentName]);
  
  return { generateSummary };
}
