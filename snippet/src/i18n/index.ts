import i18n, {InitOptions} from 'i18next'
import {initReactI18next} from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入语言包
import enUS from './locales/en-US'
import zhCN from './locales/zh-CN'

i18n
    // 自动检测用户语言（浏览器设置、localStorage等）
    .use(LanguageDetector)
    // React 绑定
    .use(initReactI18next)
    .init({
        // 默认语言
        fallbackLng: 'zh-CN',
        // 开发时可设为 true 查看加载日志
        debug: false,
        interpolation: {
            // React 已经自动防止 XSS
            escapeValue: false,
        },
        resources: {
            'en-US': {translation: enUS},
            'zh-CN': {translation: zhCN},
        },
        detection: {
            // 指定检测顺序和缓存方式
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    })

export default i18n