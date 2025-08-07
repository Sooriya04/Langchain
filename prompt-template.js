require("dotenv").config();

(async () => {
  const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
  const { ChatPromptTemplate } = await import("@langchain/core/prompts");

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.7,
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = ChatPromptTemplate.fromTemplate(
    `You are an ancient philosophers. Tell a philosophy based on the following word: {input} simple and easy to read`
  );

  const formattedPrompt = await prompt.format({ input: "weigth of regrets" });

  const res = await model.invoke(formattedPrompt);
  console.log(res.content);
})();
