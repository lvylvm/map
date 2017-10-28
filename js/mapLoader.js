define(['zepto'],function ($) {

    var def = $.Deferred();//定义异步延时机制
    var promise = def.promise();


    window._mapInit = function () {
        def.resolve();//异步延时完成
    };

    function mapInit(cb) {
        promise.done(cb);
    }

    require(['https://webapi.amap.com/maps?v=1.4.0&key=&&plugin=AMap.Geocoder&callback=_mapInit']);
    return mapInit;
});