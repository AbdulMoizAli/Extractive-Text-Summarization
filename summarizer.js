'use strict';

const {
    SentenceTokenizer,
    WordTokenizer,
    TfIdf,
    Lexicon,
    RuleSet,
    BrillPOSTagger
} = require('natural');

const stopword = require('stopword');

function summarizeText(text) {

    text = text.trim();
    text = text.replace(/\s/g, ' ');

    const sentTokenizer = new SentenceTokenizer();
    const sentences = sentTokenizer.tokenize(text);

    const tfidfScores = calculateTFIDFScore(sentences);
    const sentencesScore = calculateSentencesScore(tfidfScores);
    const averageSentenceScore = calculateAverageSentenceScore(sentencesScore);

    let summary = new String();

    for (const sentence in sentencesScore) {
        if (sentencesScore[sentence] >= averageSentenceScore)
            summary += ` ${sentences[sentence]}`;
    }
    summary = summary.trim();

    return summary;

}

function calculateTFIDFScore(sentences) {

    const tfidf = new TfIdf();
    const tfidfScores = new Object();

    sentences.forEach(sentence => tfidf.addDocument(sentence));

    sentences.forEach((sentence, i) => {
        const words = wordPreprocessing(sentence);
        const wordsScore = new Object();
        words.forEach(word => wordsScore[word] = tfidf.tfidf(word, i));
        tfidfScores[i] = wordsScore;
    });

    return tfidfScores;
}

function wordPreprocessing(sentence) {

    const wordTokenizer = new WordTokenizer();
    const tagger = new BrillPOSTagger(new Lexicon('EN', 'N', 'NNP'), new RuleSet('EN'));

    let words = wordTokenizer.tokenize(sentence);

    words = stopword.removeStopwords(words);
    words = Array.from(new Set(words));
    words = words.map(word => word.replace(/[0-9]/g, ''));
    words = words.map(word => word.replace(/_/g, ''));

    const posTaggedWords = tagger.tag(words).taggedWords;
    words = posTaggedWords.map(word => {

        if (['NN', 'NNP', 'NNS', 'VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ'].includes(word.tag)) {
            return word.token
        } else {
            return '';
        }
    });

    words = words.filter(word => word.length > 1);
    words = words.map(word => word.toLowerCase());

    return words;
}

function calculateSentencesScore(tfidfScores) {

    const sentencesScore = new Object();

    for (const i in tfidfScores) {
        let score = 0;
        const sentence = tfidfScores[i];
        const wordCount = Object.keys(sentence).length;

        for (const word in sentence)
            score += sentence[word];

        const totalScore = score / wordCount;
        if (totalScore)
            sentencesScore[i] = score / wordCount;
        else
            sentencesScore[i] = 0;
    }

    return sentencesScore;
}

function calculateAverageSentenceScore(sentencesScore) {

    let score = 0;
    const count = Object.keys(sentencesScore).length;

    for (const sentence in sentencesScore)
        score += sentencesScore[sentence];

    return score / count;
}

module.exports = summarizeText;