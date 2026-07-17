export function renderProtectView() {

    return `

    <div class="container">

        <button id="backBtn" class="back-btn">
            ← Back
        </button>

        <div class="tool-header">

            <div class="tool-icon protect-icon">
                🔒
            </div>

            <h1>Protect PDF</h1>

            <p>
                Secure your PDF with password protection
            </p>

        </div>

        <div
            class="compress-drop-zone protect-drop-zone"
            id="protectDropZone"
        >

            <div class="drop-icon">
                🔐
            </div>

            <h3>
                Drop your PDF here
            </h3>

            <p>
                or click to browse from your device
            </p>

            <span class="file-support">
                PDF files only
            </span>

            <input
                type="file"
                id="protectInput"
                accept="application/pdf"
                multiple
                hidden
            >

        </div>

        <div
            id="protectFileInfo"
            class="compress-file-info"
        ></div>

        <div
            id="protectPasswordSection"
            class="password-section"
            style="display:none;"
        >

            <div class="password-header">

                <div>
                    <h3>🔑 Set Password</h3>

                    <p>
                        Your PDF will be protected with strong encryption.
                    </p>
                </div>

                <span class="security-badge">
                    🛡 Secure
                </span>

            </div>

            <div class="password-input-group">

                <input
                    type="password"
                    id="protectPassword"
                    placeholder="Enter password"
                >

                <button
                    type="button"
                    class="toggle-password"
                    data-target="protectPassword"
                >
                    👁️
                </button>

            </div>

            <div class="password-input-group">

                <input
                    type="password"
                    id="protectConfirmPassword"
                    placeholder="Confirm password"
                >

                <button
                    type="button"
                    class="toggle-password"
                    data-target="protectConfirmPassword"
                >
                    👁️
                </button>

            </div>

            <button
                id="protectPdfBtn"
                class="primary-btn protect-btn"
            >
                🔒 Protect PDF
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