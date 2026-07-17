export function renderUnlockView() {

    return `

    <div class="container">

        <button id="backBtn" class="back-btn">
            ← Back
        </button>

        <div class="tool-header">

            <div class="tool-icon unlock-icon">
                🔓
            </div>

            <h1>Unlock PDF</h1>

            <p>
                Remove password protection from your PDF
            </p>

        </div>

        <div
            class="compress-drop-zone unlock-drop-zone"
            id="unlockDropZone"
        >

            <div class="drop-icon">
                🔐
            </div>

            <h3>
                Drop your protected PDF here
            </h3>

            <p>
                or click to browse from your device
            </p>

            <span class="file-support">
                PDF files only
            </span>

            <input
                type="file"
                id="unlockInput"
                accept="application/pdf"
                multiple
                hidden
            >

        </div>

        <div
            id="unlockFileInfo"
            class="compress-file-info"
        ></div>

        <div
            id="unlockPasswordSection"
            class="password-section"
            style="display:none;"
        >

            <div class="password-header">

                <div>
                    <h3>🔑 Enter PDF Password</h3>

                    <p>
                        Enter the password to unlock your PDF.
                    </p>
                </div>

                <span class="security-badge">
                    🛡 Secure
                </span>

            </div>

            <div class="password-input-group">

                <input
                    type="password"
                    id="unlockPassword"
                    placeholder="Enter PDF password"
                >

                <button
                    type="button"
                    class="toggle-password"
                    data-target="unlockPassword"
                >
                    👁️
                </button>

            </div>

            <button
                id="unlockPdfBtn"
                class="primary-btn protect-btn"
            >
                🔓 Unlock PDF
            </button>

        </div>

        <div class="security-info">

            <span>🛡️</span>

            <p>
                Your PDF is processed locally in your browser.
                Your files are never uploaded to a server.
            </p>

        </div>

    </div>

    `;

}