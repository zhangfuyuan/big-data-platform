/**
 * Created by RedGuardian on 2017/8/20.
 */

/*******************************************************************************************************************
 *  单页面应用页面切换实现
 * */
function checkURL() {
    var arr = location.href.split("#");
    var hash = '';
    if (arr.length > 1) {
        hash = arr[1];
    }
    if (hash !== '') {
        loadURL(hash);
    } else {
        loadURL('backstageIndex/BackstageIndex.html');
    }
}
function loadURL(url) {
    var content = $('#switchPageBody');
    var target = './' + url;
    $.ajax({
        type: 'get',
        url: target,
        cache: false,
        data: '',
        dataType: 'html',
        beforeSend: function () {
            content.html('<div id="page-wrapper"><div class="row"><div class="col-sm-12"><h1 class="page-header"><i class="fa fa-refresh fa-spin"></i> Loading...</h1></div></div></div>' +
                '<script>(function() { return; }())</script>');
            // var title = '';
            // var $breadcrumb = $('#ribbon .breadcrumb');
            // title = $('nav a[href="' + '#' + url + '"]').find('span').text();
            // if (url != common_conf.defaultHash && title != '') {
            //     $breadcrumb.html('<li><i class="fa fa-home"></i>工作台</li><li>' + title + '</li>');
            // } else {
            //     $breadcrumb.html('<li><i class="fa fa-home"></i>工作台</li>');
            // }
        },
        success: function (returnData) {
            setTimeout(function () {
                content.html(returnData);
            }, 100);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if(ie8Mode && errorThrown.message==='对象不支持此属性或方法'){
                window.opener=null;
                window.open("","_self");
                window.close();
                window.open('./index.html#' + url, '_blank');
            }else {
                content.html('<div id="page-wrapper"><div class="row"><div class="col-sm-12"><h2 class="page-header"><i class="fa fa-warning"></i> Error 404! 页面不存在 </h2></div></div></div>');
            }
        }
    })
}

checkURL();
$(document).on("click", '#myNav a[href="#"]', function (e) {
    e.preventDefault();
});
$(window).on('hashchange', function () {
    checkURL();
});

/*******************************************************************************************************************
 *  各模块功能实现实现
 * */

/* 实现各个模块 submit按钮 提交成功 跳转至相应页面 */
(function () {
    $(document).on('click', 'button[type=submit]', function (e) {
        e.preventDefault();
        var $btn = $(this);

        // 提交成功 跳转页面
        if (typeof $btn.attr('data-href') !== 'undefined' && $btn.attr('data-state') === 'success') {
            loadURL($btn.attr('data-href'));
        } else {
            alert("提交失败");
            return false;
        }
    });
}());

/* 实现各个模块 模态框居中弹出 */
!function () {
    $(document).on('shown.bs.modal', '.myMiddleModal', function (e) {
        var $modal = $(this);
        var modalHeight=$(window).height() / 2 - $modal.find('.modal-dialog').height() / 2;
        $modal.css('display', 'block').find('.modal-dialog').css({ 'margin-top': modalHeight });
    });
}();

/*  */
-function () {

}();

/*  */
+function () {

}();

/* 用window.onerror捕获并上报Js错误 */
~function () {
    /**
     * @param {String}  errorMessage   错误信息
     * @param {String}  scriptURI      出错的文件
     * @param {Long}    lineNumber     出错代码的行号
     * @param {Long}    columnNumber   出错代码的列号
     * @param {Object}  errorObj       错误的详细信息，Anything
     */
    window.onerror = function(errorMessage, scriptURI, lineNumber,columnNumber,errorObj) {
        // throw new Error("错误信息："+errorMessage, "出错文件："+scriptURI, "出错行号："+lineNumber, "出错列号："+columnNumber);
    }
}();

