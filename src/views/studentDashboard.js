export function renderStudentDashboard() {
          
    return `

    <div class="container">

        <div class="student-header">

    <div class="student-title">

        <div class="student-badge">
            🎓 STUDENT MODE
        </div>

        <h1>MergeMate Student</h1>

        <p>Welcome Back Student 👋</p>

    </div>

    <button id="exitStudentMode">

        ← Professional Mode

    </button>

</div>

<div class="student-welcome">

    <h2>👋 What are we working on today?</h2>

    <p>
        Choose a task and let's get your work done faster.
    </p>

</div>



        <div class="tool-grid">

            <div class="tool-card">
                <div class="icon">📄</div>
                <h3>Merge Assignment</h3>
                <p>Combine assignment PDFs</p>
            </div>

            <div class="tool-card">
                <div class="icon">📚</div>
                <h3>Compress Notes</h3>
                <p>Reduce PDF size</p>
            </div>

            <div class="tool-card">
                <div class="icon">📷</div>
                <h3>Homework Scanner</h3>
                <p>Images to PDF</p>
            </div>

            <div class="tool-card">
                <div class="icon">📑</div>
                <h3>Semester Pack</h3>
                <p>Create final submission</p>
            </div>

        </div>

    </div>

    `;

}