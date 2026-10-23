export function renderHandwritingGeneratorView() {
    return `
        <div class="converter-container">
            <button id="backBtn" class="back-btn">← Back</button>

            <div class="tool-header">
                <div class="tool-icon">📝</div>
                <h1>Write My Assignment</h1>
                <p>Paste your text and get it back in your own handwriting</p>
            </div>

            <textarea id="hwGenText" class="hw-gen-text" rows="12" maxlength="6000"
                placeholder="Type or paste your assignment here..."></textarea>
            <div id="hwGenCount" class="converter-file-info">0 / 6000</div>
            <div class="hw-gen-toolbar">
    <button type="button" id="hwGenHeadingBtn" class="converter-action-btn hw-secondary-btn">
        ■ Black pen for this line
    </button>
    <label>
        <input type="checkbox" id="hwGenAutoQ" checked>
        Auto black for questions (Q1., Question 1, 1.)
    </label>
</div>
<p class="hw-gen-hint">
    Tip: kisi bhi line ke shuru mein <code>## </code> likho toh wo black pen mein aayegi.
</p>

            <div class="hw-gen-options">
                <label>Paper
                    <select id="hwGenTone">
                        <option value="photo">Photo look</option>
                        <option value="bright">Bright</option>
                        <option value="white">White</option>
                        <option value="cream">Cream</option>
                    </select>
                </label>
                <label>Lines
                    <select id="hwGenStyle">
                        <option value="plain">Plain</option>
                        <option value="ruled">Ruled</option>
                    </select>
                </label>
                <label>Pen
                    <select id="hwGenPen">
                        <option value="1.1">Normal</option>
                        <option value="1.0">Thin</option>
                        <option value="1.4">Thick</option>
                    </select>
                </label>
            </div>

            <button id="hwGenBtn" class="converter-action-btn" disabled>Generate PDF</button>
            <div id="hwGenResult"></div>
        </div>
    `;
}