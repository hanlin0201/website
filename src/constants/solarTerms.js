// src/constants/solarTerms.js

// 简易版节气日期速查（真实节气是按天文算法，这里用固定日期范围做近似，误差1天左右）
export const SOLAR_TERMS_LOOKUP = [
    { name: '小寒', month: 1, day: 5 }, { name: '大寒', month: 1, day: 20 },
    { name: '立春', month: 2, day: 3 }, { name: '雨水', month: 2, day: 18 },
    { name: '惊蛰', month: 3, day: 5 }, { name: '春分', month: 3, day: 20 },
    { name: '清明', month: 4, day: 4 }, { name: '谷雨', month: 4, day: 19 },
    { name: '立夏', month: 5, day: 5 }, { name: '小满', month: 5, day: 20 },
    { name: '芒种', month: 6, day: 5 }, { name: '夏至', month: 6, day: 21 },
    { name: '小暑', month: 7, day: 6 }, { name: '大暑', month: 7, day: 22 },
    { name: '立秋', month: 8, day: 7 }, { name: '处暑', month: 8, day: 22 },
    { name: '白露', month: 9, day: 7 }, { name: '秋分', month: 9, day: 22 },
    { name: '寒露', month: 10, day: 8 }, { name: '霜降', month: 10, day: 23 },
    { name: '立冬', month: 11, day: 7 }, { name: '小雪', month: 11, day: 22 },
    { name: '大雪', month: 12, day: 6 }, { name: '冬至', month: 12, day: 21 }
  ];
  
  export function getCurrentSolarTerm() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 简单的查找逻辑：找到当前日期之前的最后一个节气
    // 1. 排序
    const sorted = SOLAR_TERMS_LOOKUP.sort((a, b) => {
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });
  
    // 2. 倒序查找
    let current = sorted[sorted.length - 1]; 
    for (let i = sorted.length - 1; i >= 0; i--) {
      const term = sorted[i];
      if (month > term.month || (month === term.month && day >= term.day)) {
        current = term;
        break;
      }
    }
    return current; // 返回对象 { name: '立春', ... }
  }