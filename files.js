(async () => {
  const fs = require("fs");
  const { pdfParse } = await import("pdf-parse");
  const { Document } = await import("langchain/document");
  const { RecursiveCharacterTextSplitter } = await import(
    "langchain/text_splitter"
  );

  const fileBuffer = fs.readFileSync("berserk.pdf");
  const data = await pdfParse(fileBuffer);
  const rawText = data.text;

  const docs = [
    new Document({
      pageContent: rawText,
      metadata: { source: "berserk.pdf" },
    }),
  ];

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  const splitDocs = await splitter.splitDocuments(docs);

  // 4. Show the result
  console.log("Total Chunks:", splitDocs.length);
  console.log("\nFirst Chunk:\n");
  console.log(splitDocs[0].pageContent);
})();
