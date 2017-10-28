define(['mapLoader'], function (mapLoader) {
    var me = this;
    Promise.resolve([]).then(function (object) {
        if (!object || object.result == 0) {
            alert('无法获取定位信息，请确认定位开启');
            return;
        } else {
            me.waiting = true;
            var isComplete = false;// 定位是否完成
            mapLoader(function () {
                var map = new AMap.Map('container', {//显示地图
                    resizeEnable: true,
                    dragEnable: false, //是否允许拖拽
                    doubleClickZoom: false, //是否运行双击放大
                    zoom: 15
                });
                var geolocation;
                map.plugin('AMap.Geolocation', function () {
                    geolocation = new AMap.Geolocation({
                        enableHighAccuracy: true, //是否使用高精度,默认值：true
                        timeout: 10000,           //超过10秒后停止定位，默认：无穷大
                        showButton: false,        //显示定位按钮，默认：true
                        showCircle: true,         //定位成功后用圆圈表示定位精度范围，默认：true
                        noIpLocate: 0,            //是否禁止使用IP定位，默认值为0，可以使用IP定位
                        zoomToAccuracy: true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                    });
                    map.addControl(geolocation);
                    geolocation.getCurrentPosition();

                    AMap.event.addListener(geolocation, 'complete', onComplete);
                    AMap.event.addListener(geolocation, 'error', onError);

                    // 定位成功，返回定位信息
                    function onComplete(p) {
                        isComplete = true;
                        var lng = p.position.getLng();
                        var lat = p.position.getLat();
                        render(lng, lat, p.accuracy);
                    }

                    // 定位失败，显示失败原因
                    function onError(err) {
                        if (err.info == 'NOT_SUPPORTED') {
                            AppUtils.clientMessageDisplay('当前浏览器不支持定位功能。尝试使用客户端定位。');
                        }
                        if (err.info == 'FAILED') {
                            var str = '定位失败!';
                            if (err.message.indexOf('Get ipLocation failed.') != -1) {
                                str += '原因：IP精确定位失败。';
                            }
                            if (err.message.indexOf('Browser not Support html5 geolocation.') != -1) {
                                str += '原因：当前浏览器不支持定位功能。';
                            }
                            if (err.message.indexOf('Geolocation permission denied.') != -1) {
                                str += '原因：浏览器拒绝定位。';
                            }
                            if (err.message.indexOf('Get geolocation time out.') != -1) {
                                str += '原因：浏览器定位超时。';
                            }
                            if (err.message.indexOf('Get geolocation failed.') != -1) {
                                str += '原因：浏览器定位失败。';
                            }
                            console.warn(str);
                            // AppUtils.clientMessageDisplay(str + '尝试使用客户端定位。');
                        }
                    }

                });

                //延时检测
                setTimeout(function () {
                    if (!isComplete) {
                        var lng = object.longitude;
                        var lat = object.latitude;
                        var lnglat = [lng, lat];
                        AMap.convertFrom(lnglat, 'baidu', function (status, result) {
                            if (status === 'complete' && result.info === 'ok') {
                                lng = result.locations[0].lng;
                                lat = result.locations[0].lat;
                                map.setZoomAndCenter(16, [lng, lat]);
                                render(lng, lat, 1);
                            } else {
                                me.waiting = false;
                                alert('坐标转换失败');
                            }
                        });
                    }
                }, 10000);

                //渲染地图
                function render(lng, lat, accuracy) {
                    new AMap.Marker({//添加标记
                        map: map,
                        position: [lng, lat]
                    });

                    var lnglatXY = [lng, lat];
                    function regeocoder() {  //逆地理编码
                        var geocoder = new AMap.Geocoder({
                            radius: 1000,
                            extensions: "all"
                        });
                        geocoder.getAddress(lnglatXY, function (status, result) {
                            if (status === 'complete' && result.info === 'OK') {
                                geocoder_CallBack(result);
                            } else {
                                me.waiting = false;
                                alert('获取定位地址描述失败');

                            }
                        });
                    }

                    function geocoder_CallBack(data) {
                        var address = data.regeocode.formattedAddress; //返回地址描述
                        me.address = address;
                        var ak = '';//此处的key，为Web服务API的key，与JavaScript API的key不是同一个
                        var imgAddr = 'https://restapi.amap.com/v3/staticmap?location=' + lng + ',' + lat + '&zoom=17&size=400*400&markers=mid,,A:' + lng + ',' + lat + '&key=' + ak;

                        $("#address").text(address);
                        $("#container img").attr('src',imgAddr);
                        me.waiting = false;
                        alert('定位成功');
                    }

                    regeocoder();
                }

            });


        }// else end
    });
});