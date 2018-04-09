/**
 * 通过纯前端来mock数据，不通过搭建后台服务和数据库
 */
import Mock, { Random } from 'mockjs';
import FetchMock from 'fetch-mock';//用于对于fetch兼容
import { curry, compose } from 'ramda';

/**
 * 增加http返回状态字段
 */
const addHttpStatus = (rule) => {
    Object.assign(rule, {
        'success|1': true,
        'code': function () { return this.success ? 200 : 500 },
        'errorMsg': function () { return this.success ? null : '请求出错' },
    })
    return rule;
}

/**
 * 增加分页信息
 * @param {*} options 
 * @param {*} rule 
 */
const addPageInfo = curry((options, rule) => {
    const { pageNo, pageSize, totalCount } = options;
    Object.assign(rule, {
        'pageNo': pageNo - 0,
        'pageSize': pageSize - 0,
        'totalCount': totalCount - 0,
    });
    return rule;
});

/**
 * 增加列表分页
 * @param {*} listRule 
 * @param {*} rule 
 */
const addListInfo = curry((listRule, rule) => {
    const { pageNo, pageSize, totalCount } = rule;
    let listRuleKey;
    if ((pageNo - 1) * pageSize < totalCount && (pageNo * pageSize) > totalCount) {
        listRuleKey = `list|${totalCount - (pageNo - 1) * pageSize}`;
    } else {//返回pageSize个数据
        listRuleKey = `list|${pageSize}`;
    }
    rule[listRuleKey] = listRule;
    return rule;
});

//拦截url，mock数据配置
const MockApiConfig = [
    {
        reg: /\/api\/getAllUsers(\?(.)*)?$/i,
        totalCount: 32,
        listRule(options) {//不能使用箭头函数，否则this指向就是null
            const { pageNo, pageSize } = options;
            return [{
                'id|+1': (pageNo - 1) * pageSize + 1,
                'title': '@cword(5, 15)',
                'desc': '@cparagraph(2, 5)',
                'img': Random.image('60x60', '#4A7BF7', '@name book'),
                'time': Random.now('yyyy-MM-dd')
            }]
        },
        getRule(options) {//不能使用箭头函数，否则this指向就是null

            Object.assign(options, { totalCount: this.totalCount });
            let rule = compose(addListInfo.call(MockApiConfig, this.listRule(options)), addPageInfo.call(MockApiConfig, options), addHttpStatus)({});
            return rule;
        }
    }
];

/**
 * 分离url参数
 * url存在了两种形式，这是由于Mock和FetchMock两种方式决定的，这里需要兼容性处理
 * 1.Mock:{body:null,type:"GET",url:"/api/getAllUsers?pageNo=1&pageSize=10"}
 * 2.FetchMock:/api/getAllUsers?pageNo=1&pageSize=10
 * @param {*} url 
 */
const splitUrlFromParams = (url) => {
    if (typeof url === 'object') {
        url = url.url;
    }
    const [urlNoParams, paramsStr] = url.split('?');
    //参数获取
    const params = paramsStr.split('&').reduce((pre, next) => {
        const [key, val] = next.split('=');
        pre[key] = val;
        return pre;
    }, {});
    return {
        urlNoParams: urlNoParams,
        params: params
    }
}

/**
 * 根据rule生成数据
 * @param {*} config 
 * @param {*} url 
 */
const createMockData = (config, url) => {
    const { getRule } = config;
    const rule = getRule.call(config, { ...splitUrlFromParams(url)['params'] });
    //在此处可以根据pageNo来确定rules，分页实现
    let res = Mock.mock(rule);
    if (!res.success) {
        res.list = null;
    }
    return res;
}

//兼容性拦截处理
const filterAjax = (config) => {
    const { reg } = config;
    //fetch请求拦截
    FetchMock.once(reg, (url) => {
        return createMockData(config, url);
    });

    //ajax请求拦截,axios
    Mock.mock(reg, 'get', (options) => {
        return createMockData(config, options);
    });
}

if (process.env.NODE_ENV === 'development') {//开发环境使用mock数据
    MockApiConfig.forEach((config) => {
        //配置拦截
        filterAjax(config);
    });

    // 其他路由使用原生fetch，这段代码必须放最后
    FetchMock.once('*', (url, options) => {
        FetchMock.restore();
        return fetch(url, options);
    });
}