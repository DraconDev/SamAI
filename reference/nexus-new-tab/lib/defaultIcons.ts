export type IconType = {
    id: number;
    name: string;
    link: string;
    order: number;
    imageUrl?: string;
};

export const defaultIcons: IconType[] = [
    {
        id: 1,
        name: "GitHub",
        link: "https://github.com",
        order: 1,
        imageUrl:
            "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    },
    {
        id: 2,
        name: "Gmail",
        link: "https://mail.google.com",
        order: 2,
        imageUrl:
            "https://www.google.com/gmail/about/static-2.0/images/logo-gmail.png",
    },
    {
        id: 3,
        name: "YouTube",
        link: "https://youtube.com",
        order: 3,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/2048px-YouTube_social_white_square_%282017%29.svg.png",
    },
    {
        id: 4,
        name: "Reddit",
        link: "https://reddit.com",
        order: 4,
        imageUrl:
            "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
    },
    {
        id: 5,
        name: "Twitter",
        link: "https://twitter.com",
        order: 5,
        imageUrl:
            "https://abs.twimg.com/responsive-web/client-web/icon-ios.b1fc727a.png",
    },
    {
        id: 6,
        name: "LinkedIn",
        link: "https://linkedin.com",
        order: 6,
        imageUrl:
            "https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca",
    },
    {
        id: 7,
        name: "Netflix",
        link: "https://netflix.com",
        order: 7,
        imageUrl:
            "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.png",
    },
    {
        id: 8,
        name: "Amazon",
        link: "https://amazon.com",
        order: 8,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/2500px-Amazon_icon.svg.png",
    },
    {
        id: 9,
        name: "Google Drive",
        link: "https://drive.google.com",
        order: 9,
        imageUrl:
            "https://ssl.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png",
    },
    {
        id: 10,
        name: "Google Calendar",
        link: "https://calendar.google.com",
        order: 10,
        imageUrl:
            "https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png",
    },
    {
        id: 11,
        name: "Spotify",
        link: "https://open.spotify.com",
        order: 11,
        imageUrl: "https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico",
    },
    {
        id: 12,
        name: "Discord",
        link: "https://discord.com/app",
        order: 12,
        imageUrl:
            "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png",
    },
    {
        id: 13,
        name: "ChatGPT",
        link: "https://chat.openai.com",
        order: 13,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1200px-ChatGPT_logo.svg.png",
    },
    {
        id: 14,
        name: "Google Photos",
        link: "https://photos.google.com",
        order: 14,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Google_Photos_icon_%282015-2020%29.svg/2048px-Google_Photos_icon_%282015-2020%29.svg.png",
    },
    {
        id: 15,
        name: "Google Maps",
        link: "https://maps.google.com",
        order: 15,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Google_Maps_icon_%282020%29.svg/1200px-Google_Maps_icon_%282020%29.svg.png",
    },
    {
        id: 16,
        name: "Google Docs",
        link: "https://docs.google.com",
        order: 16,
        imageUrl:
            "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",
    },
    {
        id: 17,
        name: "Twitch",
        link: "https://twitch.tv",
        order: 17,
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Twitch_logo.svg/2560px-Twitch_logo.svg.png",
    },
    {
        id: 18,
        name: "Wikipedia",
        link: "https://wikipedia.org",
        order: 18,
        imageUrl: "https://www.wikipedia.org/static/apple-touch/wikipedia.png",
    },
    {
        id: 19,
        name: "Stack Overflow",
        link: "https://stackoverflow.com",
        order: 19,
        imageUrl:
            "https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png",
    },
    {
        id: 20,
        name: "TikTok",
        link: "https://tiktok.com",
        order: 20,
        imageUrl:
            "https://sf16-scmcdn-va.ibytedtos.com/goofy/tiktok/web/node/_next/static/images/logo-dark-e95da587b6efa1520dcd11f4b45c0cf6.svg",
    },
    {
        id: 21,
        name: "Notion",
        link: "https://notion.so",
        order: 21,
        imageUrl: "https://www.notion.so/images/logo-ios.png",
    },
    {
        id: 22,
        name: "Figma",
        link: "https://figma.com",
        order: 22,
        imageUrl: "https://static.figma.com/app/icon/1/touch-180.png",
    },
    {
        id: 23,
        name: "Dropbox",
        link: "https://dropbox.com",
        order: 23,
        imageUrl:
            "https://aem.dropbox.com/cms/content/dam/dropbox/www/en-us/branding/app-dropbox-ios.png",
    },
    {
        id: 24,
        name: "Vercel",
        link: "https://vercel.com",
        order: 24,
        imageUrl:
            "https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png",
    },
    {
        id: 25,
        name: "Google Keep",
        link: "https://keep.google.com",
        order: 25,
        imageUrl: "https://ssl.gstatic.com/keep/keep_2020q4v2.ico",
    },
];
