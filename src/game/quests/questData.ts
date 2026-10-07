import { GameEventType } from "../events/GameEvent";
import { MATERIAL_DATA } from "../materials/materialData";
import type { QuestDefinition } from "./Quest";

export const QUEST_DEFINITIONS: ReadonlyArray<QuestDefinition> = [
    { id: "clear_stage_10", name: "Khởi Hành", description: "Vượt Ải 10", eventType: GameEventType.STAGE_CLEARED, target: 10, reward: { spiritStone: 300 } },
    { id: "craft_first_equipment", name: "Luyện Khí Nhập Môn", description: "Luyện trang bị đầu tiên", eventType: GameEventType.EQUIPMENT_CRAFTED, target: 1, reward: { materials: [{ itemId: MATERIAL_DATA.EQUIPMENT_ESSENCE.id, quantity: 10 }] } },
    { id: "first_breakthrough", name: "Đạo Đồ", description: "Đột phá lần đầu", eventType: GameEventType.BREAKTHROUGH, target: 1, reward: { spiritStone: 500 } },
    { id: "defeat_chapter_1", name: "Thanh Phong Vô Địch", description: "Đánh bại Boss Chương 1", eventType: GameEventType.BOSS_KILLED, target: 1, reward: { materials: [{ itemId: MATERIAL_DATA.TECHNIQUE_FRAGMENT.id, quantity: 10 }] } },
    { id: "craft_first_artifact", name: "Pháp Bảo Sơ Thành", description: "Ghép Pháp Bảo đầu tiên", eventType: GameEventType.ARTIFACT_CRAFTED, target: 1, reward: { spiritStone: 1000 } },
];
