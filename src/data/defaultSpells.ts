import { Spell } from '../types';

export const DEFAULT_SPELLS_DATA: Spell[] = [
  {
    id: "summon-construct-xphb",
    name: "Summon Construct",
    source: "XPHB",
    page: 324,
    level: 4,
    school: "C",
    time: [
      {
        number: 1,
        unit: "action"
      }
    ],
    range: {
      type: "point",
      distance: {
        type: "feet",
        amount: 90
      }
    },
    components: {
      v: true,
      s: true,
      m: {
        text: "a lockbox worth 400+ GP",
        cost: 40000
      }
    },
    duration: [
      {
        type: "timed",
        duration: {
          type: "hour",
          amount: 1
        },
        concentration: true
      }
    ],
    entries: [
      "You call forth the spirit of a Construct. It manifests in an unoccupied space that you can see within range and uses the {@creature Construct Spirit|XPHB} stat block. When you cast the spell, choose a material: Clay, Metal, or Stone. The creature resembles an animate statue (you determine the appearance) made of the chosen material, which determines certain details in its stat block. The creature disappears when it drops to 0 {@variantrule Hit Points|XPHB} or when the spell ends.",
      "The creature is an ally to you and your allies. In combat, the creature shares your {@variantrule Initiative|XPHB} count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the {@action Dodge|XPHB} action and uses its movement to avoid danger."
    ],
    entriesHigherLevel: [
      {
        type: "entries",
        name: "Using a Higher-Level Spell Slot",
        entries: [
          "Use the spell slot's level for the spell's level in the stat block."
        ]
      }
    ],
    miscTags: [
      "SGT",
      "SMN"
    ],
    classes: {
      fromClassList: [
        {
          name: "Wizard",
          source: "XPHB"
        },
        {
          name: "Artificer",
          source: "EFA"
        }
      ],
      fromSubclass: [
        {
          class: {
            name: "Fighter",
            source: "PHB"
          },
          subclass: {
            name: "Eldritch Knight",
            shortName: "Eldritch Knight",
            source: "PHB"
          }
        },
        {
          class: {
            name: "Rogue",
            source: "PHB"
          },
          subclass: {
            name: "Arcane Trickster",
            shortName: "Arcane Trickster",
            source: "PHB"
          }
        }
      ]
    },
    preparationStatus: "prepared",
    isFavorite: true
  },
  {
    id: "fly-xphb",
    name: "Fly",
    source: "XPHB",
    page: 276,
    level: 3,
    school: "T",
    time: [
      {
        number: 1,
        unit: "action"
      }
    ],
    range: {
      type: "point",
      distance: {
        type: "touch"
      }
    },
    components: {
      v: true,
      s: true,
      m: "a feather"
    },
    duration: [
      {
        type: "timed",
        duration: {
          type: "minute",
          amount: 10
        },
        concentration: true
      }
    ],
    entries: [
      "You touch a willing creature. For the duration, the target gains a {@variantrule Fly Speed|XPHB} of 60 feet and can hover. When the spell ends, the target falls if it is still aloft unless it can stop the fall."
    ],
    entriesHigherLevel: [
      {
        type: "entries",
        name: "Using a Higher-Level Spell Slot",
        entries: [
          "You can target one additional creature for each spell slot level above 3."
        ]
      }
    ],
    miscTags: [
      "SCT"
    ],
    areaTags: [
      "ST"
    ],
    classes: {
      fromClassList: [
        {
          name: "Sorcerer",
          source: "XPHB"
        },
        {
          name: "Warlock",
          source: "XPHB"
        },
        {
          name: "Wizard",
          source: "XPHB"
        },
        {
          name: "Artificer",
          source: "EFA"
        }
      ]
    },
    preparationStatus: "prepared",
    isFavorite: true
  },
  {
    id: "fear-xphb",
    name: "Fear",
    source: "XPHB",
    page: 271,
    level: 3,
    school: "I",
    time: [
      {
        number: 1,
        unit: "action"
      }
    ],
    range: {
      type: "cone",
      distance: {
        type: "feet",
        amount: 30
      }
    },
    components: {
      v: true,
      s: true,
      m: "a white feather"
    },
    duration: [
      {
        type: "timed",
        duration: {
          type: "minute",
          amount: 1
        },
        concentration: true
      }
    ],
    entries: [
      "Each creature in a 30-foot {@variantrule Cone [Area of Effect]|XPHB|Cone} must succeed on a Wisdom saving throw or drop whatever it is holding and have the {@condition Frightened|XPHB} condition for the duration.",
      "A {@condition Frightened|XPHB} creature takes the {@action Dash|XPHB} action and moves away from you by the safest route on each of its turns unless there is nowhere to move. If the creature ends its turn in a space where it doesn't have line of sight to you, the creature makes a Wisdom saving throw. On a successful save, the spell ends on that creature."
    ],
    conditionInflict: [
      "frightened"
    ],
    savingThrow: [
      "wisdom"
    ],
    areaTags: [
      "N"
    ],
    classes: {
      fromClassList: [
        {
          name: "Bard",
          source: "XPHB"
        },
        {
          name: "Sorcerer",
          source: "XPHB"
        },
        {
          name: "Warlock",
          source: "XPHB"
        },
        {
          name: "Wizard",
          source: "XPHB"
        }
      ]
    },
    preparationStatus: "unprepared"
  },
  {
    id: "detect-magic-xphb",
    name: "Detect Magic",
    source: "XPHB",
    page: 262,
    level: 1,
    school: "D",
    time: [
      {
        number: 1,
        unit: "action"
      }
    ],
    range: {
      type: "sphere",
      distance: {
        type: "feet",
        amount: 30
      }
    },
    components: {
      v: true,
      s: true
    },
    duration: [
      {
        type: "timed",
        duration: {
          type: "minute",
          amount: 10
        },
        concentration: true
      }
    ],
    meta: {
      ritual: true
    },
    entries: [
      "For the duration, you sense the presence of magical effects within 30 feet of yourself. If you sense such effects, you can take the {@action Magic|XPHB} action to see a faint aura around any visible creature or object in the area that bears the magic, and if an effect was created by a spell, you learn the spell's {@book school of magic|XPHB|7|Schools of Magic}.",
      "The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead."
    ],
    classes: {
      fromClassList: [
        {
          name: "Bard",
          source: "XPHB"
        },
        {
          name: "Cleric",
          source: "XPHB"
        },
        {
          name: "Druid",
          source: "XPHB"
        },
        {
          name: "Ranger",
          source: "XPHB"
        },
        {
          name: "Sorcerer",
          source: "XPHB"
        },
        {
          name: "Warlock",
          source: "XPHB"
        },
        {
          name: "Wizard",
          source: "XPHB"
        },
        {
          name: "Paladin",
          source: "XPHB"
        },
        {
          name: "Artificer",
          source: "EFA"
        }
      ]
    },
    preparationStatus: "always_available",
    isFavorite: true
  },
  {
    id: "color-spray-xphb",
    name: "Color Spray",
    source: "XPHB",
    page: 251,
    level: 1,
    school: "I",
    time: [
      {
        number: 1,
        unit: "action"
      }
    ],
    range: {
      type: "cone",
      distance: {
        type: "feet",
        amount: 15
      }
    },
    components: {
      v: true,
      s: true,
      m: "a pinch of colorful sand"
    },
    duration: [
      {
        type: "instant"
      }
    ],
    entries: [
      "You launch a dazzling array of flashing, colorful light. Each creature in a 15-foot {@variantrule Cone [Area of Effect]|XPHB|Cone} originating from you must succeed on a Constitution saving throw or have the {@condition Blinded|XPHB} condition until the end of your next turn."
    ],
    conditionInflict: [
      "blinded"
    ],
    savingThrow: [
      "constitution"
    ],
    areaTags: [
      "N"
    ],
    classes: {
      fromClassList: [
        {
          name: "Bard",
          source: "XPHB"
        },
        {
          name: "Sorcerer",
          source: "XPHB"
        },
        {
          name: "Wizard",
          source: "XPHB"
        }
      ]
    },
    preparationStatus: "unprepared"
  },
  {
    id: "feather-fall-xphb",
    name: "Feather Fall",
    source: "XPHB",
    page: 271,
    level: 1,
    school: "T",
    time: [
      {
        number: 1,
        unit: "reaction",
        condition: "which you take when you or a creature you can see within 60 feet of you falls"
      }
    ],
    range: {
      type: "point",
      distance: {
        type: "feet",
        amount: 60
      }
    },
    components: {
      v: true,
      m: "a small feather or piece of down"
    },
    duration: [
      {
        type: "timed",
        duration: {
          type: "minute",
          amount: 1
        }
      }
    ],
    entries: [
      "Choose up to five falling creatures within range. A falling creature's rate of descent slows to 60 feet per round until the spell ends. If a creature lands before the spell ends, the creature takes no damage from the fall, and the spell ends for that creature."
    ],
    areaTags: [
      "MT"
    ],
    classes: {
      fromClassList: [
        {
          name: "Bard",
          source: "XPHB"
        },
        {
          name: "Sorcerer",
          source: "XPHB"
        },
        {
          name: "Wizard",
          source: "XPHB"
        },
        {
          name: "Artificer",
          source: "EFA"
        }
      ]
    },
    preparationStatus: "prepared"
  },
  {
    id: "web-xphb",
    name: "Web",
    source: "XPHB",
    page: 340,
    level: 2,
    school: "C",
    time: [
      {
        number: 1,
        unit: "action"
      }
    ],
    range: {
      type: "point",
      distance: {
        type: "feet",
        amount: 60
      }
    },
    components: {
      v: true,
      s: true,
      m: "a bit of spiderweb"
    },
    duration: [
      {
        type: "timed",
        duration: {
          type: "hour",
          amount: 1
        },
        concentration: true
      }
    ],
    entries: [
      "You conjure a mass of sticky webbing at a point within range. The webs fill a 20-foot {@variantrule Cube [Area of Effect]|XPHB|Cube} there for the duration. The webs are {@variantrule Difficult Terrain|XPHB}, and the area within them is {@variantrule Lightly Obscured|XPHB}.",
      "If the webs aren't anchored between two solid masses (such as walls or trees) or layered across a floor, wall, or ceiling, the web collapses on itself, and the spell ends at the start of your next turn. Webs layered over a flat surface have a depth of 5 feet.",
      "The first time a creature enters the webs on a turn or starts its turn there, it must succeed on a Dexterity saving throw or have the {@condition Restrained|XPHB} condition while in the webs or until it breaks free.",
      "A creature {@condition Restrained|XPHB} by the webs can take an action to make a Strength ({@skill Athletics|XPHB}) check against your spell save DC. If it succeeds, it is no longer {@condition Restrained|XPHB}.",
      "The webs are flammable. Any 5-foot {@variantrule Cube [Area of Effect]|XPHB|Cube} of webs exposed to fire burns away in 1 round, dealing {@damage 2d4} Fire damage to any creature that starts its turn in the fire."
    ],
    damageInflict: [
      "fire"
    ],
    conditionInflict: [
      "restrained"
    ],
    savingThrow: [
      "dexterity"
    ],
    abilityCheck: [
      "strength"
    ],
    miscTags: [
      "DFT",
      "OBS"
    ],
    areaTags: [
      "C"
    ],
    classes: {
      fromClassList: [
        {
          name: "Sorcerer",
          source: "XPHB"
        },
        {
          name: "Wizard",
          source: "XPHB"
        },
        {
          name: "Artificer",
          source: "EFA"
        }
      ]
    },
    preparationStatus: "prepared"
  },
  {
    id: "shatter-xphb",
    name: "Shatter",
    source: "XPHB",
    page: 316,
    level: 2,
    school: "V",
    time: [
      {
        number: 1,
        unit: "action"
      }
    ],
    range: {
      type: "point",
      distance: {
        type: "feet",
        amount: 60
      }
    },
    components: {
      v: true,
      s: true,
      m: "a chip of mica"
    },
    duration: [
      {
        type: "instant"
      }
    ],
    entries: [
      "A loud noise erupts from a point of your choice within range. Each creature in a 10-foot-radius {@variantrule Sphere [Area of Effect]|XPHB|Sphere} centered there makes a Constitution saving throw, taking {@damage 3d8} Thunder damage on a failed save or half as much damage on a successful one. A Construct has {@variantrule Disadvantage|XPHB} on the save.",
      "A nonmagical object that isn't being worn or carried also takes the damage if it's in the spell's area."
    ],
    entriesHigherLevel: [
      {
        type: "entries",
        name: "Using a Higher-Level Spell Slot",
        entries: [
          "The damage increases by {@scaledamage 3d8|2-9|1d8} for each spell slot level above 2."
        ]
      }
    ],
    damageInflict: [
      "thunder"
    ],
    savingThrow: [
      "constitution"
    ],
    miscTags: [
      "OBJ"
    ],
    areaTags: [
      "S"
    ],
    classes: {
      fromClassList: [
        {
          name: "Bard",
          source: "XPHB"
        },
        {
          name: "Sorcerer",
          source: "XPHB"
        },
        {
          name: "Wizard",
          source: "XPHB"
        }
      ]
    },
    preparationStatus: "prepared"
  },
  {
    id: "lightning-bolt-xphb",
    name: "Lightning Bolt",
    source: "XPHB",
    page: 292,
    level: 3,
    school: "V",
    time: [
      {
        number: 1,
        unit: "action"
      }
    ],
    range: {
      type: "line",
      distance: {
        type: "feet",
        amount: 100
      }
    },
    components: {
      v: true,
      s: true,
      m: "a bit of fur and a crystal rod"
    },
    duration: [
      {
        type: "instant"
      }
    ],
    entries: [
      "A stroke of lightning forming a 100-foot-long, 5-foot-wide {@variantrule Line [Area of Effect]|XPHB|Line} blasts out from you in a direction you choose. Each creature in the {@variantrule Line [Area of Effect]|XPHB|Line} makes a Dexterity saving throw, taking {@damage 8d6} Lightning damage on a failed save or half as much damage on a successful one."
    ],
    entriesHigherLevel: [
      {
        type: "entries",
        name: "Using a Higher-Level Spell Slot",
        entries: [
          "The damage increases by {@scaledamage 8d6|3-9|1d6} for each spell slot level above 3."
        ]
      }
    ],
    damageInflict: [
      "lightning"
    ],
    savingThrow: [
      "dexterity"
    ],
    miscTags: [
      "OBJ"
    ],
    areaTags: [
      "L"
    ],
    classes: {
      fromClassList: [
        {
          name: "Sorcerer",
          source: "XPHB"
        },
        {
          name: "Wizard",
          source: "XPHB"
        }
      ]
    },
    preparationStatus: "prepared",
    isFavorite: true
  },
  {
    id: "geas-xphb",
    name: "Geas",
    source: "XPHB",
    page: 278,
    level: 5,
    school: "E",
    time: [
      {
        number: 1,
        unit: "minute"
      }
    ],
    range: {
      type: "point",
      distance: {
        type: "feet",
        amount: 60
      }
    },
    components: {
      v: true
    },
    duration: [
      {
        type: "timed",
        duration: {
          type: "day",
          amount: 30
        }
      }
    ],
    entries: [
      "You give a verbal command to a creature that you can see within range, ordering it to carry out some service or refrain from an action or a course of activity as you decide. The target must succeed on a Wisdom saving throw or have the {@condition Charmed|XPHB} condition for the duration. The target automatically succeeds if it can't understand your command.",
      "While {@condition Charmed|XPHB}, the creature takes {@damage 5d10} Psychic damage if it acts in a manner directly counter to your command. It takes this damage no more than once each day.",
      "You can issue any command you choose, short of an activity that would result in certain death. Should you issue a suicidal command, the spell ends.",
      "A {@spell Remove Curse|XPHB}, {@spell Greater Restoration|XPHB}, or {@spell Wish|XPHB} spell ends this spell."
    ],
    entriesHigherLevel: [
      {
        type: "entries",
        name: "Using a Higher-Level Spell Slot",
        entries: [
          "If you use a level 7 or 8 spell slot, the duration is 365 days. If you use a level 9 spell slot, the spell lasts until it is ended by one of the spells mentioned above."
        ]
      }
    ],
    damageInflict: [
      "psychic"
    ],
    conditionInflict: [
      "charmed"
    ],
    savingThrow: [
      "wisdom"
    ],
    miscTags: [
      "PRM",
      "SGT"
    ],
    areaTags: [
      "ST"
    ],
    classes: {
      fromClassList: [
        {
          name: "Bard",
          source: "XPHB"
        },
        {
          name: "Cleric",
          source: "XPHB"
        },
        {
          name: "Druid",
          source: "XPHB"
        },
        {
          name: "Wizard",
          source: "XPHB"
        },
        {
          name: "Paladin",
          source: "XPHB"
        }
      ]
    },
    preparationStatus: "always_available"
  },
  // Core staples to make the spellbook immediately comprehensive
  {
    id: "mage-hand-phb",
    name: "Mage Hand",
    source: "PHB",
    level: 0,
    school: "C",
    time: [{ number: 1, unit: "action" }],
    range: { type: "point", distance: { type: "feet", amount: 30 } },
    components: { v: true, s: true },
    duration: [{ type: "timed", duration: { type: "minute", amount: 1 } }],
    entries: [
      "A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again.",
      "You can use your action to control the hand. You can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial. You can move the hand up to 30 feet each time you use it."
    ],
    classes: {
      fromClassList: [{ name: "Wizard", source: "PHB" }, { name: "Sorcerer", source: "PHB" }, { name: "Bard", source: "PHB" }, { name: "Warlock", source: "PHB" }]
    },
    preparationStatus: "always_available"
  },
  {
    id: "fire-bolt-phb",
    name: "Fire Bolt",
    source: "PHB",
    level: 0,
    school: "V",
    time: [{ number: 1, unit: "action" }],
    range: { type: "point", distance: { type: "feet", amount: 120 } },
    components: { v: true, s: true },
    duration: [{ type: "instant" }],
    entries: [
      "You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes {@damage 1d10} Fire damage. A flammable object hit by this spell ignites if it isn't being worn or carried."
    ],
    damageInflict: ["fire"],
    classes: {
      fromClassList: [{ name: "Wizard", source: "PHB" }, { name: "Sorcerer", source: "PHB" }, { name: "Artificer", source: "TCE" }]
    },
    preparationStatus: "always_available",
    isFavorite: true
  },
  {
    id: "shield-phb",
    name: "Shield",
    source: "PHB",
    level: 1,
    school: "A",
    time: [{ number: 1, unit: "reaction", condition: "which you take when you are hit by an attack or targeted by the magic missile spell" }],
    range: { type: "point", distance: { type: "self" } },
    components: { v: true, s: true },
    duration: [{ type: "timed", duration: { type: "round", amount: 1 } }],
    entries: [
      "An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile."
    ],
    classes: {
      fromClassList: [{ name: "Wizard", source: "PHB" }, { name: "Sorcerer", source: "PHB" }]
    },
    preparationStatus: "prepared",
    isFavorite: true
  },
  {
    id: "misty-step-phb",
    name: "Misty Step",
    source: "PHB",
    level: 2,
    school: "C",
    time: [{ number: 1, unit: "bonus action" }],
    range: { type: "point", distance: { type: "self" } },
    components: { v: true },
    duration: [{ type: "instant" }],
    entries: [
      "Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see."
    ],
    classes: {
      fromClassList: [{ name: "Wizard", source: "PHB" }, { name: "Sorcerer", source: "PHB" }, { name: "Warlock", source: "PHB" }]
    },
    preparationStatus: "prepared",
    isFavorite: true
  },
  {
    id: "fireball-phb",
    name: "Fireball",
    source: "PHB",
    level: 3,
    school: "V",
    time: [{ number: 1, unit: "action" }],
    range: { type: "point", distance: { type: "feet", amount: 150 } },
    components: { v: true, s: true, m: "a tiny ball of bat guano and sulfur" },
    duration: [{ type: "instant" }],
    entries: [
      "A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes {@damage 8d6} Fire damage on a failed save, or half as much damage on a successful one."
    ],
    entriesHigherLevel: [
      {
        type: "entries",
        name: "At Higher Levels",
        entries: ["When you cast this spell using a spell slot of 4th level or higher, the damage increases by {@scaledamage 8d6|3-9|1d6} for each slot level above 3rd."]
      }
    ],
    damageInflict: ["fire"],
    savingThrow: ["dexterity"],
    classes: {
      fromClassList: [{ name: "Wizard", source: "PHB" }, { name: "Sorcerer", source: "PHB" }]
    },
    preparationStatus: "prepared",
    isFavorite: true
  }
];
