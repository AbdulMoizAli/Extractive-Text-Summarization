export const docPageLayout = /* html */ `
<br><br>
<form class="animate__animated animate__fadeIn">
    <div class="row container">
        <div class="col l6 m6 s12 offset-l3">
            <div class="drop-zone">
                <span class="drop-zone__prompt">Drop file here or click to upload</span>
                <input type="file" name="document" class="drop-zone__input" accept=".pdf, .docx, .doc, .txt">
            </div>
        </div>
        </div>
    <br>
    <div class="row container">
        <div class="col l6 m6 s12 offset-l3">
            <button class="blue-grey lighten-2 waves-effect waves-light btn right" type="submit"><i
                    class="material-icons right">send</i>SUMMARIZE</button>
        </div>
    </div>
</form>
<div class="row">
    <div class="col">
        <div id="summarized-text"></div>
    </div>
</div>
`;