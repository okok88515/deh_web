soi_num = 0;
username = $('#soi_owner').val();
role = $('#identifier').val();

var map_markers = [];
var icon_url = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=';
var icon_type = {'poi':'|FE6256|000000','loi':'|58ABFE|000000','aoi':'|1AFD9C|000000'};
areas = "{{edit_aoi.area_name_en}}";
var area_list = []; //keep tracking of area user has choosen
languages = "{{language}}"

// Create a Platform object:
var platform = new H.service.Platform({
    'apikey': 'KltNt3WCaOrzMwVN4GmggfYufT5-vA3E7Xx3Ocq2ASg'
});

// Get an object containing the default map layers:
var defaultLayers = platform.createDefaultLayers({lg:'cht'});

// Instantiate the map using the vecor map with the
// default style as the base layer:
var map2 = new H.Map(
    document.getElementById('map_soi'),
    defaultLayers.raster.normal.map, {
        zoom: 7,
        center: { lat: 23.5, lng: 121.120850 }
    });

// Enable the event system on the map instance:
var mapEvents = new H.mapevents.MapEvents(map2);


// Instantiate the default behavior, providing the mapEvents object: 
var behavior = new H.mapevents.Behavior(mapEvents);

// Create the default UI:
var ui = H.ui.UI.createDefault(map2, defaultLayers, 'zh-CN')

initialMapMarker();

$(document).ready(function() {
    $('#make_soiform').submit(function(e) {
        $('#loading').show();
        e.preventDefault();
        soi_form(false);
    });

    $('#draft').click(function() {

        soi_form(true)
    });

    $('#filter_btn').click(event => { filterBtn(event) });
});


function Choosen_soi(type, i) {
    if (soi_num > 200) {
        alert('選太多景點囉!');
        return
    }  
    var can_choose = true;
    var elementsLI = $("#items-list li")

    elementsLI.each(function(index,item){
        var tmpID = item.id
        var tmpType = tmpID.substring(13, 16);
        tmpID = tmpID.substring(16, tmpID.length);
        if(type==tmpType&&i==tmpID){
            alert('重複景點囉!');
            can_choose = false;
            return
        }
    });

    if(!can_choose){
        return
    }
    area_list.push($('#areas').val());
    var temp_name="valid_or_not"+i;
    var valid_or_not = document.getElementById(temp_name).value;
    valid_or_not = ''+valid_or_not
    var str_valid_or_not="";
    switch(valid_or_not) {
        case'0':
            str_valid_or_not="尚未驗證";
            break;
        case'1':
            str_valid_or_not="已驗證通過";
            break;
        case'-1':
            str_valid_or_not="驗證不通過";
            break;
        default:
            console.log('怪怪的喔');
            str_valid_or_not="已驗證通過";
    }
    var temp_name="open_or_not"+i;
    var open_or_not = document.getElementById(temp_name).value;
    open_or_not = ''+open_or_not
    var  a = true
    var b = 1
    var str_open_or_not="";
    switch(open_or_not) {
        case'true':
            str_open_or_not="公開";
            break;
        case'false':
            str_open_or_not="不公開";
            break;
        case '1':
            str_open_or_not="公開";
            break;
        case '0':
            str_open_or_not="不公開";
            break;
        default:
            console.log('怪怪的喔');
            str_open_or_not="公開";
    }

    $('#items-list').append(
        '<li id="choosen_title' + type + i + '" class="test" style="list-style-image: none;margin: 10px;border: 1px solid #ccc;padding: 4px;border-radius: 4px;color: #666;cursor: move;user-select: none; -moz-user-select: none; -webkit-user-select: none; -ms-user-select: none;" onclick="removeXoi(' + i + ',`' + type + '`)"></li>'
    );
    $('#choosen_title'+ type + i).html($('#choose_' + type + i).text()+"("+str_valid_or_not+"/"+str_open_or_not+")"+"<input name=\"pid\" id=\"pid" + soi_num + "\" type=\"hidden\"  value=\"" + i + "\"/><input name=\"pid_type\" id=\"pid_type" + soi_num + "\" type=\"hidden\"  value=\"" + type + "\"/><p hidden name=\"choose_order\" class=\"choose_order\" id=\"choosen_id"+ type + i + "\">" + (soi_num + 1) + "</p><input type=\"hidden\" name=\"final_valid_or_not\"  value=\"" + valid_or_not + "\"><p hidden name=\"mylist_order\"  id=\"mylist_order"+type + i + "\">" + (soi_num + 1) + "</p>");
    var latlng = $('#latlng' + type + i).val().split(",");
    var location = {lat:Number(latlng[0]) , lng:Number(latlng[1])};
    addMapMarker(i , location , type,$('#choose_' + type + i).text());
    soi_num++;
    //Group the items(li) in list(ul)
    items = document.querySelectorAll('.test');
    items.forEach(item => {
        $(item).prop('draggable', true)
        item.addEventListener('dragstart', dragStart)
        item.addEventListener('drop', dropped)
        item.addEventListener('dragenter', cancelDefault)
        item.addEventListener('dragover', cancelDefault)
    })
    
}
function dragStart (e) {
  var index = $(e.target).index()
  e.dataTransfer.setData('text/plain', index)
}

function Refresh() {
    var del = confirm('確定重選?');
    if (del) {
        $('#soi_list').empty();
        soi_num = 0;
        area_list = [];
        clearMap();
    }
}
function dropped (e) {
  cancelDefault(e)
  
  // get new and old index
  let oldIndex = e.dataTransfer.getData('text/plain')
  let target = $(e.target)
  let newIndex = target.index()

  // console.log("oldIndex : "+oldIndex);
  // console.log("target : "+target);
  // console.log("newIndex : "+newIndex);


     
    //clearMap();
    if(oldIndex < newIndex){
        var temp = new Array();
        for(var i=0;i<soi_num;i++){
            temp[i]=map_markers[i];
        }
        for(var i=0;i<soi_num;i++){
            if(i<oldIndex)
                map_markers[i]=temp[i];
            else if(i>=oldIndex && i<newIndex)
                map_markers[i]=temp[i+1];
            else if(i==newIndex)
                map_markers[i]=temp[oldIndex];
            else
                map_markers[i]=temp[i];
        }
    }
    else{
        var temp = new Array();
        for(var i=0;i<soi_num;i++){
            temp[i]=map_markers[i];
        }
        for(var i=0;i<soi_num;i++){
            if(i<newIndex)
                map_markers[i]=temp[i];
            else if(i==newIndex)
                map_markers[i]=temp[oldIndex];
            else if(i>newIndex && i<=oldIndex)
                map_markers[i]=temp[i-1];
            else
                map_markers[i]=temp[i];
        }
    }

    // console.log("map_markers :");
    // console.log(map_markers);
    // console.log("temp :");
    // console.log(temp);
    //map_markers[newIndex] = temp[0];
    //console.log(map_markers);

    //rebuildMap();

  
  // remove dropped items at old place
  if (newIndex == oldIndex) //避免原地移動造成意外刪除
    return
  let dropped = $(this).parent().children().eq(oldIndex).remove()

  // insert the dropped items at new place
  if (newIndex < oldIndex) {
    target.before(dropped)
  } else {
    target.after(dropped)
  }
  var mylist_order_Arr = document.getElementsByName('mylist_order');
  for(var i=0; i<mylist_order_Arr.length; i++){
      mylist_order_Arr[i].innerHTML = i+1;
  }
}
function cancelDefault (e) {
  e.preventDefault()
  e.stopPropagation()
  return false
}

function clearMap(){
    map2.removeObjects(map2.getObjects());
}
function removeXoi(id, type) { //刪除特定XOI
    soi_num--;
    var mapCount = parseInt($('#mylist_order'+type + id).text());
    var curCount = parseInt($('#choosen_id' + type + id).text()); //目前位置編號
    curCount--;
    area_list.splice(curCount, 1); //remove 1 area according to the index user removed
    if(soi_num != 0){
      var curlist = $('#choosen_title' + type + id);
      var next_list = curlist.next();
      curlist.remove();
      for (var i = 0;i < (soi_num - curCount);i++){
        var next_value = next_list.attr('value')
        $('#choosen_id' + next_value).text(curCount + i + 1);
        $('#' + next_value[0] + 'id' + (curCount + i + 1)).attr('id' , next_value[0] + 'id' + (curCount + i));
        next_list = next_list.next();
      }
    }
    else{
      $('#choosen_title' + type + id).remove();
      area_list = [];
    }

    var mylist_order_Arr = document.getElementsByName('mylist_order');
    for(var i=0; i<mylist_order_Arr.length; i++){
        mylist_order_Arr[i].innerHTML = i+1;
    }
    removeMapMarker(id); 
}
// function myMap() {
//     var mapCanvas2 = document.getElementById("map_soi");
//     var mapOptions2 = {
//         center: new google.maps.LatLng(23.5, 121),
//         zoom: 7
//     }
//     map2 = new google.maps.Map(mapCanvas2, mapOptions2);
//     GetXoi();
// }

function addMapMarker(index , location, poiName){
    var marker = new H.map.Marker(location);
    map2.addObject(marker);
    map2.setCenter(location);
    if(map2.getZoom() < 12){
        map2.setZoom(12);
    }
    map_markers[index] = marker;
    //console.log(index);
}

function initialMapMarker() {
    items = document.querySelectorAll('.test');
            items.forEach(item => {
              $(item).prop('draggable', true)
              item.addEventListener('dragstart', dragStart)
              item.addEventListener('drop', dropped)
              item.addEventListener('dragenter', cancelDefault)
              item.addEventListener('dragover', cancelDefault)
            })
    for(var i = 0; i < soi_num; i++){
        var id = $('#pid' + i).val();
        // alert(i);
        var latlng = $('#latlng' + i).val().split(",");
        var location = { lat: Number(latlng[0]), lng: Number(latlng[1]) };
        var type = latlng[2];
        // alert(type);
        var icon = icon_url + String(i + 1) + icon_type[type];
        var li_id_str = "choosen_title"+type+id;
        // alert(li_id_str);
        var li_id = document.getElementById(li_id_str);
        var li_str = li_id.textContent;
        // alert(li_str);
        var label_str = li_str.slice(0,-500);
        // alert(label_str);
        // map_markers[i + 1] = new google.maps.Marker({
        //   position: location,
        //   label: label_str ,
        //   icon: icon,
        //   map: map2
        // });
        var marker = new H.map.Marker(location);
        map2.addObject(marker);
        map_markers[id] = marker;
      }
}

function removeMapMarker(index){
    map2.removeObject(map_markers[index]);
}
function soi_form(isDraft) {
    var final_valid_or_not_Arr = document.getElementsByName('final_valid_or_not');
    var open = $('.selectPublic').val();
    var valid_flag=true;
    for(var i=0;i<soi_num;i++){
        if(final_valid_or_not_Arr[i].value == "0" || final_valid_or_not_Arr[i].value == "-1"){
            valid_flag=false;
            break;
        }
    }
    // alert("valid_flag : "+valid_flag);
    if(valid_flag==false && open==1){
        alert("選擇內容含有 私有/尚未驗證/驗證不通過 之選項，請改為不公開!");
        $('#loading').hide();
        return;
    }        
    alert("成功通過");
    var my_areas = area_list[0];
    // var open = $('#open').val();
    if(my_areas == null){
        // alert("is null");
        my_areas="TainanEast";
    }
    var soi_id = $('#soi_id').val();
    var soi_user_name = $('#soi_owner').val();
    var soi_description = $('#soi_description').val();
    var soi_title = $('#soi_title').val();
    var identifier = $('#identifier').val();
    var contributor = $('#contributor').val();
    // var soi_make = $('#s_make').val();
    var urls = SOI_URL;
    var data = {
        my_areas: my_areas,
        soi_id: soi_id,
        open: open,
        soi_user_name: soi_user_name,
        soi_description: soi_description,
        soi_title: soi_title,
        identifier: identifier,
        contributor: contributor,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        isDraft:isDraft
    }

    $.ajax({
        method: "POST",
        url: urls,
        data: data,
        success: function(data) {
            soi_table(data.ids);
        },
        error: function(data) {
            $('#loading').hide();
            console.log(data);
        }

    });
}

function soi_table(ids) {
    if (soi_num == 0) {
        alert('尚未選擇 poi/loi/aoi!!');
    } else {
        var urls = "/edit_soistory";
        var xoi_id = [];
        var soi_id = ids;


        var elementsLI = $("#items-list li")

        elementsLI.each(function(index,item){
            var id = item.id
            var type = id.substring(13, 16);
            id = id.substring(16, id.length);
            if(type=="poi"||type=="loi"||type=="aoi"){
                xoi_id[index] = { "id":  id, "type": type };
            }else {
                console.log("Type error!",item.id);
            }
        });
     
         
        // for (var i = 0; i < soi_num; i++) {
        //     if ($('#pid' + i).length != 0) {
        //         xoi_id[i] = { "id": $('#pid' + i).val(), "type": 'poi' };
        //     } else if ($('#lid' + i).length != 0) {
        //         xoi_id[i] = { "id": $('#lid' + i).val(), "type": 'loi' };
        //     } else if ($('#aid' + i).length != 0) {
        //         xoi_id[i] = { "id": $('#aid' + i).val(), "type": 'aoi' };
        //     } else {
        //         console.log("Type error!");
        //     }
        // }
        
        var data = {
            count: soi_num,
            soi_id: soi_id,
            xoi_id: xoi_id
        }
        $.ajax({
            method: "POST",
            data: data,
            url: urls,
            success: function(data) {

                coi = document.location.pathname.split('/')[1]
                url = ""
                if(coi=="edit_player"){
                    url = "/soi_drafts"
                }else{
                    url = "/"+coi+"/draft"
                }
                if( document.getElementById('fromDraft')!=null&&document.getElementById('fromDraft').innerHTML=="true"){
                    window.location = url;
                }else{
                    window.location = HOME_URL;
                }

 
            },
            error: function(data) {
                $('#loading').hide();
                console.log(data);
            }
        });
    }
}
$('#city').change(function() {
    var city = $(this).val();
    var urls = "/feed_area";
    var data = {
        city: city
    }
    $.ajax({
        method: "POST",
        data: data,
        url: urls,
        success: function(data) {
            var area_count = data.area.length;
            var area_select = $('#areas').empty();
            var languages = $('#language').val();
            area_select.append('<option selected disabled hidden>請選擇</option>');
            area_select.append('<option value="All">全部</option>');
            for (var i = 0; i < area_count; i++) {
                if (languages == 'chinese' || languages == 'japanese') {
                    area_select.append(
                        $('<option></option>').val(data.area[i].area_name_en).html(data.area[i].area_name_ch)
                    );
                } else {
                    area_select.append(
                        $('<option></option>').val(data.area[i].area_name_en).html(data.area[i].area_name_en)
                    );
                }
            }
        },
        error: function(data) {
            console.log('data error');
        }
    });
});

$('#areas').change(function () { //地區分類篩選
    var areas = $(this).val();
    var citys = $('#city').val();
    var myOwn = $('#myOwn').val();
    var group = $('#MyselfGroup').val();

    if (citys == '') {
        event.preventDefault();
        alert("請先選擇地區");
    }
    var urls = XOI_URL;
    var data = {
        citys: citys,
        areas: areas,
        myOwn: myOwn,
        group: group,
    }
    $('#loading').show();
    $.ajax({
        method: "POST",
        data: data,
        url: urls,
        success: function (data) {
            $('#loading').hide();
            dataAppend(data);
        },
        error: function (data) {
            $('#loading').hide();
            console.log(data);
        }
    });
});

$('#myOwn').change(function () { //地區分類篩選
    var areas = $('#areas').val();
    var citys = $('#city').val();
    var myOwn = $('#myOwn').val();
    var group = $('#MyselfGroup').val();

    if (citys == '') {
        event.preventDefault();
        alert("請先選擇地區");
    }
    
    var urls = XOI_URL;
    var data = {
        citys: citys,
        areas: areas,
        myOwn: myOwn,
        group: group,
    }
    $('#loading').show();
    $.ajax({
        method: "POST",
        data: data,
        url: urls,
        success: function (data) {
            dataAppend(data);
            $('#loading').hide();
        },
        error: function (data) {
            console.log(data);
            $('#loading').hide();
        }
    });
});

$('#MyselfGroup').change(function () { //地區分類篩選
    var areas = $('#areas').val();
    var citys = $('#city').val();
    var myOwn = $('#myOwn').val();
    var group = $('#MyselfGroup').val();

    if (citys == '') {
        event.preventDefault();
        alert("請先選擇地區");
    }
    var urls = XOI_URL;
    var data = {
        citys: citys,
        areas: areas,
        myOwn: myOwn,
        group: group,
    }
    $('#loading').show();
    $.ajax({
        method: "POST",
        data: data,
        url: urls,
        success: function (data) {
            dataAppend(data);
            $('#loading').hide();
        },
        error: function (data) {
            console.log(data);
            $('#loading').hide();
        }
    });
});

function filterBtn(event) {
    event.preventDefault();

    let areas = $('#areas').val();
    let citys = $('#city').val();
    let key = $('#filter_key').val();

    let data = {
        citys: citys,
        areas: areas,
        key: key
    };

    if (areas != null && citys != null) {
        $('#loading').show();
        $.ajax({
            method: "POST",
            data: data,
            url: XOI_URL,

            success: data => {
                $('#loading').hide();
                dataAppend(data);
            },

            error: data => {
                $('#loading').hide();
                console.log(data);
            }
        });
    }
}
  
function dataAppend(data) {
    $('.poi_detail').empty();
    $('.loi_detail').empty();
    $('.aoi_detail').empty();
    var p_counts = data.all_poi.length;
    var np_counts = data.no_list.length;
    var l_counts = data.all_loi.length;
    var a_counts = data.all_aoi.length;
    var open = $('.selectPublic').val();

    for (var i = 0; i < p_counts; i++) {
        var div_poi_detail = $('<div>').attr('name', 'poi_detail_array');
        switch (data.all_poi[i].foreignkey__identifier) {
            case 'user':
                div_poi_detail.append('<p style="display:inline;">(玩家,</p>');
                break;
            case 'docent':
                div_poi_detail.append('<p style="display:inline;">(導覽員,</p>');
                break;
            case 'expert':
                div_poi_detail.append('<p style="display:inline;">(專家,</p>');
                break;
            default:
                div_poi_detail.append('<p style="display:inline;">(未定,</p>');
        }
        switch (data.all_poi[i].format) {
            case 1:
                div_poi_detail.append('<img src="../../static/images/image.png">)');
                break;
            case 2:
                div_poi_detail.append('<img src="../../static/images/sound.png">)');
                break;
            case 4:
                div_poi_detail.append('<img src="../../static/images/video.png">)');
                break;
            default:
                div_poi_detail.append('<p style="display:inline;">無多媒體檔案)</p>');
        }
        if (data.all_poi[i].foreignkey__rights == username) {
            div_poi_detail.append('<img src="../../static/images/user.png">');
        }
        if (open == 1 && data.all_poi[i].foreignkey__rights == username && data.all_poi[i].foreignkey__identifier != 'docent' && data.all_poi[i].foreignkey__open != 1) {
            div_poi_detail.append(
                '<button type="button" class="choose_soi" id="choose_poi' + data.all_poi[i].foreignkey__poi_id + '" \
                      style="margin-botton:0px; font-size:15px; color:#00F;" onclick="Choosen_soi(\'poi\',' + data.all_poi[i].foreignkey__poi_id + ')">' +
                data.all_poi[i].foreignkey__poi_title + '</button>\
                      <input id="latlngpoi' + data.all_poi[i].foreignkey__poi_id + '"type="hidden" value="' + data.all_poi[i].foreignkey__latitude  + ',' + data.all_poi[i].foreignkey__longitude + '">\
                      <input type="hidden" name="poi' + data.all_poi[i].foreignkey__poi_id + '" value="' + data.all_poi[i].foreignkey__latitude + ',' + data.all_poi[i].foreignkey__longitude + '"/>\
                      <input type="hidden" id="open_or_not' + data.all_poi[i].foreignkey__poi_id + '" value="' + data.all_poi[i].foreignkey__open +'"/>\
                      <input type="hidden" id="valid_or_not' + data.all_poi[i].foreignkey__poi_id + '" value="' + data.all_poi[i].foreignkey__verification + '"/><br>'
            );
        }
        else {
            div_poi_detail.append(
                '<button type="button" class="choose_soi" id="choose_poi' + data.all_poi[i].foreignkey__poi_id + '" \
                      style="margin-botton:0px; font-size:15px; color:#00F;" onclick="Choosen_soi(\'poi\',' + data.all_poi[i].foreignkey__poi_id + ')">' +
                data.all_poi[i].foreignkey__poi_title + '</button>\
                      <input id="latlngpoi' + data.all_poi[i].foreignkey__poi_id + '"type="hidden" value="' + data.all_poi[i].foreignkey__latitude + ',' + data.all_poi[i].foreignkey__longitude + '">\
                      <input type="hidden" name="poi' + data.all_poi[i].foreignkey__poi_id + '" value="' + data.all_poi[i].foreignkey__latitude + ',' + data.all_poi[i].foreignkey__longitude + '"/>\
                      <input type="hidden" id="open_or_not' + data.all_poi[i].foreignkey__poi_id + '" value="' + data.all_poi[i].foreignkey__open +'"/>\
                      <input type="hidden" id="valid_or_not' + data.all_poi[i].foreignkey__poi_id + '" value="' + data.all_poi[i].foreignkey__verification + '"/><br>'
            );
        }
        if (data.all_poi[i].foreignkey__rights == username) {
            $('.poi_detail').prepend(div_poi_detail);
        }
        else {
            $('.poi_detail').append(div_poi_detail);
        }
    }
    for (var i = 0; i < np_counts; i++) {
        var div_poi_detail = $('<div>').attr('name', 'poi_detail_array');
        switch (data.no_list[i].identifier) {
            case 'user':
                div_poi_detail.append('<p style="display:inline;">(玩家,</p>');
                break;
            case 'docent':
                div_poi_detail.append('<p style="display:inline;">(導覽員,</p>');
                break;
            case 'expert':
                div_poi_detail.append('<p style="display:inline;">(專家,</p>');
                break;
            default:
                div_poi_detail.append('<p style="display:inline;">(未定,</p>');
        }
        div_poi_detail.append('<p style="display:inline;">無多媒體檔案)</p>');
        if (data.no_list[i].rights == username) {
            div_poi_detail.append('<img src="../../static/images/user.png">');
        }
        if (open == 1 && data.no_list[i].rights == username && data.no_list[i].identifier != 'docent' && data.no_list[i].foreignkey__open != 1) {
            div_poi_detail.append(
                '<button type="button" class="choose_soi" id="choose_poi' + data.no_list[i].poi_id + '" \
                      style="margin-botton:0px; font-size:15px; color:#00F;" onclick="Choosen_soi(\'poi\',' + data.no_list[i].poi_id + ')">' +
                data.no_list[i].poi_title + '</button>\
                      <input id="latlngpoi' + data.no_list[i].poi_id + '"type="hidden" value="' + data.no_list[i].latitude + ',' + data.no_list[i].longitude + '">\
                      <input type="hidden" name="poi' + data.no_list[i].poi_id + '" value="' + data.no_list[i].latitude + ',' + data.no_list[i].longitude + '"/>\
                      <input type="hidden" id="open_or_not' + data.no_list[i].poi_id + '" value="' + data.no_list[i].open +'"/>\
                      <input type="hidden" id="valid_or_not' + data.no_list[i].poi_id + '" value="' + data.no_list[i].verification + '"/><br>'
            );
        }
        else {
            div_poi_detail.append(
                '<button type="button" class="choose_soi" id="choose_poi' + data.no_list[i].poi_id + '" \
                      style="margin-botton:0px; font-size:15px; color:#00F;" onclick="Choosen_soi(\'poi\',' + data.no_list[i].poi_id + ')">' +
                data.no_list[i].poi_title + '</button>\
                      <input id="latlngpoi' + data.no_list[i].poi_id + '"type="hidden" value="' + data.no_list[i].poi_id__latitude + ',' + data.no_list[i].poi_id__longitude + '">\
                      <input type="hidden" name="poi' + data.no_list[i].poi_id + '" value="' + data.no_list[i].latitude + ',' + data.no_list[i].longitude + '"/>\
                      <input type="hidden" id="open_or_not' + data.no_list[i].poi_id + '" value="' + data.no_list[i].open +'"/>\
                      <input type="hidden" id="valid_or_not' + data.no_list[i].poi_id + '" value="' + data.no_list[i].verification + '"/><br>'
            );
        }
        if (data.no_list[i].rights == username) {
            $('.poi_detail').prepend(div_poi_detail);
        }
        else {
            $('.poi_detail').append(div_poi_detail);
        }
    }
    for (var i = 0; i < l_counts; i++) {
        var div_poi_detail = $('<div>').attr('name', 'poi_detail_array');
        switch (data.all_loi[i].identifier) {
            case 'user':
                div_poi_detail.append('<p style="display:inline;">(玩家)</p>');
                break;
            case 'docent':
                div_poi_detail.append('<p style="display:inline;">(導覽員)</p>');
                break;
            case 'expert':
                div_poi_detail.append('<p style="display:inline;">(專家)</p>');
                break;
            default:
                div_poi_detail.append('<p style="display:inline;">(未定)</p>');
        }
        if (data.all_loi[i].route_owner == username) {
            div_poi_detail.append('<img src="../../static/images/user.png">');
        }
        if (open == 1 && data.all_loi[i].route_owner == username && data.all_loi[i].identifier != 'docent' && data.all_loi[i].open != 1) {
            div_poi_detail.append(
                '<button type="button" class="choose_soi" id="choose_loi' + data.all_loi[i].route_id + '" \
                      style="margin-botton:0px; font-size:15px; color:#00F;" onclick="Choosen_soi(\'loi\',' + data.all_loi[i].route_id + ')">' +
                data.all_loi[i].route_title + '</button>\
                      <input id="latlngloi' + data.all_loi[i].route_id + '"type="hidden" value="' + data.all_loi_poi[i].poi_id__latitude + ',' + data.all_loi_poi[i].poi_id__longitude + '">\
                      <input type="hidden" id="open_or_not' + data.all_loi[i].route_id + '" value="' + data.all_loi[i].open +'"/>\
                      <input type="hidden" id="valid_or_not' + data.all_loi[i].route_id + '" value="' + data.all_loi[i].verification + '"/><br>'
            );
        }
        else {
            if (data.all_loi_poi[i].poi_id__longitude == null) {
                data.all_loi_poi[i].poi_id__longitude = 0;
                data.all_loi_poi[i].poi_id__latitude = 0;
            }
            div_poi_detail.append(
                '<button type="button" class="choose_soi" id="choose_loi' + data.all_loi[i].route_id + '" \
                      style="margin-botton:0px; font-size:15px; color:#00F;" onclick="Choosen_soi(\'loi\',' + data.all_loi[i].route_id + ')">' +
                data.all_loi[i].route_title + '</button>\
                      <input id="latlngloi' + data.all_loi[i].route_id + '"type="hidden" value="' + data.all_loi_poi[i].poi_id__latitude + ',' + data.all_loi_poi[i].poi_id__longitude + '">\
                      <input type="hidden" id="open_or_not' + data.all_loi[i].route_id + '" value="' + data.all_loi[i].open +'"/>\
                      <input type="hidden" id="valid_or_not' + data.all_loi[i].route_id + '" value="' + data.all_loi[i].verification + '"/><br>'
            );
        }
        if (data.all_loi[i].route_owner == username) {
            $('.loi_detail').prepend(div_poi_detail);
        }
        else {
            $('.loi_detail').append(div_poi_detail);
        }
    }
    for (var i = 0; i < a_counts; i++) {
        var div_poi_detail = $('<div>').attr('name', 'poi_detail_array');
        switch (data.all_aoi[i].identifier) {
            case 'user':
                div_poi_detail.append('<p style="display:inline;">(玩家)</p>');
                break;
            case 'docent':
                div_poi_detail.append('<p style="display:inline;">(導覽員)</p>');
                break;
            case 'expert':
                div_poi_detail.append('<p style="display:inline;">(專家)</p>');
                break;
            default:
                div_poi_detail.append('<p style="display:inline;">(未定)</p>');
        }
        if (data.all_aoi[i].owner == username) {
            div_poi_detail.append('<img src="../../static/images/user.png">');
        }
        if (open == 1 && data.all_aoi[i].owner == username && data.all_aoi[i].identifier != 'docent' && data.all_aoi[i].open != 1) {
            div_poi_detail.append(
                '<button type="button" class="choose_soi" id="choose_aoi' + data.all_aoi[i].aoi_id + '" \
                      style="margin-botton:0px; font-size:15px; color:#00F;" onclick="Choosen_soi(\'aoi\',' + data.all_aoi[i].aoi_id + ')">' +
                data.all_aoi[i].title + '</button>\
                      <input id="latlngaoi' + data.all_aoi[i].aoi_id + '"type="hidden" value="' + data.all_aoi_poi[i].poi_id__latitude + ',' + data.all_aoi_poi[i].poi_id__longitude + '">\
                      <input type="hidden" id="open_or_not' + data.all_aoi[i].aoi_id + '" value="' + data.all_aoi[i].open +'"/>\
                      <input type="hidden" id="valid_or_not' + data.all_aoi[i].aoi_id + '" value="' + data.all_aoi[i].verification + '"/><br>'
            );
        }
        else {
            if (data.all_aoi_poi[i].poi_id__longitude == null) {
                data.all_aoi_poi[i].poi_id__longitude = 0;
                data.all_aoi_poi[i].poi_id__latitude = 0;
            }
            div_poi_detail.append(
                '<button type="button" class="choose_soi" id="choose_aoi' + data.all_aoi[i].aoi_id + '" \
                      style="margin-botton:0px; font-size:15px; color:#00F;" onclick="Choosen_soi(\'aoi\',' + data.all_aoi[i].aoi_id + ')">' +
                data.all_aoi[i].title + '</button>\
                      <input id="latlngaoi' + data.all_aoi[i].aoi_id + '" type="hidden" value="' + data.all_aoi_poi[i].poi_id__latitude + ',' + data.all_aoi_poi[i].poi_id__longitude + '">\
                      <input type="hidden" id="open_or_not' + data.all_aoi[i].aoi_id + '" value="' + data.all_aoi[i].open +'"/>\
                      <input type="hidden" id="valid_or_not' + data.all_aoi[i].aoi_id + '" value="' + data.all_aoi[i].verification + '"/><br>'
            );
        }
        if (data.all_aoi[i].owner == username) {
            $('.aoi_detail').prepend(div_poi_detail);
        }
        else {
            $('.aoi_detail').append(div_poi_detail);
        }
    }
    poi_filter = true;
}

$('.selectPublic').on('click', event => {
    $('#open').val(event.target.value);
});