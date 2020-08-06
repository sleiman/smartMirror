
function getConfig(){
    $.ajax({
      url: 'php/getConfig.php',
      success: loadCurrentSettings,
      dataType: "text",
      method: "GET"
    });
}

function loadCurrentSettings(data){

    data = JSON.parse(data);
 
    
    window.config = data;
    
    $("#name").val(data.name);
    $("#city_name").val(data.city_name);
    $("#nyt_api_key").val(data.nyt_api_key);
    $("#openweather_api_key").val(data.openweather_api_key);

    $(data.subjects).each(function (i,v){ 
        $( "#"+v ).prop( "checked", true );
    });
    
}

function iterate(){
    //create config json object
    var config = {}
    config.name =  $("#name").val();
    config.city_name = $("#city_name").val();
    config.city_id = $("#city_select").val();
    config.nyt_api_key = $("#nyt_api_key").val();
    config.openweather_api_key = $("#openweather_api_key").val();
    config.subjects=[];

    if($('#none').prop('checked')){
        config.subjects.push("noNews");
    }
    else{
        $('.md-check').each(function(index){
        
        if($(this).prop('checked')){
            config.subjects.push($(this).prop('id'));
            }
        })  
    }
    
    if(config.name == "" || config.subjects.length<1){
        console.log("no subject");
        $('#checkWarning').modal('show');
    }
    else{
       var config = JSON.stringify(config);

       console.log(config);
     $.ajax({
          url: 'php/config.php',
          dataType: "text",
          data: { data: config },
          method: "POST"
        });
        $('#basic').modal('show');
    }
    
}

$(document).ready(function() {
    getConfig();
    $('#submitConfigs').click(function(){
        iterate();
        });

});
