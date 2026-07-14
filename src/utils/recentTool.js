export function saveRecentTool(tool, label) {

    localStorage.setItem(
        "recentTool",
        JSON.stringify({
            tool,
            label
        })
    );

}

export function getRecentTool() {

    const data = localStorage.getItem("recentTool");

    return data ? JSON.parse(data) : null;

}