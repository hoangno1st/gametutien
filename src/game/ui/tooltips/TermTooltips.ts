import { Container, Graphics, Text } from "pixi.js";
import { GameTheme } from "../theme/GameTheme";

export const TERM_TOOLTIPS: Readonly<Record<string, string>> = {
    "Bạo Kích": "Tỷ lệ đòn đánh gây sát thương Bạo Kích.",
    "ST Bạo Kích": "Hệ số sát thương khi kích hoạt Bạo Kích.",
    "Hồi Chiêu": "Giảm thời gian chờ trước khi dùng lại kỹ năng.",
    "Tốc Độ Tu Luyện": "Nhân tốc độ nhận Tu Vi theo thời gian.",
    Catalyst: "Chất xúc tác tăng cơ hội tạo vật phẩm phẩm chất cao.",
    "Tinh Hoa": "Tài nguyên nhận từ tháo rã, dùng để cải tiến trang bị.",
    Rarity: "Phẩm chất vật phẩm: Trắng, Lục, Lam, Tím, Vàng, Đỏ.",
};

export class TermTooltip extends Container {
    constructor(term: string) {
        super();
        const definition = TERM_TOOLTIPS[term] ?? "Chưa có mô tả.";
        const background = new Graphics()
            .roundRect(0, 0, 290, 54, 6)
            .fill({ color: GameTheme.colors.background, alpha: 0.98 })
            .stroke({ color: GameTheme.colors.gold, width: 1 });
        const text = new Text({ text: `${term}: ${definition}`, style: { fill: GameTheme.colors.text, fontSize: 11, wordWrap: true, wordWrapWidth: 270 } });
        text.position.set(10, 9);
        this.addChild(background, text);
        this.visible = false;
    }
}
