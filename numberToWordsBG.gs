/**
 * Максимално поддържано число (999 999 999).
 * Лесно се променя, ако се добави поддръжка на по-големи числа.
 */
const MAX_SUPPORTED_NUMBER = 999999999;

// ============================================================================
// Езикови ресурси
// ============================================================================

/**
 * Думи за стотиците.
 */
const BG_HUNDREDS = [
    "",
"сто ",
"двеста ",
"триста ",
"четиристотин ",
"петстотин ",
"шестстотин ",
"седемстотин ",
"осемстотин ",
"деветстотин "
];

/**
 * Думи за десетиците.
 */
const BG_TENS = [
    "",
"",
"двадесет ",
"тридесет ",
"четиридесет ",
"петдесет ",
"шестдесет ",
"седемдесет ",
"осемдесет ",
"деветдесет "
];

/**
 * Думи за числата от 10 до 19.
 */
const BG_TEENS = [
    "десет ",
"единадесет ",
"дванадесет ",
"тринадесет ",
"четиринадесет ",
"петнадесет ",
"шестнадесет ",
"седемнадесет ",
"осемнадесет ",
"деветнадесет "
];

/**
 * Думи за единиците според граматичния род:
 *
 * m = мъжки род
 * f = женски род
 * n = среден род
 */
const BG_ONES = {
    m: [
	   "",
	   "един ",
	   "два ",
	   "три ",
	   "четири ",
	   "пет ",
	   "шест ",
	   "седем ",
	   "осем ",
	   "девет "
    ],

    f: [
	   "",
	   "една ",
	   "две ",
	   "три ",
	   "четири ",
	   "пет ",
	   "шест ",
	   "седем ",
	   "осем ",
	   "девет "
    ],

    n: [
	   "",
	   "едно ",
	   "две ",
	   "три ",
	   "четири ",
	   "пет ",
	   "шест ",
	   "седем ",
	   "осем ",
	   "девет "
    ]
};

/**
 * Думи, които не променят формата си според количеството.
 */
const BG_INVARIANT_UNITS = [
    "евро",
"кило",
"кг"
];

/**
 * Изрично зададени форми за мерни единици и валути.
 *
 * one   = форма при стойност 1
 * other = форма след числително, различно от 1
 */
const BG_IRREGULAR_UNITS = {
    "стотинка": {
	   one: "стотинка",
	   other: "стотинки"
    },

    "минута": {
	   one: "минута",
	   other: "минути"
    },

    "година": {
	   one: "година",
	   other: "години"
    },

    "страница": {
	   one: "страница",
	   other: "страници"
    },

    // Валути и мерни единици

    "лев": {
	   one: "лев",
	   other: "лева"
    },

    "долар": {
	   one: "долар",
	   other: "долара"
    },

    "цент": {
	   one: "цент",
	   other: "цента"
    },

    "паунд": {
	   one: "паунд",
	   other: "паунда"
    },

    "йена": {
	   one: "йена",
	   other: "йени"
    },

    "форинт": {
	   one: "форинт",
	   other: "форинта"
    },

    "динар": {
	   one: "динар",
	   other: "динара"
    },

    "крона": {
	   one: "крона",
	   other: "крони"
    },

    "рубла": {
	   one: "рубла",
	   other: "рубли"
    },

    "литър": {
	   one: "литър",
	   other: "литра"
    }
};

// ============================================================================
// Основни функции
// ============================================================================

/**
 * Преобразува парична сума в думи на български език.
 *
 * Примери:
 * =inWordsBG(123.45; "лев"; "стотинка")
 * =inWordsBG(12.50; "долар"; "цент")
 * =inWordsBG(1001000; "евро"; "цент")
 *
 * @param {number} amount Сумата
 * @param {string} mainUnit Основна парична единица
 * @param {string} subUnit Дробна парична единица, равна на 1/100 от основната
 * @returns {string}
 * @customfunction
 */
function inWordsBG(amount, mainUnit, subUnit) {
    amount = Number(amount);

    if (!isFinite(amount)) {
	   return "";
    }

    const negative = amount < 0 ? "минус " : "";
    amount = Math.abs(amount);

    /*
	* Преобразуваме сумата в цял брой стотни, за да избегнем
	* проблеми с двоичната аритметика на JavaScript.
	*/
    const totalSub = Math.round(amount * 100);
    const main = Math.floor(totalSub / 100);
    const sub = totalSub % 100;

    const mainText = numberToWordsBG(main, mainUnit);
    const subText =
    sub > 0
    ? " и " + numberToWordsBG(sub, subUnit)
    : "";

    return negative + mainText + subText;
}

/**
 * Преобразува цяло число в думи и добавя мерната единица.
 *
 * Примери:
 * =numberToWordsBG(2; "литър")
 * =numberToWordsBG(25; "страница")
 * =numberToWordsBG(1001; "година")
 *
 * @param {number} num Цялото число
 * @param {string} unitName Мерната единица
 * @returns {string}
 * @customfunction
 */
function numberToWordsBG(num, unitName) {
    num = Math.floor(Math.abs(Number(num)));

    if (!isFinite(num)) {
	   return "";
    }

    if (num > MAX_SUPPORTED_NUMBER) {
	   return `[Поддържат се числа до ${
		  MAX_SUPPORTED_NUMBER.toLocaleString("bg-BG")
	   }]`;
    }

    if (num === 0) {
	   return "нула " + pluralBG(unitName, 0);
    }

    const gender = detectGender(unitName);
    const words = convertNumberBG(num, gender).trim();

    return words + " " + pluralBG(unitName, num);
}

/**
 * Определя граматичния род на мерната единица.
 *
 * @param {string} unit Мерната единица
 * @returns {"m"|"f"|"n"}
 */
function detectGender(unit) {
    unit = String(unit).toLowerCase().trim();

    if (unit.endsWith("а") || unit.endsWith("я")) {
	   return "f";
    }

    if (unit.endsWith("о") || unit.endsWith("е")) {
	   return "n";
    }

    return "m";
}

/**
 * Връща подходящата форма на мерната единица.
 *
 * @param {string} unit Мерната единица в единствено число
 * @param {number} value Количеството
 * @returns {string}
 */
function pluralBG(unit, value) {
    unit = String(unit).toLowerCase().trim();
    value = Math.abs(Number(value));

    if (BG_INVARIANT_UNITS.includes(unit)) {
	   return unit;
    }

    const irregularUnit = BG_IRREGULAR_UNITS[unit];

    if (irregularUnit) {
	   return value === 1
	   ? irregularUnit.one
	   : irregularUnit.other;
    }

    if (value === 1) {
	   return unit;
    }

    /*
	* Общо правило за поддържаните съществителни
	* от женски род:
	*
	* кутия → кутии
	* валута → валути
	*/
    if (unit.endsWith("а") || unit.endsWith("я")) {
	   return unit.slice(0, -1) + "и";
    }

    /*
	* Общо правило за бройната форма на поддържаните
	* съществителни от мъжки род:
	*
	* долар → долара
	* цент → цента
	*
	* Изключения като „литър → литра“ са описани
	* изрично в BG_IRREGULAR_UNITS.
	*/
    return unit + "а";
}

/**
 * Преобразува число от 1 до MAX_SUPPORTED_NUMBER в думи.
 *
 * @param {number} num Числото
 * @param {"m"|"f"|"n"} gender Родът на крайната мерна единица
 * @returns {string}
 */
function convertNumberBG(num, gender) {
    num = Math.floor(Math.abs(Number(num)));

    if (!isFinite(num)) {
	   return "";
    }

    /**
	* Преобразува число от 1 до 999 в думи.
	*
	* @param {number} value Числото
	* @param {"m"|"f"|"n"} localGender Граматичният род
	* @returns {string}
	*/
    function convertBelow1000(value, localGender) {
	   value = Math.floor(Math.abs(value));

	   if (value === 0) {
		  return "";
	   }

	   localGender = BG_ONES[localGender]
	   ? localGender
	   : "m";

	   const currentOnes = BG_ONES[localGender];

	   let result = "";

	   const hundreds = Math.floor(value / 100);
	   const rest = value % 100;
	   const tens = Math.floor(rest / 10);
	   const ones = rest % 10;

	   /*
	    * Числата от 10 до 19:
	    *
	    * 15  → петнадесет
	    * 115 → сто и петнадесет
	    */
	   if (tens === 1) {
		  if (hundreds > 0) {
			 result += BG_HUNDREDS[hundreds] + "и ";
		  }

		  result += BG_TEENS[ones];

		  return result;
	   }

	   if (hundreds > 0) {
		  result += BG_HUNDREDS[hundreds];
	   }

	   /*
	    * Точно число стотици:
	    *
	    * 100 → сто
	    * 300 → триста
	    */
	   if (tens === 0 && ones === 0) {
		  return result;
	   }

	   /*
	    * Само единици или стотици и единици:
	    *
	    * 6   → шест
	    * 106 → сто и шест
	    */
	   if (tens === 0 && ones > 0) {
		  if (hundreds > 0) {
			 result += "и ";
		  }

		  result += currentOnes[ones];

		  return result;
	   }

	   /*
	    * Точно число десетици или стотици и десетици:
	    *
	    * 30  → тридесет
	    * 130 → сто и тридесет
	    */
	   if (tens > 0 && ones === 0) {
		  if (hundreds > 0) {
			 result += "и ";
		  }

		  result += BG_TENS[tens];

		  return result;
	   }

	   /*
	    * Десетици и единици:
	    *
	    * 36  → тридесет и шест
	    * 136 → сто тридесет и шест
	    */
	   result += BG_TENS[tens] + "и " + currentOnes[ones];

	   return result;
    }

    let result = "";

    /*
	* Милионите са в мъжки род:
	*
	* един милион
	* два милиона
	*/
    const millions = Math.floor(num / 1000000);

    if (millions > 0) {
	   result +=
	   millions === 1
	   ? "един милион "
	   : convertBelow1000(millions, "m") + "милиона ";
    }

    num %= 1000000;

    /*
	* Хилядите са в женски род:
	*
	* хиляда
	* две хиляди
	*/
    const thousands = Math.floor(num / 1000);

    if (thousands > 0) {
	   /*
	    * Добавяме „и“ между милионите и хилядите, когато
	    * хилядната група е под 100 или е точно число стотици.
	    *
	    * 1 001 000 → един милион и хиляда
	    * 1 025 000 → един милион и двадесет и пет хиляди
	    * 1 100 000 → един милион и сто хиляди
	    * 1 125 000 → един милион сто двадесет и пет хиляди
	    */
	   if (millions > 0 && needsConjunction(thousands)) {
		  result += "и ";
	   }

	   result +=
	   thousands === 1
	   ? "хиляда "
	   : convertBelow1000(thousands, "f") + "хиляди ";
    }

    num %= 1000;

    /*
	* Последната група използва рода на крайната
	* мерна единица.
	*
	* 1 001 → хиляда и един
	* 1 020 → хиляда и двадесет
	* 1 100 → хиляда и сто
	* 1 125 → хиляда сто двадесет и пет
	*/
    if (num > 0) {
	   const hasHigherGroup =
	   millions > 0 || thousands > 0;

	   if (hasHigherGroup && needsConjunction(num)) {
		  result += "и ";
	   }

	   result += convertBelow1000(num, gender);
    }

    return result;
}

/**
 * Определя дали трябва да се добави „и“ пред числова група.
 *
 * Добавя се, когато групата е:
 *
 * - под 100;
 * - точно число стотици.
 *
 * @param {number} value Числовата група
 * @returns {boolean}
 */
function needsConjunction(value) {
    value = Math.floor(Math.abs(Number(value)));

    if (!isFinite(value) || value === 0) {
	   return false;
    }

    return value < 100 || value % 100 === 0;
}

// ============================================================================
// Удобни функции за Google Sheets
// ============================================================================

/**
 * Преобразува сума в левове.
 *
 * Пример:
 * =BGLEV(123.45)
 *
 * @param {number} n Сумата
 * @returns {string}
 * @customfunction
 */
function BGLEV(n) {
    return inWordsBG(n, "лев", "стотинка");
}

/**
 * Преобразува сума в евро.
 *
 * Пример:
 * =BGEURO(123.45)
 *
 * @param {number} n Сумата
 * @returns {string}
 * @customfunction
 */
function BGEURO(n) {
    return inWordsBG(n, "евро", "цент");
}

/**
 * Кратък псевдоним за BGLEV.
 *
 * @param {number} n Сумата
 * @returns {string}
 * @customfunction
 */
function LEV(n) {
    return BGLEV(n);
}

/**
 * Кратък псевдоним за BGEURO.
 *
 * @param {number} n Сумата
 * @returns {string}
 * @customfunction
 */
function EVRO(n) {
    return BGEURO(n);
}