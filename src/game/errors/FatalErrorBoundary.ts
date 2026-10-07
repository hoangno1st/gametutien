export interface FatalErrorBoundaryOptions {
    onFatal: () => void;
    getSaveJson: () => string | null;
}

export class FatalErrorBoundary {
    private options: FatalErrorBoundaryOptions;
    private visible: boolean;
    private errorHandler: (event: ErrorEvent) => void;
    private rejectionHandler: (event: PromiseRejectionEvent) => void;

    constructor(options: FatalErrorBoundaryOptions) {
        this.options = options;
        this.visible = false;
        this.errorHandler = (event) => this.show(event.error ?? event.message);
        this.rejectionHandler = (event) => this.show(event.reason);
        window.addEventListener("error", this.errorHandler);
        window.addEventListener("unhandledrejection", this.rejectionHandler);
    }

    public show(error: unknown): void {
        if (this.visible) return;
        this.visible = true;
        this.options.onFatal();
        console.error("Fatal game error", error);

        const overlay = document.createElement("section");
        overlay.className = "fatal-error-overlay";
        overlay.setAttribute("role", "alertdialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.innerHTML = [
            "<div class=\"fatal-error-card\">",
            "<h1>Game gặp lỗi nghiêm trọng</h1>",
            "<p>Autosave đã tạm dừng để bảo vệ dữ liệu hiện tại.</p>",
            "<div class=\"fatal-error-actions\"></div>",
            "</div>",
        ].join("");

        const actions = overlay.querySelector(".fatal-error-actions");
        actions?.append(
            this.createButton("Xuất save", () => this.exportSave()),
            this.createButton("Tải lại", () => window.location.reload()),
        );
        document.body.appendChild(overlay);
    }

    public destroy(): void {
        window.removeEventListener("error", this.errorHandler);
        window.removeEventListener("unhandledrejection", this.rejectionHandler);
    }

    private createButton(label: string, action: () => void): HTMLButtonElement {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.addEventListener("click", action);
        return button;
    }

    private exportSave(): void {
        const serialized = this.options.getSaveJson();
        if (!serialized) return;
        const url = URL.createObjectURL(new Blob([serialized], { type: "application/json" }));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `tien-lo-idle-emergency-${Date.now()}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    }
}
