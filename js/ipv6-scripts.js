var Highcharts,
map = null,
chart, highMap,
tableCountriesData, tableNetworksData;

var sMonth = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var sFullDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];


var baseUrl = '/datamap/fetch-dv-data/ipv6/';
//baseUrl = 'json/';

var jq = jQuery.noConflict();

function getFormattedDate(timestamp){
    var d = new Date(timestamp);
    var monthNumber = ((d.getUTCMonth() + 1) < 10) ? '0'+(d.getUTCMonth() + 1) : d.getUTCMonth() + 1;
    var date = (d.getUTCDate() < 10) ? '0'+d.getUTCDate() : d.getUTCDate();
    return {m:monthNumber,d:date,y:d.getUTCFullYear(),day:d.getUTCDay()};
}

function createTable(oData, dataType, dataObj){
    //countries, networks
    var tableHTML = '<table class="table table-'+dataType+'">';
    tableHTML += '<thead>';
    tableHTML += '<th class="rank">Rank</th>';
    tableHTML += '<th class="ipv6">IPv6%</th>';
    tableHTML += (dataType=="networks")?'<th class="network">Network</th>':'<th class="country">Country</th>';
    tableHTML += '<th class="toggle"></th>';
    tableHTML += '<th class="data-row"></th>';
    tableHTML += '</thead>';
    tableHTML += '<tbody>';

    var oLen = oData.length;
    for(var i = 0; i < oLen; i++){
        tableHTML += '<tr class="expand-chart" data-country="'+oData[i].id+'">';
        tableHTML += '<td class="rank">'+oData[i].rank+'</td>';
        tableHTML += '<td class="ipv6">'+roundDecimals(oData[i].z, 1)+'%</td>';
        tableHTML += '<td class="'+((dataType=='countries')?'country':'network')+'">'+oData[i].name+'</td>';
        tableHTML += '<td class="toggle"><a class="chart-toggle"><span data-icon="chevron-right"></span></a></td>';
        tableHTML += '<td class="data-row"></td>';
        tableHTML += '</tr>';
    }
    tableHTML += '</tbody>';
    tableHTML += '</table>';

    jq('#'+dataType+'-content .table-container').html(tableHTML);
    dataObj = jq('.table-container > .table.table-'+dataType).DataTable({
        columnDefs:[{type:"num"}],
        pageLength:50,
        lengthChange: false
    });
}


function createMap(highMap, container, oData, height){
    var mapData = [].concat(oData);
    _map = Highcharts.mapChart(container, {
        chart: {
            map: highMap,
            height:height
        },
      
        title: {
            text : '',
            align: 'left',
            style: {
                color: '#3a444a'
            }
        },
        //legend:{enabled: false},
        credits: {enabled: false},
        mapNavigation: {
            enabled: true,
            enableMouseWheelZoom:false,
            enableTouchZoom:false
        },
        colorAxis: {
            min: 0.1,
            max: 50,
            type: 'logarithmic',
            minColor:'#FBEBDB',
            maxColor:'#ff9933'
        },
        tooltip: {
            formatter : function(){
                return 'Country: <b>'+this.point.name +'</b><br/ >IPv6 Adoption: <b>'+ akatm.utils.FormatAsThousands(this.point.z, 2)+'%</b>'
            }
        },
        series: [{
            data: (function (propValue, propCode) {
                    var len = mapData.length,
                        tab = [];
                    for (var i = 0; i < mapData.length; i++) {
                        var o = mapData[i];
                        if(o[propValue] <=0){
                            mapData.splice(i,1);
                            continue;
                        }
                        mapData[i].value = o[propValue];
                        mapData[i].code = o[propCode];

                        switch(o.id){
                            case 'CN':
                            case 'IN':
                                mapData.push(jq.extend(true,{},o,{id:(o.id+'-DP')})); 
                                break;
                        }
                    }
                    return mapData;
                })('z', 'id'),
            joinBy: ['ISO_A2', 'code'],
            name: 'IPv6 Adoption %',
            borderColor: '#aaa',
            borderWidth: 0.2,
            states: {
                hover: {
                    borderWidth: 1
                }
            }
        }]
    });
}

function createChart(container, filename, lineColor, countryName, chartContainer){

    var HTML = '<div id="'+chartContainer+'"></div>';
    jq(container).html(HTML);
    console.log(baseUrl+filename)
    jq.ajax({
        url : baseUrl+filename,
        dataType : 'json',
        method: 'GET',
        success : function(trend){
            console.log(trend);
            Highcharts.chart(chartContainer, {
                xAxis: {
                    type: 'datetime',
                    labels: {
                        formatter: function(){
                            var nd = getFormattedDate(Number(this.value))
                            return nd.m+'/'+(nd.y).toString().substr(-2);
                        }
                    }
                },
                yAxis: {
                  
                    min:1,
                    max:100
                },
                chart : {
                    zoomType: 'x',
                    resetZoomButton: {
                        position: {
                            x: -40,
                            verticalAlign: 'top'
                        }
                    },
                    height: 220,
                    
                },
             
                tooltip:{
                    formatter:function(){
                        var nd = getFormattedDate(Number(this.x));
                        return sFullDay[nd.day]+', '+sMonth[Number(nd.m)-1]+' '+nd.d+', '+nd.y + '<br/>'+this.series.name+': <b>'+this.y+'%</b>';
                    }
                },
                legend: {
                    enabled: false
                },
                title: {
                    text: ''
                },
               
                plotOptions: {
                    series: {
                            connectNulls:true,
                            fillOpacity: 0.4,
                            lineWidth: 1,
                            marker: {
                                enabled: false,
                            states: {
                                    hover: {
                                        enabled: false
                                }
                            }
                        },
                        pointStart: trend.starttime * 1000,
                        pointInterval: trend.interval * 1000
                    }
                },
                series: [{
                    type: 'areaspline',
                    name: countryName,
                    data: trend.datapoints,
                    color: lineColor
                }]
            });
        }
    })
}

function createCountriesSection(){
    jq.ajax({
        url : baseUrl+'country.json',
        method : 'GET',
        success : function(countryData){
            if((jq('#map').width() / 2) < 400){
                var height = 400;
            }else{
                var height = jq('#map').width() / 2;
            }

            createMap(highMap, 'map', countryData, height);
            createTable(countryData,'countries', tableCountriesData);
        }
    })
}

function createNetworksSection(){
    jq.ajax({
        url : baseUrl+'network.json',
        method : 'GET',
        success : function(response){
            createTable(response,'networks',tableNetworksData);
        }
    })
}

function init(){
    Highcharts.setOptions({
        chart: {
            style: {
                fontFamily: 'Ubuntu'
            }
        }
    });
    createCountriesSection();
    createNetworksSection();
}

function getTopoUrl() {
    var jvFileName, flag;
    jvFileName = "/datamap/map/geojson/world-";
    var countryCodes = ['IN', 'CN', 'PK'];
    if (typeof window.AKAMAI !== 'undefined' && typeof window.AKAMAI.UTILS !== 'undefined') {
        var index, code;
        //code = 'IN';
        code = window.AKAMAI.UTILS.geo.country;
        index = jQuery.inArray(code, countryCodes);
        if (index > -1) {
            flag = true;
            var res = code.toLowerCase();
            jvFileName += res + ".json";

        }
    }
    if (!flag) jvFileName += "en.json";
    return jvFileName;
}

var worldMapURL = getTopoUrl();

function setActiveTab(id){
    jq('.navigation li a[data-tab="'+id+'"]').parent().addClass('active').prev().removeClass('active');
    if(id == '#networks'){
        jq('#countries-content').removeClass('active');
        jq(id+'-content').addClass('active');
    }else{
        jq('#networks-content').removeClass('active');
        jq(id+'-content').addClass('active');
    }
    window.location.hash = id.substr(1);
}

function initIPv6(){
    var hash = window.location.hash;
    if(hash){
        setActiveTab(hash);
    }
    var ajaxURL = getTopoUrl();

    jq.ajax({
        url: ajaxURL,
        method: 'GET',
        dataType : 'json',
        success: function(response){
            highMap = response;
            init();
        }
    })

    jq(document).on('click', '.map-toggle', function(){
        if(jq(this).hasClass('map-expanded')){
            jq(this).removeClass('map-expanded').addClass('map-hidden');
            jq(this).find('span').attr('data-icon', 'chevron-right');
            jq('#map').slideUp('fast');
        }else{
            jq(this).removeClass('map-hidden').addClass('map-expanded');
            jq(this).find('span').attr('data-icon', 'chevron-down');
            jq('#map').slideDown('fast');
            window.dispatchEvent(new Event('resize'));
        }
    });

    jq(document).on('click', 'ul.navigation > li > a', function(){
        var tabName = jq(this).attr('data-tab');
        jq('ul.navigation > li').removeClass('active');
        jq(this).parent().addClass('active');
        jq('.section-content .section-pane').removeClass('active');
        jq('.section-content .section-pane'+tabName).addClass('active');
    })

    jq(document).on('click', 'table tr td.data-row', function(e){
        e.stopImmediatePropagation();
    });

    jq(document).on('click','.navigation li a',function(e){
        setActiveTab(jq(this).data('tab'));
        e.preventDefault();
    });

    jq(document).on('click', 'table.table-countries tbody tr', function(){
        var countryName = jq(this).find('td.country').text();
        jq('table.table-countries tr').removeClass('trChart');
        jq('table.table-countries td.data-row').empty().hide();
        if(jq(this).hasClass('expand-chart')){
            jq('table.table-countries tr').removeClass('collapse-chart').addClass('expand-chart').find('span').attr('data-icon', 'chevron-right');
            jq(this).addClass('trChart').find('td.data-row').show();
            jq(this).removeClass('expand-chart').addClass('collapse-chart');
            jq(this).find('span').attr('data-icon', 'chevron-down');
            var filename = (jq(this).attr('data-country')).toLowerCase()+'.json';
            //var url = 'data-US.json';
            createChart(jq(this).addClass('trChart').find('td.data-row'), filename, '#ff9933', countryName, 'chart-country');
        }else{
            jq(this).removeClass('collapse-chart').addClass('expand-chart').find('span').attr('data-icon', 'chevron-right');
        }
    });

    jq(document).on('click', 'table.table-networks tbody tr', function(){
        var countryName = jq(this).find('td.network').text();
        jq('table.table-networks tr').removeClass('trChart');
        jq('table.table-networks td.data-row').empty().hide();
        if(jq(this).hasClass('expand-chart')){
            jq('table.table-networks tr').removeClass('collapse-chart').addClass('expand-chart').find('span').attr('data-icon', 'chevron-right');
            jq(this).addClass('trChart').find('td.data-row').show();
            jq(this).removeClass('expand-chart').addClass('collapse-chart');
            jq(this).find('span').attr('data-icon', 'chevron-down');
            var filename = (jq(this).attr('data-country')).toLowerCase()+'.json';
            //var url = 'data-US.json';
            createChart(jq(this).addClass('trChart').find('td.data-row'), filename, '#0099cc', countryName, 'chart-network');
        }else{
            jq(this).removeClass('collapse-chart').addClass('expand-chart').find('span').attr('data-icon', 'chevron-right');
        }
    });
}

jq(document).ready(function(){
    initIPv6();
});

function roundDecimals(num, noOfPrecisions){
    var precision = Math.pow(10,noOfPrecisions);
    return Math.round(num * precision) / precision;
}
