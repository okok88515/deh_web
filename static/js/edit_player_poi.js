finalFiles = [];

temp_flag = false; //代表使用者有刪除原本圖片，true代表先做暫存
temp_media_id = 0; //media的id暫存
temp_media_name = ""; //media的name暫存
temp_media_format = ""; //media的format暫存

// Create a Platform object:
var platform = new H.service.Platform({
    'apikey': 'KltNt3WCaOrzMwVN4GmggfYufT5-vA3E7Xx3Ocq2ASg'
});

// Get an object containing the default map layers:
var defaultLayers = platform.createDefaultLayers({lg:'cht'});

// Instantiate the map using the vecor map with the
// default style as the base layer:
var map = new H.Map(
    document.getElementById('map_poi'),
    defaultLayers.raster.normal.map, {
        zoom: 8,
        center: { lat: 23.5, lng: 121.120850 },
        pixelRatio: window.devicePixelRatio || 1
    });

// Enable the event system on the map instance:
var mapEvents = new H.mapevents.MapEvents(map);


// Instantiate the default behavior, providing the mapEvents object: 
var behavior = new H.mapevents.Behavior(mapEvents);

// Create the default UI:
var ui = H.ui.UI.createDefault(map, defaultLayers, 'zh-CN')

placeMarker({lat:$('#latitude').val(), lng:$('#longitude').val()});

// Add event listener:
map.addEventListener('tap', function(evt) {
    var coord = map.screenToGeo(evt.currentPointer.viewportX,evt.currentPointer.viewportY);
    document.getElementById("latitude").value = coord.lat;
    document.getElementById("longitude").value = coord.lng;
    //$('#latitude').val(coord.lat);
    //$('#longitude').val(coord.lng);
    var service = platform.getSearchService();
    
    service.reverseGeocode({
        at: coord.lat+','+coord.lng
        }, (result) => {
        result.items.forEach((item) => {
            document.getElementById("poi_address").value = item.address.label;
            placeMarker(item.position);
            /*ui.addBubble(new H.ui.InfoBubble(item.position, {
            content: item.address.label
            }));*/
        });
    },alert);
});




$(document).ready(function() {
    temp_media_format = chk;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        console.log('Great success! All the File APIs are supported.')
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
    
    if(image_count == 1)temp_flag = true;

    $('#draft').click(function() {

        if(image_count > 0 || ($('input[type=radio][name=media]')[0].value != 'none')){

            poi_form(true);
        }
      else{
        $('.alert-danger').empty();
        $('.alert-danger').show();
        $('.alert-danger').append('<p>至少需要一個多媒體檔案或是語音導覽!</p>');
        return false;
      }
    });


    $('#clear').click(function() {
        $('input[type=radio][name=media]').value == 'none';
        var upload_none = $('.upload_none').empty();
        var upload_image = $('.upload_image').empty();
        var upload_video = $('.upload_video').empty();
        var upload_audio = $('.upload_audio').empty();
        var upload_none = $('.upload_nothing').empty();
        var upload_audio = $('.upload_sound').empty();
    });

    $('.alert-danger').hide();

    if (chk == 1){
      $('#image_file').change(function(evt){
        if(image_count < 5){
          handleFileSelect(evt);
        }
        else{
          alert('圖片檔只能上傳五張,如要繼續上傳請先刪除就圖片');
          $('#image_file').val('');
        }
      });
    }
    else if (chk == 2){
      $('#audio_file').change(function(evt) {
        handleAudio(evt);
      });
    }
    else if (chk == 4){
      $('#video_file').change(function(evt) {
          handleVideo(evt);
      });
    }
    $('#sound_file').change(function(evt) {
        console.log($('.edit_sound').attr("id"))
        if($('.edit_sound').attr("id")){
            alert("語音導覽只能上傳一個");
            $('#sound_file').val('');
        }else{
            handleSound(evt);
        }
    });

    if(chk == '' && chk_sound == ''){
      $('.upload_none').empty();
      image_count = 0;
      sound_count = 0;
    }
    

    $('#make_poiform').submit(function(e){
      e.preventDefault();
      if(image_count > 0 || ($('input[type=radio][name=media]')[0].value != 'none') || $('.sound_file')){
        url = '/session/' + "POIDraft"+"/"+"false"
        $.ajax({
            url: url,
            type: "GET",
            
            success: function () {
                poi_form(false);
            },
            error: function () {
                alert("error")
            }
        });
           
        }
      else{
        $('.alert-danger').empty();
        $('.alert-danger').show();
        $('.alert-danger').append('<p>至少需要一個多媒體檔案或是語音導覽!</p>');
        return false;
      }
    });


    var el = document.getElementById('sound_file');
    if (el) {
        el.addEventListener('change', handleSound, false);
    }
    $('#sound_file').change(function () {
        
        $('.alert-danger').hide();
      
        if (this.value == 'sound') {
            sound_count = 0;
            if (document.getElementById('language').value == "chinese") {
                restrict1.html('允許上傳amr/3gpp/aac格式的錄音檔，檔案大小不能超過5M');
            } else if (document.getElementById('language').value == "english") {
                restrict1.html("Audio format of amr/3gpp/aac is allowed to upload, and the file shouldn't be over 5 M(It is allowed to upload5audio files.)");
            } else if (document.getElementById('language').value == "japanese") {
                restrict1.html('アップロードするamr/3gpp/aac形式の音声ファイルの、最大ファイル容量は5MBまでです(アップロード可能数5つのファイル)');
            }
            upload_sound.append('<input class="sound_val" name="sounds" value="8" hidden>');
            upload_sound.append('<input type="file" name="sound_file" accept=".amr,.3gpp,.aac,.mp3" id="sound_file">');
            upload_sound.append('<audio controls id="disp_sound"></audio>');
            var el = document.getElementById('sound_file');
            if (el) {
                el.addEventListener('change', handleSound, false);
            }
        } else if (this.value == 'none') {
            $('.upload_nothing').empty();
            if (document.getElementById('language').value == "chinese") {
                restrict1.html('無語音導覽檔案');
            } else if (document.getElementById('language').value == "english") {
                restrict1.html("No voice navigation file.");
            } else if (document.getElementById('language').value == "japanese") {
                restrict1.html('音声ナビゲーションファイルがありません');
            }
            sound_count = 0;
            upload_nothing.append('<input class="sound_val" name="sounds" value="0" hidden>');
        }
    });
    if($('#poi_source').val() && $('#poi_source_check')){
        document.getElementById('poi_source_check').checked = true;
        document.getElementById('poi_source').style.display="inline";
    }
    if($('#creator').val() && $('#creator_check')){
        document.getElementById('creator_check').checked = true;
        document.getElementById('creator').style.display="inline";
    }
    if($('#publisher').val() && $('#publisher_check')){
        document.getElementById('publisher_check').checked = true;
        document.getElementById('publisher').style.display="inline";
    }

    $('input[type=checkbox][name=option_check]').change(function () {
        if(document.getElementById('poi_source_check').checked == true) {
            document.getElementById('poi_source').style.display="inline";
        }else{
            document.getElementById('poi_source').style.display="none";
        }
        if(document.getElementById('creator_check').checked == true) {
            document.getElementById('creator').style.display="inline";
        }else{
            document.getElementById('creator').style.display="none";
        }
        if(document.getElementById('publisher_check').checked == true) {
            document.getElementById('publisher').style.display="inline";
        }else{
            document.getElementById('publisher').style.display="none";
        }
    });

    $('input[type=radio][name=media]').change(function () {
        var restrict = $('#restrict').empty();
        $('.alert-danger').hide();
        var upload_none = $('.upload_none').empty();
        var upload_image = $('.upload_image').empty();
        var upload_video = $('.upload_video').empty();
        var upload_audio = $('.upload_audio').empty();

        if (this.value == 'image') {
			temp_media_format = "1"
            if (document.getElementById('language').value == "chinese") {
                restrict.html('允許上傳jpg/png/格式的圖片，圖片檔案大小不能超過2M(可上傳5張照片)');
            } else if (document.getElementById('language').value == "english") {
                restrict.html("Image format of jpg/png is allowed to upload, and the capacity over 2 MB will be compressed.(It is allowed to upload5images)");
            } else if (document.getElementById('language').value == "japanese") {
                restrict.html('アップロードするgif/jpg/png形式のフォトの、最大ファイル容量は2MBまでです(アップロード可能枚数5枚のフォト)');
            }
            upload_image.append('<input class="media_val" name="media" value="1" hidden>');
            upload_image.append('<input type="file" name="image_file" accept=".gif,.jpg,.png,.jpeg" id="image_file" multiple>');
            upload_image.append('<output id="image_list">');
            var el = document.getElementById('image_file');
            if (el) {
                el.addEventListener('change', handleFileSelect, false);
            }
        } else if (this.value == 'video') {
			temp_media_format = "4"
            if (document.getElementById('language').value == "chinese") {
                restrict.html('允許上傳mp4/ogg/webm 格式的影片，影片檔案大小不能超過15M');
            } else if (document.getElementById('language').value == "english") {
                restrict.html("Video format of mp4/ogg/webm is allowed to upload, and the capacity shouldn't be over 15 MB.(It is allowed to upload5videos)");
            } else if (document.getElementById('language').value == "japanese") {
                restrict.html('アップロードするmp4/avi形式の動画ファイルの、最大ファイル容量は15MBまでです(アップロード可能数5つのファイル)');
            }
            upload_video.append('<input class="media_val" name="media" value="4" hidden>');
            upload_video.append('<input type="file" name="video_file" accept=".mp4,.ogg,.webm" id="video_file">');
            upload_video.append('<video controls id="disp_video" style="width: 100%; height: auto;"></video>');
            var el = document.getElementById('video_file');
            if (el) {
                el.addEventListener('change', handleVideo, false);
            }
        } else if (this.value == 'audio') {
			temp_media_format = "2"
            if (document.getElementById('language').value == "chinese") {
                restrict.html('允許上傳wav/mp3/ogg格式的錄音檔，檔案大小不能超過5M');
            } else if (document.getElementById('language').value == "english") {
                restrict.html("Audio format of wav/mp3/ogg is allowed to upload, and the file shouldn't be over 5 M(It is allowed to upload5audio files.)");
            } else if (document.getElementById('language').value == "japanese") {
                restrict.html('アップロードするamr/3gpp/aac形式の音声ファイルの、最大ファイル容量は5MBまでです(アップロード可能数5つのファイル)');
            }
            upload_audio.append('<input class="media_val" name="media" value="2" hidden>');
            upload_audio.append('<input type="file" name="audio_file" accept=".wav,.ogg,.mp3" id="audio_file">');
            upload_audio.append('<audio controls id="disp_audio"></audio>');
            var el = document.getElementById('audio_file');
            if (el) {
                el.addEventListener('change', handleAudio, false);
            }
        }
    });

});
function handleFileSelect(evt) {
    $('.alert-danger').hide();
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser.');
        return;
    }
    var files = evt.target.files; // FileList object
    $.each(files, function(idx, elm) {
        finalFiles[idx] = elm;
    });
    // Loop through the FileList and render image files as thumbnails.

    console.log(image_count)
    for (var i = 0, f; f = files[i]; i++) {
        // Only process image files.
        var re = /\.(jpg|png|jpeg)$/i;  //允許的影片副檔名 
        if(!re.test(f.name)){
            evt.target.value = "";
            alert("error type");
            return false;
        }
        if (!f.type.match('image.*')) {
            continue;
        }
        if (image_count  < 5) { //5張限制
            var reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                return function(e) {
                    // Render thumbnail.
                    limit_size = theFile.size / 1048576;
                    var image = new Image();

                    //create new image and coupute the ratio to compress
                    var ratio = 1 / Math.pow(limit_size, 0.5);
                    var canvas = document.createElement("canvas");
                    var datatype = e.target.result.split(',')[0].split(':')[1].split(';')[0];

                    //when image load complete , use canvas to resize image
                    image.onload = function() {
                        var ctx = canvas.getContext("2d");
                        EXIF.getData(image , function(){
                          var orientation = EXIF.getTag(image , 'Orientation');
                          switch (orientation) {
                            case 6:
                              canvas.width = image.height;
                              canvas.height = image.width;
                              if(limit_size > 2){
                                canvas.width = canvas.width * ratio;
                                canvas.height = canvas.height * ratio;
                              }
                              var x = canvas.width / 2;
                              var y = canvas.height / 2;
                              ctx.rotate(90 * Math.PI / 180);
                              ctx.translate(0 , -x * 2)
                              break;
                            default:
                              if(limit_size > 2){
                                canvas.width = image.width * ratio;
                                canvas.height = image.height * ratio;
                              }
                              else{
                                canvas.width = image.width;
                                canvas.height = image.height;
                              }
                          }
                        });
                        if(limit_size > 2){
                          ctx.scale(ratio, ratio);
                        }
                        ctx.drawImage(image, 0, 0);
                        NewImageInsert(canvas.toDataURL(datatype) , 205 * canvas.height / canvas.width);
                  };
                  image.src = e.target.result;
                    //create the new span contains image in output
                    function NewImageInsert(dataURL , height){
                        var span = document.createElement('span');
                        span.className = "imgspan";
                        span.innerHTML = ['<img id="thumb' + theFile.name + '" name="thumb" style="height: ' + height +'px;width: 205px; margin: 10px 5px 0 0;" src="', dataURL,
                            '" title="', escape(theFile.name), '"/> \
                      <button type="button" style="display: block;width: 205px;background: #4bafa9; color: white; text-align:center; \
                      cursor: pointer;" id="remove' + theFile.name + '" onclick="rmvImg(this,\'thumb' + theFile.name + '\')">刪除圖片</button>'
                        ].join('');
                        document.getElementById('image_list').insertBefore(span, null);
                      $(".media_val").val('1');
                    }
                };
            })(f);
            // Read in the image file as a data URL.
            reader.readAsDataURL(f);
            image_count++;
        } else {
            alert('請上傳5張以內');
            break;
        }
    }
    //Clear the input files number display.
    //$('#image_file').val('');
}

function handleVideo(evt) {
    reader = new FileReader();
    files = evt.target.files;
    file = files[0];

    var re = /\.(avi|ogg|webm|mp4)$/i;  //允許的影片副檔名 
    if(!re.test(file.name)){
        evt.target.value = "";
        alert("error type");
        return false;
    }

    reader.onload = function(evt) {
        $('#disp_video').attr("src", evt.target.result);
    }
    reader.readAsDataURL(file);
    $(".media_val").val('4');
}

function handleAudio(evt) {
    reader = new FileReader();
    files = evt.target.files;
    file = files[0];

    var re = /\.(wav|mp3|ogg)$/i;  //允許的圖片副檔名 
    if(!re.test(file.name)){
        evt.target.value = "";
        alert("error type");
        return false;
    }

    reader.onload = function(evt) {
        $('#disp_audio').attr("src", evt.target.result);
    }
    reader.readAsDataURL(file);
    $(".media_val").val('2');
}

function handleSound(evt) {
    reader = new FileReader();
    files = evt.target.files;
    file = files[0];

    if(!file){
        return
    }
    var re = /\.(wav|mp3|ogg)$/i;  //允許的圖片副檔名 
    if(!re.test(file.name)){
        evt.target.value = "";
        alert("error type");
        return false;
    }

    reader.onload = function(evt) {
        $('#disp_sound').attr("src", evt.target.result);
    }
    reader.readAsDataURL(file);
    sound_count++;
    $(".sound_val").val('8');
}


function rmvImg(element,name) {
    $(element).parent().remove();
    image_count--;
}

function placeMarker(location) {
    map.removeObjects(map.getObjects());
    var marker = new H.map.Marker(location);
    map.addObject(marker);
    map.setCenter(location);
    map.setZoom(16);
}



function poi_form(isDraft) {
    var urls = POI_URL;
    var city_chk = $('#city option:selected').text();
    var my_areas = $('#areas').val();
    var poi_id = $('#poi_id').val();
    var subject = "體驗的";
    var type1 = "人文景觀";
    var period = $('#period').val();
    var year = $('#year').val();
    var keyword1 = $('#keyword1').val();
    var keyword2 = $('#keyword2').val();
    var keyword3 = $('#keyword3').val();
    var keyword4 = $('#keyword4').val();
    var poi_address = $('#poi_address').val();
    var latitude = $('#latitude').val();
    var longitude = $('#longitude').val();
    var poi_description_1 = $('#poi_description_1').val();
    var format = $('#format').val();
    var open = $('#open').val();
    var rights = $('#rights').val();
    var creator = $('#creator').val();
    var publisher = $('#publisher').val();
    var contributor = $('#contributor').val();
    var poi_source = $('#poi_source').val();
    var poi_added_time = $('#poi_added_time').val();
    var poi_title = $('#poi_title').val();
    var identifier = $('#identifier').val();
    var language = $('#langeage').text();
    var media_val = $('.media_val').val();
    var sound_val = $('.sound_val').val();
    var languages = $('#language').val();
    var data = {
        my_areas: my_areas,
        poi_id: poi_id,
        subject: subject,
        type1: type1,
        period: period,
        year: year,
        rights: rights,
        keyword1: keyword1,
        keyword2: keyword2,
        keyword3: keyword3,
        keyword4: keyword4,
        poi_address: poi_address,
        latitude: latitude,
        longitude: longitude,
        poi_description_1: poi_description_1,
        format: format,
        open: open,
        creator: creator,
        publisher: publisher,
        contributor: contributor,
        poi_source: poi_source,
        poi_added_time: poi_added_time,
        poi_title: poi_title,
        identifier: identifier,
        language: language,
        media_val: media_val,
        sound_val: sound_val,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        media: chk,
		push_media_type : temp_media_format,   
        isDraft:isDraft,
        ids : poi_id
    }


    if (poi_title == "") {
        $('.alert-danger').empty();
        $('.alert-danger').show();
        if (languages == "chinese") {
            $('.alert-danger').append("<p>標題尚未填寫</p>");
        } else if (languages == "english") {
            $('.alert-danger').append("<p>Title not yet filled in</p>");
        } else if (languages == "japanese") {
            $('.alert-danger').append("<p>まだ記入されていないタイトル</p>");
        }
        document.getElementById("poi_title").style.border = "solid 1px #F00 ";
   
    } else if (my_areas == null ){
        $('.alert-danger').empty();
        $('.alert-danger').show();
        if (languages == "chinese") {
            $('.alert-danger').append("<p>地區尚未選擇</p>");
        } else if (languages == "english") {
            $('.alert-danger').append("<p>The areas has not been selected yet</p>");
        } else if (languages == "japanese") {
            $('.alert-danger').append("<p>エリアはまだ選択されていません</p>");
        }
        document.getElementById("areas").style.border = "solid 1px #F00 ";
        document.getElementById("city").style.border = "solid 1px #F00 ";
   
    } else if (period == null){
        $('.alert-danger').empty();
        $('.alert-danger').show();
        if (languages == "chinese") {
            $('.alert-danger').append("<p>時期尚未選擇</p>");
        } else if (languages == "english") {
            $('.alert-danger').append("<p>The period has not been selected yet</p>");
        } else if (languages == "japanese") {
            $('.alert-danger').append("<p>期間はまだ選択されていません</p>");
        }
        document.getElementById("year").style.border = "solid 1px #F00 ";
        document.getElementById("period").style.border = "solid 1px #F00 ";
    } else if (keyword1 == ""){
        $('.alert-danger').empty();
        $('.alert-danger').show();
        if (languages == "chinese") {
            $('.alert-danger').append("<p>關鍵字至少填一組</p>");
        } else if (languages == "english") {
            $('.alert-danger').append("<p>Keywords at least fill in one group</p>");
        } else if (languages == "japanese") {
            $('.alert-danger').append("<p>少なくとも1つのグループにキーワードを入力する</p>");
        }
        document.getElementById("keyword1").style.border = "solid 1px #F00 ";
    } else if (format == null) {
        $('.alert-danger').empty();
        $('.alert-danger').show();
        if (languages == "chinese") {
            $('.alert-danger').append("<p>範疇尚未選擇</p>");
        } else if (languages == "english") {
            $('.alert-danger').append("<p>The format has not been selected yet</p>");
        } else if (languages == "japanese") {
            $('.alert-danger').append("<p>カテゴリはまだ選択されていません</p>");
        }
        document.getElementById("format").style.border = "solid 1px #F00 ";
    } else if (poi_address == ""){
        $('.alert-danger').empty();
        $('.alert-danger').show();
        if (languages == "chinese") {
            $('.alert-danger').append("<p>地址尚未填寫</p>");
        } else if (languages == "english") {
            $('.alert-danger').append("<p>Address not yet filled in</p>");
        } else if (languages == "japanese") {
            $('.alert-danger').append("<p>アドレスはまだ入力されていません</p>");
        }
        document.getElementById("poi_address").style.border = "solid 1px #F00 ";
    } else if (latitude == "" || longitude == ""){
        $('.alert-danger').empty();
        $('.alert-danger').show();
        if (languages == "chinese") {
            $('.alert-danger').append("<p>經緯度尚未填寫</p>");
        } else if (languages == "english") {
            $('.alert-danger').append("<p>Latitude and longitude not yet filled in</p>");
        } else if (languages == "japanese") {
            $('.alert-danger').append("<p>緯度と経度はまだ記入されていません</p>");
        }
        document.getElementById("latitude").style.border = "solid 1px #F00 ";
        document.getElementById("longitude").style.border = "solid 1px #F00 ";
    } else if (poi_description_1 == ""){
        $('.alert-danger').empty();
        $('.alert-danger').show();
        if (languages == "chinese") {
            $('.alert-danger').append("<p>描述尚未填寫</p>");
        } else if (languages == "english") {
            $('.alert-danger').append("<p>Description not yet filled in</p>");
        } else if (languages == "japanese") {
            $('.alert-danger').append("<p>説明はまだ記入されていません</p>");
        }
        document.getElementById("poi_description_1").style.border = "solid 1px #F00 ";
    } else if (contributor == ""){
        $('.alert-danger').empty();
        $('.alert-danger').show();
        if (languages == "chinese") {
            $('.alert-danger').append("<p>貢獻者尚未填寫</p>");
        } else if (languages == "english") {
            $('.alert-danger').append("<p>Contributor not yet filled in</p>");
        } else if (languages == "japanese") {
            $('.alert-danger').append("<p>貢献者はまだ記入されていません</p>");
        }
        document.getElementById("contributor").style.border = "solid 1px #F00 ";
    
    } else {
        $('#loading').show();
        var chk_area = $('#areas option:selected').text();
        if (CheckStrIn(city_chk, chk_area, poi_address))  {
            
            data.media = 0;

            var runMpeg = false;
            var runSound = false;
            if($('#image_file').val()&&$('#image_file').val() != ''){
                data.media = 1;
            }else if($('#audio_file').val()&&$('#audio_file').val() != ''){
                data.media = 2;
            }else if($('#video_file').val()&&$('#video_file').val() != ''){
                data.media = 4;
            }


            if(data.media!=0){
                runMpeg = true;
            } 

            if(($('#sound_file').val()&&$('#sound_file').val()!='')||$('#sound_file').val()){
                runSound = true;
            }
             
            poi_mpeg_sound(data).then(()=>{
                poi_mpeg(data.media,Number(data.ids),runMpeg).then(()=>{
                    data.sounds = 8;
                    poi_sound(8,Number(data.ids),runSound).then(()=>{
                        $('.alert-success').show();
                        $('.alert-success').append('<p>景點編輯成功!</p>');
                        coi = document.location.pathname.split('/')[1]
                        url = ""
                        if(coi=="edit_player"){
                            url = "/poi_drafts"
                        }else{
                            url = "/"+coi+"/draft"
                        }
                        if( document.getElementById('fromDraft')!=null&&document.getElementById('fromDraft').innerHTML=="true"){
                            window.location = url;
                        }else{
                            window.location = HOME_URL;
                        }
                        $('#loading').hide();
                    });
                })
                
            })
           
        } else {
            $('.alert-danger').show();
            $('.alert-danger').append('<p>地區與地址請一致!</p>');
            $('#loading').hide();
        }
    }
}


function poi_mpeg_sound(data){

    return new Promise((resolve, reject) => {

        $.ajax({
            method: "POST",
            url: POI_URL,
            data: data,
            success: function(data) {
                $('.submit_poiform').prop('disabled', true);
                resolve("GOOD")
            },
            error: function(data) {
                console.log(data);
                reject(data)
            }
        });
      })
}
function poi_mpeg(format,ids,runMpeg) {
    return new Promise((resolve, reject) => {

        if(!runMpeg){
            resolve("不要偷跑")
            return
        }
        var urls = "/ajax_mpeg";

        format = parseInt(format);
        ids = parseInt(ids);
        var media_val = $('.media_val').val();
        var sound_val = $('.sound_val').val();
        var data = new FormData($('#make_poiform').get(0));

        data.append('foreignkey',ids);

        if(media_val == 1){
            $("img[name = thumb]").each(function(){

            var dataurl = $(this).attr("src");
            var byteString;
            if (dataurl.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataurl.split(',')[1]);
            else
                byteString = unescape(dataurl.split(',')[1]);

            // separate out the mime component
            var mimeString = dataurl.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            var blob = new Blob([ia] , {type : mimeString});
            data.append("image_file_modified" , blob , $(this).attr("id"));
            });
        }
       
        $('#loading').show();
        $.ajax({
            method: "POST",
            url: urls,
            data: data,
            processData: false,
            contentType: false,
            success: function(data) {
                $('#loading').hide();
                $('.alert-success').show();
                $('.alert-success').append('<p>多媒體修改成功!</p>');
                resolve(data)
            },
            error: function(data) {
                reject(data)
            },
        });
        })
  }


function poi_sound(format, ids,runSound) {
    return new Promise((resolve, reject) => {

        if(!runSound){
            resolve("還趕下來阿")
            return;
        }
        var urls = "/ajax_sound";
        format = parseInt(format);
        ids = parseInt(ids);
        var media_val = $('.media_val').val();
        var data = new FormData($('#make_poiform').get(0));
        data.append('foreignkey',ids);
        console.log(data)
        
        if(media_val == 8){
            $("img[name = thumb]").each(function(){
            var dataurl = $(this).attr("src");
            var byteString;
            if (dataurl.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataurl.split(',')[1]);
            else
                byteString = unescape(dataurl.split(',')[1]);

            // separate out the mime component
            var mimeString = dataurl.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            var blob = new Blob([ia] , {type : mimeString});
            data.append("image_file_modified" , blob , $(this).attr("id"));
            });
        }

        $('#loading').show();
        $.ajax({
            method: "POST",
            url: urls,
            data: data,
            processData: false,
            contentType: false,
            success: function(data) {
                $('#loading').hide();
                $('.alert-success').show();
                $('.alert-success').append('<p>語音導覽上傳成功!</p>');
                resolve(data)
            
            },
            error: function(data) {
                console.log(data);
                reject(error)
            },
        });
    })
  }


function delete_img(id, name, format) {
    var del = confirm("確定刪除?");
    var urls = "/delete_media";
    var rmv = $('#edit_' + id);
    var data = {
        picture_id: id,
        picture_name: name,
        format: format,
    }
    if (del == true) {
        $('#loading').show();
        $.ajax({
            method: "POST",
            url: urls,
            data: data,
            success: function(data) {
                if (data == 'success' && format != 8) {
                    $('.alert-success').show();
                    $('.alert-success').append('<p>多媒體刪除成功!</p>');
                    $('#loading').hide();
                    rmv.remove();
                    orig_count--;
                    image_count--;
                } else if (data == 'success' && format == 8) {
                    $('.alert-success').show();
                    $('.alert-success').append('<p>語音導覽刪除成功!</p>');
                    $('#loading').hide();
                    rmv.remove();
                    sound_count--;
                } else {
                    $('.alert-danger').show();
                    $('.alert-danger').append('<p>多媒體刪除失敗!</p>');
                }

            },
            error: function(data) {
                console.log(data);
            }
        });
    }
}

function CheckStrIn(city, area, address) {
    var languages = document.getElementById('lang').getAttribute("value");
    if(languages != 'chinese'&&languages!='中文'){
        return true;
    }
    if(languages=='中文'){
        languages = 'chinese' 
    }
    if (languages == 'chinese' || languages == 'japanese') {
        city = city.replace(/臺/g, "台");
        area = area.replace(/臺/g, "台");
        address = address.replace(/臺/g, "台");
    }else{
        city = city.toLowerCase();
        area = area.toLowerCase();
        address = address.toLowerCase();
    }
    if (city == "其他國家及地區" || city == "南海諸島") {
        if (area.length > address) {
            chk_city = 1;
            chk_area = area.indexOf(address);
        } else {
            chk_city = 1;
            chk_area = address.indexOf(area);
        }
    } else {
        if (city.length > address || area.length > address) {
            chk_city = city.indexOf(address);
            chk_area = area.indexOf(address);
        } else {
            chk_city = address.indexOf(city);
            chk_area = address.indexOf(area);
        }
    }
    if (chk_city != -1 && chk_area != -1) {
        return true;
    } else {
        return false;
    }
}

$('.selectPublic').on('click', event => {
    $('#open').val(event.target.value);
});

// address to longitude and latitude by hsieh
$('#trans_addr_but').on('click', function () {
    // 取得地址
    var poi_address = $('#poi_address').val();
    //alert(poi_address);
    var platform = new H.service.Platform({
        'apikey': 'KltNt3WCaOrzMwVN4GmggfYufT5-vA3E7Xx3Ocq2ASg'
      });
      
    // Get an instance of the geocoding service:
    var service = platform.getSearchService();

    service.geocode({
        q: ''+poi_address+''
      }, (result) => {
        // Add a marker for each location found
        result.items.forEach((item) => {
            $('#latitude').val(item.position.lat);
            $('#longitude').val(item.position.lng);
            placeMarker(item.position);
        });
      }, alert);
    

});