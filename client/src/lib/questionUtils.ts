import questionsData from '@/data/questions.json';

/**
 * Interface for question data from the JSON file
 */
export interface QuestionData {
  id: string;
  name: string;
  score: number;
  canBeInCategories?: string[];
  cannotBeInCategories?: string[];
  initialProfile?: string[];
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

/**
 * Check if a question can be placed in a specific category
 * @param questionId The question ID
 * @param categoryName The category name to check against
 * @returns true if the question can be in the category, false otherwise
 */
export const canQuestionBeInCategory = (questionId: string, categoryName: string): boolean => {
  const question = getQuestionById(questionId);
  if (!question) return false;

  // Map category display names to JSON property names
  const categoryMapping: Record<string, string> = {
    'Healthcare Engagement': 'Healthcare Engagement',
    'Logistics Challenge': 'Logistical Challenge',
    'Quality of Life': 'QoL Impact',
    'Motivation': 'Motivation',
    'Uncategorized': 'Uncategorized'
  };

  const mappedCategoryName = categoryMapping[categoryName] || categoryName;

  // If cannotBeInCategories exists and contains this category, return false
  if (question.cannotBeInCategories && question.cannotBeInCategories.includes(mappedCategoryName)) {
    return false;
  }

  // If canBeInCategories exists, check if this category is in the list
  if (question.canBeInCategories && question.canBeInCategories.length > 0) {
    return question.canBeInCategories.includes(mappedCategoryName);
  }

  // If no restrictions are defined, allow it
  return true;
};

/**
 * Get the allowed categories for a question
 * @param questionId The question ID
 * @returns Array of category names the question can be placed in
 */
export const getAllowedCategories = (questionId: string): string[] => {
  const question = getQuestionById(questionId);
  if (!question) return [];

  const allCategories = ['Healthcare Engagement', 'Logistics Challenge', 'Quality of Life', 'Motivation'];
  
  // Map category display names to JSON property names for checking
  const categoryMapping: Record<string, string> = {
    'Healthcare Engagement': 'Healthcare Engagement',
    'Logistics Challenge': 'Logistical Challenge',
    'Quality of Life': 'QoL Impact',
    'Motivation': 'Motivation'
  };

  return allCategories.filter(category => {
    const mappedCategoryName = categoryMapping[category];
    
    // If cannotBeInCategories exists and contains this category, exclude it
    if (question.cannotBeInCategories && question.cannotBeInCategories.includes(mappedCategoryName)) {
      return false;
    }

    // If canBeInCategories exists, check if this category is in the list
    if (question.canBeInCategories && question.canBeInCategories.length > 0) {
      return question.canBeInCategories.includes(mappedCategoryName);
    }

    // If no restrictions are defined, allow it
    return true;
  });
};

/**
 * Get the forbidden categories for a question
 * @param questionId The question ID
 * @returns Array of category names the question cannot be placed in
 */
export const getForbiddenCategories = (questionId: string): string[] => {
  const question = getQuestionById(questionId);
  if (!question || !question.cannotBeInCategories) return [];

  // Map JSON property names back to display names
  const reverseMapping: Record<string, string> = {
    'Healthcare Engagement': 'Healthcare Engagement',
    'Logistical Challenge': 'Logistics Challenge',
    'QoL Impact': 'Quality of Life',
    'Motivation': 'Motivation'
  };

  return question.cannotBeInCategories.map(jsonCategory => reverseMapping[jsonCategory] || jsonCategory);
}; 