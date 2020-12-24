"use strict";

import { docPageLayout } from "./documentMarkup.js";
import { dropzoneInit } from "./dropzone.js";
import { articlePageLayout } from "./articleMarkup.js";
import { articleOutputLayout } from "./articleOutput.js";

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("li a")
    .addEventListener("click", (e) => e.preventDefault());
  document.querySelector("footer span").textContent = new Date().getFullYear();

  const sideNav = M.Sidenav.init(document.querySelector(".sidenav"), {
    onOpenStart: () => {
      documentLinks.forEach((link) => {
        link.classList.add("animate__animated", "animate__fadeInLeft");
      });

      articleLinks.forEach((link) => {
        link.classList.add("animate__animated", "animate__fadeInLeft");
      });
    },
    onCloseStart: () => {
      documentLinks.forEach((link) => {
        link.classList.remove("animate__animated", "animate__fadeInLeft");
      });

      articleLinks.forEach((link) => {
        link.classList.remove("animate__animated", "animate__fadeInLeft");
      });
    },
  });

  const errorModal = M.Modal.init(document.querySelector(".modal"));

  const documentLinks = document.querySelectorAll("#document-link");
  const articleLinks = document.querySelectorAll("#article-link");
  const pageTitle = document.querySelector("title");
  const mainContent = document.querySelector("#main-content");

  for (let i = 0; i < 2; i++) {
    documentLinks[i].addEventListener("click", () => {
      activateLinks(documentLinks[i], articleLinks[i]);
      pageTitle.textContent = "Text Summarization | Document Summarization";
      mainContent.innerHTML = docPageLayout;
      dropzoneInit();
      summarizeDocument();
    });
    articleLinks[i].addEventListener("click", () => {
      activateLinks(articleLinks[i], documentLinks[i]);
      pageTitle.textContent = "Text Summarization | Article Summarization";
      mainContent.innerHTML = articlePageLayout;
      M.Tooltip.init(document.querySelectorAll(".tooltipped"));
      summarizeArticle();
      focusURLInput();
    });
  }

  function activateLinks(active, deactive) {
    active.classList.add("active");
    deactive.classList.remove("active");
    sideNav.close();
  }

  function summarizeDocument() {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const response = await fetch("/document", {
        method: "POST",
        body: new FormData(this),
      });
      const data = await response.json();

      if (response.status === 200) {
        document.querySelector("#summarized-text").innerHTML = /* html */ `
                    <div class="card blue-grey lighten-5 z-depth-1 animate__animated animate__fadeIn">
                        <div class="card-content blue-grey-text">
                            <p>${data.summary}</p>
                        </div>
                    </div>
                `;
      } else {
        document.querySelector("#error-message").textContent = data.message;
        errorModal.open();
      }
    });
  }

  function summarizeArticle() {
    const form = document.querySelector("form");
    const url = document.querySelector("input");
    const text = document.querySelector("textarea");
    const articleOutput = document.querySelector("#article-output");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const loader = document.querySelector("#loader");

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
        payload = url.getAttribute("placeholder");
        route = "/article";
      } else if (url.value) {
        payload = url.value;
        route = "/article";
      } else if (text.value) {
        payload = text.value;
        route = "/text";
      }

      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload,
        }),
      });
      const data = await response.json();

      loader.innerHTML = "";

      if (response.status === 200) {
        if (data.type === "text") {
          articleOutput.innerHTML = /* html */ `
                        <div id="summarized-text">
                        <div class="card blue-grey lighten-5 z-depth-1 animate__animated animate__fadeIn">
                            <div class="card-content blue-grey-text">
                                <p>${data.summary}</p>
                            </div>
                        </div>
                        </div>
                    `;
        } else if (data.type === "article") {
          articleOutput.innerHTML = articleOutputLayout;

          const metadata = document.querySelectorAll("td");
          const content = document.querySelector("p");

          metadata[0].textContent = data.title ? data.title : "N/A";
          metadata[1].textContent = data.description ? data.description : "N/A";
          metadata[2].textContent = data.author ? data.author : "N/A";
          metadata[3].textContent = data.source ? data.source : "N/A";
          metadata[4].textContent = data.published
            ? new Date(data.published).toUTCString()
            : "N/A";
          content.textContent = data.text;

          document.querySelector(".article-data").style.display = "block";
        }
      } else {
        document.querySelector("#error-message").textContent = data.message;
        errorModal.open();
      }
    });
  }

  function focusURLInput() {
    const input = document.querySelector("input");
    input.focus();
  }
});
