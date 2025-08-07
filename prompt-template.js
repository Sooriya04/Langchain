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
    `You are an ancient philosopher. Share a simple and easy-to-read philosophy based on the following concept: {input}`
  );

  const chain = prompt.pipe(model);

  const res = await chain.invoke({ input: "weight of regrets" });

  console.log(res.content);
})();
