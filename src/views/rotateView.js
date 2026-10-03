export function renderRotateView() {
  return `
    <div class="container">
      <div class="tm-card">

        <!-- HEADER -->
        <div class="tm-header">
          <div class="tm-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg>
          </div>
          <div class="tm-heading">
            <h1 class="tm-title">Rotate PDF</h1>
            <p class="tm-desc">Rotate selected pages clockwise or counter-clockwise</p>
          </div>
          <button class="tm-close js-back" aria-label="Close">✕</button>
        </div>

        <!-- BODY -->
        <div class="tm-body">

          <div id="dropZone">
            <div class="tm-upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <p>Drop your PDF here</p>
            <span>or <em class="drop-link">browse from your device</em></span>
            <span class="drop-hint">Select a single PDF document</span>
            <input type="file" id="pdfInput" accept=".pdf">
          </div>

          <div id="fileList"></div>

          <div class="tm-panel">
            <div class="tm-panel-title">Rotation Direction</div>
            <div class="rot-grid">
              <label class="rot-option">
                <input type="radio" name="rotDir" value="90" checked>
                <div class="rot-box"><span class="rot-icon">↻</span><span>90° Clockwise</span></div>
              </label>
              <label class="rot-option">
                <input type="radio" name="rotDir" value="180">
                <div class="rot-box"><span class="rot-icon">⇅</span><span>180° Upside-Down</span></div>
              </label>
              <label class="rot-option">
                <input type="radio" name="rotDir" value="270">
                <div class="rot-box"><span class="rot-icon">↺</span><span>90° Counter-CW</span></div>
              </label>
            </div>

            <div class="tm-field">
              <label for="rotatePageInput">Pages to rotate</label>
              <input type="text" id="rotatePageInput" class="tm-input" placeholder="e.g. 2,4,5-7">
            </div>
          </div>

        </div>

        <!-- FOOTER -->
        <div class="tm-footer">
          <p class="tm-note">Your file is processed in your browser and never uploaded.</p>
          <div class="tm-actions">
            <button class="tm-cancel js-back">Cancel</button>
            <button id="rotateBtn" class="tm-primary">🔄 Rotate PDF</button>
          </div>
        </div>

      </div>
    </div>
  `;
}