import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入语言包
import en from './locales/en-US'
import zh from './locales/zh-CN'

i18n
    .use(LanguageDetector) // 自动检测用户语言（浏览器设置、localStorage等）
    .use(initReactI18next) // React 绑定
    .init({
        fallbackLng: 'zh', // 默认语言
        debug: false,       // 开发时可设为 true 查看加载日志
        interpolation: {
            escapeValue: false, // React 已经自动防止 XSS
        },
        resources: {
            en: {translation: en},
            zh: {translation: zh},
        },
        detection: {
            // 可选：指定检测顺序和缓存方式
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    })

export default i18n