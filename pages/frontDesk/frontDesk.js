/**
 * Created by RedGuardian on 2017/8/20.
 */

(function () {

    /*******************************************************************************************************************
     *  单页面应用页面切换实现
     * */
    clickLoadPage('#loadIntelligenceReportBtn', './IntelligenceReport.html', '智能报表');     //f2-智能报表页面
    clickLoadPage('#loadSelfAnalysisBtn', './SelfAnalysis.html', '自助分析');     //f3-自助分析页面
    clickLoadPage('#loadAppCenterBtn', './AppCenter.html', '应用中心');     //f5-应用中心页面

    function clickLoadPage(id, pageUrl, indexPageName) {

        $(id).on('click',function () {
            // $.ajaxSetup({cache: false });   //关闭AJAX缓存

            $('#switchPageBody').load(pageUrl, function(response, status, xhr) {
                if (status == "error") alert(xhr.status + " " + xhr.statusText);
            });

            if($('.changeIndex')){
                $('.changeIndex').empty().append($('<a href="#">'+ indexPageName +'</a>'));
            }else { return false; }
        });

    }

}());