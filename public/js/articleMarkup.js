export const articlePageLayout = /* html */ `
<br><br>
<form class="animate__animated animate__fadeIn">
    <div class="row container">
        <div class="col l6 m6 s12">
            <div class="input-field">
                <i class="material-icons prefix">link</i>
                <input name="url" id="icon_prefix" type="text" autocomplete="off">
                <label for="icon_prefix">URL</label>
            </div>
        </div>
        <div class="col l6 m6 s12">
            <div class="input-field">
                <i class="material-icons prefix">title</i>
                <textarea name="text" id="textarea1" class="materialize-textarea"></textarea>
                <label for="textarea1">Text</label>
            </div>
        </div>
    </div>
    <div class="row container">
        <center><span class="document-error"></span></center>
        <span id="loader"></span>
        <button class="blue-grey lighten-2 waves-effect waves-light btn right" type="submit"><i
                class="material-icons right">send</i>SUMMARIZE</button>
    </div>
</form>
<div id="article-output"></div>
`;