/**
 * Created by RedGuardian on 2017/9/11.
 */

/********************************
*   图表功能
*********************************/
/* 1.再封装echarts */
function MyEcharts(arg) {

    if(!arg.DOMId){
        alert('参数设置错误！');
        return;
    }

    this._DOMId = arg.DOMId;        //DMO节点id（必需）
    /*
    *   option = {
    *       legendDataList: ['', ''],//图例数据（必需）
    *       series: [
    *               {
    *                   name: '',
    *                   type: '',
    *                   dataKey: ''
    *               },
    *               {
    *
    *               }
    *           ],//系列数据（必需）
    *
    *       isPie: '',//【默认false】（可选）
    *       xAxisDataKey: '',//横坐标数据（isPie === false -> 必需）
    *       pieAxisDataKey: '',//饼状图分区数据（isPie === true -> 必需）
    *
    *       titleText: '',//【默认无】//标题文本（可选）
    *       titleSubtext: '',//副标题【默认无】（可选）
    *       titleX: '',//标题水平位置【默认居中】（可选）
    *       legendX: '',//图例水平位置【默认居右】（可选）
    *       legendOrient: '',//图例横竖排列【默认竖排：'vertical'；横排：'horizontal'】（可选）
    *       yAxisName: '',//纵坐标意义，可含单位【默认无】（可选）
    *       dataZoomShow: '',//是否显示缩放条【默认否】（可选）
    *       xAxisBoundaryGap: '',//首尾数据是否显示在两轴线间【默认否】（可选）
    *       yAxisScale: '',//是否自动缩放纵坐标【默认是】（可选）
    *       seriesShowMark: '',//是否显示附加标志【默认否】（可选）
    *       tooltipTrigger: '',【默认'axis'】（可选）
    *       tooltipFormatter: '',//鼠标悬停数据显示格式【默认"{a} <br/>{b} : {c}"】（可选）
    *       calculable: '',//是否启用拖拽重计算特性【默认false】（可选）
    *       isXChangeYAxis: '',//【默认false】（可选）
    *       colorList: '',//【默认无】（可选）
    *       ...
    *   }
    * */
    this._option = arg.option;      //初始化选项（必需）
    this._dataUrl = arg.dataUrl;    //数据路径（必需）

    this._theme = arg.theme || 'default';               //图表主题【默认常规】（可选）
    this._isShowLoading = arg.isShowLoading || false;   //是否展示加载动画【默认否】（可选）
    this._changeDataOption = arg.changeDataOption ||
        {
            isChange: false,//是否开启定时器
            url: '',//更新数据路径
            intervalTime: 0//定时器间隔
        };                                              //是否开启实时更新数据功能【默认否】（可选）

    this._initChart();

}

//  初始化图表
MyEcharts.prototype._initChart = function () {

    if(this._theme !== 'default'){
        this._myChart = echarts.init(document.getElementById(this._DOMId), this._theme);
    }else {
        this._myChart = echarts.init(document.getElementById(this._DOMId));
    }

    if(this._isShowLoading){
        this._myChart.showLoading({
            text : '正拼命加载数据，请耐心等待...',
            effect : 'bubble',
            textStyle : {
                fontSize : 20
            }
        });
    }

    var self = this;
    this._getChartData(self._dataUrl, function (result) {
        if(result.msg === '请求成功！'){
            var seriesOption = {}, seriesList = [], xAxisDataList = [];
            self._loadingTicket = null;
            self._timeTicket = null;

            if(self._option.isPie){
                //  饼状图
                seriesOption = {
                    name: self._option.series[0].name,
                    type: self._option.series[0].type,
                    data: [],
                    radius : '55%',
                    center: ['50%', '60%']
                };
                seriesList.push(seriesOption);
                for(var m=0; m<result.data.length; m++){
                    seriesList[0].data.push({
                        value: result.data[m][self._option.series[0].dataKey],
                        name: result.data[m][self._option.pieAxisDataKey]
                    });
                }
            }else {
                //  非饼状图
                for(var k=0; k<result.data.length; k++){
                    xAxisDataList.push(result.data[k][self._option.xAxisDataKey]);
                }
                for(var i=0; i<self._option.series.length; i++){
                    seriesOption = {
                        name: self._option.series[i].name,
                        type: self._option.series[i].type,
                        data: []
                    };
                    //  柱状图 选择显示峰值标志
                    if(self._option.seriesShowMark){
                        seriesOption.markPoint = {
                            data: [
                                {type: 'max', name: '最大值'},
                                {type: 'min', name: '最小值'}
                            ]
                        };
                    }
                    //  柱状图 选择显示平均值
                    if(self._option.seriesShowAverage){
                        seriesOption.markLine = {
                            data: [
                                {type: 'average', name: '平均值'}
                            ]
                        };
                    }
                    seriesList.push(seriesOption);
                    for(var j=0; j<result.data.length; j++){
                        seriesList[i].data.push(result.data[j][self._option.series[i].dataKey]);
                    }
                }
            }

            (function () {

                //  选择 显示加载动画后隐藏
                if(self._isShowLoading){
                    clearTimeout(self._loadingTicket);
                    self._loadingTicket = setTimeout(function () {
                        self._myChart.hideLoading();
                        self._setChartOption(xAxisDataList, seriesList);
                    }, 1000);
                    //  选择添加定时更新数据
                    if(self._changeDataOption.isChange){
                        clearInterval(self._timeTicket);
                        self._timeTicket = setInterval(function () {
                            self._reAddChartData();
                        }, self._changeDataOption.intervalTime);
                    }
                }else {
                    self._setChartOption(xAxisDataList, seriesList);
                }

            })();
        }else {
            alert(self._option.titleText + '获取数据失败！');
        }
    });

};

//  获取json数据
MyEcharts.prototype._getChartData = function (url, callback) {

    var result = {};
    $.get(url)
        .done(function (data) {
            if(data.datas.code === 200 && data.datas.data.length > 0){
                result.msg = '请求成功！';
                result.data = data.datas.data;
            }else {
                result.msg = '请求失败！';
            }
        })
        .fail(function (error) { result.msg = '异步请求出错：' + error; })
        .always(function () { callback(result); });

};

// 图表的基本属性设置
MyEcharts.prototype._setChartOption = function (xAxisDataList, seriesList) {

    if( (this._option.isPie && xAxisDataList.length > 0) ||
        (!this._option.isPie && xAxisDataList.length === 0) ){
        alert('参数配置错误！');
        return;
    }

    var option = {
        title: {
            text: this._option.titleText || '',
            subtext: this._option.titleSubtext || '',
            x: this._option.titleX || 'center'
        },
        tooltip: {
            trigger: this._option.tooltipTrigger || 'axis'
        },
        legend: {
            data: this._option.legendDataList,
            x: this._option.legendX || 'right',
            selectedMode: false,
            orient: this._option.legendOrient || 'vertical'
        },
        calculable: this._option.calculable || false,
        series: seriesList,
        animation: !ie8Mode,
        addDataAnimation: !ie8Mode
    };

    var xObj = {
            type : 'category',
            boundaryGap : this._option.xAxisBoundaryGap || false,
            data : xAxisDataList
        },
        yObj = {
            type : 'value',
            scale: this._option.yAxisScale || true,
            name: this._option.yAxisName || '',
            splitArea: {show : true}
        };
    if(!this._option.isPie){
        option.dataZoom = {
            show: this._option.dataZoomShow || false,
            realtime: !ie8Mode,
            start: this._option.dataZoomShow ? 25 : 0,
            end: this._option.dataZoomShow ? 75 : 100
        };
        if(this._option.isXChangeYAxis){
            option.xAxis = [ yObj ];
            option.yAxis = [ xObj ];
        }else {
            option.xAxis = [ xObj ];
            option.yAxis = [ yObj ];
        }
    }

    if(ie8Mode){
        option.animationThreshold = false;
    }
    if(this._option.tooltipFormatter){
        option.tooltip.formatter = this._option.tooltipFormatter;
    }
    if(this._option.colorList && this._option.colorList.length > 0){
        option.color = this._option.colorList;
    }

    this._myChart.setOption(option);

};

//  实时更新json数据
MyEcharts.prototype._reAddChartData = function () {

    var self = this;
    this._getChartData(self._changeDataOption.url || self._dataUrl, function (result) {
        if(result.msg === '请求成功！'){
            var axisData, lastRandom;
            // axisData = getNowDate({ option: '时间' });
            lastRandom = Math.floor(Math.random()*24);
            // 动态数据接口 addData
            self._myChart.addData([
                [
                    0,        // 系列索引
                    result.data[lastRandom][self._option.series[0].dataKey], // 新增数据
                    false,     // 新增数据是否从队列头部插入
                    false,     // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
                    result.data[lastRandom][self._option.xAxisDataKey]  // 坐标轴标签
                ]
            ]);
        }else {
            alert('重新获取数据失败！');
        }
    });

};

//  销毁图表
MyEcharts.prototype._disposeChart = function () {

    if (this._myChart && this._myChart.dispose) {
        this._myChart.dispose();
    }

    clearTimeout(this._loadingTicket);
    this._loadingTicket = null;
    clearInterval(this._timeTicket);
    this._timeTicket = null;

};

MyEcharts.prototype._addEvent = function (eventName, fun) {

    this._myChart.on(eventName, fun);

};

/* 2.异步获取图表数据的方法 */
function getChartData(url, callback) {

    var result = {};
    $.get(url)
        .done(function (data) {
            if(data.datas.code === 200 && data.datas.data.length > 0){
                result.msg = '请求成功！';
                result.data = data.datas.data;
            }else {
                result.msg = '请求失败！';
            }
        })
        .fail(function (error) { result.msg = '异步请求出错：' + error; })
        .always(function () { callback(result); });

}

/* 3.重新获取并添加图表数据的方法 */
function reAddChartData(url, obj) {

    getChartData(url, function (result) {
        if(result.msg === '请求成功！'){
            var axisData, lastRandom;
            axisData = getNowDate({ option: '时间' });
            lastRandom = Math.floor(Math.random()*24);
            // 动态数据接口 addData
            obj.addData([
                [
                    0,        // 系列索引
                    result.data[lastRandom].val, // 新增数据
                    false,     // 新增数据是否从队列头部插入
                    false,     // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
                    axisData  // 坐标轴标签
                ]
            ]);
        }else {
            alert('重新获取数据失败！');
        }
    });

}

/* 4.后台首页 数据接入情况小时变化图表初始化 再封装 */
function initDASChart(select, url){

    if(!$('#dataAccessSituation-lineChart')){
        return;
    }

    var _select = select && select !== '总数' ? select : '' ;
    var _url = url || '../../server/dataAccessSituationData.json';
    return new MyEcharts({
        DOMId: 'dataAccessSituation-lineChart',
        option: {
            titleText: _select + '数据接入情况小时变化曲线',
            legendDataList: ['数据接入量'],
            xAxisDataKey: 'hours',
            yAxisName: '数据接入量（k）',
            series: [
                {
                    name: '数据接入量',
                    type: 'line',
                    dataKey: 'val'
                }
            ]
        },
        dataUrl: _url,
        theme: 'macarons',
        isShowLoading: true,
        changeDataOption: {
            isChange: true,
            intervalTime: 2100
//                intervalTime: 3600100// 间隔1h
        }
    });

}

/* 5.数据接入情况小时变化图表 切换数据源 */
function changeDASChartDate(txt) {

    var url;
    switch (txt){
        case 'A':
            url = '../../server/dataAccessSituationData_A.json';
            break;
        case 'B':
            url = '../../server/dataAccessSituationData_B.json';
            break;
        case 'C':
            url = '../../server/dataAccessSituationData_A.json';
            break;
        case 'D':
            url = '../../server/dataAccessSituationData_A.json';
            break;
        case 'E':
            url = '../../server/dataAccessSituationData_A.json';
            break;
        case 'F':
            url = '../../server/dataAccessSituationData_A.json';
            break;
        case 'G':
            url = '../../server/dataAccessSituationData_A.json';
            break;
        case 'H':
            url = '../../server/dataAccessSituationData_A.json';
            break;
        case 'I':
            url = '../../server/dataAccessSituationData_A.json';
            break;
        default:
            url = '../../server/dataAccessSituationData.json';
            break;
    }

    return url;

}

/* 6.数据服务首页-数据服务排名 图表初始化 */
function initDSRChart(select, obj) {

    if(!$('#dataServiceRanking-barChart')){
        return;
    }

    var _select = select && select !== '综合' ? select : '综合访问' ;
    var _url = obj ? obj.url : '../../server/dataServiceRankingData.json';

    return new MyEcharts({
        DOMId: 'dataServiceRanking-barChart',
        option: {
            legendDataList: [_select],
            xAxisDataKey: 'way',
            series: [
                {
                    name: _select,
                    type: 'bar',
                    dataKey: 'val'
                }
            ],
            legendX: 'center',
            xAxisBoundaryGap: true,
            yAxisScale: false,
            isXChangeYAxis: true,
            colorList: obj ? obj.color : []
        },
        dataUrl: _url,
        theme: 'macarons'
    });

}

/* 7.数据服务首页-数据服务排名图表 切换数据源 */
function changeDSRChart(txt) {

    var obj = {
        url: '',
        color: []
    };
    switch (txt){
        case 'API访问':
            obj.url = '../../server/dataServiceRankingData_API.json';
            obj.color = ['#B6A2DE'];
            break;
        case 'FTP推送':
            obj.url = '../../server/dataServiceRankingData_FTP.json';
            obj.color = ['#5AB1EF'];
            break;
        default:
            obj.url = '../../server/dataServiceRankingData.json';
            break;
    }

    return obj;

}

/* 8.日志管理页面 dataTables再封装 */
function MyTables(arg) {

    if(!arg.$DOM){
        alert('参数设置错误！');
        return;
    }

    this._$DOM = arg.$DOM;        //DMO节点id（必需）

    this._initTable();

}

MyTables.prototype._initTable = function (curTableTitle) {

    var _curTableTitle = curTableTitle || '数据接入日志';
    var option = {};

    switch (_curTableTitle){
        case '数据服务日志':
            option = {
                columnDefs: [
                    { orderable: false, targets: [0,1,2,4,5] },
                    { "title": "服务信息1", "targets": 0 },
                    { "title": "服务信息2", "targets": 1 },
                    { "title": "服务信息3", "targets": 2 },
                    { "title": "Start date", "targets": 3 },
                    { "title": "服务信息4", "targets": 4 },
                    { "title": "更多详情", "targets": 5 }
                ],
                order: [[ 3, "desc" ]],
                ajax: {
                    url: "../../server/tableData.json",
                    type: 'GET'
                },
                columns: [
                    { data: null, render: function ( data, type, row ) {
                        return data.first_name+' '+data.last_name+'服务';
                    } },
                    { data: "position" },
                    { data: "office" },
                    { data: "start_date" },
                    { data: "extn" },
                    {
                        data: null,
                        className: "center",
                        defaultContent: '<a href="" class="editor_edit" data-toggle="modal" data-target="#logManageDetailModal">详情</a>'
                    }
                ]
            };
            break;
        case '系统操作日志':
            option = {
                columnDefs: [
                    { orderable: false, targets: [0,1,3,4] },
                    { "title": "操作信息1", "targets": 0 },
                    { "title": "操作信息2", "targets": 1 },
                    { "title": "Start date", "targets": 2 },
                    { "title": "操作信息3", "targets": 3 },
                    { "title": "更多详情", "targets": 4 }
                ],
                order: [[ 2, "desc" ]],
                ajax: {
                    url: "../../server/tableData.json",
                    type: 'GET'
                },
                columns: [
                    { data: null, render: function ( data, type, row ) {
                        return data.first_name+' '+data.last_name+'操作';
                    } },
                    { data: "position" },
                    { data: "start_date" },
                    { data: "extn" },
                    {
                        data: null,
                        className: "center",
                        defaultContent: '<a href="" class="editor_edit" data-toggle="modal" data-target="#logManageDetailModal">详情</a>'
                    }
                ]
            };
            break;
        case '系统异常日志':
            option = {
                columnDefs: [
                    { orderable: false, targets: [0,1,3] },
                    { "title": "异常信息1", "targets": 0 },
                    { "title": "异常信息2", "targets": 1 },
                    { "title": "Start date", "targets": 2 },
                    { "title": "更多详情", "targets": 3 }
                ],
                order: [[ 2, "desc" ]],
                ajax: {
                    url: "../../server/tableData.json",
                    type: 'GET'
                },
                columns: [
                    { data: null, render: function ( data, type, row ) {
                        return data.first_name+' '+data.last_name+'异常';
                    } },
                    { data: "office" },
                    { data: "start_date" },
                    {
                        data: null,
                        className: "center",
                        defaultContent: '<a href="" class="editor_edit" data-toggle="modal" data-target="#logManageDetailModal">详情</a>'
                    }
                ]
            };
            break;
        default:
            option = {
                columnDefs: [
                    { orderable: false, targets: [0,1,2,3,5] },
                    { "title": "接入信息1", "targets": 0 },
                    { "title": "接入信息2", "targets": 1 },
                    { "title": "接入信息3", "targets": 2 },
                    { "title": "接入信息4", "targets": 3 },
                    { "title": "Start date", "targets": 4 },
                    { "title": "更多详情", "targets": 5 }
                ],
                order: [[ 4, "desc" ]],
                ajax: {
                    url: "../../server/tableData.json",
                    type: 'GET'
                },
                columns: [
                    { data: null, render: function ( data, type, row ) {
                        return data.first_name+' '+data.last_name+'接入';
                    } },
                    { data: "position" },
                    { data: "office" },
                    { data: "extn" },
                    { data: "start_date" },
                    {
                        data: null,
                        className: "center",
                        defaultContent: '<a href="" class="editor_edit" data-toggle="modal" data-target="#logManageDetailModal">详情</a>'
                    }
                ]
            };
            break;
    }

    this._myTable = this._$DOM.DataTable(option);

};

MyTables.prototype._draw = function () {

    this._myTable.draw();

};

MyTables.prototype._getCurOption = function (curTableTitle) {

    var _curTableTitle = curTableTitle || '数据接入日志';
    var curOption = {};

    switch (_curTableTitle){
        case '数据服务日志':
            curOption = {
                nowDateIndex: 3,
                panelClass: 'panel-green'
            };
            break;
        case '系统操作日志':
            curOption = {
                nowDateIndex: 2,
                panelClass: 'panel-yellow'
            };
            break;
        case '系统异常日志':
            curOption = {
                nowDateIndex: 2,
                panelClass: 'panel-red'
            };
            break;
        default:
            curOption = {
                nowDateIndex: 4,
                panelClass: 'panel-primary'
            };
            break;
    }

    return curOption;

};

MyTables.prototype._destroy = function () {

    this._myTable.destroy();

};

MyTables.prototype._addEvent = function (eventName, fun) {

    this._myTable.on(eventName, fun);

};

/********************************
 *   时间功能
 *********************************/
/* 时间补零的方法 */
function zero(s) {
    return s < 10 ? '0' + s: s;
}

/* 获取当前时间的方法 */
function getNowDate(arg) {
    var _arg = arg || { option: '默认（日期+时间）' };
    var myDate = new Date();
    var year = myDate.getFullYear();
    var month = myDate.getMonth()+1;
    var date = myDate.getDate();
    var h = myDate.getHours();
    var m = myDate.getMinutes();
    var s = myDate.getSeconds();
    var now = '';

    switch (_arg.option){
        case '分':
            now = zero(h) + ':' + zero(m) + ':00';
            break;
        case '时':
            now = zero(h) + ':00';
            break;
        case '时间':
            now = zero(h) + ':' + zero(m) + ':' + zero(s);
            break;
        case '日期':
            now = year + '-' + zero(month) + '-' + zero(date);
            break;
        default:
            now = year + '-' + zero(month) + '-' + zero(date) + ' ' + zero(h) + ':' + zero(m) + ':' + zero(s);
            break;
    }
    return now;
}

/* 获取一组时间的方法 */
function getTimeList(arg) {
    var _arg = arg || { option: '默认（时）', length: 23 };
    var now = new Date();
    var times = [];
    var len = _arg.length || 23;
    var hmsStr, h, hh, mmss, res;

    switch (_arg.option){
        case '秒':
            while (len--) {
                hmsStr = now.toLocaleTimeString().replace(/^\D*/,'');
                h = hmsStr.split(':')[0];
                if( (now.toLocaleTimeString().match(/下午/) == '下午' && h !== '12') ||
                    (now.toLocaleTimeString().match(/上午/) == '上午' && h === '12') ){
                    mmss = hmsStr.substr(-6);
                    hh = parseInt(hmsStr.split(':')[0]) + 12;
                    res = hh + mmss;
                }else {
                    res = hmsStr;
                }
                times.unshift(res);
                now = new Date(now - 2000);
            }
            break;
        case '分':
            while (len--) {
                hmsStr = now.toLocaleTimeString().replace(/^\D*/,'');
                h = hmsStr.split(':')[0];
                if( (now.toLocaleTimeString().match(/下午/) == '下午' && h !== '12') ||
                    (now.toLocaleTimeString().match(/上午/) == '上午' && h === '12') ){
                    mmss = hmsStr.substr(-6);
                    hh = parseInt(hmsStr.split(':')[0]) + 12;
                    res = hh + mmss;
                }else {
                    res = hmsStr;
                }
                times.unshift(res);
                now = new Date(now - 60000);
            }
            break;
        default:
            while (len--) {
                hmsStr = now.toLocaleTimeString().replace(/^\D*/,'');
                h = hmsStr.split(':')[0];
                if( (now.toLocaleTimeString().match(/下午/) == '下午' && h !== '12') ||
                    (now.toLocaleTimeString().match(/上午/) == '上午' && h === '12') ){
                    hh = parseInt(hmsStr.split(':')[0]) + 12;
                }else {
                    hh = hmsStr.split(':')[0];
                }
                res = hh + ':00';
                times.unshift(res);
                now = new Date(now - 3600000);
            }
            break;
    }
    return times;
}
