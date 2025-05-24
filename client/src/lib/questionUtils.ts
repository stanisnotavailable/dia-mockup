import questionsData from '@/data/questions.json';

/**
 * Interface for question data from the JSON file
 */
export interface QuestionData {
  id: string;
  name: string;
  score: number;
}

/**
 * Get a question by its ID from the allQuestions array
 * @param id The question ID to look up
 * @returns The question object or undefined if not found
 */
export const getQuestionById = (id: string): QuestionData | undefined => {
  return questionsData.allQuestions.find(q => q.id === id);
};

/**
 * Get the score for a question by its ID
 * @param id The question ID to look up
 * @returns The score value or 0 if the question is not found
 */
export const getQuestionScore = (id: string): number => {
  const question = getQuestionById(id);
  return question?.score || 0;
};

/**
 * Calculate the average score for an array of question IDs
 * @param questionIds Array of question IDs
 * @returns The average score or 0 if no questions are provided
 */
export const calculateAverageScore = (questionIds: string[]): number => {
  if (!questionIds || questionIds.length === 0) return 0;
  
  const sum = questionIds.reduce((total, id) => {
    return total + getQuestionScore(id);
  }, 0);
  
  return sum / questionIds.length;
};

/**
 * Get question name by ID
 * @param id The question ID
 * @returns The question name or a placeholder if not found
 */
export const getQuestionName = (id: string): string => {
  const question = getQuestionById(id);
  return question?.name || `Unknown Question (${id})`;
}; 