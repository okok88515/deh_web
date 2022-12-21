is_edit = false;
const FORM_URL = '../ajax_groups';
const MEMBER_URL = '../ajax_groupmember';
const RELOCATE_URL = '/list_groups';
chosen = []
groupInfo = {}
function ChoosenGroup(gID) { 
    
    
    if (chosen.length>999) {
        alert('選太多群組囉!');
    } else {
        var can = true;
        for(var i = 0 ; i < chosen.length;i++){
            if(chosen[i]==gID){
                can = false;
                break;
            }
        }
        if(!can){
            alert('重複群組囉!');
            return;
        }
        chosen.push(gID)
        $('#items-list').append( 
            '<li id=group_id_'+gID+' onclick="removeGroup(' + gID+ ')">'+
            groupInfo[gID]["group_name"]+
            '  </li>'
        );
    }
}


function removeGroup(id) { //刪除特定POI
    var index = chosen.indexOf(id);
    chosen.splice(index, 1);

    $("#group_id_"+id).remove();
}
function dataAppend(data) {

    $('.poi_detail').empty();
    var media_counts = data.all_poi.length;
    //alert(media_counts);
    var none_counts = data.no_list.length;
    var open = $('#open').val();

    for (var i = 0; i < media_counts; i++) {
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
                div_poi_detail.append('<img src="../static/images/image.png">)');
                break;
            case 2:
                div_poi_detail.append('<img src="../static/images/sound.png">)');
                break;
            case 4:
                div_poi_detail.append('<img src="../static/images/video.png">)');
                break;
            default:
                div_poi_detail.append('<p style="display:inline;">無多媒體檔案)</p>');
        }
        if (data.all_poi[i].foreignkey__rights == username) {
            div_poi_detail.append('<img src="../static/images/user.png">');
        }
        if (open == 1 && data.all_poi[i].foreignkey__rights == username && data.all_poi[i].foreignkey__identifier != 'docent' && data.all_poi[i].foreignkey__open != 1) 
        {
            div_poi_detail.append
            // data-target="#loi_modal
            (
                '<button type="button" class="choose_loi" id="choose_loi' + data.all_poi[i].foreignkey__poi_id + '" \
                      style="margin-botton:0px; font-size:15px; color:#00F;" onclick="Choosen_loi(' + data.all_poi[i].foreignkey__poi_id + ')">' +
                data.all_poi[i].foreignkey__poi_title + '</button>\
                      <input type="hidden" id="poi' + data.all_poi[i].foreignkey__poi_id + '" value="' + data.all_poi[i].foreignkey__poi_id + '"/>\
                      <input type="hidden" name="poi' + data.all_poi[i].foreignkey__poi_id + '" value="' + data.all_poi[i].foreignkey__latitude + ',' + data.all_poi[i].foreignkey__longitude + '"/>\
                      <input type="hidden" id="open_or_not' + data.all_poi[i].foreignkey__poi_id + '" value="' + data.all_poi[i].foreignkey__open +'"/>\
                      <input type="hidden" id="valid_or_not' + data.all_poi[i].foreignkey__poi_id + '" value="' + data.all_poi[i].foreignkey__verification + '"/><br>'
            );
        }
        else {
            div_poi_detail.append(
                '<button type="button" class="choose_loi" id="choose_loi' + data.all_poi[i].foreignkey__poi_id + '" \
                      style="margin-botton:0px; font-size:15px; color:#00F;" onclick="Choosen_loi(' + data.all_poi[i].foreignkey__poi_id + ')">' +
                data.all_poi[i].foreignkey__poi_title + '</button>\
                      <input type="hidden" id="poi' + data.all_poi[i].foreignkey__poi_id + '" value="' + data.all_poi[i].foreignkey__poi_id + '"/>\
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
    poi_filter = true;
}

$(document).ready(function() {
    groupData = JSON.parse(groupData)
    if(groupData){
        for(var i = 0 ; i < groupData.length;i++){
            groupInfo[groupData[i].group_id] = groupData[i]
        }
    }

    $('#make_groupform').submit(function(e) {
        $('#loading').show();
        e.preventDefault();
        var group_name = $('#group_name').val();
        if (group_name == '') {
            alert('尚未命名群組名稱');
        } else {
            group_form(e);
        }
    });
});

function group_form(e) {
    var open = $('#open').val();
    var group_name = $('#group_name').val();
    var group_info = $('#group_info').val();
    var group_leader = $('#group_leader').val();
    var group_make = $('#group_make').val();
    var urls = FORM_URL;
    var data = {
        open: open,
        group_name: group_name,
        group_info: group_info,
        group_leader: group_leader,
        group_make: group_make,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
    }
    $('#loading').show();
    $.ajax({
        method: "POST",
        url: urls,
        data: data,
        success: function(data) {
            $('#loading').hide();
            if(data == 'repeat group name'){
                alert("repeat group name");
                return;
            }
            group_member(data.ids);
        },
        error: function(data) {
            alert("error");
            $('#loading').hide();
        },
    });
}

function group_member(ids) {
    var group_id = ids;
    var urls = MEMBER_URL;
    var data = {
        group_id: group_id,
    }
    $('#loading').show();
    $.ajax({
        method: "POST",
        data: data,
        url: urls,
        success: function(data) {
            var languages = $('#language').val();
            if(languages == "chinese"){
                alert('群組建立成功');
            }
            else if(languages == "english"){
                alert('Created successfully');
            }
            else if(languages == "japanese"){
                alert('グループは正常に作成されました');
            }
            $('#loading').hide();
            window.location = RELOCATE_URL;
        },
        error: function(data) {
            $('#loading').hide();
        }
    });
}