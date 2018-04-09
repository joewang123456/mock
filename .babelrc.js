{
    "presets": [
        "es2015",
        "stage-0",
        "react"
    ],
        "plugins": [
            ["transform-decorators-legacy"],
            [
                "import",
                [
                    {
                        "libraryName": "antd-mobile",
                        "libraryDirectory": 'es',
                        "style": "css"
                    },
                    {
                        "libraryName": "antd",
                        "libraryDirectory": 'es',
                        "style": "css"
                    }
                ]
            ]
        ]
}