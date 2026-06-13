import { input } from "@inquirer/prompts";

export type UserInputOptions = {
  allowEmptyInput?: boolean;
  emptyInputMessage?: string;
};

export const userInput = async (
  question: string,
  options?: UserInputOptions,
): Promise<string> => {
  const answer = await input({
    message: question,
    validate: (value) => {
      if (!value.trim() && !options?.allowEmptyInput) {
        return options?.emptyInputMessage || "Input must not be empty";
      }
      return true;
    },
  });

  return answer;
};
