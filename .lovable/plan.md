

## תוכנית: ארגון מחדש של הסיידבר והממשק

### הבעיה הנוכחית
הסיידבר מכיל **13 סקשנים** שטוחים ללא קיבוץ לוגי, עם טקסט קטן מדי (9-11px), כפתורים צפופים, וחוסר היררכיה ויזואלית. קשה למצוא פונקציות ולהבין את המבנה.

### מה ישתנה

**1. קיבוץ לטאבים (3 טאבים ראשיים)**

```text
┌─────────────────────────────────┐
│  👁 תצוגה  │  🔧 כלים  │  📚 ספריה  │
├─────────────────────────────────┤
│                                 │
│  (תוכן הטאב הנבחר)             │
│                                 │
└─────────────────────────────────┘
```

- **תצוגה (View)**: X-Ray, מצלמה, מבנים/שכבות, InfoBar
- **כלים (Tools)**: הדמיה מקצועית, ניתוח, כלים מתקדמים (ייצוא/סימניות/גריד), הזזת מודל, כיול XYZ, מצב לימוד
- **ספריה (Library)**: ספריה ישירה, השוואת מודלים, עורך שכבות, פרופילי Workspace

**2. שיפורי עיצוב וגדלים**
- גודל טקסט בסיסי יעלה מ-`10-11px` ל-`12-13px`
- כפתורים יגדלו מ-`py-1` ל-`py-1.5` עם `text-xs` (12px)
- Section headers יגדלו ל-`text-sm` (14px) עם font-semibold
- רווחים (`gap`) יגדלו לנשימה ויזואלית
- אייקונים יגדלו מ-`3.5` ל-`4`

**3. Section component משופר**
- קו אינדיקטור זהב בצד ימין כשהסקשן פתוח
- padding מוגדל ועקבי

**4. סיידבר header**
- בורר המודל יגדל ויהיה בולט יותר
- כפתור הקומפוזר יקבל סטייל ברור יותר

**5. InfoBar ישולב בתוך header הסיידבר** במקום להיות סקשן נפרד

### קבצים שישתנו
- `src/pages/ViewerPage.tsx` — ארגון מחדש לטאבים, Section משופר, גדלים
- `src/components/viewer/XRayPanel.tsx` — גדלי טקסט וכפתורים
- `src/components/viewer/CameraControls.tsx` — גדלי טקסט וכפתורים
- `src/components/viewer/ProToolsPanel.tsx` — גדלי טקסט וכפתורים
- `src/components/viewer/AnalysisPanel.tsx` — גדלי טקסט וכפתורים
- `src/components/viewer/AdvancedToolsPanel.tsx` — גדלי טקסט וכפתורים
- `src/components/viewer/StudyModePanel.tsx` — גדלי טקסט וכפתורים
- `src/components/viewer/LayerManagerPanel.tsx` — גדלי טקסט וכפתורים
- `src/components/viewer/DirectLibraryPanel.tsx` — גדלי טקסט וכפתורים
- `src/components/viewer/CompareModelsPanel.tsx` — גדלי טקסט וכפתורים
- `src/components/viewer/WorkspaceProfiles.tsx` — גדלי טקסט וכפתורים
- `src/components/viewer/XYZPanel.tsx` — גדלי טקסט וכפתורים
- `src/components/viewer/ModelPositionPanel.tsx` — גדלי טקסט וכפתורים
- `src/components/viewer/InfoBar.tsx` — עיצוב קומפקטי יותר

### עקרונות
- **אין שינוי בלוגיקה** — רק ארגון ועיצוב
- כל ה-store hooks וה-callbacks נשארים זהים
- הפונקציונליות של כל פאנל לא נפגעת

