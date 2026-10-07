import { CultivationRealm } from "../cultivation/CultivationRealm";
import { EQUIPMENT_DATA } from "../equipment/equipmentData";
import { MATERIAL_DATA } from "../materials/materialData";
import type { CraftingRecipe } from "./CraftingRecipe";
import { CraftingType } from "./CraftingType";
import { CHAPTER_DEFINITIONS } from "../chapters/chapterData";

export const CRAFTING_RECIPE_DATA = {
    QINGYUN_SWORD: {
        id: "craft_qingyun_sword",
        name: "Thanh Vân Kiếm",
        description: "Recipe thử nghiệm nền tảng Luyện Khí.",
        type: CraftingType.EQUIPMENT,
        materials: [
            { itemId: MATERIAL_DATA.MYSTIC_IRON.id, quantity: 10 },
            { itemId: MATERIAL_DATA.SPIRIT_WOOD.id, quantity: 5 },
            { itemId: MATERIAL_DATA.MONSTER_CORE.id, quantity: 2 },
        ],
        spiritStoneCost: 100,
        requiredRealm: CultivationRealm.QI_REFINING,
        outputId: EQUIPMENT_DATA.AZURE_CLOUD_SWORD.id,
    },
    AZURE_CLOUD_ROBE: {
        id: "craft_azure_cloud_robe",
        name: "Thanh Vân Pháp Bào",
        description: "Recipe Luyện Khí áo giáp Thanh Vân.",
        type: CraftingType.EQUIPMENT,
        materials: [
            { itemId: MATERIAL_DATA.MYSTIC_IRON.id, quantity: 12 },
            { itemId: MATERIAL_DATA.MONSTER_BLOOD_ESSENCE.id, quantity: 2 },
            { itemId: MATERIAL_DATA.MONSTER_CORE.id, quantity: 2 },
        ],
        spiritStoneCost: 120,
        requiredRealm: CultivationRealm.QI_REFINING,
        outputId: EQUIPMENT_DATA.AZURE_CLOUD_ROBE.id,
    },
    SPIRIT_GATHERING_BRACELET: {
        id: "craft_spirit_gathering_bracelet",
        name: "Tụ Linh Hoàn",
        description: "Recipe Luyện Khí vòng tay tụ linh.",
        type: CraftingType.EQUIPMENT,
        materials: [
            { itemId: MATERIAL_DATA.SPIRIT_WOOD.id, quantity: 6 },
            { itemId: MATERIAL_DATA.SPIRIT_HERB.id, quantity: 5 },
            { itemId: MATERIAL_DATA.MONSTER_CORE.id, quantity: 2 },
        ],
        spiritStoneCost: 90,
        requiredRealm: CultivationRealm.FOUNDATION_ESTABLISHMENT,
        outputId: EQUIPMENT_DATA.SPIRIT_GATHERING_BRACELET.id,
    },
    HEALING_PILL: {
        id: "craft_healing_pill",
        name: "Hồi Huyết Đan",
        description: "Recipe thử nghiệm nền tảng Luyện Đan.",
        type: CraftingType.ALCHEMY,
        materials: [
            { itemId: MATERIAL_DATA.SPIRIT_HERB.id, quantity: 5 },
            { itemId: MATERIAL_DATA.BLOOD_SPIRIT_FLOWER.id, quantity: 2 },
            { itemId: MATERIAL_DATA.MONSTER_CORE.id, quantity: 1 },
        ],
        spiritStoneCost: 50,
        requiredRealm: CultivationRealm.QI_REFINING,
        outputId: "healing_pill",
    },
    SPIRIT_RESTORATION_PILL: {
        id: "craft_spirit_restoration_pill",
        name: "Hồi Linh Đan",
        description: "Recipe Luyện Đan hồi phục linh lực.",
        type: CraftingType.ALCHEMY,
        materials: [
            { itemId: MATERIAL_DATA.SPIRIT_HERB.id, quantity: 4 },
            { itemId: MATERIAL_DATA.SPIRIT_WOOD.id, quantity: 2 },
            { itemId: MATERIAL_DATA.MONSTER_CORE.id, quantity: 1 },
        ],
        spiritStoneCost: 50,
        requiredRealm: CultivationRealm.QI_REFINING,
        outputId: "spirit_restoration_pill",
    },
    QI_GATHERING_PILL: {
        id: "craft_qi_gathering_pill",
        name: "Tụ Khí Đan",
        description: "Recipe Luyện Đan tăng tốc độ tu luyện.",
        type: CraftingType.ALCHEMY,
        materials: [
            { itemId: MATERIAL_DATA.SPIRIT_HERB.id, quantity: 8 },
            { itemId: MATERIAL_DATA.BLOOD_SPIRIT_FLOWER.id, quantity: 3 },
            { itemId: MATERIAL_DATA.MONSTER_BLOOD_ESSENCE.id, quantity: 1 },
        ],
        spiritStoneCost: 100,
        requiredRealm: CultivationRealm.QI_REFINING,
        outputId: "qi_gathering_pill",
    },
} as const satisfies Record<string, CraftingRecipe>;

const GENERATED_RECIPES: ReadonlyArray<CraftingRecipe> =
    CHAPTER_DEFINITIONS.slice(1).flatMap((chapter) => {
        const materialIds = [1, 2, 3, 4].map(
            (index) => `chapter_${chapter.chapter}_material_${index}`,
        );
        const equipmentRecipes: CraftingRecipe[] = [
            ["weapon", "Linh Kiếm"],
            ["armor", "Pháp Bào"],
            ["bracelet", "Linh Hoàn"],
        ].map(([suffix, label]) => ({
            id: `craft_chapter_${chapter.chapter}_${suffix}`,
            name: `${chapter.name} ${label}`,
            description: `Luyện chế trang bị bậc ${chapter.materialTier}.`,
            type: CraftingType.EQUIPMENT,
            materials: [
                { itemId: materialIds[0], quantity: 8 + chapter.chapter * 2 },
                { itemId: materialIds[2], quantity: 3 + chapter.chapter },
                { itemId: materialIds[3], quantity: 1 },
            ],
            spiritStoneCost: 100 * chapter.chapter * chapter.chapter,
            requiredRealm: chapter.recommendedRealm,
            outputId: `chapter_${chapter.chapter}_${suffix}`,
        }));
        const pillRecipes: CraftingRecipe[] = ["healing_pill", "spirit_restoration_pill"]
            .map((outputId, index) => ({
                id: `craft_chapter_${chapter.chapter}_pill_${index + 1}`,
                name: `${chapter.name} ${index === 0 ? "Hồi Huyết Đan" : "Hồi Linh Đan"}`,
                description: `Đan dược bậc ${chapter.materialTier}.`,
                type: CraftingType.ALCHEMY,
                materials: [
                    { itemId: materialIds[1], quantity: 5 + chapter.chapter },
                    { itemId: materialIds[2], quantity: 2 + chapter.chapter },
                ],
                spiritStoneCost: 75 * chapter.chapter * chapter.chapter,
                requiredRealm: chapter.recommendedRealm,
                outputId,
            }));
        return [...equipmentRecipes, ...pillRecipes];
    });

export const CRAFTING_RECIPES: ReadonlyArray<CraftingRecipe> = [
    ...Object.values(CRAFTING_RECIPE_DATA),
    ...GENERATED_RECIPES,
];
