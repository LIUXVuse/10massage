import { LanguageType } from "@/context/language-context";

// 翻譯字典類型
type TranslationDict = {
  [key: string]: {
    [lang in LanguageType]: string;
  };
};

// 翻譯字典
export const translations: TranslationDict = {
  // 通用翻譯
  "app.name": {
    "zh-TW": "伊林SPA",
    "zh-CN": "伊林SPA",
    "en": "Eilin SPA",
    "ja": "エイリンSPA"
  },
  "app.description": {
    "zh-TW": "專業的按摩預約服務",
    "zh-CN": "专业的按摩预约服务",
    "en": "Professional massage booking service",
    "ja": "プロフェッショナルなマッサージ予約サービス"
  },
  "app.loading": {
    "zh-TW": "載入中",
    "zh-CN": "加载中",
    "en": "Loading",
    "ja": "読み込み中"
  },
  
  // 導航
  "nav.dashboard": {
    "zh-TW": "控制面板",
    "zh-CN": "控制面板",
    "en": "Dashboard",
    "ja": "ダッシュボード"
  },
  "nav.masseurs": {
    "zh-TW": "按摩師",
    "zh-CN": "按摩师",
    "en": "Masseurs",
    "ja": "マッサージ師"
  },
  "nav.services": {
    "zh-TW": "服務項目",
    "zh-CN": "服务项目",
    "en": "Services",
    "ja": "サービス"
  },
  "nav.userManagement": {
    "zh-TW": "用戶管理",
    "zh-CN": "用户管理",
    "en": "User Management",
    "ja": "ユーザー管理"
  },
  "nav.systemManagement": {
    "zh-TW": "系統管理",
    "zh-CN": "系统管理",
    "en": "System Management",
    "ja": "システム管理"
  },
  
  // 角色
  "role.admin": {
    "zh-TW": "管理員",
    "zh-CN": "管理员",
    "en": "Admin",
    "ja": "管理者"
  },
  "role.masseur": {
    "zh-TW": "按摩師",
    "zh-CN": "按摩师",
    "en": "Masseur",
    "ja": "マッサージ師"
  },
  "role.member": {
    "zh-TW": "會員",
    "zh-CN": "会员",
    "en": "Member",
    "ja": "会員"
  },
  
  // 預約相關
  "appointment.title": {
    "zh-TW": "預約服務",
    "zh-CN": "预约服务",
    "en": "Book a Service",
    "ja": "サービスを予約"
  },
  "appointment.selectService": {
    "zh-TW": "選擇服務",
    "zh-CN": "选择服务",
    "en": "Select Service",
    "ja": "サービスを選択"
  },
  "appointment.selectServiceDesc": {
    "zh-TW": "請選擇您想要的按摩服務和時長",
    "zh-CN": "请选择您想要的按摩服务和时长",
    "en": "Please select the massage service and duration you want",
    "ja": "マッサージサービスと時間を選択してください"
  },
  "appointment.selectMasseur": {
    "zh-TW": "選擇按摩師",
    "zh-CN": "选择按摩师",
    "en": "Select Masseur",
    "ja": "マッサージ師を選択"
  },
  "appointment.selectMasseurDesc": {
    "zh-TW": "請選擇您偏好的按摩師",
    "zh-CN": "请选择您偏好的按摩师",
    "en": "Please select your preferred masseur",
    "ja": "ご希望のマッサージ師を選択してください"
  },
  "appointment.selectTime": {
    "zh-TW": "選擇時間",
    "zh-CN": "选择时间",
    "en": "Select Time",
    "ja": "時間を選択"
  },
  "appointment.selectTimeDesc": {
    "zh-TW": "請選擇您方便的日期和時間",
    "zh-CN": "请选择您方便的日期和时间",
    "en": "Please select a convenient date and time",
    "ja": "ご都合のよい日時を選択してください"
  },
  "appointment.confirm": {
    "zh-TW": "確認預約",
    "zh-CN": "确认预约",
    "en": "Confirm Booking",
    "ja": "予約を確認"
  },
  "appointment.confirmDesc": {
    "zh-TW": "請確認您的預約詳情",
    "zh-CN": "请确认您的预约详情",
    "en": "Please confirm your booking details",
    "ja": "予約詳細を確認してください"
  },
  "appointment.next": {
    "zh-TW": "下一步",
    "zh-CN": "下一步",
    "en": "Next",
    "ja": "次へ"
  },
  "appointment.previous": {
    "zh-TW": "上一步",
    "zh-CN": "上一步",
    "en": "Previous",
    "ja": "戻る"
  },
  
  // 時間相關
  "time.minutes": {
    "zh-TW": "分鐘",
    "zh-CN": "分钟",
    "en": "min",
    "ja": "分"
  },
  "time.hours": {
    "zh-TW": "小時",
    "zh-CN": "小时",
    "en": "hr",
    "ja": "時間"
  },
  
  // 用戶認證
  "auth.login": {
    "zh-TW": "登入",
    "zh-CN": "登录",
    "en": "Login",
    "ja": "ログイン"
  },
  "auth.register": {
    "zh-TW": "註冊",
    "zh-CN": "注册",
    "en": "Register",
    "ja": "登録"
  },
  "auth.logout": {
    "zh-TW": "退出登入",
    "zh-CN": "退出登录",
    "en": "Logout",
    "ja": "ログアウト"
  },
  "auth.email": {
    "zh-TW": "電子郵件",
    "zh-CN": "电子邮件",
    "en": "Email",
    "ja": "メールアドレス"
  },
  "auth.password": {
    "zh-TW": "密碼",
    "zh-CN": "密码",
    "en": "Password",
    "ja": "パスワード"
  },
  
  // 語言選擇
  "language.zhTW": {
    "zh-TW": "繁體中文",
    "zh-CN": "繁体中文",
    "en": "Traditional Chinese",
    "ja": "繁体字中国語"
  },
  "language.zhCN": {
    "zh-TW": "簡體中文",
    "zh-CN": "简体中文",
    "en": "Simplified Chinese",
    "ja": "簡体字中国語"
  },
  "language.en": {
    "zh-TW": "英文",
    "zh-CN": "英文",
    "en": "English",
    "ja": "英語"
  },
  "language.ja": {
    "zh-TW": "日文",
    "zh-CN": "日文",
    "en": "Japanese",
    "ja": "日本語"
  },
  "language.select": {
    "zh-TW": "選擇語言",
    "zh-CN": "选择语言",
    "en": "Select Language",
    "ja": "言語を選択"
  },
  
  // 錯誤訊息
  "error.logoutFailed": {
    "zh-TW": "退出登入時發生錯誤",
    "zh-CN": "退出登录时发生错误",
    "en": "Error logging out",
    "ja": "ログアウト中にエラーが発生しました"
  },
  "error.fetchServicesFailed": {
    "zh-TW": "獲取服務列表失敗",
    "zh-CN": "获取服务列表失败",
    "en": "Failed to fetch services",
    "ja": "サービスの取得に失敗しました"
  },
  "error.fetchMasseursFailed": {
    "zh-TW": "獲取按摩師列表失敗",
    "zh-CN": "获取按摩师列表失败",
    "en": "Failed to fetch masseurs",
    "ja": "マッサージ師の取得に失敗しました"
  },
  "error.bookingFailed": {
    "zh-TW": "預約失敗",
    "zh-CN": "预约失败",
    "en": "Booking failed",
    "ja": "予約に失敗しました"
  },
  
  // 頁腳
  "footer.copyright": {
    "zh-TW": "保留所有權利",
    "zh-CN": "保留所有权利",
    "en": "All rights reserved",
    "ja": "全著作権所有"
  }
};

// 獲取翻譯的函數
export const t = (key: string, language: LanguageType): string => {
  // 檢查鍵是否存在
  if (!translations[key]) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  // 返回對應語言的翻譯，如果找不到則返回繁體中文版本
  return translations[key][language] || translations[key]["zh-TW"];
}; 