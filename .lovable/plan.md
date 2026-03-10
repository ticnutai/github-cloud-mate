
# תוכנית: הזזת המודל כולו (Model Move/Position)

## מה נבנה
פאנל בקרת מיקום למודל כולו — אפשרות לגרור או להזיז את המודל בסצנה עם כפתורי X/Y/Z, סליידרים, ואיפוס מיקום.

## שינויים

### 1. viewerStore — הוספת מצב מיקום מודל
- הוספת `modelPosition: [x, y, z]` ו-`setModelPosition`
- הוספת `resetModelPosition` לאיפוס ל-`[0,0,0]`

### 2. SceneCanvas — עטיפת המודל ב-group עם position
- עטיפת `<primitive>` ב-`<group position={modelPosition}>` שנקרא מה-store
- המודל ינוע בזמן אמת לפי הערכים

### 3. פאנל חדש: ModelPositionPanel
- כפתורי +/- לכל ציר (X, Y, Z) עם step מוגדר
- סליידרים לתנועה חלקה (טווח -5 עד +5)
- שדות מספריים לערכי מיקום מדויקים
- כפתור איפוס מיקום
- כפתור "מרכז" שמחזיר ל-0,0,0
- עברית + RTL

### 4. ViewerPage — שילוב הפאנל
- הוספת Section חדש "הזזת מודל" (אייקון Move) בסיידבר

## סדר ביצוע
1. עדכון store עם modelPosition
2. עדכון SceneCanvas לקרוא את המיקום
3. יצירת ModelPositionPanel
4. שילוב ב-ViewerPage
