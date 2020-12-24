"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const fetch = require("node-fetch");
const articleExtractor = require("article-parser").extract;
const contentExtractor = require("node-article-extractor");
const summarizeText = require("./summarizer");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
app.use(express.json());

const corsOptions = {
  origin: "https://createsummary.herokuapp.com/",
  optionsSuccessStatus: 200,
};

app.post("/document", cors(corsOptions), extractText, (req, res) => {
  const text = res.locals.text;
  try {
    const summary = summarizeText(text);
    res.status(200).json({
      summary,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.post("/article", cors(corsOptions), extractArticle, (req, res) => {
  const data = res.locals.data;
  try {
    const summary = summarizeText(data.text);
    data.text = summary;
    data.type = "article";
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.post("/text", cors(corsOptions), (req, res) => {
  try {
    const text = req.body.payload;
    const summary = summarizeText(text);
    res.status(200).json({
      summary,
      type: "text",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

async function extractText(req, res, next) {
  if (!req.files)
    return res.status(400).json({
      message: "Please select a document to summarize",
    });

  const document = req.files.document;

  const extractExtension = () => {
    const startIndex = document.name.lastIndexOf(".") + 1;
    const extension = document.name.substring(startIndex);
    return extension;
  };

  try {
    if (document.mimetype === "text/plain")
      res.locals.text = document.data.toString("UTF-8");
    else if (document.mimetype === "application/pdf") {
      const data = await pdf(document.data);
      res.locals.text = data.text;
    } else if (["doc", "docx"].includes(extractExtension())) {
      const data = await mammoth.extractRawText({
        buffer: document.data,
      });
      res.locals.text = data.value;
    } else
      return res.status(400).json({
        message:
          "Incorrect document type, only PDF, DOC, DOCX and TXT document types are supported",
      });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }

  next();
}

async function extractArticle(req, res, next) {
  try {
    const URL = req.body.payload;
    const response = await fetch(URL);
    const markup = await response.text();
    const article = await articleExtractor(URL);
    const content = contentExtractor(markup);

    res.locals.data = {
      title: article.title,
      description: article.description,
      author: article.author,
      source: article.source,
      published: article.published,
      text: content.text,
    };

    next();
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
}

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "404.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Listening on Port ${PORT}`));
