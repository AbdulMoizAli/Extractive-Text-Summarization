'use strict';

import { docPageLayout } from './documentMarkup.js';
import { dropzoneInit } from './dropzone.js';
import { articlePageLayout } from './articleMarkup.js';
import { articleOutputLayout } from './articleOutput.js';

document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('li a').addEventListener('click', (e) => e.preventDefault());
    document.querySelector('footer span').textContent = new Date().getFullYear();
    const sideNav = M.Sidenav.init(document.querySelector('.sidenav'), {

        onOpenStart: () => {

            documentLinks.forEach(link => {

                link.classList.add('animate__animated', 'animate__fadeInLeft');
            });

            articleLinks.forEach(link => {

                link.classList.add('animate__animated', 'animate__fadeInLeft');
            });
        },
        onCloseStart: () => {

            documentLinks.forEach(link => {

                link.classList.remove('animate__animated', 'animate__fadeInLeft');
            });

            articleLinks.forEach(link => {

                link.classList.remove('animate__animated', 'animate__fadeInLeft');
            });
        }
    });

    const documentLinks = document.querySelectorAll('#document-link');
    const articleLinks = document.querySelectorAll('#article-link');
    const pageTitle = document.querySelector('title');
    const mainContent = document.querySelector('#main-content');

    for (let i = 0; i < 2; i++) {
        documentLinks[i].addEventListener('click', () => {
            activateLinks(documentLinks[i], articleLinks[i]);
            pageTitle.textContent = 'Text Summarization | Document Summarization';
            mainContent.innerHTML = docPageLayout;
            dropzoneInit();
            validateDocumentType();
            summarizeDocument();
        });
        articleLinks[i].addEventListener('click', () => {
            activateLinks(articleLinks[i], documentLinks[i]);
            pageTitle.textContent = 'Text Summarization | Article Summarization';
            mainContent.innerHTML = articlePageLayout;
            M.Tooltip.init(document.querySelectorAll('.tooltipped'));
            summarizeArticle();
            addSampleLink();
        });
    }

    function activateLinks(active, deactive) {
        active.classList.add('active');
        deactive.classList.remove('active');
        sideNav.close();
    }

    function validateDocumentType() {
        const inputDocument = document.querySelector('input[type=file]');
        inputDocument.addEventListener('input', () => {
            const index = inputDocument.value.lastIndexOf('.');
            const length = inputDocument.value.length;
            const documentType = inputDocument.value.substring(index, length);

            const documentError = document.querySelector('.document-error');

            if (['.pdf', '.doc', '.docx', '.txt'].includes(documentType)) {
                documentError.textContent = '';
                documentError.style.display = 'none';
            } else {
                documentError.textContent = 'incorrect document type, PDF, DOC, DOCX and TXT document types are supported !';
                documentError.style.display = 'block';
            }
        });
    }

    function summarizeDocument() {
        const form = document.querySelector('form');
        const documentError = document.querySelector('.document-error');
        const inputDocument = document.querySelector('input[type=file]');

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (getComputedStyle(documentError).display !== 'none')
                return;

            if (inputDocument.files.length === 0) {
                documentError.textContent = 'please select a document to summarize !';
                documentError.style.display = 'block';
                return;
            }

            const response = await fetch('/document', {
                method: 'POST',
                body: new FormData(this)
            });
            const data = await response.json();

            if (response.status === 200) {
                document.querySelector('#summarized-text').innerHTML = /* html */ `
                    <div class="card blue-grey lighten-5 z-depth-1 animate__animated animate__fadeIn">
                        <div class="card-content blue-grey-text">
                            <p>${data.summary}</p>
                        </div>
                    </div>
                `;
            } else {
                documentError.textContent = data.message;
                documentError.style.display = 'block';
            }
        });
    }

    function summarizeArticle() {
        const form = document.querySelector('form');
        const url = document.querySelector('input');
        const text = document.querySelector('textarea');
        const documentError = document.querySelector('.document-error');
        const articleOutput = document.querySelector('#article-output');

        const clearError = () => {
            documentError.textContent = '';
            documentError.style.display = 'none';
        }

        url.addEventListener('input', clearError);
        text.addEventListener('input', clearError);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!url.value && !text.value && !url.getAttribute('placeholder'))
            return;

            const loader = document.querySelector('#loader');

            loader.innerHTML = /* html */ `
            <div class="preloader-wrapper small active">
            <div class="spinner-layer spinner-green-only">
            <div class="circle-clipper left">
                <div class="circle"></div>
            </div><div class="gap-patch">
                <div class="circle"></div>
            </div><div class="circle-clipper right">
                <div class="circle"></div>
                </div>
                </div>
            </div>
            `;

            let payload = new String();
            let route = new String();

            if (!url.value && !text.value) {
                payload = url.getAttribute('placeholder');
                route = '/article';
            } else if (url.value) {
                payload = url.value
                route = '/article';
            } else if (text.value) {
                payload = text.value;
                route = '/text';
            }

            const response = await fetch(route, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    payload
                })
            });
            const data = await response.json();

            loader.innerHTML = '';

            if (response.status === 200) {

                if (data.type === 'text') {
                    articleOutput.innerHTML = /* html */ `
                        <div id="summarized-text">
                        <div class="card blue-grey lighten-5 z-depth-1 animate__animated animate__fadeIn">
                            <div class="card-content blue-grey-text">
                                <p>${data.summary}</p>
                            </div>
                        </div>
                        </div>
                    `;
                } else if (data.type === 'article') {
                    articleOutput.innerHTML = articleOutputLayout;

                    const metadata = document.querySelectorAll('td');
                    const content = document.querySelector('p');

                    metadata[0].textContent = data.title ? data.title : 'N/A';
                    metadata[1].textContent = data.description ? data.description : 'N/A';
                    metadata[2].textContent = data.author ? data.author : 'N/A';
                    metadata[3].textContent = data.source ? data.source : 'N/A';
                    metadata[4].textContent = data.published ? new Date(data.published).toUTCString() : 'N/A';
                    content.textContent = data.text;

                    document.querySelector('.article-data').style.display = 'block';
                }
            } else {
                documentError.textContent = data.message;
                documentError.style.display = 'block';
            }
        });
    }

    function addSampleLink() {
        const input = document.querySelector('input');

        input.addEventListener('focusin', () => input.setAttribute('placeholder', 'https://medium.com/linuxforeveryone/the-real-reason-linux-users-love-the-command-line-e8043f583028'));
    }
});