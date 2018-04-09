#项目要点
1. 发布与测试要修改的配置
  （1）文件：src/app/common/config.js
  #真实环境配置
  export const routerBaseName = '/credit-backend'; 
  #本地测试配置
  export const routerBaseName = '/test';
  （2）静态资源发布路径：
    文件：scripts/build.js
  #线上资源
  process.env.PUBLIC_URL = '//s1.xmcdn.com/lib/credit-score-manage/last/build/'  
  #测试环境
  process.env.PUBLIC_URL = '//static2.test.ximalaya.com/source/credit-score-manage/0.1.0/build/'
  （3）资源发布配置详细参考package.json文件

2. 本地测试环境搭建要点
  （1）本地调试调用api会出现跨域与cookie校验问题，解决方法如下：
   测试环境域：test.ximalaya.com
   # 1. 本地项目子域名：joe.test.ximalaya.com,这样子域名合一获取主域名的cookie；
   # 2. 在系统host文件，配置域名到ip映射，将joe.test.ximalaya.com域名映射到本地ip
         127.0.0.1       joe.ops.test.ximalaya.com
   # 3. 本地项目通过localhost启动项目，localhost --- 127.0.0.1 
   # 4. 在package.json中设置代理
        "proxy": {
            "/credit-backend": {
              "target": "http://ops.test.ximalaya.com/",
              "changeOrigin": true,
              "cookieDomainRewrite": "ops.test.ximalaya.com" //跨域默认不带cookie，在此处加上，完成cookie校验
            }
        }
  # 5.设置scripts/start.js文件
    process.env.DANGEROUSLY_DISABLE_HOST_CHECK = true;//禁止头部检查
  # 6. 如果多入口，要在config/webpackDevServer.config文件中做好入口映射关系
    rewrites: [
        { from: /^\/test\/basicConfiguration/, to: config.output.publicPath + '/basicConfiguration.html' },
        { from: /^\/test\/illegalRecord/, to: config.output.publicPath + '/illegalrecord.html' },
        { from: /^\/test\/creditScore/, to: config.output.publicPath + '/creditscore.html' },
      ]
  # 7. 可以通过http://joe.ops.test.ximalaya.com:3000/test/(basicConfiguration/illegalRecord/creditScore)
      访问本地资源

3. 多入口配置
  （1）入口文件
    entry: {
        basicConfiguration: [
          require.resolve('./polyfills'),
          require.resolve('react-dev-utils/webpackHotDevClient'),
          paths.appSrc + "/app/basicConfiguration/index.js",
        ],
        illegalrecord: [
          require.resolve('./polyfills'),
          require.resolve('react-dev-utils/webpackHotDevClient'),
          paths.appSrc + "/app/illegalrecord/index.js",
        ],
        creditscore: [
          require.resolve('./polyfills'),
          require.resolve('react-dev-utils/webpackHotDevClient'),
          paths.appSrc + "/app/creditscore/index.js",
        ]
    }
    （2）输出文件
    plugins: [
        new HtmlWebpackPlugin({
          inject: true,
          chunks: ["basicConfiguration"],
          template: paths.appHtml,
          filename: 'basicConfiguration.html',
        }),
        new HtmlWebpackPlugin({
          inject: true,
          chunks: ["illegalrecord"],
          template: paths.appHtml,
          filename: 'illegalrecord.html',
        })
    ]
    (3) config/webpackDevServer.config文件中做好入口映射关系
    rewrites: [
        { from: /^\/test\/basicConfiguration/, to: config.output.publicPath + '/basicConfiguration.html' },
        { from: /^\/test\/illegalRecord/, to: config.output.publicPath + '/illegalrecord.html' },
        { from: /^\/test\/creditScore/, to: config.output.publicPath + '/creditscore.html' },
      ]