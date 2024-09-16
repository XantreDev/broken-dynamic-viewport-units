# Broken dynamic viewport units

Reproduction of unstable work of dynamic viewport units in different browsers on IOS (maybe there is also android browsers, but I failed to reproduce the behvaiour) 

Browsers that misreport `svh`, `lvh` units
 - Firefox Focus (iOS)
 - Brave (iOS)
 - Arc (iOS)
 - Opera (iOS)
 - [Telegram Webview (iOS)](https://github.com/TelegramMessenger/Telegram-iOS/issues/1551)

[dynamic-viewport.webm](https://github.com/user-attachments/assets/1eae0f59-e93b-4b45-be80-eb2b645c8da0)

This behaviour causes cumulative layout shift when `min-height: 100lvh` used 

[dynamic-viewport-cls.webm](https://github.com/user-attachments/assets/16dd921a-c0a9-4ced-9798-55eb6ce5056c)
