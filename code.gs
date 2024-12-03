let isLoading = false; // متغیر برای مدیریت وضعیت بارگذاری


function doGet() {
    return HtmlService.createHtmlOutputFromFile('index')
        .setTitle('SJR Search');
}

function searchData(magazineName, year, searchType) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (searchType === "year") {
    const sheetName = year.toString(); // نام شیت بر اساس سال
    const sheet = spreadsheet.getSheetByName(sheetName);

    // بررسی وجود شیت
    if (!sheet) {
      return [["اطلاعات مربوط به سال وارد شده یافت نشد", "", ""]];
    }

    const data = sheet.getDataRange().getValues();

    // بررسی وجود داده‌ها
    if (data.length === 0) {
      return [["اطلاعاتی یافت نشد", "", ""]];
    }

    // پیدا کردن ایندکس سال
    const yearRow = data[0]; 
    const yearIndex = yearRow.findIndex(cell => cell.toString().trim() === year.toString().trim());

    if (yearIndex === -1) {
      return [["سال وارد شده یافت نشد", "", ""]];
    }

    const results = [];

    // جستجو در ستون عنوان
    for (let i = 1; i < data.length; i++) {
      const journalTitle = data[i][yearIndex]; // عنوان مجله در ستون سال تطابق‌یافته
      if (journalTitle && journalTitle.toLowerCase().includes(magazineName.toLowerCase())) {
        results.push([data[i][yearIndex], journalTitle, data[i][yearIndex + 1], data[i][yearIndex + 2]]); // اطلاعات دسته‌بندی و ضریب تأثیر
      }
    }

    if (results.length === 0) {
      return [["نتیجه‌ای یافت نشد", "", ""]];
    }

    results.sort((a, b) => a[1].localeCompare(b[1])); // مرتب‌سازی بر اساس عنوان مجله

    return results;

  } else {
    // حالت جستجو بر اساس عنوان مجله
    const sheets = spreadsheet.getSheets();
    const results = [];

    sheets.forEach(sheet => {
      const data = sheet.getDataRange().getValues();
      const year = sheet.getName(); // نام شیت به عنوان سال

      if (data.length === 0) {
        return;
      }

      // پیدا کردن ایندکس سال
      const yearRow = data[0]; 
      const yearIndex = yearRow.findIndex(cell => cell.toString().trim() === year.trim());

      if (yearIndex === -1) {
        return;
      }

      for (let i = 1; i < data.length; i++) {
        const journalTitle = data[i][yearIndex]; // عنوان مجله در ستون سال تطابق‌یافته
        if (journalTitle && journalTitle.toLowerCase() === magazineName.toLowerCase()) {
          results.push([year, journalTitle, data[i][yearIndex + 1], data[i][yearIndex + 2]]);
        }
      }
    });

    if (results.length === 0) {
      return [["نتیجه‌ای یافت نشد", "", ""]];
    }

    results.sort((a, b) => a[0].localeCompare(b[0])); // مرتب‌سازی بر اساس سال

    return results;
  }
}
