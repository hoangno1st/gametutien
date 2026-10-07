import { ItemRarity, ItemType } from "../items/Item";
import type { MaterialDefinition } from "./Material";
import { MaterialCategory } from "./MaterialCategory";
import { CHAPTER_DEFINITIONS } from "../chapters/chapterData";

export const MATERIAL_DATA = {
    TECHNIQUE_FRAGMENT: {
        id: "technique_fragment",
        name: "Tàn Trang Công Pháp",
        description: "Trang sách cổ dùng để lĩnh ngộ và nâng cấp Công Pháp.",
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        stackable: true,
        maxStack: 999999,
        materialCategory: MaterialCategory.ESSENCE,
        tier: 1,
    },
    EQUIPMENT_ESSENCE: {
        id: "equipment_essence",
        name: "Luyện Khí Tinh Hoa",
        description:
            "Tinh hoa thu được khi tháo rã trang bị. " +
            "Dùng để cải tiến và mở thêm thuộc tính trang bị.",
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        stackable: true,
        maxStack: 999999,
        materialCategory: MaterialCategory.ESSENCE,
        tier: 1,
    },
    MYSTIC_IRON: {
        id: "mystic_iron",
        name: "Huyền Thiết",
        description: "Khoáng thạch cứng chắc dùng để luyện chế trang bị.",
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        stackable: true,
        maxStack: 999,
        materialCategory: MaterialCategory.ORE,
        tier: 1,
    },
    SPIRIT_WOOD: {
        id: "spirit_wood",
        name: "Linh Mộc",
        description: "Linh mộc chứa tinh hoa thiên địa.",
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        stackable: true,
        maxStack: 999,
        materialCategory: MaterialCategory.ESSENCE,
        tier: 1,
    },
    SPIRIT_HERB: {
        id: "spirit_herb",
        name: "Linh Thảo",
        description: "Linh thảo chứa một lượng linh khí nhỏ.",
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        stackable: true,
        maxStack: 999,
        materialCategory: MaterialCategory.HERB,
        tier: 1,
    },
    BLOOD_SPIRIT_FLOWER: {
        id: "blood_spirit_flower",
        name: "Huyết Linh Hoa",
        description: "Dược liệu sinh trưởng gần nơi yêu thú tụ tập.",
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        stackable: true,
        maxStack: 999,
        materialCategory: MaterialCategory.HERB,
        tier: 1,
    },
    WOLF_FANG: {
        id: "wolf_fang",
        name: "Lang Nha",
        description: "Nanh sắc của yêu lang, thích hợp làm vật liệu luyện khí.",
        type: ItemType.MATERIAL,
        rarity: ItemRarity.COMMON,
        stackable: true,
        maxStack: 999,
        materialCategory: MaterialCategory.MONSTER,
        tier: 1,
    },
    MONSTER_CORE: {
        id: "monster_core",
        name: "Yêu Đan",
        description: "Nội đan tích tụ yêu lực của yêu thú.",
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        stackable: true,
        maxStack: 999,
        materialCategory: MaterialCategory.MONSTER,
        tier: 1,
    },
    MONSTER_BLOOD_ESSENCE: {
        id: "monster_blood_essence",
        name: "Tinh Huyết Yêu Thú",
        description: "Tinh huyết cô đọng mang yêu lực tinh thuần.",
        type: ItemType.MATERIAL,
        rarity: ItemRarity.RARE,
        stackable: true,
        maxStack: 999,
        materialCategory: MaterialCategory.ESSENCE,
        tier: 1,
    },
    SPIRIT_ESSENCE: {
        id: "spirit_essence",
        name: "Tinh Hoa Linh Khí",
        description: "Tinh hoa linh khí còn lại trong cơ thể yêu thú.",
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        stackable: true,
        maxStack: 999,
        materialCategory: MaterialCategory.ESSENCE,
        tier: 1,
    },
    MONSTER_KING_CORE: {
        id: "monster_king_core",
        name: "Yêu Vương Nội Đan",
        description: "Nội đan quý hiếm chỉ có ở yêu vương.",
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        stackable: true,
        maxStack: 999,
        materialCategory: MaterialCategory.BOSS,
        tier: 1,
    },
} as const satisfies Record<string, MaterialDefinition>;

const TIERED_MATERIAL_NAMES = ["Khoáng Thạch", "Linh Thảo", "Yêu Cốt", "Boss Tinh Hạch"] as const;
const TIERED_MATERIAL_CATEGORIES = [
    MaterialCategory.ORE,
    MaterialCategory.HERB,
    MaterialCategory.MONSTER,
    MaterialCategory.BOSS,
] as const;

export const TIERED_MATERIAL_DEFINITIONS: ReadonlyArray<MaterialDefinition> =
    CHAPTER_DEFINITIONS.slice(1).flatMap((chapter) =>
        TIERED_MATERIAL_NAMES.map((name, index) => ({
            id: `chapter_${chapter.chapter}_material_${index + 1}`,
            name: `${name} ${chapter.name}`,
            description: `Vật liệu bậc ${chapter.materialTier} từ ${chapter.name}.`,
            type: ItemType.MATERIAL,
            rarity: index === 3 ? ItemRarity.EPIC : ItemRarity.RARE,
            stackable: true,
            maxStack: 999999,
            materialCategory: TIERED_MATERIAL_CATEGORIES[index],
            tier: chapter.materialTier,
        })),
    );

export const MATERIAL_DEFINITIONS: ReadonlyArray<MaterialDefinition> = [
    ...Object.values(MATERIAL_DATA),
    ...TIERED_MATERIAL_DEFINITIONS,
];
